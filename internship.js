const STORAGE_KEY = "certificate_history";
let loadedGuideSignatureBase64 = "";

document.addEventListener("DOMContentLoaded", function () {
    const isPreview = checkPreviewMode();
    // Only auto-generate new IDs if not in preview/edit mode from history
    if (!isPreview) {
        generateNextIds();
    }
});

function formatDate(dateString) {
    if (!dateString) return "";
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
}

// Uploads and previews the guide signature dynamically
function uploadGuideSignature(event) {
    const file = event.target.files[0];
    const signImg = document.getElementById("guideSignImg");
    const placeholder = document.getElementById("signPlaceholder");

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            loadedGuideSignatureBase64 = e.target.result;
            signImg.src = loadedGuideSignatureBase64;
            signImg.style.display = "inline-block";
            if (placeholder) placeholder.style.display = "none";
        };
        reader.readAsDataURL(file);
    }
}

// Resets signature preview and input field
function clearGuideSignature() {
    const input = document.getElementById("guideSignatureInput");
    const signImg = document.getElementById("guideSignImg");
    const placeholder = document.getElementById("signPlaceholder");

    input.value = "";
    loadedGuideSignatureBase64 = "";
    signImg.src = "";
    signImg.style.display = "none";
    if (placeholder) placeholder.style.display = "block";
}

// Helper: Verify if student's full fee is paid using BOTH Student ID and Student Name
function verifyFeeStatus(studentId, studentName) {
    let feeRecords = JSON.parse(localStorage.getItem("feeRecords")) || [];
    
    // Find matching student by both ID and Name (case-insensitive)
    let studentFeeRecord = feeRecords.find(record => {
        let matchId = record.studentId && record.studentId.trim().toLowerCase() === studentId.trim().toLowerCase();
        let matchName = record.studentName && record.studentName.trim().toLowerCase() === studentName.trim().toLowerCase();
        return matchId && matchName;
    });

    if (!studentFeeRecord) {
        return { 
            isPaid: false, 
            message: `No fee record found for Student ID "${studentId}" and Name "${studentName}". Please add the fee record first.` 
        };
    }

    if (studentFeeRecord.balance > 0 || studentFeeRecord.status !== "Paid") {
        return { 
            isPaid: false, 
            message: `Cannot generate certificate! Student "${studentName}" (ID: ${studentId}) has a pending fee balance of ₹${studentFeeRecord.balance}.` 
        };
    }

    return { isPaid: true, message: "Fee payment verified." };
}

// Auto-generates unique Certificate No (GT2026001+) and Student ID (STU001+)
function generateNextIds() {
    let history = getHistoryFromStorage();

    // Generate unique Certificate Number
    let certNum = 1;
    let certId = "";
    do {
        certId = "GT2026" + String(certNum).padStart(3, '0');
        certNum++;
    } while (history.some(item => item.certificateNo.toLowerCase() === certId.toLowerCase()));

    // Generate unique Student ID
    let stuNum = 1;
    let stuId = "";
    do {
        stuId = "STU" + String(stuNum).padStart(3, '0');
        stuNum++;
    } while (history.some(item => item.id.toLowerCase() === stuId.toLowerCase()));

    document.getElementById("certificateNo").value = certId;
    document.getElementById("id").value = stuId;
}

