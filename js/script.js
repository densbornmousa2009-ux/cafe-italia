/* =========================================================
   Cafe Italia — Interaktions-Logik
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('loaded'), 250);
  });

  /* ---------- Dark Mode ---------- */
  const darkToggle = document.querySelectorAll('[data-dark-toggle]');
  const root = document.documentElement;
  const applyDark = (isDark) => {
    root.classList.toggle('dark', isDark);
    darkToggle.forEach(btn => {
      btn.setAttribute('aria-pressed', String(isDark));
    });
  };
  const savedDark = localStorage.getItem('cafeitalia-dark');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyDark(savedDark ? savedDark === 'true' : prefersDark);

  darkToggle.forEach(btn => {
    btn.addEventListener('click', () => {
      const next = !root.classList.contains('dark');
      applyDark(next);
      localStorage.setItem('cafeitalia-dark', String(next));
    });
  });

  /* ---------- Mobile Nav ---------- */
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('flex');
      mobileMenu.classList.toggle('hidden');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Sticky Nav transparency + active link + scroll progress ---------- */
  const nav = document.getElementById('site-nav');
  const progressBar = document.getElementById('scroll-progress');
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('nav-scrolled', y > 40);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = docHeight > 0 ? `${(y / docHeight) * 100}%` : '0%';

    if (scrollTopBtn) {
      scrollTopBtn.style.opacity = y > 500 ? '1' : '0';
      scrollTopBtn.style.pointerEvents = y > 500 ? 'auto' : 'none';
    }

    let currentId = '';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom > 120) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  scrollTopBtn && scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal, .star-anim');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible', 'in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Parallax hero (subtle, respects reduced motion) ---------- */
  const parallaxLayers = document.querySelectorAll('.parallax-layer');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && parallaxLayers.length) {
    document.addEventListener('scroll', () => {
      const y = window.scrollY;
      parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.dataset.speed || '0.3');
        layer.style.transform = `translateY(${y * speed}px)`;
      });
    }, { passive: true });
  }

  /* ---------- Button ripple ---------- */
  document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 1.4;
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- Lightbox Gallery ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  document.querySelectorAll('[data-lightbox]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const img = trigger.querySelector('img');
      if (!lightbox || !img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      if (lightboxCaption) lightboxCaption.textContent = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };
  lightbox && lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.hasAttribute('data-close-lightbox')) closeLightbox();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question && question.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Cookie Banner ---------- */
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAccept = document.getElementById('cookie-accept');
  const cookieDecline = document.getElementById('cookie-decline');
  if (cookieBanner && !localStorage.getItem('cafeitalia-cookie-consent')) {
    setTimeout(() => cookieBanner.classList.add('show'), 1200);
  }
  const dismissCookie = (value) => {
    localStorage.setItem('cafeitalia-cookie-consent', value);
    cookieBanner && cookieBanner.classList.remove('show');
  };
  cookieAccept && cookieAccept.addEventListener('click', () => dismissCookie('accepted'));
  cookieDecline && cookieDecline.addEventListener('click', () => dismissCookie('declined'));

  /* ---------- Current year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

});
