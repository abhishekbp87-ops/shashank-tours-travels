// Admin Portal Logic for Shashank Tours & Travels Operations
const configuredApiBase = (
  window.__API_BASE__ ||
  localStorage.getItem('shashank_api_base') ||
  document.querySelector('meta[name="api-base"]')?.getAttribute('content') ||
  ''
).replace(/\/+$/, '');

const API_BASE = configuredApiBase ? (configuredApiBase + '/api') : '/api';
let adminToken = localStorage.getItem('shashank_admin_token') || '';

// Initialize Theme
const savedTheme = localStorage.getItem('shashank_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('shashank_theme', next);
});

// Check Authentication
function checkAuth() {
  const authScreen = document.getElementById('authScreen');
  const portalApp = document.getElementById('portalApp');
  if (adminToken) {
    if (authScreen) authScreen.style.display = 'none';
    if (portalApp) portalApp.style.display = 'flex';
    loadDashboard();
  } else {
    if (authScreen) authScreen.style.display = 'flex';
    if (portalApp) portalApp.style.display = 'none';
  }
}

// Login Form Submit
document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const u = document.getElementById('loginUsername').value.trim();
  const p = document.getElementById('loginPassword').value;
  const alertEl = document.getElementById('loginAlert');
  const btn = document.getElementById('loginBtn');

  alertEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Verifying...';

  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();

    if (data.success && data.token) {
      adminToken = data.token;
      localStorage.setItem('shashank_admin_token', adminToken);
      checkAuth();
    } else {
      alertEl.textContent = data.message || 'Invalid credentials.';
      alertEl.style.display = 'block';
    }
  } catch (err) {
    console.error('Error logging in:', err);
    alertEl.textContent = 'Server connection error. Make sure the backend server is running.';
    alertEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In to Dashboard';
  }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  adminToken = '';
  localStorage.removeItem('shashank_admin_token');
  checkAuth();
});

// Navigation Tabs
export function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.tab-view').forEach(v => v.classList.toggle('active', v.id === `tab-${tabId}`));
  if (tabId === 'bookings') loadBookings();
  if (tabId === 'reviews') loadReviews();
  if (tabId === 'contacts') loadContacts();
  if (tabId === 'catalog') loadCatalog();
}
window.switchTab = switchTab;

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// API Helper with Auth
async function authFetch(endpoint, options = {}) {
  options.headers = options.headers || {};
  options.headers['Authorization'] = `Bearer ${adminToken}`;
  options.headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (res.status === 401) {
    adminToken = '';
    localStorage.removeItem('shashank_admin_token');
    checkAuth();
    throw new Error('Unauthorized');
  }
  return res.json();
}

