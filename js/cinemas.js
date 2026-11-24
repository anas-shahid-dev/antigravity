import {
  createModalController,
  escapeHtml,
  handleExternalRouteNavigation,
  initPageShell
} from './ui.js';

initPageShell('cinemas');

/**
 * Clearly marked demonstration listings for cinemas in Pakistan.
 * Not officially integrated booking partners.
 */
const CINEMA_LISTINGS = [
  {
    id: 'nueplex-askari-4',
    name: 'Nueplex Cinemas — Askari IV',
    city: 'Karachi',
    address: 'Main Rashid Minhas Road, Askari IV, Karachi',
    contact: '+92 21 111 683 753 (Sample)',
    image: 'assets/images/cinema-nueplex.jpg',
    facilities: ['Dolby Atmos', 'Gold Recliner', 'VIP Lounge', '3D Digital', 'Valet Parking'],
    screens: '6 Luxury Screens (Including Royal & 3D)',
    capacity: '1,420 seats total (Sample)',
    parking: 'Dedicated multi-level basement & valet parking available',
    food: 'Artisanal Popcorn Bar, Gourmet Sliders, & Noir Espresso Lounge',
    extra: 'Wheelchair-accessible elevators, companion seating, and prayer area.',
    description:
      'Grand marble foyers, warm brass chandeliers, and acoustic-isolated auditoriums crafted for flagship premiere nights in Karachi.'
  },
  {
    id: 'cinepax-packages',
    name: 'Cinepax — Packages Mall',
    city: 'Lahore',
    address: 'Level 2, Packages Mall, Walton Road, Lahore',
    contact: '+92 42 111 246 372 (Sample)',
    image: 'assets/images/cinema-exterior.svg',
    facilities: ['IMAX Laser', 'Gold Recliner', 'VIP Lounge', '3D Digital'],
    screens: '7 Multiplex Screens (Platinum + Gold)',
    capacity: '1,680 seats total (Sample)',
    parking: 'Direct mall basement parking with elevator access to cinema floor',
    food: 'Platinum Dine-In Menu, Caramel Glaze Popcorn & Craft Mocktails',
    extra: 'Private member check-in kiosk and dedicated family lounge.',
    description:
      'A sleek Lahore multiplex pairing Platinum fully-reclining suites with razor-sharp dual-laser projection.'
  },
  {
    id: 'centaurus-cineplex',
    name: 'Centaurus Cineplex',
    city: 'Islamabad',
    address: '4th Floor, The Centaurus Mall, Jinnah Avenue, Sector F-8, Islamabad',
    contact: '+92 51 270 1234 (Sample)',
    image: 'assets/images/hero-cinema.jpg',
    facilities: ['Dolby Atmos', 'VIP Lounge', '3D Digital', 'Valet Parking'],
    screens: '5 Boutique Screens',
    capacity: '980 seats total (Sample)',
    parking: 'Underground Centaurus Mall parking & executive valet drop-off',
    food: 'Gourmet Nachos, Signature Hot Chocolate & Freshly Brewed Coffee',
    extra: 'Panoramic Margalla Hills foyer terrace and step-free auditorium ramps.',
    description:
      'Elevated boutique cinema overlooking the capital skyline with deep burgundy velvet seating and warm acoustic clarity.'
  },
  {
    id: 'universal-emporium',
    name: 'Universal Cinemas — Emporium Mall',
    city: 'Lahore',
    address: 'Level 3, Nishat Emporium Mall, Abdul Haque Road, Johar Town, Lahore',
    contact: '+92 42 3259 2000 (Sample)',
    image: 'assets/images/cinema-imax.svg',
    facilities: ['IMAX Laser', 'Dolby Atmos', 'Gold Recliner', '3D Digital'],
    screens: '9 Screens (Including Giant Ultra-Screen)',
    capacity: '2,150 seats total (Sample)',
    parking: '4,000+ bay indoor parking complex with direct Level 3 escalator access',
    food: 'Full Concession Atrium, Wood-Fired Flatbreads & Gelato Counter',
    extra: 'Hearing-assistance loops and family-friendly matinee sound calibration.',
    description:
      'Expansive curved-screen architecture built for monumental sci-fi blockbusters, Dolby Atmos immersion, and effortless group outings.'
  },
  {
    id: 'arena-bahria',
    name: 'Arena Cinema — Bahria Town',
    city: 'Rawalpindi',
    address: 'Phase 4 Civic Centre, Bahria Town, Rawalpindi',
    contact: '+92 51 573 2001 (Sample)',
    image: 'assets/images/hero-offers.jpg',
    facilities: ['Dolby Atmos', 'Gold Recliner', 'VIP Lounge', 'Valet Parking'],
    screens: '4 Gold & Executive Screens',
    capacity: '740 seats total (Sample)',
    parking: 'Complimentary open-air plaza & executive valet service',
    food: 'Butler Seat Service, Buttered Truffle Popcorn & Bistro Platters',
    extra: 'Intimate 40-seat private screening lounge available for reservations.',
    description:
      'An intimate boutique venue in Rawalpindi offering plush leather recliners, quiet lounge hospitality, and tailored soundscapes.'
  },
  {
    id: 'atrium-saddar',
    name: 'Atrium Cinemas — Saddar',
    city: 'Karachi',
    address: 'MBL Panorama, Raja Ghazanfar Ali Road, Saddar, Karachi',
    contact: '+92 21 111 626 384 (Sample)',
    image: 'assets/images/cinema-nueplex.jpg',
    facilities: ['3D Digital', 'Dolby Atmos', 'VIP Lounge'],
    screens: '4 Heritage Multiplex Screens',
    capacity: '1,050 seats total (Sample)',
    parking: 'Secured multi-storey mall parking adjacent to main entrance',
    food: 'Classic Cinema Concessions, Espresso Counter & Pastry Bar',
    extra: 'Historic Saddar central location with late-night weekend showings.',
    description:
      'A celebrated Karachi cinema landmark uniting classic theatrical charm with crisp 4K digital projection and surround acoustics.'
  }
];

