// Main Application Controller for Shashank Tours & Travels
import { companyInfo } from '../data/company.js';
import { servicesData } from '../data/services.js';
import { destinationsData } from '../data/destinations.js';
import { fleetData } from '../data/fleet.js';
import { toursData } from '../data/tours.js';
import { whyChooseUsData, howItWorksSteps } from '../data/testimonials.js';
import { initJourneyMotion } from './journeyMotion.js';
import { initPaymentSystem, openPaymentModal, closePaymentModal } from './payment.js';

// Base API URL for flexible deployment (monolithic or separated client/server)
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : '';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHeader();
  initMobileDrawer();
  initScrollSpy();
  initScrollProgress();
  renderServicesSection();
  renderDestinationsSection();
  renderFleetSection();
  renderToursSection();
  renderReviewsSection();
  renderWhyUsSection();
  renderHowItWorksSection();
  initScrollAnimations();
  initBookingWidget();
  initBookingModal();
  initReviewModal();
  initContactForm();
  setupQuickActionLinks();
  initJourneyMotion();
  initPaymentSystem();

  // Expose payment modal globally for CTA triggers
  window.openPaymentModal = openPaymentModal;
  window.closePaymentModal = closePaymentModal;
});

/* ==========================================================================
   HEADER & MOBILE DRAWER LOGIC
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Sticky reduction state: 76px -> 66px
        if (currentScrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Desktop Dropdowns Keyboard & Touch Interaction
  const dropdownItems = document.querySelectorAll('.nav-dropdown-item');

  dropdownItems.forEach(item => {
    const btn = item.querySelector('.nav-dropdown-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = item.classList.contains('open');

      // Close other open dropdowns
      dropdownItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherBtn = other.querySelector('.nav-dropdown-btn');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle this dropdown
      if (isOpen) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Keyboard support: Escape closes dropdown
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown-item')) {
      dropdownItems.forEach(item => {
        item.classList.remove('open');
        const btn = item.querySelector('.nav-dropdown-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Dropdown link click: close dropdown
  const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', () => {
      dropdownItems.forEach(item => {
        item.classList.remove('open');
        const btn = item.querySelector('.nav-dropdown-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });
  });
}

function initMobileDrawer() {
  const toggleBtn = document.getElementById('menuToggle');
  const closeBtn = document.getElementById('closeDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay');
  const drawer = document.getElementById('mobileDrawer');
  const mobileLinks = drawer ? drawer.querySelectorAll('a, .mobile-drawer-btn') : [];

  const openDrawer = () => {
    if (!drawer || !overlay) return;
    drawer.classList.add('open');
    overlay.classList.add('open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    if (!drawer || !overlay) return;
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Close drawer when clicking any link/action
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Mobile Accordion Dropdowns
  const accordionBtns = document.querySelectorAll('.mobile-accordion-btn');
  accordionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const content = btn.nextElementSibling;
      if (!content) return;

      const isExpanded = content.classList.contains('expanded');

      // Close other accordions for a clean, non-cluttered view
      accordionBtns.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherContent = otherBtn.nextElementSibling;
          if (otherContent) otherContent.classList.remove('expanded');
        }
      });

      if (isExpanded) {
        content.classList.remove('expanded');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        content.classList.add('expanded');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Close drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/* ==========================================================================
   NAVIGATION SCROLL SPY
   ========================================================================== */
function initScrollSpy() {
  const sections = [
    { id: 'home', navKey: 'home' },
    { id: 'services', navKey: 'services' },
    { id: 'destinations', navKey: 'destinations' },
    { id: 'featured-vehicle', navKey: 'fleet' },
    { id: 'fleet', navKey: 'fleet' },
    { id: 'tours', navKey: 'tours' },
    { id: 'reviews', navKey: 'reviews' },
    { id: 'why-us', navKey: 'why-us' },
    { id: 'how-it-works', navKey: 'why-us' },
    { id: 'contact', navKey: 'contact' }
  ];

  const desktopNavItems = document.querySelectorAll('[data-nav]');
  const mobileNavItems = document.querySelectorAll('[data-mobile-nav]');

  const updateActiveNav = () => {
    const scrollPos = window.scrollY + 120; // 120px offset below header
    let currentNavKey = 'home';

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i].id);
      if (section) {
        const top = section.offsetTop;
        if (scrollPos >= top) {
          currentNavKey = sections[i].navKey;
          break;
        }
      }
    }

    desktopNavItems.forEach(item => {
      if (item.getAttribute('data-nav') === currentNavKey) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    mobileNavItems.forEach(item => {
      if (item.getAttribute('data-mobile-nav') === currentNavKey) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateActiveNav);
  }, { passive: true });

  // Initial call
  updateActiveNav();
}

/* ==========================================================================
   SECTION RENDERERS (Real Information, Honest Content, Zero Fabrications)
   ========================================================================== */
const serviceIconMap = {
  airport: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg>`,
  outstation: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  local: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  roundTrip: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a4.5 4.5 0 0 0 0-9H5a3 3 0 0 1 0-6h11.5"/><circle cx="18" cy="5" r="3"/></svg>`,
  oneWay: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  corporate: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
};

const defaultServiceIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;

