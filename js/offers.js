import { loadState, updateState } from './store.js';
import {
  animateCounter,
  escapeHtml,
  formatCurrencyPkr,
  initPageShell,
  showToast
} from './ui.js';

initPageShell('offers');

const OFFERS_CATALOG = [
  {
    id: 'weekend-special',
    title: 'Weekend Special',
    category: 'weekend',
    categoryLabel: 'Weekend Deals',
    dealBadge: '20% OFF',
    discountType: 'percent',
    discountValue: 20,
    minTickets: 1,
    code: 'WEEKEND20',
    expiry: '2026-12-31',
    description:
      'Elevate Friday through Sunday evening screenings with 20% off Gold Class and Standard reservations.'
  },
  {
    id: 'student-discount',
    title: 'Student Discount',
    category: 'student',
    categoryLabel: 'Student Deals',
    dealBadge: '15% OFF',
    discountType: 'percent',
    discountValue: 15,
    minTickets: 1,
    code: 'STUDENT15',
    expiry: '2026-12-31',
    description:
      'Verified university and college film lovers enjoy 15% savings on weekday matinee and evening shows.'
  },
  {
    id: 'family-package',
    title: 'Family Movie Package',
    category: 'family',
    categoryLabel: 'Family Packages',
    dealBadge: '25% OFF',
    discountType: 'percent',
    discountValue: 25,
    minTickets: 4,
    code: 'FAMILY25',
    expiry: '2026-12-31',
    description:
      'Reserve 4 or more seats together for family premieres and unlock a 25% group reduction on the full fare.'
  },
  {
    id: 'buy-2-get-1',
    title: 'Buy 2 Get 1 Free',
    category: 'exclusive',
    categoryLabel: 'Exclusive Rewards',
    dealBadge: '1 FREE SEAT',
    discountType: 'bogo3',
    discountValue: 1,
    minTickets: 3,
    code: 'CINEBOGO',
    expiry: '2026-12-20',
    description:
      'Select 3 or more seats in one reservation and receive your third ticket complimentary at checkout.'
  },
  {
    id: 'movie-night-combo',
    title: 'Movie Night Combo',
    category: 'weekend',
    categoryLabel: 'Weekend Deals',
    dealBadge: '10% OFF',
    discountType: 'percent',
    discountValue: 10,
    minTickets: 1,
    code: 'CINE10',
    expiry: '2026-12-31',
    description:
      'Enjoy 10% instant ticket savings paired with priority lounge concession pickup on any screening.'
  },
  {
    id: 'exclusive-member-rewards',
    title: 'Exclusive Member Rewards',
    category: 'exclusive',
    categoryLabel: 'Exclusive Rewards',
    dealBadge: '30% OFF VIP',
    discountType: 'percent',
    discountValue: 30,
    minTickets: 1,
    code: 'NOIR30',
    expiry: '2026-12-28',
    description:
      'Signature CinePass Noir member privilege granting 30% off IMAX Laser and Director’s Suite seats.'
  }
];

// Additional expired coupon specifically for testing expired coupon prevention
const EXPIRED_COUPONS = [
  {
    code: 'SUMMER25',
    title: 'Summer Premiere Pass',
    expiry: '2026-08-31'
  }
];

let activeCategory = 'all';

function isOfferExpired(expiryDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(`${expiryDateStr}T23:59:59`);
  return exp < today;
}

