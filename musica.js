document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       ELEMENTOS
    ========================= */

    const audioPlayer = document.getElementById("audioPlayer");

    const mainPlayBtn = document.getElementById("mainPlayBtn");

    const progressBar = document.getElementById("progressBar");

    const volumeBar = document.getElementById("volumeBar");

    const currentTimeEl = document.getElementById("currentTime");

    const durationEl = document.getElementById("duration");

    const playerTitle = document.getElementById("playerTitle");

    const playerArtist = document.getElementById("playerArtist");

    const previousBtn = document.getElementById("previousBtn");

    const nextBtn = document.getElementById("nextBtn");

    const cards = document.querySelectorAll(".album-card");

    const playButtons = document.querySelectorAll(".play-card");


    let currentSong = -1;


    /* =========================
       LISTA DE CANCIONES
    ========================= */

    const songs = Array.from(cards).map(card => {

        return {
            title: card.dataset.title,
            artist: card.dataset.artist,
            audio: card.dataset.audio
        };

    });

    /* =========================
   VISUALIZADOR DE AUDIO
========================= */

const equalizerBars =
    document.querySelectorAll(".equalizer span");

let audioContext = null;
let analyser = null;
let audioSource = null;
let visualizerStarted = false;


/* Crear analizador */

function setupAudioVisualizer() {

    if (visualizerStarted) {
        return;
    }

    try {

        audioContext =
            new (window.AudioContext ||
            window.webkitAudioContext)();

        analyser =
            audioContext.createAnalyser();

        analyser.fftSize = 128;

        analyser.smoothingTimeConstant = 0.75;

        audioSource =
            audioContext.createMediaElementSource(
                audioPlayer
            );

        audioSource.connect(analyser);

        analyser.connect(
            audioContext.destination
        );

        visualizerStarted = true;

        animateVisualizer();

    } catch (error) {

        console.log(
            "No se pudo iniciar el visualizador:",
            error
        );

    }

}


/* Animación del ecualizador */

