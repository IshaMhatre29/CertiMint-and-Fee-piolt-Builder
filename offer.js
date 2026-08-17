document.addEventListener("DOMContentLoaded", function () {

    /**
     * Reads form fields and updates the offer letter preview live.
     */
    function generateDocument() {
        // Retrieve field values with fallback defaults
        const offerNo = document.getElementById("offerNo")?.value.trim() || "GT/2026/OFFER-001";
        const studentName = document.getElementById("studentName")?.value.trim() || "Ganesh Sharma";
        const internRole = document.getElementById("internRole")?.value.trim() || "Web Developer Intern";
        const guideName = document.getElementById("guideName")?.value.trim() || "Er. Rajesh Verma";
        const companyName = document.getElementById("companyName")?.value.trim() || "Ganishka Technology";
        const startDate = document.getElementById("startDate")?.value || "";
        const endDate = document.getElementById("endDate")?.value || "";

        // Helper DOM updater
        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };

        // Inject data into letter template
        setText("pOfferNo", offerNo);
        setText("pStudentName", studentName);
        setText("pAcceptName", studentName);
        setText("pRole", internRole);
        setText("pGuide", guideName);
        setText("pCompanyName", companyName);
        setText("pCompanyHeader", companyName.toUpperCase());

        // Format and render internship duration
        const durationText = (startDate && endDate) ? `${startDate} to ${endDate}` : "Start Date - End Date";
        setText("pDuration", durationText);
    }

    // Attach real-time input event listeners to form fields
    const formInputs = document.querySelectorAll("#offerForm input");
    formInputs.forEach(input => {
        input.addEventListener("input", generateDocument);
    });

    // Expose functions globally to support button inline onclick calls
    window.generateDocument = generateDocument;
    window.generateLetter = generateDocument; // Alias to prevent undefined reference errors
});