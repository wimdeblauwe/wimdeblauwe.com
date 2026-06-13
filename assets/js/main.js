// Reading progress bar (blog posts)
const progressBar = document.getElementById('progress');
if (progressBar) {
  addEventListener('scroll', () => {
    const h = document.documentElement;
    progressBar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  }, { passive: true });
}

// Search (Pagefind) — homepage only
const searchInput = document.getElementById('search');
if (searchInput) {
  const box = document.querySelector('.search-box');
  const serverList = document.getElementById('post-list');
  const countEl = document.getElementById('post-count');
  const noResults = document.getElementById('no-results');
  const section = serverList.closest('section');
  const sectionTitle = document.getElementById('section-title');
  const paginator = section && section.querySelector('.paginator');
  const allPosts = section && section.querySelector('.all-posts');

  // Insert Pagefind results list after the server-rendered list
  const resultsList = document.createElement('ul');
  resultsList.className = 'post-list';
  resultsList.id = 'search-results';
  resultsList.hidden = true;
  serverList.insertAdjacentElement('afterend', resultsList);

  let pagefind = null;
  let pagefindFailed = false;
  let debounceTimer;

  async function loadPagefind() {
    if (pagefind || pagefindFailed) return;
    try {
      pagefind = await import('/pagefind/pagefind.js');
    } catch {
      pagefindFailed = true;
    }
  }

  function parseDateFromUrl(url) {
    const m = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    if (!m) return '';
    return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  function setSearching(on) {
    document.body.classList.toggle('searching', on);
    box.classList.toggle('has-value', on);
    serverList.hidden = on;
    resultsList.hidden = !on;
    if (paginator) paginator.hidden = on;
    if (allPosts) allPosts.hidden = on;
    if (sectionTitle) sectionTitle.textContent = on ? 'Search results' : 'Recent posts';
    if (!on) {
      noResults.style.display = 'none';
      if (countEl) countEl.textContent = countEl.dataset.original;
    }
  }

  async function runSearch(q) {
    if (!pagefind) return;
    const { results } = await pagefind.search(q);
    const data = await Promise.all(results.slice(0, 20).map(r => r.data()));
    resultsList.innerHTML = '';
    if (data.length === 0) {
      noResults.style.display = 'block';
      noResults.querySelector('b').textContent = q;
      if (countEl) countEl.textContent = `0 results for "${q}"`;
    } else {
      noResults.style.display = 'none';
      if (countEl) countEl.textContent = `${data.length} result${data.length === 1 ? '' : 's'} for "${q}"`;
      data.forEach(r => {
        const date = parseDateFromUrl(r.url);
        const title = (r.meta.title || '').replace(' - Wim Deblauwe', '');
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = r.url;
        a.innerHTML = `<span class="date">${date}</span><span class="title">${title}</span><span class="summary">${r.excerpt}</span>`;
        li.appendChild(a);
        resultsList.appendChild(li);
      });
    }
  }

  if (countEl) countEl.dataset.original = countEl.textContent;

  // Pre-load Pagefind on first focus so it's ready by the time the user types
  searchInput.addEventListener('focus', loadPagefind, { once: true });

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    setSearching(q.length > 0);
    if (!q) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      await loadPagefind();
      await runSearch(q);
    }, 150);
  });

  document.addEventListener('keydown', e => {
    const active = document.activeElement;
    const editing = ['INPUT', 'TEXTAREA'].includes(active.tagName);
    if (e.key === '/' && !editing) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'Escape' && active === searchInput) {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
      searchInput.blur();
    } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && !editing) {
      searchInput.focus();
    }
  });
}
