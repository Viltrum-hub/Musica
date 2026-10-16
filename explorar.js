
function initExplorar(initialFilter = "all") {
    window.sonoraExploreController?.abort();
    const root = document.querySelector(".explore-page");
    if (!root) return;
    const controller = new AbortController();
    window.sonoraExploreController = controller;
    const on = (target, type, handler, options = {}) => target?.addEventListener(type, handler, {...options, signal: controller.signal});

    /* ELEMENTOS */


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


    /* COMPROBAR REPRODUCTOR */


    if (!audioPlayer) {

        console.error(
            "ANDROMEDA: No se encontró #audioPlayer."
        );

        return;
    }


    /* EVITAR DUPLICAR EVENTOS */


    let playButton =
        originalPlayButton;

    let previousButton =
        originalPreviousButton;

    let nextButton =
        originalNextButton;





    /* ESTADO */


    let currentSongIndex = -1;


    /* LISTA DE CANCIONES */


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


    /* FORMATO DE TIEMPO */


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


    /* Actualizar botón de reproducción / pausa */


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


    /* MARCAR CANCIÓN ACTIVA */


    function updateActiveCard() {
        currentSongIndex = songs.findIndex(song => new URL(song.audio, document.baseURI).href === audioPlayer.src);
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


    /* ACTUALIZAR PORTADA */


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


    /* CARGAR CANCIÓN */


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
                "ANDROMEDA: La canción no tiene archivo de audio.",
                song
            );

            return;
        }


        window.sonoraPlaybackOwner = "explorar";
        window.andromedaCore.setPlaybackQueue(songs, index, "explorar");
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
                "ANDROMEDA: No se pudo reproducir la canción.",
                error
            );

            updatePlayButton();
            updateActiveCard();
        }
    }


    /* PLAY / PAUSA */


    if (playButton) {

        on(playButton,
            "click",
            async () => {

                if (
                    !audioPlayer.getAttribute("src")
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
                            "ANDROMEDA: No se pudo continuar la reproducción.",
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


    /* EVENTOS DEL AUDIO */


    on(audioPlayer,
        "play",
        () => {

            updatePlayButton();
            updateActiveCard();

        }
    );


    on(audioPlayer,
        "playing",
        () => {

            updatePlayButton();
            updateActiveCard();

        }
    );


    on(audioPlayer,
        "pause",
        () => {

            updatePlayButton();
            updateActiveCard();

        }
    );


    /* METADATOS */


    on(audioPlayer,
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


    /* PROGRESO */


    on(audioPlayer,
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


    /* BARRA DE PROGRESO */


    if (progressBar) {

        on(progressBar,
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


    /* VOLUMEN */


    if (volumeBar) {

        audioPlayer.volume =
            Number(
                volumeBar.value
            );


        on(volumeBar,
            "input",
            () => {

                audioPlayer.volume =
                    Number(
                        volumeBar.value
                    );
            }
        );
    }


    /* SIGUIENTE */


    if (nextButton) {

        on(nextButton,
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


    /* ANTERIOR */


    if (previousButton) {

        on(previousButton,
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


    /* CUANDO TERMINA UNA CANCIÓN */


    on(audioPlayer,
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


    /* ERROR DE AUDIO */


    on(audioPlayer,
        "error",
        () => {

            console.error(
                "ANDROMEDA: Error al cargar el archivo:",
                audioPlayer.src
            );

            updatePlayButton();
            updateActiveCard();
        }
    );


    /* BOTONES DE LAS CANCIONES */


    songCards.forEach(
        (card, index) => {

            const playCardButton =
                card.querySelector(
                    ".explore-play-button"
                );


            if (playCardButton) {

                on(playCardButton,
                    "click",
                    event => {

                        event.stopPropagation();
                        window.sonoraPlaybackOwner = "explorar";
                        window.andromedaCore.setPlaybackQueue(songs, index, "explorar");


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


            on(card,
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


    /* FILTRO DE GÉNEROS */


    let activeFilter =
        "all";

    const searchInput = document.getElementById("exploreSearch");
    const sortSelect = document.getElementById("exploreSort");
    const grid = document.getElementById("exploreSongGrid");
    const resultCount = document.getElementById("exploreResultCount");
    const total = document.getElementById("exploreTotal");
    const artistTotal = document.getElementById("exploreArtists");
    if (total) total.textContent = songCards.length;
    if (artistTotal) artistTotal.textContent = new Set(songs.map(song => song.artist.split(" feat.")[0].toLowerCase())).size;

    on(searchInput, "input", () => filterSongs(activeFilter));
    on(sortSelect, "change", () => {
        const ordered = [...songCards];
        const key = sortSelect.value;
        if (key !== "original") ordered.sort((a,b) => (a.dataset[key] || "").localeCompare(b.dataset[key] || "", "es", {sensitivity:"base"}));
        ordered.forEach(card => grid.appendChild(card));
    });
    document.querySelectorAll("[data-explore-view]").forEach(button => {
        on(button, "click", () => {
            grid.classList.toggle("explore-list", button.dataset.exploreView === "list");
            document.querySelectorAll("[data-explore-view]").forEach(control => {
                const active = control === button;
                control.classList.toggle("active",active);
                control.setAttribute("aria-pressed",String(active));
            });
        });
    });

    let featuredIndex = 0;
    const featuredButton = document.getElementById("exploreFeaturePlay");
    function syncFeaturedPlayback() {
        if (!featuredButton) return;
        const playing = songs[featuredIndex]?.audio && audioPlayer.src === new URL(songs[featuredIndex].audio,document.baseURI).href && !audioPlayer.paused;
        featuredButton.querySelector("i").className = playing ? "bi bi-pause-fill" : "bi bi-play-fill";
        featuredButton.querySelector("span").textContent = playing ? "Pausar" : "Escuchar";
        featuredButton.setAttribute("aria-label",`${playing ? "Pausar" : "Reproducir"} ${songs[featuredIndex]?.title || "canción"}`);
        document.querySelector(".explore-feature")?.classList.toggle("is-playing",playing);
    }
    function updateFeaturedSong() {
        if (!document.getElementById("exploreFeatureTitle")) return;
        const theme = document.body.dataset.theme || "electronic";
        const candidates = songCards.map(card => ({...card.dataset, artistId:card.dataset.artistId}));
        const selected = window.andromedaCatalog.featuredSongs(candidates, theme)[0];
        featuredIndex = Math.max(0, candidates.indexOf(selected));
        const song = songs[featuredIndex];
        if (!song || !featuredButton) return;
        document.getElementById("exploreFeatureTitle").textContent = song.title;
        document.getElementById("exploreFeatureArtist").textContent = song.artist;
        document.getElementById("exploreFeatureGenre").textContent = songCards[featuredIndex].querySelector(".song-genre")?.textContent || song.genre;
        const image = document.getElementById("exploreFeatureImage");
        image.src = song.image;
        image.alt = `Portada de ${song.title}`;
        syncFeaturedPlayback();
    }
    on(featuredButton, "click",() => songCards[featuredIndex].querySelector(".explore-play-button")?.click());
    ["play","pause","loadedmetadata","emptied"].forEach(event => on(audioPlayer, event,syncFeaturedPlayback));
    window.sonoraExploreThemeObserver?.disconnect();
    window.sonoraExploreThemeObserver = new MutationObserver(updateFeaturedSong);
    window.sonoraExploreThemeObserver.observe(document.body,{attributes:true,attributeFilter:["data-theme"]});
    updateFeaturedSong();


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


                const themes = (card.dataset.themeTags || "").split(/\s+/);
                const matchesGenre =
                    activeFilter === "all" ||
                    cardGenre === activeFilter ||
                    themes.includes(activeFilter);
                const query = normalizeGenre(searchInput?.value);
                const show = matchesGenre && normalizeGenre(`${card.dataset.title} ${card.dataset.artist}`).includes(query);


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
            const heading = noResults.querySelector("h3");
            const description = noResults.querySelector("p");
            const emptyCelestial = activeFilter === "celestial" && !searchInput?.value;
            if (heading) heading.textContent = emptyCelestial ? "Celestial está esperando su primera canción" : "No encontramos canciones";
            if (description) description.textContent = emptyCelestial ? "Aún no hay canciones cristianas en el catálogo. Pronto podrás descubrirlas aquí." : "Prueba otro título, artista o género.";

            noResults.style.display =
                visibleSongs === 0
                    ? "block"
                    : "none";
        }
        if (resultCount) resultCount.textContent = `${visibleSongs} ${visibleSongs === 1 ? "canción disponible" : "canciones disponibles"}`;
    }


    /* EVENTOS DE FILTROS */


    genreButtons.forEach(
        button => {

            on(button,
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


    /* INICIO */


    filterSongs(
        initialFilter
    );

    updatePlayButton();
    updateActiveCard();
    const themeObserver = window.sonoraExploreThemeObserver;
    const observer = new MutationObserver(() => {
        if (!root.isConnected) controller.abort();
    });
    if (root.parentNode) observer.observe(root.parentNode, {childList:true});
    controller.signal.addEventListener("abort", () => {
        observer.disconnect();
        themeObserver?.disconnect();
    }, {once:true});
}



