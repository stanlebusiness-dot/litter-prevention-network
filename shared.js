// LPN's 501(c)(3) status is pending — leave this empty until it's confirmed.
// Single source of truth for donate.html / donate-success.html tax wording;
// update this one line (and only this line) once status is confirmed, e.g.:
//   "LPN is a registered 501(c)(3); your donation may be tax-deductible to the extent allowed by law."
window.LPN_TAX_DEDUCTIBLE_NOTE = '';
function renderTaxDeductibleNote() {
  document.querySelectorAll('.lpn-tax-note').forEach(el => {
    if (window.LPN_TAX_DEDUCTIBLE_NOTE) {
      el.textContent = window.LPN_TAX_DEDUCTIBLE_NOTE;
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
}

// State/Province suggestions shared by index.html + join/index.html so the
// two signup forms can't drift from each other (see the earlier duplicate-
// email-detection lesson). Free text, not a locked dropdown — LPN members
// span the US, Mexico, and Latin America, so a fixed list can't cover every
// region. This just nudges the two most common regions toward one
// consistent spelling via a <datalist>; anything else can still be typed.
const LPN_STATE_PROVINCE_OPTIONS = [
  // United States
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri',
  'Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York',
  'North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington',
  'West Virginia','Wisconsin','Wyoming','District of Columbia',
  // México
  'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua',
  'Ciudad de México','Coahuila','Colima','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco',
  'Estado de México','Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro',
  'Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala',
  'Veracruz','Yucatán','Zacatecas',
];
function injectStateProvinceDatalist() {
  if (document.getElementById('state-province-list')) return;
  const dl = document.createElement('datalist');
  dl.id = 'state-province-list';
  dl.innerHTML = LPN_STATE_PROVINCE_OPTIONS.map(s => `<option value="${s}"></option>`).join('');
  document.body.appendChild(dl);
}

// Mobile slide-down nav panel toggle
function toggleMobileNav() {
  const nav = document.querySelector('nav');
  const panel = nav && nav.querySelector('.mobile-nav-panel');
  const ham = nav && nav.querySelector('.hamburger');
  if (!panel) return;
  const isOpen = panel.classList.toggle('open');
  if (ham) { ham.classList.toggle('open', isOpen); ham.setAttribute('aria-expanded', String(isOpen)); }
}

// Legacy drawer functions — redirect to slide-down panel
function openDrawer() { toggleMobileNav(); }
function closeDrawer() {
  const nav = document.querySelector('nav');
  const panel = nav && nav.querySelector('.mobile-nav-panel');
  const ham = nav && nav.querySelector('.hamburger');
  if (panel) { panel.classList.remove('open'); }
  if (ham) { ham.classList.remove('open'); ham.setAttribute('aria-expanded', 'false'); }
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
  document.dispatchEvent(new CustomEvent('lpn-lang-change', { detail: { lang } }));
}
(function() { const saved = localStorage.getItem('lpn-lang'); if (saved) setLang(saved); })();

// Swappable logo loader — fetches logo_url from site_settings, falls back to local SVG
(async function() {
  const CACHE_KEY = 'lpn-logo-v1';
  const TTL = 3600000; // 1 hour
  let url = null;
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (c && Date.now() - c.t < TTL) url = c.v;
  } catch(e) {}
  if (!url) {
    try {
      const r = await fetch(
        'https://elgzfppmlsrrmskgloeo.supabase.co/rest/v1/site_settings?key=eq.logo_url&select=value',
        { headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZ3pmcHBtbHNycm1za2dsb2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTkxNTYsImV4cCI6MjA5MDIzNTE1Nn0.ec9avLt7Zz-41k2hOTFBs6KH0D5GmW6tCpdlcDSXRJc',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZ3pmcHBtbHNycm1za2dsb2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTkxNTYsImV4cCI6MjA5MDIzNTE1Nn0.ec9avLt7Zz-41k2hOTFBs6KH0D5GmW6tCpdlcDSXRJc'
        }}
      );
      const d = await r.json();
      if (d?.[0]?.value) {
        url = d[0].value;
        localStorage.setItem(CACHE_KEY, JSON.stringify({ v: url, t: Date.now() }));
      }
    } catch(e) {}
  }
  if (url) {
    document.querySelectorAll('.nav-logo img, .footer-logo-img').forEach(img => { img.src = url; });
    const fav = document.querySelector('link[rel="icon"]');
    if (fav) fav.href = url;
  }
})();

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
    'rewards':'rewards',
    'report-litter':'report','submit-proof':'submit',
    'prize-portal':'prize'
  };
  return map[path] || null;
}