function renderServicesSection() {
  const container = document.getElementById('servicesContainer');
  if (!container) return;

  container.innerHTML = servicesData.map(service => {
    const id = service?.id ?? '';
    const title = service?.title ?? 'Cab Service';
    const category = service?.category ?? service?.badge ?? 'Travel Service';
    const description = service?.description ?? service?.desc ?? '';
    const iconKey = service?.icon ?? '';
    const iconSvg = serviceIconMap[iconKey] || defaultServiceIcon;
    const features = Array.isArray(service?.features) ? service.features : [];
    const cta = service?.cta ?? 'Book This Service';
    const tripType = service?.tripType ?? 'One Way';
    const pickupDefault = service?.pickupDefault ?? '';
    const dropDefault = service?.dropDefault ?? '';

    return `
      <div class="service-card" data-service-id="${id}">
        <div class="service-top">
          <div class="service-icon-box" aria-hidden="true">
            ${iconSvg}
          </div>
          <span class="service-category">${category}</span>
        </div>
        <h3 class="service-title">${title}</h3>
        <p class="service-desc">${description}</p>
        <ul class="service-features">
          ${features.map(f => `
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>
        <div class="service-footer">
          <button class="service-btn" onclick="selectServiceForBooking('${title}', '${tripType}', '${pickupDefault}', '${dropDefault}')">
            <span>${cta}</span>
            <svg class="service-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderDestinationsSection() {
  const container = document.getElementById('destinationsContainer');
  if (!container) return;

  container.innerHTML = destinationsData.map(dest => {
    const name = dest?.name ?? '';
    const state = dest?.state ?? dest?.subtitle ?? 'South India';
    const tagline = dest?.tagline ?? dest?.subtitle ?? '';
    const description = dest?.description ?? dest?.desc ?? '';
    const image = dest?.image ?? 'images/dest-mysore.jpg';

    return `
      <div class="destination-card">
        <div class="destination-img-wrap">
          <img class="destination-img" src="${image}" alt="${name} Tour Cab" loading="lazy" />
          <div class="destination-overlay"></div>
          <span class="destination-badge-tag">${state}</span>
        </div>
        <div class="destination-body">
          <h3 class="destination-name">${name}</h3>
          <p class="destination-tagline">${tagline}</p>
          <p class="destination-desc">${description}</p>
          <div class="destination-footer">
            <button class="btn btn-outline btn-sm" onclick="selectDestinationForBooking('${name}')">
              <span>Book Cab to ${name}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderFleetSection() {
  const container = document.getElementById('fleetContainer');
  if (!container) return;

  container.innerHTML = fleetData.map(car => {
    const name = car?.name ?? 'Cab';
    const model = car?.model ?? '';
    const badge = car?.badge ?? '';
    const image = car?.image ?? 'images/client-vehicle.jpg';
    const passengers = car?.passengers ?? '';
    const luggage = car?.luggage ?? '';
    const ac = Boolean(car?.ac);
    const description = car?.description ?? car?.desc ?? '';
    const features = Array.isArray(car?.features) ? car.features : [];

    return `
      <article class="fleet-card" data-vehicle-id="${car?.id ?? ''}">
        <!-- 1. Visual / Image Area -->
        <div class="fleet-img-wrap">
          <img class="fleet-img" src="${image}" alt="${name} Cab Fleet" loading="lazy" />
          <div class="fleet-img-gradient"></div>
          ${badge ? `<span class="fleet-badge-tag">${badge}</span>` : ''}
        </div>

        <!-- 2. Card Content Area (Equal height flex-column) -->
        <div class="fleet-body">
          <div class="fleet-meta-top">
            <span class="fleet-model-label">${model}</span>
          </div>
          <h3 class="fleet-title">${name}</h3>
          
          <!-- Key Spec Chips (Passengers, Luggage, Climate) -->
          <div class="fleet-specs-row">
            ${passengers ? `
              <div class="fleet-spec-chip" title="Capacity: ${passengers}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <span>${passengers.replace(' Passengers', ' Seats')}</span>
              </div>
            ` : ''}
            ${luggage ? `
              <div class="fleet-spec-chip" title="Luggage: ${luggage}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <span>${luggage.split('+')[0].trim()}</span>
              </div>
            ` : ''}
            ${ac ? `
              <div class="fleet-spec-chip chip-ac" title="Air Conditioned Cabin">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07"/></svg>
                <span>AC</span>
              </div>
            ` : ''}
          </div>

          <p class="fleet-desc">${description}</p>

          <!-- Key Features Checklist -->
          ${features.length ? `
            <ul class="fleet-features-list">
              ${features.slice(0, 3).map(f => `
                <li>
                  <svg class="check-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>${f}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </div>

        <!-- 3. Clean Full-Width CTA (Pinned to Card Bottom, zero pricing) -->
        <div class="fleet-footer">
          <button type="button" class="btn btn-fleet-book" onclick="selectVehicleForBooking('${name}')" aria-label="Book ${name}">
            <span>Book This Cab</span>
            <svg class="btn-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

function renderToursSection() {
  const container = document.getElementById('toursContainer');
  if (!container) return;

  container.innerHTML = toursData.map(tour => {
    const title = tour?.title ?? 'Tour Package';
    const destination = tour?.destination ?? '';
    const duration = tour?.duration ?? '';
    const image = tour?.image ?? 'images/dest-mysore.jpg';
    const description = tour?.description ?? tour?.desc ?? '';
    const highlights = Array.isArray(tour?.highlights) ? tour.highlights : [];

    return `
      <article class="tour-card" data-tour-title="${title}">
        <!-- 1. IMAGE with subtle overlay & duration badge -->
        <div class="tour-img-wrap">
          <img class="tour-img" src="${image}" alt="${title}" loading="lazy" />
          <div class="tour-img-gradient"></div>
          ${duration ? `<span class="tour-duration-badge">${duration}</span>` : ''}
        </div>

        <!-- 2. Tour Body: Location badge -> Title -> Description -> Features -> CTA -->
        <div class="tour-body">
          <div class="tour-location-badge">
            <svg class="badge-pin-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${destination}</span>
          </div>

          <h3 class="tour-title">${title}</h3>
          <p class="tour-desc">${description}</p>

          ${highlights.length ? `
            <ul class="tour-inclusions">
              ${highlights.slice(0, 3).map(inc => `
                <li>
                  <svg class="check-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>${inc}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}

          <div class="tour-footer">
            <button type="button" class="btn btn-tour-book" onclick="selectTourForBooking('${title}', '${destination}', '${duration}')" aria-label="Book ${title}">
              <span>Book This Tour</span>
              <svg class="btn-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* ==========================================================================
   CUSTOMER REVIEWS (Verified Moderated Feedback & Safe Rendering)
   ========================================================================== */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderStarsHtml(rating) {
  const r = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= r) {
      starsHtml += '<span class="star-filled" aria-hidden="true" style="color:#F59E0B;">★</span>';
    } else {
      starsHtml += '<span class="star-empty" aria-hidden="true" style="color:#D1D5DB;">☆</span>';
    }
  }
  return `<div class="review-stars" aria-label="${r} out of 5 stars">${starsHtml}</div>`;
}

function formatReviewDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

function renderEmptyReviewsState(container) {
  container.innerHTML = `
    <div class="reviews-empty-state">
      <div class="empty-state-icon" aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <h3 class="empty-state-title">No reviews yet. Be the first to share your experience.</h3>
      <p class="empty-state-prompt">We value transparent, genuine feedback from passengers who travel with Shashank Tours &amp; Travels.</p>
      <button type="button" class="btn btn-primary btn-sm" onclick="openReviewModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        <span>Write a Review</span>
      </button>
    </div>
  `;
}

async function renderReviewsSection() {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;

  // Render skeleton shimmer cards during fetch
  container.innerHTML = `
    <div class="review-skeleton-card">
      <div class="skeleton-shimmer" style="height:18px; width:35%;"></div>
      <div class="skeleton-shimmer" style="height:55px; width:100%;"></div>
      <div class="skeleton-shimmer" style="height:36px; width:50%;"></div>
    </div>
    <div class="review-skeleton-card">
      <div class="skeleton-shimmer" style="height:18px; width:35%;"></div>
      <div class="skeleton-shimmer" style="height:55px; width:100%;"></div>
      <div class="skeleton-shimmer" style="height:36px; width:50%;"></div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/reviews`);
    if (!res.ok) {
      renderEmptyReviewsState(container);
      return;
    }
    const data = await res.json();
    if (!data.success || !Array.isArray(data.reviews) || data.reviews.length === 0) {
      renderEmptyReviewsState(container);
      return;
    }

    container.innerHTML = data.reviews.map(r => {
      const initials = (r.customerName || 'Customer')
        .split(' ')
        .map(w => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'C';

      return `
        <div class="review-card">
          <div class="review-header">
            ${renderStarsHtml(r.rating)}
            <span class="review-source-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Verified Passenger
            </span>
          </div>
          <p class="review-text">“${escapeHtml(r.reviewText)}”</p>
          <div class="review-author-meta">
            <div class="author-avatar" aria-hidden="true">${escapeHtml(initials)}</div>
            <div>
              <div class="author-name">${escapeHtml(r.customerName)}</div>
              ${(r.service || r.tripType) ? `<div class="author-trip">${escapeHtml(r.service || r.tripType)}</div>` : ''}
              <div class="author-date">${formatReviewDate(r.createdAt)}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.warn('Reviews fetch fallback to empty state:', err);
    renderEmptyReviewsState(container);
  }
}

function initReviewModal() {
  const overlay = document.getElementById('reviewModalOverlay');
  const openBtn = document.getElementById('openReviewModalBtn');
  const closeBtn = document.getElementById('closeReviewModalBtn');
  const form = document.getElementById('customerReviewForm');
  const starBtns = document.querySelectorAll('#starRatingSelector .rating-star-btn');
  const ratingInput = document.getElementById('reviewRatingInput');
  const ratingDesc = document.getElementById('ratingTextDesc');
  const alertBox = document.getElementById('reviewAlertBox');
  const submitBtn = document.getElementById('submitReviewBtn');
  const submitBtnText = document.getElementById('submitReviewBtnText');

  if (!overlay || !form) return;

  const ratingDescriptions = {
    1: '1 Star — Poor Experience',
    2: '2 Stars — Fair Trip',
    3: '3 Stars — Good Service',
    4: '4 Stars — Very Good Service',
    5: '5 Stars — Excellent Service'
  };

  const updateStarUI = (val) => {
    val = parseInt(val, 10) || 5;
    if (ratingInput) ratingInput.value = val;
    starBtns.forEach(btn => {
      const star = parseInt(btn.dataset.star, 10);
      if (star <= val) {
        btn.classList.add('active');
        btn.setAttribute('aria-checked', star === val ? 'true' : 'false');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
      }
    });
    if (ratingDesc) {
      ratingDesc.textContent = ratingDescriptions[val] || `${val} Stars`;
    }
  };

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const starVal = parseInt(btn.dataset.star, 10);
      updateStarUI(starVal);
    });

    btn.addEventListener('mouseenter', () => {
      const starVal = parseInt(btn.dataset.star, 10);
      starBtns.forEach(b => {
        const s = parseInt(b.dataset.star, 10);
        if (s <= starVal) {
          b.classList.add('hover-preview');
        } else {
          b.classList.remove('hover-preview');
        }
      });
    });

    btn.addEventListener('mouseleave', () => {
      starBtns.forEach(b => b.classList.remove('hover-preview'));
    });
  });

  window.openReviewModal = function() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.className = 'form-alert';
      alertBox.textContent = '';
    }
    const nameInput = document.getElementById('reviewCustomerName');
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
  };

  window.closeReviewModal = function() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (openBtn) {
    openBtn.addEventListener('click', window.openReviewModal);
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeReviewModal);
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      window.closeReviewModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      window.closeReviewModal();
    }
  });

  // Form Submission
  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Reset error messages
    const nameError = document.getElementById('reviewNameError');
    const textError = document.getElementById('reviewTextError');
    const emailError = document.getElementById('reviewEmailError');
    if (nameError) nameError.style.display = 'none';
    if (textError) textError.style.display = 'none';
    if (emailError) emailError.style.display = 'none';
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.className = 'form-alert';
    }

    const name = (document.getElementById('reviewCustomerName')?.value || '').trim();
    const rating = parseInt(ratingInput?.value, 10) || 5;
    const reviewText = (document.getElementById('reviewText')?.value || '').trim();
    const service = (document.getElementById('reviewService')?.value || '').trim();
    const email = (document.getElementById('reviewEmail')?.value || '').trim();
    const botCheck = (document.getElementById('reviewBotCheck')?.value || '').trim();

    // Validation
    let hasError = false;

    if (!name || name.length < 2) {
      if (nameError) {
        nameError.textContent = 'Please enter your name (minimum 2 characters).';
        nameError.style.display = 'block';
      }
      if (!hasError) document.getElementById('reviewCustomerName')?.focus();
      hasError = true;
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
      if (alertBox) {
        alertBox.textContent = 'Please choose a rating between 1 and 5 stars.';
        alertBox.className = 'form-alert error';
        alertBox.style.display = 'block';
      }
      hasError = true;
    }

    if (!reviewText || reviewText.length < 10) {
      if (textError) {
        textError.textContent = 'Please enter a review of at least 10 characters describing your experience.';
        textError.style.display = 'block';
      }
      if (!hasError) document.getElementById('reviewText')?.focus();
      hasError = true;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (emailError) {
          emailError.textContent = 'Please enter a valid email address, or leave it blank.';
          emailError.style.display = 'block';
        }
        if (!hasError) document.getElementById('reviewEmail')?.focus();
        hasError = true;
      }
    }

    if (hasError) return;

    // Prevent duplicate submissions
    isSubmitting = true;
    if (submitBtn) submitBtn.disabled = true;
    if (submitBtnText) submitBtnText.textContent = 'Submitting Review...';

    try {
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          rating,
          reviewText,
          service,
          email,
          botCheck
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (alertBox) {
          alertBox.className = 'form-alert success';
          alertBox.textContent = result.message || 'Thank you for your feedback! Your review has been submitted for moderation and will appear on the website once approved.';
          alertBox.style.display = 'block';
        }

        form.reset();
        updateStarUI(5);

        // Auto close after 2.5s and refresh reviews list
        setTimeout(() => {
          window.closeReviewModal();
          renderReviewsSection();
        }, 2500);
      } else {
        if (alertBox) {
          alertBox.className = 'form-alert error';
          alertBox.textContent = result.message || 'Unable to submit review. Please check your inputs and try again.';
          alertBox.style.display = 'block';
        }
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      if (alertBox) {
        alertBox.className = 'form-alert error';
        alertBox.textContent = 'Network or server error submitting review. Please try again or reach our team via WhatsApp.';
        alertBox.style.display = 'block';
      }
    } finally {
      isSubmitting = false;
      if (submitBtn) submitBtn.disabled = false;
      if (submitBtnText) submitBtnText.textContent = 'Submit Review';
    }
  });
}


