document.addEventListener("DOMContentLoaded", () => {
    if (typeof Accordion === "undefined") {
        console.warn("[Accordion] Library not found");
        return;
    }

    const containers = document.querySelectorAll(".accordion-container");
    if (!containers.length) return;

    containers.forEach(container => {
        let options = {};
        const attr = container.getAttribute("data-accordion");

        if (attr) {
            try {
                options = JSON.parse(attr);
            } catch (e) {
                console.warn("[Accordion] Invalid JSON in data-accordion:", e);
            }
        }

        options = Object.assign(
            {
                duration: 400,
                showMultiple: false,
                collapse: true,
                ariaEnabled: true,
            },
            options
        );

        const validItems = Array.from(container.querySelectorAll(".ac")).filter(item => {
            const trigger = item.querySelector(".ac-trigger");
            const panel = item.querySelector(".ac-panel");
            return trigger && panel;
        });

        if (validItems.length === 0) {
            console.warn("[Accordion] Skipped container (no valid .ac items):", validItems);
            return;
        }

        try {
            new Accordion(container, options);
            console.info("[Accordion] Initialized with options:", options);
        } catch (err) {
            console.error("[Accordion] Failed to initialize:", err);
        }
    });
});