// ==========================================
// Ganishka Academy Dashboard JavaScript
// ==========================================

// Open Course Completion Certificate Module
function openCertificate() {

    window.location.href = "course-certificate.html";

}

// Open Certificate History Module
function openHistory() {

    window.location.href = "certificate-history.html";

}

// Logout
function logout() {

    let confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        window.location.href = "index.html";

    }

}

// Card Hover Effect
const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-10px)";
        card.style.transition = "0.3s";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

});

// Welcome Message
window.onload = function () {

    console.log("Welcome to Ganishka Academy Dashboard");

};