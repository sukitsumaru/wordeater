const postContainer = document.getElementById('post-content');

// Create month index container above posts
const monthContainer = document.createElement('div');
monthContainer.id = 'month-index';
monthContainer.style.marginBottom = '20px';
document.querySelector('.main').insertBefore(monthContainer, postContainer);

let posts = [];
let groupedPosts = {};
let currentIndex = 0;

// Only load home.txt if on true homepage
const isHomepage = location.pathname === '/';
if (isHomepage) {
  fetch('posts/home.txt')
    .then(res => res.text())
    .then(text => {
      postContainer.innerHTML = `<div class="post">${text}</div>`;
    });
}

// Determine requested post from pathname (permalink SPA)
let requestedPost = location.pathname.slice(1); // remove leading '/'

// Fetch index.json and posts
fetch('posts/index.json')
  .then(res => res.json())
  .then(list => {
    return Promise.all(list.map(file =>
      fetch(`posts/${file}`).then(res => res.text()).then(text => {
        const lines = text.split('\n');
        const dateLine = lines[1] || '';
        const dateMatch = dateLine.match(/\d{4}-\d{2}-\d{2}/);
        const date = dateMatch ? new Date(dateMatch[0]) : new Date(0);
        return {file, text, date};
      })
    ));
  })
  .then(postData => {
    postData.sort((a, b) => b.date - a.date);
    posts = postData.map(p => p.file);

    // Group by month
    groupedPosts = {};
    postData.forEach(({file, text, date}) => {
      const ym = date.toISOString().slice(0, 7);
      if (!groupedPosts[ym]) groupedPosts[ym] = [];
      groupedPosts[ym].push({file, text});
    });

    renderMonthIndex();

    // Load initial post
    let initialIndex = 0;
    if (requestedPost && posts.includes(requestedPost)) {
      initialIndex = posts.indexOf(requestedPost);
    } else {
      const savedIndex = parseInt(localStorage.getItem('navigator-current'), 10);
      if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < posts.length) {
        initialIndex = savedIndex;
      }
    }

    currentIndex = initialIndex;
    if (posts.length) loadPost(currentIndex);
  });

// Render month index at top
function renderMonthIndex() {
  monthContainer.innerHTML = '';
  monthContainer.style.color = 'white';
  monthContainer.style.marginBottom = '10px';
  monthContainer.style.fontFamily = 'Verdana, sans-serif';
  monthContainer.style.fontSize = '14px';

  Object.keys(groupedPosts)
    .sort((a, b) => b.localeCompare(a))
    .forEach(ym => {
      const monthEl = document.createElement('div');
      monthEl.style.marginBottom = '3px';
      monthContainer.appendChild(monthEl);
    });
}

// Load a single post by index
function loadPost(index) {
  const file = posts[index];
  fetch(`posts/${file}`)
    .then(res => res.text())
    .then(text => {
      postContainer.innerHTML = `<div class="post">${text}</div>`;
      localStorage.setItem('navigator-current', index);
      // Update URL for permalink SPA
      history.replaceState({file}, '', `/${file}`);
    });
}

// Previous / Next buttons
document.getElementById('prev-post').addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    loadPost(currentIndex);
  }
});

document.getElementById('next-post').addEventListener('click', () => {
  if (currentIndex < posts.length - 1) {
    currentIndex++;
    loadPost(currentIndex);
  }
});

// Dark mode toggle
const darkButtons = document.querySelectorAll('.dark-mode-toggle');
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}
darkButtons.forEach(btn => btn.addEventListener('click', toggleDarkMode));

// ===== INDEX BUTTON & POPUP =====
const postNavContainer = document.querySelector('.main');
const postContainerEl = document.getElementById('post-content');

const indexBtn = document.createElement('button');
indexBtn.id = 'index-post';
indexBtn.textContent = 'Index';
indexBtn.style.padding = '5px 10px';
indexBtn.style.margin = '0 5px';

const prevBtn = document.getElementById('prev-post');
const nextBtn = document.getElementById('next-post');
if (prevBtn && nextBtn) prevBtn.insertAdjacentElement('afterend', indexBtn);

// ===== INDEX POPUP MENU =====
const indexPopup = document.createElement('div');
indexPopup.id = 'index-popup';
indexPopup.style.position = 'fixed';
indexPopup.style.top = '0';
indexPopup.style.left = '0';
indexPopup.style.width = '100%';
indexPopup.style.height = '100%';
indexPopup.style.backgroundColor = 'rgba(0,0,0,0.85)';
indexPopup.style.display = 'none';
indexPopup.style.zIndex = '200';
indexPopup.style.fontFamily = 'Verdana, sans-serif';
indexPopup.style.overflowY = 'auto';
document.body.appendChild(indexPopup);

