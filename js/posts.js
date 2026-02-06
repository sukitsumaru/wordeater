const postContainer = document.getElementById('post-content');
let posts = [];
let loadedCount = 0;
const POSTS_PER_PAGE = 5;
const loadedFiles = new Set();

const isHomepage = location.pathname === '/';
const params = new URLSearchParams(location.search);
const permalinkFile = params.get('file');

// Fetch all posts
fetch('posts/index.json')
  .then(res => res.json())
  .then(list => {
    // Fetch each post to extract its date for sorting
    const postPromises = list.map(file =>
      fetch(`posts/${file}`)
        .then(res => res.text())
        .then(text => {
          const lines = text.split('\n');
          const date = lines[1]?.replace(/[\[\]]/g, '') || '1970-01-01';
          return { file, date: new Date(date) };
        })
    );

    Promise.all(postPromises).then(postData => {
      // Sort by date, newest first
      posts = postData.sort((a, b) => b.date - a.date).map(p => p.file);

      if (permalinkFile && posts.includes(permalinkFile)) {
        loadPost(permalinkFile, false);
      } else if (isHomepage) {
        fetch('posts/home.txt')
          .then(res => res.text())
          .then(text => {
            postContainer.innerHTML = `<div class="post">${text}</div>`;
          });
      } else {
        loadNextPosts();
      }
    });
  });

// Load next batch for infinite scroll
function loadNextPosts() {
  const nextPosts = posts.slice(loadedCount, loadedCount + POSTS_PER_PAGE);
  nextPosts.forEach(file => {
    if (!loadedFiles.has(file)) {
      loadPost(file, true);
      loadedFiles.add(file);
    }
  });
  loadedCount += nextPosts.length;
}

// Load and render a single post
function loadPost(file, append = false) {
  if (loadedFiles.has(file) && append) return;

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
        <h2><a href="?file=${file}">${title}</a></h2>
        <div class="post-date">${date}</div>
        <div class="post-body">${content}</div>
      `;

      if (append) {
        postContainer.appendChild(postEl);
      } else {
        postContainer.innerHTML = '';
        postContainer.appendChild(postEl);
      }

      loadedFiles.add(file);
    });
}

// Infinite scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && loadedCount < posts.length) {
    loadNextPosts();
  }
});

// Dark mode toggle
document.querySelectorAll('.dark-mode-toggle, #dark-mode-toggle').forEach(btn => {
  btn.addEventListener('click', () => document.body.classList.toggle('dark'));
});
