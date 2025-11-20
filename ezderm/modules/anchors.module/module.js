document.addEventListener('DOMContentLoaded', () => {
    const modules = document.querySelectorAll('[data-anchors]');
    modules.forEach(module => {
        const targetSelector = module.dataset.target || null;
        const anchorsConfig = module.dataset.anchors ? JSON.parse(module.dataset.anchors) : {};
        const { target_tag = 'h2', prefix_id = 'anchor', modify_tags = false, custom_anchors = [] } = anchorsConfig;
        const updateUrl = module.hasAttribute('data-update-url');

        const targetContainer = targetSelector ? document.querySelector(targetSelector) : null;

        if (!targetContainer) {
            console.warn(`Target container ${targetSelector} not found`);
            return;
        }

        const headings = Array.from(targetContainer.querySelectorAll(target_tag)).filter(h => h.textContent.trim());
        if (!headings.length) return;

        const offset = parseFloat(module.dataset.offset) ||
            parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) ||
            80; // Fallback to 80px (matches scroll-margin)

        const anchorLinks = module.querySelectorAll('a');

        headings.forEach((heading, index) => {
            const generatedId = `${prefix_id}-anchor-${index + 1}`;
            const customAnchor = custom_anchors[index] || {};
            const anchorId = customAnchor.anchor_id || generatedId;

            if (!heading.id && !modify_tags) {
                heading.id = anchorId;
            }
            heading._anchorLink = Array.from(anchorLinks).find(a => a.getAttribute('href') === `#${heading.id}`);
        });

        function updateActiveAnchor() {
            let activeLink = null;
            let closestHeading = null;
            let minDistance = Infinity;

            headings.forEach(heading => {
                const rect = heading.getBoundingClientRect();
                const distance = Math.abs(rect.top - offset);
                if (distance < minDistance && rect.top <= offset + 50) {
                    minDistance = distance;
                    closestHeading = heading;
                    activeLink = heading._anchorLink;
                }
            });

            if (!activeLink && window.innerHeight + window.scrollY >= document.body.offsetHeight - offset) {
                activeLink = headings[headings.length - 1]._anchorLink;
            }

            if (!activeLink && headings[0].getBoundingClientRect().top > offset) {
                activeLink = null;
            }

            anchorLinks.forEach(a => a.classList.remove('active'));
            if (activeLink) {
                activeLink.classList.add('active');
                if (updateUrl) {
                    history.replaceState(null, '', activeLink.getAttribute('href'));
                }
            } else if (updateUrl) {
                history.replaceState(null, '', window.location.pathname);
            }
        }

        // --- Create invisible trigger element ---
        const sentinel = document.createElement('div');
        sentinel.style.position = 'absolute';
        sentinel.style.top = `-${offset}px`; // offset above the target
        sentinel.style.left = '0';
        sentinel.style.width = '1px';
        sentinel.style.height = '1px';
        sentinel.style.pointerEvents = 'none';
        targetContainer.prepend(sentinel);

        // --- Setup observer ---
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // target reached the offset point
                        module.classList.remove('is-content-left');
                    } else {
                        // target scrolled past the offset
                        module.classList.add('is-content-left');
                    }
                });
            },
            {
                root: null,
                rootMargin: `-${offset}px 0px 0px 0px`,
                threshold: 0
            }
        );

        // observer.observe(targetContainer);

        anchorLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.getBoundingClientRect().top + window.scrollY - offset,
                        behavior: 'smooth'
                    });
                    anchorLinks.forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
                    if (updateUrl) {
                        history.replaceState(null, '', `#${targetId}`);
                    }
                }
            });
        });

        updateActiveAnchor();

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateActiveAnchor, 50);
        });
    });
});