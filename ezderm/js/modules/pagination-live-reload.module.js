/**
 * Pagination Live Reload Module
 * Fetches articles from HubDB, renders with pagination, category filtering, and caching.
 * Uses sessionStorage for fast navigation (back/forward, category switching).
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!util.wrapper || util.wrapper.dataset.liveReload === 'false') return;

    const isBlog = util.wrapper.dataset.paginationWrapper === 'blog';
    const isSlider = util.wrapper.dataset.mode === 'slider';

    // API URL for HubDB table or Hubspot API
    const apiUrl = isBlog ? CONST.API_URL_BLOG : util.getTableApiUrl(util.wrapper.dataset.tableId);
    const sortParam = util.wrapper.dataset.sort || '-publish_date';
    // Items per page
    const perPage = +util.paginationConfig.perPage;

    // Cache configuration
    const cacheConfig = util.parseDataJSON(util.wrapper, 'cache');
    const CACHE_PREFIX = 'ez-cache';
    const cacheBuster = CACHE_PREFIX + '-' + (cacheConfig.buster || 'v1');
    const useCache = cacheConfig.enabled;
    const cacheTtl = +(cacheConfig.ttl || 300);

    // Current state from URL
    let currentCategory = new URLSearchParams(window.location.search).get('category') || 'all';
    let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;

    let CATEGORY_ID = 'all'; // Selected category ID for API filtering
    let fetchUrl;

    console.log('Display mode:', util.wrapper.dataset.mode);

    /**
     * Render articles from data array
     * @param {Array} items - Array of article objects
     */
    function renderArticles(items = []) {
        const template = document.getElementById('article-template');
        if (!template || !util.listContainer) {
            console.warn('Template or list container not found.');
            return;
        }

        util.listContainer.innerHTML = '';

        if (!Array.isArray(items) || !items.length) {
            util.listContainer.innerHTML = '<div class="article__empty">No items found.</div>';
            return;
        }

        items.forEach(a => {
            try {
                // Skip if this article already rendered
                if (util.listContainer.querySelector(`[data-id="${a.hs_path}"]`)) return;

                const clone = template.content.cloneNode(true);
                const item = clone.querySelector('.article__item');
                item.dataset.id = a.hs_path;

                // Extract category names safely
                const cats = Array.isArray(a.category)
                    ? a.category.map(c => (c && c.name ? c.name : '')).filter(Boolean)
                    : [];

                const tagsNames = Array.isArray(a.tags)
                    ? a.tags.filter(Boolean)
                    : [];

                const tagSlugs = (a.tags ?? []).map(tag =>
                    tag.toLowerCase().trim().replace(/\s+/g, '-')
                );

                item.dataset.category = cats.join(' ') || tagSlugs.join(' ');

                // Set article link
                const link = clone.querySelector('.link');
                if (a.hs_path && link) {
                    link.href = isBlog ? `${a.hs_path}` : `${location.pathname}/${a.hs_path}`;
                } else if (link) {
                    const parent = link.parentNode;
                    while (link.firstChild) parent.insertBefore(link.firstChild, link);
                    link.remove();
                }

                // Handle image with lazy loading
                const img = clone.querySelector('.image img');
                const imgUrl = a.image?.url || a.image || '';
                const altText = a.name || 'Article image';

                if (imgUrl && img) {
                    // Only set src if different to avoid unnecessary network request
                    if (img.src !== imgUrl) {
                        img.src = imgUrl;
                    }
                    img.alt = altText;
                    img.loading = 'lazy';
                    img.removeAttribute('srcset');
                    img.removeAttribute('sizes');
                }

                // Set title
                const titleEl = clone.querySelector('.title');
                if (titleEl) titleEl.textContent = a.name || 'Untitled';

                // Set description
                const descriptionEl = clone.querySelector('.description');
                if (descriptionEl) descriptionEl.textContent = a.description || '';

                // Set category labels
                const labelContainer = clone.querySelector('.label-list');
                if (labelContainer) {
                    labelContainer.innerHTML = ''; // Clear previous content

                    // Determine which labels to use (categories > tags > fallback)
                    const labels = cats.length > 0 ? cats : tagsNames.length > 0 ? tagsNames : ['Uncategorized'];

                    // Render all labels
                    labels.forEach(label => {
                        const labelItem = document.createElement('div');
                        labelItem.className = 'label-item';
                        labelItem.textContent = label;
                        labelContainer.appendChild(labelItem);
                    });
                }

                util.listContainer.appendChild(clone);
            } catch (err) {
                console.error('Error rendering article:', err, a);
            }
        });
    }

    function updateUI(data, totalItems) {
        renderArticles(data);
        util.updateActiveCategory(currentCategory);

        const totalPages = Math.ceil(totalItems / perPage);
        util.renderPagination(currentPage, totalPages, util.paginationContainer);

        document.querySelectorAll('.pagination-link').forEach(l =>
            l.classList.toggle('active', +l.dataset.page === currentPage)
        );
    }

    // Clear expired cache entries on load
    util.clearExpiredCache(CACHE_PREFIX, cacheTtl);

    function renderApiUrl() {
        const offset = (currentPage - 1) * perPage;
        if (isBlog) {
            fetchUrl = currentCategory !== 'all'
                ? `${apiUrl}?state__eq=PUBLISHED&tagId__eq=${encodeURIComponent(CATEGORY_ID)}&orderBy=${sortParam}`
                : `${apiUrl}?limit=${perPage}&offset=${offset}&orderBy=${sortParam}`;
        } else {
            fetchUrl = currentCategory !== 'all'
                ? `${apiUrl}&category__contains=${encodeURIComponent(CATEGORY_ID)}`
                : `${apiUrl}&limit=${perPage}&offset=${offset}`;
        }
    }

    /**
     * Fetch and render data based on current state
     * @param {Object} params - URL parameters to update (category, page)
     */
    async function fetchData(params = {}) {
        util.toggleLoader(true);
        // Update URL search params
        const search = new URLSearchParams(window.location.search);
        Object.entries(params).forEach(([k, v]) => {
            if (v && v !== 'all') search.set(k, v);
            else search.delete(k);
        });
        if (!search.has('category')) search.set('category', 'all');
        if (!search.has('page')) search.set('page', '1');

        currentCategory = search.get('category') || 'all';
        currentPage = parseInt(search.get('page')) || 1;

        const cacheKey = `${cacheBuster}_cat_${currentCategory}_page_${currentPage}`;
        const cached = util.readCache(cacheKey);

        // Serve from cache if valid and enabled
        if (cached && (Date.now() - cached.ts < cacheTtl * 1000) && useCache) {
            await util.delay(300);
            updateUI(cached.data, cached.total ?? cached.data.length);
            await util.finalizeRender();
            window.history.pushState({}, '', `${location.pathname}?${search}`);
            document.dispatchEvent(new CustomEvent('list:loaded'));
            util.toggleLoader(false);
            return;
        }

        // === API ===
        try {
            renderApiUrl();
            const res = await fetch(fetchUrl);
            const { results = [], total = 0 } = await res.json();

            // Normalize API response
            const data = util.normalizeApiResults(results);

            const totalItems = total || data.length;

            // Render results
            updateUI(data, totalItems);
            window.history.pushState({}, '', `${location.pathname}?${search}`);

            // Cache result if enabled
            if (useCache) {
                util.writeCache(cacheKey, { data, total: totalItems });
            }

            await util.finalizeRender();
            document.dispatchEvent(new CustomEvent('list:loaded'));
        } catch (err) {
            console.error('API error:', err);
        } finally {
            util.toggleLoader(false);
        }
    }

    // Pagination click handler
    util.wrapper.addEventListener('click', async e => {
        const link = e.target.closest('.pagination-link');
        if (!link || link.tagName === 'SPAN') return;
        e.preventDefault();
        await fetchData(
            { page: link.dataset.page, ...(currentCategory !== 'all' ? { category: currentCategory } : {}) }
        );
    });

    // Category filter click handler
    util.categoryLinks.forEach(link => {
        link.addEventListener('click', async e => {
            e.preventDefault();
            CATEGORY_ID = link.dataset.categoryId;
            await fetchData({ category: link.dataset.category, page: 1 });
        });
    });

    // Initial active category highlight
    util.updateActiveCategory(currentCategory);

    // Enable swipe-based pagination on mobile
    if (isSlider) {
        util.initSwipePagination();
    }
});