// Applies the full site_settings row set to the current page. Named + kept
// idempotent (reuses/updates existing DOM nodes rather than re-creating them)
// so it can be called again on every Realtime push, not just once on load.
function lpnApplySiteSettings(s) {
  try {
    // ── LOGO (live updates via the same site_settings Realtime subscription) ──
    if (s.logo_url) {
      document.querySelectorAll('.nav-logo img, .footer-logo-img').forEach(img => { img.src = s.logo_url; });
      const fav = document.querySelector('link[rel="icon"]');
      if (fav) fav.href = s.logo_url;
    }

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
    const heroYPos = pageKey ? (s['hero_'+pageKey+'_position'] || 'center 50%') : 'center 50%';
    const heroXPos = pageKey ? (s['hero_'+pageKey+'_xposition'] || '50') : '50';
    const heroZoom = pageKey ? (s['hero_'+pageKey+'_zoom'] || '110') : '110';
    const heroPosition = heroXPos+'% '+(heroYPos.match(/(\d+)%/) ? heroYPos.match(/(\d+)%/)[1] : '50')+'%';
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
      // Taller hero sections
      '.hero,.page-hero{min-height:420px!important;padding:100px 40px!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;}',
      '.dash-hero{min-height:160px!important;padding:50px 40px!important;}',
      '.points-banner{min-height:200px!important;padding:60px 20px!important;}',
      // Stats
      '.stats{background:'+tintBg+'}',
      '.stat-number{color:'+secondary+'!important}',
      // Mission
      '.section-tag{background:'+tintLight+'!important;color:'+secondary+'!important}',
      '.mission .sub-tag{color:'+secondary+'!important}',
      // How it works
      '.how{background:'+tintBg+'}',
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
      '.drawer-user-card{background:rgba(255,255,255,0.95);border-radius:14px;padding:16px;margin:0 20px 16px;color:#0F2318;font-family:Segoe UI,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.08);}',
      '.drawer-user-welcome{font-size:15px;font-weight:700;margin-bottom:8px;}',
      '.drawer-user-points{font-size:13px;color:'+secondary+';font-weight:700;}',
      '.lpn-user-banner{background:rgba(255,255,255,0.94);border-left:4px solid '+secondary+';padding:20px 22px;margin-top:24px;border-radius:14px;max-width:720px;box-shadow:0 10px 24px rgba(0,0,0,0.08);}',
      '.lpn-user-banner p{margin:0;font-size:15px;line-height:1.7;color:#253437;}',
      '.lpn-user-banner strong{color:'+secondary+';}',
      '.lpn-quick-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-top:22px;}',
      '.lpn-quick-actions a{background:rgba(255,255,255,0.95);border-radius:12px;padding:16px 18px;color:#0F2318;text-decoration:none;font-weight:700;box-shadow:0 10px 25px rgba(0,0,0,0.08);transition:transform .2s,box-shadow .2s;}',
      '.lpn-quick-actions a:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(0,0,0,0.12);}',
      '.lpn-quick-actions a span{display:block;}',
      // Announcement
      '#lpn-announcement{background:'+secondary+'!important}',
    ].join('\n');

    // Reuse a single <style> tag — repeated (Realtime-triggered) calls just
    // replace its contents instead of piling up duplicate stylesheets.
    let style = document.getElementById('lpn-theme');
    if (!style) {
      style = document.createElement('style');
      style.id = 'lpn-theme';
      document.head.appendChild(style);
    }
    style.textContent = css;

    // ── APPLY HERO IMAGE ──
    const heroEl = document.querySelector('.hero, .page-hero, .dash-hero, .points-banner');
    if (heroImageUrl && heroEl) {
      const overlayColor = hexToRgba(secondary, overlayOpacity);
      let imgLayer   = heroEl.querySelector(':scope > .lpn-hero-imglayer');
      let colorLayer = heroEl.querySelector(':scope > .lpn-hero-colorlayer');
      if (!imgLayer) {
        // First run on this page — wrap the existing content once so repeated
        // calls (Realtime updates) update the layers in place instead of
        // re-wrapping already-wrapped content.
        const inner = document.createElement('div');
        inner.className = 'lpn-hero-inner';
        inner.style.cssText = 'position:relative;z-index:2;width:100%;';
        while (heroEl.firstChild) inner.appendChild(heroEl.firstChild);

        imgLayer = document.createElement('div');
        imgLayer.className = 'lpn-hero-imglayer';
        imgLayer.style.cssText = 'position:absolute;inset:0;z-index:0;';

        colorLayer = document.createElement('div');
        colorLayer.className = 'lpn-hero-colorlayer';
        colorLayer.style.cssText = 'position:absolute;inset:0;z-index:1;';

        heroEl.style.cssText += ';position:relative;overflow:hidden;background:none!important;';
        heroEl.appendChild(imgLayer);
        heroEl.appendChild(colorLayer);
        heroEl.appendChild(inner);
      }
      imgLayer.style.backgroundImage = 'url('+heroImageUrl+')';
      imgLayer.style.backgroundSize = heroZoom+'%';
      imgLayer.style.backgroundPosition = heroPosition;
      imgLayer.style.animation = 'lpn-hero-zoom 6s ease-out forwards';
      colorLayer.style.background = overlayColor;
    } else if (heroEl && !heroEl.querySelector(':scope > .lpn-hero-imglayer')) {
      const currentBg = window.getComputedStyle(heroEl).backgroundImage;
      if (!currentBg || currentBg === 'none') {
        heroEl.style.background = 'linear-gradient(135deg,'+primary+' 0%,'+secondary+' 100%)';
      }
    }

    // ── ANNOUNCEMENT BAR ──
    let bar = document.getElementById('lpn-announcement');
    if (s.announcement_active === 'true' && s.announcement_text) {
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'lpn-announcement';
        document.body.insertBefore(bar, document.body.firstChild);
      }
      bar.style.cssText = 'background:'+secondary+';color:white;text-align:center;padding:10px 40px 10px 20px;font-size:14px;font-weight:600;font-family:Segoe UI,sans-serif;position:relative;z-index:500;line-height:1.5;';
      bar.innerHTML = s.announcement_text+' <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;position:absolute;right:16px;top:50%;transform:translateY(-50%);opacity:0.8;">&#x2715;</button>';
    } else if (bar) {
      bar.remove();
    }
  } catch(e) {}
}

