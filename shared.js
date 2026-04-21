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

// ── SITE SETTINGS: load theme + announcement from Supabase ──
(async function applySiteSettings() {
  try {
    const SUPABASE_URL = 'https://elgzfppmlsrrmskgloeo.supabase.co';
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZ3pmcHBtbHNycm1za2dsb2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTkxNTYsImV4cCI6MjA5MDIzNTE1Nn0.ec9avLt7Zz-41k2hOTFBs6KH0D5GmW6tCpdlcDSXRJc';

    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=key,value`, {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': 'Bearer ' + SUPABASE_ANON,
      }
    });
    const rows = await res.json();
    if (!Array.isArray(rows)) return;

    const s = {};
    rows.forEach(r => s[r.key] = r.value);

    // Apply theme colors via CSS variables
    const primary = s.primary_color || '#1D9E75';
    const secondary = s.secondary_color || '#0F6E56';
    document.documentElement.style.setProperty('--color-primary', primary);
    document.documentElement.style.setProperty('--color-secondary', secondary);

    // Inject dynamic color overrides into <head>
    const style = document.createElement('style');
    style.id = 'lpn-theme';
    style.textContent = `
      .lang-bar { background: ${primary} !important; }
      .lang-bar button.active { color: ${primary} !important; }
      .admin-header { background: ${primary} !important; }
      .page-hero { background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%) !important; }
      .btn-green, .btn-submit { background: ${primary} !important; }
      .btn-green:hover, .btn-submit:hover { background: ${secondary} !important; }
      .drawer-header { background: ${primary} !important; }
      .drawer-nav a:hover, .drawer-nav a.active { color: ${primary} !important; border-left-color: ${primary} !important; }
      .event-date { background: ${primary} !important; }
      .nav-logo { color: ${secondary} !important; }
      th { background: ${primary} !important; }
      .tab.active { color: ${primary} !important; border-bottom-color: ${primary} !important; }
      .footer-col a:hover { color: ${primary} !important; }
      .footer-social a:hover { background: ${primary} !important; }
      #lpn-announcement { background: ${secondary} !important; }
    `;
    document.head.appendChild(style);

    // Announcement bar
    if (s.announcement_active === 'true' && s.announcement_text) {
      const bar = document.createElement('div');
      bar.id = 'lpn-announcement';
      bar.style.cssText = `
        background: ${secondary};
        color: white;
        text-align: center;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 600;
        font-family: 'Segoe UI', sans-serif;
        position: relative;
        z-index: 500;
      `;
      bar.innerHTML = `${s.announcement_text} <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;position:absolute;right:16px;top:50%;transform:translateY(-50%);">✕</button>`;
      document.body.insertBefore(bar, document.body.firstChild);
    }
  } catch(e) {
    // Silently fail — don't break the site if settings can't load
  }
})();