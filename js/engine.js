document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById('posts');
    if (!container) return;

    const initialChunk = 10;
    const scrollChunk = 5;
    let rendered = 0;

    // Determine language
    const lang = localStorage.getItem("lang") || 
        (navigator.language.startsWith("tr") ? "tr" : "en");

    // Determine page type (normalize root to index.html)
    let page = window.location.pathname.split("/").pop();
    if (!page) {
        page = "index.html";
    }

    // Fetch language-specific JSON
    const response = await fetch(`/posts/posts.${lang}.json`);
    let data = await response.json();

    // Filter posts based on page
    if (page === "index.html") {
        data = data.filter(p => isNaN(Number(p.id)));
    } else if (page === "home.html") {
        data = data.filter(p => !isNaN(Number(p.id)));
    }

    // Sort newest first
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    function renderChunk(size) {
        const next = data.slice(rendered, rendered + size);

        next.forEach(post => {
            const div = document.createElement('div');
            div.className = (page === "index.html") ? 'alpha-post' : 'post';

            // Handle images
            let formattedContent = post.content.replace(
                /<img\s+([^>]+)>/gi,
                '<img $1 style="width: calc(100% + 32px); margin-left: -16px; margin-right: -16px;">'
            );

            // Only numerical posts get extra spacing
            if (page === "home.html") {
                formattedContent = formattedContent
                    .replace(/<br\s*\/?>/gi, '<br><br>')
                    .replace(/(<img[^>]*>)<br><br>/gi, '$1<br>');
            }

            if (page === "index.html") {
                div.innerHTML = `
                    <div class="post-date">${new Date(post.date).toDateString()}</div>
                    <div class="post-body">${formattedContent}</div>
                `;
            } else {
                let tagsHtml = '';
                if (post.tags) {
                    tagsHtml = post.tags
                        .split(',')
                        .map(t =>
                            `<a href="navigator.html?tag=%23${t.trim()}" class="post-tag">#${t.trim()}</a>`
                        )
                        .join(' ') + ' - ';
                }

                div.innerHTML = `
                    <h2><a href="navigator.html?id=${post.id}">${post.title}</a></h2>
                    <div class="post-body">${formattedContent}</div>
                    <div class="post-date" style="text-align:right;">
                        ${tagsHtml}${new Date(post.date).toDateString()}
                    </div>
                `;
            }

            container.appendChild(div);
        });

        rendered += next.length;
    }

    // Initial render
    renderChunk(initialChunk);

    // Lazy load on scroll
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            if (rendered < data.length) {
                renderChunk(scrollChunk);
            }
        }
    });
});
