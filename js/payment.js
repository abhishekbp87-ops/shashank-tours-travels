// Official UPI Payment System for Shashank Tours & Travels
// NPCI UPI Deep-link & Dynamic QR compliant
// Recipient: +91 87478 29020 | Configurable UPI ID via VITE_UPI_ID

import QRCode from 'qrcode';
import { paymentInfo, companyInfo } from '../data/company.js';

let paymentModalState = {
  amount: 0,
  reference: '',
  bookingId: '',
  customerName: '',
  customerPhone: '',
  status: 'idle', // 'idle' | 'amount' | 'paying' | 'initiated' | 'cancelled'
  utr: '',
  activeTab: 'dynamic' // 'dynamic' | 'static'
};

/**
 * Initialize payment system listeners and section triggers
 */
export function initPaymentSystem() {
  setupSectionTriggers();
  setupPaymentModalDOM();
}

/**
 * Setup clickable payment triggers across the page (Section, nav links, etc.)
 */
function setupSectionTriggers() {
  // Pay Now buttons
  document.querySelectorAll('[data-action="open-payment-modal"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const presetAmount = el.getAttribute('data-preset-amount') || '';
      const presetRef = el.getAttribute('data-preset-ref') || '';
      openPaymentModal({ amount: presetAmount, reference: presetRef });
    });
  });

  // Click & keyboard interaction on the QR card preview in the payment section
  const previewCard = document.getElementById('paymentSectionQRCard');
  if (previewCard) {
    previewCard.addEventListener('click', () => {
      openPaymentModal();
    });
    previewCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPaymentModal();
      }
    });
  }
}

/**
 * Open the Payment Modal with optional pre-filled values
 */
