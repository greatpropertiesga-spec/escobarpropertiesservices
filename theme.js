// ═══════════════════════════════════════════════════════
// ESCOBAR PROPERTY SERVICES — SITE ENGINE
// ═══════════════════════════════════════════════════════
(async function EPS_THEME() {

  const SB_URL = 'https://cqwvnvcjxbeskvyqrank.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxd3ZudmNqeGJlc2t2eXFyYW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjg5OTMsImV4cCI6MjA4ODYwNDk5M30.pavJBT9fpyoKPH9zbn-9pcUY72gaOB6qL76QMCtFoWw';
  const H = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY };
  const CACHE_KEY = 'eps_settings_v1';

  // ── DEFAULTS ────────────────────────────────────────
  const DEFAULTS = {
    site_phone:      '678-488-2716',
    site_email:      'info@escobarps.com',
    site_address:    'PO Box 1252, Lilburn, GA 30048',
    hero_title:      'Metro Atlanta\'s Trusted\nProperty Services',
    hero_subtitle:   'From pressure washing to full home remodeling — we keep your property looking its best. Licensed, insured, and family owned.',
    hero_cta_text:   'Get Free Estimate',
    hero_image_url:  '',
    hero_video_url:  '',
    about_text:      'Escobar Property Services, LLC (EPS) is a family owned and operated company that always provides the best property services. Founded with a simple goal: to provide the best commercial and residential services for metro Atlanta and surrounding areas.',
  };

  // ── LOAD CACHE INSTANTLY ────────────────────────────
  let s = { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      Object.keys(cached).forEach(k => { if (cached[k]) s[k] = cached[k]; });
    }
  } catch(e) {}

  // ── EXPOSE GLOBALLY (before fetch so pages don't wait) ──
  window.EPS = { settings: s, SB_URL, SB_KEY, H };

  // Apply immediately
  applySettings(s);

  // ── FETCH FRESH FROM SUPABASE ────────────────────────
  try {
    const r = await fetch(SB_URL + '/rest/v1/eps_settings?select=key,value', { headers: H });
    if (r.ok) {
      const rows = await r.json();
      const fresh = { ...DEFAULTS };
      rows.forEach(row => { if (row.value) fresh[row.key] = row.value; });
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(fresh)); } catch(e) {}
      applySettings(fresh);
      s = fresh;
      window.EPS.settings = s;
    }
  } catch(e) {}

  // ── APPLY ────────────────────────────────────────────
  function applySettings(cfg) {
    // Phone
    if (cfg.site_phone) {
      const clean = cfg.site_phone.replace(/\D/g,'');
      document.querySelectorAll('a[href^="tel:"]').forEach(el => el.href = 'tel:' + clean);
      document.querySelectorAll('.eps-phone').forEach(el => el.textContent = cfg.site_phone);
    }
    // Email
    if (cfg.site_email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(el => el.href = 'mailto:' + cfg.site_email);
      document.querySelectorAll('.eps-email').forEach(el => el.textContent = cfg.site_email);
    }
    // Hero
    if (cfg.hero_title) {
      document.querySelectorAll('.eps-hero-title').forEach(el => el.innerHTML = cfg.hero_title.replace(/\n/g,'<br>'));
    }
    if (cfg.hero_subtitle) {
      document.querySelectorAll('.eps-hero-sub').forEach(el => el.textContent = cfg.hero_subtitle);
    }
    if (cfg.hero_cta_text) {
      document.querySelectorAll('.eps-hero-cta').forEach(el => el.textContent = cfg.hero_cta_text);
    }
    // Hero bg
    if (cfg.hero_image_url) {
      document.querySelectorAll('.eps-hero-bg').forEach(el => el.style.backgroundImage = 'url(' + cfg.hero_image_url + ')');
    }
    // Hero video
    if (cfg.hero_video_url) {
      const vw = document.getElementById('eps-hero-video');
      if (vw) {
        let src = '';
        const vid = cfg.hero_video_url;
        if (vid.includes('youtube.com') || vid.includes('youtu.be')) {
          const m = vid.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
          if (m) src = 'https://www.youtube.com/embed/' + m[1] + '?autoplay=1&mute=1&loop=1&controls=0&playlist=' + m[1];
        } else if (vid.includes('vimeo.com')) {
          const m = vid.match(/vimeo\.com\/(\d+)/);
          if (m) src = 'https://player.vimeo.com/video/' + m[1] + '?autoplay=1&muted=1&loop=1&background=1';
        }
        if (src) {
          vw.innerHTML = '<iframe src="' + src + '" style="position:absolute;inset:0;width:100%;height:100%;border:none;pointer-events:none" allow="autoplay"></iframe>';
          vw.style.display = 'block';
          document.querySelector('.eps-hero-bg') && (document.querySelector('.eps-hero-bg').style.display = 'none');
        } else if (vid.match(/\.(mp4|webm)$/i)) {
          vw.innerHTML = '<video src="' + vid + '" autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></video>';
          vw.style.display = 'block';
        }
      }
    }
    // About text
    if (cfg.about_text) {
      document.querySelectorAll('.eps-about-text').forEach(el => el.textContent = cfg.about_text);
    }
  }

  // ── FORMS → SUPABASE (eps_leads table) ─────────────
  document.querySelectorAll('.eps-form').forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const msg = form.querySelector('.eps-form-msg');
      const orig = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';
      const data = {
        name:    (form.querySelector('[name=name]')    ||{}).value || null,
        email:   (form.querySelector('[name=email]')   ||{}).value || null,
        phone:   (form.querySelector('[name=phone]')   ||{}).value || null,
        zip:     (form.querySelector('[name=zip]')     ||{}).value || null,
        address: (form.querySelector('[name=address]') ||{}).value || null,
        service: (form.querySelector('[name=service]') ||{}).value || null,
        message: (form.querySelector('[name=message]') ||{}).value || null,
        source:  form.dataset.source || window.location.pathname.split('/').pop() || 'website',
        created_at: new Date().toISOString()
      };
      try {
        const r = await fetch(SB_URL + '/rest/v1/eps_leads', {
          method: 'POST',
          headers: { ...H, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify(data)
        });
        if (!r.ok) throw new Error();
        if (msg) { msg.className = 'eps-form-msg success'; msg.textContent = '✓ Thank you! We will contact you within 24 hours.'; }
        form.reset();
        epsToast('Message sent! We\'ll be in touch shortly.');
      } catch(err) {
        if (msg) { msg.className = 'eps-form-msg error'; msg.textContent = 'Something went wrong. Please call us directly.'; }
      }
      btn.disabled = false; btn.textContent = orig;
    });
  });

  // ── TOAST ─────────────────────────────────────────────
  window.epsToast = function(msg) {
    let t = document.getElementById('eps-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'eps-toast';
      t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:var(--orange);color:#fff;padding:13px 20px;border-radius:4px;font-family:var(--font-h);font-weight:700;font-size:14px;letter-spacing:.3px;text-transform:uppercase;z-index:9999;transform:translateY(80px);opacity:0;transition:all .3s ease;box-shadow:0 8px 24px rgba(232,108,31,.4)';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => { t.style.transform = 'translateY(0)'; t.style.opacity = '1'; });
    setTimeout(() => { t.style.transform = 'translateY(80px)'; t.style.opacity = '0'; }, 3500);
  };

  // ── FAQ ACCORDION ────────────────────────────────────
  document.addEventListener('click', function(e) {
    const q = e.target.closest('.eps-faq-q');
    if (!q) return;
    const item = q.closest('.eps-faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.eps-faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });

  // ── YEAR ──────────────────────────────────────────────
  document.querySelectorAll('.eps-year').forEach(el => el.textContent = new Date().getFullYear());

  // ── SCROLL ANIMATIONS ────────────────────────────────
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('eps-visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.eps-animate').forEach(el => obs.observe(el));
  } else {
    document.querySelectorAll('.eps-animate').forEach(el => el.classList.add('eps-visible'));
  }

  // ── GALLERY LIGHTBOX ─────────────────────────────────
  let galleryImages = [];
  let lbIdx = 0;
  window.epsOpenLightbox = function(imgs, idx) {
    galleryImages = imgs; lbIdx = idx;
    const lb = document.getElementById('eps-lightbox');
    if (!lb) return;
    document.getElementById('eps-lb-img').src = galleryImages[lbIdx];
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.epsLightboxNav = function(dir) {
    lbIdx = (lbIdx + dir + galleryImages.length) % galleryImages.length;
    document.getElementById('eps-lb-img').src = galleryImages[lbIdx];
  };
  window.epsCloseLightbox = function() {
    const lb = document.getElementById('eps-lightbox');
    if (lb) lb.classList.remove('open');
    document.body.style.overflow = '';
  };
  document.addEventListener('keydown', e => {
    const lb = document.getElementById('eps-lightbox');
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') epsLightboxNav(-1);
    if (e.key === 'ArrowRight') epsLightboxNav(1);
    if (e.key === 'Escape') epsCloseLightbox();
  });

})();
