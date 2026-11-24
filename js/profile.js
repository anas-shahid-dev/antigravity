import {
  MOVIE_CATALOG,
  computeDashboardStats,
  loadState,
  updateState
} from './store.js';
import {
  animateCounter,
  applyTheme,
  createModalController,
  escapeHtml,
  formatCurrencyPkr,
  initPageShell,
  refreshNavbarProfileChip,
  showToast
} from './ui.js';

initPageShell('profile');

const editModal = createModalController(document.getElementById('edit-profile-modal'));
const passwordModal = createModalController(document.getElementById('change-password-modal'));
const addFavModal = createModalController(document.getElementById('add-favourite-modal'));

function renderAll() {
  const state = loadState();
  const authView = document.getElementById('profile-authenticated-view');
  const loggedOutView = document.getElementById('logged-out-view');

  if (!state.isLoggedIn) {
    authView.style.display = 'none';
    loggedOutView.style.display = 'block';
    refreshNavbarProfileChip();
    return;
  }

  authView.style.display = 'block';
  loggedOutView.style.display = 'none';

  renderHeroAndInfo(state);
  renderStats(state);
  renderFavourites(state);
  renderLedger(state);
  renderSettings(state);
  refreshNavbarProfileChip();
}

function renderHeroAndInfo(state) {
  const p = state.profile;
  document.getElementById('hero-avatar').src = p.avatar;
  document.getElementById('hero-avatar').alt = p.fullName;
  document.getElementById('hero-membership-type').textContent = p.membershipType;
  document.getElementById('hero-membership-status').textContent = p.membershipStatus;
  document.getElementById('hero-full-name').textContent = p.fullName;
  document.getElementById('hero-email').textContent = p.email;
  document.getElementById('hero-member-since').textContent = p.memberSince;

  document.getElementById('info-full-name').textContent = p.fullName;
  document.getElementById('info-email').textContent = p.email;
  document.getElementById('info-phone').textContent = p.phone;
  document.getElementById('info-city').textContent = p.city;
  document.getElementById('info-membership').textContent = p.membershipType;
  document.getElementById('password-updated-note').textContent =
    `Last updated ${p.lastPasswordUpdate || 'October 18, 2026'}`;
}

function renderStats(state) {
  const stats = computeDashboardStats(state);
  animateCounter(document.getElementById('stat-movies-watched'), stats.moviesWatched, { duration: 700 });
  animateCounter(document.getElementById('stat-upcoming-bookings'), stats.upcomingBookings, { duration: 700 });
  animateCounter(document.getElementById('stat-favourite-movies'), stats.favouriteMovies, { duration: 600 });
  animateCounter(document.getElementById('stat-total-spent'), stats.totalAmountSpent, {
    prefix: 'PKR ',
    duration: 950
  });
}