// Fetch once (fast raw REST call, no library needed) so settings paint
// immediately, then lazy-load supabase-js and subscribe to Realtime so any
// admin edit — colors, hero images, announcement bar, and everything else
// read from site_settings — pushes to every open tab within moments.
window._lpnSiteSettingsCache = window._lpnSiteSettingsCache || {};
(async function() {
  const SUPABASE_URL = 'https://elgzfppmlsrrmskgloeo.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZ3pmcHBtbHNycm1za2dsb2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTkxNTYsImV4cCI6MjA5MDIzNTE1Nn0.ec9avLt7Zz-41k2hOTFBs6KH0D5GmW6tCpdlcDSXRJc';
  try {
    const res = await fetch(SUPABASE_URL+'/rest/v1/site_settings?select=key,value', {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer '+SUPABASE_ANON }
    });
    const rows = await res.json();
    if (Array.isArray(rows)) {
      rows.forEach(function(r){ window._lpnSiteSettingsCache[r.key] = r.value; });
      lpnApplySiteSettings(window._lpnSiteSettingsCache);
    }
  } catch(e) {}

  try {
    const sb = await getLpnSupabase();
    if (!sb) return;
    sb.channel('lpn-site-settings-live-shared')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, payload => {
        const row = payload.new || payload.old;
        if (!row) return;
        if (payload.eventType === 'DELETE') delete window._lpnSiteSettingsCache[row.key];
        else window._lpnSiteSettingsCache[row.key] = row.value;
        lpnApplySiteSettings(window._lpnSiteSettingsCache);
      })
      .subscribe();
  } catch(e) {}
})();

