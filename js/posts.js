const postContainer = document.getElementById('post-content');
let posts = [];
let loadedCount = 0;
const POSTS_PER_PAGE = 5;

// Fetch index.json and initialize post loading
fetch('posts/index.json')
  .then(res => res.json())
  .then(list => {
    // Sort numerically by filename prefix, newest first
    posts = list.slice().sort((a, b) => parseInt(b.split('-')[0], 10) - parseInt(a.split('-')[0], 10));
    
    // Check if a specific post is requested via URL
    const params = new URLSearchParams(location.search);
    const postFile = params.get('file');
    if (postFile && posts.includes(postFile)) {
      loadPost(postFile, false);
    } else {
      loadNextPosts(); // Load initial batch
    }
  });

// Load next batch of posts for infinite scroll
function loadNextPosts() {
  const nextPosts = posts.slice(loadedCount, loadedCount + POSTS_PER_PAGE);
  nextPosts.forEach(file => loadPost(file, true));
  loadedCount += nextPosts.length;
}

// Fetch and render a single post
function loadPost(file, append = false) {
  fetch(`posts/${file}`)
    .then(res => res.text())
    .then(text => {
      const lines = text.split('\n');
      const title = lines[0] || '';
      const date = lines[1]?.replace(/[\[\]]/g, '') || '';
      const content = lines.slice(2).join('\n');

      const postEl = document.createElement('div');
      postEl.className = 'post';
      postEl.innerHTML = `
        <h2>${title}</h2>
        <div class="post-date">${date}</div>
        <div class="post-body">${content}</div>
      `;

      if (append) {
        postContainer.appendChild(postEl);
      } else {
        postContainer.innerHTML = '';
        postContainer.appendChild(postEl);
      }
    });
}

// Infinite scroll: load more posts when near bottom
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    if (loadedCount < posts.length) {
      loadNextPosts();
    }
  }
});

// For homepage only: fetch home.txt
fetch('posts/home.txt')
  .then(res => res.text())
  .then(text => {
    const postContainer = document.getElementById('post-content');
    postContainer.innerHTML = `<div class="post">${text}</div>`;
  });

  const toggle = document.getElementById('dark-mode-toggle');

toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});


document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
});