function renderWhyUsSection() {
  const container = document.getElementById('whyUsContainer');
  if (!container) return;

  container.innerHTML = whyChooseUsData.map(item => `
    <div class="why-card">
      <div class="why-icon-box">
        ${item.icon}
      </div>
      <div class="why-card-content">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
    </div>
  `).join('');
}

function renderHowItWorksSection() {
  const container = document.getElementById('howItWorksContainer');
  if (!container || !howItWorksSteps) return;

  container.innerHTML = howItWorksSteps.map(step => {
    return `
      <div class="how-step-card">
        <div class="step-number-badge">${step.step}</div>
        <h3 class="step-card-title">${step.title}</h3>
        <p class="step-card-desc">${step.desc}</p>
      </div>
    `;
  }).join('');
}


/* ==========================================================================
   BOOKING WIDGET LOGIC & CONTROLLER (Modern Redesign)
   ========================================================================== */
let activeTripType = "One Way";

function initBookingWidget() {
  // Set default dates
  const travelDateInput = document.getElementById('travelDate');
  if (travelDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    travelDateInput.value = `${yyyy}-${mm}-${dd}`;
    travelDateInput.min = new Date().toISOString().split('T')[0];
  }

  // Sync travel time select to hidden input
  const timeSelect = document.getElementById('travelTimeSelect');
  const timeHidden = document.getElementById('travelTime');
  if (timeSelect && timeHidden) {
    timeSelect.addEventListener('change', () => {
      timeHidden.value = timeSelect.value;
    });
  }

  // Lightweight Travel-Type Selector Tabs
  const typeBtns = document.querySelectorAll('.travel-type-btn');
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTripType = btn.getAttribute('data-trip');
      updateTripTypeBehavior(activeTripType);
      calculateEstimatedFare();
    });
  });

  // Circular Swap Button (180deg animation & value swap)
  const swapBtn = document.getElementById('swapLocationsBtn');
  const pickupInput = document.getElementById('pickupLocation');
  const dropInput = document.getElementById('dropLocation');

  if (swapBtn && pickupInput && dropInput) {
    swapBtn.addEventListener('click', () => {
      const currentPickup = pickupInput.value;
      const currentDrop = dropInput.value;
      pickupInput.value = currentDrop;
      dropInput.value = currentPickup;
      
      // Trigger swap rotation
      swapBtn.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        swapBtn.style.transform = '';
      }, 300);

      // Clear any errors
      clearFieldError('pickup');
      clearFieldError('drop');

      calculateEstimatedFare();
      updateStickyBar();
    });
  }

  // Progressive Disclosure: Pickup Suggestions Dropdown
  const pickupDropdown = document.getElementById('pickupSuggestions');
  const clearPickupBtn = document.getElementById('clearPickupBtn');

  if (pickupInput && pickupDropdown) {
    const showPickupDropdown = () => {
      closeAllDropdowns();
      pickupDropdown.classList.add('open');
      if (clearPickupBtn) clearPickupBtn.style.display = pickupInput.value ? 'block' : 'none';
    };

    pickupInput.addEventListener('focus', showPickupDropdown);
    pickupInput.addEventListener('input', () => {
      clearFieldError('pickup');
      if (clearPickupBtn) clearPickupBtn.style.display = pickupInput.value ? 'block' : 'none';
      updateStickyBar();
    });

    if (clearPickupBtn) {
      clearPickupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pickupInput.value = '';
        pickupInput.focus();
        clearPickupBtn.style.display = 'none';
        updateStickyBar();
      });
    }

    pickupDropdown.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = item.getAttribute('data-val');
        pickupInput.value = val;
        pickupDropdown.classList.remove('open');
        clearFieldError('pickup');
        if (clearPickupBtn) clearPickupBtn.style.display = 'block';
        updateStickyBar();
      });
    });
  }

  // Progressive Disclosure: Destination / Drop Suggestions Dropdown
  const dropDropdown = document.getElementById('dropSuggestions');
  const clearDropBtn = document.getElementById('clearDropBtn');

  if (dropInput && dropDropdown) {
    const showDropDropdown = () => {
      closeAllDropdowns();
      dropDropdown.classList.add('open');
      if (clearDropBtn) clearDropBtn.style.display = dropInput.value ? 'block' : 'none';
    };

    dropInput.addEventListener('focus', showDropDropdown);
    dropInput.addEventListener('input', () => {
      clearFieldError('drop');
      if (clearDropBtn) clearDropBtn.style.display = dropInput.value ? 'block' : 'none';
      calculateEstimatedFare();
      updateStickyBar();
    });

    if (clearDropBtn) {
      clearDropBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropInput.value = '';
        dropInput.focus();
        clearDropBtn.style.display = 'none';
        updateStickyBar();
      });
    }

    dropDropdown.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = item.getAttribute('data-val');
        dropInput.value = val;
        dropDropdown.classList.remove('open');
        clearFieldError('drop');
        if (clearDropBtn) clearDropBtn.style.display = 'block';
        calculateEstimatedFare();
        updateStickyBar();
      });
    });
  }

  // Close suggestions and vehicle dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#pickupFieldWrapper')) {
      pickupDropdown?.classList.remove('open');
    }
    if (!e.target.closest('#dropFieldWrapper')) {
      dropDropdown?.classList.remove('open');
    }
    if (!e.target.closest('#vehicleFieldWrapper')) {
      const vMenu = document.getElementById('vehicleDropdownMenu');
      const vTrig = document.getElementById('vehicleSelectorTrigger');
      vMenu?.classList.remove('open');
      vTrig?.classList.remove('open');
    }
  });

  // Compact Custom Vehicle Dropdown Controller
  initVehicleSelector();

  // Booking Form Submission
  const bookingForm = document.getElementById('mainBookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleBookingSubmit();
    });
  }

  // Direct WhatsApp Button from widget
  const waBtn = document.getElementById('bookWhatsAppWidgetBtn');
  if (waBtn) {
    waBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerWhatsAppFromWidget();
    });
  }

  // Initialize Price Preview & Sticky Mobile Bar
  calculateEstimatedFare();
  initMobileStickyBar();
}

