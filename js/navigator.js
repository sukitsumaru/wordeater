document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");
    const tagParam = params.get("tag");

    const container = document.getElementById("posts");
    const prevBtn = document.getElementById("prev-post");
    const nextBtn = document.getElementById("next-post");
    const indexBtn = document.getElementById("index-btn");
    const reverseBtn = document.getElementById("reverse-btn");

    const overlay = document.getElementById("tree-overlay");
    const treeContainer = document.getElementById("tree-container");

    const lang = localStorage.getItem("lang") || 
        (navigator.language.startsWith("tr") ? "tr" : "en");

    const response = await fetch(`posts/posts.${lang}.json`);
    const posts = await response.json();

    const sortedPosts = [...posts].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    function createPostDiv(post) {
        const tagsHtml = post.tags
            ? post.tags.split(',')
                .map(t => `<a href="navigator.html?tag=%23${t.trim()}" class="post-tag">#${t.trim()}</a>`)
                .join(' ') + ' - '
            : '';

        const div = document.createElement("div");
        div.className = "post";

        let formattedContent = post.content
            .replace(/<img\s+([^>]+)>/gi,
                '<img $1 style="width: calc(100% + 32px); margin-left: -16px; margin-right: -16px;">')
            .replace(/<br\s*\/?>/gi, '<br><br>')
            .replace(/(<img[^>]*>)<br><br>/gi, '$1<br>');

        div.innerHTML = `
            <h2><a href="navigator.html?id=${post.id}">${post.title}</a></h2>
            <div class="post-date">${tagsHtml}${new Date(post.date).toDateString()}</div>
            <div class="post-body">${formattedContent}</div>
        `;
        return div;
    }

    function renderPost(index) {
        const post = sortedPosts[index];
        if (!post) return;
        container.innerHTML = "";
        container.appendChild(createPostDiv(post));
    }

    function renderPostsByTag(tag, reverse = false) {
        const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag;
        container.innerHTML = "";

        let matched = sortedPosts.filter(p =>
            p.tags &&
            p.tags.split(',').map(t => t.trim()).includes(cleanTag)
        );

        if (reverse) matched = matched.reverse();

        matched.forEach(post =>
            container.appendChild(createPostDiv(post))
        );
    }

    function buildTree() {
        treeContainer.innerHTML = "";
        const years = {};

        sortedPosts.forEach(post => {
            const year = new Date(post.date).getFullYear();

            if (!years[year]) {
                const yDiv = document.createElement("div");
                yDiv.textContent = year;
                yDiv.className = "year";

                const yearPosts = document.createElement("div");
                yearPosts.style.display = "none";
                years[year] = yearPosts;

                yDiv.onclick = () => {
                    yearPosts.style.display =
                        yearPosts.style.display === "none" ? "block" : "none";
                };

                treeContainer.appendChild(yDiv);
                treeContainer.appendChild(yearPosts);
            }

            const pDiv = document.createElement("div");
            pDiv.className = "post-item";
            pDiv.innerHTML = post.title;

            if (post.tags) {
                const tagsSpan = document.createElement("span");
                tagsSpan.style.float = "right";
                tagsSpan.style.fontSize = "0.8em";
                tagsSpan.style.color = "#aaa";
                tagsSpan.textContent = post.tags
                    .split(',')
                    .map(t => `#${t.trim()}`)
                    .join(' ');
                pDiv.appendChild(tagsSpan);
            }

            pDiv.onclick = () => {
                window.location.href = `navigator.html?id=${post.id}`;
            };

            years[year].appendChild(pDiv);
        });
    }

    // FIX: normalize ID comparison to string
    let currentIndex = sortedPosts.findIndex(p =>
        String(p.id) === String(postId)
    );

    if (currentIndex === -1) currentIndex = 0;

    if (prevBtn) {
        prevBtn.onclick = () => {
            if (currentIndex < sortedPosts.length - 1) {
                const nextPost = sortedPosts[currentIndex + 1];
                window.location.href = `navigator.html?id=${nextPost.id}`;
            }
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            if (currentIndex > 0) {
                const prevPost = sortedPosts[currentIndex - 1];
                window.location.href = `navigator.html?id=${prevPost.id}`;
            }
        };
    }

    if (indexBtn) {
        indexBtn.onclick = () => {
            buildTree();
            overlay.style.display = "block";
        };
    }

    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.style.display = "none";
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay) {
            overlay.style.display = "none";
        }
    });

    if (tagParam && reverseBtn) {
        reverseBtn.style.display = "inline-block";
        let isReversed = false;

        reverseBtn.onclick = () => {
            isReversed = !isReversed;
            renderPostsByTag(tagParam, isReversed);
            reverseBtn.textContent =
                `Reverse Order (${isReversed ? 'Old → New' : 'New → Old'})`;
        };
    }

    if (tagParam) {
        renderPostsByTag(tagParam);
    } else if (postId) {
        renderPost(currentIndex);
    } else {
        renderPost(0);
    }
});