function getHomepageCtaConfig() {
  try {
    const cached = localStorage.getItem('lpn-hpc');
    if (!cached) return {};
    const parsed = JSON.parse(cached);
    if (parsed && Date.now() - parsed.t < 86400000) return parsed.c?.buttons?.btn2 || {};
  } catch (e) {}
  return {};
}

function applyNavCtaLabels() {
  const cfg = getHomepageCtaConfig();
  const en = cfg.en || 'Free Sign Up';
  const es = cfg.es || 'Registro Gratis';
  document.querySelectorAll('#desktop-nav-auth, #mobile-nav-auth').forEach(el => {
    const eEl = el.querySelector('.en');
    const sEl = el.querySelector('.es');
    if (eEl) eEl.textContent = en;
    if (sEl) sEl.textContent = es;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  initializePersonalization();
  applyNavCtaLabels();
});
window.addEventListener('lpn-homepage-config', () => {
  buildNav();
  applyNavCtaLabels();
});

function buildNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const logo = nav.querySelector('.nav-logo');
  if (!logo) return;

  // Determine active page key
  const page = (window.location.pathname.split('/').pop().replace('.html', '').toLowerCase()) || 'index';

  // Nav structure — trimmed to exactly 3 top-level items for SEO consolidation.
  const NAV_ITEMS = [
    { label: 'Home',                    href: 'index.html',    pages: ['index', ''] },
    { label: 'Trash Rangers / Schools',  href: 'our-work.html', pages: ['our-work'] },
    {
      label: 'Get Involved',
      pages: ['donate'],
      dropdown: [
        { label: 'How You Can Help', href: 'index.html#help' },
        { label: 'Donate',           href: 'donate.html' },
        { label: 'Become a Sponsor', href: 'index.html#sponsor' },
        { label: 'Contact',          href: 'index.html#contact' },
      ]
    },
  ];

  function active(pages) {
    return pages.some(p => (p.replace('.html','').toLowerCase().split('#')[0] || 'index') === page);
  }

  // ── Build desktop nav links ──
  const desktopEl = document.createElement('div');
  desktopEl.className = 'nav-links-desktop';

  NAV_ITEMS.forEach(item => {
    const isAct = active(item.pages);
    if (item.dropdown) {
      const dd = document.createElement('div');
      dd.className = 'nav-dropdown';
      const btn = document.createElement('button');
      btn.className = 'nav-link' + (isAct ? ' active' : '');
      btn.type = 'button';
      btn.innerHTML = item.label + ' <span class="nav-drop-arrow">&#9662;</span>';
      const menu = document.createElement('div');
      menu.className = 'nav-drop-menu';
      menu.innerHTML = item.dropdown.map(d => `<a href="${d.href}">${d.label}</a>`).join('');
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const wasOpen = dd.classList.contains('open');
        desktopEl.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
        if (!wasOpen) dd.classList.add('open');
      });
      dd.appendChild(btn);
      dd.appendChild(menu);
      desktopEl.appendChild(dd);
    } else {
      const a = document.createElement('a');
      a.href = item.href;
      a.className = 'nav-link' + (isAct ? ' active' : '');
      a.textContent = item.label;
      desktopEl.appendChild(a);
    }
  });

  // ── Build right section: SIGN IN + SIGN UP pill + hamburger ──
  const rightEl = document.createElement('div');
  rightEl.className = 'nav-right';

  const _ctaCfg = getHomepageCtaConfig();

  const signInLink = document.createElement('a');
  signInLink.href = 'signin.html';
  signInLink.className = 'nav-link nav-signin-link';
  signInLink.id = 'desktop-nav-signin';
  signInLink.innerHTML = '<span class="en">Sign In</span><span class="es">Iniciar sesión</span>';

  const pill = document.createElement('a');
  pill.href = _ctaCfg.url || 'join/';
  pill.className = 'nav-signup-pill';
  pill.id = 'desktop-nav-auth';
  pill.innerHTML = '<span class="en">' + (_ctaCfg.en || 'Free Sign Up') + '</span><span class="es">' + (_ctaCfg.es || 'Registro Gratis') + '</span>';

  const ham = document.createElement('button');
  ham.className = 'hamburger';
  ham.type = 'button';
  ham.setAttribute('aria-label', 'Open navigation menu');
  ham.setAttribute('aria-expanded', 'false');
  ham.innerHTML = '<span></span><span></span><span></span>';
  ham.addEventListener('click', toggleMobileNav);

  rightEl.appendChild(signInLink);
  rightEl.appendChild(pill);
  rightEl.appendChild(ham);

  // ── Build mobile slide-down panel ──
  const mobilePanel = document.createElement('div');
  mobilePanel.className = 'mobile-nav-panel';
  mobilePanel.id = 'mobile-nav-panel';
  const mobileInner = document.createElement('div');
  mobileInner.className = 'mobile-nav-inner';

  NAV_ITEMS.forEach(item => {
    const isAct = active(item.pages);
    if (item.dropdown) {
      const sec = document.createElement('div');
      sec.className = 'mobile-nav-section';
      sec.textContent = item.label;
      mobileInner.appendChild(sec);
      item.dropdown.forEach(d => {
        const a = document.createElement('a');
        a.href = d.href;
        a.className = 'mobile-nav-link mobile-nav-sub' + (isAct ? ' active' : '');
        a.textContent = d.label;
        mobileInner.appendChild(a);
      });
    } else {
      const a = document.createElement('a');
      a.href = item.href;
      a.className = 'mobile-nav-link' + (isAct ? ' active' : '');
      a.textContent = item.label;
      mobileInner.appendChild(a);
    }
  });

  const div = document.createElement('div');
  div.className = 'mobile-nav-divider';
  mobileInner.appendChild(div);

  const mobileSignIn = document.createElement('a');
  mobileSignIn.href = 'signin.html';
  mobileSignIn.className = 'mobile-nav-link mobile-nav-signin';
  mobileSignIn.id = 'mobile-nav-signin';
  mobileSignIn.innerHTML = '<span class="en">Sign In</span><span class="es">Iniciar sesión</span>';
  mobileInner.appendChild(mobileSignIn);

  const mobileSignup = document.createElement('a');
  mobileSignup.href = _ctaCfg.url || 'join/';
  mobileSignup.className = 'mobile-nav-link mobile-nav-signup';
  mobileSignup.id = 'mobile-nav-auth';
  mobileSignup.innerHTML = '<span class="en">' + (_ctaCfg.en || 'Free Sign Up') + '</span><span class="es">' + (_ctaCfg.es || 'Registro Gratis') + '</span>';
  mobileInner.appendChild(mobileSignup);

  mobilePanel.appendChild(mobileInner);

  // ── Rebuild nav: logo | desktop links | nav-right | mobile panel ──
  nav.innerHTML = '';
  nav.appendChild(logo);
  nav.appendChild(desktopEl);
  nav.appendChild(rightEl);
  nav.appendChild(mobilePanel);

  // Stack logo label to 3 lines matching mockup
  const logoLabel = logo.querySelector('.nav-logo-label');
  if (logoLabel) logoLabel.innerHTML = 'Litter<br>Prevention<br>Network';

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    desktopEl.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
  });
}

