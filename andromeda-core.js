/* Funciones compartidas y carga del catálogo. */
(() => {
  const documents = new Map();
  const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
  const normalizeText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const isRetiredAudio = value => String(value || "").split(/[?#]/)[0].endsWith("/phil-collins-one-more-night.mp3");

  const cosmicArtists = ["the-outfield", "queen", "alan-walker", "cristian-castro", "elton-john", "felipe-garibo", "marco-antonio-solis", "madonna", "lady-gaga", "junior-kelly-marchena", "justin-bieber", "mana", "eminem", "phil-collins", "travis-scott", "steve-green"];
  const songArtwork = {"Canciones/The Outfield - Your Love.mp3.mpeg": "assets/andromeda/artists/the-outfield.svg?v=catalog-25", "Canciones/The Outfield - Say It Isn't So (1).mp3.mpeg": "assets/andromeda/artists/the-outfield.svg?v=catalog-25", "Canciones/The Outfield - All The Love In The World (1).mp3.mpeg": "assets/andromeda/artists/the-outfield.svg?v=catalog-25", "Canciones/Queen - Another One Bites the Dust (Official Video Remastered) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=catalog-25", "Canciones/Queen - Don't Stop Me Now (Official Video) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=catalog-25", "Canciones/Queen - We Are The Champions (Official Video Remastered) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=catalog-25", "Canciones/Queen - We Will Rock You (Lyrics) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=catalog-25", "Canciones/Queen – Bohemian Rhapsody (Official Video Remastered) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=catalog-25", "Canciones/Alan Walker - Alone (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=catalog-25", "Canciones/Alan Walker - Faded (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=catalog-25", "Canciones/Alan Walker - Sing Me To Sleep (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=catalog-25", "Canciones/Alan Walker - The Spectre (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=catalog-25", "Canciones/cristian-castro-no-podras.mp3": "assets/andromeda/artists/cristian-castro.svg?v=catalog-25", "Canciones/elton-john-im-still-standing.mp3": "assets/andromeda/artists/elton-john.svg?v=catalog-25", "Canciones/felipe-garibo-bienvenido.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-25", "Canciones/felipe-garibo-renacer.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-25", "Canciones/marco-antonio-solis-mi-eterno-amor-secreto.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-25", "Canciones/felipe-garibo-como-resistirme.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-25", "Canciones/felipe-garibo-el-loco.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-25", "Canciones/felipe-garibo-fue-por-amor.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-25", "Canciones/felipe-garibo-jesus-el-pan-de-vida.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-25", "Canciones/Madonna  - Like A Virgin (Lyrics) (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=catalog-25", "Canciones/Madonna - Hung Up (Official Video) [HD] (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=catalog-25", "Canciones/Madonna - Like a Prayer (7  Version) (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=catalog-25", "Canciones/Madonna - Material Girl (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=catalog-25", "Canciones/madonna-into-the-groove.mp3": "assets/andromeda/artists/madonna.svg?v=catalog-25", "Canciones/madonna-lucky-star.mp3": "assets/andromeda/artists/madonna.svg?v=catalog-25", "Canciones/madonna-papa-dont-preach.mp3": "assets/andromeda/artists/madonna.svg?v=catalog-25", "Canciones/madonna-la-isla-bonita.mp3": "assets/andromeda/artists/madonna.svg?v=catalog-25", "Canciones/lady-gaga-paparazzi.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-25", "Canciones/lady-gaga-poker-face.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-25", "Canciones/lady-gaga-bad-romance.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-25", "Canciones/lady-gaga-just-dance.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-25", "Canciones/lady-gaga-judas.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-25", "Canciones/lady-gaga-die-with-a-smile.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-25", "Canciones/junior-kelly-marchena-jesucristo-rey.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=catalog-25", "Canciones/junior-kelly-marchena-el-clamor-final.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=catalog-25", "Canciones/justin-bieber-beauty-and-a-beat.mp3": "assets/andromeda/artists/justin-bieber.svg?v=catalog-25", "Canciones/mana-clavado-en-un-bar.mp3": "assets/andromeda/artists/mana.svg?v=catalog-25", "Canciones/mana-en-el-muelle-de-san-blas.mp3": "assets/andromeda/artists/mana.svg?v=catalog-25", "Canciones/eminem-superman.mp3": "assets/andromeda/artists/eminem.svg?v=catalog-25", "Canciones/eminem-lose-yourself.mp3": "assets/andromeda/artists/eminem.svg?v=catalog-25", "Canciones/eminem-stan.mp3": "assets/andromeda/artists/eminem.svg?v=catalog-25", "Canciones/eminem-the-real-slim-shady.mp3": "assets/andromeda/artists/eminem.svg?v=catalog-25", "Canciones/eminem-mockingbird.mp3": "assets/andromeda/artists/eminem.svg?v=catalog-25", "Canciones/mana-labios-compartidos.mp3": "assets/andromeda/artists/mana.svg?v=catalog-25", "Canciones/marco-antonio-solis-si-no-te-hubieras-ido.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-25", "Canciones/felipe-garibo-aunque-haya-pruebas.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-25", "Canciones/cristian-castro-por-amarte-asi.mp3": "assets/andromeda/artists/cristian-castro.svg?v=catalog-25", "Canciones/mana-oye-mi-amor.mp3": "assets/andromeda/artists/mana.svg?v=catalog-25", "Canciones/marco-antonio-solis-inventame.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-25", "Canciones/junior-kelly-marchena-nadie-pudo-hacer.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=catalog-25", "Canciones/phil-collins-another-day-in-paradise.mp3": "assets/andromeda/artists/phil-collins.svg?v=catalog-25", "Canciones/travis-scott-goosebumps.mp3": "assets/andromeda/artists/travis-scott.svg?v=catalog-25", "Canciones/mana-manda-una-senal.mp3": "assets/andromeda/artists/mana.svg?v=catalog-25", "Canciones/mana-rayando-el-sol.mp3": "assets/andromeda/artists/mana.svg?v=catalog-25", "Canciones/marco-antonio-solis-a-donde-vamos-a-parar.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-25", "Canciones/marco-antonio-solis-o-me-voy-o-te-vas.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-25", "Canciones/marco-antonio-solis-si-te-pudiera-mentir.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-25", "Canciones/junior-kelly-marchena-santuario.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=catalog-25", "Canciones/junior-kelly-marchena-ven-senor.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=catalog-25", "Canciones/steve-green-aquel-que-la-buena-obra-empezo.mp3": "assets/andromeda/artists/steve-green.svg?v=catalog-25", "Canciones/travis-scott-sicko-mode.mp3": "assets/andromeda/artists/travis-scott.svg?v=catalog-25", "Canciones/felipe-garibo-y-llegaste-tu.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-25"};
  const resolveArtwork = value => {
    const source = String(value || '');
    const file = source.match(/(?:^|\/)assets\/andromeda\/(?:artists|albums|songs)\/([^?#]+)/)?.[1];
    const artist = file && cosmicArtists.find(id => file === `${id}.svg` || file.startsWith(`${id}-`));
    return artist ? `assets/andromeda/artists/${artist}.svg?v=catalog-25` : source;
  };
  const resolveSongArtwork = song => {
    let audio = String(song?.audio || '').split(/[?#]/)[0];
    try { audio = decodeURIComponent(audio); } catch {}
    const entry = Object.entries(songArtwork).find(([path]) => audio.endsWith(path));
    return entry ? entry[1] : resolveArtwork(song?.image);
  };

  async function loadDocument(url) {
    if (!documents.has(url)) {
      const request = (async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
        return new DOMParser().parseFromString(await response.text(), 'text/html');
      })();
      documents.set(url, request);
      request.catch(() => {
        if (documents.get(url) === request) documents.delete(url);
      });
    }
    return documents.get(url);
  }

  async function loadSongs({selector = '.explore-song-card[data-audio]', keep = 'last'} = {}) {
    const document = await loadDocument('explorar.html?v=catalog-25');
    const songs = new Map();
    document.querySelectorAll(selector).forEach(element => {
      const song = {...element.dataset};
      if (!song.audio || (keep === 'first' && songs.has(song.audio))) return;
      songs.set(song.audio, song);
    });
    /* Cada módulo recibe una copia independiente del catálogo. */
    return [...songs.values()];
  }

  async function loadArtists() {
    const document = await loadDocument('artistas.html?v=catalog-25');
    return [...document.querySelectorAll('.artist-catalog-card')].map(card => ({
      id: card.dataset.artistId,
      name: card.querySelector('h3')?.textContent || '',
      image: card.querySelector('img')?.getAttribute('src') || '',
      genre: card.querySelector('.artist-catalog-info>span')?.textContent || 'Artista ANDROMEDA'
    }));
  }

  /* Cola persistente entre páginas. */
  let playbackQueue = [], playbackOwner = '';
  const playerAudio = () => document.getElementById('audioPlayer');
  const audioURL = value => new URL(value, document.baseURI).href;
  function setPlaybackQueue(songs, index, owner) {
    playbackQueue = songs.filter(song => song.audio && !isRetiredAudio(song.audio)).map(song => ({...song}));
    playbackOwner = owner;
  }
  function queuePosition() {
    const audio = playerAudio();
    if (!audio || window.sonoraPlaybackOwner !== playbackOwner) return -1;
    return playbackQueue.findIndex(song => audioURL(song.audio) === audio.src);
  }
  function playbackMessage(message) {
    let status = document.getElementById('playbackStatus');
    if (!status) {
      status = document.createElement('p'); status.id = 'playbackStatus';
      status.setAttribute('role', 'status'); document.body.append(status);
    }
    status.textContent = message; status.hidden = !message;
  }
  async function playQueued(index) {
    const song = playbackQueue[index], audio = playerAudio();
    if (!song || !audio) return;
    window.sonoraPlaybackOwner = playbackOwner;
    audio.src = song.audio;
    for (const [id, text] of [['playerTitle', song.title], ['playerArtist', song.artist]]) {
      const element = document.getElementById(id); if (element) element.textContent = text || '';
    }
    const cover = document.getElementById('playerCover');
    if (cover) {
      const image = document.createElement('img'); image.src = resolveSongArtwork(song);
      image.alt = `Portada de ${song.title}`; cover.replaceChildren(image);
    }
    document.getElementById('currentTime').textContent = '0:00';
    document.getElementById('duration').textContent = '0:00';
    document.getElementById('progressBar').value = 0;
    try { await audio.play(); playbackMessage(''); }
    catch (error) { if (error.name !== 'AbortError') playbackMessage('No se pudo reproducir esta canción. Intenta de nuevo o elige otra.'); }
  }
  document.addEventListener('click', event => {
    const control = event.target.closest('#mainPlayBtn, #previousBtn, #nextBtn');
    let index = queuePosition(); if (!control) return;
    if (index < 0 && !playerAudio()?.getAttribute('src') && control.id === 'mainPlayBtn') {
      const cards = document.querySelectorAll('.explore-page .explore-song-card[data-audio]');
      const selection = cards.length ? cards : document.querySelectorAll('#mainHome .home-track[data-audio]');
      setPlaybackQueue([...selection].map(card => ({...card.dataset})), 0, 'catalogo');
      if (playbackQueue.length) {
        event.preventDefault(); event.stopImmediatePropagation(); playQueued(0);
      }
      return;
    }
    if (index < 0) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const audio = playerAudio();
    if (control.id === 'mainPlayBtn') {
      if (audio.paused) audio.play().catch(() => playbackMessage('Pulsa reproducir para volver a intentarlo.'));
      else audio.pause();
    } else playQueued((index + (control.id === 'nextBtn' ? 1 : -1) + playbackQueue.length) % playbackQueue.length);
  }, true);
  document.addEventListener('DOMContentLoaded', () => {
    /* Foco y accesibilidad de los diálogos globales. */
    const overlays = [...document.querySelectorAll('#searchOverlay, #authOverlay, #profileOverlay')];
    const triggers = new WeakMap();
    document.addEventListener('click', event => {
      const trigger = event.target.closest('button, a');
      if (trigger) overlays.forEach(overlay => { if (!overlay.contains(trigger)) triggers.set(overlay, trigger); });
    }, true);
    overlays.forEach(overlay => {
      const panel = overlay.querySelector('.search-box, .auth-modal, .profile-modal');
      if (!panel) return;
      panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
      const heading = panel.querySelector('h2');
      if (heading) { if (!heading.id) heading.id = `${overlay.id}-title`; panel.setAttribute('aria-labelledby', heading.id); }
      const syncOverlay = () => {
        const open = overlay.classList.contains('show');
        if (!open && overlay.contains(document.activeElement)) triggers.get(overlay)?.focus({preventScroll:true});
        overlay.inert = !open; overlay.setAttribute('aria-hidden', String(!open));
        if (open && !overlay.contains(document.activeElement)) {
          (panel.querySelector('input:not([type=hidden])') || panel.querySelector('button'))?.focus();
        }
      };
      new MutationObserver(syncOverlay).observe(overlay, {attributes:true, attributeFilter:['class']});
      syncOverlay();
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const overlay = overlays.find(element => element.classList.contains('show')); if (!overlay) return;
      const controls = [...overlay.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = controls[0], last = controls.at(-1); if (!first) return;
      if (event.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }, true);
    const audio = playerAudio(); if (!audio) return;
    audio.addEventListener('ended', event => {
      const index = queuePosition(); if (index < 0) return;
      event.stopImmediatePropagation();
      if (index + 1 < playbackQueue.length) playQueued(index + 1);
    }, true);
    const sync = () => {
      const control = document.getElementById('mainPlayBtn'); if (!control) return;
      const playing = !audio.paused && !audio.ended;
      control.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
      control.querySelector('i').className = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';
    };
    for (const event of ['play', 'pause', 'ended', 'emptied']) audio.addEventListener(event, sync);
    audio.addEventListener('playing', () => playbackMessage(''));
    audio.addEventListener('error', () => { if (audio.getAttribute('src')) playbackMessage('Este audio no está disponible. Puedes elegir otra canción.'); });
  });

  window.andromedaCore = Object.freeze({notify: playbackMessage, setPlaybackQueue, escapeHTML, normalizeText, loadSongs, loadArtists, isRetiredAudio, resolveArtwork, resolveSongArtwork});
})();
