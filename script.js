// ===== NAVBAR STICKY & TOGGLE =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navOverlay = document.getElementById('navOverlay');

function openMenu() {
  navMenu.classList.add('open');
  if (navOverlay) navOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  navMenu.classList.remove('open');
  if (navOverlay) navOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

navToggle.addEventListener('click', openMenu);

// Klik area gelap sebelah kiri → tutup menu
if (navOverlay) navOverlay.addEventListener('click', closeMenu);

// Close menu when clicking a link
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// ===== SMOOTH SCROLL =====
function scrollToElement(id) {
  const target = document.querySelector(id);
  if (target) {
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// Handle clicks on links starting with # or index.html#
document.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    const id = href.includes('#') ? '#' + href.split('#')[1] : null;

    if (id) {
      // If we're on the page mentioned in href (or current page is index and href is index.html#)
      const isSamePage = href.startsWith('#') ||
        (window.location.pathname.endsWith('index.html') && href.startsWith('index.html#')) ||
        (window.location.pathname === '/' && href.startsWith('index.html#'));

      if (isSamePage) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          scrollToElement(id);
        }
      }
    }
  });
});

// Handle hash on page load (e.g. coming from blog.html to index.html#booking)
window.addEventListener('load', () => {
  if (window.location.hash) {
    setTimeout(() => {
      scrollToElement(window.location.hash);
    }, 200); // Small delay to ensure layout is ready
  }
});

// ===== SCROLL-TO-TOP BUTTON =====
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('show');
  } else {
    scrollTopBtn.classList.remove('show');
  }
});
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== FADE-IN ON SCROLL (Intersection Observer) =====
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger delay for sibling cards
      const siblings = [...entry.target.parentElement.children];
      const index = siblings.indexOf(entry.target);
      const delay = index * 80;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));

// ===== TESTIMONIAL SLIDER =====
const track = document.getElementById('testimonialTrack');
const cards = track ? track.querySelectorAll('.testimonial-card') : [];
const dotsContainer = document.getElementById('testiDots');
let current = 0;
let autoSlide;

function buildDots() {
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });
}

function updateDots() {
  dotsContainer.querySelectorAll('.testi-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === current);
  });
}

function goTo(index) {
  current = (index + cards.length) % cards.length;
  track.style.transform = `translateX(-${current * 100}%)`;
  updateDots();
}

function startAuto() {
  autoSlide = setInterval(() => goTo(current + 1), 5000);
}

function stopAuto() {
  clearInterval(autoSlide);
}

if (cards.length > 0) {
  buildDots();
  document.getElementById('testiNext').addEventListener('click', () => { goTo(current + 1); stopAuto(); startAuto(); });
  document.getElementById('testiPrev').addEventListener('click', () => { goTo(current - 1); stopAuto(); startAuto(); });

  // Touch / swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    stopAuto(); startAuto();
  });

  startAuto();
}

// ===== BOOKING FORM VALIDATION =====
const bookingForm = document.getElementById('bookingForm');
const bookingSuccess = document.getElementById('bookingSuccess');
const bookAgainBtn = document.getElementById('bookAgain');

// Set minimum date to today
const bookDate = document.getElementById('bookDate');
if (bookDate) {
  const today = new Date().toISOString().split('T')[0];
  bookDate.setAttribute('min', today);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ['errName', 'errPhone', 'errService', 'errDate', 'errTime'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
    el.classList.remove('error');
  });
}

function markError(fieldId, errId, msg) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.add('error');
  showError(errId, msg);
}

if (bookingForm) {
  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('bookName').value.trim();
    const phone = document.getElementById('bookPhone').value.trim();
    const service = document.getElementById('bookService').value;
    const date = document.getElementById('bookDate').value;
    const time = document.getElementById('bookTime').value;

    let valid = true;

    if (!name || name.length < 3) {
      markError('bookName', 'errName', 'Nama harus diisi minimal 3 karakter.');
      valid = false;
    }

    if (!phone || !/^[0-9]{9,15}$/.test(phone.replace(/[\s\-]/g, ''))) {
      markError('bookPhone', 'errPhone', 'Masukkan nomor HP yang valid (9-15 digit).');
      valid = false;
    }

    if (!service) {
      markError('bookService', 'errService', 'Pilih layanan yang diinginkan.');
      valid = false;
    }

    if (!date) {
      markError('bookDate', 'errDate', 'Pilih tanggal kunjungan.');
      valid = false;
    }

    if (!time) {
      markError('bookTime', 'errTime', 'Pilih jam kunjungan.');
      valid = false;
    }

    if (!valid) return;

    // Format date nicely
    const dateFormatted = new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const serviceLabel = document.getElementById('bookService').options[document.getElementById('bookService').selectedIndex].text;

    const successMsg = document.getElementById('successMsg');
    successMsg.innerHTML = `
      Terima kasih, <strong>${name}</strong>!<br/>
      Booking <strong>${serviceLabel}</strong> pada<br/>
      <strong>${dateFormatted}</strong> pukul <strong>${time}</strong><br/>
      telah diterima. Kami akan menghubungi Anda di <strong>${phone}</strong> untuk konfirmasi.
    `;

    // Update WhatsApp link with booking details
    const waMsg = encodeURIComponent(
      `Halo WaysKidsHair Salon! Saya ${name} ingin booking:\n` +
      `Layanan: ${serviceLabel}\n` +
      `Tanggal: ${dateFormatted}\n` +
      `Jam: ${time}\n` +
      `No HP: ${phone}`
    );
    bookingSuccess.querySelector('.btn-wa').href = `https://wa.me/6281296782304?text=${waMsg}`;

    // Show success, hide form
    bookingForm.style.display = 'none';
    bookingSuccess.style.display = 'block';

    // Scroll to success
    bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (bookAgainBtn) {
  bookAgainBtn.addEventListener('click', () => {
    bookingForm.reset();
    bookingForm.style.display = 'block';
    bookingSuccess.style.display = 'none';
    clearErrors();
  });
}

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        document.querySelectorAll('.nav-link').forEach(l => l.style.fontWeight = '600');
        link.style.fontWeight = '800';
      }
    }
  });
});

