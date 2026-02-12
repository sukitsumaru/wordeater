// Dark mode toggle logic moved from HTML
const darkButtons = document.querySelectorAll('.dark-mode-toggle');

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    if (document.body.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

darkButtons.forEach(btn => {
    btn.addEventListener('click', toggleDarkMode);
});
