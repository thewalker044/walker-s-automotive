(function () {
  'use strict';
  const KEYS = { requests: 'walkersAutoRequests', prices: 'walkersAutoPrices' };
  const DEFAULTS = { checkup: 49, oil: 120, brakes: 39 };
  const $ = id => document.getElementById(id);
  let activeRequestId = null;

  function safeRead(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value === null ? fallback : value;
    } catch (_) { return fallback; }
  }
  function getRequests() {
    const requests = safeRead(KEYS.requests, []);
    return Array.isArray(requests) ? requests.filter(item => item && typeof item === 'object') : [];
  }
  function saveRequests(requests) { localStorage.setItem(KEYS.requests, JSON.stringify(requests)); }
  function escapeHtml(input) {
    return String(input ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  function dateText(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function dateTimeText(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not provided';
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function updateStats(requests) {
    $('totalRequests').textContent = requests.length;
    $('newRequests').textContent = requests.filter(item => (item.status || 'New') === 'New').length;
    $('progressRequests').textContent = requests.filter(item => item.status === 'In progress').length;
    $('completedRequests').textContent = requests.filter(item => item.status === 'Completed').length;
    $('requestCount').textContent = requests.length;
  }
  function statusClass(status) {
    if (status === 'In progress') return 'status-in-progress';
    if (status === 'Completed') return 'status-completed';
    return 'status-new';
  }
  function renderRequests() {
    const requests = getRequests();
    updateStats(requests);
    const query = ($('searchRequests').value || '').trim().toLowerCase();
    const status = $('statusFilter').value;
    const filtered = requests.filter(item => {
      const haystack = [item.name, item.email, item.phone, item.vehicle, item.service, item.message].join(' ').toLowerCase();
      return (!query || haystack.includes(query)) && (status === 'All' || (item.status || 'New') === status);
    });
    const list = $('requestsList');
    if (!filtered.length) {
      const isFiltered = Boolean(query || status !== 'All');
      list.innerHTML = `<div class="empty-state"><span class="empty-icon">${isFiltered ? '⌕' : '↗'}</span><h3>${isFiltered ? 'No matching requests' : 'No requests yet'}</h3><p>${isFiltered ? 'Try another search term or status filter.' : 'When a visitor submits the website form in this browser, the request will appear here.'}</p>${isFiltered ? '<a href="#" id="clearFilters">Clear filters <span>↗</span></a>' : '<a href="index.html#contact">Open the contact form <span>↗</span></a>'}</div>`;
      const clear = $('clearFilters');
      if (clear) clear.addEventListener('click', event => { event.preventDefault(); $('searchRequests').value = ''; $('statusFilter').value = 'All'; renderRequests(); });
      return;
    }
    list.innerHTML = filtered.map(item => {
      const safeStatus = item.status || 'New';
      return `<button type="button" class="request-row" data-request-id="${escapeHtml(item.id)}" aria-label="Open request from ${escapeHtml(item.name || 'customer')}">
        <span class="request-person"><strong>${escapeHtml(item.name || 'Name not provided')}</strong><span>${escapeHtml(item.email || 'No email')}</span></span>
        <span class="request-service"><strong>${escapeHtml(item.service || 'Service unspecified')}</strong><span>${escapeHtml(item.phone || 'No phone')} · ${escapeHtml(item.vehicle || 'Vehicle not specified')}</span></span>
        <span class="request-status"><span class="status-pill ${statusClass(safeStatus)}">${escapeHtml(safeStatus)}</span></span>
        <span class="request-date">${escapeHtml(dateText(item.createdAt))}</span>
      </button>`;
    }).join('');
    list.querySelectorAll('[data-request-id]').forEach(button => button.addEventListener('click', () => openRequest(button.getAttribute('data-request-id'))));
  }
  function openRequest(id) {
    const request = getRequests().find(item => String(item.id) === String(id));
    if (!request) return;
    activeRequestId = request.id;
    $('modalTitle').textContent = request.name ? `${request.name}'s request` : 'Service request';
    const fields = [
      ['Customer name', request.name], ['Email address', request.email], ['Phone number', request.phone], ['Vehicle', request.vehicle], ['Requested service', request.service], ['Submitted', dateTimeText(request.createdAt)], ['Message', request.message || 'No additional message', true]
    ];
    $('modalDetails').innerHTML = fields.map(([label, value, full]) => `<div class="detail-item${full ? ' detail-full' : ''}"><span class="detail-label">${escapeHtml(label.toUpperCase())}</span><span class="detail-value">${escapeHtml(value || 'Not provided')}</span></div>`).join('');
    $('modalStatus').value = request.status || 'New';
    $('modalSaveMessage').textContent = '';
    $('requestModal').classList.add('is-open');
    $('requestModal').setAttribute('aria-hidden', 'false');
    $('modalClose').focus();
  }
  function closeModal() {
    $('requestModal').classList.remove('is-open');
    $('requestModal').setAttribute('aria-hidden', 'true');
    activeRequestId = null;
  }
  function exportCsv() {
    const requests = getRequests();
    if (!requests.length) { alert('There are no demo requests to export yet.'); return; }
    const headers = ['Name', 'Email', 'Phone', 'Vehicle', 'Service', 'Message', 'Submitted', 'Status'];
    const rows = requests.map(item => [item.name, item.email, item.phone, item.vehicle, item.service, item.message, item.createdAt, item.status || 'New']);
    const csv = [headers, ...rows].map(row => row.map(value => '"' + String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"').join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'walkers-automotive-requests.csv';
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  }
  function initialisePricingForm() {
    const prices = { ...DEFAULTS, ...safeRead(KEYS.prices, {}) };
    // Migrate the previous prototype default to the owner's requested $120 rate.
    if (Number(prices.oil) === 69) { prices.oil = 120; localStorage.setItem(KEYS.prices, JSON.stringify(prices)); }
    Object.keys(DEFAULTS).forEach(key => { $('pricingForm').elements[key].value = prices[key]; });
  }
  function handlePricingSave(event) {
    event.preventDefault();
    const form = $('pricingForm');
    if (!form.reportValidity()) return;
    const prices = {};
    Object.keys(DEFAULTS).forEach(key => { prices[key] = Math.max(0, Math.round(Number(form.elements[key].value))); });
    try {
      localStorage.setItem(KEYS.prices, JSON.stringify(prices));
      $('pricingSaveMessage').textContent = 'Saved in this browser. Values on the public page will update on the same site origin.';
    } catch (_) {
      $('pricingSaveMessage').textContent = 'Could not save in this browser. Check browser storage settings and try again.';
    }
  }
  $('searchRequests').addEventListener('input', renderRequests);
  $('statusFilter').addEventListener('change', renderRequests);
  $('exportCsv').addEventListener('click', exportCsv);
  $('clearRequests').addEventListener('click', () => {
    if (!getRequests().length) { alert('There are no requests to clear.'); return; }
    if (confirm('Delete all service requests saved in this browser? This cannot be undone.')) {
      saveRequests([]);
      renderRequests();
    }
  });
  $('pricingForm').addEventListener('submit', handlePricingSave);
  $('modalClose').addEventListener('click', closeModal);
  document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && $('requestModal').classList.contains('is-open')) closeModal(); });
  $('saveRequestStatus').addEventListener('click', () => {
    if (!activeRequestId) return;
    try {
      const requests = getRequests();
      const index = requests.findIndex(item => String(item.id) === String(activeRequestId));
      if (index < 0) { $('modalSaveMessage').textContent = 'This request could not be found in local storage.'; return; }
      requests[index].status = $('modalStatus').value;
      saveRequests(requests);
      renderRequests();
      $('modalSaveMessage').textContent = 'Status updated in this browser.';
    } catch (_) { $('modalSaveMessage').textContent = 'Unable to save the status in this browser.'; }
  });
  const now = new Date();
  $('todayLabel').textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  initialisePricingForm();
  renderRequests();
  window.addEventListener('storage', event => {
    if (event.key === KEYS.requests) renderRequests();
    if (event.key === KEYS.prices) initialisePricingForm();
  });
})();
