// Reading progress bar (blog posts)
const progressBar = document.getElementById('progress');
if (progressBar) {
  addEventListener('scroll', () => {
    const h = document.documentElement;
    progressBar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  }, { passive: true });
}
