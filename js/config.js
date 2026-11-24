/**
 * CinePass Route & Integration Configuration
 * --------------------------------------------------------------------------
 * Member 4 owns: User Profile (profile.html), Offers (offers.html), Cinemas (cinemas.html).
 * Teammate routes (Home, Movies, My Tickets, Showtimes) can be pointed to actual
 * HTML paths here once integrated into the unified CinePass repository.
 * Set a teammate route to a string URL (e.g. 'index.html', 'movies.html') when available,
 * or leave `null` to open the integrated Integration Preview / Route Config modal
 * instead of navigating to a broken 404 link.
 */

export const CINEPASS_ROUTES = {
  home: {
    label: 'Home',
    href: null, // Configure e.g. 'index.html' when Member 1 merges
    owner: 'Member 1 — Landing & Showcase',
    description: 'CinePass flagship landing experience and featured premieres.'
  },
  movies: {
    label: 'Movies',
    href: null, // Configure e.g. 'movies.html' when Member 2 merges
    owner: 'Member 2 — Movie Catalog',
    description: 'Now showing, coming soon, trailers, and curated collections.'
  },
  cinemas: {
    label: 'Cinemas',
    href: 'cinemas.html',
    owner: 'Member 4 — Cinemas & Locations',
    description: 'Cinema discovery, facilities explorer, and auditorium gallery.'
  },
  offers: {
    label: 'Offers',
    href: 'offers.html',
    owner: 'Member 4 — Offers & Discounts',
    description: 'Exclusive rewards, promotional campaigns, and interactive coupons.'
  },
  tickets: {
    label: 'My Tickets',
    href: null, // Configure e.g. 'tickets.html' when Member 3 merges
    owner: 'Member 3 — Booking & Tickets',
    description: 'Digital passes, seat maps, and booking checkout.'
  },
  profile: {
    label: 'My Profile',
    href: 'profile.html',
    owner: 'Member 4 — User Profile',
    description: 'Personal dashboard, statistics, favourites, and preferences.'
  },
  showtimes: {
    label: 'Showtimes',
    href: null, // Configure e.g. 'showtimes.html?cinema=' when showtimes page is merged
    owner: 'Member 2/3 — Showtimes & Seat Selection',
    description: 'Daily screening schedules and interactive seat selection.'
  }
};

const ROUTE_OVERRIDE_KEY = 'cinepass_route_overrides_v1';

export function getResolvedRoute(routeKey) {
  const base = CINEPASS_ROUTES[routeKey];
  if (!base) return null;

  try {
    const raw = localStorage.getItem(ROUTE_OVERRIDE_KEY);
    if (raw) {
      const overrides = JSON.parse(raw);
      if (Object.prototype.hasOwnProperty.call(overrides, routeKey) && overrides[routeKey]) {
        return { ...base, href: overrides[routeKey] };
      }
    }
  } catch {
    // Ignore malformed storage
  }
  return base;
}

export function saveRouteOverrides(overrides) {
  try {
    localStorage.setItem(ROUTE_OVERRIDE_KEY, JSON.stringify(overrides));
    return true;
  } catch {
    return false;
  }
}

export function resetRouteOverrides() {
  try {
    localStorage.removeItem(ROUTE_OVERRIDE_KEY);
  } catch {
    // Ignore
  }
}
