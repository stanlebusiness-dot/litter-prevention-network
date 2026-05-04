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
    'about':'about','faq':'faq','contact':'contact','news':'news'
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
    const heroYPos = pageKey ? (s['hero_'+pageKey+'_position'] || 'center 50%') : 'center 50%';
    const heroXPos = pageKey ? (s['hero_'+pageKey+'_xposition'] || '50') : '50';
    const heroZoom = pageKey ? (s['hero_'+pageKey+'_zoom'] || '110') : '110';
    const heroPosition = heroXPos+'% '+(heroYPos.match(/(\d+)%/) ? heroYPos.match(/(\d+)%/)[1] : '50')+'%';
    const overlayOpacity = parseFloat(s.hero_overlay_opacity || '0.6');

    // Load hero text from page_content
    if (pageKey) {
      try {
        const pcRes = await fetch(SUPABASE_URL+'/rest/v1/page_content?page=eq.'+pageKey+'&select=*', {
          headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer '+SUPABASE_ANON }
        });
        const pcRows = await pcRes.json();
        if (Array.isArray(pcRows) && pcRows.length > 0) {
          const pc = pcRows[0];
          const lang = localStorage.getItem('lpn-lang') || 'en';
          const headline = lang === 'es' ? (pc.hero_headline_es || pc.hero_headline_en) : pc.hero_headline_en;
          const subtext  = lang === 'es' ? (pc.hero_subtext_es  || pc.hero_subtext_en)  : pc.hero_subtext_en;
          if (headline) {
            // Override h1 text in hero
            const heroEl2 = document.querySelector('.hero h1, .page-hero h1');
            if (heroEl2) heroEl2.innerHTML = headline;
          }
          if (subtext) {
            const heroP = document.querySelector('.hero > p, .page-hero > p');
            if (heroP) heroP.innerHTML = subtext;
          }
        }
      } catch(e) {}
    }

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

    const style = document.createElement('style');
    style.id = 'lpn-theme';
    style.textContent = css;
    document.head.appendChild(style);

    // ── APPLY HERO IMAGE ──
    const heroEl = document.querySelector('.hero, .page-hero, .dash-hero, .points-banner');
    if (heroImageUrl && heroEl) {
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
        'background-size:'+heroZoom+'%;',
        'background-position:'+heroPosition+';',
        'animation:lpn-hero-zoom 6s ease-out forwards;',
        'z-index:0;',
      ].join('');

      // Color overlay
      const colorLayer = document.createElement('div');
      colorLayer.style.cssText = 'position:absolute;inset:0;background:'+overlayColor+';z-index:1;';

      heroEl.style.cssText += ';position:relative;overflow:hidden;background:none!important;';
      heroEl.appendChild(imgLayer);
      heroEl.appendChild(colorLayer);
      heroEl.appendChild(inner);
    } else if (heroEl) {
      const currentBg = window.getComputedStyle(heroEl).backgroundImage;
      if (!currentBg || currentBg === 'none') {
        heroEl.style.background = 'linear-gradient(135deg,'+primary+' 0%,'+secondary+' 100%)';
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

function injectNewsNavLink() {
  const nav = document.querySelector('.drawer-nav');
  if (!nav || nav.querySelector('a[href="news.html"]')) return;

  const link = document.createElement('a');
  link.href = 'news.html';
  link.innerHTML = '<span class="nav-icon">📰</span><span class="en">News</span><span class="es">Noticias</span>';
  if (window.location.pathname.endsWith('news.html')) {
    link.classList.add('active');
  }

  const anchor = nav.querySelector('a[href="events.html"]');
  if (anchor) {
    nav.insertBefore(link, anchor.nextSibling);
  } else {
    nav.appendChild(link);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  buildDesktopNav();
  injectNewsNavLink();
  initializePersonalization();
});

function buildDesktopNav() {
  const nav = document.querySelector('nav');
  if (!nav || nav.querySelector('.nav-links-desktop')) return;

  const el = document.createElement('div');
  el.className = 'nav-links-desktop';
  el.innerHTML = `
    <div class="nav-dropdown">
      <button class="nav-drop-btn">What We Do <span class="nav-drop-arrow">▾</span></button>
      <div class="nav-drop-menu">
        <a href="our-work.html">Our Work</a>
        <a href="our-impact.html">Our Impact</a>
        <a href="emergencies.html">Emergencies</a>
      </div>
    </div>
    <div class="nav-dropdown">
      <button class="nav-drop-btn">About Us <span class="nav-drop-arrow">▾</span></button>
      <div class="nav-drop-menu">
        <a href="about.html">Our Mission</a>
        <a href="news.html">Blog &amp; News</a>
        <a href="faq.html">FAQ</a>
      </div>
    </div>
    <div class="nav-dropdown">
      <button class="nav-drop-btn">Get Involved <span class="nav-drop-arrow">▾</span></button>
      <div class="nav-drop-menu">
        <a href="volunteer.html">Volunteer</a>
        <a href="events.html">Cleanup Events</a>
        <a href="submit-proof.html">Submit Proof</a>
        <a href="report-litter.html">Report Litter</a>
        <a href="rewards.html">Earn Rewards</a>
        <a href="prize-portal.html">Prize Portal</a>
      </div>
    </div>
    <div class="nav-dropdown">
      <button class="nav-drop-btn">Education <span class="nav-drop-arrow">▾</span></button>
      <div class="nav-drop-menu">
        <div class="nav-drop-section">Schools</div>
        <a href="volunteer.html">School Partnerships</a>
        <a href="contact.html">Bring LPN to Your School</a>
        <div class="nav-drop-divider"></div>
        <div class="nav-drop-section">Litter &amp; Trash</div>
        <a href="rewards.html">Safety Tips</a>
        <a href="faq.html">Litter Facts &amp; FAQ</a>
        <a href="map.html">Litter Map</a>
      </div>
    </div>
    <div class="nav-dropdown">
      <button class="nav-drop-btn">Contact <span class="nav-drop-arrow">▾</span></button>
      <div class="nav-drop-menu">
        <a href="contact.html">Contact Us</a>
        <a href="sponsors.html">Become a Sponsor</a>
        <a href="faq.html">FAQ</a>
        <a href="contact.html">School Partnerships</a>
      </div>
    </div>
    <a href="login.html" class="nav-signin-btn" id="desktop-nav-auth">Sign In</a>
  `;

  const hamburger = nav.querySelector('.hamburger');
  if (hamburger) nav.insertBefore(el, hamburger);
  else nav.appendChild(el);

  el.querySelectorAll('.nav-dropdown').forEach(dd => {
    dd.querySelector('.nav-drop-btn').addEventListener('click', e => {
      e.stopPropagation();
      const wasOpen = dd.classList.contains('open');
      el.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
      if (!wasOpen) dd.classList.add('open');
    });
  });

  document.addEventListener('click', () => {
    el.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
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
    window.location.href = 'login.html';
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
  const drawer = document.querySelector('.drawer');
  if (drawer) {
    const header = drawer.querySelector('.drawer-header');
    if (header && !header.querySelector('.drawer-user-card')) {
      const card = document.createElement('div');
      card.className = 'drawer-user-card';
      card.innerHTML = `
        <div class="drawer-user-welcome"><span class="en">Welcome back, ${user.user_metadata?.full_name || user.email.split('@')[0]}</span><span class="es">Bienvenido de nuevo, ${user.user_metadata?.full_name || user.email.split('@')[0]}</span></div>
        <div class="drawer-user-points">${points} <span class="en">points</span><span class="es">puntos</span></div>
      `;
      header.appendChild(card);
    }
    const loginLink = drawer.querySelector('a[href="login.html"]');
    if (loginLink) {
      loginLink.href = 'javascript:void(0)';
      loginLink.onclick = async () => {
        const sb = await getLpnSupabase();
        if (sb) await sb.auth.signOut();
        window.location.href = 'login.html';
      };
      loginLink.innerHTML = '<span class="nav-icon">🚪</span><span class="en">Sign Out</span><span class="es">Cerrar Sesión</span>';
    }
  }
  const desktopAuthBtn = document.getElementById('desktop-nav-auth');
  if (desktopAuthBtn) {
    const name = user.user_metadata?.full_name || user.email.split('@')[0];
    desktopAuthBtn.textContent = `${name} (${points} pts)`;
    desktopAuthBtn.href = 'dashboard.html';
    desktopAuthBtn.style.background = '#0F6E56';
  }
}

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
    const heroButtons = hero.querySelector('.hero-buttons');
    if (heroButtons) heroButtons.after(quick);
    else hero.appendChild(quick);
  }
}