// Load Dashboard Overview
async function loadDashboard() {
  try {
    const data = await authFetch('/admin/dashboard-stats');
    if (data.success && data.stats) {
      document.getElementById('kpiTotalBookings').textContent = data.stats.bookings.total;
      document.getElementById('kpiNewBookings').textContent = `${data.stats.bookings.new} new enquiries`;
      document.getElementById('kpiPendingReviews').textContent = data.stats.reviews.pending;
      document.getElementById('kpiApprovedReviews').textContent = data.stats.reviews.approved;
      document.getElementById('kpiUnreadMessages').textContent = data.stats.contacts.unread;

      document.getElementById('badgeBookings').textContent = data.stats.bookings.new || data.stats.bookings.total;
      document.getElementById('badgeReviews').textContent = data.stats.reviews.pending;
      document.getElementById('badgeContacts').textContent = data.stats.contacts.unread;

      // Render recent bookings
      const tbody = document.getElementById('overviewRecentBookings');
      if (!data.recentBookings || !data.recentBookings.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No bookings yet.</td></tr>';
      } else {
        tbody.innerHTML = data.recentBookings.map(b => `
          <tr>
            <td>#${b.id}</td>
            <td><strong>${escapeHtml(b.customerName)}</strong><br><small style="color:var(--text-muted);">${escapeHtml(b.phone)}</small></td>
            <td>${escapeHtml(b.pickup)} → ${escapeHtml(b.dropLocation)}</td>
            <td>${escapeHtml(b.travelDate)} ${escapeHtml(b.travelTime || '')}</td>
            <td>${escapeHtml(b.vehicle || 'Any')}</td>
            <td><span class="badge badge-${b.status}">${b.status}</span></td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

// Load Bookings Table
let currentBookingFilter = 'all';
async function loadBookings(filter = currentBookingFilter) {
  currentBookingFilter = filter;
  const tbody = document.getElementById('bookingsTableBody');
  tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Loading bookings...</td></tr>';

  try {
    const data = await authFetch(`/bookings?status=${filter}`);
    if (!data.bookings || !data.bookings.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No bookings found for selected filter.</td></tr>';
      return;
    }

    const bookingStatuses = ['new', 'contacted', 'confirmed', 'completed', 'cancelled'];
    tbody.innerHTML = data.bookings.map(b => `
      <tr>
        <td>#${b.id}</td>
        <td>
          <strong>${escapeHtml(b.customerName)}</strong><br>
          <a href="tel:${b.phone}" style="color:var(--accent); text-decoration:none;">${escapeHtml(b.phone)}</a>
          ${b.email ? `<br><small style="color:var(--text-muted);">${escapeHtml(b.email)}</small>` : ''}
        </td>
        <td>
          <strong>${escapeHtml(b.pickup)}</strong><br>
          <span style="color:var(--text-muted);">↓</span> ${escapeHtml(b.dropLocation)}
        </td>
        <td>${escapeHtml(b.travelDate)}<br><small style="color:var(--text-muted);">${escapeHtml(b.travelTime || '')}</small></td>
        <td>${escapeHtml(b.tripType)}<br><small style="color:var(--text-muted);">${b.passengers} Pax</small></td>
        <td>${escapeHtml(b.vehicle || 'Standard Cab')}</td>
        <td><span class="badge badge-${b.status}">${b.status}</span></td>
        <td>
          <select onchange="updateBookingStatus(${b.id}, this.value)" style="padding:4px 8px; border-radius:6px; background:var(--surface-subtle); color:var(--text-primary); border:1px solid var(--border); font-size:0.80rem;">
            ${bookingStatuses.map(st => `<option value="${st}"${b.status === st ? ' selected' : ''}>${st.charAt(0).toUpperCase() + st.slice(1)}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading bookings:', err);
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state" style="color:var(--danger);">Error loading bookings.</td></tr>';
  }
}

export async function updateBookingStatus(id, newStatus) {
  try {
    await authFetch(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    loadDashboard();
  } catch (e) {
    console.error('Error updating booking status:', e);
    alert('Failed to update booking status.');
  }
}
window.updateBookingStatus = updateBookingStatus;

document.querySelectorAll('#bookingFilters .filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#bookingFilters .filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadBookings(btn.dataset.filter);
  });
});

// Load Reviews Table
let currentReviewFilter = 'all';
async function loadReviews(filter = currentReviewFilter) {
  currentReviewFilter = filter;
  const tbody = document.getElementById('reviewsTableBody');
  tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Loading reviews...</td></tr>';

  try {
    const data = await authFetch(`/reviews/all?status=${filter}`);

    // Update Review Badges & Filters with Live Backend Counts
    if (data.counts) {
      const badge = document.getElementById('badgeReviews');
      if (badge) badge.textContent = data.counts.pending || 0;
      const kpiPending = document.getElementById('kpiPendingReviews');
      if (kpiPending) kpiPending.textContent = data.counts.pending || 0;
      const kpiApproved = document.getElementById('kpiApprovedReviews');
      if (kpiApproved) kpiApproved.textContent = data.counts.approved || 0;

      document.querySelectorAll('#reviewFilters .filter-pill').forEach(btn => {
        const f = btn.dataset.filter;
        if (f === 'all') btn.textContent = `All (${data.counts.total || 0})`;
        else if (f === 'pending') btn.textContent = `Pending (${data.counts.pending || 0})`;
        else if (f === 'approved') btn.textContent = `Approved (${data.counts.approved || 0})`;
        else if (f === 'rejected') btn.textContent = `Rejected (${data.counts.rejected || 0})`;
      });
    }

    const reviews = data.reviews || data.data || [];
    if (!reviews.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No reviews found.</td></tr>';
      return;
    }

    tbody.innerHTML = reviews.map(r => `
      <tr>
        <td>#${r.id}</td>
        <td>
          <strong>${escapeHtml(r.customerName)}</strong>
          ${r.email ? `<br><small style="color:var(--text-muted);">${escapeHtml(r.email)}</small>` : ''}
        </td>
        <td style="color:#F59E0B; font-weight:800;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
        <td style="max-width:320px; line-height:1.4;">${escapeHtml(r.reviewText)}</td>
        <td>${escapeHtml(r.service || r.tripType || r.destination || 'General')}</td>
        <td><span class="badge badge-${r.status}">${r.status}</span></td>
        <td><small style="color:var(--text-muted);">${new Date(r.createdAt).toLocaleDateString()}</small></td>
        <td>
          <div style="display:flex; gap:6px;">
            ${r.status !== 'approved' ? `<button class="btn btn-sm btn-approve" onclick="moderateReview(${r.id}, 'approved')">Approve</button>` : ''}
            ${r.status !== 'rejected' ? `<button class="btn btn-sm btn-reject" onclick="moderateReview(${r.id}, 'rejected')">Reject</button>` : ''}
            <button class="btn btn-sm btn-delete" onclick="deleteReviewItem(${r.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading reviews:', err);
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state" style="color:var(--danger);">Error loading reviews.</td></tr>';
  }
}

export async function moderateReview(id, status) {
  try {
    await authFetch(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    loadReviews();
    loadDashboard();
  } catch (e) {
    console.error('Error moderating review:', e);
    alert('Failed to update review status.');
  }
}
window.moderateReview = moderateReview;

export async function deleteReviewItem(id) {
  if (!confirm('Are you sure you want to permanently delete this review?')) return;
  try {
    await authFetch(`/reviews/${id}`, { method: 'DELETE' });
    loadReviews();
    loadDashboard();
  } catch (e) {
    console.error('Error deleting review:', e);
    alert('Failed to delete review.');
  }
}
window.deleteReviewItem = deleteReviewItem;

document.querySelectorAll('#reviewFilters .filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#reviewFilters .filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadReviews(btn.dataset.filter);
  });
});

// Load Contact Inquiries
let currentContactFilter = 'all';
async function loadContacts(filter = currentContactFilter) {
  currentContactFilter = filter;
  const tbody = document.getElementById('contactsTableBody');
  tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Loading messages...</td></tr>';

  try {
    const data = await authFetch(`/contact?status=${filter}`);

    // Update Contact Badges & Filter Counters with Live Backend Counts
    if (data.counts) {
      const badge = document.getElementById('badgeContacts');
      if (badge) badge.textContent = data.counts.unread || 0;
      const kpiUnread = document.getElementById('kpiUnreadMessages');
      if (kpiUnread) kpiUnread.textContent = data.counts.unread || 0;

      document.querySelectorAll('#contactFilters .filter-pill').forEach(btn => {
        const f = btn.dataset.filter;
        if (f === 'all') btn.textContent = `All (${data.counts.total || 0})`;
        else if (f === 'unread') btn.textContent = `Unread (${data.counts.unread || 0})`;
        else if (f === 'read') btn.textContent = `Read (${data.counts.read || 0})`;
        else if (f === 'resolved') btn.textContent = `Resolved (${data.counts.resolved || 0})`;
      });
    }

    const messages = data.messages || data.data || [];
    if (!messages.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No messages found.</td></tr>';
      return;
    }

    tbody.innerHTML = messages.map(m => `
      <tr>
        <td>#${m.id}</td>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td>
          <a href="tel:${m.phone}" style="color:var(--accent); text-decoration:none;">${escapeHtml(m.phone)}</a>
          ${m.email ? `<br><small style="color:var(--text-muted);">${escapeHtml(m.email)}</small>` : ''}
        </td>
        <td style="max-width:320px; line-height:1.4;">${escapeHtml(m.message)}</td>
        <td><span class="badge badge-${m.status === 'unread' ? 'new' : m.status === 'resolved' ? 'completed' : 'contacted'}">${m.status}</span></td>
        <td><small style="color:var(--text-muted);">${new Date(m.createdAt).toLocaleDateString()}</small></td>
        <td>
          <div style="display:flex; gap:6px;">
            ${m.status === 'unread' ? `<button class="btn btn-sm btn-approve" onclick="updateContactStatus(${m.id}, 'read')">Mark Read</button>` : ''}
            ${m.status !== 'resolved' ? `<button class="btn btn-sm btn-approve" onclick="updateContactStatus(${m.id}, 'resolved')">Resolve</button>` : ''}
            <a href="https://wa.me/${m.phone.replace(/\\D/g, '')}?text=Hello%20${encodeURIComponent(m.name)},%20thank%20you%20for%20contacting%20Shashank%20Tours%20and%20Travels." target="_blank" class="btn btn-sm btn-outline" style="border:1px solid var(--border); color:var(--success);">WhatsApp</a>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading contacts:', err);
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state" style="color:var(--danger);">Error loading messages.</td></tr>';
  }
}

export async function updateContactStatus(id, status) {
  try {
    await authFetch(`/contact/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    loadContacts();
    loadDashboard();
  } catch (e) {
    console.error('Error updating contact status:', e);
    alert('Failed to update message status.');
  }
}
window.updateContactStatus = updateContactStatus;

document.querySelectorAll('#contactFilters .filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#contactFilters .filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadContacts(btn.dataset.filter);
  });
});

// Load Catalog (Tours & Vehicles)
async function loadCatalog() {
  try {
    const tData = await authFetch('/admin/tours');
    const tBody = document.getElementById('catalogToursBody');
    if (tData.tours && tData.tours.length) {
      tBody.innerHTML = tData.tours.map(t => `
        <tr>
          <td><code>${t.id}</code></td>
          <td><strong>${escapeHtml(t.title)}</strong></td>
          <td>${escapeHtml(t.destination)}</td>
          <td>${escapeHtml(t.duration)}</td>
          <td><small>${(t.highlights || []).slice(0, 2).join(' • ')}</small></td>
          <td><span class="badge badge-approved">${t.status}</span></td>
        </tr>
      `).join('');
    }

    const vData = await authFetch('/admin/vehicles');
    const vBody = document.getElementById('catalogVehiclesBody');
    if (vData.vehicles && vData.vehicles.length) {
      vBody.innerHTML = vData.vehicles.map(v => `
        <tr>
          <td><code>${v.id}</code></td>
          <td><strong>${escapeHtml(v.name)}</strong></td>
          <td>${escapeHtml(v.category)}</td>
          <td>${escapeHtml(v.seatingCapacity)} • ${escapeHtml(v.luggageCapacity)}</td>
          <td><small>${(v.features || []).slice(0, 2).join(' • ')}</small></td>
          <td><span class="badge badge-approved">${v.status}</span></td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.error('Error loading catalog:', e);
  }
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
window.escapeHtml = escapeHtml;

// Initial check
checkAuth();