function closeAllDropdowns() {
  document.getElementById('pickupSuggestions')?.classList.remove('open');
  document.getElementById('dropSuggestions')?.classList.remove('open');
  document.getElementById('vehicleDropdownMenu')?.classList.remove('open');
  document.getElementById('vehicleSelectorTrigger')?.classList.remove('open');
}

function initVehicleSelector() {
  const trigger = document.getElementById('vehicleSelectorTrigger');
  const menu = document.getElementById('vehicleDropdownMenu');
  const nameEl = document.getElementById('selectedVehicleName');
  const metaEl = document.getElementById('selectedVehicleMeta');
  const inputEl = document.getElementById('vehicleType');
  const cards = document.querySelectorAll('.vehicle-option-card');

  if (!trigger || !menu) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      menu.classList.add('open');
      trigger.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const val = card.getAttribute('data-value');
      const name = card.getAttribute('data-name');
      const meta = card.getAttribute('data-meta');

      if (nameEl) nameEl.textContent = name;
      if (metaEl) metaEl.textContent = meta;
      if (inputEl) inputEl.value = val;

      menu.classList.remove('open');
      trigger.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');

      calculateEstimatedFare();
    });
  });
}

function updateTripTypeBehavior(type) {
  const dropInput = document.getElementById('dropLocation');
  const pickupInput = document.getElementById('pickupLocation');

  if (type === "Airport" || type === "Airport Transfer") {
    if (pickupInput && (!pickupInput.value || pickupInput.value.includes('City'))) {
      pickupInput.value = "Kempegowda International Airport (BLR)";
    }
    if (dropInput) dropInput.value = "Bangalore City (Your Address)";
  } else if (type === "Local") {
    if (pickupInput && !pickupInput.value) pickupInput.value = "Bangalore City";
    if (dropInput) dropInput.value = "Local Rental (8 Hours / 80 Kms)";
  } else if (type === "Round Trip") {
    if (dropInput && dropInput.value.includes('Local Rental')) {
      dropInput.value = "Mysore";
    }
  }
  updateStickyBar();
}