export function openPaymentModal(options = {}) {
  const overlay = document.getElementById('paymentModalOverlay');
  if (!overlay) return;

  // Reset or initialize state
  paymentModalState = {
    amount: options.amount ? parseFloat(options.amount) : 0,
    reference: options.reference || (options.bookingId ? `Booking #${options.bookingId}` : ''),
    bookingId: options.bookingId || '',
    customerName: options.customerName || '',
    customerPhone: options.customerPhone || '',
    status: 'amount',
    utr: '',
    activeTab: 'dynamic'
  };

  // Populate initial inputs
  const amountInput = document.getElementById('payModalAmountInput');
  const refInput = document.getElementById('payModalRefInput');
  const errorEl = document.getElementById('payModalAmountError');

  if (amountInput) {
    amountInput.value = paymentModalState.amount > 0 ? paymentModalState.amount : '';
  }
  if (refInput) {
    refInput.value = paymentModalState.reference || '';
  }
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  // If amount was already provided and valid, proceed directly to pay screen
  if (paymentModalState.amount > 0) {
    showPayScreen();
  } else {
    showAmountScreen();
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus amount input
  setTimeout(() => {
    if (amountInput && paymentModalState.amount <= 0) {
      amountInput.focus();
    }
  }, 100);
}

/**
 * Close Payment Modal and restore scroll
 */
export function closePaymentModal() {
  const overlay = document.getElementById('paymentModalOverlay');
  if (overlay) {
    overlay.classList.remove('open');
  }
  document.body.style.overflow = '';
}

/**
 * Setup DOM event listeners for the payment modal
 */
function setupPaymentModalDOM() {
  const overlay = document.getElementById('paymentModalOverlay');
  const closeBtn = document.getElementById('closePayModalBtn');
  const amountForm = document.getElementById('payAmountForm');
  const btnContinue = document.getElementById('btnContinueToPay');
  const amountInput = document.getElementById('payModalAmountInput');

  // Close triggers
  if (closeBtn) {
    closeBtn.addEventListener('click', closePaymentModal);
  }
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePaymentModal();
    });
  }

  // Keyboard Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
      closePaymentModal();
    }
  });

  // Preset chips
  document.querySelectorAll('.pay-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-value');
      if (amountInput) {
        amountInput.value = val;
        amountInput.dispatchEvent(new Event('input'));
        clearAmountError();
      }
    });
  });

  // Live input validation on amount
  if (amountInput) {
    amountInput.addEventListener('input', () => {
      clearAmountError();
    });
  }

  // Continue to Pay submit
  if (amountForm) {
    amountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAmountSubmit();
    });
  }
  if (btnContinue) {
    btnContinue.addEventListener('click', (e) => {
      e.preventDefault();
      handleAmountSubmit();
    });
  }

  // Back to Amount button
  const backToAmountBtn = document.getElementById('payModalBackToAmount');
  if (backToAmountBtn) {
    backToAmountBtn.addEventListener('click', () => {
      showAmountScreen();
    });
  }

  // Copy UPI ID button
  const copyUpiBtn = document.getElementById('payModalCopyUpiBtn');
  if (copyUpiBtn) {
    copyUpiBtn.addEventListener('click', () => {
      const upiId = paymentInfo.upiId;
      navigator.clipboard.writeText(upiId).then(() => {
        const originalText = copyUpiBtn.innerHTML;
        copyUpiBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Copied!</span>
        `;
        copyUpiBtn.classList.add('copied');
        setTimeout(() => {
          copyUpiBtn.innerHTML = originalText;
          copyUpiBtn.classList.remove('copied');
        }, 2500);
      }).catch(() => {
        prompt('Copy UPI ID:', upiId);
      });
    });
  }

  // Mobile UPI Launch Buttons
  const universalUpiBtn = document.getElementById('btnPayUniversalUpi');
  if (universalUpiBtn) {
    universalUpiBtn.addEventListener('click', () => {
      launchUPIIntent('');
    });
  }

  // App-specific UPI Buttons
  document.querySelectorAll('[data-upi-scheme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const scheme = btn.getAttribute('data-upi-scheme');
      launchUPIIntent(scheme);
    });
  });

  // Fallback QR Tabs (Dynamic vs Static PhonePe)
  const tabDynamic = document.getElementById('qrTabDynamic');
  const tabStatic = document.getElementById('qrTabStatic');
  const dynamicView = document.getElementById('qrViewDynamic');
  const staticView = document.getElementById('qrViewStatic');

  if (tabDynamic && tabStatic) {
    tabDynamic.addEventListener('click', () => {
      tabDynamic.classList.add('active');
      tabStatic.classList.remove('active');
      if (dynamicView) dynamicView.style.display = 'block';
      if (staticView) staticView.style.display = 'none';
      paymentModalState.activeTab = 'dynamic';
    });

    tabStatic.addEventListener('click', () => {
      tabStatic.classList.add('active');
      tabDynamic.classList.remove('active');
      if (dynamicView) dynamicView.style.display = 'none';
      if (staticView) staticView.style.display = 'block';
      paymentModalState.activeTab = 'static';
    });
  }

  // "I have completed payment" button
  const btnCompleted = document.getElementById('btnPayCompleted');
  if (btnCompleted) {
    btnCompleted.addEventListener('click', () => {
      showInitiatedScreen();
    });
  }

  // "Cancel / Retry" button
  const btnRetry = document.getElementById('btnPayRetry');
  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      paymentModalState.status = 'cancelled';
      showAmountScreen();
    });
  }

  // Status Screen - WhatsApp Confirmation button
  const btnNotifyWhatsApp = document.getElementById('btnNotifyPaymentWhatsApp');
  if (btnNotifyWhatsApp) {
    btnNotifyWhatsApp.addEventListener('click', () => {
      handleWhatsAppNotification();
    });
  }

  // Done / Close button on status screen
  const btnDoneClose = document.getElementById('btnDoneClosePayment');
  if (btnDoneClose) {
    btnDoneClose.addEventListener('click', () => {
      closePaymentModal();
    });
  }
}

/**
 * Validate customer amount and transition to Pay screen
 */
function handleAmountSubmit() {
  const amountInput = document.getElementById('payModalAmountInput');
  const refInput = document.getElementById('payModalRefInput');
  const rawValue = (amountInput ? amountInput.value : '').trim();

  if (!rawValue) {
    showAmountError('Please enter the payment amount.');
    return;
  }

  const parsedAmount = parseFloat(rawValue);

  if (isNaN(parsedAmount)) {
    showAmountError('Please enter a valid numeric amount.');
    return;
  }

  if (parsedAmount <= 0) {
    showAmountError('Payment amount must be greater than zero.');
    return;
  }

  if (parsedAmount < 1) {
    showAmountError('Minimum payment amount is ₹1.00.');
    return;
  }

  // Format to 2 decimal places maximum
  const validatedAmount = Math.round(parsedAmount * 100) / 100;
  paymentModalState.amount = validatedAmount;
  paymentModalState.reference = refInput ? refInput.value.trim() : '';

  showPayScreen();
}

function showAmountError(msg) {
  const errorEl = document.getElementById('payModalAmountError');
  const amountInput = document.getElementById('payModalAmountInput');
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }
  if (amountInput) {
    amountInput.classList.add('input-error');
    amountInput.focus();
  }
}

function clearAmountError() {
  const errorEl = document.getElementById('payModalAmountError');
  const amountInput = document.getElementById('payModalAmountInput');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }
  if (amountInput) {
    amountInput.classList.remove('input-error');
  }
}

/**
 * Display the Amount Entry Step
 */
function showAmountScreen() {
  paymentModalState.status = 'amount';
  const stepAmount = document.getElementById('payStepAmount');
  const stepPay = document.getElementById('payStepPay');
  const stepStatus = document.getElementById('payStepStatus');

  if (stepAmount) stepAmount.style.display = 'block';
  if (stepPay) stepPay.style.display = 'none';
  if (stepStatus) stepStatus.style.display = 'none';

  const titleEl = document.getElementById('payModalHeaderTitle');
  if (titleEl) titleEl.textContent = 'Make a Payment';
}

/**
 * Format Indian Rupee currency with standard comma separators
 */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Construct standard NPCI UPI URI
 */
export function buildUpiUri(scheme = '') {
  const pa = paymentInfo.upiId;
  const pn = encodeURIComponent(paymentInfo.merchantName);
  const am = paymentModalState.amount.toFixed(2);
  const cu = 'INR';
  const note = encodeURIComponent(
    paymentModalState.reference ||
    (paymentModalState.bookingId ? `Booking ${paymentModalState.bookingId}` : 'Travel Payment')
  );

  // Standard NPCI URI
  const baseParams = `pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tn=${note}&mode=02&purpose=00`;

  if (!scheme) {
    return `upi://pay?${baseParams}`;
  }

  // Scheme specific mappings
  switch (scheme.toLowerCase()) {
    case 'gpay':
      return `gpay://upi/pay?${baseParams}`;
    case 'phonepe':
      return `phonepe://upi/pay?${baseParams}`;
    case 'paytm':
      return `paytmmp://pay?${baseParams}`;
    case 'bhim':
      return `bhim://pay?${baseParams}`;
    default:
      return `upi://pay?${baseParams}`;
  }
}

/**
 * Display the Pay Step (QR for desktop, intent buttons for mobile)
 */
async function showPayScreen() {
  paymentModalState.status = 'paying';

  const stepAmount = document.getElementById('payStepAmount');
  const stepPay = document.getElementById('payStepPay');
  const stepStatus = document.getElementById('payStepStatus');

  if (stepAmount) stepAmount.style.display = 'none';
  if (stepPay) stepPay.style.display = 'block';
  if (stepStatus) stepStatus.style.display = 'none';

  const titleEl = document.getElementById('payModalHeaderTitle');
  if (titleEl) titleEl.textContent = 'Make a Payment';

  // Update summary fields
  const amountFormatted = formatINR(paymentModalState.amount);
  const amountDisplayEls = document.querySelectorAll('.pay-display-amount');
  amountDisplayEls.forEach(el => {
    el.textContent = amountFormatted;
  });

  const upiIdDisplay = document.getElementById('payDisplayUpiId');
  if (upiIdDisplay) {
    upiIdDisplay.textContent = paymentInfo.upiId;
  }

  const phoneDisplay = document.getElementById('payDisplayPhone');
  if (phoneDisplay) {
    phoneDisplay.textContent = paymentInfo.phone;
  }

  const noteDisplay = document.getElementById('payDisplayNote');
  if (noteDisplay) {
    noteDisplay.textContent = paymentModalState.reference || 'Direct Travel Payment';
  }

  // Build the universal UPI URI
  const upiUri = buildUpiUri('');

  // Render Dynamic QR code onto canvas
  const canvas = document.getElementById('dynamicQrCanvas');
  if (canvas) {
    try {
      await QRCode.toCanvas(canvas, upiUri, {
        width: 230,
        margin: 1,
        color: {
          dark: '#123B4A', // Brand Deep Petrol Blue
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (err) {
      console.warn('QR Code generation error:', err);
    }
  }

  // Update intent link attributes
  const universalUpiBtn = document.getElementById('btnPayUniversalUpi');
  if (universalUpiBtn) {
    universalUpiBtn.setAttribute('href', upiUri);
  }
}

/**
 * Launch UPI Intent on Mobile device
 */
function launchUPIIntent(scheme = '') {
  const upiUri = buildUpiUri(scheme);

  // Mark status as initiated
  paymentModalState.status = 'initiated';

  // Attempt deep-link launch
  window.location.href = upiUri;

  // After a brief delay (giving native app time to open), show status confirmation screen
  setTimeout(() => {
    showInitiatedScreen();
  }, 1200);
}

/**
 * Display Payment Initiated Screen
 * (Distinguishes initiated vs verified - no fake success)
 */
function showInitiatedScreen() {
  paymentModalState.status = 'initiated';

  const stepAmount = document.getElementById('payStepAmount');
  const stepPay = document.getElementById('payStepPay');
  const stepStatus = document.getElementById('payStepStatus');

  if (stepAmount) stepAmount.style.display = 'none';
  if (stepPay) stepPay.style.display = 'none';
  if (stepStatus) stepStatus.style.display = 'block';

  const titleEl = document.getElementById('payModalHeaderTitle');
  if (titleEl) titleEl.textContent = 'Payment Status';

  // Populate status summary
  const statusAmountEl = document.getElementById('statusDisplayAmount');
  if (statusAmountEl) {
    statusAmountEl.textContent = formatINR(paymentModalState.amount);
  }

  const statusRefEl = document.getElementById('statusDisplayRef');
  if (statusRefEl) {
    statusRefEl.textContent = paymentModalState.reference || (paymentModalState.bookingId ? `Booking #${paymentModalState.bookingId}` : 'Direct Payment');
  }

  // If there's an associated booking in localStorage, update its initiated payment note
  try {
    const lastBookingRaw = localStorage.getItem('last_booking');
    if (lastBookingRaw) {
      const bData = JSON.parse(lastBookingRaw);
      bData.paymentInitiated = {
        amount: paymentModalState.amount,
        timestamp: new Date().toISOString(),
        upiId: paymentInfo.upiId,
        status: 'initiated'
      };
      localStorage.setItem('last_booking', JSON.stringify(bData));
    }
  } catch {}
}

/**
 * WhatsApp Notification with Payment Details & UTR
 */
function handleWhatsAppNotification() {
  const utrInput = document.getElementById('paymentUtrInput');
  const utrValue = utrInput ? utrInput.value.trim() : '';

  const dateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const text = encodeURIComponent(
    `*UPI Payment Notification - ${paymentInfo.merchantName}*\n\n` +
    `• *Status:* Payment Initiated by Customer\n` +
    `• *Amount:* ${formatINR(paymentModalState.amount)}\n` +
    (paymentModalState.bookingId ? `• *Booking ID:* ${paymentModalState.bookingId}\n` : '') +
    (paymentModalState.reference ? `• *Reference:* ${paymentModalState.reference}\n` : '') +
    (utrValue ? `• *UPI Ref / UTR:* ${utrValue}\n` : '• *UPI Ref:* Pending receipt verification\n') +
    `• *Recipient UPI:* ${paymentInfo.upiId}\n` +
    `• *Timestamp:* ${dateStr}\n\n` +
    `Please verify the bank credit and confirm booking allocation.`
  );

  // Open WhatsApp to merchant phone
  window.open(`https://wa.me/${companyInfo.whatsappRaw}?text=${text}`, '_blank');
}