function formatExpiry(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function renderOffers() {
  const grid = document.getElementById('offers-grid');
  const state = loadState();
  const filtered =
    activeCategory === 'all'
      ? OFFERS_CATALOG
      : OFFERS_CATALOG.filter((o) => o.category === activeCategory);

  grid.innerHTML = filtered
    .map((offer, idx) => {
      const isApplied = state.appliedCouponCode === offer.code;
      return `
      <article class="surface-card surface-card--interactive offer-card stagger-item is-visible" style="transition-delay:${idx * 55}ms;">
        <div class="offer-card__top">
          <span class="offer-card__deal">${escapeHtml(offer.dealBadge)}</span>
          <span class="offer-card__demo-tag">Demo · ${escapeHtml(offer.categoryLabel)}</span>
        </div>

        <div>
          <h3 class="offer-card__title">${escapeHtml(offer.title)}</h3>
          <p class="offer-card__desc">${escapeHtml(offer.description)}</p>
        </div>

        <div class="offer-card__code-box">
          <span class="offer-card__code">${escapeHtml(offer.code)}</span>
          <span style="font-size:0.75rem;color:var(--text-muted);">
            ${offer.minTickets > 1 ? `Min. ${offer.minTickets} tickets` : 'All seat tiers'}
          </span>
        </div>

        <div class="offer-card__meta">
          <span>Expires ${escapeHtml(formatExpiry(offer.expiry))}</span>
          ${isApplied ? '<span style="color:var(--status-success);font-weight:700;">● Applied</span>' : ''}
        </div>

        <div class="offer-card__actions">
          <button type="button" class="btn btn--ghost btn--sm" data-copy-code="${escapeHtml(offer.code)}">
            Copy Code
          </button>
          <button type="button" class="btn ${isApplied ? 'btn--burgundy' : 'btn--primary'} btn--sm" data-apply-code="${escapeHtml(offer.code)}">
            ${isApplied ? 'Applied ✓' : 'Apply Offer'}
          </button>
        </div>
      </article>
    `;
    })
    .join('');

  grid.querySelectorAll('[data-copy-code]').forEach((btn) => {
    btn.addEventListener('click', () => copyCouponCode(btn.dataset.copyCode, btn));
  });

  grid.querySelectorAll('[data-apply-code]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.applyCode;
      document.getElementById('coupon-code-input').value = code;
      applyCoupon(code);
      document.getElementById('coupon-calculator').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

async function copyCouponCode(code, buttonEl) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(code);
    } else {
      const temp = document.createElement('textarea');
      temp.value = code;
      temp.setAttribute('readonly', '');
      temp.style.position = 'absolute';
      temp.style.left = '-9999px';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
    }
    if (buttonEl) {
      const original = buttonEl.textContent;
      buttonEl.textContent = 'Copied ✓';
      window.setTimeout(() => {
        buttonEl.textContent = original;
      }, 1500);
    }
    showToast({
      title: `Copied ${code}`,
      message: 'Promo code copied to your clipboard.',
      type: 'success'
    });
  } catch {
    showToast({
      title: `Promo Code: ${code}`,
      message: 'Select and copy the code directly or click Apply Offer.',
      type: 'info'
    });
  }
}

function setFeedback(message, status) {
  const el = document.getElementById('coupon-feedback');
  if (!el) return;
  el.textContent = message;
  el.style.color =
    status === 'error'
      ? 'var(--status-error)'
      : status === 'success'
        ? 'var(--status-success)'
        : 'var(--text-secondary)';
}

function calculateAndRenderSummary() {
  const unitPrice = Number(document.getElementById('calc-tier').value) || 1800;
  const qty = Number(document.getElementById('calc-qty').value) || 2;
  const subtotal = unitPrice * qty;

  const state = loadState();
  const code = state.appliedCouponCode;
  const offer = OFFERS_CATALOG.find((o) => o.code === code);

  let discount = 0;
  let discountLabel = 'None';

  const pill = document.getElementById('active-coupon-pill');
  const clearBtn = document.getElementById('clear-coupon-btn');

  if (offer && !isOfferExpired(offer.expiry)) {
    if (qty < offer.minTickets) {
      discountLabel = `${offer.code} (Needs ${offer.minTickets}+ tickets)`;
      discount = 0;
      setFeedback(
        `${offer.code} requires at least ${offer.minTickets} tickets. Increase ticket quantity above to unlock the discount.`,
        'error'
      );
    } else if (offer.discountType === 'percent') {
      discount = Math.round((subtotal * offer.discountValue) / 100);
      discountLabel = `${offer.code} · ${offer.discountValue}%`;
    } else if (offer.discountType === 'bogo3') {
      const freeSeats = Math.floor(qty / 3);
      discount = freeSeats * unitPrice;
      discountLabel = `${offer.code} · ${freeSeats} Free Seat`;
    }
    pill.textContent = offer.code;
    pill.style.display = 'inline-flex';
    clearBtn.style.display = 'inline-flex';
  } else {
    pill.style.display = 'none';
    clearBtn.style.display = 'none';
  }

  const total = Math.max(0, subtotal - discount);

  document.getElementById('sum-qty').textContent = String(qty);
  document.getElementById('sum-unit').textContent = formatCurrencyPkr(unitPrice);
  document.getElementById('sum-subtotal').textContent = formatCurrencyPkr(subtotal);
  document.getElementById('sum-discount-label').textContent = discountLabel;
  document.getElementById('sum-discount').textContent =
    discount > 0 ? `- ${formatCurrencyPkr(discount)}` : 'PKR 0';

  animateCounter(document.getElementById('sum-total'), total, {
    prefix: 'PKR ',
    duration: 420
  });
}

