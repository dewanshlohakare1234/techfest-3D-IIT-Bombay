import { Techfest3DScene } from './scene3d.js';
import { soundEngine } from './audio.js';
import { PassGenerator } from './passGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D WebGL Scene
  const container = document.getElementById('webgl-canvas-container');
  const scene3d = new Techfest3DScene(container);

  // 2. Initialize 3D Holographic Pass Generator
  new PassGenerator();

  // 3. Custom Reticle Cursor
  const cursorDot = document.getElementById('custom-cursor-dot');
  const cursorRing = document.getElementById('custom-cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    if (cursorRing) {
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover sound & cursor expanding
  const hoverables = document.querySelectorAll('button, a, input, select, .arena-card, .timeline-item');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      soundEngine.playHover();
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
    el.addEventListener('click', () => {
      soundEngine.playClick();
    });
  });

  // 4. Audio Engine Toggle HUD
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const soundBars = document.getElementById('sound-bars');
  const audioLabel = document.getElementById('audio-status-label');

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      const active = soundEngine.toggle();
      if (active) {
        soundBars.classList.add('sound-active');
        audioLabel.textContent = 'AUDIO: ON';
        audioToggleBtn.classList.add('border-cyan-400');
      } else {
        soundBars.classList.remove('sound-active');
        audioLabel.textContent = 'AUDIO: MUTED';
        audioToggleBtn.classList.remove('border-cyan-400');
      }
    });
  }

  // 5. Autopilot Tour Mode
  const autopilotBtn = document.getElementById('autopilot-toggle-btn');
  if (autopilotBtn) {
    autopilotBtn.addEventListener('click', () => {
      const isAuto = scene3d.toggleAutopilot();
      if (isAuto) {
        autopilotBtn.textContent = '⏸ CANCEL TOUR';
        autopilotBtn.classList.add('hud-btn-secondary');
      } else {
        autopilotBtn.textContent = '▶ AUTOPILOT TOUR';
        autopilotBtn.classList.remove('hud-btn-secondary');
      }
    });
  }

  // 6. Scroll Progress HUD & Telemetry
  const progressBar = document.getElementById('scroll-progress-hud');
  const telemetryDepth = document.getElementById('telemetry-depth');
  const telemetryFps = document.getElementById('telemetry-fps');

  // FPS calculation
  let frameCount = 0;
  let lastTime = performance.now();
  function updateFps() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastTime));
      if (telemetryFps) telemetryFps.textContent = `${fps} FPS`;
      frameCount = 0;
      lastTime = now;
    }
    requestAnimationFrame(updateFps);
  }
  requestAnimationFrame(updateFps);

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) : 0;
    
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }
    if (telemetryDepth) {
      const depthVal = Math.round(progress * 100);
      telemetryDepth.textContent = `SECTOR Z-${depthVal.toString().padStart(3, '0')}`;
    }
  });

  // 7. Arena Card Interaction with 3D Scene
  const arenaCards = document.querySelectorAll('.arena-card');
  arenaCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const arenaId = card.getAttribute('data-arena');
      if (arenaId) {
        scene3d.focusArena(arenaId);
      }
    });
  });

  // 8. 3D Lab Playground Controls
  // Theme Buttons
  const themeBtns = document.querySelectorAll('.theme-pill-btn');
  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-theme');
      scene3d.setTheme(theme);
    });
  });

  // Geometry Buttons
  const geoBtns = document.querySelectorAll('.geo-pill-btn');
  geoBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      geoBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const geo = btn.getAttribute('data-geo');
      scene3d.setCoreGeometry(geo);
    });
  });

  // Sliders
  const speedSlider = document.getElementById('lab-speed-slider');
  const speedVal = document.getElementById('lab-speed-val');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      scene3d.setSpeed(e.target.value);
      if (speedVal) speedVal.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
    });
  }

  const turbSlider = document.getElementById('lab-turb-slider');
  const turbVal = document.getElementById('lab-turb-val');
  if (turbSlider) {
    turbSlider.addEventListener('input', (e) => {
      scene3d.setParticleTurbulence(e.target.value);
      if (turbVal) turbVal.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
    });
  }

  const wireToggle = document.getElementById('lab-wireframe-toggle');
  if (wireToggle) {
    wireToggle.addEventListener('change', (e) => {
      scene3d.setWireframe(e.target.checked);
      soundEngine.playClick();
    });
  }

  // Smooth Navigation Anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