function loadSupabaseScript() {
  return new Promise(resolve => {
    if (window.supabase) return resolve();
    const existing = document.querySelector('script[data-lpn-supabase]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.defer = true;
    script.dataset.lpnSupabase = '1';
    script.addEventListener('load', () => resolve());
    document.head.appendChild(script);
  });
}

async function getLpnSupabase() {
  if (window._lpnSupabase) return window._lpnSupabase;
  await loadSupabaseScript();
  if (!window.supabase) return null;
  return window._lpnSupabase = window.supabase.createClient(
    'https://elgzfppmlsrrmskgloeo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZ3pmcHBtbHNycm1za2dsb2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTkxNTYsImV4cCI6MjA5MDIzNTE1Nn0.ec9avLt7Zz-41k2hOTFBs6KH0D5GmW6tCpdlcDSXRJc'
  );
}

async function lpnSendWelcomeConfirmation(sb, { email, fullName, language }) {
  try {
    const randomBytes = crypto.getRandomValues(new Uint8Array(24));
    const password = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, lang: language, source: 'welcome_email' },
        emailRedirectTo: 'https://litterpreventionnetwork.org/dashboard.html'
      }
    });
    if (error) console.error('[LPN] welcome confirmation signUp failed:', error.message);
  } catch (e) {
    console.error('[LPN] welcome confirmation signUp threw:', e);
  }
}

