document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.splide');

    if (!carousels.length) {
        console.info('[Splide] No carousels found on the page.');
        return;
    }

    carousels.forEach((carousel, index) => {
        if (typeof Splide === 'undefined') {
            console.error('[Splide] Library not found. Please include Splide JS before this script.');
            return;
        }

        try {
            new Splide(carousel).mount();
            console.debug(`[Splide #${index}] Initialized successfully`);
        } catch (error) {
            console.error(`[Splide #${index}] Failed to initialize:`, error);
        }
    });
});
