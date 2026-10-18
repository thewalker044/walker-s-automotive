(function () {
  'use strict';
  const STORAGE_KEYS = { requests: 'walkersAutoRequests', prices: 'walkersAutoPrices' };
  const defaultPrices = { checkup: 49, oil: 120, brakes: 39 };

  const menuToggle = document.getElementById('menuToggle');
  const primaryNav = document.getElementById('primaryNav');
  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
      primaryNav.classList.toggle('is-open', !expanded);
    });
    primaryNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      primaryNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    }));
  }

  // Reveal elements as they enter the viewport. Content remains visible when motion is reduced.
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-service-link]').forEach(link => link.addEventListener('click', () => {
    const select = document.getElementById('requestedService');
    if (select) {
      const wanted = link.getAttribute('data-service-link');
      const exact = Array.from(select.options).find(option => option.text.toLowerCase() === wanted.toLowerCase());
      if (exact) select.value = exact.value;
    }
  }));
  document.querySelectorAll('[data-price-service]').forEach(link => link.addEventListener('click', () => {
    const select = document.getElementById('requestedService');
    if (select) {
      const wanted = link.getAttribute('data-price-service');
      const exact = Array.from(select.options).find(option => option.text.toLowerCase() === wanted.toLowerCase());
      if (exact) select.value = exact.value;
    }
  }));

  function readPrices() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.prices) || '{}');
      // Migrate the previous prototype default to the owner's requested $120 rate.
      if (Number(saved.oil) === 69) { saved.oil = 120; localStorage.setItem(STORAGE_KEYS.prices, JSON.stringify(saved)); }
      return { ...defaultPrices, ...saved };
    } catch (_) { return defaultPrices; }
  }
  function renderPrices() {
    const prices = readPrices();
    document.querySelectorAll('[data-price-id]').forEach(el => {
      const key = el.getAttribute('data-price-id');
      if (Number.isFinite(Number(prices[key])) && Number(prices[key]) >= 0) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = '$' + Number(prices[key]).toLocaleString('en-US');
      }
    });
  }
  renderPrices();
  window.addEventListener('storage', event => { if (event.key === STORAGE_KEYS.prices) renderPrices(); });

  const form = document.getElementById('serviceForm');
  const formMessage = document.getElementById('formMessage');
  if (form && formMessage) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const request = {
        id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'req-' + Date.now() + '-' + Math.random().toString(16).slice(2),
        name: String(data.get('name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        vehicle: String(data.get('vehicle') || '').trim(),
        service: String(data.get('service') || '').trim(),
        message: String(data.get('message') || '').trim(),
        createdAt: new Date().toISOString(),
        status: 'New'
      };
      if (!request.name || !request.email || !request.service) {
        formMessage.textContent = 'Please complete the required fields.';
        formMessage.classList.add('error');
        return;
      }
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.requests) || '[]');
        existing.unshift(request);
        localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(existing));
        form.reset();
        formMessage.classList.remove('error');
        formMessage.textContent = 'Your request has been saved in this browser demo. The shop has not been notified yet; connect a backend or form service to receive real submissions.';
      } catch (error) {
        formMessage.classList.add('error');
        formMessage.textContent = 'This browser could not save your request. Please try again or contact the shop directly.';
      }
    });
  }
  const year = document.getElementById('currentYear');
  if (year) year.textContent = new Date().getFullYear();
})();