/* =========================================================================
   ===== 3D BARBER SHOWCASE (AUTO-ROTATING AMBIENT 3D ENGINE) =====
   ========================================================================= */
function init3DBarberShowcase() {
  const canvas = document.getElementById('barber3dCanvas');
  const container = document.getElementById('hero3dCanvasBox');
  if (!canvas || !container || typeof THREE === 'undefined') return;

  // --- 1. Scene, Camera, Renderer ---
  const scene = new THREE.Scene();
  const width = container.clientWidth || 440;
  const height = container.clientHeight || 440;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0.25, 7.2);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // --- 2. OrbitControls (Smooth Auto-Rotate Muter Sendiri 360°) ---
  let controls;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true; // MUTER SENDIRI OTOMATIS
    controls.autoRotateSpeed = 2.2; // Kecepatan rotasi halus
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = (2 * Math.PI) / 3;
  }

  // --- 3. Studio Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  // Key Light (Warm Gold Specular)
  const keyLight = new THREE.DirectionalLight(0xfff0cc, 2.6);
  keyLight.position.set(6, 8, 5);
  scene.add(keyLight);

  // Fill Light (Neon Cyan)
  const fillLight = new THREE.DirectionalLight(0x70d6ff, 1.8);
  fillLight.position.set(-6, 4, -3);
  scene.add(fillLight);

  // Rim Light (Vibrant Magenta Glow)
  const rimLight = new THREE.PointLight(0xff3399, 3.5, 15);
  rimLight.position.set(0, -3.5, 3);
  scene.add(rimLight);

  // Top Light (Crisp White Highlights)
  const topLight = new THREE.PointLight(0xffffff, 2.2, 12);
  topLight.position.set(0, 6, 3);
  scene.add(topLight);

  // --- 4. High-End PBR Materials ---
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd000,
    metalness: 0.95,
    roughness: 0.12,
    envMapIntensity: 2.0
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f8ff,
    metalness: 0.98,
    roughness: 0.08
  });

  const rubyGemMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff1744,
    metalness: 0.1,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.4
  });

  const cyanGlossMaterial = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    metalness: 0.3,
    roughness: 0.15
  });

  const starMaterial = new THREE.MeshStandardMaterial({
    color: 0xffea00,
    emissive: 0xff9100,
    emissiveIntensity: 0.5,
    metalness: 0.7,
    roughness: 0.15
  });

  const bubbleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    roughness: 0.05,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  });

  // --- 5. Main 3D Models Master Group ---
  const mainStageGroup = new THREE.Group();
  scene.add(mainStageGroup);

  // ===== A. FLAWLESS 3D SCISSORS (SEAMLESS SINGLE-PIECE ARM EXTRUSION) =====
  const scissorsGroup = new THREE.Group();
  scissorsGroup.position.set(0.15, -0.1, 0.3);
  scissorsGroup.rotation.z = -Math.PI / 6;

  function createSeamlessScissorArm(hasTang) {
    const shape = new THREE.Shape();

    // 1. Blade Tip & Edge
    shape.moveTo(0, 2.35);
    shape.quadraticCurveTo(0.12, 1.5, 0.16, 0.35);
    shape.lineTo(0.24, 0.15);
    shape.quadraticCurveTo(0.3, 0.0, 0.28, -0.22);

    // 2. Shank descending to Finger Ring
    shape.quadraticCurveTo(0.26, -0.6, 0.48, -1.05);

    // 3. Pinky Tang if present
    if (hasTang) {
      shape.quadraticCurveTo(0.85, -1.12, 0.95, -0.92);
      shape.quadraticCurveTo(0.85, -1.25, 0.58, -1.35);
    }

    // 4. Outer Ring Curve
    shape.absarc(0.36, -1.5, 0.36, Math.PI / 4, (7 * Math.PI) / 4, false);

    // 5. Inner Shank rising back to Pivot Boss
    shape.quadraticCurveTo(0.12, -1.0, 0.08, -0.5);
    shape.quadraticCurveTo(0.04, -0.2, -0.12, 0.0);
    shape.lineTo(-0.06, 0.35);
    shape.quadraticCurveTo(-0.04, 1.5, 0, 2.35);

    // 6. Finger Ring Hole
    const ringHole = new THREE.Path();
    ringHole.absarc(0.36, -1.5, 0.23, 0, Math.PI * 2, true);
    shape.holes.push(ringHole);

    const extrudeSettings = {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -0.03);

    return geometry;
  }

  const armGeoWithTang = createSeamlessScissorArm(true);
  const armGeoWithoutTang = createSeamlessScissorArm(false);

  // Left Scissor Arm (Gold with Pinky Tang)
  const leftScissor = new THREE.Mesh(armGeoWithTang, goldMaterial);
  leftScissor.position.set(0, 0, 0.035);

  // Right Scissor Arm (Chrome mirrored)
  const rightScissor = new THREE.Mesh(armGeoWithoutTang, chromeMaterial);
  rightScissor.scale.x = -1;
  rightScissor.position.set(0, 0, -0.035);

  scissorsGroup.add(leftScissor);
  scissorsGroup.add(rightScissor);

  // Luxury Pivot Screw / Tension Dial at (0, 0, 0)
  const screwGroup = new THREE.Group();

  const screwBaseGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.16, 32);
  const screwBaseMesh = new THREE.Mesh(screwBaseGeo, chromeMaterial);
  screwBaseMesh.rotation.x = Math.PI / 2;
  screwGroup.add(screwBaseMesh);

  // Front Gold Dial Rim
  const screwRingGeo = new THREE.TorusGeometry(0.15, 0.03, 16, 32);
  const screwRingMesh = new THREE.Mesh(screwRingGeo, goldMaterial);
  screwRingMesh.position.z = 0.09;
  screwGroup.add(screwRingMesh);

  // Front Ruby Gem Centerpiece
  const gemGeo = new THREE.SphereGeometry(0.09, 24, 24);
  const gemMesh = new THREE.Mesh(gemGeo, rubyGemMaterial);
  gemMesh.position.z = 0.095;
  screwGroup.add(gemMesh);

  // Back Screw Nut
  const backNutGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 32);
  const backNutMesh = new THREE.Mesh(backNutGeo, chromeMaterial);
  backNutMesh.position.z = -0.09;
  backNutMesh.rotation.x = Math.PI / 2;
  screwGroup.add(backNutMesh);

  scissorsGroup.add(screwGroup);
  mainStageGroup.add(scissorsGroup);

  // ===== B. STYLIZED 3D BARBER COMB =====
  const combGroup = new THREE.Group();
  combGroup.position.set(0.65, -0.3, -0.7);
  combGroup.rotation.set(0.2, -0.35, 0.65);

  const spineShape = new THREE.Shape();
  spineShape.moveTo(-0.15, -1.3);
  spineShape.lineTo(0.15, -1.3);
  spineShape.lineTo(0.15, 1.3);
  spineShape.lineTo(-0.15, 1.3);
  spineShape.closePath();

  const spineGeo = new THREE.ExtrudeGeometry(spineShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.03,
    bevelThickness: 0.03
  });
  spineGeo.center();
  const combSpine = new THREE.Mesh(spineGeo, cyanGlossMaterial);
  combGroup.add(combSpine);

  const teethCount = 18;
  const toothWidth = 0.52;
  for (let i = 0; i < teethCount; i++) {
    const yPos = -1.1 + (i * (2.2 / (teethCount - 1)));
    const toothGeo = new THREE.BoxGeometry(toothWidth, 0.045, 0.06);
    const toothMesh = new THREE.Mesh(toothGeo, cyanGlossMaterial);
    toothMesh.position.set(toothWidth / 2 + 0.12, yPos, 0);
    combGroup.add(toothMesh);
  }

  mainStageGroup.add(combGroup);

  // ===== C. MINI BARBER POLE =====
  const poleGroup = new THREE.Group();
  poleGroup.position.set(-1.6, 0.1, -1.0);
  poleGroup.rotation.set(0.1, 0.4, -0.12);

  const poleCanvas = document.createElement('canvas');
  poleCanvas.width = 256;
  poleCanvas.height = 256;
  const ctx = poleCanvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = -256; i < 512; i += 64) {
    ctx.fillStyle = '#ff2a55';
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 32, 0);
    ctx.lineTo(i + 32 + 256, 256);
    ctx.lineTo(i + 256, 256);
    ctx.fill();

    ctx.fillStyle = '#0077ff';
    ctx.beginPath();
    ctx.moveTo(i + 32, 0);
    ctx.lineTo(i + 64, 0);
    ctx.lineTo(i + 64 + 256, 256);
    ctx.lineTo(i + 32 + 256, 256);
    ctx.fill();
  }

  const poleTexture = new THREE.CanvasTexture(poleCanvas);
  poleTexture.wrapS = THREE.RepeatWrapping;
  poleTexture.wrapT = THREE.RepeatWrapping;
  poleTexture.repeat.set(1, 2);

  const poleCylinderGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.0, 32);
  const poleMaterial = new THREE.MeshStandardMaterial({
    map: poleTexture,
    roughness: 0.1,
    metalness: 0.2
  });
  const poleMesh = new THREE.Mesh(poleCylinderGeo, poleMaterial);
  poleGroup.add(poleMesh);

  const glassCylinderGeo = new THREE.CylinderGeometry(0.42, 0.42, 2.2, 32);
  const poleGlass = new THREE.Mesh(glassCylinderGeo, bubbleMaterial);
  poleGroup.add(poleGlass);

  const capGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.15, 32);
  const topCap = new THREE.Mesh(capGeo, chromeMaterial);
  topCap.position.y = 1.08;
  poleGroup.add(topCap);

  const bottomCap = new THREE.Mesh(capGeo, chromeMaterial);
  bottomCap.position.y = -1.08;
  poleGroup.add(bottomCap);

  const finialGeo = new THREE.SphereGeometry(0.32, 24, 24);
  const topFinial = new THREE.Mesh(finialGeo, goldMaterial);
  topFinial.position.y = 1.32;
  poleGroup.add(topFinial);

  mainStageGroup.add(poleGroup);

  // ===== D. FLOATING 3D STARS & SPARKLES =====
  function create3DStarShape() {
    const starShape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.26;
    const innerRadius = 0.11;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    return new THREE.ExtrudeGeometry(starShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02
    });
  }

  const starGeo = create3DStarShape();
  const floatingItems = [];

  const starCoords = [
    { x: 1.5, y: 1.4, z: 0.8, scale: 0.85, speed: 1.2 },
    { x: -1.3, y: 1.6, z: 0.2, scale: 0.7, speed: 1.5 },
    { x: 1.6, y: -1.1, z: 0.5, scale: 0.75, speed: 0.9 },
    { x: -1.5, y: -1.2, z: 0.9, scale: 0.65, speed: 1.3 },
    { x: 0.3, y: 1.9, z: -0.4, scale: 0.7, speed: 1.1 }
  ];

  starCoords.forEach(pos => {
    const starMesh = new THREE.Mesh(starGeo, starMaterial);
    starMesh.position.set(pos.x, pos.y, pos.z);
    starMesh.scale.set(pos.scale, pos.scale, pos.scale);
    mainStageGroup.add(starMesh);
    floatingItems.push({
      mesh: starMesh,
      initialY: pos.y,
      speed: pos.speed,
      rotX: Math.random() * 0.02 + 0.01,
      rotY: Math.random() * 0.03 + 0.01
    });
  });

  // Floating Glass Bubbles
  const bubbleGeo = new THREE.SphereGeometry(0.2, 24, 24);
  const bubbleCoords = [
    { x: 1.8, y: 0.3, z: -0.8, scale: 1.1, speed: 1.3 },
    { x: -0.8, y: -1.7, z: 0.2, scale: 0.85, speed: 1.4 },
    { x: 0.9, y: 1.7, z: -0.3, scale: 0.8, speed: 1.0 }
  ];

  bubbleCoords.forEach(pos => {
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMaterial);
    bubble.position.set(pos.x, pos.y, pos.z);
    bubble.scale.set(pos.scale, pos.scale, pos.scale);
    mainStageGroup.add(bubble);
    floatingItems.push({
      mesh: bubble,
      initialY: pos.y,
      speed: pos.speed,
      rotX: 0.005,
      rotY: 0.005
    });
  });



  // Burst Sparkle Particles for Interactive Snip
  const burstParticleCount = 14;
  const burstParticles = [];
  const burstGeo = new THREE.OctahedronGeometry(0.08, 0);

  for (let i = 0; i < burstParticleCount; i++) {
    const p = new THREE.Mesh(burstGeo, starMaterial);
    p.visible = false;
    scene.add(p);
    burstParticles.push({
      mesh: p,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0
    });
  }

  function emitSnipBurst() {
    burstParticles.forEach(p => {
      p.mesh.visible = true;
      p.mesh.position.set(0.15, 1.2, 0.3);
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.08 + 0.04;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed + 0.03;
      p.vz = (Math.random() - 0.5) * 0.06;
      p.life = 1.0;
      p.mesh.scale.setScalar(Math.random() * 0.8 + 0.6);
    });
  }

  // --- 6. Interactivity: Snip Snip Animation on Click ---
  let isSnapping = false;
  let snapTime = 0;

  function triggerSnipAnimation() {
    if (isSnapping) return;
    isSnapping = true;
    snapTime = 0;
    emitSnipBurst();

    container.style.transform = 'scale(0.96)';
    setTimeout(() => {
      container.style.transform = 'scale(1.02)';
      setTimeout(() => {
        container.style.transform = '';
      }, 150);
    }, 100);
  }

  container.addEventListener('click', triggerSnipAnimation);
  container.addEventListener('touchstart', triggerSnipAnimation, { passive: true });

  // --- 7. Mouse Parallax Motion ---
  let targetRotX = 0;
  let targetRotY = 0;

  window.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / window.innerWidth;
    const deltaY = (e.clientY - centerY) / window.innerHeight;

    targetRotY = deltaX * 0.45;
    targetRotX = deltaY * 0.35;
  });

  // --- 8. Responsive Resize Handler ---
  function onResize() {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    if (!newWidth || !newHeight) return;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  }

  window.addEventListener('resize', onResize);

  // --- 9. Animation Loop (60 FPS Smooth with Auto-Rotate) ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Floating motion
    mainStageGroup.position.y = Math.sin(elapsedTime * 1.6) * 0.12;
    mainStageGroup.rotation.y = THREE.MathUtils.lerp(mainStageGroup.rotation.y, targetRotY, 0.05);
    mainStageGroup.rotation.x = THREE.MathUtils.lerp(mainStageGroup.rotation.x, targetRotX, 0.05);

    // Rotate Barber Pole Spiral Texture
    poleTexture.offset.y -= 0.015;
    poleMesh.rotation.y += 0.01;

    // Floating Stars & Sparkles
    floatingItems.forEach((item, index) => {
      item.mesh.position.y = item.initialY + Math.sin(elapsedTime * item.speed + index) * 0.15;
      item.mesh.rotation.x += item.rotX;
      item.mesh.rotation.y += item.rotY;
    });

    // Update Burst Particles
    burstParticles.forEach(p => {
      if (p.life > 0) {
        p.mesh.position.x += p.vx;
        p.mesh.position.y += p.vy;
        p.mesh.position.z += p.vz;
        p.vy -= 0.002;
        p.life -= 0.035;
        p.mesh.scale.setScalar(p.life);
        if (p.life <= 0) p.mesh.visible = false;
      }
    });

    // Scissor Snip / Idle Breathing Motion
    if (isSnapping) {
      snapTime += 0.18;
      const angle = Math.abs(Math.sin(snapTime * Math.PI * 2)) * 0.35;
      leftScissor.rotation.z = angle;
      rightScissor.rotation.z = -angle;

      if (snapTime >= 1.0) {
        isSnapping = false;
        leftScissor.rotation.z = 0.12;
        rightScissor.rotation.z = -0.12;
      }
    } else {
      const idleAngle = 0.14 + Math.sin(elapsedTime * 2.0) * 0.05;
      leftScissor.rotation.z = idleAngle;
      rightScissor.rotation.z = -idleAngle;
    }

    // Always update auto-rotate 360° continuously
    if (controls) {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  animate();
}