// Generates the certificate output
function generateCertificate(isAutoPreview = false) {
    let certificateNo = document.getElementById("certificateNo").value.trim();
    let id = document.getElementById("id").value.trim();
    let name = document.getElementById("name").value.trim();
    let college = document.getElementById("college").value.trim();
    let domain = document.getElementById("domain").value.trim();
    let start = document.getElementById("start").value;
    let end = document.getElementById("end").value;
    let issue = document.getElementById("issue").value;

    if (!certificateNo || !id || !name || !college || !domain || !start || !end || !issue) {
        alert("Please fill all the details before generating the certificate.");
        return;
    }

    // FEE PAYMENT VERIFICATION CHECK (Checking both Student ID & Name)
    if (!isAutoPreview) {
        let feeVerification = verifyFeeStatus(id, name);
        if (!feeVerification.isPaid) {
            alert(feeVerification.message);
            return; // Stops certificate generation
        }
    }

    // Check Duplication (Skip check if previewing from history)
    let history = getHistoryFromStorage();
    if (!isAutoPreview) {
        let certExists = history.some(item => item.certificateNo.toLowerCase() === certificateNo.toLowerCase());
        let studentExists = history.some(item => item.id.toLowerCase() === id.toLowerCase());

        if (certExists) {
            alert(`Error: Certificate Number "${certificateNo}" already exists in the history!`);
            generateNextIds();
            return;
        }

        if (studentExists) {
            alert(`Error: Student ID "${id}" already has a generated certificate in the history!`);
            generateNextIds();
            return;
        }
    }

    document.getElementById("certNo").textContent = certificateNo;
    document.getElementById("studentName").textContent = name.toUpperCase();

    document.getElementById("output").innerHTML =
        "(Student ID: <b>" + id + "</b>) from <b>" + college +
        "</b> for successfully completing the internship in <b>" + domain +
        "</b> at <b>Ganishka Technology</b>.<br><br>" +
        "The internship was conducted from <b>" + formatDate(start) + "</b> to <b>" +
        formatDate(end) + "</b>. During this period, the student demonstrated excellent technical knowledge, dedication, professionalism, teamwork, and a strong willingness to learn. We appreciate the sincere efforts and wish them continued success in their academic journey and future career." +
        "<br><br><b>Date of Issue :</b> " + formatDate(issue);

    const certificateRecord = {
        certificateNo: certificateNo,
        id: id,
        name: name,
        college: college,
        domain: domain,
        start: start,
        end: end,
        issue: issue,
        signatureImg: loadedGuideSignatureBase64,
        savedAt: new Date().toISOString()
    };

    saveRecordToHistory(certificateRecord);
    
    if (!isAutoPreview) {
        // Automatically update the main dashboard metric counter
        updateDashboardCertificateMetric();
        alert("Certificate generated successfully! Fee status verified as PAID.");
        
        // Prepare IDs for the next certificate creation
        generateNextIds();
    }
}

// Check if page was opened from History View/Print button
function checkPreviewMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");

    if (mode === "preview") {
        const previewDataRaw = localStorage.getItem("preview_certificate");
        if (previewDataRaw) {
            const data = JSON.parse(previewDataRaw);

            // Auto fill all inputs
            document.getElementById("certificateNo").value = data.certificateNo || "";
            document.getElementById("id").value = data.id || "";
            document.getElementById("name").value = data.name || "";
            document.getElementById("college").value = data.college || "";
            document.getElementById("domain").value = data.domain || "";
            document.getElementById("start").value = data.start || "";
            document.getElementById("end").value = data.end || "";
            document.getElementById("issue").value = data.issue || "";

            // Restore signature image if present
            if (data.signatureImg) {
                loadedGuideSignatureBase64 = data.signatureImg;
                const signImg = document.getElementById("guideSignImg");
                const placeholder = document.getElementById("signPlaceholder");
                signImg.src = data.signatureImg;
                signImg.style.display = "inline-block";
                if (placeholder) placeholder.style.display = "none";
            }

            // Generate output automatically
            generateCertificate(true);
            return true;
        }
    }
    return false;
}

// Storage operations
function saveRecordToHistory(record) {
    let history = getHistoryFromStorage();
    const existingIndex = history.findIndex(item => item.certificateNo === record.certificateNo);

    if (existingIndex > -1) {
        history[existingIndex] = record;
    } else {
        history.unshift(record);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function getHistoryFromStorage() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Helper: Automatically updates the dashboard metric counter
function updateDashboardCertificateMetric() {
    const dashboardKey = 'ganishka_dashboard_data';
    const savedData = localStorage.getItem(dashboardKey);
    const data = savedData ? JSON.parse(savedData) : { interns: 342, payments: 14 };

    // Increment certificate count
    data.interns = (data.interns || 0) + 1;

    // Save updated count back to localStorage
    localStorage.setItem(dashboardKey, JSON.stringify(data));
}