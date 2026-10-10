import * as THREE from 'three';
import { soundEngine } from './audio.js';

export class Techfest3DScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Mouse & Parallax tracking
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.raycaster = new THREE.Raycaster();
    this.mouseVec = new THREE.Vector2();

    // Scroll state
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;

    // Autopilot state
    this.isAutopilot = false;
    this.autopilotTime = 0;

    // Objects
    this.reactorGroup = null;
    this.coreMesh = null;
    this.outerCage = null;
    this.ring1 = null;
    this.ring2 = null;
    this.satellites = [];
    this.particleSystem = null;
    this.particlePositions = null;
    this.arenaObjects = [];
    this.gridPlane = null;
    this.shockwaves = [];

    // Themes
    this.themes = {
      cyberpunk: {
        primary: 0x00f0ff,   // Cyan
        secondary: 0xff0055, // Neon Magenta
        accent: 0x7928ca,    // Electric Purple
        fog: 0x05070f,
        bg: 0x030712
      },
      quantum: {
        primary: 0x8a2be2,   // Purple
        secondary: 0x00d2ff, // Electric Sky
        accent: 0xffffff,
        fog: 0x040212,
        bg: 0x02010a
      },
      matrix: {
        primary: 0x00ff66,   // Matrix Green
        secondary: 0x00aa44,
        accent: 0xaaff00,
        fog: 0x020f06,
        bg: 0x010803
      },
      solar: {
        primary: 0xff7700,   // Solar Amber
        secondary: 0xff0033, // Crimson
        accent: 0xffdd00,
        fog: 0x120703,
        bg: 0x0a0301
      }
    };
    this.currentThemeKey = 'cyberpunk';
    this.theme = this.themes.cyberpunk;

    // Parameters for Interactive Lab
    this.params = {
      speed: 1.0,
      wireframe: false,
      coreGeometry: 'torusKnot',
      particleTurbulence: 1.0
    };

    this.init();
  }

  init() {
    // 1. Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.theme.bg);
    this.scene.fog = new THREE.FogExp2(this.theme.fog, 0.015);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(55, this.width / this.height, 0.1, 1500);
    this.camera.position.set(0, 0, 24);

    // 3. Renderer with antialiasing
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    this.setupLighting();

    // 5. Build 3D Entities
    this.createQuantumReactor();
    this.createParticleVortex();
    this.createArenaHolograms();
    this.createCyberGrid();

    // 6. Event Listeners
    this.bindEvents();

    // 7. Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.pointLight1 = new THREE.PointLight(this.theme.primary, 4, 60);
    this.pointLight1.position.set(10, 10, 10);
    this.scene.add(this.pointLight1);

    this.pointLight2 = new THREE.PointLight(this.theme.secondary, 4, 60);
    this.pointLight2.position.set(-10, -10, 5);
    this.scene.add(this.pointLight2);

    this.coreLight = new THREE.PointLight(this.theme.primary, 5, 25);
    this.coreLight.position.set(0, 0, 0);
    this.scene.add(this.coreLight);
  }

  createQuantumReactor() {
    this.reactorGroup = new THREE.Group();
    this.reactorGroup.position.set(0, 0, 0);

    // 1. Core mesh
    this.createCoreGeometry(this.params.coreGeometry);

    // 2. Outer Wireframe Cage (Dodecahedron)
    const cageGeo = new THREE.DodecahedronGeometry(5.2, 1);
    this.cageMat = new THREE.MeshStandardMaterial({
      color: this.theme.secondary,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2
    });
    this.outerCage = new THREE.Mesh(cageGeo, this.cageMat);
    this.reactorGroup.add(this.outerCage);

    // 3. Gimbal Gyroscope Rings (Torus)
    const ring1Geo = new THREE.TorusGeometry(6.6, 0.08, 16, 100);
    this.ring1Mat = new THREE.MeshBasicMaterial({
      color: this.theme.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    this.ring1 = new THREE.Mesh(ring1Geo, this.ring1Mat);
    this.ring1.rotation.x = Math.PI / 3;
    this.reactorGroup.add(this.ring1);

    const ring2Geo = new THREE.TorusGeometry(8.2, 0.07, 16, 100);
    this.ring2Mat = new THREE.MeshBasicMaterial({
      color: this.theme.accent,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    this.ring2 = new THREE.Mesh(ring2Geo, this.ring2Mat);
    this.ring2.rotation.y = Math.PI / 4;
    this.reactorGroup.add(this.ring2);

    // 4. Orbiting satellite nodes
    const satelliteGeo = new THREE.SphereGeometry(0.2, 16, 16);
    this.satellitesMat = new THREE.MeshStandardMaterial({
      color: this.theme.primary,
      emissive: this.theme.primary,
      emissiveIntensity: 0.8
    });

    const satCount = 8;
    for (let i = 0; i < satCount; i++) {
      const satMesh = new THREE.Mesh(satelliteGeo, this.satellitesMat);
      const angle = (i / satCount) * Math.PI * 2;
      const radius = 9.2 + Math.sin(i) * 0.8;
      satMesh.userData = { angle, radius, speed: 0.4 + i * 0.08 };
      this.satellites.push(satMesh);
      this.reactorGroup.add(satMesh);
    }

    this.scene.add(this.reactorGroup);
  }

  createCoreGeometry(type) {
    if (this.coreMesh) {
      this.reactorGroup.remove(this.coreMesh);
      this.coreMesh.geometry.dispose();
    }

    let geo;
    if (type === 'torusKnot') {
      geo = new THREE.TorusKnotGeometry(2.4, 0.7, 120, 18);
    } else if (type === 'sphere') {
      geo = new THREE.IcosahedronGeometry(3.2, 4);
    } else if (type === 'crystal') {
      geo = new THREE.OctahedronGeometry(3.6, 2);
    } else {
      geo = new THREE.TorusGeometry(3.0, 1.0, 32, 100);
    }

    this.coreMat = new THREE.MeshStandardMaterial({
      color: this.theme.primary,
      roughness: 0.15,
      metalness: 0.85,
      wireframe: this.params.wireframe,
      emissive: this.theme.primary,
      emissiveIntensity: 0.35
    });

    this.coreMesh = new THREE.Mesh(geo, this.coreMat);
    this.reactorGroup.add(this.coreMesh);
  }

  createParticleVortex() {
    const particleCount = 4500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cPrimary = new THREE.Color(this.theme.primary);
    const cSecondary = new THREE.Color(this.theme.secondary);
    const cAccent = new THREE.Color(this.theme.accent);

    for (let i = 0; i < particleCount; i++) {
      // Cylinder / vortex distribution
      const radius = 2 + Math.random() * 55;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 120;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = z;

      // Color gradation
      const mixRatio = Math.random();
      const mixedColor = mixRatio > 0.5 
        ? cPrimary.clone().lerp(cSecondary, Math.random()) 
        : cSecondary.clone().lerp(cAccent, Math.random());

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particlePositions = positions;

    // Particle sprite using canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(0,240,255,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    this.particleMat = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85
    });

    this.particleSystem = new THREE.Points(geometry, this.particleMat);
    this.scene.add(this.particleSystem);
  }

  createArenaHolograms() {
    // 4 Interactive 3D Objects situated for Sectors
    const arenaDefs = [
      {
        name: 'robowars',
        type: 'octahedron',
        pos: new THREE.Vector3(-9, -20, -15),
        color: 0xff0055,
        title: 'ROBOWARS'
      },
      {
        name: 'ai-hackathon',
        type: 'neuralSphere',
        pos: new THREE.Vector3(9, -32, -22),
        color: 0x00f0ff,
        title: 'AI NEXUS'
      },
      {
        name: 'drone-prix',
        type: 'turbine',
        pos: new THREE.Vector3(-8, -44, -30),
        color: 0xffaa00,
        title: 'DRONE GRAND PRIX'
      },
      {
        name: 'cyber-ctf',
        type: 'tesseract',
        pos: new THREE.Vector3(8, -56, -38),
        color: 0xaa00ff,
        title: 'CYBERSEC CTF'
      }
    ];

    arenaDefs.forEach((def) => {
      const group = new THREE.Group();
      group.position.copy(def.pos);
      group.userData = { id: def.name, title: def.title, originalScale: 1.0, hoverScale: 1.4 };

      let mainMesh;
      if (def.type === 'octahedron') {
        const geo = new THREE.OctahedronGeometry(2.2, 0);
        const mat = new THREE.MeshStandardMaterial({
          color: def.color,
          roughness: 0.2,
          metalness: 0.9,
          wireframe: false,
          emissive: def.color,
          emissiveIntensity: 0.4
        });
        mainMesh = new THREE.Mesh(geo, mat);

        // Armor wireframe ring
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(3.2, 0.08, 8, 32),
          new THREE.MeshBasicMaterial({ color: def.color, wireframe: true })
        );
        group.add(ring);
      } else if (def.type === 'neuralSphere') {
        const geo = new THREE.IcosahedronGeometry(2.2, 2);
        const mat = new THREE.MeshStandardMaterial({
          color: def.color,
          wireframe: true,
          emissive: def.color,
          emissiveIntensity: 0.6
        });
        mainMesh = new THREE.Mesh(geo, mat);

        const innerCore = new THREE.Mesh(
          new THREE.SphereGeometry(1.2, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: def.color, emissiveIntensity: 0.8 })
        );
        group.add(innerCore);
      } else if (def.type === 'turbine') {
        const geo = new THREE.CylinderGeometry(2.4, 2.4, 0.8, 16);
        const mat = new THREE.MeshStandardMaterial({
          color: def.color,
          wireframe: true,
          metalness: 0.8
        });
        mainMesh = new THREE.Mesh(geo, mat);

        const propeller = new THREE.Mesh(
          new THREE.BoxGeometry(4.8, 0.3, 0.8),
          new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 })
        );
        group.add(propeller);
      } else {
        // Tesseract
        const outerBox = new THREE.BoxGeometry(2.6, 2.6, 2.6);
        const mat = new THREE.MeshStandardMaterial({
          color: def.color,
          wireframe: true,
          emissive: def.color,
          emissiveIntensity: 0.5
        });
        mainMesh = new THREE.Mesh(outerBox, mat);

        const innerBox = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 1.4, 1.4),
          new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: false, emissive: def.color })
        );
        group.add(innerBox);
      }

      group.add(mainMesh);
      this.arenaObjects.push(group);
      this.scene.add(group);
    });
  }

  createCyberGrid() {
    const size = 180;
    const divisions = 60;
    this.gridPlane = new THREE.GridHelper(size, divisions, this.theme.primary, this.theme.accent);
    this.gridPlane.position.y = -68;
    this.gridPlane.position.z = -20;
    this.gridPlane.material.opacity = 0.22;
    this.gridPlane.material.transparent = true;
    this.scene.add(this.gridPlane);
  }

  triggerShockwave(origin) {
    soundEngine.playShockwave();

    const shockGeo = new THREE.RingGeometry(0.2, 0.8, 64);
    const shockMat = new THREE.MeshBasicMaterial({
      color: this.theme.primary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const shockMesh = new THREE.Mesh(shockGeo, shockMat);
    if (origin) {
      shockMesh.position.copy(origin);
    } else {
      shockMesh.position.set(0, 0, 5);
    }
    shockMesh.lookAt(this.camera.position);

    shockMesh.userData = {
      scale: 1,
      maxScale: 38,
      speed: 38
    };

    this.shockwaves.push(shockMesh);
    this.scene.add(shockMesh);
  }

  setTheme(themeKey) {
    if (!this.themes[themeKey]) return;
    this.currentThemeKey = themeKey;
    this.theme = this.themes[themeKey];

    // Update scene colors
    this.scene.background.set(this.theme.bg);
    this.scene.fog.color.set(this.theme.fog);
    this.pointLight1.color.set(this.theme.primary);
    this.pointLight2.color.set(this.theme.secondary);
    this.coreLight.color.set(this.theme.primary);

    if (this.coreMat) {
      this.coreMat.color.set(this.theme.primary);
      this.coreMat.emissive.set(this.theme.primary);
    }
    if (this.cageMat) this.cageMat.color.set(this.theme.secondary);
    if (this.ring1Mat) this.ring1Mat.color.set(this.theme.primary);
    if (this.ring2Mat) this.ring2Mat.color.set(this.theme.accent);
    if (this.satellitesMat) {
      this.satellitesMat.color.set(this.theme.primary);
      this.satellitesMat.emissive.set(this.theme.primary);
    }

    // Trigger pulse
    this.triggerShockwave(this.reactorGroup.position);
  }

  setSpeed(speedVal) {
    this.params.speed = parseFloat(speedVal);
  }

  setWireframe(isWire) {
    this.params.wireframe = isWire;
    if (this.coreMat) {
      this.coreMat.wireframe = isWire;
    }
  }

  setCoreGeometry(type) {
    this.params.coreGeometry = type;
    this.createCoreGeometry(type);
    soundEngine.playWarp();
  }

  setParticleTurbulence(val) {
    this.params.particleTurbulence = parseFloat(val);
  }

  focusArena(arenaId) {
    const targetObj = this.arenaObjects.find(obj => obj.userData.id === arenaId);
    if (!targetObj) return;

    soundEngine.playHover();
    targetObj.children.forEach(child => {
      if (child.material && child.material.emissiveIntensity !== undefined) {
        child.material.emissiveIntensity = 1.5;
      }
    });

    // Animate scale bounce
    targetObj.scale.set(1.4, 1.4, 1.4);
    setTimeout(() => {
      targetObj.scale.set(1.0, 1.0, 1.0);
    }, 450);
  }

  toggleAutopilot() {
    this.isAutopilot = !this.isAutopilot;
    soundEngine.playClick();
    return this.isAutopilot;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
      this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;
      this.mouseVec.x = this.mouse.targetX;
      this.mouseVec.y = this.mouse.targetY;
    });

    window.addEventListener('scroll', () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        this.targetScrollProgress = window.scrollY / maxScroll;
      }
    });

    // Click in viewport to shockwave
    this.renderer.domElement.addEventListener('click', (e) => {
      // Unproject mouse coordinate to 3D space
      this.mouseVec.x = (e.clientX / this.width) * 2 - 1;
      this.mouseVec.y = -(e.clientY / this.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouseVec, this.camera);

      const targetPos = new THREE.Vector3();
      this.raycaster.ray.at(15, targetPos);
      this.triggerShockwave(targetPos);
    });
  }

  updateCamera() {
    if (this.isAutopilot) {
      this.autopilotTime += 0.005;
      const t = (Math.sin(this.autopilotTime) + 1) / 2; // 0 to 1 loop
      this.scrollProgress = t;
    } else {
      // Smooth lerp to scroll position
      this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;
    }

    // Parallax mouse influence
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    // Cinematic camera trajectory based on scroll
    // Sector 0: (0, 0, 24) -> The Core
    // Sector 1: (0, -22, 12) -> Arena RoboWars
    // Sector 2: (0, -42, 10) -> Drone & Hackathon
    // Sector 3: (0, -58, 8) -> Cyber CTF & Grid
    // Sector 4: (0, -68, 6) -> Pass terminal
    const p = this.scrollProgress;

    const startZ = 24;
    const endZ = 12;
    const targetY = -p * 68;
    const targetZ = startZ - p * (startZ - endZ) + Math.sin(p * Math.PI * 4) * 2;

    this.camera.position.x = this.mouse.x * 2.5 + Math.sin(p * Math.PI * 2) * 4;
    this.camera.position.y = targetY + this.mouse.y * 1.5;
    this.camera.position.z = targetZ;

    // Look at point smoothly following the camera track
    const lookTarget = new THREE.Vector3(
      this.mouse.x * 1.5,
      targetY - 2,
      targetZ - 20
    );
    this.camera.lookAt(lookTarget);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    const speed = this.params.speed;

    // 1. Update Camera
    this.updateCamera();

    // 2. Rotate Quantum Reactor
    if (this.reactorGroup) {
      if (this.coreMesh) {
        this.coreMesh.rotation.x += 0.008 * speed;
        this.coreMesh.rotation.y += 0.012 * speed;
      }
      if (this.outerCage) {
        this.outerCage.rotation.x -= 0.004 * speed;
        this.outerCage.rotation.y += 0.006 * speed;
      }
      if (this.ring1) {
        this.ring1.rotation.z += 0.01 * speed;
      }
      if (this.ring2) {
        this.ring2.rotation.x += 0.008 * speed;
        this.ring2.rotation.y += 0.006 * speed;
      }

      // Gyroscopic tilt towards mouse
      this.reactorGroup.rotation.y = this.mouse.x * 0.45;
      this.reactorGroup.rotation.x = -this.mouse.y * 0.45;

      // Update orbiting satellites
      this.satellites.forEach((sat) => {
        sat.userData.angle += 0.018 * sat.userData.speed * speed;
        sat.position.x = Math.cos(sat.userData.angle) * sat.userData.radius;
        sat.position.y = Math.sin(sat.userData.angle * 1.4) * (sat.userData.radius * 0.7);
        sat.position.z = Math.sin(sat.userData.angle) * sat.userData.radius;
      });
    }

    // 3. Update Arena Hologram Objects
    this.arenaObjects.forEach((arena, idx) => {
      arena.rotation.y += (0.012 + idx * 0.004) * speed;
      arena.rotation.x += (0.008 + idx * 0.002) * speed;
      arena.position.y += Math.sin(elapsedTime * 2 + idx) * 0.015;
    });

    // 4. Update Particle Swarm with subtle turbulence
    if (this.particleSystem && this.particlePositions) {
      const positions = this.particleSystem.geometry.attributes.position.array;
      const count = positions.length / 3;
      const turb = this.params.particleTurbulence;

      for (let i = 0; i < count; i += 4) {
        // Subtle floating wave
        positions[i * 3 + 1] += Math.sin(elapsedTime * 1.5 + positions[i * 3]) * 0.015 * turb;
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
      this.particleSystem.rotation.y = elapsedTime * 0.01 * speed;
    }

    // 5. Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.userData.scale += sw.userData.speed * delta;
      sw.scale.set(sw.userData.scale, sw.userData.scale, sw.userData.scale);
      sw.material.opacity = Math.max(0, 1 - sw.userData.scale / sw.userData.maxScale);

      if (sw.userData.scale >= sw.userData.maxScale) {
        this.scene.remove(sw);
        sw.geometry.dispose();
        sw.material.dispose();
        this.shockwaves.splice(i, 1);
      }
    }

    // 6. Cyber Grid subtle drift
    if (this.gridPlane) {
      this.gridPlane.position.z = -20 + (Math.sin(elapsedTime * 0.5) * 2);
    }

    // 7. Render
    this.renderer.render(this.scene, this.camera);
  }
}
