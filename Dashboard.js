/**
 * Student Management Board - Dashboard Logic
 * Automatically computes real-time counters from localStorage
 */

// Keys used in localStorage across modules
const KEYS = {
  CERTIFICATES: 'certificate_history',
  FEE_RECORDS: 'feeRecords',
  DASHBOARD_DATA: 'ganishka_dashboard_data'
};

/**
 * Calculates total issued certificates dynamically.
 * Prioritizes actual generated history array size; falls back to tracking key if present.
 */
function getCertificatesIssuedCount() {
  const historyRaw = localStorage.getItem(KEYS.CERTIFICATES);
  if (historyRaw) {
    try {
      const historyArr = JSON.parse(historyRaw);
      if (Array.isArray(historyArr)) {
        return historyArr.length;
      }
    } catch (e) {
      console.error("Error parsing certificate_history from localStorage:", e);
    }
  }

  // Fallback to tracking storage if history array isn't populated yet
  const trackedDataRaw = localStorage.getItem(KEYS.DASHBOARD_DATA);
  if (trackedDataRaw) {
    try {
      const trackedData = JSON.parse(trackedDataRaw);
      return typeof trackedData.interns === 'number' ? trackedData.interns : 0;
    } catch (e) {
      console.error("Error parsing ganishka_dashboard_data:", e);
    }
  }

  return 0;
}

/**
 * Computes pending fee records automatically by scanning `feeRecords` in localStorage.
 * Counts any entry where balance > 0 OR status is not explicitly "Paid".
 */
function getPendingPaymentsCount() {
  const feeRecordsRaw = localStorage.getItem(KEYS.FEE_RECORDS);
  if (feeRecordsRaw) {
    try {
      const feeRecords = JSON.parse(feeRecordsRaw);
      if (Array.isArray(feeRecords)) {
        return feeRecords.filter(record => {
          const balance = parseFloat(record.balance) || 0;
          const status = (record.status || "").trim().toLowerCase();
          return balance > 0 || status !== "paid";
        }).length;
      }
    } catch (e) {
      console.error("Error parsing feeRecords from localStorage:", e);
    }
  }

  // Fallback if no feeRecords array is present in localStorage
  const trackedDataRaw = localStorage.getItem(KEYS.DASHBOARD_DATA);
  if (trackedDataRaw) {
    try {
      const trackedData = JSON.parse(trackedDataRaw);
      return typeof trackedData.payments === 'number' ? trackedData.payments : 0;
    } catch (e) {
      console.error("Error parsing ganishka_dashboard_data:", e);
    }
  }

  return 0;
}

/**
 * Updates DOM values with freshly computed metrics
 */
function renderMetrics() {
  const totalCertificates = getCertificatesIssuedCount();
  const totalPendingPayments = getPendingPaymentsCount();

  const certElem = document.getElementById('val-interns');
  const payElem = document.getElementById('val-payments');

  if (certElem) certElem.innerText = totalCertificates.toLocaleString();
  if (payElem) payElem.innerText = totalPendingPayments.toLocaleString();
}

/**
 * Handles Administrator Logout safely
 */
function logout() {
  if (confirm("Do you want to Logout?")) {
    window.location.href = "certi.html";
  }
}

// Attach Event Listeners on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderMetrics();

  // Attach logout handlers to buttons
  const logoutBtnSidebar = document.getElementById('btnLogoutSidebar');
  const logoutBtnHeader = document.getElementById('btnLogoutHeader');

  if (logoutBtnSidebar) logoutBtnSidebar.addEventListener('click', logout);
  if (logoutBtnHeader) logoutBtnHeader.addEventListener('click', logout);
});

// Real-Time Cross-Tab Listener
// Instantly re-calculates metrics when certificates or fee records change in another tab
window.addEventListener('storage', (event) => {
  if ([KEYS.CERTIFICATES, KEYS.FEE_RECORDS, KEYS.DASHBOARD_DATA].includes(event.key)) {
    renderMetrics();
  }
});