const GALLERY_ITEMS = [
  {
    title: 'Grand Premiere Auditorium',
    caption: 'Tiered burgundy velvet seating with indirect champagne cove illumination.',
    image: 'assets/images/hero-cinema.jpg'
  },
  {
    title: 'Obsidian & Brass Foyer',
    caption: 'Double-height reception lobby with brushed brass geometric lighting.',
    image: 'assets/images/cinema-nueplex.jpg'
  },
  {
    title: 'Noir Member Lounge',
    caption: 'Pre-show hospitality, espresso bar, and private concierge check-in.',
    image: 'assets/images/hero-offers.jpg'
  },
  {
    title: 'Laser IMAX Acoustic Hall',
    caption: 'Wall-to-wall curved screen geometry paired with 64-channel spatial audio.',
    image: 'assets/images/cinema-imax.svg'
  }
];

const detailsModal = createModalController(document.getElementById('cinema-details-modal'));
const lightboxModal = createModalController(document.getElementById('gallery-lightbox-modal'));

let activeCinemaForModal = null;

function getFilteredCinemas() {
  const query = document.getElementById('cinema-search-input').value.trim().toLowerCase();
  const city = document.getElementById('cinema-city-filter').value;
  const facility = document.getElementById('cinema-facility-filter').value;

  return CINEMA_LISTINGS.filter((c) => {
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.city.toLowerCase().includes(query) ||
      c.address.toLowerCase().includes(query);
    const matchesCity = city === 'all' || c.city === city;
    const matchesFacility = facility === 'all' || c.facilities.includes(facility);
    return matchesQuery && matchesCity && matchesFacility;
  });
}

