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


    /* =========================
       LISTA DE CANCIONES
    ========================= */

    const songs = Array.from(cards).map(card => ({
        title: card.dataset.title || "Canción",
        artist: card.dataset.artist || "Artista",
        audio: card.dataset.audio || ""
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


        if (progressBar) {
            progressBar.value = 0;
        }


        if (currentTimeEl) {
            currentTimeEl.textContent = "0:00";
        }


        if (durationEl) {
            durationEl.textContent = "0:00";
        }


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


                if (currentSong === -1) {

                    if (songs.length > 0) {
                        loadSong(0, true);
                    }

                    return;

                }


                if (audioPlayer.paused) {
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

                    loadSong(index, true);

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

                    loadSong(index, true);

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

                if (songs.length === 0) {
                    return;
                }

                let nextSong =
                    currentSong + 1;

                if (
                    nextSong >= songs.length
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

                if (songs.length === 0) {
                    return;
                }

                let previousSong =
                    currentSong - 1;

                if (previousSong < 0) {
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

                if (!audioPlayer.duration) {
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

                if (!audioPlayer.duration) {
                    return;
                }

                audioPlayer.currentTime =
                    (
                        progressBar.value / 100
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

                if (songs.length === 0) {
                    return;
                }

                let nextSong =
                    currentSong + 1;

                if (
                    nextSong >= songs.length
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


    if (
        openSearch &&
        closeSearch &&
        searchOverlay &&
        searchInput &&
        searchResults
    ) {

        openSearch.addEventListener(
            "click",
            () => {

                searchOverlay.classList.add(
                    "show"
                );

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

                if (
                    event.target ===
                    searchOverlay
                ) {

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
                    .map(
                        (song, index) => ({
                            song,
                            index
                        })
                    )
                    .filter(
                        ({ song }) =>
                            song.title
                                .toLowerCase()
                                .includes(query) ||
                            song.artist
                                .toLowerCase()
                                .includes(query)
                    )
                    .forEach(
                        ({ song, index }) => {

                            const result =
                                document.createElement(
                                    "div"
                                );

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

                                    loadSong(
                                        index,
                                        true
                                    );

                                    searchOverlay.classList.remove(
                                        "show"
                                    );

                                    searchInput.value =
                                        "";

                                }
                            );


                            searchResults.appendChild(
                                result
                            );

                        }
                    );

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

            if (!allowedTypes.includes(file.type)) {

                if (profileMessage) {
                    profileMessage.textContent =
                        "Solo se permiten imágenes JPG, PNG o WEBP.";
                }

                avatarFileInput.value = "";
                return;
            }

            /* VALIDAR TAMAÑO — 1 MB */
            const maxSize =
                1 * 1024 * 1024;

            if (file.size > maxSize) {

                if (profileMessage) {
                    profileMessage.textContent =
                        "La imagen no puede superar 1 MB.";
                }

                avatarFileInput.value = "";
                return;
            }

            /* COMPROBAR USUARIO */
            const {
                data: { user },
                error: userError
            } =
                await supabaseClient.auth.getUser();

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
                                upsert: false
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

                avatarFileInput.value = "";

            }
        }
    );
}

    const profileMessage =
        document.getElementById(
            "profileMessage"
        );

    const saveProfileButton =
        document.getElementById(
            "saveProfileButton"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );
const loginButtonContent = document.getElementById("loginButtonContent");

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
            profileAvatarUrl.value = "";
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
                document.createElement("img");

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

function updateNavbarAvatar(url, loggedIn = false) {

    if (!loginButton || !loginButtonContent) {
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
                ${loggedIn ? "Mi perfil" : "Iniciar sesión"}
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

async function updateUserInterface(session) {

    if (
        session &&
        session.user
    ) {

        await loadUserProfile(
            session.user
        );

    } else {

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

                    /* CERRAR */

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

                    /* ABRIR */

                    profileEditSection.style.display =
                        "block";

                    editProfileButton.innerHTML = `
                        <i class="bi bi-x-lg"></i>
                        Cancelar
                    `;


                    /* CARGAR VALOR ACTUAL */

                    if (
                        profileUsername &&
                        profileName
                    ) {

                        profileUsername.value =
                            profileName.textContent.trim();

                    }


                    /* ENFOCAR INPUT */

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

            // Abrir selector de archivos
            if (avatarFileInput) {
                avatarFileInput.click();
            }

            // Mostrar sección de edición
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


                if (username.length < 3) {

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
                                    avatarUrl || null

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


                updateUserInterface(null);

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

});