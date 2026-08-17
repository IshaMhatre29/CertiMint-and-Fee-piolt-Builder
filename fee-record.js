// ===============================================
// Dynamic Fee Management Engine (Bug-Free & Resilient)
// ===============================================

let feeRecords = JSON.parse(localStorage.getItem("feeRecords")) || [];
let editIndex = -1;
let currentView = "form";

// 1. GT restricted to Internship Fee only
const gtOptions = ["Internship Fee"];

const gaCourses = [
    "Web Development",
    "Python",
    "Java",
    "C Programming",
    "C++",
    "Data Science",
    "UI/UX Design",
    "Digital Marketing",
    "Tally",
    "MS Office"
];

// Initialize Workspace & Event Binding
document.addEventListener("DOMContentLoaded", function () {
    const paymentDateEl = document.getElementById("paymentDate");
    if (paymentDateEl) {
        paymentDateEl.value = new Date().toISOString().split("T")[0];
    }

    // Attach Primary Event Listeners
    document.getElementById("organization")?.addEventListener("change", loadFeeOptions);
    document.getElementById("feeType")?.addEventListener("change", handleFeeTypeChange);
    document.getElementById("totalFee")?.addEventListener("input", calculateBalance);
    document.getElementById("paidFee")?.addEventListener("input", calculateBalance);
    document.getElementById("saveBtn")?.addEventListener("click", saveRecord);
    document.getElementById("updateBtn")?.addEventListener("click", updateRecord);
    document.getElementById("resetBtn")?.addEventListener("click", clearForm);

    document.getElementById("showFormRecordsBtn")?.addEventListener("click", function () {
        currentView = "form";
        toggleActiveViewBtn(this);
        displayRecords();
    });

    document.getElementById("readExcelBtn")?.addEventListener("click", function () {
        currentView = "excel";
        toggleActiveViewBtn(this);
        displayRecords();

        const fileInput = document.getElementById("excelFileInput");
        if (fileInput) {
            fileInput.value = ""; // Clear selection to trigger 'change' every time
            fileInput.click();
        }
    });

    document.getElementById("excelFileInput")?.addEventListener("change", readExcelFile);

    document.getElementById("searchInput")?.addEventListener("keyup", function () {
        let value = this.value.toLowerCase();
        let rows = document.querySelectorAll("#feeTable tbody tr");

        rows.forEach(function (row) {
            row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
        });
    });

    displayRecords();
});

function handleFeeTypeChange() {
    let value = this.value;
    document.getElementById("domainBox").style.display = value === "Internship Fee" ? "flex" : "none";
    document.getElementById("projectBox").style.display = value === "Project Fee" ? "flex" : "none";
}

function toggleActiveViewBtn(activeBtn) {
    document.getElementById("showFormRecordsBtn")?.classList.remove("view-btn-active");
    document.getElementById("readExcelBtn")?.classList.remove("view-btn-active");
    activeBtn?.classList.add("view-btn-active");
}

function loadFeeOptions() {
    let org = document.getElementById("organization").value;
    let feeType = document.getElementById("feeType");

    feeType.innerHTML = "<option value=''>Select Option</option>";
    document.getElementById("domainBox").style.display = "none";
    document.getElementById("projectBox").style.display = "none";

    if (org === "GT") {
        gtOptions.forEach(function (item) {
            feeType.innerHTML += `<option value="${item}">${item}</option>`;
        });
    } else if (org === "GA") {
        gaCourses.forEach(function (item) {
            feeType.innerHTML += `<option value="${item}">${item}</option>`;
        });
    }
}

// 2. Calculated balance and display error message if paid > total
function calculateBalance() {
    let totalInput = document.getElementById("totalFee");
    let paidInput = document.getElementById("paidFee");
    let errorText = document.getElementById("paidFeeError");

    let total = Number(totalInput.value) || 0;
    let paid = Number(paidInput.value) || 0;

    if (paidInput.value !== "" && paid > total) {
        errorText.style.display = "block";
        paidInput.classList.add("input-error");
        document.getElementById("balance").value = "0.00";
    } else {
        errorText.style.display = "none";
        paidInput.classList.remove("input-error");
        document.getElementById("balance").value = total - paid;
    }
}

