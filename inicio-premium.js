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

/* One shared analyser; the orbit reads the actual track, never a second audio source. */
document.addEventListener('DOMContentLoaded', () => {
  const stage = document.querySelector('.home-planet-stage');
  const front = stage?.querySelector('.home-ring-front path');
  const back = stage?.querySelector('.home-ring-back path');
  const audio = document.getElementById('audioPlayer');
  const home = document.getElementById('mainHome');
  if (!front || !back || !audio || !home) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const svgNS = 'http://www.w3.org/2000/svg';
  const ticks = Array.from({length:36}, () => {
    const line = document.createElementNS(svgNS, 'line');
    stage.querySelector('.home-orbit-spectrum')?.appendChild(line);
    return line;
  });
  const echoes = [front, back].map(path => [1, 2].map(layer => {
    const echo = path.cloneNode(false);
    echo.classList.add('home-ring-echo');
    echo.setAttribute('stroke-width', layer === 1 ? '1' : '.7');
    path.parentNode.insertBefore(echo, path);
    return echo;
  }));
  const lights = [front, back].map(path => {
    const light = document.createElementNS(svgNS, 'circle');
    light.classList.add('home-orbit-light');
    light.setAttribute('r', '2.4');
    path.parentNode.appendChild(light);
    return light;
  });
  const levels = new Float32Array(36);
  let frequency = new Uint8Array(0), waveform = new Uint8Array(0);
  let raf = 0, lastFrame = 0, inView = true, bass = 0, energy = 0;
  let clock = 0;
  const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
  function point(angle, radius, wave, tilt) {
    const x = (291 + radius + wave) * Math.cos(angle);
    const y = (105 + radius * .32 + wave * .55) * Math.sin(angle);
    return [300 + x * Math.cos(tilt) - y * Math.sin(tilt), 300 + x * Math.sin(tilt) + y * Math.cos(tilt)];
  }
  function sample(analyser, live, dt) {
    if (analyser && frequency.length !== analyser.frequencyBinCount) {
      frequency = new Uint8Array(analyser.frequencyBinCount);
      waveform = new Uint8Array(analyser.fftSize);
    }
    if (live) {
      analyser.getByteFrequencyData(frequency);
      analyser.getByteTimeDomainData(waveform);
    }
    const hzPerBin = analyser ? analyser.context.sampleRate / analyser.fftSize : 1;
    let low = 0, lowCount = 0, rms = 0;
    if (live) {
      for (let i = 1; i < frequency.length && i * hzPerBin <= 180; i++) {
        low += frequency[i] / 255; lowCount++;
      }
      for (const value of waveform) rms += ((value - 128) / 128) ** 2;
      rms = Math.sqrt(rms / waveform.length);
    }
    const follow = (from, to) => from + (to - from) * (1 - Math.exp(-dt / (to > from ? 85 : 280)));
    bass = follow(bass, live ? low / Math.max(1, lowCount) : 0);
    energy = follow(energy, live ? clamp(rms * 3, 0, 1) : 0);
    for (let i = 0; i < levels.length; i++) {
      const lo = 65 * (10000 / 65) ** (i / levels.length);
      const hi = 65 * (10000 / 65) ** ((i + 1) / levels.length);
      const a = clamp(Math.floor(lo / hzPerBin), 1, Math.max(1, frequency.length - 1));
      const b = clamp(Math.ceil(hi / hzPerBin), a, Math.max(a, frequency.length - 1));
      let sum = 0;
      if (live) for (let k = a; k <= b; k++) sum += frequency[k] / 255;
      levels[i] = follow(levels[i], live ? (sum / (b - a + 1)) ** 1.7 : 0);
    }
  }
  function draw(dt) {
    const reduced = motion.matches;
    const analyser = window.sonoraAudioAnalyser;
    const live = !!analyser && !audio.paused && !audio.ended && !reduced;
    sample(analyser, live, dt);
    const tilt = -.32 + (reduced ? 0 : Math.sin(clock * .00017) * .025);
    const waveAt = angle => reduced ? 0 : Math.sin(angle * 18 - clock * .0012) * (.25 + energy * 3.5)
      + Math.sin(angle * 9 + clock * .0008) * bass * 1.5;
    function curve(start, offset) {
      const points = [];
      for (let i = 0; i <= 120; i++) {
        const angle = start + i / 120 * Math.PI;
        const [x,y] = point(angle, offset, waveAt(angle), tilt);
        points.push(`${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`);
      }
      return points.join(' ');
    }
    [front, back].forEach((path, side) => {
      path.setAttribute('d', curve(side * Math.PI, 0));
      echoes[side].forEach((echo, layer) => {
        echo.setAttribute('d', curve(side * Math.PI, (layer + 1) * (5 + energy * 7)));
        echo.style.opacity = (.08 + energy * .2 - layer * .025).toFixed(3);
      });
      const angle = side * Math.PI + (reduced ? .6 : clock * .00014 % Math.PI);
      const [x,y] = point(angle, 0, waveAt(angle), tilt);
      lights[side].setAttribute('cx', x.toFixed(2));
      lights[side].setAttribute('cy', y.toFixed(2));
    });
    ticks.forEach((line, i) => {
      const angle = .18 + i / 35 * (Math.PI - .36);
      const [x,y] = point(angle, 0, waveAt(angle), tilt);
      const height = 3 + levels[i] * 48;
      line.setAttribute('x1', x.toFixed(2)); line.setAttribute('x2', x.toFixed(2));
      line.setAttribute('y1', (y-height).toFixed(2)); line.setAttribute('y2', (y+height*.18).toFixed(2));
      line.style.opacity = (.3 + levels[i] * .65).toFixed(3);
    });
    stage.style.setProperty('--planet-bass', bass.toFixed(4));
    stage.style.setProperty('--planet-energy', energy.toFixed(4));
    stage.dataset.audioState = audio.paused || audio.ended ? 'paused' : 'playing';
  }
  function visible() { return inView && !document.hidden && home.style.display !== 'none'; }
  function frame(time) {
    raf = 0;
    if (!visible()) return;
    if (time - lastFrame >= 33) {
      const dt = clamp(lastFrame ? time - lastFrame : 33, 16, 80);
      lastFrame = time; clock += dt;
      draw(dt);
    }
    raf = requestAnimationFrame(frame);
  }
  function schedule() {
    cancelAnimationFrame(raf); raf = 0; lastFrame = 0;
    stage.dataset.motion = visible() ? 'active' : 'rest';
    if (!visible()) return;
    if (motion.matches) { bass = energy = 0; levels.fill(0); draw(33); }
    else raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting; schedule();
  }, {rootMargin:'60px'}).observe(stage);
  new MutationObserver(schedule).observe(home, {attributes:true, attributeFilter:['style','hidden']});
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', schedule);
  for (const event of ['play','pause','ended','emptied']) audio.addEventListener(event, schedule);
  schedule();
});
