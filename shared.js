// Auto-inject nav and drawer on every page
document.addEventListener('DOMContentLoaded', function() {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  const navHTML = `
    <nav>
      <a href="index.html" class="nav-logo">
        <img src="/icons/icon-192.png" alt="LPN" />
        <span>LPN Willis</span>
      </a>
      <button class="hamburger" onclick="openDrawer()">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <div class="drawer-overlay" id="drawer-overlay" onclick="closeDrawer()"></div>
    <div class="drawer" id="drawer">
      <div class="drawer-header">
        <div class="drawer-logo">
          <img src="/icons/icon-192.png" alt="LPN" />
          Litter Prevention Network
        </div>
        <button class="drawer-close" onclick="closeDrawer()">✕</button>
      </div>
      <div class="drawer-nav">
        <a href="index.html" class="${page === 'index.html' ? 'active' : ''}"><span class="nav-icon">🏠</span><span class="en">Home</span><span class="es">Inicio</span></a>
        <a href="events.html" class="${page === 'events.html' ? 'active' : ''}"><span class="nav-icon">📅</span><span class="en">Events</span><span class="es">Eventos</span></a>
        <a href="report-litter.html" class="${page === 'report-litter.html' ? 'active' : ''}"><span class="nav-icon">📍</span><span class="en">Report Litter</span><span class="es">Reportar Basura</span></a>
        <a href="rewards.html" class="${page === 'rewards.html' ? 'active' : ''}"><span class="nav-icon">🏆</span><span class="en">Rewards</span><span class="es">Recompensas</span></a>
        <a href="volunteer.html" class="${page === 'volunteer.html' ? 'active' : ''}"><span class="nav-icon">🙌</span><span class="en">Volunteer</span><span class="es">Voluntario</span></a>
        <a href="submit-proof.html" class="${page === 'submit-proof.html' ? 'active' : ''}"><span class="nav-icon">📸</span><span class="en">Submit Proof</span><span class="es">Enviar Prueba</span></a>
        <a href="prize-portal.html" class="${page === 'prize-portal.html' ? 'active' : ''}"><span class="nav-icon">🎁</span><span class="en">Prize Portal</span><span class="es">Portal de Premios</span></a>
        <div class="drawer-divider"></div>
        <a href="dashboard.html" class="${page === 'dashboard.html' ? 'active' : ''}"><span class="nav-icon">📊</span><span class="en">My Dashboard</span><span class="es">Mi Panel</span></a>
        <a href="login.html" class="${page === 'login.html' ? 'active' : ''}"><span class="nav-icon">🔐</span><span class="en">Login</span><span class="es">Iniciar Sesión</span></a>
      </div>
      <div class="drawer-footer-note">© 2026 Litter Prevention Network · Willis, TX</div>
    </div>
  `;

  const footerHTML = `
    <footer class="site-footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="/icons/icon-192.png" alt="LPN Logo" />
          <h3>Litter Prevention Network</h3>
          <p class="en">Keeping Willis, TX clean — one cleanup at a time.</p>
          <p class="es">Manteniendo Willis, TX limpio — una limpieza a la vez.</p>
          <div class="footer-contact">
            📍 Willis, TX<br/>
            📧 <a href="mailto:stanley@litterpreventionnetwork.org">stanley@litterpreventionnetwork.org</a>
          </div>
          <div class="footer-social">
            <a href="https://facebook.com/litterpreventionnetwork" target="_blank" title="Facebook">f</a>
            <a href="https://instagram.com/litterpreventionnetwork" target="_blank" title="Instagram">ig</a>
            <a href="https://tiktok.com/@litterpreventionnetwork" target="_blank" title="TikTok">tt</a>
          </div>
        </div>
        <div class="footer-col">
          <h4><span class="en">Navigate</span><span class="es">Navegar</span></h4>
          <a href="index.html"><span class="en">Home</span><span class="es">Inicio</span></a>
          <a href="events.html"><span class="en">Events</span><span class="es">Eventos</span></a>
          <a href="report-litter.html"><span class="en">Report Litter</span><span class="es">Reportar Basura</span></a>
          <a href="rewards.html"><span class="en">Rewards</span><span class="es">Recompensas</span></a>
        </div>
        <div class="footer-col">
          <h4><span class="en">Get Involved</span><span class="es">Participa</span></h4>
          <a href="volunteer.html"><span class="en">Volunteer</span><span class="es">Voluntario</span></a>
          <a href="submit-proof.html"><span class="en">Submit Proof</span><span class="es">Enviar Prueba</span></a>
          <a href="prize-portal.html"><span class="en">Prize Portal</span><span class="es">Portal de Premios</span></a>
          <a href="login.html"><span class="en">Sign In</span><span class="es">Iniciar Sesión</span></a>
        </div>
        <div class="footer-col">
          <h4><span class="en">About</span><span class="es">Acerca de</span></h4>
          <a href="about.html"><span class="en">Our Mission</span><span class="es">Nuestra Misión</span></a>
          <a href="faq.html"><span class="en">FAQ</span><span class="es">Preguntas Frecuentes</span></a>
          <a href="contact.html"><span class="en">Contact Us</span><span class="es">Contáctanos</span></a>
          <a href="news.html"><span class="en">News & Updates</span><span class="es">Noticias</span></a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Litter Prevention Network · Willis, TX</span>
        <div style="display:flex;gap:20px;">
          <a href="faq.html"><span class="en">FAQ</span><span class="es">FAQ</span></a>
          <a href="about.html"><span class="en">About</span><span class="es">Acerca de</span></a>
          <a href="contact.html"><span class="en">Contact</span><span class="es">Contacto</span></a>
        </div>
      </div>
    </footer>
  `;

  // Inject nav after lang-bar
  const langBar = document.querySelector('.lang-bar');
  if (langBar) langBar.insertAdjacentHTML('afterend', navHTML);

  // Replace old footer
  const oldFooter = document.querySelector('footer');
  if (oldFooter) oldFooter.outerHTML = footerHTML;

  // Apply saved language
  const saved = localStorage.getItem('lpn-lang');
  if (saved) setLang(saved);
});

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