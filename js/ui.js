import {
  CINEPASS_ROUTES,
  getResolvedRoute,
  saveRouteOverrides,
  resetRouteOverrides
} from './config.js';
import { loadState, updateState } from './store.js';

const NAV_ORDER = ['home', 'movies', 'cinemas', 'offers', 'tickets', 'profile'];

const ICONS = {
  brand: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7.5C4 6.12 5.12 5 6.5 5h11C18.88 5 20 6.12 20 7.5v2a2.5 2.5 0 0 0 0 5v2c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 19 4 17.88 4 16.5v-2a2.5 2.5 0 0 0 0-5v-2Z" stroke="#D6B46A" stroke-width="1.75"/>
    <path d="M10.25 9.5 15 12l-4.75 2.5V9.5Z" fill="#D6B46A"/>
  </svg>`,
  sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  menu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`,
  alert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
  info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  link: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
};

export function applyTheme(theme) {
  const normalized = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', normalized);
  const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
  toggleButtons.forEach((btn) => {
    btn.innerHTML = normalized === 'dark' ? ICONS.sun : ICONS.moon;
    btn.setAttribute(
      'aria-label',
      normalized === 'dark' ? 'Switch to Warm Ivory light mode' : 'Switch to Cinematic dark mode'
    );
    btn.setAttribute(
      'title',
      normalized === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
    );
  });
}

export function showToast({ title, message = '', type = 'info', duration = 3800 }) {
  let stack = document.getElementById('cp-toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'cp-toast-stack';
    stack.className = 'cp-toast-stack';
    stack.setAttribute('aria-live', 'polite');
    stack.setAttribute('aria-atomic', 'false');
    document.body.appendChild(stack);
  }

  const toast = document.createElement('div');
  toast.className = `cp-toast cp-toast--${type}`;
  toast.setAttribute('role', 'status');

  const iconColor =
    type === 'success'
      ? 'var(--status-success)'
      : type === 'error'
        ? 'var(--status-error)'
        : 'var(--cp-gold)';
  const iconSvg =
    type === 'success' ? ICONS.check : type === 'error' ? ICONS.alert : ICONS.info;

  toast.innerHTML = `
    <span class="cp-toast__icon" style="color:${iconColor}">${iconSvg}</span>
    <div>
      <div class="cp-toast__title">${escapeHtml(title)}</div>
      ${message ? `<div class="cp-toast__msg">${escapeHtml(message)}</div>` : ''}
    </div>
  `;

  stack.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add('is-leaving');
    window.setTimeout(() => toast.remove(), 260);
  }, duration);
}

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatCurrencyPkr(amount) {
  return `PKR ${Number(amount || 0).toLocaleString('en-PK')}`;
}

