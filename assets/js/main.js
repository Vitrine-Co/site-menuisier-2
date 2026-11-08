/* ==========================================================================
   L'Atelier — interactions JS (sans dépendance externe)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initScrollReveal();
  initGalleryFilter();
  initLightbox();
  initBeforeAfterSliders();
  initContactForm();
  initYear();
  initCallBar();
});

/* ---- Header : fond plein au scroll ---- */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---- Menu mobile ---- */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---- Apparition au scroll (Intersection Observer) ---- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---- Filtres de catégorie (galerie réalisations) ---- */
function initGalleryFilter() {
  const filterBar = document.querySelector('[data-gallery-filters]');
  const items = Array.from(document.querySelectorAll('[data-lightbox-trigger]'));
  if (!filterBar || !items.length) return;

  const buttons = Array.from(filterBar.querySelectorAll('[data-filter]'));

  function applyFilter(category) {
    items.forEach((item) => {
      const matches = category === 'all' || item.getAttribute('data-category') === category;
      item.classList.toggle('is-filtered-out', !matches);
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.getAttribute('data-filter'));
    });
  });
}

/* ---- Lightbox galerie réalisations ---- */
function initLightbox() {
  const triggers = Array.from(document.querySelectorAll('[data-lightbox-trigger]'));
  const lightbox = document.getElementById('lightbox');
  if (!triggers.length || !lightbox) return;

  const lightboxImg = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('figcaption');
  const btnClose = lightbox.querySelector('[data-lightbox-close]');
  const btnPrev = lightbox.querySelector('[data-lightbox-prev]');
  const btnNext = lightbox.querySelector('[data-lightbox-next]');

  let slides = [];
  let currentIndex = 0;

  function toSlide(trigger) {
    return {
      src: trigger.getAttribute('data-full') || trigger.querySelector('img')?.src,
      caption: trigger.getAttribute('data-caption') || '',
    };
  }

  function visibleTriggers() {
    return triggers.filter((trigger) => !trigger.classList.contains('is-filtered-out'));
  }

  function show(index) {
    currentIndex = (index + slides.length) % slides.length;
    const slide = slides[currentIndex];
    lightboxImg.src = slide.src;
    lightboxImg.alt = slide.caption;
    lightboxCaption.textContent = slide.caption;
  }

  function open(trigger) {
    const visible = visibleTriggers();
    slides = visible.map(toSlide);
    show(visible.indexOf(trigger));
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => open(trigger));
  });

  btnClose?.addEventListener('click', close);
  btnPrev?.addEventListener('click', () => show(currentIndex - 1));
  btnNext?.addEventListener('click', () => show(currentIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(currentIndex + 1);
    if (e.key === 'ArrowLeft') show(currentIndex - 1);
  });
}

/* ---- Sliders Avant / Après ---- */
function initBeforeAfterSliders() {
  const sliders = Array.from(document.querySelectorAll('.ba-slider'));
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const stage = slider.querySelector('.ba-slider-images');
    const wrap = slider.querySelector('.ba-before-wrap');
    const beforeImg = slider.querySelector('.ba-before');
    const handle = slider.querySelector('.ba-handle');
    const range = slider.querySelector('.ba-range');
    if (!stage || !wrap || !beforeImg || !handle || !range) return;

    function setPercent(percent) {
      const clamped = Math.min(100, Math.max(0, percent));
      wrap.style.width = clamped + '%';
      handle.style.left = clamped + '%';
      beforeImg.style.width = stage.offsetWidth + 'px';
      range.value = clamped;
    }

    function percentFromClientX(clientX) {
      const rect = stage.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    let dragging = false;

    stage.addEventListener('dragstart', (e) => e.preventDefault());

    stage.addEventListener('pointerdown', (e) => {
      dragging = true;
      stage.setPointerCapture?.(e.pointerId);
      setPercent(percentFromClientX(e.clientX));
    });

    stage.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      setPercent(percentFromClientX(e.clientX));
    });

    ['pointerup', 'pointercancel'].forEach((evt) => {
      stage.addEventListener(evt, () => {
        dragging = false;
      });
    });

    range.addEventListener('input', () => setPercent(Number(range.value)));
    window.addEventListener('resize', () => setPercent(Number(range.value)));

    setPercent(Number(range.value));
  });
}

/* ---- Formulaire de contact (ouverture du client email via mailto) ---- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = form?.querySelector('button[type="submit"]');
  if (!form) return;

  const destination = form.dataset.mailto;

  function setFeedback(message, type) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.remove('is-success', 'is-error');
    feedback.classList.add('is-visible', type === 'success' ? 'is-success' : 'is-error');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const nom = data.get('nom') || '';
    const telephone = data.get('telephone') || '';
    const email = data.get('email') || '';
    const projet = data.get('projet') || '';
    const message = data.get('message') || '';

    const subject = `Demande de devis — ${projet}`;
    const body = [
      `Nom : ${nom}`,
      `Téléphone : ${telephone}`,
      `Email : ${email}`,
      `Type de projet : ${projet}`,
      '',
      message,
    ].join('\n');

    const mailtoUrl = `mailto:${destination}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    setFeedback('Votre client email va s\'ouvrir avec votre demande pré-remplie : il ne reste plus qu\'à l\'envoyer.', 'success');
  });
}

/* ---- Année courante dans le footer ---- */
function initYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---- Barre d'appel mobile : masquée quand le formulaire de contact est visible ---- */
function initCallBar() {
  const bar = document.querySelector('.cta-mobile');
  const contact = document.getElementById('contact');
  if (!bar || !contact || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    ([entry]) => bar.classList.toggle('is-hidden', entry.isIntersecting),
    { threshold: 0.1 }
  );
  observer.observe(contact);
}