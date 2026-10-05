/* The Home preview follows the existing shared audio player. */
document.addEventListener('DOMContentLoaded', () => {
  const preview = document.querySelector('.home-now-playing');
  const audio = document.getElementById('audioPlayer');
  const title = document.getElementById('playerTitle');
  const artist = document.getElementById('playerArtist');
  const cover = document.getElementById('playerCover');
  if (!preview || !audio) return;
  const name = preview.querySelector('strong');
  const subtitle = preview.querySelector('.home-now-copy > span');
  const artwork = preview.querySelector('.home-now-cover');
  const icon = preview.querySelector('.home-now-icon i');
  function sync() {
    const hasTrack = !!audio.getAttribute('src');
    preview.hidden = !hasTrack;
    name.textContent = hasTrack ? title.textContent : 'Encuentra tu próxima canción';
    subtitle.textContent = hasTrack ? artist.textContent : 'Escucha la selección SONORA';
    icon.className = hasTrack && !audio.paused ? 'bi bi-pause-fill' : 'bi bi-play-fill';
    preview.setAttribute('aria-label', hasTrack && !audio.paused ? 'Pausar canción actual' : hasTrack ? 'Reproducir canción actual' : 'Escuchar selección SONORA');
    const image = hasTrack && cover.querySelector('img');
    if (image) {
      const img = document.createElement('img'); img.src = image.src; img.alt = ''; artwork.replaceChildren(img);
    } else artwork.innerHTML = '<i class="bi bi-soundwave" aria-hidden="true"></i>';
  }
  preview.addEventListener('click', () => {
    if (!audio.getAttribute('src')) document.querySelector('.home-track .play-card')?.click();
    else document.getElementById('mainPlayBtn')?.click();
  });
  for (const event of ['play', 'pause', 'loadedmetadata', 'emptied', 'ended']) audio.addEventListener(event, sync);
  const observer = new MutationObserver(sync);
  for (const target of [title, artist, cover]) if (target) observer.observe(target, {childList:true, subtree:true});
  sync();
});

document.addEventListener('DOMContentLoaded', () => {
  const stage = document.querySelector('.home-planet-stage');
  const front = stage?.querySelector('.home-ring-front path');
  const back = stage?.querySelector('.home-ring-back path');
  const audio = document.getElementById('audioPlayer');
  const home = document.getElementById('mainHome');
  if (!front || !back || !audio) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const bins = new Uint8Array(64);
  let lastFrame = 0, staticDrawn = false;
  function curve(start, time, live) {
    const points = [], tilt = -.32, cos = Math.cos(tilt), sin = Math.sin(tilt);
    for (let i = 0; i <= 80; i++) {
      const angle = start + i / 80 * Math.PI;
      const energy = live ? bins[Math.min(bins.length - 1, Math.floor(i / 80 * 42))] / 255 : 0;
      const wave = motion.matches ? 0 : Math.sin(angle * 24 - time * .0018) * (1.6 + energy * 7);
      const x = (291 + wave) * Math.cos(angle), y = (105 + wave * .55) * Math.sin(angle);
      points.push(`${i ? 'L' : 'M'}${(300 + x * cos - y * sin).toFixed(2)},${(300 + x * sin + y * cos).toFixed(2)}`);
    }
    return points.join(' ');
  }
  function frame(time) {
    requestAnimationFrame(frame);
    if (time - lastFrame < 40 || document.hidden || home.style.display === 'none') return;
    if (motion.matches && staticDrawn) return;
    lastFrame = time;
    const analyser = window.sonoraAudioAnalyser;
    const live = analyser && !audio.paused && !motion.matches;
    if (live) analyser.getByteFrequencyData(bins);
    front.setAttribute('d', curve(0, time, live));
    back.setAttribute('d', curve(Math.PI, time, live));
    staticDrawn = motion.matches;
  }
  motion.addEventListener('change', () => { staticDrawn = false; });
  requestAnimationFrame(frame);
});