function isDuplicateReceipt(receiptNo, excludeIndex = -1) {
    return feeRecords.some((record, index) => {
        if (index === excludeIndex) return false;
        return String(record.receiptNo).toLowerCase() === String(receiptNo).toLowerCase();
    });
}

function saveRecord() {
    let receiptNo = document.getElementById("receiptNo").value.trim();
    let studentId = document.getElementById("studentId").value.trim();
    let studentName = document.getElementById("studentName").value.trim();
    let email = document.getElementById("email").value.trim();
    let organization = document.getElementById("organization").value;
    let feeType = document.getElementById("feeType").value;
    let domain = document.getElementById("domain").value;
    let projectType = document.getElementById("projectType").value;

    let totalFee = Number(document.getElementById("totalFee").value) || 0;
    let paidFee = Number(document.getElementById("paidFee").value) || 0;
    let balance = Number(document.getElementById("balance").value) || (totalFee - paidFee);

    let paymentMode = document.getElementById("paymentMode").value;
    let paymentDate = document.getElementById("paymentDate").value;
    let remarks = document.getElementById("remarks").value.trim();

    // Check mandatory fields
    if (!receiptNo || !studentId || !studentName || !organization || !feeType || document.getElementById("totalFee").value === "" || document.getElementById("paidFee").value === "" || !paymentMode || !paymentDate) {
        alert("Please fill in all mandatory fields marked with (*).");
        return;
    }

    // Check if Paid Amount exceeds Total Fee
    if (paidFee > totalFee) {
        alert("Paid Amount cannot be greater than Total Fee.");
        return;
    }

    if (isDuplicateReceipt(receiptNo)) {
        alert(`Receipt Number '${receiptNo}' is already registered!`);
        return;
    }

    let status = balance === 0 ? "Paid" : "Pending";

    let record = {
        receiptNo,
        studentId,
        studentName,
        email,
        organization,
        feeType,
        domain,
        projectType,
        totalFee,
        paidFee,
        balance,
        paymentMode,
        paymentDate,
        remarks,
        status,
        source: "form"
    };

    feeRecords.push(record);
    localStorage.setItem("feeRecords", JSON.stringify(feeRecords));

    currentView = "form";
    toggleActiveViewBtn(document.getElementById("showFormRecordsBtn"));
    displayRecords();
    clearForm();

    alert("Fee Record Saved Successfully.");
}

function clearForm() {
    editIndex = -1;
    document.getElementById("receiptNo").value = "";
    document.getElementById("receiptNo").readOnly = false;
    document.getElementById("studentId").value = "";
    document.getElementById("studentName").value = "";
    document.getElementById("email").value = "";
    document.getElementById("organization").value = "";
    document.getElementById("feeType").innerHTML = "<option value=''>Select Organization First</option>";
    document.getElementById("domain").value = "";
    document.getElementById("projectType").value = "";
    document.getElementById("domainBox").style.display = "none";
    document.getElementById("projectBox").style.display = "none";
    document.getElementById("totalFee").value = "";
    document.getElementById("paidFee").value = "";
    document.getElementById("balance").value = "";
    document.getElementById("paymentMode").value = "";
    document.getElementById("remarks").value = "";
    document.getElementById("paymentDate").value = new Date().toISOString().split("T")[0];

    // Clear validation state
    document.getElementById("paidFeeError").style.display = "none";
    document.getElementById("paidFee").classList.remove("input-error");

    document.getElementById("saveBtn").style.display = "inline-block";
    document.getElementById("updateBtn").style.display = "none";
}

