
function initExplorar(initialFilter = "all") {

    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const audioPlayer =
        document.getElementById("audioPlayer");

    const originalPlayButton =
        document.getElementById("mainPlayBtn");

    const originalPreviousButton =
        document.getElementById("previousBtn");

    const originalNextButton =
        document.getElementById("nextBtn");

    const progressBar =
        document.getElementById("progressBar");

    const currentTimeElement =
        document.getElementById("currentTime");

    const durationElement =
        document.getElementById("duration");

    const volumeBar =
        document.getElementById("volumeBar");

    const playerTitle =
        document.getElementById("playerTitle");

    const playerArtist =
        document.getElementById("playerArtist");

    const songCards = [
        ...document.querySelectorAll(
            ".explore-song-card"
        )
    ];

    const genreButtons = [
        ...document.querySelectorAll(
            ".genre-filter"
        )
    ];

    const noResults =
        document.getElementById(
            "exploreNoResults"
        );


    /* =====================================================
       COMPROBAR REPRODUCTOR
    ===================================================== */

    if (!audioPlayer) {

        console.error(
            "SONORA: No se encontró #audioPlayer."
        );

        return;
    }


    /* =====================================================
       EVITAR DUPLICAR EVENTOS
    ===================================================== */

    let playButton =
        originalPlayButton;

    let previousButton =
        originalPreviousButton;

    let nextButton =
        originalNextButton;


    /*
     * Si initExplorar() se ejecuta nuevamente,
     * evitamos duplicar los eventos del reproductor.
     */

    if (originalPlayButton) {

        playButton =
            originalPlayButton.cloneNode(true);

        originalPlayButton.replaceWith(
            playButton
        );
    }


    if (originalPreviousButton) {

        previousButton =
            originalPreviousButton.cloneNode(true);

        originalPreviousButton.replaceWith(
            previousButton
        );
    }


    if (originalNextButton) {

        nextButton =
            originalNextButton.cloneNode(true);

        originalNextButton.replaceWith(
            nextButton
        );
    }


    /* =====================================================
       ESTADO
    ===================================================== */

    let currentSongIndex = -1;


    /* =====================================================
       LISTA DE CANCIONES
    ===================================================== */

    const songs =
        songCards.map(card => {

            return {

                title:
                    card.dataset.title ||
                    "Canción",

                artist:
                    card.dataset.artist ||
                    "Artista",

                audio:
                    card.dataset.audio ||
                    "",

                genre:
                    (
                        card.dataset.genre ||
                        ""
                    )
                        .trim()
                        .toLowerCase(),

                image:
                    card.dataset.image ||
                    card.querySelector("img")?.src ||
                    ""
            };

        });


    /* =====================================================
       FORMATO DE TIEMPO
    ===================================================== */

    function formatTime(seconds) {

        if (
            !Number.isFinite(seconds) ||
            seconds < 0
        ) {
            return "0:00";
        }

        const minutes =
            Math.floor(
                seconds / 60
            );

        const remainingSeconds =
            Math.floor(
                seconds % 60
            )
                .toString()
                .padStart(2, "0");

        return `${minutes}:${remainingSeconds}`;
    }


    /* =====================================================
       ACTUALIZAR BOTÓN PLAY / PAUSA
    ===================================================== */

    function updatePlayButton() {

        if (!playButton) {
            return;
        }

        const icon =
            playButton.querySelector("i");

        if (!icon) {
            return;
        }

        if (audioPlayer.paused) {

            icon.className =
                "bi bi-play-fill";

            playButton.setAttribute(
                "aria-label",
                "Reproducir"
            );

        } else {

            icon.className =
                "bi bi-pause-fill";

            playButton.setAttribute(
                "aria-label",
                "Pausar"
            );
        }
    }


    /* =====================================================
       MARCAR CANCIÓN ACTIVA
    ===================================================== */

    function updateActiveCard() {

        songCards.forEach(
            (card, index) => {

                card.classList.toggle(
                    "is-playing",
                    index === currentSongIndex &&
                    !audioPlayer.paused
                );

            }
        );
    }


    /* =====================================================
       ACTUALIZAR PORTADA
    ===================================================== */

    function updatePlayerCover(image) {

        const playerCover =
            document.getElementById(
                "playerCover"
            );

        if (!playerCover) {
            return;
        }

        let imageElement =
            playerCover.querySelector("img");


        if (image) {

            if (!imageElement) {

                imageElement =
                    document.createElement(
                        "img"
                    );

                playerCover.appendChild(
                    imageElement
                );
            }

            imageElement.src =
                image;

            imageElement.alt =
                "Portada";

            imageElement.style.display =
                "block";

            const icon =
                playerCover.querySelector("i");

            if (icon) {

                icon.style.display =
                    "none";
            }

        } else {

            if (imageElement) {
                imageElement.remove();
            }

            const icon =
                playerCover.querySelector("i");

            if (icon) {

                icon.style.display =
                    "flex";
            }
        }
    }


    /* =====================================================
       CARGAR CANCIÓN
    ===================================================== */

    async function loadExploreSong(
        index,
        autoplay = true
    ) {

        if (!songs[index]) {
            return;
        }

        const song =
            songs[index];


        if (!song.audio) {

            console.error(
                "SONORA: La canción no tiene archivo de audio.",
                song
            );

            return;
        }


        currentSongIndex =
            index;

        audioPlayer.pause();

        audioPlayer.currentTime =
            0;

        audioPlayer.src =
            song.audio;


        if (playerTitle) {

            playerTitle.textContent =
                song.title;
        }


        if (playerArtist) {

            playerArtist.textContent =
                song.artist;
        }


        updatePlayerCover(
            song.image
        );


        if (progressBar) {

            progressBar.value =
                0;
        }


        if (currentTimeElement) {

            currentTimeElement.textContent =
                "0:00";
        }


        if (durationElement) {

            durationElement.textContent =
                "0:00";
        }


        audioPlayer.load();

        updatePlayButton();
        updateActiveCard();


        if (!autoplay) {
            return;
        }


        try {

            await audioPlayer.play();

            updatePlayButton();
            updateActiveCard();

        } catch (error) {

            console.error(
                "SONORA: No se pudo reproducir la canción.",
                error
            );

            updatePlayButton();
            updateActiveCard();
        }
    }


    /* =====================================================
       PLAY / PAUSA
    ===================================================== */

    if (playButton) {

        playButton.addEventListener(
            "click",
            async () => {

                if (
                    currentSongIndex === -1
                ) {

                    await loadExploreSong(
                        0,
                        true
                    );

                    return;
                }


                if (
                    audioPlayer.paused
                ) {

                    try {

                        await audioPlayer.play();

                    } catch (error) {

                        console.error(
                            "SONORA: No se pudo continuar la reproducción.",
                            error
                        );
                    }

                } else {

                    audioPlayer.pause();
                }


                updatePlayButton();
                updateActiveCard();
            }
        );
    }


    /* =====================================================
       EVENTOS DEL AUDIO
    ===================================================== */

    audioPlayer.addEventListener(
        "play",
        () => {

            updatePlayButton();
            updateActiveCard();

        }
    );


    audioPlayer.addEventListener(
        "playing",
        () => {

            updatePlayButton();
            updateActiveCard();

        }
    );


    audioPlayer.addEventListener(
        "pause",
        () => {

            updatePlayButton();
            updateActiveCard();

        }
    );


    /* =====================================================
       METADATOS
    ===================================================== */

    audioPlayer.addEventListener(
        "loadedmetadata",
        () => {

            if (durationElement) {

                durationElement.textContent =
                    formatTime(
                        audioPlayer.duration
                    );
            }
        }
    );


    /* =====================================================
       PROGRESO
    ===================================================== */

    audioPlayer.addEventListener(
        "timeupdate",
        () => {

            if (
                !Number.isFinite(
                    audioPlayer.duration
                ) ||
                audioPlayer.duration <= 0
            ) {
                return;
            }


            const percentage =
                (
                    audioPlayer.currentTime /
                    audioPlayer.duration
                ) * 100;


            if (progressBar) {

                progressBar.value =
                    percentage;
            }


            if (currentTimeElement) {

                currentTimeElement.textContent =
                    formatTime(
                        audioPlayer.currentTime
                    );
            }
        }
    );


    /* =====================================================
       BARRA DE PROGRESO
    ===================================================== */

    if (progressBar) {

        progressBar.addEventListener(
            "input",
            () => {

                if (
                    !Number.isFinite(
                        audioPlayer.duration
                    ) ||
                    audioPlayer.duration <= 0
                ) {
                    return;
                }


                audioPlayer.currentTime =
                    (
                        progressBar.value /
                        100
                    ) *
                    audioPlayer.duration;
            }
        );
    }


    /* =====================================================
       VOLUMEN
    ===================================================== */

    if (volumeBar) {

        audioPlayer.volume =
            Number(
                volumeBar.value
            );


        volumeBar.addEventListener(
            "input",
            () => {

                audioPlayer.volume =
                    Number(
                        volumeBar.value
                    );
            }
        );
    }


    /* =====================================================
       SIGUIENTE
    ===================================================== */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                if (
                    songs.length === 0
                ) {
                    return;
                }


                let nextIndex =
                    currentSongIndex + 1;


                if (
                    nextIndex >=
                    songs.length
                ) {

                    nextIndex = 0;
                }


                loadExploreSong(
                    nextIndex,
                    true
                );
            }
        );
    }


    /* =====================================================
       ANTERIOR
    ===================================================== */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                if (
                    songs.length === 0
                ) {
                    return;
                }


                let previousIndex =
                    currentSongIndex - 1;


                if (
                    previousIndex < 0
                ) {

                    previousIndex =
                        songs.length - 1;
                }


                loadExploreSong(
                    previousIndex,
                    true
                );
            }
        );
    }


    /* =====================================================
       CUANDO TERMINA UNA CANCIÓN
    ===================================================== */

    audioPlayer.addEventListener(
        "ended",
        () => {

            if (
                songs.length === 0
            ) {
                return;
            }


            let nextIndex =
                currentSongIndex + 1;


            if (
                nextIndex >=
                songs.length
            ) {

                nextIndex = 0;
            }


            loadExploreSong(
                nextIndex,
                true
            );
        }
    );


    /* =====================================================
       ERROR DE AUDIO
    ===================================================== */

    audioPlayer.addEventListener(
        "error",
        () => {

            console.error(
                "SONORA: Error al cargar el archivo:",
                audioPlayer.src
            );

            updatePlayButton();
            updateActiveCard();
        }
    );


    /* =====================================================
       BOTONES DE LAS CANCIONES
    ===================================================== */

    songCards.forEach(
        (card, index) => {

            const playCardButton =
                card.querySelector(
                    ".explore-play-button"
                );


            if (playCardButton) {

                playCardButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        if (
                            currentSongIndex === index &&
                            audioPlayer.src
                        ) {

                            if (
                                audioPlayer.paused
                            ) {

                                audioPlayer
                                    .play()
                                    .catch(error => {
                                        console.error(
                                            error
                                        );
                                    });

                            } else {

                                audioPlayer.pause();
                            }

                            return;
                        }


                        loadExploreSong(
                            index,
                            true
                        );
                    }
                );
            }


            card.addEventListener(
                "click",
                event => {

                    if (
                        event.target.closest(
                            ".explore-play-button"
                        )
                    ) {
                        return;
                    }


                    if (
                        currentSongIndex === index &&
                        audioPlayer.src
                    ) {

                        if (
                            audioPlayer.paused
                        ) {

                            audioPlayer
                                .play()
                                .catch(error => {
                                    console.error(
                                        error
                                    );
                                });

                        } else {

                            audioPlayer.pause();
                        }

                        return;
                    }


                    loadExploreSong(
                        index,
                        true
                    );
                }
            );
        }
    );


    /* =====================================================
       FILTRO DE GÉNEROS
    ===================================================== */

    let activeFilter =
        "all";


    function normalizeGenre(value) {

        return (
            value ||
            ""
        )
            .toString()
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );
    }


    function filterSongs(filter) {

        activeFilter =
            normalizeGenre(filter);


        let visibleSongs =
            0;


        songCards.forEach(
            card => {

                const cardGenre =
                    normalizeGenre(
                        card.dataset.genre
                    );


                const show =
                    activeFilter === "all" ||
                    cardGenre === activeFilter;


                if (show) {

                    visibleSongs++;

                    card.classList.remove(
                        "filter-hidden"
                    );

                    card.style.display =
                        "";

                    card.style.animation =
                        "none";

                    void card.offsetWidth;

                    card.style.animation =
                        "exploreCardIn 0.35s ease forwards";

                } else {

                    card.classList.add(
                        "filter-hidden"
                    );

                    card.style.animation =
                        "none";

                    card.style.display =
                        "none";
                }
            }
        );


        genreButtons.forEach(
            button => {

                const buttonFilter =
                    normalizeGenre(
                        button.dataset.filter
                    );


                button.classList.toggle(
                    "active",
                    buttonFilter ===
                    activeFilter
                );


                button.setAttribute(
                    "aria-pressed",
                    buttonFilter ===
                    activeFilter
                        ? "true"
                        : "false"
                );
            }
        );


        if (noResults) {

            noResults.style.display =
                visibleSongs === 0
                    ? "block"
                    : "none";
        }
    }


    /* =====================================================
       EVENTOS DE FILTROS
    ===================================================== */

    genreButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    const filter =
                        button.dataset.filter ||
                        "all";


                    filterSongs(
                        filter
                    );
                }
            );
        }
    );


    /* =====================================================
       INICIO
    ===================================================== */

    filterSongs(
        initialFilter
    );

    updatePlayButton();
}

