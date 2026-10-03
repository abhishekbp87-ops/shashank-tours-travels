// Official UPI Payment System for Shashank Tours & Travels
// NPCI UPI Deep-link & Dynamic Live QR compliant
// Merchant UPI ID configurable via VITE_UPI_ID in .env
// Merchant Receiver Phone: +91 87478 29020

import QRCode from 'qrcode';
import { paymentInfo, companyInfo } from '../data/company.js';

let paymentModalState = {
  amount: 0,
  reference: '',
  bookingId: '',
  status: 'entry', // 'entry' | 'initiating' | 'initiated'
  activeTab: 'dynamic' // 'dynamic' | 'static'
};

// Debounce timer for dynamic QR generation
let qrDebounceTimer = null;

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
  // Pay Now buttons across site
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

  const initialAmount = options.amount ? parseFloat(options.amount) : 0;

  paymentModalState = {
    amount: initialAmount > 0 ? initialAmount : 0,
    reference: options.reference || (options.bookingId ? `Booking #${options.bookingId}` : ''),
    bookingId: options.bookingId || '',
    status: 'entry',
    activeTab: 'dynamic'
  };

  const amountInput = document.getElementById('payModalAmountInput');
  const errorEl = document.getElementById('payModalAmountError');
  const mainPanel = document.getElementById('payMainPanel');
  const statusPanel = document.getElementById('payStatusPanel');

  if (mainPanel) mainPanel.style.display = 'block';
  if (statusPanel) statusPanel.style.display = 'none';

  if (amountInput) {
    amountInput.value = initialAmount > 0 ? initialAmount : '';
  }
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  // Update dynamic button text (e.g. "Pay ₹500" or "Pay Now")
  updateDynamicPayButton();

  // Render initial dynamic QR code
  renderLiveQRCode();

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus amount input for rapid entry
  setTimeout(() => {
    if (amountInput) {
      amountInput.focus();
      if (amountInput.value) {
        amountInput.select();
      }
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
  const amountInput = document.getElementById('payModalAmountInput');
  const payBtn = document.getElementById('btnPayAmount');
  const payForm = document.getElementById('payQuickForm');

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

  // Real-time input listener: dynamically updates button text and dynamic QR code
  if (amountInput) {
    amountInput.addEventListener('input', () => {
      clearAmountError();
      updateDynamicPayButton();

      // Debounce QR regeneration for performance
      clearTimeout(qrDebounceTimer);
      qrDebounceTimer = setTimeout(() => {
        renderLiveQRCode();
      }, 150);
    });

    amountInput.addEventListener('keypress', (e) => {
      // Allow only numbers and decimal point
      if (!/[\d.]/.test(e.key) && e.key !== 'Enter') {
        e.preventDefault();
      }
    });
  }

  // Preset chips (₹100, ₹500, ₹1000, ₹5000)
  document.querySelectorAll('.pay-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-value');
      if (amountInput) {
        amountInput.value = val;
        clearAmountError();
        updateDynamicPayButton();
        renderLiveQRCode();
        amountInput.focus();
      }
    });
  });

  // Submit / Pay Button click
  if (payBtn) {
    payBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeUPIPayment();
    });
  }
  if (payForm) {
    payForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeUPIPayment();
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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Copied!</span>
        `;
        copyUpiBtn.classList.add('copied');
        setTimeout(() => {
          copyUpiBtn.innerHTML = originalText;
          copyUpiBtn.classList.remove('copied');
        }, 2200);
      }).catch(() => {
        prompt('Merchant UPI ID:', upiId);
      });
    });
  }

  // Toggle Fallback Static QR
  const toggleStaticBtn = document.getElementById('toggleStaticQrBtn');
  const staticQrWrapper = document.getElementById('staticQrFallbackWrapper');
  const dynamicQrWrapper = document.getElementById('dynamicQrMainWrapper');

  if (toggleStaticBtn && staticQrWrapper && dynamicQrWrapper) {
    toggleStaticBtn.addEventListener('click', () => {
      const isStatic = staticQrWrapper.style.display !== 'none';
      if (isStatic) {
        staticQrWrapper.style.display = 'none';
        dynamicQrWrapper.style.display = 'block';
        toggleStaticBtn.textContent = 'View Counter PhonePe QR';
      } else {
        staticQrWrapper.style.display = 'block';
        dynamicQrWrapper.style.display = 'none';
        toggleStaticBtn.textContent = 'Switch to Dynamic Amount QR';
      }
    });
  }

  // Status Screen - WhatsApp Confirmation button
  const btnNotifyWhatsApp = document.getElementById('btnNotifyPaymentWhatsApp');
  if (btnNotifyWhatsApp) {
    btnNotifyWhatsApp.addEventListener('click', () => {
      handleWhatsAppNotification();
    });
  }

  // Status Screen - Done / Close button
  const btnDoneClose = document.getElementById('btnDoneClosePayment');
  if (btnDoneClose) {
    btnDoneClose.addEventListener('click', () => {
      closePaymentModal();
    });
  }

  // Status Screen - Retry / Change button
  const btnRetry = document.getElementById('btnRetryPayment');
  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      const mainPanel = document.getElementById('payMainPanel');
      const statusPanel = document.getElementById('payStatusPanel');
      if (mainPanel) mainPanel.style.display = 'block';
      if (statusPanel) statusPanel.style.display = 'none';
      if (amountInput) amountInput.focus();
    });
  }
}

/**
 * Format currency in Indian Rupees
 */
export function formatINR(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '₹0';
  // If whole number, format without cents, else include decimals
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2
  }).format(num);
}

/**
 * Update the dynamic payment button text: e.g. "Pay ₹500"
 */
function updateDynamicPayButton() {
  const amountInput = document.getElementById('payModalAmountInput');
  const payBtn = document.getElementById('btnPayAmount');
  if (!payBtn) return;

  const rawVal = amountInput ? amountInput.value.trim() : '';
  const parsed = parseFloat(rawVal);

  if (!rawVal || isNaN(parsed) || parsed <= 0) {
    paymentModalState.amount = 0;
    payBtn.innerHTML = `
      <span>Pay Now</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    `;
  } else {
    paymentModalState.amount = parsed;
    const formatted = formatINR(parsed);
    payBtn.innerHTML = `
      <span>Pay ${formatted}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    `;
  }
}

/**
 * Construct standard NPCI UPI URI with exact merchant ID and entered amount
 */
export function buildUpiUri(amountVal = 0, scheme = '') {
  const pa = paymentInfo.upiId;
  const pn = encodeURIComponent(paymentInfo.merchantName);
  const note = encodeURIComponent(
    paymentModalState.reference ||
    (paymentModalState.bookingId ? `Booking ${paymentModalState.bookingId}` : 'Travel Payment')
  );

  let baseParams = `pa=${pa}&pn=${pn}&cu=INR&tn=${note}&mode=02&purpose=00`;

  // Append amount only if valid positive amount provided
  if (amountVal && amountVal > 0) {
    baseParams += `&am=${amountVal.toFixed(2)}`;
  }

  if (!scheme) {
    return `upi://pay?${baseParams}`;
  }

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
 * Render dynamic QR code onto canvas matching the current entered amount
 */
