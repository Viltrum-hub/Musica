/* Funciones compartidas y carga del catálogo. */
(() => {
  const documents = new Map();
  const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
  const normalizeText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const isRetiredAudio = value => String(value || "").split(/[?#]/)[0].endsWith("/phil-collins-one-more-night.mp3");

  const cosmicArtists = ["the-outfield", "queen", "alan-walker", "cristian-castro", "elton-john", "felipe-garibo", "marco-antonio-solis", "madonna", "lady-gaga", "junior-kelly-marchena", "justin-bieber", "mana", "eminem", "phil-collins", "travis-scott", "steve-green"];
  const songArtwork = {"Canciones/The Outfield - Your Love.mp3.mpeg": "assets/andromeda/artists/the-outfield.svg?v=catalog-21", "Canciones/The Outfield - Say It Isn't So (1).mp3.mpeg": "assets/andromeda/artists/the-outfield.svg?v=catalog-21", "Canciones/The Outfield - All The Love In The World (1).mp3.mpeg": "assets/andromeda/artists/the-outfield.svg?v=catalog-21", "Canciones/Queen - Another One Bites the Dust (Official Video Remastered) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=catalog-21", "Canciones/Queen - Don't Stop Me Now (Official Video) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=catalog-21", "Canciones/Queen - We Are The Champions (Official Video Remastered) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=catalog-21", "Canciones/Queen - We Will Rock You (Lyrics) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=catalog-21", "Canciones/Queen – Bohemian Rhapsody (Official Video Remastered) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=catalog-21", "Canciones/Alan Walker - Alone (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=catalog-21", "Canciones/Alan Walker - Faded (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=catalog-21", "Canciones/Alan Walker - Sing Me To Sleep (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=catalog-21", "Canciones/Alan Walker - The Spectre (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=catalog-21", "Canciones/cristian-castro-no-podras.mp3": "assets/andromeda/artists/cristian-castro.svg?v=catalog-21", "Canciones/elton-john-im-still-standing.mp3": "assets/andromeda/artists/elton-john.svg?v=catalog-21", "Canciones/felipe-garibo-bienvenido.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-21", "Canciones/felipe-garibo-renacer.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-21", "Canciones/marco-antonio-solis-mi-eterno-amor-secreto.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-21", "Canciones/felipe-garibo-como-resistirme.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-21", "Canciones/felipe-garibo-el-loco.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-21", "Canciones/felipe-garibo-fue-por-amor.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-21", "Canciones/felipe-garibo-jesus-el-pan-de-vida.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-21", "Canciones/Madonna  - Like A Virgin (Lyrics) (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=catalog-21", "Canciones/Madonna - Hung Up (Official Video) [HD] (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=catalog-21", "Canciones/Madonna - Like a Prayer (7  Version) (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=catalog-21", "Canciones/Madonna - Material Girl (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=catalog-21", "Canciones/madonna-into-the-groove.mp3": "assets/andromeda/artists/madonna.svg?v=catalog-21", "Canciones/madonna-lucky-star.mp3": "assets/andromeda/artists/madonna.svg?v=catalog-21", "Canciones/madonna-papa-dont-preach.mp3": "assets/andromeda/artists/madonna.svg?v=catalog-21", "Canciones/madonna-la-isla-bonita.mp3": "assets/andromeda/artists/madonna.svg?v=catalog-21", "Canciones/lady-gaga-paparazzi.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-21", "Canciones/lady-gaga-poker-face.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-21", "Canciones/lady-gaga-bad-romance.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-21", "Canciones/lady-gaga-just-dance.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-21", "Canciones/lady-gaga-judas.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-21", "Canciones/lady-gaga-die-with-a-smile.mp3": "assets/andromeda/artists/lady-gaga.svg?v=catalog-21", "Canciones/junior-kelly-marchena-jesucristo-rey.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=catalog-21", "Canciones/junior-kelly-marchena-el-clamor-final.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=catalog-21", "Canciones/justin-bieber-beauty-and-a-beat.mp3": "assets/andromeda/artists/justin-bieber.svg?v=catalog-21", "Canciones/mana-clavado-en-un-bar.mp3": "assets/andromeda/artists/mana.svg?v=catalog-21", "Canciones/mana-en-el-muelle-de-san-blas.mp3": "assets/andromeda/artists/mana.svg?v=catalog-21", "Canciones/eminem-superman.mp3": "assets/andromeda/artists/eminem.svg?v=catalog-21", "Canciones/eminem-lose-yourself.mp3": "assets/andromeda/artists/eminem.svg?v=catalog-21", "Canciones/eminem-stan.mp3": "assets/andromeda/artists/eminem.svg?v=catalog-21", "Canciones/eminem-the-real-slim-shady.mp3": "assets/andromeda/artists/eminem.svg?v=catalog-21", "Canciones/eminem-mockingbird.mp3": "assets/andromeda/artists/eminem.svg?v=catalog-21", "Canciones/mana-labios-compartidos.mp3": "assets/andromeda/artists/mana.svg?v=catalog-21", "Canciones/marco-antonio-solis-si-no-te-hubieras-ido.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-21", "Canciones/felipe-garibo-aunque-haya-pruebas.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-21", "Canciones/cristian-castro-por-amarte-asi.mp3": "assets/andromeda/artists/cristian-castro.svg?v=catalog-21", "Canciones/mana-oye-mi-amor.mp3": "assets/andromeda/artists/mana.svg?v=catalog-21", "Canciones/marco-antonio-solis-inventame.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-21", "Canciones/junior-kelly-marchena-nadie-pudo-hacer.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=catalog-21", "Canciones/phil-collins-another-day-in-paradise.mp3": "assets/andromeda/artists/phil-collins.svg?v=catalog-21", "Canciones/travis-scott-goosebumps.mp3": "assets/andromeda/artists/travis-scott.svg?v=catalog-21", "Canciones/mana-manda-una-senal.mp3": "assets/andromeda/artists/mana.svg?v=catalog-21", "Canciones/mana-rayando-el-sol.mp3": "assets/andromeda/artists/mana.svg?v=catalog-21", "Canciones/marco-antonio-solis-a-donde-vamos-a-parar.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-21", "Canciones/marco-antonio-solis-o-me-voy-o-te-vas.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-21", "Canciones/marco-antonio-solis-si-te-pudiera-mentir.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=catalog-21", "Canciones/junior-kelly-marchena-santuario.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=catalog-21", "Canciones/junior-kelly-marchena-ven-senor.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=catalog-21", "Canciones/steve-green-aquel-que-la-buena-obra-empezo.mp3": "assets/andromeda/artists/steve-green.svg?v=catalog-21", "Canciones/travis-scott-sicko-mode.mp3": "assets/andromeda/artists/travis-scott.svg?v=catalog-21", "Canciones/felipe-garibo-y-llegaste-tu.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=catalog-21"};
  const resolveArtwork = value => {
    const source = String(value || '');
    const file = source.match(/(?:^|\/)assets\/andromeda\/(?:artists|albums|songs)\/([^?#]+)/)?.[1];
    const artist = file && cosmicArtists.find(id => file === `${id}.svg` || file.startsWith(`${id}-`));
    return artist ? `assets/andromeda/artists/${artist}.svg?v=catalog-21` : source;
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
    const document = await loadDocument('explorar.html?v=catalog-21');
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
    const document = await loadDocument('artistas.html?v=catalog-21');
    return [...document.querySelectorAll('.artist-catalog-card')].map(card => ({
      id: card.dataset.artistId,
      name: card.querySelector('h3')?.textContent || '',
      image: card.querySelector('img')?.getAttribute('src') || '',
      genre: card.querySelector('.artist-catalog-info>span')?.textContent || 'Artista ANDROMEDA'
    }));
  }

  window.andromedaCore = Object.freeze({escapeHTML, normalizeText, loadSongs, loadArtists, isRetiredAudio, resolveArtwork, resolveSongArtwork});
})();