async function getSignedInUser() {
  const sb = await getLpnSupabase();
  if (!sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  return session?.user || null;
}

async function requireLogin() {
  const sb = await getLpnSupabase();
  if (!sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  if (!session || !session.user) {
    window.location.href = 'signin.html';
    return null;
  }
  return session.user;
}

async function loadUserPoints(user) {
  if (!user) return 0;
  const sb = await getLpnSupabase();
  if (!sb) return 0;
  const { data, error } = await sb.from('points').select('points').eq('email', user.email).single();
  return data?.points || 0;
}

async function initializePersonalization() {
  const user = await getSignedInUser();
  if (!user) return;
  const points = await loadUserPoints(user);
  renderPersonalizedNav(user, points);
  renderPersonalizedHero(user, points);
}

function renderPersonalizedNav(user, points) {
  const name = user.user_metadata?.full_name || user.email.split('@')[0];
  const signOut = async () => {
    const sb = await getLpnSupabase();
    if (sb) await sb.auth.signOut();
    window.location.href = 'signin.html';
  };

  // Desktop SIGN UP pill → becomes user name + pts
  const desktopAuthBtn = document.getElementById('desktop-nav-auth');
  if (desktopAuthBtn) {
    desktopAuthBtn.textContent = `${name} (${points} pts)`;
    desktopAuthBtn.href = 'dashboard.html';
    desktopAuthBtn.style.cssText = 'background:#0F6E56;color:white;font-size:12px;';
  }

  // Mobile auth link → sign out
  const mobileAuthBtn = document.getElementById('mobile-nav-auth');
  if (mobileAuthBtn) {
    mobileAuthBtn.textContent = `${name} · ${points} pts`;
    mobileAuthBtn.href = 'javascript:void(0)';
    mobileAuthBtn.onclick = signOut;
  }

  // Inject welcome card into mobile panel
  const mobileInner = document.querySelector('.mobile-nav-inner');
  if (mobileInner && !mobileInner.querySelector('.drawer-user-card')) {
    const card = document.createElement('div');
    card.className = 'drawer-user-card';
    card.style.cssText = 'margin:12px 24px;padding:14px 16px;background:#f0fdf8;border-radius:10px;border-left:3px solid #1A6B2F;';
    card.innerHTML = `<div style="font-weight:700;font-size:14px;color:#0F2318;"><span class="en">Welcome back, ${name}</span><span class="es">Bienvenido, ${name}</span></div><div style="font-size:13px;color:#1A6B2F;font-weight:700;margin-top:4px;">${points} <span class="en">points</span><span class="es">puntos</span></div>`;
    mobileInner.insertBefore(card, mobileInner.firstChild);
  }
}

// Cookie consent banner — set via localStorage
(function () {
  if (localStorage.getItem('lpn-cookie-consent') !== null) return;
  document.addEventListener('DOMContentLoaded', function () {
    var banner = document.createElement('div');
    banner.id = 'lpn-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0',
      'background:#1A6B2F', 'color:white',
      'padding:16px 24px',
      'display:flex', 'align-items:center', 'justify-content:space-between',
      'gap:16px', 'flex-wrap:wrap',
      'z-index:9998',
      'font-family:Outfit,Segoe UI,sans-serif', 'font-size:14px', 'line-height:1.6',
      'box-shadow:0 -4px 20px rgba(0,0,0,0.25)'
    ].join(';');
    banner.innerHTML =
      '<p style="margin:0;flex:1;min-width:200px;">' +
        '<span class="en">This site uses cookies for basic analytics to help us improve your experience. ' +
          'We do not sell or share your data. ' +
          '<a href="cookies.html" style="color:#9FD3BB;text-decoration:underline;">Learn more</a>' +
        '</span>' +
        '<span class="es">Este sitio usa cookies para análisis básicos para ayudarnos a mejorar tu experiencia. ' +
          'No vendemos ni compartimos tus datos. ' +
          '<a href="cookies.html" style="color:#9FD3BB;text-decoration:underline;">Más información</a>' +
        '</span>' +
      '</p>' +
      '<div style="display:flex;gap:10px;flex-shrink:0;">' +
        '<button id="lpn-cookie-accept" style="background:white;color:#1A6B2F;border:none;padding:9px 22px;border-radius:6px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;">' +
          '<span class="en">Accept</span><span class="es">Aceptar</span>' +
        '</button>' +
        '<button id="lpn-cookie-decline" style="background:transparent;color:white;border:2px solid rgba(255,255,255,0.55);padding:9px 22px;border-radius:6px;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;">' +
          '<span class="en">Decline</span><span class="es">Rechazar</span>' +
        '</button>' +
      '</div>';
    document.body.appendChild(banner);
    document.getElementById('lpn-cookie-accept').addEventListener('click', function () {
      localStorage.setItem('lpn-cookie-consent', 'accepted');
      banner.remove();
    });
    document.getElementById('lpn-cookie-decline').addEventListener('click', function () {
      localStorage.setItem('lpn-cookie-consent', 'declined');
      banner.remove();
    });
  });
}());

function renderPersonalizedHero(user, points) {
  const hero = document.querySelector('.hero, .page-hero');
  if (!hero) return;
  const displayName = user.user_metadata?.full_name || user.email.split('@')[0];
  const remaining = Math.max(0, 100 - points);
  if (!hero.querySelector('.lpn-user-banner')) {
    const banner = document.createElement('div');
    banner.className = 'lpn-user-banner';
    banner.innerHTML = `
      <p><strong><span class="en">Hey ${displayName}, great to see you again.</span><span class="es">Hola ${displayName}, nos alegra verte de nuevo.</span></strong></p>
      <p><span class="en">You now have <strong>${points} points</strong>. ${remaining > 0 ? 'Earn '+remaining+' more points to redeem your next reward.' : 'You are ready to redeem a reward today!'}</span><span class="es">Ahora tienes <strong>${points} puntos</strong>. ${remaining > 0 ? 'Gana '+remaining+' puntos más para canjear tu próxima recompensa.' : '¡Estás listo para canjear una recompensa hoy!'}</span></p>
    `;
    hero.appendChild(banner);
  }
  const pageKey = getPageKey();
  if (pageKey === 'index' && !document.querySelector('.lpn-quick-actions')) {
    const quick = document.createElement('div');
    quick.className = 'lpn-quick-actions';
    quick.innerHTML = `
      <a href="report-litter.html"><span class="en">Report litter</span><span class="es">Reportar basura</span></a>
      <a href="submit-proof.html"><span class="en">Submit proof</span><span class="es">Enviar prueba</span></a>
      <a href="prize-portal.html"><span class="en">Redeem points</span><span class="es">Canjear puntos</span></a>
      <a href="dashboard.html"><span class="en">View dashboard</span><span class="es">Ver panel</span></a>
    `;
    const heroButtons = hero.querySelector('.hero-btns');
    if (heroButtons) heroButtons.after(quick);
    else hero.appendChild(quick);
  }
}