function applyCoupon(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  const input = document.getElementById('coupon-code-input');
  input.classList.remove('is-invalid');

  if (!code) {
    input.classList.add('is-invalid');
    setFeedback('Please enter a promo code before applying.', 'error');
    showToast({
      title: 'Empty Coupon Code',
      message: 'Enter a valid CinePass promo code such as CINE10 or WEEKEND20.',
      type: 'error'
    });
    return;
  }

  const expiredMatch = EXPIRED_COUPONS.find((c) => c.code === code);
  if (expiredMatch) {
    input.classList.add('is-invalid');
    setFeedback(
      `Coupon "${code}" expired on ${formatExpiry(expiredMatch.expiry)} and can no longer be redeemed.`,
      'error'
    );
    showToast({
      title: 'Expired Coupon',
      message: `${code} expired on ${formatExpiry(expiredMatch.expiry)}.`,
      type: 'error'
    });
    return;
  }

  const offer = OFFERS_CATALOG.find((o) => o.code === code);
  if (!offer) {
    input.classList.add('is-invalid');
    setFeedback(`"${code}" is not a recognized CinePass promo code.`, 'error');
    showToast({
      title: 'Invalid Coupon Code',
      message: `"${code}" was not found. Try CINE10, WEEKEND20, or STUDENT15.`,
      type: 'error'
    });
    return;
  }

  if (isOfferExpired(offer.expiry)) {
    input.classList.add('is-invalid');
    setFeedback(`Coupon "${code}" has expired.`, 'error');
    showToast({
      title: 'Expired Coupon',
      message: `${code} is past its expiration date.`,
      type: 'error'
    });
    return;
  }

  const qty = Number(document.getElementById('calc-qty').value) || 1;
  if (qty < offer.minTickets) {
    // Auto-bump ticket quantity? Better: notify clearly or let user adjust, AND still save if user adjusts, or require min tickets
    updateState((s) => ({ ...s, appliedCouponCode: offer.code }));
    renderOffers();
    calculateAndRenderSummary();
    showToast({
      title: `${offer.code} Selected`,
      message: `Requires ${offer.minTickets}+ tickets — adjust ticket quantity to apply discount.`,
      type: 'info'
    });
    return;
  }

  updateState((s) => ({ ...s, appliedCouponCode: offer.code }));
  setFeedback(`Applied "${offer.code}" (${offer.dealBadge}) — ${offer.title}.`, 'success');
  renderOffers();
  calculateAndRenderSummary();
  showToast({
    title: 'Discount Applied',
    message: `${offer.code} activated (${offer.dealBadge}).`,
    type: 'success'
  });
}

/* Event Bindings */
document.getElementById('offer-category-tabs').addEventListener('click', (e) => {
  const pill = e.target.closest('[data-category]');
  if (!pill) return;
  activeCategory = pill.dataset.category;
  document.querySelectorAll('#offer-category-tabs .filter-pill').forEach((btn) => {
    const active = btn === pill;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  renderOffers();
});

document.getElementById('coupon-form').addEventListener('submit', (e) => {
  e.preventDefault();
  applyCoupon(document.getElementById('coupon-code-input').value);
});

document.getElementById('clear-coupon-btn').addEventListener('click', () => {
  updateState((s) => ({ ...s, appliedCouponCode: null }));
  document.getElementById('coupon-code-input').value = '';
  setFeedback('Coupon removed.', 'info');
  renderOffers();
  calculateAndRenderSummary();
  showToast({
    title: 'Coupon Cleared',
    message: 'Standard fare restored.',
    type: 'info',
    duration: 2400
  });
});

['calc-tier', 'calc-qty'].forEach((id) => {
  document.getElementById(id).addEventListener('change', () => {
    const state = loadState();
    const offer = OFFERS_CATALOG.find((o) => o.code === state.appliedCouponCode);
    if (offer) {
      const qty = Number(document.getElementById('calc-qty').value);
      if (qty >= offer.minTickets) {
        setFeedback(`Applied "${offer.code}" (${offer.dealBadge}) — ${offer.title}.`, 'success');
      }
    }
    calculateAndRenderSummary();
  });
});

// Hydrate initial applied code if saved in localStorage
const initialState = loadState();
if (initialState.appliedCouponCode) {
  const offer = OFFERS_CATALOG.find((o) => o.code === initialState.appliedCouponCode);
  if (offer && !isOfferExpired(offer.expiry)) {
    document.getElementById('coupon-code-input').value = offer.code;
    setFeedback(`Saved coupon "${offer.code}" active.`, 'success');
  }
}

renderOffers();
calculateAndRenderSummary();
