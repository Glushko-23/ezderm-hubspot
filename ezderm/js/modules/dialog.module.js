(function () {
    if (window.dialogInitialized) return;
    window.dialogInitialized = true;

    document.addEventListener('DOMContentLoaded', () => {
        const buttons = document.querySelectorAll('.dialog__trigger');
        if (buttons.length === 0) return;

        buttons.forEach(button => {
            if (button.dataset.listenerAdded) return;
            button.dataset.listenerAdded = 'true';

            button.addEventListener('click', () => {
                const title = button.getAttribute('data-title');
                const content = button.getAttribute('data-content');
                const isModal = button.getAttribute('data-is-modal') === 'true';

                // Parse JSON from data-settings (if present)
                let settings = {};
                try {
                    if (button.dataset.settings) {
                        settings = JSON.parse(button.dataset.settings);
                    }
                } catch (e) {
                    console.warn('Invalid JSON in data-settings:', e);
                }

                // Defaults
                const defaults = {
                    title,
                    html: content,
                    showConfirmButton: true,
                    confirmButtonText: 'Close',
                    showCloseButton: true,
                    // default showCancelButton is false — but we allow override
                    allowOutsideClick: isModal,
                    backdrop: isModal ? 'rgba(217, 217, 217, 0.05)' : false,
                    customClass: {
                        popup: 'dialog__popup',
                        confirmButton: 'button',
                        container: 'dialog__container',
                        closeButton: 'dialog-close',
                    }
                };

                // Deep merge for customClass if needed
                const options = Object.assign({}, defaults, settings);
                if (settings.customClass) {
                    options.customClass = Object.assign({}, defaults.customClass, settings.customClass);
                }

                console.log('data-settings (dataset):', options);

                Swal.fire(options);
            });
        });
    });
})();