function renderCinemas() {
  const grid = document.getElementById('cinemas-grid');
  const countEl = document.getElementById('cinema-results-count');
  const results = getFilteredCinemas();

  countEl.textContent = `${results.length} ${results.length === 1 ? 'Location' : 'Locations'} Found`;

  if (!results.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1 / -1;">
        <span class="eyebrow">No Matches</span>
        <h3>No cinemas match your filters</h3>
        <p>Try clearing your search query or selecting a different city or auditorium facility.</p>
        <button type="button" class="btn btn--primary btn--sm" id="empty-clear-filters-btn">Clear All Filters</button>
      </div>
    `;
    const btn = document.getElementById('empty-clear-filters-btn');
    if (btn) btn.addEventListener('click', clearAllFilters);
    return;
  }

  grid.innerHTML = results
    .map(
      (cinema, idx) => `
      <article class="surface-card surface-card--interactive cinema-card stagger-item is-visible" style="transition-delay:${idx * 55}ms;">
        <div class="cinema-card__media">
          <img src="${escapeHtml(cinema.image)}" alt="${escapeHtml(cinema.name)}" />
          <span class="cinema-card__city-badge">${escapeHtml(cinema.city)}</span>
          <span class="cinema-card__demo-pill">Demo Listing</span>
        </div>

        <div class="cinema-card__body">
          <div>
            <h3 class="cinema-card__title">${escapeHtml(cinema.name)}</h3>
            <p class="cinema-card__address">${escapeHtml(cinema.address)}</p>
          </div>

          <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.5;">
            ${escapeHtml(cinema.description)}
          </p>

          <div class="facility-chips">
            ${cinema.facilities
              .map((fac) => `<span class="facility-chip">${escapeHtml(fac)}</span>`)
              .join('')}
          </div>

          <div style="font-size:0.78rem;color:var(--text-muted);">
            Tel: ${escapeHtml(cinema.contact)}
          </div>

          <div class="cinema-card__actions">
            <button type="button" class="btn btn--ghost btn--sm" data-view-details="${escapeHtml(cinema.id)}">
              View Details
            </button>
            <button type="button" class="btn btn--primary btn--sm" data-view-shows="${escapeHtml(cinema.id)}">
              View Shows
            </button>
          </div>
        </div>
      </article>
    `
    )
    .join('');

  grid.querySelectorAll('[data-view-details]').forEach((btn) => {
    btn.addEventListener('click', () => openCinemaDetails(btn.dataset.viewDetails));
  });

  grid.querySelectorAll('[data-view-shows]').forEach((btn) => {
    btn.addEventListener('click', () => {
      handleExternalRouteNavigation('showtimes', `?cinema=${encodeURIComponent(btn.dataset.viewShows)}`);
    });
  });
}

function openCinemaDetails(cinemaId) {
  const cinema = CINEMA_LISTINGS.find((c) => c.id === cinemaId);
  if (!cinema) return;
  activeCinemaForModal = cinema;

  document.getElementById('modal-cinema-city').textContent = `${cinema.city} · Demonstration Listing`;
  document.getElementById('modal-cinema-name').textContent = cinema.name;
  document.getElementById('modal-cinema-address').textContent = cinema.address;
  document.getElementById('modal-cinema-img').src = cinema.image;
  document.getElementById('modal-cinema-img').alt = cinema.name;
  document.getElementById('modal-cinema-desc').textContent = cinema.description;
  document.getElementById('modal-cinema-screens').textContent = cinema.screens;
  document.getElementById('modal-cinema-capacity').textContent = cinema.capacity;
  document.getElementById('modal-cinema-parking').textContent = cinema.parking;
  document.getElementById('modal-cinema-food').textContent = cinema.food;
  document.getElementById('modal-cinema-contact').textContent = cinema.contact;
  document.getElementById('modal-cinema-extra').textContent = cinema.extra;
  document.getElementById('modal-cinema-facilities').innerHTML = cinema.facilities
    .map((fac) => `<span class="facility-chip">${escapeHtml(fac)}</span>`)
    .join('');

  detailsModal.open();
}

function clearAllFilters() {
  document.getElementById('cinema-search-input').value = '';
  document.getElementById('cinema-city-filter').value = 'all';
  document.getElementById('cinema-facility-filter').value = 'all';
  renderCinemas();
}

/* Search & Filter Listeners */
document.getElementById('cinema-search-input').addEventListener('input', renderCinemas);
document.getElementById('cinema-city-filter').addEventListener('change', renderCinemas);
document.getElementById('cinema-facility-filter').addEventListener('change', renderCinemas);
document.getElementById('clear-cinema-filters-btn').addEventListener('click', clearAllFilters);

document.getElementById('modal-view-shows-btn').addEventListener('click', () => {
  detailsModal.close();
  const id = activeCinemaForModal ? activeCinemaForModal.id : '';
  handleExternalRouteNavigation('showtimes', id ? `?cinema=${encodeURIComponent(id)}` : '');
});

/* Gallery Lightbox */
document.querySelectorAll('[data-gallery-index]').forEach((tile) => {
  const openTile = () => {
    const item = GALLERY_ITEMS[Number(tile.dataset.galleryIndex)];
    if (!item) return;
    document.getElementById('lightbox-title').textContent = item.title;
    document.getElementById('lightbox-caption').textContent = item.caption;
    document.getElementById('lightbox-img').src = item.image;
    document.getElementById('lightbox-img').alt = item.title;
    lightboxModal.open();
  };

  tile.addEventListener('click', openTile);
  tile.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openTile();
    }
  });
});

renderCinemas();
