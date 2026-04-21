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

(function() {
  const saved = localStorage.getItem('lpn-lang');
  if (saved) setLang(saved);
})();

// Helper: hex to rgba
function hexToRgba(hex, alpha) {
  try {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+alpha+')';
  } catch(e) { return 'rgba(29,158,117,'+alpha+')'; }
}

// Helper: darken a hex color by mixing with black
function darkenHex(hex, amount) {
  try {
    let r = parseInt(hex.slice(1,3),16);
    let g = parseInt(hex.slice(3,5),16);
    let b = parseInt(hex.slice(5,7),16);
    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));
    return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
  } catch(e) { return '#0F2318'; }
}

// SITE SETTINGS
(async function applySiteSettings() {
  try {
    const SUPABASE_URL = 'https://elgzfppmlsrrmskgloeo.supabase.co';
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZ3pmcHBtbHNycm1za2dsb2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTkxNTYsImV4cCI6MjA5MDIzNTE1Nn0.ec9avLt7Zz-41k2hOTFBs6KH0D5GmW6tCpdlcDSXRJc';

    const res = await fetch(SUPABASE_URL+'/rest/v1/site_settings?select=key,value', {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer '+SUPABASE_ANON }
    });
    const rows = await res.json();
    if (!Array.isArray(rows)) return;

    const s = {};
    rows.forEach(function(r){ s[r.key] = r.value; });

    const primary   = s.primary_color   || '#1D9E75';
    const secondary = s.secondary_color || '#0F6E56';
    const tintBg    = hexToRgba(primary, 0.07);
    const tintLight = hexToRgba(primary, 0.14);
    const footerBg  = darkenHex(primary, 0.78);   // very dark tinted
    const footerBg2 = darkenHex(primary, 0.70);   // slightly lighter for dividers

    document.documentElement.style.setProperty('--color-primary',   primary);
    document.documentElement.style.setProperty('--color-secondary', secondary);

    const css = [
      // Lang bar
      '.lang-bar{background:'+primary+'!important}',
      '.lang-bar button.active{color:'+primary+'!important}',

      // Nav
      '.nav-logo span,.nav-logo{color:'+secondary+'!important}',

      // Drawer
      '.drawer-header{background:'+primary+'!important}',
      '.drawer-nav a:hover,.drawer-nav a.active{color:'+primary+'!important;border-left-color:'+primary+'!important;background:'+tintBg+'!important}',

      // Hero
      '.hero,.page-hero{background:linear-gradient(135deg,'+primary+' 0%,'+secondary+' 100%)!important}',

      // Stats
      '.stats{background:'+tintBg+'!important}',
      '.stat-number{color:'+secondary+'!important}',

      // Mission / section tags
      '.section-tag{background:'+tintLight+'!important;color:'+secondary+'!important}',
      '.mission .sub-tag{color:'+secondary+'!important}',

      // How it works
      '.how{background:'+tintBg+'!important}',
      '.step:hover{border-color:'+primary+'!important}',
      '.step-num{background:'+secondary+'!important}',

      // Buttons
      '.btn-green,.btn-submit{background:'+primary+'!important;color:white!important}',
      '.btn-green:hover,.btn-submit:hover{background:'+secondary+'!important}',
      '.btn-primary{color:'+primary+'!important}',

      // Reward cards
      '.reward-card:hover{border-color:'+primary+'!important}',
      '.reward-card .go-btn{background:'+primary+'!important;color:white!important}',
      '.reward-points{color:'+primary+'!important}',

      // Redeem box
      '.redeem-box{background:'+tintLight+'!important}',
      '.redeem-box h2{color:'+secondary+'!important}',

      // Host your own / CTA blocks
      '.host-your-own{background:linear-gradient(135deg,'+primary+' 0%,'+secondary+' 100%)!important}',

      // Sponsors CTA / become a sponsor block
      '.sponsor-cta,.sponsor-hero,.become-sponsor{background:linear-gradient(135deg,'+primary+' 0%,'+secondary+' 100%)!important}',

      // About / ready to make a difference
      '.ready-cta,.difference-cta,.cta-block{background:linear-gradient(135deg,'+primary+' 0%,'+secondary+' 100%)!important}',

      // Dashboard
      '.dashboard-stat .stat-val,.member-number{color:'+primary+'!important}',
      '.progress-bar-fill{background:'+primary+'!important}',
      '.dashboard-card h3{color:'+secondary+'!important}',

      // Forms
      'input:focus,select:focus,textarea:focus{border-color:'+primary+'!important;outline:none}',

      // Events
      '.event-date{background:'+primary+'!important}',
      '.event-points,.event-info .event-points{background:'+tintLight+'!important;color:'+secondary+'!important}',
      '.no-events a.btn-green{background:'+primary+'!important}',

      // Admin table headers + tabs
      'th{background:'+primary+'!important}',
      '.tab.active{color:'+primary+'!important;border-bottom-color:'+primary+'!important}',
      '.count-badge{background:'+tintLight+'!important;color:'+secondary+'!important}',
      '.btn-approve{background:'+primary+'!important}',
      '.btn-approve:hover{background:'+secondary+'!important}',
      '.admin-header{background:'+primary+'!important}',

      // Badges
      '.completed-badge{background:'+tintLight+'!important;color:'+secondary+'!important}',
      '.past-badge{background:'+tintBg+'!important}',
      '.status-approved,.status-read,.status-fulfilled{background:'+tintLight+'!important;color:'+secondary+'!important}',

      // FOOTER — dark themed
      '.site-footer{background:'+footerBg+'!important}',
      '.footer-bottom{border-top-color:'+footerBg2+'!important}',
      '.footer-col h4{color:white!important}',
      '.footer-brand h3{color:white!important}',
      '.footer-col a:hover,.footer-brand .footer-contact a{color:'+primary+'!important}',
      '.footer-social a:hover{background:'+primary+'!important;color:white!important}',
      '.footer-social a{background:'+footerBg2+'!important}',
      '.drawer-footer-note{border-top-color:'+tintBg+'!important}',

      // Announcement bar
      '#lpn-announcement{background:'+secondary+'!important}',
    ].join('\n');

    const style = document.createElement('style');
    style.id = 'lpn-theme';
    style.textContent = css;
    document.head.appendChild(style);

    // Announcement bar
    if (s.announcement_active === 'true' && s.announcement_text) {
      const bar = document.createElement('div');
      bar.id = 'lpn-announcement';
      bar.style.cssText = 'background:'+secondary+';color:white;text-align:center;padding:10px 40px 10px 20px;font-size:14px;font-weight:600;font-family:Segoe UI,sans-serif;position:relative;z-index:500;line-height:1.5;';
      bar.innerHTML = s.announcement_text+' <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;position:absolute;right:16px;top:50%;transform:translateY(-50%);opacity:0.8;">&#x2715;</button>';
      document.body.insertBefore(bar, document.body.firstChild);
    }
  } catch(e) {}
})();