const contentBox = document.createElement('div');
contentBox.style.background = '#111';
contentBox.style.border = '1px solid white';
contentBox.style.borderRadius = '8px';
contentBox.style.color = 'white';
contentBox.style.maxWidth = '700px';
contentBox.style.minWidth = '400px';
contentBox.style.margin = '50px auto';
contentBox.style.padding = '20px';
contentBox.style.display = 'flex';
contentBox.style.flexDirection = 'column';
contentBox.style.gap = '5px';
indexPopup.appendChild(contentBox);

const listContainer = document.createElement('div');
listContainer.style.maxHeight = '70vh';
listContainer.style.overflowY = 'auto';
contentBox.appendChild(listContainer);

const closePopup = document.createElement('button');
closePopup.textContent = 'Close';
closePopup.style.padding = '8px 16px';
closePopup.style.margin = '10px auto 0 auto';
closePopup.style.border = '1px solid white';
closePopup.style.borderRadius = '5px';
closePopup.style.background = '#000';
closePopup.style.color = 'white';
closePopup.style.cursor = 'pointer';
indexPopup.appendChild(closePopup);

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function renderIndexPopup() {
  listContainer.innerHTML = '';

  const yearGroups = {};
  Object.keys(groupedPosts).forEach(ym => {
    const [year, month] = ym.split('-');
    if (!yearGroups[year]) yearGroups[year] = {};
    yearGroups[year][month] = groupedPosts[ym];
  });

  Object.keys(yearGroups).sort((a,b)=>b-a).forEach(year => {
    const yearEl = document.createElement('div');
    yearEl.style.fontWeight = 'bold';
    yearEl.style.margin = '10px 0 5px 0';
    yearEl.style.cursor = 'pointer';
    yearEl.style.display = 'flex';
    yearEl.style.alignItems = 'center';

    const triangle = document.createElement('span');
    triangle.textContent = '▼';
    triangle.style.marginRight = '5px';
    yearEl.appendChild(triangle);

    const yearText = document.createElement('span');
    yearText.textContent = year;
    yearEl.appendChild(yearText);
    listContainer.appendChild(yearEl);

    const monthContainer = document.createElement('div');
    monthContainer.style.display = 'flex';
    monthContainer.style.flexDirection = 'column';
    monthContainer.style.marginLeft = '15px';
    listContainer.appendChild(monthContainer);

    yearEl.addEventListener('click', () => {
      if (monthContainer.style.display === 'none') {
        monthContainer.style.display = 'flex';
        triangle.textContent = '▼';
      } else {
        monthContainer.style.display = 'none';
        triangle.textContent = '►';
      }
    });

    Object.keys(yearGroups[year]).sort((a,b)=>b-a).forEach(monthNum => {
      const monthEl = document.createElement('div');
      monthEl.style.fontWeight = 'bold';
      monthEl.style.margin = '5px 0 2px 0';
      monthEl.textContent = monthNames[parseInt(monthNum,10)-1];
      monthContainer.appendChild(monthEl);

      yearGroups[year][monthNum].forEach(post => {
        const postLink = document.createElement('div');
        postLink.textContent = post.file.split('-').slice(1).join('-');
        postLink.style.marginLeft = '15px';
        postLink.style.marginBottom = '3px';
        postLink.style.cursor = 'pointer';
        postLink.style.transition = 'color 0.2s';

        postLink.addEventListener('mouseenter', () => postLink.style.color = '#ccc');
        postLink.addEventListener('mouseleave', () => postLink.style.color = 'white');

        // SPA permalink navigation
        postLink.addEventListener('click', () => {
          const idx = posts.indexOf(post.file);
          if (idx !== -1) {
            currentIndex = idx;
            loadPost(currentIndex);
            indexPopup.style.display = 'none';
            // Update URL
            history.pushState({file: post.file}, '', `/${post.file}`);
          }
        });

        monthContainer.appendChild(postLink);
      });
    });
  });
}

indexBtn.addEventListener('click', () => {
  renderIndexPopup();
  indexPopup.style.display = 'block';
});

closePopup.addEventListener('click', () => {
  indexPopup.style.display = 'none';
});

// Handle browser back/forward for permalinks
window.addEventListener('popstate', (event) => {
  const file = event.state?.file;
  if (file) {
    const idx = posts.indexOf(file);
    if (idx !== -1) {
      currentIndex = idx;
      loadPost(currentIndex);
    }
  }
});