export function animateCounter(el, targetValue, { prefix = '', suffix = '', duration = 850 } = {}) {
  if (!el) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const end = Number(targetValue) || 0;
  const start = Number(el.dataset.currentVal || 0);
  el.dataset.currentVal = String(end);

  if (reduced || duration <= 20) {
    el.textContent = `${prefix}${end.toLocaleString('en-PK')}${suffix}`;
    return;
  }

  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * eased);
    el.textContent = `${prefix}${current.toLocaleString('en-PK')}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

export function initScrollReveals() {
  const targets = document.querySelectorAll('.reveal, .stagger-item');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Number(entry.target.dataset.delay || 0);
          if (delay > 0) {
            entry.target.style.transitionDelay = `${delay}ms`;
          }
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

export function createModalController(backdropEl) {
  if (!backdropEl) return null;
  let previousFocus = null;

  const close = () => {
    backdropEl.classList.remove('is-open');
    backdropEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  };

  const open = () => {
    previousFocus = document.activeElement;
    backdropEl.classList.add('is-open');
    backdropEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const focusable = backdropEl.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      window.setTimeout(() => focusable.focus(), 60);
    }
  };

  backdropEl.addEventListener('click', (e) => {
    if (e.target === backdropEl) close();
  });

  backdropEl.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdropEl.classList.contains('is-open')) {
      close();
    }
  });

  return { open, close };
}

function buildNavItemMarkup(routeKey, activeKey, isMobile = false) {
  const resolved = getResolvedRoute(routeKey);
  if (!resolved) return '';
  const isActive = routeKey === activeKey;
  const hasHref = Boolean(resolved.href);

  if (isMobile) {
    if (hasHref) {
      return `
        <li>
          <a class="cp-mobile-link ${isActive ? 'is-active' : ''}" href="${escapeHtml(resolved.href)}" ${isActive ? 'aria-current="page"' : ''}>
            <span>${escapeHtml(resolved.label)}</span>
            <small>${isActive ? 'Current' : 'Open'}</small>
          </a>
        </li>`;
    }
    return `
      <li>
        <button type="button" class="cp-mobile-link" data-unlinked-route="${routeKey}">
          <span>${escapeHtml(resolved.label)}</span>
          <small>Module</small>
        </button>
      </li>`;
  }

  if (hasHref) {
    return `
      <li>
        <a class="cp-nav-link ${isActive ? 'is-active' : ''}" href="${escapeHtml(resolved.href)}" ${isActive ? 'aria-current="page"' : ''}>
          ${escapeHtml(resolved.label)}
        </a>
      </li>`;
  }

  return `
    <li>
      <button type="button" class="cp-nav-link cp-nav-link--external-badge" data-unlinked-route="${routeKey}" title="Configure teammate route for ${escapeHtml(resolved.label)}">
        ${escapeHtml(resolved.label)}
      </button>
    </li>`;
}

export function handleExternalRouteNavigation(routeKey, queryParam = '') {
  const resolved = getResolvedRoute(routeKey);
  if (resolved && resolved.href) {
    const targetUrl = queryParam ? `${resolved.href}${queryParam}` : resolved.href;
    window.location.href = targetUrl;
    return;
  }
  openRouteConfigModal(routeKey);
}

let routeConfigController = null;

function ensureRouteConfigModal() {
  let backdrop = document.getElementById('cp-route-config-modal');
  if (backdrop) return backdrop;

  backdrop = document.createElement('div');
  backdrop.id = 'cp-route-config-modal';
  backdrop.className = 'cp-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.setAttribute('aria-labelledby', 'cp-route-modal-title');

  const teammateKeys = ['home', 'movies', 'tickets', 'showtimes'];
  const fieldsHtml = teammateKeys
    .map((key) => {
      const resolved = getResolvedRoute(key);
      return `
        <div class="field">
          <label class="field__label" for="route-input-${key}">
            ${escapeHtml(resolved.label)} <span style="color:var(--text-muted);font-weight:400;">(${escapeHtml(resolved.owner)})</span>
          </label>
          <input class="field__input" id="route-input-${key}" name="${key}" type="text"
            value="${escapeHtml(resolved.href || '')}"
            placeholder="e.g. ${key === 'home' ? 'index.html' : `${key}.html`}" />
        </div>`;
    })
    .join('');

  backdrop.innerHTML = `
    <div class="cp-modal">
      <div class="cp-modal__head">
        <div>
          <span class="eyebrow">Platform Integration</span>
          <h2 class="cp-modal__title" id="cp-route-modal-title">Connect Team Modules</h2>
          <p class="cp-modal__sub" id="cp-route-modal-desc">
            This navigation destination belongs to another CinePass module. Link its URL below once merged into the main project—no broken 404 links.
          </p>
        </div>
        <button type="button" class="icon-btn" data-modal-close aria-label="Close modal">${ICONS.close}</button>
      </div>
      <form id="cp-route-config-form" class="form-grid">
        ${fieldsHtml}
        <div class="cp-modal__foot">
          <button type="button" class="btn btn--ghost btn--sm" id="cp-route-reset-btn">Reset Defaults</button>
          <button type="button" class="btn btn--ghost btn--sm" data-modal-close>Close</button>
          <button type="submit" class="btn btn--primary btn--sm">Save Route Links</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);
  routeConfigController = createModalController(backdrop);

  const form = backdrop.querySelector('#cp-route-config-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const overrides = {};
    teammateKeys.forEach((key) => {
      const val = form.querySelector(`#route-input-${key}`).value.trim();
      if (val) overrides[key] = val;
    });
    saveRouteOverrides(overrides);
    routeConfigController.close();
    showToast({
      title: 'Navigation routes updated',
      message: 'Configured module links are now active across all pages.',
      type: 'success'
    });
    window.setTimeout(() => window.location.reload(), 450);
  });

  backdrop.querySelector('#cp-route-reset-btn').addEventListener('click', () => {
    resetRouteOverrides();
    teammateKeys.forEach((key) => {
      form.querySelector(`#route-input-${key}`).value = CINEPASS_ROUTES[key].href || '';
    });
    showToast({
      title: 'Route links reset',
      message: 'Restored default Member 4 standalone navigation.',
      type: 'info'
    });
  });

  return backdrop;
}

