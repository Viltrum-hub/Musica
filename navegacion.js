document.addEventListener("DOMContentLoaded", () => {

    const mainHome = document.getElementById("mainHome");
    const pageContainer = document.getElementById("pageContainer");

    const navbarLinks = document.querySelectorAll(
        ".navbar-nav .nav-link"
    );

    let navigationRequest = 0;
    function showNavigationError(page) {
        mainHome.style.display = "none";
        const section = document.createElement("section");
        section.className = "page-load-error"; section.setAttribute("role", "alert");
        const title = document.createElement("h1"); title.textContent = "No pudimos abrir este apartado";
        const copy = document.createElement("p"); copy.textContent = "Revisa tu conexión y vuelve a intentarlo.";
        const retry = document.createElement("button"); retry.type = "button";
        retry.dataset.page = page; retry.textContent = "Reintentar";
        section.append(title, copy, retry); pageContainer.replaceChildren(section);
    }
    const audio = document.getElementById("audioPlayer");
    const playerTitle = document.getElementById("playerTitle");
    const playerArtist = document.getElementById("playerArtist");
    const playerCover = document.getElementById("playerCover");


    /* ESTADO DEL REPRODUCTOR */


    const PLAYER_STORAGE_KEY = "sonora-player-state";


    function savePlayerState() {

        if (!audio) return;

        const image =
            playerCover?.querySelector("img")?.getAttribute("src") || "";

        const state = {
            src: audio.currentSrc || audio.src || "",
            title: playerTitle?.textContent || "",
            artist: playerArtist?.textContent || "",
            image: image,
            time: Number(audio.currentTime) || 0,
            volume: Number(audio.volume)
        };

        try { localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(state)); } catch {}

    }


    function getSavedPlayerState() {

        try {

            const saved =
                localStorage.getItem(
                    PLAYER_STORAGE_KEY
                );

            if (!saved) return null;

            return JSON.parse(saved);

        } catch (error) {

            console.warn(
                "No se pudo recuperar el estado del reproductor.",
                error
            );

            return null;

        }

    }


    function restorePlayerState() {

        if (!audio) return;

        const state =
            getSavedPlayerState();

        if (!state) return;


        /* Volumen */

        if (
            typeof state.volume === "number" &&
            !Number.isNaN(state.volume)
        ) {

            audio.volume =
                Math.max(
                    0,
                    Math.min(
                        1,
                        state.volume
                    )
                );

        }


        if (!state.src || window.andromedaCore.isRetiredAudio(state.src)) return;


        /* Restaurar los datos sin activar reproducción automática. */


        audio.src = state.src;
        window.sonoraPlaybackOwner = "restaurado";
        window.andromedaCore.setPlaybackQueue([{audio: state.src, title: state.title, artist: state.artist, image: state.image}], 0, "restaurado");
        window.andromedaCore.loadSongs().then(songs => {
            if (audio.src === state.src && window.sonoraPlaybackOwner === "restaurado") {
                window.andromedaCore.setPlaybackQueue(songs, 0, "restaurado");
            }
        }).catch(() => {});


        if (playerTitle) {

            playerTitle.textContent =
                state.title || "Canción";

        }


        if (playerArtist) {

            playerArtist.textContent =
                state.artist || "Artista";

        }


        if (
            playerCover &&
            state.image
        ) {

            const image = document.createElement("img");
            image.src = window.andromedaCore.resolveSongArtwork({audio: state.src, image: state.image});
            image.alt = state.title || "Portada";
            playerCover.replaceChildren(image);

        }


        audio.addEventListener(
            "loadedmetadata",
            () => {

                if (
                    audio.src === state.src &&
                    typeof state.time === "number" &&
                    state.time > 0 &&
                    state.time < audio.duration
                ) {

                    audio.currentTime =
                        state.time;

                }

            },
            {
                once: true
            }
        );

    }





    if (audio) {
        let lastSavedAt = 0;
        audio.addEventListener("timeupdate", () => {
            if (Date.now() - lastSavedAt < 1000) return;
            lastSavedAt = Date.now();
            savePlayerState();
        });
        audio.addEventListener("pause", savePlayerState);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) savePlayerState();
        });


        audio.addEventListener(
            "volumechange",
            () => {

                savePlayerState();

            }
        );


        window.addEventListener(
            "beforeunload",
            () => {

                savePlayerState();

            }
        );

    }


    /* CERRAR MENÚ MÓVIL */


    function closeMobileMenu() {

        const navbarContent =
            document.getElementById(
                "navbarContent"
            );

        const toggler =
            document.querySelector(
                ".navbar-toggler"
            );


        if (
            navbarContent &&
            navbarContent.classList.contains("show")
        ) {

            const collapse =
                bootstrap.Collapse.getInstance(
                    navbarContent
                );

            if (collapse) {

                collapse.hide();

            } else {

                navbarContent.classList.remove(
                    "show"
                );

            }

        }


        if (toggler) {

            toggler.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }


    /* MENÚ ACTIVO */


    function setActivePage(page) {
        document.body.classList.toggle("sonora-home-open", page === "inicio");
        document.body.classList.toggle("sonora-explore-open", page === "explorar");
        document.body.classList.toggle("sonora-albums-open", page === "albumes");
        document.body.classList.toggle("sonora-artists-open", page === "artistas");
        document.body.classList.toggle("sonora-library-open", page === "biblioteca");

        navbarLinks.forEach(link => {

            link.classList.remove("active");
            link.removeAttribute("aria-current");

        });


        const active =
            document.querySelector(
                `.navbar-nav .nav-link[data-page="${page}"]`
            );


        if (active) {

            active.classList.add("active");
            active.setAttribute("aria-current", "page");

        }

    }


    /* REPRODUCIR CANCIÓN DE EXPLORAR */


    function setupExploreSongs() {

        const cards =
            pageContainer.querySelectorAll(
                ".explore-song-card"
            );


        cards.forEach(card => {

            const playButton =
                card.querySelector(
                    ".explore-play-button"
                );


            async function playSong(event) {

                if (event) {

                    event.preventDefault();
                    event.stopPropagation();

                }


                if (!audio) return;


                window.sonoraPlaybackOwner = "explorar";
                const title =
                    card.dataset.title ||
                    "Canción";


                const artist =
                    card.dataset.artist ||
                    "Artista";


                const audioFile =
                    card.dataset.audio ||
                    "";


                const image =
                    card.dataset.image ||
                    "";


                if (!audioFile) return;


                /* Conservar el progreso de la canción actual. */


                const currentSource =
                    audio.currentSrc ||
                    audio.src ||
                    "";


                const absoluteAudio =
                    new URL(
                        audioFile,
                        window.location.href
                    ).href;


                if (
                    currentSource !== absoluteAudio
                ) {

                    audio.src =
                        audioFile;

                    audio.currentTime =
                        0;

                }


                if (playerTitle) {

                    playerTitle.textContent =
                        title;

                }


                if (playerArtist) {

                    playerArtist.textContent =
                        artist;

                }


                /* PORTADA */


                if (
                    playerCover &&
                    image
                ) {

                    playerCover.innerHTML = `
                        <img
                            src="${image}"
                            alt="${title}"
                        >
                    `;

                }


                /* MARCAR CANCIÓN ACTIVA */


                cards.forEach(otherCard => {

                    otherCard.classList.remove(
                        "is-playing"
                    );

                    const icon =
                        otherCard.querySelector(
                            ".explore-play-button i"
                        );

                    if (icon) {

                        icon.className =
                            "bi bi-play-fill";

                    }

                });


                card.classList.add(
                    "is-playing"
                );


                const currentIcon =
                    playButton?.querySelector(
                        "i"
                    );


                if (currentIcon) {

                    currentIcon.className =
                        "bi bi-pause-fill";

                }


                try {

                    await audio.play();

                } catch (error) {

                    console.log(
                        "La reproducción automática fue bloqueada:",
                        error
                    );

                }


                savePlayerState();

            }


            card.addEventListener(
                "click",
                playSong
            );


            if (playButton) {

                playButton.addEventListener(
                    "click",
                    playSong
                );

            }

        });

    }


    /* RESTAURAR ESTADO VISUAL DE EXPLORAR */


    function restoreExploreSong() {

        if (!audio) return;

        const state =
            getSavedPlayerState();

        if (!state || !state.src) return;


        const cards =
            pageContainer.querySelectorAll(
                ".explore-song-card"
            );


        cards.forEach(card => {

            const audioFile =
                card.dataset.audio || "";


            if (!audioFile) return;


            const absoluteAudio =
                new URL(
                    audioFile,
                    window.location.href
                ).href;


            if (
                absoluteAudio === state.src
            ) {

                card.classList.add(
                    "is-playing"
                );

                const icon =
                    card.querySelector(
                        ".explore-play-button i"
                    );

                if (icon) {

                    icon.className =
                        "bi bi-pause-fill";

                }

            }

        });

    }


    /* CARGAR EXPLORAR */


   async function loadExplore(
    updateHistory = true,
    initialFilter = "all"
) {

        const request = ++navigationRequest;
        try {

            const response =
                await fetch(
                    "explorar.html?v=catalog-25"
                );


            if (!response.ok) {

                throw new Error(
                    "No se pudo cargar explorar.html?v=catalog-25"
                );

            }


            const html =
                await response.text();


            const parser =
                new DOMParser();


            const doc =
                parser.parseFromString(
                    html,
                    "text/html"
                );


            const explorePage =
                doc.querySelector(
                    ".explore-page"
                );


            if (!explorePage) {

                throw new Error(
                    "No se encontró .explore-page"
                );

            }





            await window.andromedaCatalog.hydrateExplore(explorePage);
            if (request !== navigationRequest) return;
            mainHome.style.display =
                "none";





            pageContainer.innerHTML =
                "";

            pageContainer.appendChild(
                explorePage
            );
if (typeof initExplorar === "function") {
    initExplorar(initialFilter);
} else {
    setupExploreSongs();
}




            setActivePage(
                "explorar"
            );




            if (!audio?.paused) restoreExploreSong();


            closeMobileMenu();


            window.scrollTo({
                top: 0,
                behavior: "instant"
            });


            /* Mantener la ruta de Explorar dentro de index.html. */


            if (updateHistory) {

                history.pushState(
                    {
                        page: "explorar"
                    },
                    "",
                    "index.html?page=explorar"
                );

            }


        } catch (error) {
            if (request !== navigationRequest) return;
            showNavigationError("explorar");

            console.error(
                "Error al cargar Explorar:",
                error
            );

        }

    }


    /* CARGAR ARTISTAS */


    async function loadLibrary(updateHistory = true, playlist = "") {
        const request = ++navigationRequest;
        try {
            const response = await fetch("biblioteca.html?v=andromeda-ui-3");
            if (!response.ok) throw new Error("No se pudo cargar Biblioteca");
            const doc = new DOMParser().parseFromString(await response.text(), "text/html");
            const page = doc.querySelector(".sonora-library");
            if (!page) throw new Error("Página de Biblioteca no válida");
            document.body.classList.remove("artist-profile-open");
            if (request !== navigationRequest) return;
            mainHome.style.display = "none";
            pageContainer.replaceChildren(page);
            setActivePage("biblioteca");
            closeMobileMenu();
            document.getElementById("profileOverlay")?.classList.remove("show");
            window.scrollTo({top: 0, behavior: "instant"});
            if (updateHistory) history.pushState({page: "biblioteca"}, "", "index.html?page=biblioteca" + (playlist ? "&playlist=" + encodeURIComponent(playlist) : ""));
            initBiblioteca({playlist});
        } catch (error) {
            if (request !== navigationRequest) return;
            showNavigationError("biblioteca"); console.error(error);  }
    }
    document.addEventListener("click", event => {
        const link = event.target.closest('[data-page="biblioteca"]');
        if (!link) return;
        event.preventDefault();
        loadLibrary(true, link.dataset.playlistId || "");
    });

    async function loadAlbums(updateHistory = true) {
        const request = ++navigationRequest;
        try {
            const response = await fetch("albumes.html?v=andromeda-ui-3");
            if (!response.ok) throw new Error("No se pudo cargar Álbumes");
            const doc = new DOMParser().parseFromString(await response.text(), "text/html");
            const page = doc.querySelector(".sonora-albums");
            if (!page) throw new Error("Página de Álbumes no válida");
            document.body.classList.remove("artist-profile-open");
            if (request !== navigationRequest) return;
            mainHome.style.display = "none";
            pageContainer.replaceChildren(page);
            initAlbumes();
            setActivePage("albumes");
            closeMobileMenu();
            window.scrollTo({top: 0, behavior: "instant"});
            if (updateHistory) history.pushState({page: "albumes"}, "", "index.html?page=albumes");
        } catch (error) {
            if (request !== navigationRequest) return;
            showNavigationError("albumes"); console.error(error);  }
    }
    document.addEventListener("click", event => {
        const link = event.target.closest('[data-page="albumes"], [data-albums-link]');
        if (!link) return;
        event.preventDefault();
        loadAlbums();
    });

    async function loadArtists(
        updateHistory = true,
        initialArtist = ""
    ) {

        const request = ++navigationRequest;
        try {

            const response = await fetch("artistas.html?v=catalog-25");

            if (!response.ok) {
                throw new Error("No se pudo cargar artistas.html?v=catalog-25");
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const artistsPage = doc.querySelector(".artists-page");

            if (!artistsPage) {
                throw new Error("No se encontró .artists-page");
            }

            const profiles = await window.andromedaCatalog.hydrateArtists(artistsPage);
            if (request !== navigationRequest) return;
            mainHome.style.display = "none";
            pageContainer.innerHTML = "";
            pageContainer.appendChild(artistsPage);

            if (typeof initArtistas === "function") {
                initArtistas({ initialArtist, profiles });
            }

            setActivePage("artistas");
            closeMobileMenu();
            window.scrollTo({ top: 0, behavior: "instant" });

            if (updateHistory) {
                const query = initialArtist
                    ? `index.html?page=artistas&artist=${encodeURIComponent(initialArtist)}`
                    : "index.html?page=artistas";

                history.pushState(
                    { page: "artistas", artist: initialArtist },
                    "",
                    query
                );
            }

        } catch (error) {
            if (request !== navigationRequest) return;
            showNavigationError("artistas");
            console.error("Error al cargar Artistas:", error);
        }
    }


    /* Panel privado de administración. */
    async function loadAdmin(updateHistory = true) {
        const request = ++navigationRequest;
        try {
            const response = await fetch('admin.html?v=1');
            if (!response.ok) throw new Error('No se pudo abrir Administración');
            const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
            const page = doc.querySelector('.andromeda-admin');
            if (request !== navigationRequest) return;
            document.body.classList.remove('artist-profile-open');
            document.getElementById('profileOverlay')?.classList.remove('show');
            mainHome.style.display = 'none'; pageContainer.replaceChildren(page);
            setActivePage('admin'); closeMobileMenu();
            window.scrollTo({top:0,behavior:'instant'});
            if (updateHistory) history.pushState({page:'admin'},'', 'index.html?page=admin');
            await window.initAdmin();
        } catch (error) {
            if (request === navigationRequest) showNavigationError('admin');
        }
    }
    document.addEventListener('click', event => {
        const link = event.target.closest('[data-page="admin"]');
        if (!link) return;
        event.preventDefault(); loadAdmin();
    });

    /* VOLVER A INICIO */


    function loadHome(
        updateHistory = true
    ) {

        ++navigationRequest;

        document.body.classList.remove(
            "artist-profile-open"
        );

        pageContainer.innerHTML =
            "";

        mainHome.style.display =
            "";


        setActivePage(
            "inicio"
        );


        closeMobileMenu();


        if (updateHistory) {

            history.pushState(
                {
                    page: "inicio"
                },
                "",
                "index.html"
            );

        }


        window.scrollTo({
            top: 0,
            behavior: "instant"
        });

    }


    /* EXPLORAR */


    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    '[data-page="explorar"]'
                );


            if (!link) return;


            event.preventDefault();


            loadExplore(
                true, link.dataset.filter || "all"
            );

        }
    );


    /* ARTISTAS */


    document.addEventListener(
        "click",
        event => {

            const link = event.target.closest('[data-page="artistas"]');
            if (!link) return;

            event.preventDefault();
            loadArtists(true, link.dataset.artistId || "");

        }
    );


    /* INICIO */


    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    '[data-page="inicio"]'
                );


            if (!link) return;


            event.preventDefault();


            loadHome(
                true
            );

        }
    );


    /* ÁLBUMES */


    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    '.navbar-nav a[href^="#"]'
                );


            if (!link) return;


            const targetId =
                link.getAttribute(
                    "href"
                );


            if (
                targetId !== "#albumes"
            ) {

                return;

            }


            if (
                mainHome.style.display ===
                "none"
            ) {

                event.preventDefault();


                loadHome(
                    false
                );

                history.pushState(
                    {
                        page: "inicio",
                        section: "albumes"
                    },
                    "",
                    "index.html#albumes"
                );


                setTimeout(() => {

                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (target) {

                        setActivePage(
                            "albumes"
                        );

                        target.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }, 50);

            }

        }
    );


    /* ATRÁS / ADELANTE */


    window.addEventListener(
        "popstate",
        () => {

            const params =
                new URLSearchParams(
                    window.location.search
                );


            const page =
                params.get(
                    "page"
                );


            if (
                page === "explorar"
            ) {

                loadExplore(
                    false
                );

            } else if (
                page === "artistas"
            ) {

                loadArtists(
                    false,
                    params.get("artist") || ""
                );

            } else if (page === "biblioteca") {
                loadLibrary(false, params.get("playlist") || "");
            } else if (page === "admin") {
                loadAdmin(false);
            } else if (page === "albumes") {
                loadAlbums(false);
            } else {

                loadHome(
                    false
                );

            }

        }
    );


    /* RUTA INICIAL */


    const params =
        new URLSearchParams(
            window.location.search
        );


    const currentPage =
        params.get(
            "page"
        );


    if (
        currentPage === "explorar"
    ) {

        /* Restaurar la ruta sin añadir entradas al historial. */


        loadExplore(
            false
        );

    } else if (
        currentPage === "artistas"
    ) {

        loadArtists(
            false,
            params.get("artist") || ""
        );

    } else if (currentPage === "biblioteca") {
        loadLibrary(false, params.get("playlist") || "");
    } else if (currentPage === "admin") {
        loadAdmin(false);
    } else if (currentPage === "albumes") {
        loadAlbums(false);
    } else {

        setActivePage(
            "inicio"
        );

    }


    /* RESTAURAR REPRODUCTOR */


    /* Restaurar el reproductor después de inicializar musica.js. */


    restorePlayerState();

});
