document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById('posts');
    let rendered = 0;
    const initialChunk = 10;
    const scrollChunk = 5;

    // Fetch posts from JSON
    const response = await fetch('posts.json');
    let data = await response.json();

    // Remove post with id=0
    data = data.filter(post => post.id !== 0);

    // Sort posts newest first
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    function renderChunk(size) {
        const next = data.slice(rendered, rendered + size);
        next.forEach(post => {
            const div = document.createElement('div');
            div.className = 'post';
            div.innerHTML = `
                <h2><a href="navigator.html?id=${post.id}">${post.title}</a></h2>
                <div class="post-date">${new Date(post.date).toDateString()}</div>
                <div class="post-body">${post.content}</div>
            `;
            container.appendChild(div);
        });
        rendered += next.length;
    }

    renderChunk(initialChunk);

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            if (rendered < data.length) {
                renderChunk(scrollChunk);
            }
        }
    });
});
