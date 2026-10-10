import { soundEngine } from './audio.js';
import confetti from 'canvas-confetti';

export class PassGenerator {
  constructor() {
    this.card = document.getElementById('pass-card');
    this.nameInput = document.getElementById('pass-name-input');
    this.roleSelect = document.getElementById('pass-role-select');
    this.displayName = document.getElementById('pass-display-name');
    this.displayRole = document.getElementById('pass-display-role');
    this.displayId = document.getElementById('pass-display-id');
    this.generateBtn = document.getElementById('pass-generate-btn');

    this.init();
  }

  init() {
    if (!this.card) return;

    // 3D Parallax tilt effect for holographic pass
    this.card.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.card.addEventListener('mouseleave', () => this.handleMouseLeave());

    if (this.nameInput) {
      this.nameInput.addEventListener('input', (e) => {
        this.displayName.textContent = e.target.value.trim() || 'AGENT_ZERO';
      });
    }

    if (this.roleSelect) {
      this.roleSelect.addEventListener('change', (e) => {
        this.displayRole.textContent = e.target.value;
        soundEngine.playHover();
      });
    }

    if (this.generateBtn) {
      this.generateBtn.addEventListener('click', () => this.generateBadge());
    }

    // Default Random ID
    this.refreshPassId();
  }

  refreshPassId() {
    const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
    if (this.displayId) {
      this.displayId.textContent = `CP-${hex}-2026`;
    }
  }

  handleMouseMove(e) {
    const rect = this.card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -16;
    const rotateY = ((x - centerX) / centerX) * 16;

    this.card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;

    // Holographic Sheen Highlight position
    const shine = this.card.querySelector('.pass-shine');
    if (shine) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255, 255, 255, 0.45), rgba(0, 240, 255, 0.2) 30%, transparent 70%)`;
      shine.style.opacity = '1';
    }
  }

  handleMouseLeave() {
    this.card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    const shine = this.card.querySelector('.pass-shine');
    if (shine) {
      shine.style.opacity = '0';
    }
  }

  generateBadge() {
    soundEngine.playWarp();
    this.refreshPassId();

    // Trigger cyber celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#00f0ff', '#ff0055', '#7928ca', '#ffffff']
      });
    } catch (e) {}

    const badgeStatus = document.getElementById('pass-status-indicator');
    if (badgeStatus) {
      badgeStatus.textContent = 'ACCESS GRANTED // VERIFIED ON QUANTUM LEDGER';
      badgeStatus.classList.add('text-cyan-400');
    }
  }
}
