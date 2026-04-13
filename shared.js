// Drawer functions
function openDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrawer();
});

// Language functions
function setLang(lang) {
  localStorage.setItem('lpn-lang', lang);
  document.querySelectorAll('.lang-bar button').forEach(b => b.classList.remove('active'));
  if (lang === 'es') {
    document.body.classList.add('spanish');
    document.querySelectorAll('.lang-bar button')[1].classList.add('active');
  } else {
    document.body.classList.remove('spanish');
    document.querySelectorAll('.lang-bar button')[0].classList.add('active');
  }
}

// Auto-apply saved language on page load
(function() {
  const saved = localStorage.getItem('lpn-lang');
  if (saved) setLang(saved);
})();