export function openRouteConfigModal(routeKey) {
  const backdrop = ensureRouteConfigModal();
  const descEl = backdrop.querySelector('#cp-route-modal-desc');
  const route = getResolvedRoute(routeKey);
  if (route && descEl) {
    descEl.textContent = `"${route.label}" (${route.owner}) is not linked yet in this standalone Member 4 build. Enter the target page path below once available, or continue exploring Cinemas, Offers, and My Profile.`;
  }
  routeConfigController.open();
}

export function refreshNavbarProfileChip() {
  const state = loadState();
  const chipName = document.querySelector('[data-nav-user-name]');
  const chipImg = document.querySelector('[data-nav-user-avatar]');
  if (chipName) {
    const firstName = (state.profile.fullName || 'Member').split(' ')[0];
    chipName.textContent = state.isLoggedIn ? firstName : 'Sign In';
  }
  if (chipImg) {
    chipImg.src = state.profile.avatar;
    chipImg.alt = state.profile.fullName;
  }
}

export function initPageShell(activeRouteKey) {
  const state = loadState();
  applyTheme(state.theme);

  // Ambient glow layer
  if (!document.querySelector('.ambient-canvas')) {
    const ambient = document.createElement('div');
    ambient.className = 'ambient-canvas';
    ambient.setAttribute('aria-hidden', 'true');
    ambient.innerHTML = `
      <div class="ambient-orb ambient-orb--burgundy"></div>
      <div class="ambient-orb ambient-orb--gold"></div>
    `;
    document.body.prepend(ambient);
  }

  // Navbar
  const headerSlot = document.getElementById('cp-header-slot');
  if (headerSlot) {
    const desktopItems = NAV_ORDER.map((k) => buildNavItemMarkup(k, activeRouteKey, false)).join('');
    const mobileItems = NAV_ORDER.map((k) => buildNavItemMarkup(k, activeRouteKey, true)).join('');
    const firstName = (state.profile.fullName || 'Member').split(' ')[0];

    headerSlot.innerHTML = `
      <header class="cp-navbar" id="cp-navbar">
        <div class="container cp-navbar__inner">
          <a href="cinemas.html" class="cp-brand" aria-label="CinePass Home">
            <span class="cp-brand__mark">${ICONS.brand}</span>
            <span class="cp-brand__text">
              <span class="cp-brand__name">CinePass</span>
              <span class="cp-brand__tag">Your Movie. Your Seat.</span>
            </span>
          </a>

          <nav aria-label="Primary navigation">
            <ul class="cp-nav-links">${desktopItems}</ul>
          </nav>

          <div class="cp-nav-actions">
            <button type="button" class="icon-btn" data-theme-toggle aria-label="Toggle appearance"></button>
            <button type="button" class="icon-btn" data-open-route-config title="Configure Team Navigation Links" aria-label="Configure Team Navigation Links">
              ${ICONS.link}
            </button>
            <a href="profile.html" class="nav-profile-chip" aria-label="Open My Profile">
              <img src="${escapeHtml(state.profile.avatar)}" alt="${escapeHtml(state.profile.fullName)}" data-nav-user-avatar />
              <span data-nav-user-name>${escapeHtml(state.isLoggedIn ? firstName : 'Sign In')}</span>
            </a>
            <button type="button" class="icon-btn cp-menu-toggle" id="cp-menu-toggle" aria-expanded="false" aria-controls="cp-mobile-drawer" aria-label="Open menu">
              ${ICONS.menu}
            </button>
          </div>
        </div>
      </header>

      <div class="cp-mobile-drawer" id="cp-mobile-drawer" aria-hidden="true">
        <ul class="cp-mobile-list">${mobileItems}</ul>
        <div class="glass-card" style="padding:1rem 1.15rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;">
          <div>
            <div style="font-weight:600;font-size:0.92rem;">${escapeHtml(state.profile.fullName)}</div>
            <div style="font-size:0.78rem;color:var(--cp-gold);">${escapeHtml(state.profile.membershipType)}</div>
          </div>
          <a href="profile.html" class="btn btn--primary btn--sm">Profile</a>
        </div>
      </div>
    `;
  }

  // Footer
  const footerSlot = document.getElementById('cp-footer-slot');
  if (footerSlot) {
    footerSlot.innerHTML = `
      <footer class="cp-footer">
        <div class="container">
          <div class="cp-footer__grid">
            <div>
              <div class="cp-brand" style="margin-bottom:0.9rem;">
                <span class="cp-brand__mark">${ICONS.brand}</span>
                <span class="cp-brand__text">
                  <span class="cp-brand__name">CinePass</span>
                  <span class="cp-brand__tag">Your Movie. Your Seat. Your Experience.</span>
                </span>
              </div>
              <p style="color:var(--text-secondary);font-size:0.9rem;max-width:36ch;">
                A luxury cinema discovery, rewards, and membership experience crafted with theatrical precision.
              </p>
            </div>

            <div>
              <h3 class="cp-footer__heading">Member Experience</h3>
              <ul class="cp-footer__list">
                <li><a class="cp-footer__link" href="profile.html">My Profile &amp; Stats</a></li>
                <li><a class="cp-footer__link" href="offers.html">Offers &amp; Rewards</a></li>
                <li><a class="cp-footer__link" href="cinemas.html">Cinemas &amp; Locations</a></li>
              </ul>
            </div>

            <div>
              <h3 class="cp-footer__heading">Platform Modules</h3>
              <ul class="cp-footer__list">
                <li><button type="button" class="cp-footer__link" data-unlinked-route="home">Home Showcase</button></li>
                <li><button type="button" class="cp-footer__link" data-unlinked-route="movies">Movies &amp; Trailers</button></li>
                <li><button type="button" class="cp-footer__link" data-unlinked-route="tickets">My Tickets &amp; Seats</button></li>
              </ul>
            </div>

            <div>
              <h3 class="cp-footer__heading">Integration</h3>
              <ul class="cp-footer__list">
                <li><button type="button" class="cp-footer__link" data-open-route-config>Configure Team Routes</button></li>
                <li><button type="button" class="cp-footer__link" data-theme-toggle-text>Switch Appearance Mode</button></li>
              </ul>
            </div>
          </div>

          <div class="cp-footer__bottom">
            <span>© 2026 CinePass Cinema Experience. Demonstration listings &amp; sample promotional data.</span>
            <span>Member 4 Module · Profile · Offers · Cinemas</span>
          </div>
        </div>
      </footer>
    `;
  }

  // Re-apply theme icons to newly injected navbar buttons
  applyTheme(loadState().theme);

  // Navbar scroll elevation
  const navbar = document.getElementById('cp-navbar');
  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Theme toggles
  const handleThemeToggle = () => {
    const current = loadState().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    updateState((s) => ({ ...s, theme: next }));
    applyTheme(next);
    window.dispatchEvent(new CustomEvent('cinepass:themechange', { detail: { theme: next } }));
    showToast({
      title: next === 'dark' ? 'Cinematic Dark Mode' : 'Warm Ivory Light Mode',
      message: 'Appearance preference saved to your profile.',
      type: 'info',
      duration: 2400
    });
  };

  document.querySelectorAll('[data-theme-toggle], [data-theme-toggle-text]').forEach((el) => {
    el.addEventListener('click', handleThemeToggle);
  });

  // Mobile drawer toggle
  const menuBtn = document.getElementById('cp-menu-toggle');
  const drawer = document.getElementById('cp-mobile-drawer');
  if (menuBtn && drawer) {
    const setDrawer = (open) => {
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.innerHTML = open ? ICONS.close : ICONS.menu;
      document.body.style.overflow = open ? 'hidden' : '';
    };

    menuBtn.addEventListener('click', () => {
      const open = !drawer.classList.contains('is-open');
      setDrawer(open);
    });

    drawer.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('click', () => setDrawer(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        setDrawer(false);
      }
    });
  }

  // Configurable route buttons
  document.querySelectorAll('[data-unlinked-route]').forEach((btn) => {
    btn.addEventListener('click', () => {
      handleExternalRouteNavigation(btn.dataset.unlinkedRoute);
    });
  });

  document.querySelectorAll('[data-open-route-config]').forEach((btn) => {
    btn.addEventListener('click', () => openRouteConfigModal('home'));
  });

  initScrollReveals();
}