async function renderLiveQRCode() {
  const canvas = document.getElementById('dynamicQrCanvas');
  if (!canvas) return;

  const currentAmount = paymentModalState.amount > 0 ? paymentModalState.amount : 0;
  const upiUri = buildUpiUri(currentAmount);

  // Update amount badge under QR
  const qrAmountLabel = document.getElementById('qrLiveAmountLabel');
  if (qrAmountLabel) {
    if (currentAmount > 0) {
      qrAmountLabel.textContent = `for ${formatINR(currentAmount)}`;
    } else {
      qrAmountLabel.textContent = `(Enter amount above)`;
    }
  }

  try {
    await QRCode.toCanvas(canvas, upiUri, {
      width: 200,
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

/**
 * Execute UPI Payment
 * Triggers universal UPI intent with Amount and configured Merchant UPI ID
 */
function executeUPIPayment() {
  const amountInput = document.getElementById('payModalAmountInput');
  const payBtn = document.getElementById('btnPayAmount');
  const rawValue = (amountInput ? amountInput.value : '').trim();

  // 1. Validation
  if (!rawValue) {
    showAmountError('Please enter the payment amount.');
    return;
  }

  const parsedAmount = parseFloat(rawValue);

  if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
    showAmountError('Please enter a valid numeric amount.');
    return;
  }

  if (parsedAmount <= 0) {
    showAmountError('Payment amount must be greater than zero.');
    return;
  }

  if (parsedAmount < 1) {
    showAmountError('Minimum payment amount is ₹1.');
    return;
  }

  // Validated amount
  const validatedAmount = Math.round(parsedAmount * 100) / 100;
  paymentModalState.amount = validatedAmount;

  // 2. Prevent duplicate clicks & show initiating indicator
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.innerHTML = `
      <span>Initiating UPI Payment...</span>
    `;
  }

  // 3. Build universal UPI URI containing configured merchant UPI ID and amount
  const upiUri = buildUpiUri(validatedAmount);

  // 4. Launch official UPI payment deep-link intent
  // On mobile (Android & iOS), this triggers the OS app chooser with Google Pay, PhonePe, Paytm, BHIM, etc.
  try {
    window.location.href = upiUri;
  } catch (e) {
    console.warn('Deep link launch note:', e);
  }

  // 5. Transition to honest initiated status screen after a brief delay
  setTimeout(() => {
    showInitiatedScreen(validatedAmount);
    if (payBtn) {
      payBtn.disabled = false;
      updateDynamicPayButton();
    }
  }, 1000);
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
 * Display Payment Initiated Screen
 * Honest status: No fake success message.
 */
function showInitiatedScreen(amountVal) {
  paymentModalState.status = 'initiated';

  const mainPanel = document.getElementById('payMainPanel');
  const statusPanel = document.getElementById('payStatusPanel');

  if (mainPanel) mainPanel.style.display = 'none';
  if (statusPanel) statusPanel.style.display = 'block';

  const amountDisplay = document.getElementById('statusAmountValue');
  if (amountDisplay) {
    amountDisplay.textContent = formatINR(amountVal);
  }

  // Store initiated payment in localStorage if linked to booking
  try {
    const lastBookingRaw = localStorage.getItem('last_booking');
    if (lastBookingRaw) {
      const bData = JSON.parse(lastBookingRaw);
      bData.paymentInitiated = {
        amount: amountVal,
        timestamp: new Date().toISOString(),
        merchantUpi: paymentInfo.upiId,
        status: 'initiated'
      };
      localStorage.setItem('last_booking', JSON.stringify(bData));
    }
  } catch {}
}

/**
 * WhatsApp 1-Click Payment Confirmation (Zero form inputs)
 */
function handleWhatsAppNotification() {
  const amountStr = formatINR(paymentModalState.amount);
  const dateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const text = encodeURIComponent(
    `*UPI Payment Notification - ${paymentInfo.merchantName}*\n\n` +
    `• *Status:* Payment Initiated via UPI\n` +
    `• *Amount:* ${amountStr}\n` +
    (paymentModalState.bookingId ? `• *Booking ID:* ${paymentModalState.bookingId}\n` : '') +
    (paymentModalState.reference ? `• *Note:* ${paymentModalState.reference}\n` : '') +
    `• *Paid to UPI:* ${paymentInfo.upiId}\n` +
    `• *Time:* ${dateStr}\n\n` +
    `Please verify bank credit and confirm booking allocation.`
  );

  window.open(`https://wa.me/${companyInfo.whatsappRaw}?text=${text}`, '_blank');
}