function animateVisualizer() {

    if (!analyser) {
        return;
    }

    const frequencyData =
        new Uint8Array(
            analyser.frequencyBinCount
        );


    function updateBars() {

        requestAnimationFrame(updateBars);

        analyser.getByteFrequencyData(
            frequencyData
        );


        equalizerBars.forEach(
            (bar, index) => {

                const dataIndex =
                    Math.floor(
                        index *
                        frequencyData.length /
                        equalizerBars.length
                    );

                const value =
                    frequencyData[dataIndex];

                /*
                 * Convertimos la frecuencia
                 * en una escala de altura.
                 */

                const intensity =
                    value / 255;

                const minScale = 0.18;

                const scale =
                    minScale +
                    intensity * 1.15;

                bar.style.transform =
                    `scaleY(${scale})`;

                bar.style.opacity =
                    0.35 +
                    intensity * 0.65;

            }
        );

    }


    updateBars();

}

    /* =========================
       FORMATO DE TIEMPO
    ========================= */

    function formatTime(seconds) {

        if (!isFinite(seconds)) {
            return "0:00";
        }

        const minutes = Math.floor(seconds / 60);

        const remainingSeconds =
            Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

        return `${minutes}:${remainingSeconds}`;

    }


    /* =========================
       CARGAR CANCIÓN
    ========================= */

    function loadSong(index, autoplay = true) {

        if (!songs[index]) {
            return;
        }

        currentSong = index;

        const song = songs[index];

        audioPlayer.src = song.audio;

        playerTitle.textContent = song.title;

        playerArtist.textContent = song.artist;

        progressBar.value = 0;

        currentTimeEl.textContent = "0:00";

        durationEl.textContent = "0:00";


        if (autoplay) {

       setupAudioVisualizer();

        if (
          audioContext &&
           audioContext.state === "suspended"
         ) {
        audioContext.resume();
    }

    audioPlayer
        .play()
        .then(() => {

            updatePlayButton();

        })
        .catch(() => {

            console.log(
                "No se pudo reproducir el archivo de audio."
            );

        });
}

}


    /* =========================
       PLAY / PAUSE
    ========================= */

   mainPlayBtn.addEventListener("click", () => {

    /*
     * Inicializamos el visualizador
     * después de una interacción del usuario.
     */

    setupAudioVisualizer();

    if (
        audioContext &&
        audioContext.state === "suspended"
    ) {
        audioContext.resume();
    }


    if (currentSong === -1) {

        loadSong(0, true);

        return;

    }


    if (audioPlayer.paused) {

        audioPlayer.play();

    } else {

        audioPlayer.pause();

    }

});


    function updatePlayButton() {

        const icon = mainPlayBtn.querySelector("i");

        if (audioPlayer.paused) {

            icon.className = "bi bi-play-fill";

        } else {

            icon.className = "bi bi-pause-fill";

        }

    }


    audioPlayer.addEventListener(
        "play",
        updatePlayButton
    );


    audioPlayer.addEventListener(
        "pause",
        updatePlayButton
    );


    /* =========================
       CARDS DE ÁLBUM
    ========================= */

    cards.forEach((card, index) => {

        card.addEventListener("click", (event) => {

            if (
                event.target.closest(".more-button")
            ) {
                return;
            }

            loadSong(index, true);

        });

    });


    /* =========================
       BOTONES PLAY
    ========================= */

    playButtons.forEach((button, index) => {

        button.addEventListener("click", (event) => {

            event.stopPropagation();

            loadSong(index, true);

        });

    });


    /* =========================
       SIGUIENTE
    ========================= */

    nextBtn.addEventListener("click", () => {

        if (songs.length === 0) {
            return;
        }

        let nextSong = currentSong + 1;

        if (nextSong >= songs.length) {
            nextSong = 0;
        }

        loadSong(nextSong, true);

    });


    /* =========================
       ANTERIOR
    ========================= */

    previousBtn.addEventListener("click", () => {

        if (songs.length === 0) {
            return;
        }

        let previousSong = currentSong - 1;

        if (previousSong < 0) {
            previousSong = songs.length - 1;
        }

        loadSong(previousSong, true);

    });


    /* =========================
       PROGRESO
    ========================= */

    audioPlayer.addEventListener(
        "loadedmetadata",
        () => {

            durationEl.textContent =
                formatTime(audioPlayer.duration);

        }
    );


    audioPlayer.addEventListener(
        "timeupdate",
        () => {

            if (!audioPlayer.duration) {
                return;
            }

            const percentage =
                (audioPlayer.currentTime /
                audioPlayer.duration) * 100;

            progressBar.value = percentage;

            currentTimeEl.textContent =
                formatTime(audioPlayer.currentTime);

        }
    );


    progressBar.addEventListener(
        "input",
        () => {

            if (!audioPlayer.duration) {
                return;
            }

            audioPlayer.currentTime =
                (progressBar.value / 100) *
                audioPlayer.duration;

        }
    );


    /* =========================
       VOLUMEN
    ========================= */

    audioPlayer.volume = volumeBar.value;


    volumeBar.addEventListener(
        "input",
        () => {

            audioPlayer.volume =
                volumeBar.value;

        }
    );


    /* =========================
       CUANDO TERMINA
    ========================= */

    audioPlayer.addEventListener(
        "ended",
        () => {

            let nextSong = currentSong + 1;

            if (nextSong >= songs.length) {
                nextSong = 0;
            }

            loadSong(nextSong, true);

        }
    );


    /* =========================
       NAVBAR SCROLL
    ========================= */

    const navbar =
        document.getElementById("mainNavbar");


    window.addEventListener(
        "scroll",
        () => {

            if (window.scrollY > 50) {

                navbar.classList.add("scrolled");

            } else {

                navbar.classList.remove("scrolled");

            }

        }
    );



    /* =========================
       PLANETAS — SELECTOR DE ESTILO
    ========================= */

    const planetThemeButton =
        document.getElementById("planetThemeButton");

    const planetThemeMenu =
        document.getElementById("planetThemeMenu");

    const currentThemeName =
        document.getElementById("currentThemeName");

    const themeOptions =
        document.querySelectorAll(".planet-theme-option");

    const syncThemeCards =
        document.querySelectorAll(".theme-sync-card");

    const themeNames = {
        electronic: "ELECTRONIC",
        pop: "POP",
        rock: "ROCK",
        jazz: "JAZZ",
        hiphop: "HIP HOP"
    };

    function applyMusicTheme(theme) {

        if (!themeNames[theme]) {
            theme = "electronic";
        }

        document.body.setAttribute(
            "data-theme",
            theme
        );

        if (currentThemeName) {
            currentThemeName.textContent =
                themeNames[theme];
        }

        themeOptions.forEach((option) => {
            option.classList.toggle(
                "active",
                option.dataset.theme === theme
            );
        });

        syncThemeCards.forEach((card) => {
            card.classList.toggle(
                "active-theme",
                card.dataset.theme === theme
            );
        });

        localStorage.setItem(
            "sonora-theme",
            theme
        );
    }

    const savedMusicTheme =
        localStorage.getItem("sonora-theme") ||
        "electronic";

    applyMusicTheme(savedMusicTheme);

    if (planetThemeButton && planetThemeMenu) {

        planetThemeButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                const isOpen =
                    planetThemeMenu.classList.toggle(
                        "open"
                    );

                planetThemeButton.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );
            }
        );

        themeOptions.forEach((option) => {

            option.addEventListener(
                "click",
                () => {

                    applyMusicTheme(
                        option.dataset.theme
                    );

                    planetThemeMenu.classList.remove(
                        "open"
                    );

                    planetThemeButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );
        });

        document.addEventListener(
            "click",
            (event) => {

                if (
                    !event.target.closest(
                        ".planet-theme-selector"
                    )
                ) {

                    planetThemeMenu.classList.remove(
                        "open"
                    );

                    planetThemeButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
        );
    }

    syncThemeCards.forEach((card) => {

        card.addEventListener(
            "click",
            () => {

                applyMusicTheme(
                    card.dataset.theme
                );

            }
        );

    });

    /* =========================
       BUSCADOR
    ========================= */

    const openSearch =
        document.getElementById("openSearch");

    const closeSearch =
        document.getElementById("closeSearch");

    const searchOverlay =
        document.getElementById("searchOverlay");

    const searchInput =
        document.getElementById("searchInput");

    const searchResults =
        document.getElementById("searchResults");


    openSearch.addEventListener(
        "click",
        () => {

            searchOverlay.classList.add("show");

            searchInput.focus();

        }
    );


    closeSearch.addEventListener(
        "click",
        () => {

            searchOverlay.classList.remove(
                "show"
            );

        }
    );


    searchOverlay.addEventListener(
        "click",
        (event) => {

            if (event.target === searchOverlay) {

                searchOverlay.classList.remove(
                    "show"
                );

            }

        }
    );


    searchInput.addEventListener(
        "input",
        () => {
            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();

            searchResults.innerHTML = "";


            if (!query) {
                return;
            }

            songs
                .filter(song =>
                    song.title
                        .toLowerCase()
                        .includes(query)

                    ||

                    song.artist
                        .toLowerCase()
                        .includes(query)
                )
                .forEach((song, index) => {

                    const result =
                        document.createElement("div");

                    result.className =
                        "search-result";

                    result.innerHTML = `
                        <strong>${song.title}</strong>
                        <br>
                        <small>${song.artist}</small>
                    `;


                    result.addEventListener(
                        "click",
                        () => {

                            loadSong(index, true);

                            searchOverlay.classList.remove(
                                "show"
                            );

                            searchInput.value = "";

                        }
                    );


                    searchResults.appendChild(
                        result
                    );

                });

        }
    );


    /* =========================
       ESC PARA CERRAR BUSCADOR
    ========================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                searchOverlay.classList.remove(
                    "show"
                );

            }

        }
    );


});