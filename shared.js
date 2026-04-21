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

// Helper: convert hex to rgba
function hexToRgba(hex, alpha) {
  try {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+alpha+')';
  } catch(e) { return 'rgba(29,158,117,'+alpha+')'; }
}

// SITE SETTINGS: load theme + announcement from Supabase
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

    var primary   = s.primary_color   || '#1D9E75';
    var secondary = s.secondary_color || '#0F6E56';
    var tintBg    = hexToRgba(primary, 0.07);
    var tintLight = hexToRgba(primary, 0.14);

    document.documentElement.style.setProperty('--color-primary',   primary);
    document.documentElement.style.setProperty('--color-secondary', secondary);

    var css = [
      '.lang-bar{background:'+primary+'!important}',
      '.lang-bar button.active{color:'+primary+'!important}',
      '.nav-logo span,.nav-logo{color:'+secondary+'!important}',
      '.drawer-header{background:'+primary+'!important}',
      '.drawer-nav a:hover,.drawer-nav a.active{color:'+primary+'!important;border-left-color:'+primary+'!important;background:'+tintBg+'!important}',
      '.hero,.page-hero{background:linear-gradient(135deg,'+primary+' 0%,'+secondary+' 100%)!important}',
      '.stats{background:'+tintBg+'!important}',
      '.stat-number{color:'+secondary+'!important}',
      '.section-tag{background:'+tintLight+'!important;color:'+secondary+'!important}',
      '.how{background:'+tintBg+'!important}',
      '.step:hover{border-color:'+primary+'!important}',
      '.step-num{background:'+secondary+'!important}',
      '.btn-green,.btn-submit{background:'+primary+'!important;color:white!important}',
      '.btn-green:hover,.btn-submit:hover{background:'+secondary+'!important}',
      '.btn-primary{color:'+primary+'!important}',
      'input:focus,select:focus,textarea:focus{border-color:'+primary+'!important;outline:none}',
      '.event-date{background:'+primary+'!important}',
      '.event-info .event-points,.event-points{background:'+tintLight+'!important;color:'+secondary+'!important}',
      'th{background:'+primary+'!important}',
      '.tab.active{color:'+primary+'!important;border-bottom-color:'+primary+'!important}',
      '.count-badge{background:'+tintLight+'!important;color:'+secondary+'!important}',
      '.btn-approve{background:'+primary+'!important}',
      '.btn-approve:hover{background:'+secondary+'!important}',
      '.footer-col a:hover{color:'+primary+'!important}',
      '.footer-social a:hover{background:'+primary+'!important;color:white!important}',
      '.footer-brand .footer-contact a{color:'+primary+'!important}',
      '.host-your-own{background:linear-gradient(135deg,'+primary+' 0%,'+secondary+' 100%)!important}',
      '.redeem-box{background:'+tintLight+'!important}',
      '.redeem-box h2{color:'+secondary+'!important}',
      '.reward-points{color:'+primary+'!important}',
      '.completed-badge{background:'+tintLight+'!important;color:'+secondary+'!important}',
      '.status-approved,.status-read,.status-fulfilled{background:'+tintLight+'!important;color:'+secondary+'!important}',
      '#lpn-announcement{background:'+secondary+'!important}',
      '.no-events a.btn-green{background:'+primary+'!important}',
      '.past-badge{background:'+tintBg+'!important}',
    ].join('\n');

    var style = document.createElement('style');
    style.id = 'lpn-theme';
    style.textContent = css;
    document.head.appendChild(style);

    // Announcement bar
    if (s.announcement_active === 'true' && s.announcement_text) {
      var bar = document.createElement('div');
      bar.id = 'lpn-announcement';
      bar.style.cssText = 'background:'+secondary+';color:white;text-align:center;padding:10px 40px 10px 20px;font-size:14px;font-weight:600;font-family:Segoe UI,sans-serif;position:relative;z-index:500;line-height:1.5;';
      bar.innerHTML = s.announcement_text+' <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;position:absolute;right:16px;top:50%;transform:translateY(-50%);opacity:0.8;">&#x2715;</button>';
      document.body.insertBefore(bar, document.body.firstChild);
    }
  } catch(e) {}
})();