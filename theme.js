// ═══════════════════════════════════════════════
// ESCOBAR PROPERTY SERVICES — THEME ENGINE
// ═══════════════════════════════════════════════
(async function EPS_THEME() {
  const SB_URL = '__PEGA_TU_SUPABASE_URL_AQUI__';  // ← reemplaza esto
  const SB_KEY = '__PEGA_TU_SUPABASE_ANON_KEY_AQUI__';  // ← reemplaza esto
  const H = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY };

  const DEFAULTS = {
    brand_color:   '#2b90c8',
    brand_color_2: '#f26522',
    site_phone:    '678-488-2716',
    site_email:    'info@escobarps.com',
    site_name:     'Escobar Property Services',
    logo_url:      '',
    hero_title:    'Metro Atlanta\'s Property Services Experts',
    hero_subtitle: 'From pressure washing to full home remodeling — family owned, licensed & insured since 2018.',
    hero_video_url:'',
    hero_image_url:'',
    footer_text:   'Family owned and operated property services company serving metro Atlanta since 2018.',
    meta_title:    'Escobar Property Services — Metro Atlanta',
    meta_description: 'Professional pressure washing, soft washing, painting, and more. Serving Metro Atlanta since 2018.',
  };

  // Apply localStorage cache instantly
  const CACHE_KEY = 'eps_theme_v1';
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const r = document.documentElement;
    if (cached.brand_color)   r.style.setProperty('--brand',    cached.brand_color);
    if (cached.brand_color_2) r.style.setProperty('--brand-2',  cached.brand_color_2);
  } catch(e) {}

  // Fetch from Supabase
  let s = { ...DEFAULTS };
  if (SB_URL && SB_URL !== '__SB_URL__') {
    try {
      const r = await fetch(SB_URL + '/rest/v1/site_settings?select=key,value', { headers: H });
      if (r.ok) {
        const rows = await r.json();
        rows.forEach(function(row) { if (row.value) s[row.key] = row.value; });
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(s)); } catch(e) {}
      }
    } catch(e) {}
  }

  window.EPS = { settings: s, SB_URL, SB_KEY, H };

  // Apply CSS vars
  function darken(hex, pct) {
    try {
      hex = hex.replace('#','');
      if (hex.length===3) hex = hex.split('').map(c=>c+c).join('');
      const n = parseInt(hex,16);
      const f = 1 - pct/100;
      return '#'+[((n>>16)&255),((n>>8)&255),(n&255)].map(c=>Math.max(0,Math.round(c*f)).toString(16).padStart(2,'0')).join('');
    } catch(e) { return hex; }
  }
  const r = document.documentElement;
  r.style.setProperty('--brand',      s.brand_color   || '#1a4fa0');
  r.style.setProperty('--brand-dark', darken(s.brand_color   || '#1a4fa0', 20));
  r.style.setProperty('--brand-2',    s.brand_color_2 || '#f26522');
  r.style.setProperty('--brand-2dk',  darken(s.brand_color_2 || '#f26522', 15));

  // Logo
  if (s.logo_url) {
    document.querySelectorAll('.eps-logo-badge').forEach(function(el) {
      const img = document.createElement('img');
      img.src = s.logo_url; img.style.cssText='width:46px;height:46px;object-fit:contain;border-radius:3px';
      el.replaceWith(img);
    });
  }
  if (s.site_name) {
    document.querySelectorAll('.eps-logo-name').forEach(function(el){ el.textContent = s.site_name; });
    document.querySelectorAll('.eps-footer-logo-name').forEach(function(el){ el.textContent = s.site_name; });
  }

  // Phone / Email
  if (s.site_phone) {
    const clean = s.site_phone.replace(/\D/g,'');
    document.querySelectorAll('a[href^="tel:"]').forEach(function(el){ el.href='tel:'+clean; });
    document.querySelectorAll('.eps-phone').forEach(function(el){ el.textContent = s.site_phone; });
  }
  if (s.site_email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(function(el){ el.href='mailto:'+s.site_email; });
    document.querySelectorAll('.eps-email').forEach(function(el){ el.textContent = s.site_email; });
  }

  // Hero
  if (s.hero_title) {
    document.querySelectorAll('.eps-hero-title').forEach(function(el){
      el.innerHTML = s.hero_title.replace(/\n/g,'<br>');
    });
  }
  if (s.hero_subtitle) {
    document.querySelectorAll('.eps-hero-sub').forEach(function(el){ el.textContent = s.hero_subtitle; });
  }
  const heroSection = document.querySelector('.eps-hero');
  if (heroSection) {
    if (s.hero_video_url && s.hero_video_url.trim()) {
      const wrap = document.getElementById('hero-video-wrap');
      if (wrap) {
        let src = '', m;
        if (s.hero_video_url.includes('youtube.com')||s.hero_video_url.includes('youtu.be')) {
          m = s.hero_video_url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
          if (m) src = 'https://www.youtube.com/embed/'+m[1]+'?rel=0';
        } else if (s.hero_video_url.includes('vimeo.com')) {
          m = s.hero_video_url.match(/vimeo\.com\/(\d+)/);
          if (m) src = 'https://player.vimeo.com/video/'+m[1];
        }
        if (src) wrap.innerHTML = '<iframe src="'+src+'" allow="autoplay;fullscreen" allowfullscreen style="width:100%;height:100%;border:none"></iframe>';
        else if (s.hero_video_url.match(/\.(mp4|webm)$/i)) wrap.innerHTML = '<video src="'+s.hero_video_url+'" controls playsinline style="width:100%;height:100%;object-fit:cover"></video>';
      }
    }
    if (s.hero_image_url) {
      heroSection.style.backgroundImage = 'url('+s.hero_image_url+')';
      heroSection.style.backgroundSize  = 'cover';
      heroSection.style.backgroundPosition = 'center';
    }
  }

  // Footer
  if (s.footer_text) {
    document.querySelectorAll('.eps-footer-desc').forEach(function(el){ el.textContent = s.footer_text; });
  }

  // Meta
  if (s.meta_title) document.title = s.meta_title;
  if (s.meta_description) {
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.name='description'; document.head.appendChild(m); }
    m.content = s.meta_description;
  }

  // Lead forms
  document.querySelectorAll('.eps-form').forEach(function(form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const msg = form.querySelector('.eps-form-msg');
      const orig = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';
      const data = {
        name:    (form.querySelector('[name=name]')||{}).value||null,
        email:   (form.querySelector('[name=email]')||{}).value||null,
        phone:   (form.querySelector('[name=phone]')||{}).value||null,
        zip:     (form.querySelector('[name=zip]')||{}).value||null,
        address: (form.querySelector('[name=address]')||{}).value||null,
        message: (form.querySelector('[name=message]')||{}).value||null,
        subject: (form.querySelector('[name=service]')||form.querySelector('[name=subject]')||{}).value||null,
        source:  form.dataset.source || window.location.pathname.split('/').pop() || 'website'
      };
      if (SB_URL && SB_URL !== '__SB_URL__') {
        try {
          const r = await fetch(SB_URL+'/rest/v1/leads', {
            method:'POST', headers:{...H,'Content-Type':'application/json','Prefer':'return=minimal'},
            body: JSON.stringify(data)
          });
          if (!r.ok) throw new Error();
          if (msg) { msg.className='eps-form-msg success'; msg.textContent='✓ Thank you! We will contact you shortly.'; }
          form.reset();
          epsToast('Message sent! We will be in touch soon.');
        } catch(err) {
          if (msg) { msg.className='eps-form-msg error'; msg.textContent='Something went wrong. Please call us directly.'; }
        }
      } else {
        // No Supabase configured yet — show success anyway
        if (msg) { msg.className='eps-form-msg success'; msg.textContent='✓ Thank you! We will contact you shortly.'; }
        form.reset();
        epsToast('Message sent!');
      }
      btn.disabled = false; btn.textContent = orig;
    });
  });

  // Toast
  window.epsToast = function(msg) {
    let t = document.getElementById('eps-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'eps-toast';
      t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:var(--brand-2);color:#fff;padding:13px 22px;border-radius:3px;font-weight:700;font-size:13px;z-index:9999;transform:translateY(100px);opacity:0;transition:all .3s;box-shadow:0 4px 20px rgba(0,0,0,.2)';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(function(){ t.style.transform='translateY(0)'; t.style.opacity='1';
      setTimeout(function(){ t.style.transform='translateY(100px)'; t.style.opacity='0'; }, 3500);
    });
  };

  // FAQ accordion
  document.addEventListener('click', function(e) {
    const q = e.target.closest('.eps-faq-q');
    if (!q) return;
    const item = q.closest('.eps-faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.eps-faq-item.open').forEach(function(i){ i.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
  });

  // Footer year
  document.querySelectorAll('.eps-year').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  // Scroll animations
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { entry.target.classList.add('eps-visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.eps-animate').forEach(function(el){ obs.observe(el); });
  } else {
    document.querySelectorAll('.eps-animate').forEach(function(el){ el.classList.add('eps-visible'); });
  }

})();
