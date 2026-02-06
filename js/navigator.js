document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");

    const container = document.getElementById("posts");
    const prevBtn = document.getElementById("prev-post");
    const nextBtn = document.getElementById("next-post");
    const indexBtn = document.getElementById("index-btn");
    const homeBtn = document.getElementById("home-btn");

    const overlay = document.getElementById("tree-overlay");
    const treeContainer = document.getElementById("tree-container");

    // Fetch posts
    const response = await fetch('posts.json');
    const posts = await response.json();

    // Sort posts newest first
    const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    let currentIndex = sortedPosts.findIndex(p => p.id === Number(postId));
    if (currentIndex === -1) currentIndex = 0;

    // Render current post
    function renderPost(index) {
        const post = sortedPosts[index];
        if (!post) return;

        container.innerHTML = `
            <div class="post">
                <h2><a href="navigator.html?id=${post.id}">${post.title}</a></h2>
                <div class="post-date">${new Date(post.date).toDateString()}</div>
                <div class="post-body">${post.content}</div>
            </div>
        `;
        currentIndex = index;
    }

    // Build tree overlay
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
                    yearPosts.style.display = yearPosts.style.display === "none" ? "block" : "none";
                };

                treeContainer.appendChild(yDiv);
                treeContainer.appendChild(yearPosts);
            }

            const pDiv = document.createElement("div");
            pDiv.textContent = post.title;
            pDiv.className = "post-item";
            pDiv.onclick = () => {
                window.location.href = `navigator.html?id=${post.id}`;
            };

            years[year].appendChild(pDiv);
        });
    }

    // Navigation buttons (reload page with next/prev post id)
    prevBtn.onclick = () => {
        // "Previous" = older post
        if (currentIndex < sortedPosts.length - 1) {
            const nextPost = sortedPosts[currentIndex + 1];
            window.location.href = `navigator.html?id=${nextPost.id}`;
        }
    };

    nextBtn.onclick = () => {
        // "Next" = newer post
        if (currentIndex > 0) {
            const prevPost = sortedPosts[currentIndex - 1];
            window.location.href = `navigator.html?id=${prevPost.id}`;
        }
    };

    indexBtn.onclick = () => {
        buildTree();
        overlay.style.display = "block";
    };

    homeBtn.onclick = () => {
        window.location.href = "index.html";
    };

    // Close overlay on click outside
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.style.display = "none";
    });

    // Close overlay on Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") overlay.style.display = "none";
    });

    // Initial render
    renderPost(currentIndex);
});
