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
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

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
(function() { const saved = localStorage.getItem('lpn-lang'); if (saved) setLang(saved); })();

function hexToRgba(hex, alpha) {
  try {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+alpha+')';
  } catch(e) { return 'rgba(29,158,117,'+alpha+')'; }
}
function darkenHex(hex, amount) {
  try {
    const r=Math.max(0,Math.floor(parseInt(hex.slice(1,3),16)*(1-amount)));
    const g=Math.max(0,Math.floor(parseInt(hex.slice(3,5),16)*(1-amount)));
    const b=Math.max(0,Math.floor(parseInt(hex.slice(5,7),16)*(1-amount)));
    return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  } catch(e) { return '#0F2318'; }
}

// Detect current page key
function getPageKey() {
  const path = window.location.pathname.split('/').pop().replace('.html','') || 'index';
  const map = {
    'index':'index','':'index',
    'events':'events','rewards':'rewards','volunteer':'volunteer',
    'report-litter':'report','submit-proof':'submit',
    'prize-portal':'prize','map':'map','sponsors':'sponsors',
    'about':'about','faq':'faq','contact':'contact'
  };
  return map[path] || null;
}

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
    rows.forEach(function(r){ s[r.key]=r.value; });

    const primary   = s.primary_color   || '#1D9E75';
    const secondary = s.secondary_color || '#0F6E56';
    const tintBg    = hexToRgba(primary, 0.07);
    const tintLight = hexToRgba(primary, 0.14);
    const footerBg  = darkenHex(primary, 0.78);
    const footerBg2 = darkenHex(primary, 0.68);

    document.documentElement.style.setProperty('--color-primary', primary);
    document.documentElement.style.setProperty('--color-secondary', secondary);

    // ── HERO IMAGE ──
    const pageKey = getPageKey();
    const heroImageUrl = pageKey ? (s['hero_'+pageKey+'_image'] || '') : '';
    const overlayOpacity = parseFloat(s.hero_overlay_opacity || '0.6');

    // Inject zoom keyframe + theme CSS
    const zoomKeyframe = heroImageUrl ? '@keyframes lpn-hero-zoom{from{transform:scale(1.08)}to{transform:scale(1)}}' : '';

    const css = [
      zoomKeyframe,
      // Lang bar
      '.lang-bar{background:'+primary+'!important}',
      '.lang-bar button.active{color:'+primary+'!important}',
      // Nav
      '.nav-logo span,.nav-logo{color:'+secondary+'!important}',
      // Drawer
      '.drawer-header{background:'+primary+'!important}',
      '.drawer-nav a:hover,.drawer-nav a.active{color:'+primary+'!important;border-left-color:'+primary+'!important;background:'+tintBg+'!important}',
      // Hero — color gradient (used when no image set)
      '.hero,.page-hero,.dash-hero,.points-banner{background:linear-gradient(135deg,'+primary+' 0%,'+secondary+' 100%)!important}',
      // Stats
      '.stats{background:'+tintBg+'!important}',
      '.stat-number{color:'+secondary+'!important}',
      // Mission
      '.section-tag{background:'+tintLight+'!important;color:'+secondary+'!important}',
      '.mission .sub-tag{color:'+secondary+'!important}',
      // How it works
      '.how{background:'+tintBg+'!important}',
      '.step:hover{border-color:'+primary+'!important}',
      '.step-num{background:'+secondary+'!important}',
      // Buttons
      '.btn-green,.btn-submit,.btn-login{background:'+primary+'!important;color:white!important}',
      '.btn-green:hover,.btn-submit:hover,.btn-login:hover{background:'+secondary+'!important}',
      '.btn-primary{color:'+primary+'!important}',
      // Dashboard
      '.dash-actions a{background:'+primary+'!important;color:white!important}',
      '.dash-actions a:hover{background:'+secondary+'!important}',
      '.card .number{color:'+secondary+'!important}',
      // Prize portal
      '.prize-card:hover{border-color:'+primary+'!important}',
      '.prize-card.selected{border-color:'+secondary+'!important;background:'+tintBg+'!important}',
      '.points-cost{background:'+tintLight+'!important}',
      '.points-cost span{color:'+secondary+'!important}',
      '.gas-tag:hover{background:'+tintLight+'!important;border-color:'+primary+'!important;color:'+secondary+'!important}',
      // Reward cards
      '.reward-card:hover{border-color:'+primary+'!important}',
      '.reward-card .go-btn{background:'+primary+'!important;color:white!important}',
      '.reward-points{color:'+primary+'!important}',
      // Redeem box
      '.redeem-box{background:'+tintLight+'!important}',
      '.redeem-box h2{color:'+secondary+'!important}',
      // CTA gradient blocks
      '.host-your-own,.sponsor-cta,.become-sponsor,.ready-cta,.difference-cta,.cta-block{background:linear-gradient(135deg,'+primary+' 0%,'+secondary+' 100%)!important}',
      // Forms
      'input:focus,select:focus,textarea:focus{border-color:'+primary+'!important;outline:none}',
      // Events
      '.event-date{background:'+primary+'!important}',
      '.event-points,.event-info .event-points{background:'+tintLight+'!important;color:'+secondary+'!important}',
      // Admin
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
      // Footer
      '.site-footer{background:'+footerBg+'!important}',
      '.footer-bottom{border-top-color:'+footerBg2+'!important}',
      '.footer-col h4{color:white!important}',
      '.footer-brand h3{color:white!important}',
      '.footer-col a:hover,.footer-brand .footer-contact a{color:'+primary+'!important}',
      '.footer-social a{background:'+footerBg2+'!important}',
      '.footer-social a:hover{background:'+primary+'!important;color:white!important}',
      // Announcement
      '#lpn-announcement{background:'+secondary+'!important}',
    ].join('\n');

    const style = document.createElement('style');
    style.id = 'lpn-theme';
    style.textContent = css;
    document.head.appendChild(style);

    // ── APPLY HERO IMAGE ──
    if (heroImageUrl) {
      const heroEl = document.querySelector('.hero, .page-hero, .dash-hero, .points-banner');
      if (heroEl) {
        // Wrap content in overlay div
        const overlayColor = hexToRgba(secondary, overlayOpacity);
        const inner = document.createElement('div');
        inner.style.cssText = 'position:relative;z-index:2;width:100%;';
        while (heroEl.firstChild) inner.appendChild(heroEl.firstChild);

        // Image layer with zoom
        const imgLayer = document.createElement('div');
        imgLayer.style.cssText = [
          'position:absolute;inset:0;',
          'background-image:url('+heroImageUrl+');',
          'background-size:cover;',
          'background-position:center;',
          'animation:lpn-hero-zoom 1.8s ease-out forwards;',
          'z-index:0;',
        ].join('');

        // Color overlay
        const colorLayer = document.createElement('div');
        colorLayer.style.cssText = 'position:absolute;inset:0;background:'+overlayColor+';z-index:1;';

        heroEl.style.cssText += ';position:relative;overflow:hidden;background:none!important;';
        heroEl.appendChild(imgLayer);
        heroEl.appendChild(colorLayer);
        heroEl.appendChild(inner);
      }
    }

    // ── ANNOUNCEMENT BAR ──
    if (s.announcement_active === 'true' && s.announcement_text) {
      const bar = document.createElement('div');
      bar.id = 'lpn-announcement';
      bar.style.cssText = 'background:'+secondary+';color:white;text-align:center;padding:10px 40px 10px 20px;font-size:14px;font-weight:600;font-family:Segoe UI,sans-serif;position:relative;z-index:500;line-height:1.5;';
      bar.innerHTML = s.announcement_text+' <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;position:absolute;right:16px;top:50%;transform:translateY(-50%);opacity:0.8;">&#x2715;</button>';
      document.body.insertBefore(bar, document.body.firstChild);
    }
  } catch(e) {}
})();
