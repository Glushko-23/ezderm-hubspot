document.addEventListener('DOMContentLoaded', () => {
    const stickyEls = document.querySelectorAll('[data-sticky]');
    const pinnedClass = 'is-pinned';
    if (!stickyEls.length) return;
    const getScrollDirection = util.getScrollDirection(50);

    function isStickyActive(el) {
        const parent = el.offsetParent || document.body;
        const parentRect = parent.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const stickyTop = parseFloat(getComputedStyle(el).top) || 0;
        return elRect.top === stickyTop && elRect.bottom <= parentRect.bottom;
    }

    stickyEls.forEach((el) => {
        const dataOffset = parseFloat(el.getAttribute('data-sticky-offset')) || 0;
        const cssVar = getComputedStyle(el).getPropertyValue('--offset-gap');
        const cssOffset = cssVar ? parseFloat(cssVar) || 0 : 0;
        const offset = dataOffset || cssOffset || 0;

        const sentinel = document.createElement('div');
        sentinel.className = 'sticky-sentinel';
        sentinel.style.position = 'relative';
        sentinel.style.top = `-${offset}px`;
        el.before(sentinel);
        const parent = el.parentElement;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const rect = el.getBoundingClientRect();
                const parentRect = el.parentElement.getBoundingClientRect();

                if (entry.isIntersecting) {
                    el.classList.remove(pinnedClass);
                } else {
                    el.classList.add(pinnedClass);
                }
            },
            {
                root: null,
                threshold: 1,
                rootMargin: '-1px 0px 0px 0px'
            }
        );

        observer.observe(sentinel);
    });
});