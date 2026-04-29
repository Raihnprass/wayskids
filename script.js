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
      `Halo WaysKid Salon! Saya ${name} ingin booking:\n` +
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
