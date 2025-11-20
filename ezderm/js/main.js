(function () {
    // Variables
    const nav = document.querySelector('.header__content');
    const langSwitcher = document.querySelector('.header__language-switcher');
    const search = document.querySelector('.header__search');
    const allToggles = document.querySelectorAll('.header--toggle');
    const navToggle = document.querySelector('.header__navigation--toggle');
    const langToggle = document.querySelector('.header__language-switcher--toggle');
    const searchToggle = document.querySelector('.header__search--toggle');
    const closeToggle = document.querySelector('.header__close--toggle');
    const allElements = document.querySelectorAll(
        '.header--element, .header--toggle'
    );
    const emailGlobalUnsub = document.querySelector('input[name="globalunsub"]');
    const headerWrapper = document.querySelector('.header-wrapper');
    const header = document.querySelector('.header');
    const menuItems = document.querySelectorAll('.mega-nav__item');

    // Functions

    // Function for executing code on document ready
    function domReady(callback) {
        if (['interactive', 'complete'].indexOf(document.readyState) >= 0) {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    // Function for toggling mobile navigation
    function toggleNav() {
        allToggles.forEach(function (toggle) {
            toggle.classList.toggle('hide');
        });

        nav.classList.toggle('open');
        navToggle.classList.toggle('open');

        closeToggle.classList.toggle('show');
        document.body.classList.toggle('menu--opened');
    }

    // Function for toggling mobile language selector
    function toggleLang() {
        allToggles.forEach(function (toggle) {
            toggle.classList.toggle('hide');
        });

        langSwitcher.classList.toggle('open');
        langToggle.classList.toggle('open');

        closeToggle.classList.toggle('show');
    }

    // Function for toggling mobile search field
    function toggleSearch() {
        allToggles.forEach(function (toggle) {
            toggle.classList.toggle('hide');
        });

        search.classList.toggle('open');
        searchToggle.classList.toggle('open');

        closeToggle.classList.toggle('show');
    }

    // Function for the header close option on mobile
    function closeAll() {
        allElements.forEach(function (element) {
            element.classList.remove('hide', 'open');
        });

        closeToggle.classList.remove('show');
    }

    // Function to disable the other checkbox inputs on the email subscription system page template
    function toggleDisabled() {
        var emailSubItem = document.querySelectorAll('#email-prefs-form .item');

        emailSubItem.forEach(function (item) {
            var emailSubItemInput = item.querySelector('input');

            if (emailGlobalUnsub.checked) {
                item.classList.add('disabled');
                emailSubItemInput.setAttribute('disabled', 'disabled');
                emailSubItemInput.checked = false;
            } else {
                item.classList.remove('disabled');
                emailSubItemInput.removeAttribute('disabled');
            }
        });
    }

    // Function for handling desktop hover behavior + touch interactions
    function initNavigationHoverBehavior() {
        let hoverTimer;
        let leaveTimer;

        const HOVER_DELAY = 120; // hover-intent
        const LEAVE_DELAY = 180; // debounce mouseleave

        menuItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                clearTimeout(leaveTimer);

                hoverTimer = setTimeout(() => {
                    item.classList.add('hovered');
                    header.classList.add('on-hovered');
                }, HOVER_DELAY);
            });

            item.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimer);

                leaveTimer = setTimeout(() => {
                    item.classList.remove('hovered');

                    // Check to see if there are any other hovered elements left
                    const anyHovered = document.querySelector('.mega-nav__item.hovered');
                    if (!anyHovered) header.classList.remove('on-hovered');
                }, LEAVE_DELAY);
            });
        });

        // If the cursor has moved outside the entire navigation area
        header.addEventListener('mouseleave', () => {
            leaveTimer = setTimeout(() => {
                header.classList.remove('on-hovered');
                menuItems.forEach(i => i.classList.remove('hovered'));
            }, LEAVE_DELAY);
        });
    }

    // Execute JavaScript on document ready
    domReady(function () {
        if (!document.body) {
            return;
        } else {
            // Function dependent on language switcher
            if (langSwitcher) {
                langToggle.addEventListener('click', toggleLang);
            }

            // Function dependent on navigation
            if (navToggle) {
                navToggle.addEventListener('click', toggleNav);
            }

            // Function dependent on search field
            if (searchToggle) {
                searchToggle.addEventListener('click', toggleSearch);
            }

            // Function dependent on close toggle
            if (closeToggle) {
                closeToggle.addEventListener('click', closeAll);
            }

            // Function dependent on email unsubscribe from all input
            if (emailGlobalUnsub) {
                emailGlobalUnsub.addEventListener('change', toggleDisabled);
            }

            if (menuItems.length) {
                initNavigationHoverBehavior();
            }
        }
    });
})();