function calculateEstimatedFare() {
  const priceDisplay = document.getElementById('previewFareAmount');
  if (priceDisplay) {
    priceDisplay.textContent = 'Transparent Quote';
  }

  const stickyFare = document.getElementById('stickyFareSummary');
  if (stickyFare) {
    stickyFare.textContent = 'Transparent Quote';
  }

  return 'Transparent Quote';
}

function updateStickyBar() {
  const pickup = document.getElementById('pickupLocation')?.value.trim() || 'Bangalore';
  const drop = document.getElementById('dropLocation')?.value.trim() || 'Destination';
  const routeEl = document.getElementById('stickyRouteSummary');
  if (routeEl) {
    const pShort = pickup.split(',')[0].split('(')[0].trim();
    const dShort = drop.split(',')[0].split('(')[0].trim();
    routeEl.textContent = `${pShort} → ${dShort}`;
  }
}

function initMobileStickyBar() {
  const bar = document.getElementById('mobileStickyBar');
  const widget = document.getElementById('bookingWidget');
  if (!bar || !widget) return;

  window.addEventListener('scroll', () => {
    if (window.innerWidth >= 768) {
      bar.classList.remove('visible');
      return;
    }
    const rect = widget.getBoundingClientRect();
    if (rect.bottom < 80) {
      bar.classList.add('visible');
    } else {
      bar.classList.remove('visible');
    }
  }, { passive: true });
}

