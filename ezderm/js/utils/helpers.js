window.util = window.util || {};

util.getTableApiUrl = (tableId) => `${CONST.API_URL_TABLES}${tableId}/rows?portalId=${CONST.PORTAL_ID}`;

/**
 * Delay
 */
util.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Throttle helper
 */
util.throttle = function (fn, wait) {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= wait) {
            lastTime = now;
            fn.apply(this, args);
        }
    }
};

/**
 * Scroll direction helper
 */
util.getScrollDirection = function(wait = 50) {
    let lastScrollY = window.scrollY;
    let lastTime = 0;

    return function() {
        const now = Date.now();
        if (now - lastTime >= wait) {
            lastTime = now;
            const currentScrollY = window.scrollY;
            const direction = currentScrollY > lastScrollY ? 'down' : 'up';
            lastScrollY = currentScrollY;
            return direction;
        }
        return lastScrollY === currentScrollY ? null : lastScrollY > currentScrollY ? 'up' : 'down';
    };
};

/**
 * Slugify direction helper
 */
util.slugify = function (str) {
    if (!str) return 'all';
    return str
        .replace('&', 'and')
        .replace(/%20/g, ' ')
        .replace(/\+/g, ' ')
        .replace(/%2F/g, '/')
        .replace(/%3F/g, '?')
        .replace(/%23/g, '#')
        .toLowerCase()
        .replace(/ /g, '_');
}

/**
 * Cache helpers
 */
util.readCache = key => {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed.ts || !parsed.data) return null;
        return parsed;
    } catch { return null; }
};

util.writeCache = (key, data) => {
    try {
        sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), ...data }));
    } catch (e) {
        console.warn('Cache write failed', e);
    }
};

util.isCacheFresh = (entry, ttl) => entry && (Date.now() - entry.ts < ttl * 1000);

util.clearExpiredCache = (cacheBuster, cacheTtl, maxEntries = 30) => {
    const keys = Object.keys(sessionStorage)
        .filter(k => k.startsWith(cacheBuster))
        .map(k => ({ key: k, ts: JSON.parse(sessionStorage.getItem(k) || '{}')?.ts || 0 }))
        .sort((a, b) => b.ts - a.ts);

    keys.slice(maxEntries).forEach(({ key }) => sessionStorage.removeItem(key));

    keys.forEach(({ key, ts }) => {
        if (Date.now() - ts > cacheTtl * 1000) {
            sessionStorage.removeItem(key);
        }
    });
};

/**
 * Render pagination
 */
util.renderPagination = function(currentPage, totalPages, container) {
    if (!container) return;

    let html = '';

    if (totalPages > 1) {
        if (currentPage > 1)
            html += `<li class="pagination-link--button is-prev"><a class="pagination-link" data-page="${currentPage - 1}">Prev</a></li>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<li><a class="pagination-link${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</a></li>`;
        }
        if (currentPage < totalPages)
            html += `<li class="pagination-link--button is-next"><a class="pagination-link" data-page="${currentPage + 1}">Next</a></li>`;
    }

    container.innerHTML = `
    <nav role="navigation" aria-label="pagination navigation" class="pagination">
      <ul>${html}</ul>
    </nav>`;
}

/**
 * Detect Scrollable Container
 */
util.getScrollableContainer = function (el) {
    let node = el.parentElement;
    while (node && node !== document.body) {
        const overflowY = window.getComputedStyle(node).overflowY;
        const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
        if (isScrollable && node.scrollHeight > node.clientHeight) {
            return node;
        }
        node = node.parentElement;
    }
    return null;
};


/**
 * Scroll To Element
 */
util.scrollToElement = function (el, options = {}) {
    if (!el) return;

    const {
        offset = 0,
        container = util.getScrollableContainer(el),
        behavior = 'smooth'
    } = options;

    const elRect = el.getBoundingClientRect();
    const containerRect = container?.getBoundingClientRect();

    const isVisible = container
        ? elRect.top >= containerRect.top && elRect.top <= containerRect.bottom
        : elRect.top >= 0 && elRect.top <= window.innerHeight;

    if (isVisible) {
        return;
    }

    if (container) {
        const targetTop = el.offsetTop - offset;
        container.scrollTo({ top: targetTop, behavior });
    } else {
        const targetTop = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetTop, behavior });
    }
};

/**
 * JSON parser for data-* attribute
 */
util.parseDataJSON = (el, attrName, defaults = {}) => {
    const jsonStr = el.dataset[attrName];

    if (!jsonStr) return defaults;

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.warn(`Invalid JSON in ${attr}:`, jsonStr, e);
        return defaults;
    }
};


util.truncateHTML = (html, length = 90, ellipsis = '') => {
    if (!html) return '';

    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > length
        ? text.slice(0, length).trim() + ellipsis
        : text;
};