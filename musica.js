document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       ELEMENTOS — REPRODUCTOR
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


    /* =========================
       SUPABASE
    ========================= */

    const SUPABASE_URL =
        "https://tiqwiqwtobuldmncrnrp.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_XvlD7ubul9Oo5xZwFwGCRQ_UDR8SPGd";

    const { createClient } = window.supabase;

    const supabaseClient = createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


    let currentSong = -1;
    let currentUser = null;


    /* =========================
       LISTA DE CANCIONES
    ========================= */

    const songs = Array.from(cards).map(card => ({
        title: card.dataset.title || "Canción",
        artist: card.dataset.artist || "Artista",
        audio: card.dataset.audio || "",
        image: card.dataset.image || ""
    }));


    /* =========================
       VISUALIZADOR DE AUDIO
    ========================= */

    const equalizerBars =
        document.querySelectorAll(".equalizer span");

    let audioContext = null;
    let analyser = null;
    let audioSource = null;
    let visualizerStarted = false;


    function setupAudioVisualizer() {

        if (
            visualizerStarted ||
            !audioPlayer
        ) {
            return;
        }

        try {

            audioContext = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

            analyser =
                audioContext.createAnalyser();

            analyser.fftSize = 128;

            analyser.smoothingTimeConstant =
                0.75;

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


    function animateVisualizer() {

        if (!analyser) {
            return;
        }

        const frequencyData =
            new Uint8Array(
                analyser.frequencyBinCount
            );


        function updateBars() {

            requestAnimationFrame(
                updateBars
            );

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

        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            Math.floor(seconds % 60)
                .toString()
                .padStart(2, "0");

        return `${minutes}:${remainingSeconds}`;

    }


    /* =========================
       ACTUALIZAR BOTÓN PLAY
    ========================= */

    function updatePlayButton() {

        if (
            !mainPlayBtn ||
            !audioPlayer
        ) {
            return;
        }

        const icon =
            mainPlayBtn.querySelector("i");

        if (!icon) {
            return;
        }

        icon.className =
            audioPlayer.paused
                ? "bi bi-play-fill"
                : "bi bi-pause-fill";

    }


    function updatePlayerCover(image) {

        const playerCover =
            document.getElementById(
                "playerCover"
            );

        if (!playerCover) return;

        let imageElement =
            playerCover.querySelector("img");

        const icon =
            playerCover.querySelector("i");

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

            imageElement.src = image;
            imageElement.alt =
                "Portada de la canción";

            if (icon) {
                icon.style.display = "none";
            }

        } else {

            if (imageElement) {
                imageElement.remove();
            }

            if (icon) {
                icon.style.display = "flex";
            }

        }

    }


    /* =========================
       CARGAR CANCIÓN
    ========================= */

    function loadSong(
        index,
        autoplay = true
    ) {

        if (
            !songs[index] ||
            !audioPlayer
        ) {
            return;
        }

        currentSong = index;

        const song =
            songs[index];

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
            progressBar.value = 0;
        }

        if (currentTimeEl) {
            currentTimeEl.textContent =
                "0:00";
        }

        if (durationEl) {
            durationEl.textContent =
                "0:00";
        }

        if (autoplay) {

            setupAudioVisualizer();

            if (
                audioContext &&
                audioContext.state === "suspended"
            ) {

                audioContext.resume();

            }

            audioPlayer.play()
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

    if (
        mainPlayBtn &&
        audioPlayer
    ) {

        mainPlayBtn.addEventListener(
            "click",
            () => {

                setupAudioVisualizer();

                if (
                    audioContext &&
                    audioContext.state === "suspended"
                ) {

                    audioContext.resume();

                }

                if (
                    currentSong === -1
                ) {

                    if (
                        songs.length > 0
                    ) {

                        loadSong(
                            0,
                            true
                        );

                    }

                    return;

                }

                if (
                    audioPlayer.paused
                ) {

                    audioPlayer.play();

                } else {

                    audioPlayer.pause();

                }

            }
        );

    }


    if (audioPlayer) {

        audioPlayer.addEventListener(
            "play",
            updatePlayButton
        );

        audioPlayer.addEventListener(
            "pause",
            updatePlayButton
        );

    }


    /* =========================
       CARDS
    ========================= */

    cards.forEach(
        (card, index) => {

            card.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.closest(
                            ".more-button"
                        )
                    ) {
                        return;
                    }

                    loadSong(
                        index,
                        true
                    );

                }
            );

        }
    );


    /* =========================
       BOTONES PLAY
    ========================= */

    playButtons.forEach(
        (button, index) => {

            button.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    loadSong(
                        index,
                        true
                    );

                }
            );

        }
    );


    /* =========================
       SIGUIENTE
    ========================= */

    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            () => {

                if (
                    songs.length === 0
                ) {
                    return;
                }

                let nextSong =
                    currentSong + 1;

                if (
                    nextSong >=
                    songs.length
                ) {

                    nextSong = 0;

                }

                loadSong(
                    nextSong,
                    true
                );

            }
        );

    }


    /* =========================
       ANTERIOR
    ========================= */

    if (previousBtn) {

        previousBtn.addEventListener(
            "click",
            () => {

                if (
                    songs.length === 0
                ) {
                    return;
                }

                let previousSong =
                    currentSong - 1;

                if (
                    previousSong < 0
                ) {

                    previousSong =
                        songs.length - 1;

                }

                loadSong(
                    previousSong,
                    true
                );

            }
        );

    }


    /* =========================
       PROGRESO
    ========================= */

    if (audioPlayer) {

        audioPlayer.addEventListener(
            "loadedmetadata",
            () => {

                if (durationEl) {

                    durationEl.textContent =
                        formatTime(
                            audioPlayer.duration
                        );

                }

            }
        );


        audioPlayer.addEventListener(
            "timeupdate",
            () => {

                if (
                    !audioPlayer.duration
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

                if (currentTimeEl) {

                    currentTimeEl.textContent =
                        formatTime(
                            audioPlayer.currentTime
                        );

                }

            }
        );

    }


    if (
        progressBar &&
        audioPlayer
    ) {

        progressBar.addEventListener(
            "input",
            () => {

                if (
                    !audioPlayer.duration
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


    /* =========================
       VOLUMEN
    ========================= */

    if (
        audioPlayer &&
        volumeBar
    ) {

        audioPlayer.volume =
            volumeBar.value;

        volumeBar.addEventListener(
            "input",
            () => {

                audioPlayer.volume =
                    volumeBar.value;

            }
        );

    }


    /* =========================
       CUANDO TERMINA
    ========================= */

    if (audioPlayer) {

        audioPlayer.addEventListener(
            "ended",
            () => {

                if (
                    songs.length === 0
                ) {
                    return;
                }

                let nextSong =
                    currentSong + 1;

                if (
                    nextSong >=
                    songs.length
                ) {

                    nextSong = 0;

                }

                loadSong(
                    nextSong,
                    true
                );

            }
        );

    }


    /* =========================
       NAVBAR SCROLL
    ========================= */

    const navbar =
        document.getElementById(
            "mainNavbar"
        );


    if (navbar) {

        window.addEventListener(
            "scroll",
            () => {

                navbar.classList.toggle(
                    "scrolled",
                    window.scrollY > 50
                );

            }
        );

    }


    /* =========================
       PLANETAS — SELECTOR
    ========================= */

    const planetThemeButton =
        document.getElementById(
            "planetThemeButton"
        );

    const planetThemeMenu =
        document.getElementById(
            "planetThemeMenu"
        );

    const currentThemeName =
        document.getElementById(
            "currentThemeName"
        );

    const themeOptions =
        document.querySelectorAll(
            ".planet-theme-option"
        );

    const syncThemeCards =
        document.querySelectorAll(
            ".theme-sync-card"
        );


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

        themeOptions.forEach(
            (option) => {

                option.classList.toggle(
                    "active",
                    option.dataset.theme === theme
                );

            }
        );

        syncThemeCards.forEach(
            (card) => {

                card.classList.toggle(
                    "active-theme",
                    card.dataset.theme === theme
                );

            }
        );

        localStorage.setItem(
            "sonora-theme",
            theme
        );

    }


    const savedMusicTheme =
        localStorage.getItem(
            "sonora-theme"
        ) || "electronic";


    applyMusicTheme(
        savedMusicTheme
    );


    if (
        planetThemeButton &&
        planetThemeMenu
    ) {

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


        themeOptions.forEach(
            (option) => {

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

            }
        );


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


    syncThemeCards.forEach(
        (card) => {

            card.addEventListener(
                "click",
                () => {

                    applyMusicTheme(
                        card.dataset.theme
                    );

                }
            );

        }
    );


    /* =========================
       BUSCADOR
    ========================= */

    const openSearch =
        document.getElementById(
            "openSearch"
        );

    const closeSearch =
        document.getElementById(
            "closeSearch"
        );

    const searchOverlay =
        document.getElementById(
            "searchOverlay"
        );

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const searchResults =
        document.getElementById(
            "searchResults"
        );


    /* =========================================================
       CATÁLOGO DE CANCIONES DE EXPLORAR
    ========================================================= */

    let exploreSearchSongs = [];
    let exploreCatalogLoaded = false;
    let exploreCatalogLoading = null;


    /* =========================================================
       CARGAR CANCIONES DE EXPLORAR
    ========================================================= */

    async function loadExploreSearchCatalog() {

        if (exploreCatalogLoaded) {
            return exploreSearchSongs;
        }

        if (exploreCatalogLoading) {
            return exploreCatalogLoading;
        }

        exploreCatalogLoading =
            fetch("explorar.html")
                .then(response => {

                    if (!response.ok) {

                        throw new Error(
                            "No se pudo cargar explorar.html"
                        );

                    }

                    return response.text();

                })
                .then(html => {

                    const parser =
                        new DOMParser();

                    const documentHTML =
                        parser.parseFromString(
                            html,
                            "text/html"
                        );

                    const cards =
                        documentHTML.querySelectorAll(
                            ".explore-song-card"
                        );

                    exploreSearchSongs =
                        Array.from(cards).map(
                            card => ({

                                title:
                                    card.dataset.title ||
                                    card.querySelector("h3")?.textContent.trim() ||
                                    "Canción",

                                artist:
                                    card.dataset.artist ||
                                    card.querySelector("p")?.textContent.trim() ||
                                    "Artista",

                                genre:
                                    card.dataset.genre ||
                                    card.querySelector(".song-genre")?.textContent.trim() ||
                                    "",

                                audio:
                                    card.dataset.audio ||
                                    "",

                                image:
                                    card.dataset.image ||
                                    card.querySelector("img")?.src ||
                                    "",

                                source:
                                    "explore"

                            })
                        );

                    exploreCatalogLoaded =
                        true;

                    return exploreSearchSongs;

                })
                .catch(error => {

                    console.error(
                        "Error cargando canciones de Explorar:",
                        error
                    );

                    exploreSearchSongs = [];

                    return [];

                })
                .finally(() => {

                    exploreCatalogLoading =
                        null;

                });

        return exploreCatalogLoading;

    }


    /* =========================================================
       CERRAR BUSCADOR
    ========================================================= */

    function closeSearchOverlay() {

        if (!searchOverlay) {
            return;
        }

        searchOverlay.classList.remove(
            "show"
        );

        if (searchInput) {
            searchInput.value = "";
        }

        if (searchResults) {
            searchResults.innerHTML = "";
        }

    }


    /* =========================================================
       MOSTRAR RESULTADOS
    ========================================================= */

    async function updateSearchResults() {

        if (
            !searchInput ||
            !searchResults
        ) {
            return;
        }

        const query =
            searchInput.value
                .trim()
                .toLowerCase();

        searchResults.innerHTML = "";

        if (!query) {
            return;
        }


        /* -----------------------------------------------------
           CANCIONES DE INICIO
        ----------------------------------------------------- */

        const homeSongs =
            songs.map(
                (song, index) => ({

                    ...song,

                    source:
                        "home",

                    index

                })
            );


        /* -----------------------------------------------------
           CANCIONES DE EXPLORAR
        ----------------------------------------------------- */

        const exploreSongs =
            await loadExploreSearchCatalog();


        /* -----------------------------------------------------
           UNIR TODOS LOS RESULTADOS
        ----------------------------------------------------- */

        const allSongs = [
            ...homeSongs,
            ...exploreSongs
        ];


        /* -----------------------------------------------------
           EVITAR CANCIONES DUPLICADAS
        ----------------------------------------------------- */

        const uniqueSongs = [];

        const usedSongs =
            new Set();


        allSongs.forEach(song => {

            const key =
                `${song.title}`
                    .toLowerCase()
                    .trim()
                +
                "|"
                +
                `${song.artist}`
                    .toLowerCase()
                    .trim();

            if (
                !usedSongs.has(key)
            ) {

                usedSongs.add(key);

                uniqueSongs.push(
                    song
                );

            }

        });


        /* -----------------------------------------------------
           FILTRAR
        ----------------------------------------------------- */

        const results =
            uniqueSongs.filter(
                song => {

                    const title =
                        (
                            song.title ||
                            ""
                        )
                            .toLowerCase();

                    const artist =
                        (
                            song.artist ||
                            ""
                        )
                            .toLowerCase();

                    const genre =
                        (
                            song.genre ||
                            ""
                        )
                            .toLowerCase();

                    return (
                        title.includes(query) ||
                        artist.includes(query) ||
                        genre.includes(query)
                    );

                }
            );


        /* -----------------------------------------------------
           SIN RESULTADOS
        ----------------------------------------------------- */

        if (!results.length) {

            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="bi bi-search"></i>
                    <p>No encontramos canciones</p>
                </div>
            `;

            return;
        }


        /* -----------------------------------------------------
           CREAR RESULTADOS
        ----------------------------------------------------- */

        results.forEach(song => {

            const result =
                document.createElement(
                    "div"
                );

            result.className =
                "search-result";


            result.innerHTML = `

                ${
                    song.image
                        ? `
                            <img
                                src="${song.image}"
                                alt="${song.title}"
                            >
                        `
                        : `
                            <div class="search-result-placeholder">
                                <i class="bi bi-music-note"></i>
                            </div>
                        `
                }

                <div class="search-result-info">

                    <strong>
                        ${song.title}
                    </strong>

                    <small>
                        ${song.artist}
                    </small>

                </div>

                ${
                    song.genre
                        ? `
                            <span class="search-result-genre">
                                ${song.genre}
                            </span>
                        `
                        : ""
                }

                <button
                    class="search-result-play"
                    type="button"
                    aria-label="Reproducir ${song.title}"
                >
                    <i class="bi bi-play-fill"></i>
                </button>

            `;


            /* -------------------------------------------------
               REPRODUCIR RESULTADO
            ------------------------------------------------- */

            result.addEventListener(
                "click",
                async event => {

                    event.preventDefault();

                    event.stopPropagation();


                    /* -----------------------------------------
                       CANCIÓN DE INICIO
                    ----------------------------------------- */

                    if (
                        song.source ===
                        "home"
                    ) {

                        loadSong(
                            song.index,
                            true
                        );

                    }


                    /* -----------------------------------------
                       CANCIÓN DE EXPLORAR
                    ----------------------------------------- */

                    else if (
                        song.source ===
                        "explore"
                    ) {

                        if (
                            !audioPlayer
                        ) {
                            return;
                        }

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


                        if (
                            typeof updatePlayerCover ===
                            "function"
                        ) {

                            updatePlayerCover(
                                song.image
                            );

                        }


                        try {

                            await audioPlayer.play();

                        } catch (error) {

                            console.warn(
                                "El navegador bloqueó la reproducción automática.",
                                error
                            );

                        }

                    }


                    /* -----------------------------------------
                       CERRAR BUSCADOR
                    ----------------------------------------- */

                    closeSearchOverlay();

                }
            );


            searchResults.appendChild(
                result
            );

        });

    }


    /* =========================================================
       ABRIR BUSCADOR
    ========================================================= */

    if (
        openSearch &&
        closeSearch &&
        searchOverlay &&
        searchInput &&
        searchResults
    ) {

        openSearch.addEventListener(
            "click",
            async () => {

                searchOverlay.classList.add(
                    "show"
                );

                searchInput.focus();

                loadExploreSearchCatalog();

            }
        );


        /* =====================================================
           CERRAR CON X
        ===================================================== */

        closeSearch.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                closeSearchOverlay();

            }
        );


        /* =====================================================
           CERRAR AL HACER CLIC EN EL FONDO
        ===================================================== */

        searchOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    searchOverlay
                ) {

                    closeSearchOverlay();

                }

            }
        );


        /* =====================================================
           BUSCAR
        ===================================================== */

        searchInput.addEventListener(
            "input",
            () => {

                updateSearchResults();

            }
        );


        /* =====================================================
           ESC PARA CERRAR
        ===================================================== */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    searchOverlay.classList.contains(
                        "show"
                    )
                ) {

                    closeSearchOverlay();

                }

            }
        );

    }


    /* =========================================================
       FAVORITOS — SUPABASE
    ========================================================= */

    let userFavorites = new Set();


    /* ---------------------------------------------------------
       ESTILOS VISUALES DE FAVORITOS
    --------------------------------------------------------- */

    if (
        !document.getElementById(
            "sonoraFavoriteStyles"
        )
    ) {

        const favoriteStyles =
            document.createElement(
                "style"
            );

        favoriteStyles.id =
            "sonoraFavoriteStyles";

        favoriteStyles.textContent = `

            .favorite-song-btn {
                transition:
                    transform 0.18s ease,
                    opacity 0.18s ease;
            }

            .favorite-song-btn.is-favorite {
                transform: scale(1.05);
            }

            .favorite-song-btn.favorite-pop {
                animation:
                    sonoraFavoritePop 0.35s ease;
            }

            .favorite-song-btn.favorite-saving {
                pointer-events: none;
                opacity: 0.55;
            }

            .favorite-song-btn i {
                transition:
                    transform 0.18s ease;
            }

            .favorite-song-btn.is-favorite i {
                transform: scale(1.12);
            }

            @keyframes sonoraFavoritePop {

                0% {
                    transform: scale(1);
                }

                45% {
                    transform: scale(1.28);
                }

                75% {
                    transform: scale(0.92);
                }

                100% {
                    transform: scale(1.05);
                }

            }

        `;

        document.head.appendChild(
            favoriteStyles
        );

    }


    /* ---------------------------------------------------------
       IDENTIFICADOR ÚNICO DE LA CANCIÓN
    --------------------------------------------------------- */

    function getSongKey(song) {

        if (!song) {
            return "";
        }

        return [
            song.title || "",
            song.artist || "",
            song.audio || ""
        ].join("|");

    }


    /* ---------------------------------------------------------
       OBTENER DATOS DE UNA TARJETA
    --------------------------------------------------------- */

    function getSongFromCard(card) {

        if (!card) {
            return null;
        }

        return {

            title:
                card.dataset.title ||
                "",

            artist:
                card.dataset.artist ||
                "",

            audio:
                card.dataset.audio ||
                "",

            image:
                card.dataset.image ||
                "",

            genre:
                card.dataset.genre ||
                ""

        };

    }


    /* ---------------------------------------------------------
       CARGAR FAVORITOS DESDE SUPABASE
    --------------------------------------------------------- */

    async function loadFavorites() {

        userFavorites.clear();

        if (!currentUser) {

            updateFavoriteButtons();

            return;

        }

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("favorites")
                    .select("song_key")
                    .eq(
                        "user_id",
                        currentUser.id
                    );


            if (error) {

                console.error(
                    "Error cargando favoritos:",
                    error
                );

                return;

            }


            if (data) {

                data.forEach(
                    favorite => {

                        if (
                            favorite.song_key
                        ) {

                            userFavorites.add(
                                favorite.song_key
                            );

                        }

                    }
                );

            }


            updateFavoriteButtons();

            

        } catch (error) {

            console.error(
                "Error inesperado cargando favoritos:",
                error
            );

        }

    }

    async function updateProfileStats() {

    const favoritesElement =
        document.getElementById("profileFavorites");

    if (!favoritesElement) return;

    if (!currentUser) {
        favoritesElement.textContent = "0";
        return;
    }

    try {

        const { count, error } =
            await supabaseClient
                .from("favorites")
                .select("id", {
                    count: "exact",
                    head: true
                })
                .eq(
                    "user_id",
                    currentUser.id
                );

        if (error) {
            console.error(
                "Error obteniendo cantidad de favoritos:",
                error
            );
            return;
        }

        favoritesElement.textContent =
            count ?? 0;

    } catch (error) {

        console.error(
            "Error inesperado actualizando estadísticas:",
            error
        );

    }
}

    /* ---------------------------------------------------------
       ACTUALIZAR TODOS LOS CORAZONES
    --------------------------------------------------------- */

    function updateFavoriteButtons() {

        const buttons =
            document.querySelectorAll(
                ".favorite-song-btn"
            );


        buttons.forEach(
            button => {

                const card =
                    button.closest(
                        ".explore-song-card"
                    );

                if (!card) {
                    return;
                }


                const song =
                    getSongFromCard(
                        card
                    );

                const songKey =
                    getSongKey(
                        song
                    );

                const icon =
                    button.querySelector(
                        "i"
                    );


                if (
                    userFavorites.has(
                        songKey
                    )
                ) {

                    button.classList.add(
                        "is-favorite"
                    );

                    button.setAttribute(
                        "aria-label",
                        "Quitar de favoritos"
                    );

                    button.setAttribute(
                        "title",
                        "Quitar de favoritos"
                    );


                    if (icon) {

                        icon.className =
                            "bi bi-heart-fill";

                    }

                } else {

                    button.classList.remove(
                        "is-favorite"
                    );

                    button.setAttribute(
                        "aria-label",
                        "Agregar a favoritos"
                    );

                    button.setAttribute(
                        "title",
                        "Agregar a favoritos"
                    );


                    if (icon) {

                        icon.className =
                            "bi bi-heart";

                    }

                }

            }
        );

    }


    /* ---------------------------------------------------------
       EFECTO VISUAL DEL CORAZÓN
    --------------------------------------------------------- */

    function animateFavoriteButton(
        button,
        isFavorite
    ) {

        if (!button) {
            return;
        }

        button.classList.remove(
            "favorite-pop"
        );

        void button.offsetWidth;

        if (isFavorite) {

            button.classList.add(
                "is-favorite"
            );

        }

        button.classList.add(
            "favorite-pop"
        );

        setTimeout(
            () => {

                button.classList.remove(
                    "favorite-pop"
                );

            },
            400
        );

    }


    /* ---------------------------------------------------------
       AGREGAR / QUITAR FAVORITO
    --------------------------------------------------------- */

    async function toggleFavorite(
        card,
        button = null
    ) {

        if (!card) {
            return;
        }


        if (!currentUser) {

            alert(
                "Debes iniciar sesión para guardar canciones en favoritos."
            );

            return;

        }


        const song =
            getSongFromCard(
                card
            );


        if (!song) {
            return;
        }


        const songKey =
            getSongKey(
                song
            );


        if (!songKey) {

            console.error(
                "No se pudo identificar la canción."
                
            );

            return;

        }


        /* EVITAR DOBLE CLIC */

        if (button) {

            if (
                button.classList.contains(
                    "favorite-saving"
                )
            ) {

                return;

            }

            button.classList.add(
                "favorite-saving"
            );

        }


        try {

            /* -------------------------------------------------
               QUITAR FAVORITO
            ------------------------------------------------- */

            if (
                userFavorites.has(
                    songKey
                )
            ) {

                const {
                    error
                } =
                    await supabaseClient
                        .from("favorites")
                        .delete()
                        .eq(
                            "user_id",
                            currentUser.id
                        )
                        .eq(
                            "song_key",
                            songKey
                        );


                if (error) {
                    throw error;
                }


                userFavorites.delete(
                    songKey
                );


                updateFavoriteButtons();
updateProfileStats();


                if (button) {

                    animateFavoriteButton(
                        button,
                        false
                    );

                }

            }


            /* -------------------------------------------------
               AGREGAR FAVORITO
            ------------------------------------------------- */

            else {

                const {
                    error
                } =
                    await supabaseClient
                        .from("favorites")
                        .insert({

                            user_id:
                                currentUser.id,

                            song_key:
                                songKey,

                            title:
                                song.title,

                            artist:
                                song.artist,

                            audio:
                                song.audio,

                            image:
                                song.image,

                            genre:
                                song.genre

                        });


                if (error) {
                    throw error;
                }


               userFavorites.add(
    songKey
);

updateFavoriteButtons();

await updateProfileStats();


if (button) {

    animateFavoriteButton(
        button,
        true
    );

}

            }


            


        } catch (error) {

            console.error(
                "Error actualizando favorito:",
                error
            );


            if (
                error?.code ===
                "23505"
            ) {

                /*
                 * Si ya existe en Supabase,
                 * sincronizamos el estado local.
                 */

                userFavorites.add(
                    songKey
                );

                updateFavoriteButtons();

            } else {

                alert(
                    "No se pudo actualizar el favorito."
                );

            }

        } finally {

            if (button) {

                button.classList.remove(
                    "favorite-saving"
                );

            }

        }

    }


    /* ---------------------------------------------------------
       CLIC EN FAVORITOS
       CAPTURA ANTES DEL EVENTO DE LA TARJETA
    --------------------------------------------------------- */

    function setupFavoriteButtons() {

        if (
            window.favoriteButtonsReady
        ) {
            return;
        }


        window.favoriteButtonsReady =
            true;


        document.addEventListener(
            "click",
            async function(event) {

                const button =
                    event.target.closest(
                        ".favorite-song-btn"
                    );


                if (!button) {
                    return;
                }


                /*
                 * IMPORTANTE:
                 * detener aquí evita que el evento
                 * llegue al click de la tarjeta.
                 */

                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();


                const card =
                    button.closest(
                        ".explore-song-card"
                    );


                if (!card) {
                    return;
                }


                await toggleFavorite(
                    card,
                    button
                );

            },
            true
        );

    }


    /* ---------------------------------------------------------
       OBSERVAR TARJETAS DINÁMICAS
    --------------------------------------------------------- */

    const favoriteObserver =
        new MutationObserver(
            () => {

                updateFavoriteButtons();

            }
        );


    if (document.body) {

        favoriteObserver.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

    }


    /* =========================
       LOGIN / REGISTRO
    ========================= */

    const loginButton =
        document.getElementById(
            "loginButton"
        );

    const authOverlay =
        document.getElementById(
            "authOverlay"
        );

    const authClose =
        document.getElementById(
            "authClose"
        );

    const authForm =
        document.getElementById(
            "authForm"
        );

    const authTitle =
        document.getElementById(
            "authTitle"
        );

    const authSubtitle =
        document.getElementById(
            "authSubtitle"
        );

    const authSubmit =
        document.getElementById(
            "authSubmit"
        );

    const authSwitch =
        document.getElementById(
            "authSwitch"
        );

    const authSwitchText =
        document.getElementById(
            "authSwitchText"
        );

    const authMessage =
        document.getElementById(
            "authMessage"
        );


    /* =========================
       ELEMENTOS DEL PERFIL
    ========================= */

    const profileOverlay =
        document.getElementById(
            "profileOverlay"
        );

    const profileClose =
        document.getElementById(
            "profileClose"
        );

    const profileEmail =
        document.getElementById(
            "profileEmail"
        );

    const profileName =
        document.getElementById(
            "profileName"
        );

    const profileDate =
        document.getElementById(
            "profileDate"
        );

    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );

    const editProfileButton =
        document.getElementById(
            "editProfileButton"
        );

    const profileEditSection =
        document.getElementById(
            "profileEditSection"
        );

    const profileUsername =
        document.getElementById(
            "profileUsername"
        );

    const profileAvatarUrl =
        document.getElementById(
            "profileAvatarUrl"
        );

    const changeAvatarButton =
        document.getElementById(
            "changeAvatarButton"
        );

    const avatarFileInput =
        document.getElementById(
            "avatarFileInput"
        );


    const profileMessage =
        document.getElementById(
            "profileMessage"
        );


    /* =========================
       SUBIR AVATAR A SUPABASE
    ========================= */

    if (avatarFileInput) {

        avatarFileInput.addEventListener(
            "change",
            async () => {

                const file =
                    avatarFileInput.files[0];

                if (!file) {
                    return;
                }


                /* VALIDAR TIPO */

                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];


                if (
                    !allowedTypes.includes(
                        file.type
                    )
                ) {

                    if (profileMessage) {

                        profileMessage.textContent =
                            "Solo se permiten imágenes JPG, PNG o WEBP.";

                    }

                    avatarFileInput.value =
                        "";

                    return;

                }


                /* VALIDAR TAMAÑO — 1 MB */

                const maxSize =
                    1 * 1024 * 1024;


                if (
                    file.size > maxSize
                ) {

                    if (profileMessage) {

                        profileMessage.textContent =
                            "La imagen no puede superar 1 MB.";

                    }

                    avatarFileInput.value =
                        "";

                    return;

                }


                /* COMPROBAR USUARIO */

                const {
                    data: { user },
                    error: userError
                } =
                    await supabaseClient.auth
                        .getUser();


                if (
                    userError ||
                    !user
                ) {

                    if (profileMessage) {

                        profileMessage.textContent =
                            "Debes iniciar sesión para cambiar tu avatar.";

                    }

                    return;

                }


                if (profileMessage) {

                    profileMessage.textContent =
                        "Subiendo imagen...";

                }


                try {

                    /* NOMBRE ÚNICO */

                    const fileExtension =
                        file.name
                            .split(".")
                            .pop()
                            .toLowerCase();


                    const filePath =
                        `${user.id}/avatar-${Date.now()}.${fileExtension}`;


                    /* SUBIR A STORAGE */

                    const {
                        error: uploadError
                    } =
                        await supabaseClient.storage
                            .from("Viltrum")
                            .upload(
                                filePath,
                                file,
                                {
                                    cacheControl:
                                        "3600",
                                    upsert:
                                        false
                                }
                            );


                    if (uploadError) {
                        throw uploadError;
                    }


                    /* OBTENER URL PÚBLICA */

                    const {
                        data: publicUrlData
                    } =
                        supabaseClient.storage
                            .from("Viltrum")
                            .getPublicUrl(
                                filePath
                            );


                    const avatarUrl =
                        publicUrlData.publicUrl;


                    /* GUARDAR URL EN PROFILE */

                    const {
                        error: profileError
                    } =
                        await supabaseClient
                            .from("profiles")
                            .update({
                                avatar_url:
                                    avatarUrl
                            })
                            .eq(
                                "id",
                                user.id
                            );


                    if (profileError) {
                        throw profileError;
                    }


                    /* MOSTRAR AVATAR */

                    updateProfileAvatar(
                        avatarUrl
                    );

                    updateNavbarAvatar(
                        avatarUrl,
                        true
                    );


                    /* ACTUALIZAR CAMPO URL */

                    if (profileAvatarUrl) {

                        profileAvatarUrl.value =
                            avatarUrl;

                    }


                    if (profileMessage) {

                        profileMessage.textContent =
                            "¡Avatar actualizado!";

                    }

                } catch (error) {

                    console.error(
                        "Error al subir avatar:",
                        error
                    );


                    if (profileMessage) {

                        profileMessage.textContent =
                            "No se pudo subir el avatar.";

                    }

                } finally {

                    avatarFileInput.value =
                        "";

                }

            }
        );

    }


    const saveProfileButton =
        document.getElementById(
            "saveProfileButton"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const loginButtonContent =
        document.getElementById(
            "loginButtonContent"
        );

    let registerMode = false;


    /* =========================
       CARGAR PERFIL
    ========================= */

    async function loadUserProfile(user) {

        if (!user) {
            return;
        }


        if (profileEmail) {

            profileEmail.textContent =
                user.email || "-";

        }


        if (
            profileDate &&
            user.created_at
        ) {

            const createdAt =
                new Date(
                    user.created_at
                );

            profileDate.textContent =
                createdAt.toLocaleDateString(
                    "es-SV",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );

        }


        const defaultUsername =
            user.email
                ? user.email.split("@")[0]
                : "Usuario";


        if (profileName) {

            profileName.textContent =
                defaultUsername;

        }


        if (profileUsername) {

            profileUsername.value =
                defaultUsername;

        }


        if (profileAvatarUrl) {

            profileAvatarUrl.value =
                "";

        }


        updateProfileAvatar("");


        try {

            const {
                data: profile,
                error
            } =
                await supabaseClient
                    .from("profiles")
                    .select(
                        "username, avatar_url"
                    )
                    .eq(
                        "id",
                        user.id
                    )
                    .maybeSingle();


            if (error) {

                console.error(
                    "Error al cargar el perfil:",
                    error
                );

                return;

            }


            if (
                profile &&
                profile.username
            ) {

                if (profileName) {

                    profileName.textContent =
                        profile.username;

                }

                if (profileUsername) {

                    profileUsername.value =
                        profile.username;

                }

            }


            if (
                profile &&
                profile.avatar_url
            ) {

                if (profileAvatarUrl) {

                    profileAvatarUrl.value =
                        profile.avatar_url;

                }

                updateProfileAvatar(
                    profile.avatar_url
                );

                updateNavbarAvatar(
                    profile.avatar_url,
                    true
                );

            } else {

                updateNavbarAvatar(
                    null,
                    true
                );

            }

        } catch (error) {

            console.error(
                "Error inesperado al cargar perfil:",
                error
            );

        }

    }


    /* =========================
       MOSTRAR AVATAR
    ========================= */

    function updateProfileAvatar(url) {

        if (!profileAvatar) {
            return;
        }


        profileAvatar.innerHTML = "";


        if (
            url &&
            url.trim()
        ) {

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                url.trim();

            image.alt =
                "Avatar";


            image.onerror = () => {

                profileAvatar.innerHTML =
                    `<i class="bi bi-person-fill"></i>`;

            };


            profileAvatar.appendChild(
                image
            );

        } else {

            profileAvatar.innerHTML =
                `<i class="bi bi-person-fill"></i>`;

        }

    }


    /* =========================
       AVATAR EN LA NAVBAR
    ========================= */

    function updateNavbarAvatar(
        url,
        loggedIn = false
    ) {

        if (
            !loginButton ||
            !loginButtonContent
        ) {
            return;
        }


        loginButtonContent.innerHTML = `

            <span class="navbar-profile-content">

                ${
                    url && url.trim()
                        ? `
                            <img
                                src="${url.trim()}"
                                alt="Avatar"
                                class="navbar-avatar"
                            >
                        `
                        : `
                            <i class="bi bi-person-circle navbar-default-avatar"></i>
                        `
                }

                <span class="navbar-profile-text">
                    ${
                        loggedIn
                            ? "Mi perfil"
                            : "Iniciar sesión"
                    }
                </span>

            </span>

        `;

    }


    /* =========================
       BOTÓN LOGIN / PERFIL
    ========================= */

    if (loginButton) {

        loginButton.addEventListener(
            "click",
            async () => {

                try {

                    const {
                        data: { session }
                    } =
                        await supabaseClient.auth
                            .getSession();


                    if (
                        session &&
                        session.user
                    ) {

                        if (authOverlay) {

                            authOverlay.classList.remove(
                                "show"
                            );

                        }


                        await loadUserProfile(
                            session.user
                        );


                        if (profileMessage) {

                            profileMessage.textContent =
                                "";

                        }


                        if (profileEditSection) {

                            profileEditSection.style.display =
                                "none";

                        }


                        if (editProfileButton) {

                            editProfileButton.innerHTML = `
                                <i class="bi bi-pencil"></i>
                                Editar perfil
                            `;

                        }


                        if (profileOverlay) {

                            profileOverlay.classList.add(
                                "show"
                            );

                        }

                    } else {

                        if (profileOverlay) {

                            profileOverlay.classList.remove(
                                "show"
                            );

                        }


                        if (authMessage) {

                            authMessage.textContent =
                                "";

                        }


                        if (authOverlay) {

                            authOverlay.classList.add(
                                "show"
                            );

                        }

                    }

                } catch (error) {

                    console.error(
                        "Error al comprobar sesión:",
                        error
                    );

                }

            }
        );

    }


    /* =========================
       CERRAR LOGIN
    ========================= */

    if (
        authClose &&
        authOverlay
    ) {

        authClose.addEventListener(
            "click",
            () => {

                authOverlay.classList.remove(
                    "show"
                );

            }
        );

    }


    if (authOverlay) {

        authOverlay.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    authOverlay
                ) {

                    authOverlay.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    /* =========================
       CAMBIAR LOGIN / REGISTRO
    ========================= */

    if (authSwitch) {

        authSwitch.addEventListener(
            "click",
            () => {

                registerMode =
                    !registerMode;


                if (authMessage) {

                    authMessage.textContent =
                        "";

                }


                if (registerMode) {

                    if (authTitle) {

                        authTitle.textContent =
                            "Crear cuenta";

                    }

                    if (authSubtitle) {

                        authSubtitle.textContent =
                            "Únete a SONORA";

                    }

                    if (authSubmit) {

                        authSubmit.textContent =
                            "Registrarse";

                    }

                    if (authSwitchText) {

                        authSwitchText.textContent =
                            "¿Ya tienes una cuenta?";

                    }

                    authSwitch.textContent =
                        "Iniciar sesión";

                } else {

                    if (authTitle) {

                        authTitle.textContent =
                            "Iniciar sesión";

                    }

                    if (authSubtitle) {

                        authSubtitle.textContent =
                            "Entra a tu cuenta de SONORA";

                    }

                    if (authSubmit) {

                        authSubmit.textContent =
                            "Iniciar sesión";

                    }

                    if (authSwitchText) {

                        authSwitchText.textContent =
                            "¿No tienes una cuenta?";

                    }

                    authSwitch.textContent =
                        "Registrarse";

                }

            }
        );

    }


    /* =========================
       REGISTRO / INICIO DE SESIÓN
    ========================= */

    if (authForm) {

        authForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const emailInput =
                    document.getElementById(
                        "authEmail"
                    );

                const passwordInput =
                    document.getElementById(
                        "authPassword"
                    );


                const email =
                    emailInput
                        ? emailInput.value.trim()
                        : "";


                const password =
                    passwordInput
                        ? passwordInput.value
                        : "";


                if (
                    !email ||
                    !password
                ) {
                    return;
                }


                if (authMessage) {

                    authMessage.textContent =
                        "Procesando...";

                }


                if (authSubmit) {

                    authSubmit.disabled =
                        true;

                }


                try {

                    if (registerMode) {

                        const {
                            error
                        } =
                            await supabaseClient
                                .auth
                                .signUp({

                                    email:
                                        email,

                                    password:
                                        password,

                                    options: {

                                        emailRedirectTo:
                                            "https://viltrum-hub.github.io/Musica/"

                                    }

                                });


                        if (error) {
                            throw error;
                        }


                        if (authMessage) {

                            authMessage.textContent =
                                "Cuenta creada correctamente. Revisa tu correo para confirmar tu cuenta.";

                        }

                    } else {

                        const {
                            data,
                            error
                        } =
                            await supabaseClient
                                .auth
                                .signInWithPassword({

                                    email:
                                        email,

                                    password:
                                        password

                                });


                        if (error) {
                            throw error;
                        }


                        if (authMessage) {

                            authMessage.textContent =
                                "¡Bienvenido a SONORA!";

                        }


                        setTimeout(
                            async () => {

                                if (authOverlay) {

                                    authOverlay.classList.remove(
                                        "show"
                                    );

                                }


                                authForm.reset();


                                if (authMessage) {

                                    authMessage.textContent =
                                        "";

                                }


                                await updateUserInterface(
                                    data.session
                                );

                            },
                            1000
                        );

                    }

                } catch (error) {

                    console.error(
                        "Error de autenticación:",
                        error
                    );


                    if (authMessage) {

                        authMessage.textContent =
                            error.message;

                    }

                } finally {

                    if (authSubmit) {

                        authSubmit.disabled =
                            false;

                    }

                }

            }
        );

    }


    /* =========================
       ACTUALIZAR INTERFAZ
    ========================= */

    async function updateUserInterface(
        session
    ) {

        if (
            session &&
            session.user
        ) {

            currentUser =
                session.user;


            await loadUserProfile(
                session.user
            );


            await loadFavorites();
            await updateProfileStats();


            

        } else {

            currentUser =
                null;


            userFavorites.clear();


            updateFavoriteButtons();


            await updateProfileStats();


            updateNavbarAvatar(
                null,
                false
            );

        }

    }


    /* =========================
       CERRAR PERFIL
    ========================= */

    if (
        profileClose &&
        profileOverlay
    ) {

        profileClose.addEventListener(
            "click",
            () => {

                profileOverlay.classList.remove(
                    "show"
                );

            }
        );

    }


    if (profileOverlay) {

        profileOverlay.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    profileOverlay
                ) {

                    profileOverlay.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    /* =========================
       EDITAR PERFIL
    ========================= */

    if (
        editProfileButton &&
        profileEditSection
    ) {

        editProfileButton.addEventListener(
            "click",
            () => {

                const isEditing =
                    profileEditSection.style.display ===
                    "block";


                if (isEditing) {

                    profileEditSection.style.display =
                        "none";


                    editProfileButton.innerHTML = `
                        <i class="bi bi-pencil"></i>
                        Editar perfil
                    `;


                    if (profileMessage) {

                        profileMessage.textContent =
                            "";

                    }

                } else {

                    profileEditSection.style.display =
                        "block";


                    editProfileButton.innerHTML = `
                        <i class="bi bi-x-lg"></i>
                        Cancelar
                    `;


                    if (
                        profileUsername &&
                        profileName
                    ) {

                        profileUsername.value =
                            profileName.textContent.trim();

                    }


                    if (profileUsername) {

                        setTimeout(
                            () => {

                                profileUsername.focus();

                            },
                            50
                        );

                    }

                }

            }
        );

    }


    /* =========================
       CAMBIAR AVATAR
    ========================= */

    if (changeAvatarButton) {

        changeAvatarButton.addEventListener(
            "click",
            () => {

                if (avatarFileInput) {

                    avatarFileInput.click();

                }


                if (profileEditSection) {

                    profileEditSection.style.display =
                        "block";

                }


                if (editProfileButton) {

                    editProfileButton.innerHTML = `
                        <i class="bi bi-x-lg"></i>
                        Cancelar
                    `;

                }

            }
        );

    }


    /* =========================
       PREVISUALIZAR AVATAR
    ========================= */

    if (profileAvatarUrl) {

        profileAvatarUrl.addEventListener(
            "input",
            () => {

                updateProfileAvatar(
                    profileAvatarUrl.value.trim()
                );

            }
        );

    }


    /* =========================
       GUARDAR PERFIL
    ========================= */

    if (
        saveProfileButton &&
        profileUsername &&
        profileAvatarUrl
    ) {

        saveProfileButton.addEventListener(
            "click",
            async () => {

                const username =
                    profileUsername.value.trim();

                const avatarUrl =
                    profileAvatarUrl.value.trim();


                if (!username) {

                    if (profileMessage) {

                        profileMessage.textContent =
                            "Escribe un nombre de usuario.";

                    }

                    profileUsername.focus();

                    return;

                }


                if (
                    username.length < 3
                ) {

                    if (profileMessage) {

                        profileMessage.textContent =
                            "El nombre debe tener al menos 3 caracteres.";

                    }

                    profileUsername.focus();

                    return;

                }


                const {
                    data: { user }
                } =
                    await supabaseClient.auth
                        .getUser();


                if (!user) {

                    if (profileMessage) {

                        profileMessage.textContent =
                            "No hay una sesión activa.";

                    }

                    return;

                }


                saveProfileButton.disabled =
                    true;


                if (profileMessage) {

                    profileMessage.textContent =
                        "Guardando...";

                }


                try {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("profiles")
                            .update({

                                username:
                                    username,

                                avatar_url:
                                    avatarUrl ||
                                    null

                            })
                            .eq(
                                "id",
                                user.id
                            );


                    if (error) {
                        throw error;
                    }


                    if (profileName) {

                        profileName.textContent =
                            username;

                    }


                    updateProfileAvatar(
                        avatarUrl
                    );


                    updateNavbarAvatar(
                        avatarUrl,
                        true
                    );


                    if (profileMessage) {

                        profileMessage.textContent =
                            "¡Perfil actualizado!";

                    }


                    if (profileEditSection) {

                        profileEditSection.style.display =
                            "none";

                    }


                    if (editProfileButton) {

                        editProfileButton.innerHTML = `
                            <i class="bi bi-pencil"></i>
                            Editar perfil
                        `;

                    }

                } catch (error) {

                    console.error(
                        "Error al guardar perfil:",
                        error
                    );


                    if (profileMessage) {

                        profileMessage.textContent =
                            "No se pudo guardar el cambio.";

                    }

                } finally {

                    saveProfileButton.disabled =
                        false;

                }

            }
        );

    }


    /* =========================
       CERRAR SESIÓN
    ========================= */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                const {
                    error
                } =
                    await supabaseClient.auth
                        .signOut();


                if (error) {

                    console.error(
                        "Error al cerrar sesión:",
                        error
                    );

                    return;

                }


                if (profileOverlay) {

                    profileOverlay.classList.remove(
                        "show"
                    );

                }


                updateUserInterface(
                    null
                );

            }
        );

    }


    /* =========================
       ESC — CERRAR MODALES
    ========================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            if (searchOverlay) {

                searchOverlay.classList.remove(
                    "show"
                );

            }


            if (authOverlay) {

                authOverlay.classList.remove(
                    "show"
                );

            }


            if (profileOverlay) {

                profileOverlay.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =========================
       COMPROBAR SESIÓN
    ========================= */

    async function checkUserSession() {

        try {

            const {
                data: { session }
            } =
                await supabaseClient.auth
                    .getSession();


            await updateUserInterface(
                session
            );

        } catch (error) {

            console.error(
                "Error comprobando sesión:",
                error
            );

        }

    }


    /* =========================
       CAMBIOS DE SESIÓN
    ========================= */

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            updateUserInterface(
                session
            );

        }
    );


    /* =========================
       INICIAR
    ========================= */

    checkUserSession();

    setupFavoriteButtons();

    loadFavorites();

    

});