(function () {
    window.initPlyrPlayers = function (selector = '.js-player', wrapperSelector = '.video-wrapper') {
        if (typeof Plyr === 'undefined') {
            console.warn('⚠️ Plyr is not loaded.');
            return [];
        }

        const videos = document.querySelectorAll(selector);
        if (!videos.length) return [];

        const players = Array.from(videos).map((el) => {
            let settings = {};

            const parent = el.closest(wrapperSelector);
            const dataSettings = parent?.dataset.videoSettings;

            if (dataSettings) {
                try {
                    settings = JSON.parse(dataSettings);
                } catch (e) {
                    console.warn('⚠️ Invalid JSON in data-video-settings:', dataSettings);
                }
            }

            const defaultSettings = {
                autoplay: false
            };

            // Merge: dataSettings overrides defaults
            const playerSettings = {
                ...defaultSettings,
                ...settings
            };


            const player = new Plyr(el, playerSettings);
            parent?.classList.add('plyr--setup');

            player.on('play', (e) => {
                console.log('play', player.config);
            });

            return player;
        });

        window.videoPlayers = players;
        return players;
    };
    document.addEventListener('DOMContentLoaded', () => {
        window.videoPlayers = [];

        window.videoPlayers = window.initPlyrPlayers();
    });
})();