function displayRecords() {
    let tbody = document.querySelector("#feeTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    feeRecords.forEach(function (record, index) {
        let recordSource = record.source || "form";
        if (recordSource !== currentView) return;

        let actionButtons = recordSource === "excel" 
            ? `<button class="print-btn" onclick="printReceipt(${index})"><i class="fa-solid fa-print"></i></button>`
            : `<button class="edit-btn" onclick="editRecord(${index})"><i class="fa-solid fa-pen"></i></button>
               <button class="print-btn" onclick="printReceipt(${index})"><i class="fa-solid fa-print"></i></button>
               <button class="delete-btn" onclick="deleteRecord(${index})"><i class="fa-solid fa-trash"></i></button>`;

        tbody.innerHTML += `
        <tr>
            <td>${record.receiptNo}</td>
            <td>${record.studentId || "N/A"}</td>
            <td>${record.studentName}</td>
            <td>${record.organization}</td>
            <td>${record.feeType}</td>
            <td>₹${record.paidFee}</td>
            <td>₹${record.balance}</td>
            <td><span class="${record.status.toLowerCase() === "paid" ? "paid" : "pending"}">${record.status}</span></td>
            <td>${actionButtons}</td>
        </tr>
        `;
    });
}

// Global scope bindings for inline HTML handlers
window.editRecord = function (index) {
    editIndex = index;
    let record = feeRecords[index];

    document.getElementById("receiptNo").value = record.receiptNo;
    document.getElementById("receiptNo").readOnly = true;
    document.getElementById("studentId").value = record.studentId || "";
    document.getElementById("studentName").value = record.studentName;
    document.getElementById("email").value = record.email || "";
    document.getElementById("organization").value = record.organization || "";

    loadFeeOptions();

    document.getElementById("feeType").value = record.feeType || "";

    if (record.feeType === "Internship Fee") {
        document.getElementById("domainBox").style.display = "flex";
        document.getElementById("domain").value = record.domain || "";
    }
    if (record.feeType === "Project Fee") {
        document.getElementById("projectBox").style.display = "flex";
        document.getElementById("projectType").value = record.projectType || "";
    }

    document.getElementById("totalFee").value = record.totalFee;
    document.getElementById("paidFee").value = record.paidFee;
    document.getElementById("balance").value = record.balance;
    document.getElementById("paymentMode").value = record.paymentMode || "";
    document.getElementById("paymentDate").value = record.paymentDate;
    document.getElementById("remarks").value = record.remarks || "";

    calculateBalance();

    document.getElementById("saveBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "inline-block";

    window.scrollTo({ top: 0, behavior: "smooth" });
};

window.updateRecord = function () {
    if (editIndex === -1) return;

    let totalFee = Number(document.getElementById("totalFee").value);
    let paidFee = Number(document.getElementById("paidFee").value);

    if (paidFee > totalFee) {
        alert("Paid Amount cannot be greater than Total Fee.");
        return;
    }

    let balance = Number(document.getElementById("balance").value);

    feeRecords[editIndex] = {
        ...feeRecords[editIndex],
        studentId: document.getElementById("studentId").value.trim(),
        studentName: document.getElementById("studentName").value.trim(),
        email: document.getElementById("email").value.trim(),
        organization: document.getElementById("organization").value,
        feeType: document.getElementById("feeType").value,
        domain: document.getElementById("domain").value,
        projectType: document.getElementById("projectType").value,
        totalFee: totalFee,
        paidFee: paidFee,
        balance: balance,
        paymentMode: document.getElementById("paymentMode").value,
        paymentDate: document.getElementById("paymentDate").value,
        remarks: document.getElementById("remarks").value.trim(),
        status: balance === 0 ? "Paid" : "Pending"
    };

    localStorage.setItem("feeRecords", JSON.stringify(feeRecords));
    displayRecords();
    clearForm();
    alert("Record Updated Successfully.");
};

window.deleteRecord = function (index) {
    if (!confirm("Delete this fee record?")) return;
    feeRecords.splice(index, 1);
    localStorage.setItem("feeRecords", JSON.stringify(feeRecords));
    displayRecords();
};

window.printReceipt = function (index) {
    let record = feeRecords[index];

    document.getElementById("rReceiptNo").innerText = record.receiptNo;
    document.getElementById("rDate").innerText = record.paymentDate;
    document.getElementById("rStudentId").innerText = record.studentId || "N/A";
    document.getElementById("rStudent").innerText = record.studentName;
    document.getElementById("rEmail").innerText = record.email || "N/A";
    document.getElementById("rOrganization").innerText = record.organization === "GT" ? "Ganishka Technology (GT)" : (record.organization === "GA" ? "Ganishka Academy (GA)" : record.organization);
    document.getElementById("rFeeType").innerText = record.feeType;

    if (record.domain) {
        document.getElementById("domainRow").style.display = "flex";
        document.getElementById("rDomain").innerText = record.domain;
    } else {
        document.getElementById("domainRow").style.display = "none";
    }

    if (record.projectType) {
        document.getElementById("projectRow").style.display = "flex";
        document.getElementById("rProjectType").innerText = record.projectType;
    } else {
        document.getElementById("projectRow").style.display = "none";
    }

    document.getElementById("rTotalFee").innerText = Number(record.totalFee || 0).toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById("rPaidFee").innerText = Number(record.paidFee || 0).toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById("rBalance").innerText = Number(record.balance || 0).toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById("rPaymentMode").innerText = record.paymentMode || "Cash";

    let statusEl = document.getElementById("rStatus");
    statusEl.innerText = record.status;
    statusEl.className = "status-pill " + (record.status.toLowerCase() === "paid" ? "paid" : "pending");

    document.getElementById("rRemarks").innerText = record.remarks || "N/A";

    window.print();
};

function readExcelFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet);

            if (json.length === 0) {
                alert("The selected Excel file is empty.");
                return;
            }

            feeRecords = feeRecords.filter(record => record.source !== "excel");
            let importedCount = 0;

            json.forEach((rawRow) => {
                let row = {};
                Object.keys(rawRow).forEach(key => {
                    row[key.trim()] = rawRow[key];
                });

                let receiptNo = String(row["Receipt No"] || row["ReceiptNo"] || "").trim();
                let studentName = String(row["Student Name"] || row["Name"] || "").trim();
                if (!receiptNo || !studentName) return;

                let paidFee = Number(row["Paid Amount"] || row["Paid"] || row["Amount Paid"] || 0);
                let balance = Number(row["Balance"] || 0);
                let totalFee = Number(row["Total Fee"] || (paidFee + balance));

                let status = String(row["Status"] || "").trim();
                if (!status) {
                    status = balance === 0 ? "Paid" : "Pending";
                }

                let record = {
                    receiptNo,
                    studentId: String(row["Student ID"] || row["StudentID"] || row["ID"] || "").trim(),
                    studentName,
                    email: String(row["Email"] || "").trim(),
                    organization: String(row["Organization"] || "GT").trim(),
                    feeType: String(row["Fee Type/Course"] || row["Fee Type"] || row["Course"] || "Course").trim(),
                    domain: String(row["Domain"] || "").trim(),
                    projectType: String(row["Project Type"] || "").trim(),
                    totalFee,
                    paidFee,
                    balance,
                    paymentMode: String(row["Payment Mode"] || "Cash").trim(),
                    paymentDate: String(row["Payment Date"] || new Date().toISOString().split("T")[0]).trim(),
                    remarks: String(row["Remarks"] || "Excel Import").trim(),
                    status,
                    source: "excel"
                };

                feeRecords.push(record);
                importedCount++;
            });

            localStorage.setItem("feeRecords", JSON.stringify(feeRecords));
            displayRecords();
            alert(`Excel data imported successfully! ${importedCount} records loaded.`);

        } catch (error) {
            alert("Error reading Excel file.");
        }
        e.target.value = "";
    };
    reader.readAsArrayBuffer(file);
}