/* =========================================================================
   ===== SMART ANIMATE ENGINE (FIGMA-GRADE INTERACTIVE ANIMATIONS) =====
   ========================================================================= */

// 1. SMART 3D PERSPECTIVE TILT ON CARDS WITH DYNAMIC GLARE
function initSmartTilt() {
  const tiltElements = document.querySelectorAll(
    '.service-card, .pricing-card, .gallery-item, .feature-item, .contact-card, .testimonial-card'
  );

  tiltElements.forEach(card => {
    let glare = card.querySelector('.smart-glare');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'smart-glare';
      card.appendChild(glare);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9;
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;

      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)`;
      glare.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      glare.style.opacity = '0';
    });
  });
}

/* =========================================================================
   ===== GALLERY AMBIENT 3D DECOR (NATIVE PROCEDURAL THREE.JS 3D MODELS) =====
   ========================================================================= */
function initGallery3DDecor() {
  const clipperCanvas = document.getElementById('clipper3dCanvas');
  const dryerCanvas = document.getElementById('dryer3dCanvas');
  if (typeof THREE === 'undefined') return;

  // --- Shared PBR Materials ---
  const purpleMetallicMat = new THREE.MeshPhysicalMaterial({
    color: 0x7b1fa2,
    metalness: 0.9,
    roughness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf4f7fa,
    metalness: 0.98,
    roughness: 0.06
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.95,
    roughness: 0.12
  });

  const darkChassisMat = new THREE.MeshPhysicalMaterial({
    color: 0x181c24,
    metalness: 0.65,
    roughness: 0.22,
    clearcoat: 0.8
  });

  const roseGoldMat = new THREE.MeshStandardMaterial({
    color: 0xc98a75,
    metalness: 0.9,
    roughness: 0.18
  });

  const ledGlowMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const heatSwitchMat = new THREE.MeshStandardMaterial({ color: 0xff2d55, roughness: 0.3 });
  const coolSwitchMat = new THREE.MeshStandardMaterial({ color: 0x007aff, roughness: 0.3 });
  const sparkleMat = new THREE.MeshBasicMaterial({ color: 0x80d8ff });

  // =======================================================================
  // 1. BUILD NATIVE HAIR CLIPPER 3D MODEL (Mesin Cukur Rambut)
  // =======================================================================
  function createClipperModel() {
    const group = new THREE.Group();

    // A. Main Body Casing (Ergonomic Tapered Body)
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-0.55, -1.8);
    bodyShape.lineTo(0.55, -1.8);
    bodyShape.quadraticCurveTo(0.65, -0.4, 0.75, 1.2);
    bodyShape.lineTo(-0.75, 1.2);
    bodyShape.quadraticCurveTo(-0.65, -0.4, -0.55, -1.8);
    bodyShape.closePath();

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.08,
      bevelThickness: 0.08
    });
    bodyGeo.center();
    const bodyMesh = new THREE.Mesh(bodyGeo, purpleMetallicMat);
    group.add(bodyMesh);

    // Front Decorative Chrome Cover Insert
    const frontCoverGeo = new THREE.CylinderGeometry(0.38, 0.45, 1.6, 24);
    const frontCoverMesh = new THREE.Mesh(frontCoverGeo, darkChassisMat);
    frontCoverMesh.position.set(0, 0.2, 0.3);
    frontCoverMesh.scale.set(1, 1, 0.35);
    group.add(frontCoverMesh);

    // B. Titanium Blade Head (Kepala Pisau Cukur)
    const bladeBedGeo = new THREE.BoxGeometry(1.6, 0.45, 0.35);
    const bladeBedMesh = new THREE.Mesh(bladeBedGeo, chromeMat);
    bladeBedMesh.position.set(0, 1.5, 0.05);
    bladeBedMesh.rotation.x = -0.15;
    group.add(bladeBedMesh);

    // Blade Cutter Teeth (22 Gigi Pisau Presisi)
    const teethCount = 22;
    const toothWidth = 0.055;
    const toothHeight = 0.22;
    for (let i = 0; i < teethCount; i++) {
      const toothGeo = new THREE.BoxGeometry(toothWidth, toothHeight, 0.04);
      const toothMesh = new THREE.Mesh(toothGeo, chromeMat);
      const x = -0.72 + i * (1.44 / (teethCount - 1));
      toothMesh.position.set(x, 1.74, 0.08);
      toothMesh.rotation.x = -0.15;
      group.add(toothMesh);
    }

    // C. Taper Adjustment Lever (Tuas Samping)
    const leverArmGeo = new THREE.BoxGeometry(0.12, 0.5, 0.16);
    const leverArmMesh = new THREE.Mesh(leverArmGeo, chromeMat);
    leverArmMesh.position.set(-0.85, 1.25, 0.05);
    leverArmMesh.rotation.z = 0.35;
    group.add(leverArmMesh);

    const leverKnobGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const leverKnobMesh = new THREE.Mesh(leverKnobGeo, goldTrimMat);
    leverKnobMesh.position.set(-0.95, 1.48, 0.05);
    group.add(leverKnobMesh);

    // D. Power Switch & Gold Medallion
    const switchGeo = new THREE.BoxGeometry(0.2, 0.35, 0.12);
    const switchMesh = new THREE.Mesh(switchGeo, chromeMat);
    switchMesh.position.set(0.78, -0.2, 0.05);
    group.add(switchMesh);

    const medallionGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 24);
    const medallionMesh = new THREE.Mesh(medallionGeo, goldTrimMat);
    medallionMesh.position.set(0, 0.3, 0.38);
    medallionMesh.rotation.x = Math.PI / 2;
    group.add(medallionMesh);

    // E. LED Battery Bar Indicators (4 Titik LED Menyala)
    for (let i = 0; i < 4; i++) {
      const ledGeo = new THREE.BoxGeometry(0.18, 0.04, 0.02);
      const ledMesh = new THREE.Mesh(ledGeo, ledGlowMat);
      ledMesh.position.set(0, -0.8 - i * 0.1, 0.35);
      group.add(ledMesh);
    }

    // F. Bottom Hanging Ring (Gantungan Bawah)
    const ringGeo = new THREE.TorusGeometry(0.22, 0.04, 16, 24);
    const ringMesh = new THREE.Mesh(ringGeo, chromeMat);
    ringMesh.position.set(0, -2.0, 0);
    ringMesh.rotation.x = Math.PI / 2;
    group.add(ringMesh);

    group.scale.set(1.1, 1.1, 1.1);
    return group;
  }

  // =======================================================================
  // 2. BUILD NATIVE HAIR DRYER 3D MODEL (Pengering Rambut Modern)
  // =======================================================================
  function createDryerModel() {
    const group = new THREE.Group();

    // A. Main Cylindrical Barrel (Tabung Utama)
    const barrelGeo = new THREE.CylinderGeometry(0.75, 0.88, 2.3, 32);
    const barrelMesh = new THREE.Mesh(barrelGeo, darkChassisMat);
    barrelMesh.rotation.z = Math.PI / 2;
    group.add(barrelMesh);

    // Rose Gold Accent Rings on Barrel
    const ring1Geo = new THREE.TorusGeometry(0.85, 0.035, 16, 32);
    const ring1Mesh = new THREE.Mesh(ring1Geo, roseGoldMat);
    ring1Mesh.rotation.y = Math.PI / 2;
    ring1Mesh.position.x = 0.6;
    group.add(ring1Mesh);

    const ring2Mesh = ring1Mesh.clone();
    ring2Mesh.position.x = -0.7;
    group.add(ring2Mesh);

    // B. Front Concentrator Nozzle (Corong Depan Pipih)
    const nozzleGeo = new THREE.CylinderGeometry(0.45, 0.72, 0.9, 32);
    const nozzleMesh = new THREE.Mesh(nozzleGeo, darkChassisMat);
    nozzleMesh.position.set(1.5, 0, 0);
    nozzleMesh.rotation.z = -Math.PI / 2;
    nozzleMesh.scale.set(1, 0.45, 1);
    group.add(nozzleMesh);

    // Nozzle Chrome Tip
    const nozzleTipGeo = new THREE.BoxGeometry(0.1, 0.28, 0.85);
    const nozzleTipMesh = new THREE.Mesh(nozzleTipGeo, chromeMat);
    nozzleTipMesh.position.set(1.98, 0, 0);
    group.add(nozzleTipMesh);

    // C. Rear Air Intake Mesh (Filter Belakang)
    const rearGrillGeo = new THREE.CylinderGeometry(0.86, 0.86, 0.2, 32);
    const rearGrillMesh = new THREE.Mesh(rearGrillGeo, roseGoldMat);
    rearGrillMesh.position.set(-1.22, 0, 0);
    rearGrillMesh.rotation.z = Math.PI / 2;
    group.add(rearGrillMesh);

    const rearMeshCenterGeo = new THREE.SphereGeometry(0.45, 24, 24);
    const rearMeshCenter = new THREE.Mesh(rearMeshCenterGeo, chromeMat);
    rearMeshCenter.position.set(-1.28, 0, 0);
    rearMeshCenter.scale.set(0.3, 1, 1);
    group.add(rearMeshCenter);

    // D. Ergonomic Angled Handle (Gagang Pegangan)
    const handleGeo = new THREE.CylinderGeometry(0.36, 0.32, 2.0, 24);
    const handleMesh = new THREE.Mesh(handleGeo, darkChassisMat);
    handleMesh.position.set(-0.15, -1.2, 0);
    handleMesh.rotation.z = 0.12;
    group.add(handleMesh);

    // E. Control Buttons on Handle Spine
    const heatBtnGeo = new THREE.BoxGeometry(0.12, 0.26, 0.14);
    const heatBtnMesh = new THREE.Mesh(heatBtnGeo, heatSwitchMat);
    heatBtnMesh.position.set(0.2, -0.65, 0);
    group.add(heatBtnMesh);

    const coolBtnGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const coolBtnMesh = new THREE.Mesh(coolBtnGeo, coolSwitchMat);
    coolBtnMesh.position.set(0.2, -1.05, 0);
    group.add(coolBtnMesh);

    // F. Hanging Loop & Cord Strain at Bottom
    const cordBaseGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.4, 16);
    const cordBaseMesh = new THREE.Mesh(cordBaseGeo, chromeMat);
    cordBaseMesh.position.set(-0.28, -2.3, 0);
    group.add(cordBaseMesh);

    const hangRingGeo = new THREE.TorusGeometry(0.2, 0.04, 16, 24);
    const hangRingMesh = new THREE.Mesh(hangRingGeo, chromeMat);
    hangRingMesh.position.set(-0.28, -2.55, 0);
    group.add(hangRingMesh);

    // G. Sparkling Breeze Particle Cloud
    const particleGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const pGeo = new THREE.OctahedronGeometry(0.07, 0);
      const pMesh = new THREE.Mesh(pGeo, sparkleMat);
      pMesh.position.set(2.3 + Math.random() * 0.8, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4);
      particleGroup.add(pMesh);
    }
    group.add(particleGroup);

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }

  // =======================================================================
  // 3. SETUP CLIPPER CANVAS SCENE
  // =======================================================================
  if (clipperCanvas) {
    const cWidth = clipperCanvas.parentElement.clientWidth || 340;
    const cHeight = clipperCanvas.parentElement.clientHeight || 340;

    const cScene = new THREE.Scene();
    const cCamera = new THREE.PerspectiveCamera(45, cWidth / cHeight, 0.1, 100);
    cCamera.position.set(0, 0, 6.2);

    const cRenderer = new THREE.WebGLRenderer({
      canvas: clipperCanvas,
      alpha: true,
      antialias: true
    });
    cRenderer.setSize(cWidth, cHeight);
    cRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Studio Lights
    const cAmbient = new THREE.AmbientLight(0xffffff, 1.4);
    cScene.add(cAmbient);

    const cKey = new THREE.DirectionalLight(0xfff0cc, 2.4);
    cKey.position.set(5, 6, 4);
    cScene.add(cKey);

    const cFill = new THREE.PointLight(0x9c27b0, 3.0, 10);
    cFill.position.set(-4, -2, 2);
    cScene.add(cFill);

    const clipperModel = createClipperModel();
    cScene.add(clipperModel);

    // Auto-Rotate loop for Clipper
    let cAngle = 0;
    function animateClipper() {
      requestAnimationFrame(animateClipper);
      cAngle += 0.015;
      clipperModel.rotation.y = cAngle;
      clipperModel.rotation.x = Math.sin(cAngle * 0.8) * 0.15;
      clipperModel.position.y = Math.sin(cAngle * 1.5) * 0.18;
      cRenderer.render(cScene, cCamera);
    }
    animateClipper();
  }

  // =======================================================================
  // 4. SETUP HAIR DRYER CANVAS SCENE
  // =======================================================================
  if (dryerCanvas) {
    const dWidth = dryerCanvas.parentElement.clientWidth || 340;
    const dHeight = dryerCanvas.parentElement.clientHeight || 340;

    const dScene = new THREE.Scene();
    const dCamera = new THREE.PerspectiveCamera(45, dWidth / dHeight, 0.1, 100);
    dCamera.position.set(0, 0, 6.8);

    const dRenderer = new THREE.WebGLRenderer({
      canvas: dryerCanvas,
      alpha: true,
      antialias: true
    });
    dRenderer.setSize(dWidth, dHeight);
    dRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Studio Lights
    const dAmbient = new THREE.AmbientLight(0xffffff, 1.4);
    dScene.add(dAmbient);

    const dKey = new THREE.DirectionalLight(0xffe8d6, 2.2);
    dKey.position.set(4, 6, 5);
    dScene.add(dKey);

    const dFill = new THREE.PointLight(0x00e5ff, 2.5, 10);
    dFill.position.set(-4, -3, 2);
    dScene.add(dFill);

    const dryerModel = createDryerModel();
    dScene.add(dryerModel);

    // Auto-Rotate loop for Hair Dryer
    let dAngle = 0.5;
    function animateDryer() {
      requestAnimationFrame(animateDryer);
      dAngle += 0.014;
      dryerModel.rotation.y = dAngle;
      dryerModel.rotation.z = Math.sin(dAngle * 0.6) * 0.12;
      dryerModel.position.y = Math.cos(dAngle * 1.4) * 0.18;
      dRenderer.render(dScene, dCamera);
    }
    animateDryer();
  }
}

// 2. MAGNETIC BUTTONS (SMOOTH MOUSE PULL EFFECT)
function initMagneticButtons() {
  const magneticBtns = document.querySelectorAll('.btn-primary, .btn-wa, .nav-cta');

  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px) scale(1.03)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px) scale(1)';
    });
  });
}

// 3. SMART STAGGERED SCROLL-REVEAL ANIMATIONS
function initSmartScrollReveal() {
  const revealElements = document.querySelectorAll('.fade-in');
  if (!revealElements.length) return;

  // Reveal elements already in viewport immediately
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100) {
      el.classList.add('visible');
    }
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.01,
      rootMargin: '60px 0px 0px 0px'
    });

    revealElements.forEach(el => {
      if (!el.classList.contains('visible')) {
        revealObserver.observe(el);
      }
    });
  } else {
    revealElements.forEach(el => el.classList.add('visible'));
  }
}

// 4. INTERACTIVE FAMILY PRICE CALCULATOR
function initPriceCalculator() {
  const kidsCountEl = document.getElementById('kidsCountVal');
  const adultCountEl = document.getElementById('adultCountVal');
  const btnKidsMinus = document.getElementById('btnKidsMinus');
  const btnKidsPlus = document.getElementById('btnKidsPlus');
  const btnAdultMinus = document.getElementById('btnAdultMinus');
  const btnAdultPlus = document.getElementById('btnAdultPlus');
  const addonCreambath = document.getElementById('addonCreambath');
  const addonSkinhead = document.getElementById('addonSkinhead');
  const calcOldPrice = document.getElementById('calcOldPrice');
  const calcFinalPrice = document.getElementById('calcFinalPrice');
  const calcSavePill = document.getElementById('calcSavePill');
  const btnApply = document.getElementById('btnApplyCalculatedPackage');

  if (!kidsCountEl || !adultCountEl) return;

  let kids = 1;
  let adult = 1;

  function updateCalc() {
    kidsCountEl.textContent = kids;
    adultCountEl.textContent = adult;

    const normalKidsPrice = kids * 80000;
    const normalAdultPrice = adult * 70000;
    let addonsTotal = 0;
    if (addonCreambath && addonCreambath.checked) addonsTotal += 50000;
    if (addonSkinhead && addonSkinhead.checked) addonsTotal += 20000;

    const subtotal = normalKidsPrice + normalAdultPrice + addonsTotal;
    const totalPeople = kids + adult;

    // Family package discount calculation
    let discount = 0;
    if (totalPeople >= 2) {
      discount = Math.min(30000, 10000 * Math.floor(totalPeople / 2));
    }

    const finalPrice = Math.max(0, subtotal - discount);

    function formatRupiah(num) {
      return 'Rp ' + num.toLocaleString('id-ID');
    }

    if (discount > 0) {
      calcOldPrice.style.display = 'inline';
      calcOldPrice.textContent = formatRupiah(subtotal);
      calcSavePill.style.display = 'inline-block';
      calcSavePill.textContent = `🎉 Hemat ${formatRupiah(discount)} (Diskon Paket Keluarga)`;
    } else {
      calcOldPrice.style.display = 'none';
      calcSavePill.style.display = 'none';
    }

    calcFinalPrice.textContent = formatRupiah(finalPrice);
  }

  if (btnKidsMinus) {
    btnKidsMinus.addEventListener('click', () => {
      if (kids > 0 && (kids + adult > 1)) kids--;
      updateCalc();
    });
  }

  if (btnKidsPlus) {
    btnKidsPlus.addEventListener('click', () => {
      if (kids < 10) kids++;
      updateCalc();
    });
  }

  if (btnAdultMinus) {
    btnAdultMinus.addEventListener('click', () => {
      if (adult > 0 && (kids + adult > 1)) adult--;
      updateCalc();
    });
  }

  if (btnAdultPlus) {
    btnAdultPlus.addEventListener('click', () => {
      if (adult < 10) adult++;
      updateCalc();
    });
  }

  if (addonCreambath) addonCreambath.addEventListener('change', updateCalc);
  if (addonSkinhead) addonSkinhead.addEventListener('change', updateCalc);

  if (btnApply) {
    btnApply.addEventListener('click', () => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });

        // Auto select package if exists
        const serviceSelect = document.getElementById('service');
        if (serviceSelect) {
          serviceSelect.value = 'paket-keluarga';
        }

        // Auto fill notes
        const notesField = document.getElementById('notes');
        if (notesField) {
          let extraInfo = `Estimasi Paket: ${kids} Anak + ${adult} Dewasa`;
          if (addonCreambath && addonCreambath.checked) extraInfo += ' + Creambath';
          if (addonSkinhead && addonSkinhead.checked) extraInfo += ' + Skinhead';
          notesField.value = extraInfo;
        }
      }
    });
  }

  updateCalc();
}

// 5. INTERACTIVE BEFORE & AFTER COMPARISON SLIDER
function initBeforeAfterSlider() {
  const container = document.getElementById('beforeAfterSlider');
  const afterLayer = document.getElementById('baAfterLayer');
  const handle = document.getElementById('baHandle');
  const rangeInput = document.getElementById('baRangeInput');

  if (!container || !afterLayer || !handle || !rangeInput) return;

  function setSliderPosition(val) {
    const percentage = Math.max(0, Math.min(100, val));
    afterLayer.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
    afterLayer.style.webkitClipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
    handle.style.left = `${percentage}%`;
  }

  rangeInput.addEventListener('input', (e) => {
    setSliderPosition(e.target.value);
  });

  // Direct mouse & touch dragging on the box
  let isDragging = false;

  function handleMove(e) {
    if (!isDragging) return;
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offset = clientX - rect.left;
    const percentage = (offset / rect.width) * 100;
    rangeInput.value = percentage;
    setSliderPosition(percentage);
  }

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleMove(e);
  });

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', () => { isDragging = false; });

  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    handleMove(e);
  }, { passive: true });

  window.addEventListener('touchmove', handleMove, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  setSliderPosition(50);
}

// 6. WHATSAPP SMART WIDGET MODAL
function initWhatsAppModal() {
  const waBtn = document.getElementById('waFloatBtn');
  const waModal = document.getElementById('waWidgetModal');
  const waClose = document.getElementById('waModalClose');
  const waOverlay = document.getElementById('waModalOverlay');

  if (!waBtn || !waModal) return;

  function openModal() {
    waModal.classList.add('active');
    waModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    waModal.classList.remove('active');
    waModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  waBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (waModal.classList.contains('active')) {
      closeModal();
    } else {
      openModal();
    }
  });

  if (waClose) waClose.addEventListener('click', closeModal);
  if (waOverlay) waOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && waModal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Initialize all features on load
document.addEventListener('DOMContentLoaded', () => {
  init3DBarberShowcase();
  initGallery3DDecor();
  initSmartTilt();
  initMagneticButtons();
  initSmartScrollReveal();
  initPriceCalculator();
  initBeforeAfterSlider();
  initWhatsAppModal();
});

if (document.readyState !== 'loading') {
  init3DBarberShowcase();
  initGallery3DDecor();
  initSmartTilt();
  initMagneticButtons();
  initSmartScrollReveal();
  initPriceCalculator();
  initBeforeAfterSlider();
  initWhatsAppModal();
}

