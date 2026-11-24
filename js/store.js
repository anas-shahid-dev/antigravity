/**
 * CinePass Persistent Application Store (localStorage)
 * Holds profile data, preferences, movie catalog, favourites, bookings ledger,
 * and active coupon / ticket calculation state.
 */

const STORAGE_KEY = 'cinepass_member4_state_v1';

export const MOVIE_CATALOG = [
  {
    id: 'sands-of-meridian',
    title: 'Sands of Meridian',
    genre: 'Sci-Fi · IMAX',
    rating: 9.2,
    duration: '2h 38m',
    year: 2026,
    poster: 'assets/images/poster-1.svg'
  },
  {
    id: 'nocturne-in-crimson',
    title: 'Nocturne in Crimson',
    genre: 'Neo-Noir · Thriller',
    rating: 8.9,
    duration: '2h 12m',
    year: 2026,
    poster: 'assets/images/poster-2.svg'
  },
  {
    id: 'karakoram-crown',
    title: 'The Karakoram Crown',
    genre: 'Epic · Adventure',
    rating: 9.1,
    duration: '2h 44m',
    year: 2026,
    poster: 'assets/images/poster-3.jpg'
  },
  {
    id: 'glass-conservatory',
    title: 'The Glass Conservatory',
    genre: 'Mystery · Arthouse',
    rating: 8.7,
    duration: '1h 58m',
    year: 2025,
    poster: 'assets/images/poster-4.jpg'
  },
  {
    id: 'lahore-midnight-express',
    title: 'Lahore Midnight Express',
    genre: 'Crime · Drama',
    rating: 8.8,
    duration: '2h 19m',
    year: 2026,
    poster: 'assets/images/poster-5.svg'
  },
  {
    id: 'aurelia-final-encore',
    title: 'Aurelia: Final Encore',
    genre: 'Musical · Romance',
    rating: 8.6,
    duration: '2h 06m',
    year: 2025,
    poster: 'assets/images/poster-6.svg'
  }
];

export const DEFAULT_STATE = {
  isLoggedIn: true,
  theme: 'dark',
  profile: {
    fullName: 'Aarish Mahmood',
    email: 'aarish.mahmood@cinepass.pk',
    phone: '+92 321 8459012',
    city: 'Lahore',
    membershipType: 'CinePass Noir (Platinum)',
    membershipStatus: 'Active · Priority Lounge Access',
    memberSince: 'March 14, 2024',
    avatar: 'assets/images/avatar-member.jpg',
    lastPasswordUpdate: 'October 18, 2026'
  },
  notifications: {
    premiereAlerts: true,
    bookingReminders: true,
    exclusiveOffers: true,
    smsUpdates: false
  },
  favouriteMovieIds: [
    'sands-of-meridian',
    'nocturne-in-crimson',
    'karakoram-crown',
    'glass-conservatory'
  ],
  // Real underlying booking records used to calculate all dashboard statistics dynamically
  bookings: [
    {
      id: 'CP-90412',
      movieTitle: 'Sands of Meridian',
      cinema: 'Nueplex Cinemas — Askari IV',
      format: 'IMAX Laser · Gold Recliner',
      date: '2026-11-28',
      seats: 2,
      amountPkr: 3600,
      status: 'upcoming'
    },
    {
      id: 'CP-90488',
      movieTitle: 'The Karakoram Crown',
      cinema: 'Cinepax Packages Mall',
      format: 'Platinum Lounge',
      date: '2026-12-04',
      seats: 2,
      amountPkr: 3200,
      status: 'upcoming'
    },
    {
      id: 'CP-88210',
      movieTitle: 'Nocturne in Crimson',
      cinema: 'Universal Cinemas Emporium',
      format: 'Dolby Atmos VIP',
      date: '2026-10-19',
      seats: 2,
      amountPkr: 3000,
      status: 'watched'
    },
    {
      id: 'CP-87104',
      movieTitle: 'The Glass Conservatory',
      cinema: 'Centaurus Cineplex',
      format: 'Director’s Suite',
      date: '2026-09-11',
      seats: 1,
      amountPkr: 1950,
      status: 'watched'
    },
    {
      id: 'CP-85921',
      movieTitle: 'Lahore Midnight Express',
      cinema: 'Cinepax Packages Mall',
      format: '2D Gold Class',
      date: '2026-08-03',
      seats: 3,
      amountPkr: 4200,
      status: 'watched'
    },
    {
      id: 'CP-84290',
      movieTitle: 'Aurelia: Final Encore',
      cinema: 'Atrium Cinemas Saddar',
      format: '3D Premiere',
      date: '2026-06-22',
      seats: 2,
      amountPkr: 2800,
      status: 'watched'
    },
    {
      id: 'CP-82015',
      movieTitle: 'Sands of Meridian (Early Access)',
      cinema: 'Arena Cinema Bahria Town',
      format: 'IMAX Preview',
      date: '2026-05-09',
      seats: 2,
      amountPkr: 3400,
      status: 'watched'
    }
  ],
  appliedCouponCode: null,
  preferredCinemaFilter: ''
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = clone(DEFAULT_STATE);
      saveState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      ...clone(DEFAULT_STATE),
      ...parsed,
      profile: {
        ...DEFAULT_STATE.profile,
        ...(parsed.profile || {})
      },
      notifications: {
        ...DEFAULT_STATE.notifications,
        ...(parsed.notifications || {})
      },
      favouriteMovieIds: Array.isArray(parsed.favouriteMovieIds)
        ? parsed.favouriteMovieIds
        : clone(DEFAULT_STATE.favouriteMovieIds),
      bookings: Array.isArray(parsed.bookings)
        ? parsed.bookings
        : clone(DEFAULT_STATE.bookings)
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function updateState(updater) {
  const current = loadState();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  saveState(next);
  return next;
}

export function computeDashboardStats(state) {
  const bookings = state.bookings || [];
  const moviesWatched = bookings.filter((b) => b.status === 'watched').length;
  const upcomingBookings = bookings.filter((b) => b.status === 'upcoming').length;
  const favouriteMovies = (state.favouriteMovieIds || []).filter((id) =>
    MOVIE_CATALOG.some((m) => m.id === id)
  ).length;
  const totalAmountSpent = bookings.reduce((sum, b) => sum + (Number(b.amountPkr) || 0), 0);

  return {
    moviesWatched,
    upcomingBookings,
    favouriteMovies,
    totalAmountSpent
  };
}