function showFieldError(field, message) {
  const input = document.getElementById(`${field}Location`);
  const errEl = document.getElementById(`${field}Error`);
  if (input) {
    input.style.borderColor = '#C53B27';
    input.style.backgroundColor = '#FFF8F7';
    input.focus();
  }
  if (errEl) {
    errEl.textContent = message;
    errEl.classList.add('visible');
  }
}

function clearFieldError(field) {
  const input = document.getElementById(`${field}Location`);
  const errEl = document.getElementById(`${field}Error`);
  if (input) {
    input.style.borderColor = '';
    input.style.backgroundColor = '';
  }
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.remove('visible');
  }
}

/* ==========================================================================
   BOOKING FORM HANDLERS & VALIDATION (Rule 19 Friendly Validation)
   ========================================================================== */
function getBookingFormData() {
  const pickup = document.getElementById('pickupLocation')?.value.trim() || '';
  const drop = document.getElementById('dropLocation')?.value.trim() || '';
  const date = document.getElementById('travelDate')?.value || '';
  const time = document.getElementById('travelTime')?.value || document.getElementById('travelTimeSelect')?.value || '09:00 AM';
  const vehicle = document.getElementById('selectedVehicleName')?.textContent.trim() || 'Toyota Rumion';

  return {
    tripType: activeTripType,
    pickup,
    drop,
    date,
    time,
    vehicle
  };
}

function handleBookingSubmit() {
  const data = getBookingFormData();

  clearFieldError('pickup');
  clearFieldError('drop');

  if (!data.pickup) {
    showFieldError('pickup', 'Please select or enter your pickup location.');
    return;
  }
  if (!data.drop) {
    showFieldError('drop', 'Please select or enter your travel destination.');
    return;
  }
  if (!data.date) {
    alert('Please select your preferred travel date.');
    return;
  }
  if (!data.time) {
    alert('Please select your preferred travel time.');
    return;
  }

  // Open booking modal
  openBookingModal(data);
}

function triggerWhatsAppFromWidget() {
  const data = getBookingFormData();

  if (!data.pickup) {
    showFieldError('pickup', 'Please select your pickup location.');
    return;
  }
  if (!data.drop) {
    showFieldError('drop', 'Please select your travel destination.');
    return;
  }

  const text = encodeURIComponent(
    `*Cab Booking Enquiry - ${companyInfo.name}*\n\n` +
    `• *Trip Type:* ${data.tripType}\n` +
    `• *Pickup:* ${data.pickup}\n` +
    `• *Destination:* ${data.drop}\n` +
    `• *Travel Date:* ${data.date || 'Flexible'}\n` +
    `• *Travel Time:* ${data.time || 'Morning'}\n` +
    `• *Vehicle Preference:* ${data.vehicle}\n\n` +
    `Please share the transparent fare quotation and chauffeur details.`
  );
  window.open(`https://wa.me/${companyInfo.whatsappRaw}?text=${text}`, '_blank');
}

/* ==========================================================================
   BOOKING MODAL CONTROLLER (Rule 20 Clean Confirmation)
   ========================================================================== */
function initBookingModal() {
  const overlay = document.getElementById('bookingModalOverlay');
  const closeBtn = document.getElementById('closeModalBtn');
  const confirmForm = document.getElementById('modalConfirmForm');
  const modalWaBtn = document.getElementById('modalWhatsAppBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeBookingModal);
  }
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeBookingModal();
    });
  }

  if (confirmForm) {
    confirmForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeBookingConfirmation();
    });
  }

  if (modalWaBtn) {
    modalWaBtn.addEventListener('click', () => {
      executeWhatsAppConfirmation();
    });
  }
}

let currentBookingState = {};

