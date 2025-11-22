window.util = window.util || {};

// Main wrapper element with data attributes
util.wrapper = document.querySelector('[data-pagination-wrapper]');

// Containers for list and pagination
util.listContainer = util.wrapper.querySelector('[data-pagination-list]');
util.paginationContainer = util.wrapper.querySelector('.pagination-wrapper');

// Category filter links
util.categoryLinks = document.querySelectorAll('[data-category-link]');

util.paginationConfig = util.parseDataJSON(util.wrapper, 'pagination');

/**
 * Normalize API response to unified article format
 * @param {Array} results - Raw API response array
 * @returns {Array} normalized items
 */
util.normalizeApiResults = function (results = []) {
    return results.map(r => ({
        hs_path: r.path || r.slug,
        name: r.values?.name || r.name || 'Untitled',
        description: r.values?.description || util.truncateHTML(r.postSummary, 90, '') || '',
        image: r.values?.image || r.featuredImage || null,
        category: Array.isArray(r.values?.category) ? r.values.category : [],
        tags: Array.isArray(r.tagNames) ? r.tagNames : []
    }));
}

/**
 * Show/hide loading overlay
 */
util.toggleLoader = function (show = true) {
    if (!util.paginationConfig.loader) return;
    let loader = document.querySelector('.loader-overlay');
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.classList.add('loader-overlay');
            loader.innerHTML = `<div class="loader-spinner"></div>`;
            util.wrapper.appendChild(loader);
        }
        loader.style.display = 'flex';
    } else if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Finalize Render (scroll to top etc.)
 */
util.finalizeRender = async function () {
    if (!util.paginationConfig.scrollTop) return;
    await util.delay(100);
    util.scrollToElement(util.listContainer, { offset: 80 });
}

/**
 * Update active state on category links
 */
util.updateActiveCategory = function (currentCategory) {
    util.categoryLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.category === currentCategory);
    });
}

/**
 * Enable swipe gestures to trigger pagination clicks (mobile only)
 */
util.initSwipePagination = function (animate = false) {
    if (!('ontouchstart' in window)) return; // Only for touch devices

    let startX = 0;
    let diff = 0;
    const swipeThreshold = 70; // px
    const animDuration = 200; // ms

    // Helper: remove all animation classes
    const resetAnimationClasses = () => {
        util.listContainer.classList.remove(
            'fade-out',
            'fade-in',
            'is-swiping'
        );
    };

    util.listContainer.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        resetAnimationClasses();
        util.listContainer.classList.add('is-swiping');
    });

    util.listContainer.addEventListener('touchmove', e => {
        const currentX = e.touches[0].clientX;
        diff = currentX - startX;
    });

    util.listContainer.addEventListener('touchend', async () => {
        util.listContainer.classList.remove('is-swiping');

        if (Math.abs(diff) < swipeThreshold) {
            diff = 0;
            return;
        }

        const active = util.paginationContainer?.querySelector('.pagination-link.active');
        if (!active) return;

        const activeItem = active.closest('li');
        const direction = diff < 0 ? 'left' : 'right';
        const targetLink = direction === 'left'
            ? activeItem.nextElementSibling?.querySelector?.('.pagination-link')
            : activeItem.previousElementSibling?.querySelector?.('.pagination-link');

        if (!targetLink) {
            diff = 0;
            return;
        }

        // Step 1: Fade out current container
        if (animate) {
            resetAnimationClasses();
            util.listContainer.classList.add('fade-out');
            // Wait for fade-out to finish
            await util.delay(animDuration * 0.8);
        }

        // Step 2: Trigger page load
        targetLink.click();

        // Step 3: Wait for content loaded
        const handleLoaded = () => {
            document.removeEventListener('list:loaded', handleLoaded);

            // Fade in new content
            resetAnimationClasses();
            util.listContainer.classList.add('fade-in');

            setTimeout(() => {
                resetAnimationClasses(); // Cleanup
            }, animDuration);
        };

        if (animate) {
            document.addEventListener('list:loaded', handleLoaded);
        }

        diff = 0;
    });
};



