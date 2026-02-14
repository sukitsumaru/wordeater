// lang-detect.js
document.addEventListener("DOMContentLoaded", () => {
    // Initialize language preference if not set
    let lang = localStorage.getItem("lang");
    if (!lang) {
        lang = navigator.language.startsWith("tr") ? "tr" : "en";
        localStorage.setItem("lang", lang);
    }

    // Language toggle buttons
    const toggles = document.querySelectorAll(".lang-toggle");
    toggles.forEach(btn => {
        btn.textContent = lang.toUpperCase(); // show current language
        btn.addEventListener("click", () => {
            const newLang = (localStorage.getItem("lang") === "tr") ? "en" : "tr";
            localStorage.setItem("lang", newLang);
            window.location.reload();
        });
    });
});