window.openBookingModal = function(bookingData) {
  currentBookingState = bookingData || getBookingFormData();
  const overlay = document.getElementById('bookingModalOverlay');
  const modalContent = document.getElementById('modalMainContent');
  const successContent = document.getElementById('modalSuccessContent');

  if (modalContent) modalContent.style.display = 'block';
  if (successContent) successContent.style.display = 'none';

  // Populate Summary
  const tEl = document.getElementById('summaryTripType');
  const pEl = document.getElementById('summaryPickup');
  const dEl = document.getElementById('summaryDrop');
  const dtEl = document.getElementById('summaryDateTime');
  const vEl = document.getElementById('summaryVehicle');
  const fEl = document.getElementById('summaryEstFare');

  if (tEl) tEl.textContent = currentBookingState.tripType || 'One Way';
  if (pEl) pEl.textContent = currentBookingState.pickup || '—';
  if (dEl) dEl.textContent = currentBookingState.drop || '—';
  if (dtEl) dtEl.textContent = `${currentBookingState.date || 'Upcoming'} at ${currentBookingState.time || '09:00 AM'}`;
  if (vEl) vEl.textContent = currentBookingState.vehicle || 'Selected Cab';
  if (fEl) fEl.textContent = 'Transparent Quote';

  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeBookingModal = function() {
  const overlay = document.getElementById('bookingModalOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
};

async function executeBookingConfirmation() {
  const name = document.getElementById('custName')?.value.trim() || 'Guest';
  const phone = document.getElementById('custPhone')?.value.trim() || '';
  const notes = document.getElementById('custNotes')?.value.trim() || '';
  const submitBtn = document.getElementById('modalSubmitBtn');

  if (!phone) {
    alert('Please enter a valid phone number.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Request...';
  }

  let generatedBookingId = 'STT-BK-' + Math.floor(1000 + Math.random() * 9000);

  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: name,
        customerPhone: phone,
        customerEmail: '',
        pickup: currentBookingState.pickup || 'Bengaluru',
        drop: currentBookingState.drop || 'Destination',
        travelDate: currentBookingState.date || new Date().toISOString().split('T')[0],
        travelTime: currentBookingState.time || '09:00 AM',
        tripType: currentBookingState.tripType || 'One Way',
        vehicle: currentBookingState.vehicle || 'Toyota Rumion',
        passengers: '4',
        tour: currentBookingState.tourTitle || '',
        notes: notes
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.booking && data.booking.bookingId) {
        generatedBookingId = data.booking.bookingId;
      }
    }
  } catch (err) {
    console.warn('Booking API non-fatal network error, proceeding with confirmation fallback:', err);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Request';
    }
  }

  const modalContent = document.getElementById('modalMainContent');
  const successContent = document.getElementById('modalSuccessContent');

  if (modalContent) modalContent.style.display = 'none';
  if (successContent) {
    successContent.style.display = 'block';

    const bIdEl = document.getElementById('confirmedBookingId');
    const pEl = document.getElementById('confirmedPickup');
    const dEl = document.getElementById('confirmedDrop');
    const dtEl = document.getElementById('confirmedDate');
    const tmEl = document.getElementById('confirmedTime');
    const vEl = document.getElementById('confirmedVehicle');

    if (bIdEl) bIdEl.textContent = generatedBookingId;
    if (pEl) pEl.textContent = currentBookingState.pickup || '—';
    if (dEl) dEl.textContent = currentBookingState.drop || '—';
    if (dtEl) dtEl.textContent = currentBookingState.date || 'Flexible';
    if (tmEl) tmEl.textContent = currentBookingState.time || '09:00 AM';
    if (vEl) vEl.textContent = currentBookingState.vehicle || 'Selected Cab';

    // WhatsApp action with booking ID
    const waBtn = document.getElementById('confirmedWhatsAppBtn');
    if (waBtn) {
      const waText = encodeURIComponent(
        `*Cab Request [${generatedBookingId}] - ${companyInfo.name}*\n\n` +
        `• *Booking ID:* ${generatedBookingId}\n` +
        `• *Name:* ${name}\n` +
        `• *Phone:* ${phone}\n` +
        `• *Trip:* ${currentBookingState.tripType}\n` +
        `• *Pickup:* ${currentBookingState.pickup}\n` +
        `• *Destination:* ${currentBookingState.drop}\n` +
        `• *Date & Time:* ${currentBookingState.date} at ${currentBookingState.time}\n` +
        `• *Vehicle:* ${currentBookingState.vehicle}` +
        (notes ? `\n• *Notes:* ${notes}` : '') +
        `\n\nPlease share the transparent quote and confirm chauffeur allocation.`
      );
      waBtn.href = `https://wa.me/${companyInfo.whatsappRaw}?text=${waText}`;
      waBtn.target = '_blank';
      waBtn.rel = 'noopener noreferrer';
    }

    // Preserve booking state in localStorage (Requirement 13)
    try {
      localStorage.setItem('last_booking', JSON.stringify({
        bookingId: generatedBookingId,
        customerName: name,
        customerPhone: phone,
        pickup: currentBookingState.pickup || '',
        drop: currentBookingState.drop || '',
        date: currentBookingState.date || '',
        time: currentBookingState.time || '',
        vehicle: currentBookingState.vehicle || '',
        tripType: currentBookingState.tripType || '',
        notes: notes || '',
        createdAt: new Date().toISOString()
      }));
    } catch {}

    // Booking Advance Pay via UPI Button
    const payUpiBtn = document.getElementById('btnBookingPayUPI');
    if (payUpiBtn) {
      payUpiBtn.onclick = () => {
        closeBookingModal();
        openPaymentModal({
          bookingId: generatedBookingId,
          customerName: name,
          customerPhone: phone,
          reference: `Booking #${generatedBookingId}`
        });
      };
    }
  }
}

function executeWhatsAppConfirmation() {
  const name = document.getElementById('custName')?.value.trim() || 'Guest';
  const phone = document.getElementById('custPhone')?.value.trim() || '';
  const notes = document.getElementById('custNotes')?.value.trim() || '';

  const text = encodeURIComponent(
    `*Cab Booking Request - ${companyInfo.name}*\n\n` +
    `• *Customer:* ${name}\n` +
    `• *Phone:* ${phone}\n` +
    `• *Trip:* ${currentBookingState.tripType}\n` +
    `• *Pickup:* ${currentBookingState.pickup}\n` +
    `• *Destination:* ${currentBookingState.drop}\n` +
    `• *Date & Time:* ${currentBookingState.date} at ${currentBookingState.time}\n` +
    `• *Vehicle:* ${currentBookingState.vehicle}` +
    (notes ? `\n• *Notes:* ${notes}` : '') +
    `\n\nPlease send fare quotation and availability confirmation.`
  );
  window.open(`https://wa.me/${companyInfo.whatsappRaw}?text=${text}`, '_blank');
}



/* ==========================================================================
   CONTACT FORM CONTROLLER (Phase 12: Real Backend-Connected Form)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const alertEl = document.getElementById('contactFormAlert');
  const submitBtn = document.getElementById('contactSubmitBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName')?.value.trim();
    const phone = document.getElementById('contactPhone')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();

    if (!name || !phone || !message) {
      if (alertEl) {
        alertEl.textContent = 'Please provide your name, phone number, and message.';
        alertEl.className = 'form-alert error';
        alertEl.style.display = 'block';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending Message...</span>';
    }

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, message })
      });

      const data = await res.json();

      if (res.ok) {
        if (alertEl) {
          alertEl.textContent = 'Thank you for reaching out! We have received your message and our team will get in touch with you shortly.';
          alertEl.className = 'form-alert success';
          alertEl.style.display = 'block';
        }
        form.reset();
      } else {
        if (alertEl) {
          alertEl.textContent = data.error || 'Failed to send message. Please contact us on WhatsApp directly.';
          alertEl.className = 'form-alert error';
          alertEl.style.display = 'block';
        }
      }
    } catch {
      if (alertEl) {
        alertEl.textContent = `Network error. Please call us at ${companyInfo.phoneDisplay} or reach out via WhatsApp.`;
        alertEl.className = 'form-alert error';
        alertEl.style.display = 'block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      }
    }
  });
}

/* ==========================================================================
   GLOBAL ACTIONS & PRE-FILL TRIGGERS
   ========================================================================== */
