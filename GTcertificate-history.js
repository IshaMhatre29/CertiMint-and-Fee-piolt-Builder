const STORAGE_KEY = "certificate_history";

document.addEventListener("DOMContentLoaded", renderHistoryTable);

function getHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function formatDate(dateString) {
    if (!dateString) return "";
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
}

function renderHistoryTable() {
    const history = getHistory();
    const tbody = document.getElementById("historyTableBody");
    const totalBadge = document.getElementById("totalRecords");
    
    totalBadge.textContent = history.length;
    tbody.innerHTML = "";

    if (history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="no-records">No generated certificates found in history.</td></tr>`;
        return;
    }

    history.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${item.certificateNo}</strong></td>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.domain}</td>
            <td>${item.college}</td>
            <td>${formatDate(item.issue)}</td>
            <td>
                <button class="action-btn btn-open-cert" onclick="openCertificate('${item.certificateNo}')">View / Print</button>
                <button class="action-btn btn-delete-cert" onclick="deleteCertificate('${item.certificateNo}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterHistory() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#historyTableBody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
    });
}

function openCertificate(certNo) {
    const history = getHistory();
    const certData = history.find(item => item.certificateNo === certNo);

    if (certData) {
        localStorage.setItem("preview_certificate", JSON.stringify(certData));
        window.location.href = `internship.html?certNo=${encodeURIComponent(certNo)}&mode=preview`;
    } else {
        alert("Certificate details could not be found.");
    }
}

function deleteCertificate(certNo) {
    if (confirm(`Are you sure you want to delete certificate ${certNo}?`)) {
        let history = getHistory();
        history = history.filter(item => item.certificateNo !== certNo);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        renderHistoryTable();
    }
}