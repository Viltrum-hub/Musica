/* Funciones compartidas y carga del catálogo. */
(() => {
  const documents = new Map();
  const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
  const normalizeText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const isRetiredAudio = value => String(value || "").split(/[?#]/)[0].endsWith("/phil-collins-one-more-night.mp3");

  const cosmicArtists = ["the-outfield", "queen", "alan-walker", "cristian-castro", "elton-john", "felipe-garibo", "marco-antonio-solis", "madonna", "lady-gaga", "junior-kelly-marchena", "justin-bieber", "mana"];
  const songArtwork = {"Canciones/The Outfield - Your Love.mp3.mpeg": "assets/andromeda/artists/the-outfield.svg?v=portraits-18", "Canciones/The Outfield - Say It Isn't So (1).mp3.mpeg": "assets/andromeda/artists/the-outfield.svg?v=portraits-18", "Canciones/The Outfield - All The Love In The World (1).mp3.mpeg": "assets/andromeda/artists/the-outfield.svg?v=portraits-18", "Canciones/Queen - Another One Bites the Dust (Official Video Remastered) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=portraits-18", "Canciones/Queen - Don't Stop Me Now (Official Video) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=portraits-18", "Canciones/Queen - We Are The Champions (Official Video Remastered) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=portraits-18", "Canciones/Queen - We Will Rock You (Lyrics) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=portraits-18", "Canciones/Queen – Bohemian Rhapsody (Official Video Remastered) (1).mp3.mpeg": "assets/andromeda/artists/queen.svg?v=portraits-18", "Canciones/Alan Walker - Alone (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=portraits-18", "Canciones/Alan Walker - Faded (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=portraits-18", "Canciones/Alan Walker - Sing Me To Sleep (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=portraits-18", "Canciones/Alan Walker - The Spectre (1).mp3.mpeg": "assets/andromeda/artists/alan-walker.svg?v=portraits-18", "Canciones/cristian-castro-no-podras.mp3": "assets/andromeda/artists/cristian-castro.svg?v=portraits-18", "Canciones/elton-john-im-still-standing.mp3": "assets/andromeda/artists/elton-john.svg?v=portraits-18", "Canciones/felipe-garibo-bienvenido.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=portraits-18", "Canciones/felipe-garibo-renacer.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=portraits-18", "Canciones/marco-antonio-solis-mi-eterno-amor-secreto.mp3": "assets/andromeda/artists/marco-antonio-solis.svg?v=portraits-18", "Canciones/felipe-garibo-como-resistirme.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=portraits-18", "Canciones/felipe-garibo-el-loco.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=portraits-18", "Canciones/felipe-garibo-fue-por-amor.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=portraits-18", "Canciones/felipe-garibo-jesus-el-pan-de-vida.mp3": "assets/andromeda/artists/felipe-garibo.svg?v=portraits-18", "Canciones/Madonna  - Like A Virgin (Lyrics) (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=portraits-18", "Canciones/Madonna - Hung Up (Official Video) [HD] (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=portraits-18", "Canciones/Madonna - Like a Prayer (7  Version) (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=portraits-18", "Canciones/Madonna - Material Girl (1).mp3.mpeg": "assets/andromeda/artists/madonna.svg?v=portraits-18", "Canciones/madonna-into-the-groove.mp3": "assets/andromeda/artists/madonna.svg?v=portraits-18", "Canciones/madonna-lucky-star.mp3": "assets/andromeda/artists/madonna.svg?v=portraits-18", "Canciones/madonna-papa-dont-preach.mp3": "assets/andromeda/artists/madonna.svg?v=portraits-18", "Canciones/madonna-la-isla-bonita.mp3": "assets/andromeda/artists/madonna.svg?v=portraits-18", "Canciones/lady-gaga-paparazzi.mp3": "assets/andromeda/artists/lady-gaga.svg?v=portraits-18", "Canciones/lady-gaga-poker-face.mp3": "assets/andromeda/artists/lady-gaga.svg?v=portraits-18", "Canciones/lady-gaga-bad-romance.mp3": "assets/andromeda/artists/lady-gaga.svg?v=portraits-18", "Canciones/lady-gaga-just-dance.mp3": "assets/andromeda/artists/lady-gaga.svg?v=portraits-18", "Canciones/lady-gaga-judas.mp3": "assets/andromeda/artists/lady-gaga.svg?v=portraits-18", "Canciones/lady-gaga-die-with-a-smile.mp3": "assets/andromeda/artists/lady-gaga.svg?v=portraits-18", "Canciones/junior-kelly-marchena-jesucristo-rey.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=portraits-18", "Canciones/junior-kelly-marchena-el-clamor-final.mp3": "assets/andromeda/artists/junior-kelly-marchena.svg?v=portraits-18", "Canciones/justin-bieber-beauty-and-a-beat.mp3": "assets/andromeda/artists/justin-bieber.svg?v=portraits-18", "Canciones/mana-clavado-en-un-bar.mp3": "assets/andromeda/artists/mana.svg?v=portraits-18", "Canciones/mana-en-el-muelle-de-san-blas.mp3": "assets/andromeda/artists/mana.svg?v=portraits-18"};
  const resolveArtwork = value => {
    const source = String(value || '');
    const file = source.match(/(?:^|\/)assets\/andromeda\/(?:artists|albums|songs)\/([^?#]+)/)?.[1];
    const artist = file && cosmicArtists.find(id => file === `${id}.svg` || file.startsWith(`${id}-`));
    return artist ? `assets/andromeda/artists/${artist}.svg?v=portraits-18` : source;
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
    const document = await loadDocument('explorar.html?v=portraits-18');
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
    const document = await loadDocument('artistas.html?v=portraits-18');
    return [...document.querySelectorAll('.artist-catalog-card')].map(card => ({
      id: card.dataset.artistId,
      name: card.querySelector('h3')?.textContent || '',
      image: card.querySelector('img')?.getAttribute('src') || '',
      genre: card.querySelector('.artist-catalog-info>span')?.textContent || 'Artista ANDROMEDA'
    }));
  }

  window.andromedaCore = Object.freeze({escapeHTML, normalizeText, loadSongs, loadArtists, isRetiredAudio, resolveArtwork, resolveSongArtwork});
})();