function renderFavourites(state) {
  const grid = document.getElementById('favourites-grid');
  const favMovies = MOVIE_CATALOG.filter((m) => state.favouriteMovieIds.includes(m.id));

  if (!favMovies.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1 / -1;">
        <span class="eyebrow">Empty Watchlist</span>
        <h3>No favourite movies yet</h3>
        <p>Curate your personal cinema slate by adding films you love or plan to experience in IMAX.</p>
        <button type="button" class="btn btn--primary btn--sm" id="empty-add-fav-btn">+ Browse Curated Slate</button>
      </div>
    `;
    const btn = document.getElementById('empty-add-fav-btn');
    if (btn) btn.addEventListener('click', openAddFavouriteModal);
    return;
  }

  grid.innerHTML = favMovies
    .map(
      (movie) => `
      <article class="surface-card surface-card--interactive movie-card">
        <div class="movie-card__poster">
          <img src="${escapeHtml(movie.poster)}" alt="${escapeHtml(movie.title)} poster" loading="lazy" />
          <span class="movie-card__rating">★ ${movie.rating.toFixed(1)}</span>
        </div>
        <div class="movie-card__body">
          <h3 class="movie-card__title">${escapeHtml(movie.title)}</h3>
          <p class="movie-card__genre">${escapeHtml(movie.genre)} · ${escapeHtml(movie.duration)}</p>
          <div class="movie-card__actions">
            <button type="button" class="btn btn--ghost btn--sm" style="width:100%;" data-remove-fav="${escapeHtml(movie.id)}">
              Remove from Favourites
            </button>
          </div>
        </div>
      </article>
    `
    )
    .join('');

  grid.querySelectorAll('[data-remove-fav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const movieId = btn.dataset.removeFav;
      const movie = MOVIE_CATALOG.find((m) => m.id === movieId);
      const next = updateState((s) => ({
        ...s,
        favouriteMovieIds: s.favouriteMovieIds.filter((id) => id !== movieId)
      }));
      renderFavourites(next);
      renderStats(next);
      showToast({
        title: 'Removed from Favourites',
        message: movie ? `${movie.title} removed from your watchlist.` : 'Watchlist updated.',
        type: 'info'
      });
    });
  });
}

function renderLedger(state) {
  const container = document.getElementById('bookings-ledger');
  if (!container) return;
  container.innerHTML = state.bookings
    .map((b) => {
      const isUpcoming = b.status === 'upcoming';
      return `
        <div class="ledger-row">
          <div>
            <div style="font-weight:600;color:var(--text-strong);">${escapeHtml(b.movieTitle)}</div>
            <div style="font-size:0.82rem;color:var(--text-secondary);">${escapeHtml(b.cinema)} · ${escapeHtml(b.format)}</div>
          </div>
          <div style="font-size:0.85rem;color:var(--text-secondary);">
            <span>${escapeHtml(b.date)}</span> · <span>${b.seats} ${b.seats === 1 ? 'seat' : 'seats'}</span>
          </div>
          <div>
            <span class="badge-status" style="${
              isUpcoming
                ? 'background:var(--status-warning-bg);color:var(--status-warning);'
                : ''
            }">${isUpcoming ? 'Upcoming' : 'Watched'}</span>
          </div>
          <div style="font-family:var(--font-mono);font-weight:700;color:var(--cp-gold);">
            ${formatCurrencyPkr(b.amountPkr)}
          </div>
        </div>
      `;
    })
    .join('');
}

function renderSettings(state) {
  document.getElementById('pref-premiere-alerts').checked = Boolean(state.notifications.premiereAlerts);
  document.getElementById('pref-booking-reminders').checked = Boolean(state.notifications.bookingReminders);
  document.getElementById('pref-exclusive-offers').checked = Boolean(state.notifications.exclusiveOffers);

  const isLight = state.theme === 'light';
  document.getElementById('pref-light-mode').checked = isLight;
  document.getElementById('appearance-mode-label').textContent = isLight
    ? 'Warm Ivory Light Mode active'
    : 'Cinematic Dark Mode active';
}

/* ==========================================================================
   Edit Profile Modal & Validation
   ========================================================================== */
function openEditProfileModal() {
  const { profile } = loadState();
  const form = document.getElementById('edit-profile-form');
  form.fullName.value = profile.fullName;
  form.email.value = profile.email;
  form.phone.value = profile.phone;
  form.city.value = profile.city;
  form.membershipType.value = profile.membershipType;
  clearProfileErrors();
  editModal.open();
}

function clearProfileErrors() {
  ['fullName', 'email', 'phone', 'city', 'membershipType'].forEach((field) => {
    const errEl = document.getElementById(`err-${field}`);
    const input = document.getElementById(`edit-${field === 'fullName' ? 'full-name' : field === 'membershipType' ? 'membership' : field}`);
    if (errEl) errEl.textContent = '';
    if (input) input.classList.remove('is-invalid');
  });
}

document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
  e.preventDefault();
  clearProfileErrors();
  const form = e.currentTarget;

  const fullName = form.fullName.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const city = form.city.value.trim();
  const membershipType = form.membershipType.value;

  let valid = true;
  const setErr = (field, inputId, msg) => {
    valid = false;
    document.getElementById(`err-${field}`).textContent = msg;
    document.getElementById(inputId).classList.add('is-invalid');
  };

  if (fullName.length < 2) {
    setErr('fullName', 'edit-full-name', 'Please enter your full name (at least 2 characters).');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    setErr('email', 'edit-email', 'Please enter a valid email address.');
  }
  if (!/^[+\d][\d\s()-]{7,18}$/.test(phone)) {
    setErr('phone', 'edit-phone', 'Please enter a valid phone number (e.g. +92 321 8459012).');
  }
  if (!city) {
    setErr('city', 'edit-city', 'Please select your city.');
  }

  if (!valid) return;

  const next = updateState((s) => ({
    ...s,
    profile: {
      ...s.profile,
      fullName,
      email,
      phone,
      city,
      membershipType
    }
  }));

  editModal.close();
  renderHeroAndInfo(next);
  refreshNavbarProfileChip();
  showToast({
    title: 'Profile Saved',
    message: 'Your personal details have been updated and saved.',
    type: 'success'
  });
});

/* ==========================================================================
   Add Favourite Movie Modal
   ========================================================================== */
function openAddFavouriteModal() {
  const state = loadState();
  const available = MOVIE_CATALOG.filter((m) => !state.favouriteMovieIds.includes(m.id));
  const listEl = document.getElementById('add-favourite-list');

  if (!available.length) {
    listEl.innerHTML = `
      <div class="empty-state" style="grid-column:1 / -1;">
        <h3>All Curated Titles Added</h3>
        <p>Every film in the current CinePass slate is already in your favourites collection.</p>
      </div>
    `;
  } else {
    listEl.innerHTML = available
      .map(
        (movie) => `
        <article class="surface-card movie-card">
          <div class="movie-card__poster">
            <img src="${escapeHtml(movie.poster)}" alt="${escapeHtml(movie.title)} poster" />
            <span class="movie-card__rating">★ ${movie.rating.toFixed(1)}</span>
          </div>
          <div class="movie-card__body">
            <h3 class="movie-card__title" style="font-size:1.05rem;">${escapeHtml(movie.title)}</h3>
            <p class="movie-card__genre">${escapeHtml(movie.genre)}</p>
            <div class="movie-card__actions">
              <button type="button" class="btn btn--primary btn--sm" style="width:100%;" data-add-fav="${escapeHtml(movie.id)}">
                + Add to Favourites
              </button>
            </div>
          </div>
        </article>
      `
      )
      .join('');

    listEl.querySelectorAll('[data-add-fav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const movieId = btn.dataset.addFav;
        const movie = MOVIE_CATALOG.find((m) => m.id === movieId);
        const next = updateState((s) => ({
          ...s,
          favouriteMovieIds: [...new Set([...s.favouriteMovieIds, movieId])]
        }));
        renderFavourites(next);
        renderStats(next);
        openAddFavouriteModal();
        showToast({
          title: 'Added to Favourites',
          message: movie ? `${movie.title} added to your collection.` : 'Movie added.',
          type: 'success'
        });
      });
    });
  }

  addFavModal.open();
}

/* ==========================================================================
   Change Password (Simulated) Modal
   ========================================================================== */
document.getElementById('open-password-modal-btn').addEventListener('click', () => {
  document.getElementById('change-password-form').reset();
  ['err-pw-current', 'err-pw-new', 'err-pw-confirm'].forEach((id) => {
    document.getElementById(id).textContent = '';
  });
  ['pw-current', 'pw-new', 'pw-confirm'].forEach((id) => {
    document.getElementById(id).classList.remove('is-invalid');
  });
  passwordModal.open();
});

document.getElementById('change-password-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const current = document.getElementById('pw-current');
  const nextPw = document.getElementById('pw-new');
  const confirm = document.getElementById('pw-confirm');

  ['err-pw-current', 'err-pw-new', 'err-pw-confirm'].forEach((id) => {
    document.getElementById(id).textContent = '';
  });
  [current, nextPw, confirm].forEach((el) => el.classList.remove('is-invalid'));

  let valid = true;
  if (current.value.trim().length < 4) {
    valid = false;
    current.classList.add('is-invalid');
    document.getElementById('err-pw-current').textContent = 'Enter your current password (min. 4 characters).';
  }
  if (nextPw.value.length < 8) {
    valid = false;
    nextPw.classList.add('is-invalid');
    document.getElementById('err-pw-new').textContent = 'New password must be at least 8 characters.';
  }
  if (confirm.value !== nextPw.value || !confirm.value) {
    valid = false;
    confirm.classList.add('is-invalid');
    document.getElementById('err-pw-confirm').textContent = 'Passwords do not match.';
  }

  if (!valid) return;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const next = updateState((s) => ({
    ...s,
    profile: {
      ...s.profile,
      lastPasswordUpdate: formattedDate
    }
  }));

  passwordModal.close();
  renderHeroAndInfo(next);
  showToast({
    title: 'Password Updated (Simulated)',
    message: `Security timestamp refreshed to ${formattedDate}.`,
    type: 'success'
  });
});

/* ==========================================================================
   Settings Switches & Session Controls
   ========================================================================== */
[
  ['pref-premiere-alerts', 'premiereAlerts', 'Premiere & IMAX alerts'],
  ['pref-booking-reminders', 'bookingReminders', 'Booking reminders'],
  ['pref-exclusive-offers', 'exclusiveOffers', 'Exclusive offers digest']
].forEach(([inputId, key, label]) => {
  document.getElementById(inputId).addEventListener('change', (e) => {
    const enabled = e.target.checked;
    updateState((s) => ({
      ...s,
      notifications: {
        ...s.notifications,
        [key]: enabled
      }
    }));
    showToast({
      title: `${label} ${enabled ? 'enabled' : 'paused'}`,
      message: 'Notification preference saved.',
      type: 'info',
      duration: 2400
    });
  });
});

document.getElementById('pref-light-mode').addEventListener('change', (e) => {
  const nextTheme = e.target.checked ? 'light' : 'dark';
  const next = updateState((s) => ({ ...s, theme: nextTheme }));
  applyTheme(nextTheme);
  renderSettings(next);
  showToast({
    title: nextTheme === 'light' ? 'Warm Ivory Light Mode' : 'Cinematic Dark Mode',
    message: 'Appearance preference saved.',
    type: 'info',
    duration: 2400
  });
});

window.addEventListener('cinepass:themechange', () => {
  renderSettings(loadState());
});

document.getElementById('logout-btn').addEventListener('click', () => {
  updateState((s) => ({ ...s, isLoggedIn: false }));
  renderAll();
  showToast({
    title: 'Signed Out',
    message: 'You have securely logged out of your CinePass session.',
    type: 'info'
  });
});

document.getElementById('sign-back-in-btn').addEventListener('click', () => {
  updateState((s) => ({ ...s, isLoggedIn: true }));
  renderAll();
  showToast({
    title: 'Welcome Back',
    message: 'Your CinePass membership dashboard is active.',
    type: 'success'
  });
});

document.getElementById('open-edit-profile-hero').addEventListener('click', openEditProfileModal);
document.getElementById('open-edit-profile-card').addEventListener('click', openEditProfileModal);
document.getElementById('settings-edit-info-btn').addEventListener('click', openEditProfileModal);
document.getElementById('open-add-favourite-btn').addEventListener('click', openAddFavouriteModal);

renderAll();