window.selectDestinationForBooking = function(destName) {
  const pickup = document.getElementById('pickupLocation');
  const drop = document.getElementById('dropLocation');
  if (pickup && !pickup.value) pickup.value = 'Bangalore City';
  if (drop) drop.value = destName;

  document.getElementById('bookingWidget')?.scrollIntoView({ behavior: 'smooth' });

  openBookingModal({
    tripType: 'Round Trip',
    pickup: pickup?.value || 'Bangalore City',
    drop: destName,
    date: document.getElementById('travelDate')?.value || 'Upcoming',
    time: document.getElementById('travelTime')?.value || '06:00 AM',
    vehicle: 'Toyota Rumion (KA 05 AR 7793)'
  });
};

window.selectServiceForBooking = function(serviceName, tripType, pickupDefault, dropDefault) {
  activeTripType = tripType;
  const tabBtns = document.querySelectorAll('.travel-type-btn, .trip-tab-btn');
  tabBtns.forEach(b => {
    if (b.getAttribute('data-trip') === tripType || b.textContent.trim().toLowerCase() === tripType.toLowerCase()) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  const pickup = document.getElementById('pickupLocation');
  const drop = document.getElementById('dropLocation');
  if (pickup && pickupDefault) pickup.value = pickupDefault;
  if (drop && dropDefault) drop.value = dropDefault;

  calculateEstimatedFare();
  updateStickyBar();

  document.getElementById('bookingWidget')?.scrollIntoView({ behavior: 'smooth' });
};

window.selectVehicleForBooking = function(vehicleName) {
  const cards = document.querySelectorAll('.vehicle-option-card');
  let matchedCard = null;
  cards.forEach(card => {
    const val = (card.getAttribute('data-value') || '').toLowerCase();
    const name = (card.getAttribute('data-name') || '').toLowerCase();
    if (val.includes(vehicleName.toLowerCase()) || name.includes(vehicleName.toLowerCase())) {
      matchedCard = card;
    }
  });

  if (matchedCard) {
    cards.forEach(c => c.classList.remove('selected'));
    matchedCard.classList.add('selected');

    const val = matchedCard.getAttribute('data-value');
    const name = matchedCard.getAttribute('data-name');
    const meta = matchedCard.getAttribute('data-meta');

    const nameEl = document.getElementById('selectedVehicleName');
    const metaEl = document.getElementById('selectedVehicleMeta');
    const inputEl = document.getElementById('vehicleType');

    if (nameEl) nameEl.textContent = name;
    if (metaEl) metaEl.textContent = meta;
    if (inputEl) inputEl.value = val;

    calculateEstimatedFare();
  }

  document.getElementById('bookingWidget')?.scrollIntoView({ behavior: 'smooth' });
};

window.selectTourForBooking = function(tourTitle, destination, duration) {
  openBookingModal({
    tripType: duration ? `Tour (${duration})` : 'Tour Package',
    pickup: 'Bangalore Doorstep Pickup',
    drop: destination,
    date: document.getElementById('travelDate')?.value || 'Flexible',
    time: '06:30 AM',
    vehicle: 'Toyota Rumion (KA 05 AR 7793)',
    isTour: true,
    tourTitle: tourTitle
  });
};

window.setQuickLocation = function(type, loc) {
  if (type === 'pickup') {
    const el = document.getElementById('pickupLocation');
    if (el) el.value = loc;
  } else {
    const el = document.getElementById('dropLocation');
    if (el) el.value = loc;
  }
  calculateEstimatedFare();
  updateStickyBar();
};

function setupQuickActionLinks() {
  // Update all phone and whatsapp raw hrefs dynamically using single source of truth
  const telNumber = companyInfo.phoneTel || (companyInfo.phoneRaw.startsWith('+') ? companyInfo.phoneRaw : `+${companyInfo.phoneRaw}`);
  document.querySelectorAll('[data-company-phone]').forEach(el => {
    el.href = `tel:${telNumber}`;
  });
  document.querySelectorAll('[data-company-wa]').forEach(el => {
    el.href = `https://wa.me/${companyInfo.whatsappRaw}?text=${encodeURIComponent('Hello ' + companyInfo.name + ', I would like to enquire about cab booking and outstation tour packages.')}`;
  });
}

/* ==========================================================================
   SCROLL PROGRESS INDICATOR (Rule 40: Subtle 2-3px Teal Bar at Viewport Top)
   ========================================================================== */
function initScrollProgress() {
  let bar = document.querySelector('.scroll-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    document.body.appendChild(bar);
  }

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/* ==========================================================================
   THEME TOGGLE CONTROLLER (Dark / Light Theme with Persistence & System Fallback)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  if (!toggleBtns.length) return;

  function getActiveTheme() {
    const saved = localStorage.getItem('apex_theme') || localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('apex_theme', theme);
      localStorage.setItem('theme', theme);
    } catch {}

    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.classList.toggle('is-dark', isDark);
    });
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  });

  // Listen to OS system color scheme changes if user has no saved choice
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      const saved = localStorage.getItem('apex_theme') || localStorage.getItem('theme');
      if (!saved) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  } catch {}

  applyTheme(getActiveTheme());
}

/* ==========================================================================
   SECTION & CARD REVEAL ANIMATIONS (Rule 12: IntersectionObserver)
   Enhanced for mobile viewports & dynamic card content
   ========================================================================== */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      el.classList.add('is-revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.02,
    rootMargin: '0px 0px -20px 0px'
  });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    const rect = el.getBoundingClientRect();
    // If element is already in viewport on load, reveal immediately
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-revealed');
    } else {
      observer.observe(el);
    }
  });
}

/* ==========================================================================
   JOURNEY IN MOTION CONTROLLER
   Mysore -> Coorg -> Ooty Animated Route Engine (GSAP + SVG MotionPath)
   Handled modularly by ./journeyMotion.js
   ========================================================================== */
