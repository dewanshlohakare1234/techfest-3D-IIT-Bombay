const fs = require('fs');
const path = require('path');

function createPDF() {
  const objects = [];
  
  function addObject(content) {
    objects.push(content);
    return objects.length;
  }

  function createPageContent(drawCallback) {
    const stream = [];
    const ctx = {
      rect: (x, y, w, h, r, g, b, fill = true) => {
        stream.push(`q ${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re ${fill ? 'f' : ''} Q`);
      },
      text: (x, y, text, font = 'F1', size = 11, r = 0.1, g = 0.1, b = 0.1) => {
        const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
        stream.push(`BT /${font} ${size} Tf ${r} ${g} ${b} rg ${x} ${y} Td (${escaped}) Tj ET`);
      },
      line: (x1, y1, x2, y2, r = 0.8, g = 0.8, b = 0.8, width = 1) => {
        stream.push(`q ${r} ${g} ${b} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S Q`);
      }
    };
    drawCallback(ctx);
    return stream.join('\n');
  }

  // SINGLE CLEAN 1-PAGE PRESENTATION SHOWCASE
  const page1 = createPageContent((c) => {
    // Hero Banner Card
    c.rect(40, 680, 515, 120, 0.02, 0.05, 0.1);
    
    // Cyan Accent Tag
    c.rect(60, 765, 145, 18, 0, 0.94, 1);
    c.text(68, 771, 'TECHFEST 2026 SHOWCASE', 'F2', 8, 0.02, 0.05, 0.1);

    // Title
    c.text(60, 725, 'CYBERPULSE', 'F2', 32, 1, 1, 1);
    c.text(60, 702, '3D Interactive Web Platform - Beyond Human Horizons', 'F1', 11, 0.6, 0.75, 0.9);

    // Section 1: Overview
    c.text(40, 650, 'PROJECT CONCEPT & OVERVIEW', 'F2', 12, 0.05, 0.1, 0.2);
    c.rect(40, 642, 515, 2, 0, 0.94, 1);

    c.text(40, 622, 'CYBERPULSE is an interactive 3D web experience designed for Techfest 2026. Instead of a standard', 'F1', 10, 0.2, 0.25, 0.3);
    c.text(40, 608, 'static landing page, it delivers an exploratory sci-fi universe showcasing futuristic robotics, quantum', 'F1', 10, 0.2, 0.25, 0.3);
    c.text(40, 594, 'computing, and AI. Built entirely with real-time WebGL and procedural audio, visitors can interact with', 'F1', 10, 0.2, 0.25, 0.3);
    c.text(40, 580, '3D objects, explore spatial sectors, customize simulations, and generate digital credentials.', 'F1', 10, 0.2, 0.25, 0.3);

    // Section 2: Features (6 Cards)
    c.text(40, 545, 'KEY 3D FEATURES & USER INTERACTIONS', 'F2', 12, 0.05, 0.1, 0.2);
    c.rect(40, 537, 515, 2, 0, 0.94, 1);

    // Feature 1
    c.rect(40, 440, 248, 85, 0.96, 0.97, 0.99);
    c.text(50, 505, '1. 3D Quantum Reactor', 'F2', 10, 0.05, 0.1, 0.2);
    c.text(50, 488, 'Procedural rotating core inside a wireframe', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(50, 474, 'dodecahedron and gimbal rings with 8 satellites.', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(50, 460, 'Clicking triggers expanding 3D shockwaves.', 'F1', 8.5, 0.3, 0.35, 0.4);

    // Feature 2
    c.rect(307, 440, 248, 85, 0.96, 0.97, 0.99);
    c.text(317, 505, '2. Cinematic 3D Scroll Journey', 'F2', 10, 0.05, 0.1, 0.2);
    c.text(317, 488, 'Camera glides smoothly along a curved 3D', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(317, 474, 'flight track as you scroll, traversing five spatial', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(317, 460, 'sectors from the Core to the Terminal.', 'F1', 8.5, 0.3, 0.35, 0.4);

    // Feature 3
    c.rect(40, 345, 248, 85, 0.96, 0.97, 0.99);
    c.text(50, 410, '3. 3D Competition Arenas', 'F2', 10, 0.05, 0.1, 0.2);
    c.text(50, 393, 'Interactive 3D models for festival events:', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(50, 379, 'RoboWars Core, AI Nexus Sphere, Drone', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(50, 365, 'Turbine, and CyberSec Cryptographic Tesseract.', 'F1', 8.5, 0.3, 0.35, 0.4);

    // Feature 4
    c.rect(307, 345, 248, 85, 0.96, 0.97, 0.99);
    c.text(317, 410, '4. Real-Time 3D Simulation Lab', 'F2', 10, 0.05, 0.1, 0.2);
    c.text(317, 393, 'Interactive playground allowing visitors to alter', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(317, 379, 'core geometry, toggle wireframe mode, adjust', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(317, 365, 'speed, and switch between 4 neon color themes.', 'F1', 8.5, 0.3, 0.35, 0.4);

    // Feature 5
    c.rect(40, 250, 248, 85, 0.96, 0.97, 0.99);
    c.text(50, 315, '5. 3D Holographic Attendee Pass', 'F2', 10, 0.05, 0.1, 0.2);
    c.text(50, 298, 'Digital pass with gyroscopic 3D mouse tilt and', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(50, 284, 'dynamic specular shine. Users can input name', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(50, 270, 'and division to mint with celebratory confetti.', 'F1', 8.5, 0.3, 0.35, 0.4);

    // Feature 6
    c.rect(307, 250, 248, 85, 0.96, 0.97, 0.99);
    c.text(317, 315, '6. Procedural Audio Synthesizer', 'F2', 10, 0.05, 0.1, 0.2);
    c.text(317, 298, 'Zero external sound assets. Procedurally', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(317, 284, 'synthesizes ambient sub-bass drone, UI hover', 'F1', 8.5, 0.3, 0.35, 0.4);
    c.text(317, 270, 'chirps, and shockwave pulses via Web Audio API.', 'F1', 8.5, 0.3, 0.35, 0.4);

    // Section 3: Autopilot
    c.text(40, 215, 'AUTOMATED PRESENTATION MODE', 'F2', 12, 0.05, 0.1, 0.2);
    c.rect(40, 207, 515, 2, 0, 0.94, 1);

    c.text(40, 187, 'Includes a built-in "AUTOPILOT TOUR" mode in the navigation bar. When activated, the 3D camera', 'F1', 10, 0.2, 0.25, 0.3);
    c.text(40, 173, 'automatically glides through all spatial sectors on a smooth flight path for effortless demonstration.', 'F1', 10, 0.2, 0.25, 0.3);

    // Section 4: Technology
    c.text(40, 140, 'TECHNOLOGY STACK & PERFORMANCE', 'F2', 12, 0.05, 0.1, 0.2);
    c.rect(40, 132, 515, 2, 0, 0.94, 1);

    c.text(40, 112, 'Delivers a consistent 60 FPS utilizing Three.js and hardware-accelerated WebGL. Packaged cleanly as a', 'F1', 10, 0.2, 0.25, 0.3);
    c.text(40, 98, 'single, self-contained HTML file with zero build setup, runs instantly on any standard web browser.', 'F1', 10, 0.2, 0.25, 0.3);

    // Tech badges
    const badges = ['Three.js', 'WebGL2', 'Web Audio API', 'CSS 3D Transforms', '60 FPS WebGL', 'Single-File HTML'];
    let bx = 40;
    badges.forEach(b => {
      const bw = b.length * 6.8 + 14;
      c.rect(bx, 68, bw, 18, 0.92, 0.94, 0.96);
      c.text(bx + 7, 73, b, 'F2', 8, 0.15, 0.2, 0.3);
      bx += bw + 8;
    });
  });

  const pageContents = [page1];

  // 1: Catalog, 2: Pages, 3: F1 (Helvetica), 4: F2 (Helvetica-Bold)
  addObject(`<< /Type /Catalog /Pages 2 0 R >>`);
  addObject(`<< /Type /Pages /Kids [ 5 0 R ] /Count 1 >>`);
  addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
  addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);

  // Page 1 Object
  addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 6 0 R >>`);

  // Page 1 Content Stream
  const streamLen = Buffer.byteLength(page1, 'utf8');
  addObject(`<< /Length ${streamLen} >>\nstream\n${page1}\nendstream`);

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [0];

  objects.forEach((obj, idx) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const off = String(offsets[i]).padStart(10, '0');
    pdf += `${off} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const outPath = path.join(__dirname, 'Techfest_3D_Project_Report.pdf');
  fs.writeFileSync(outPath, pdf, 'binary');
  console.log('Clean presentation PDF generated successfully at:', outPath);
}

createPDF();
