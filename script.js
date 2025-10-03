// Utility: DOM ready
function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

ready(()=>{
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  navToggle?.addEventListener('click', ()=> document.body.classList.toggle('nav-open'));
  document.querySelectorAll('.main-nav a').forEach(a=> a.addEventListener('click', ()=> document.body.classList.remove('nav-open')));

  // Current year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Demo modal removed (no video yet)

  // Simple sparkline generator for placeholders
  function drawSpark(el){
    if(!el) return;
    const c = document.createElement('canvas');
    const w = el.clientWidth || 110;
    const h = el.clientHeight || 60;
    c.width = w * devicePixelRatio; c.height = h * devicePixelRatio; c.style.width = w+'px'; c.style.height = h+'px';
    const ctx = c.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    // background grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for(let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(0, (h/5)*i); ctx.lineTo(w,(h/5)*i); ctx.stroke(); }
    // random path
    ctx.beginPath();
    ctx.lineWidth = 2;
    const grad = ctx.createLinearGradient(0,0,w,0);
    grad.addColorStop(0,'#10B981'); grad.addColorStop(1,'#F59E0B');
    ctx.strokeStyle = grad;
    let y = h * (0.3 + Math.random()*0.4);
    ctx.moveTo(0,y);
    for(let x=0;x<=w;x+=w/24){
      y += (Math.random()-0.5) * 12;
      if(y < 10) y = 10; if(y > h-10) y = h-10;
      ctx.lineTo(x,y);
    }
    ctx.stroke();
    el.appendChild(c);
  }
  ['miniChart1','spark1','spark2','spark3'].forEach(id=> drawSpark(document.getElementById(id)));

  // Intersection reveal
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.section h2, .feature-card, .step-card, .testimonial, .waitlist-form, .faq-list details').forEach((el,i)=>{
    el.classList.add('reveal','delay-'+(i%3));
    observer.observe(el);
  });

  // Waitlist form -> Google Apps Script integration
  const form = document.getElementById('waitlistForm');
  const msg = document.getElementById('formMessage');
  const submitBtn = document.getElementById('waitlistSubmit');
  // TODO: Replace with your deployed Google Apps Script Web App URL
  // Load endpoint URL (hardcoded fallback) – can be overridden by window.INDMON_ENDPOINT injected via local config
  const APPS_SCRIPT_URL = (window.INDMON_ENDPOINT || 'https://script.google.com/macros/s/AKfycbwbSzsfqNLwr3OOvpjn2qw_1p_svpUZYC4MHDYOGVLONn_SkP4wisG1H04LNZ1IQo6z/exec').trim();

  // Simple duplicate submission guard (per session)
  const submittedEmails = new Set();

  function setMessage(text, type='info'){
    if(!msg) return;
    msg.textContent = text;
    msg.style.color = type === 'error' ? '#ef4444' : (type === 'success' ? '#10B981' : '');
  }

  function validateField(name, test){
    const input = form.querySelector('[name='+name+']');
    const errorEl = form.querySelector('[data-error-for='+name+']');
    if(!input) return true;
    const value = input.value.trim();
    let error = '';
    if(!value) error = 'Required';
    else if(test && !test(value)) error = 'Invalid';
    errorEl.textContent = error;
    return !error;
  }

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    setMessage('');
    const validators = [
      validateField('email', v=> /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)),
      validateField('name'),
      validateField('phone', v=> /^[+]?\d[\d\s-]{6,}$/.test(v)),
      validateField('broker'),
      validateField('experience')
    ];
    if(validators.includes(false)) { setMessage('Please correct the highlighted fields.', 'error'); return; }

    // Prepare payload
    const honeypot = form.querySelector('input[name="website"]');
    if(honeypot && honeypot.value){
      setMessage('Bot detected.', 'error');
      submitBtn.disabled = false; submitBtn.textContent = originalText; return;
    }

    const normPhone = (raw => {
      if(!raw) return '';
      let p = raw.replace(/[^0-9]/g,'');
      if(p.startsWith('0')) p = p.slice(1);
      if(p.length === 10) p = '+91'+p; else if(p.startsWith('91') && p.length===12) p = '+'+p; else if(p.startsWith('91') && p.length===10) p = '+91'+p; // edge
      return p;
    })(form.phone.value.trim());

    const payload = {
      email: form.email.value.trim().toLowerCase(),
      name: form.name.value.trim(),
      phone: normPhone,
      broker: form.broker.value,
      experience: form.experience.value
    };

    if(submittedEmails.has(payload.email)){
      setMessage('You are already added (this session).', 'success');
      submitBtn.disabled = false; submitBtn.textContent = originalText; return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting…';
    setMessage('Submitting...');

    try {
      if (APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
        setMessage('Backend URL not configured. Please add your Google Apps Script deployment URL.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
      }
      // Use application/x-www-form-urlencoded to avoid CORS preflight with Apps Script
      const formBody = new URLSearchParams(payload).toString();
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: formBody,
        mode: 'no-cors' // Apps Script won't set CORS headers; no-cors prevents blocking (response opaque)
      });
      // In no-cors mode we get an opaque response; assume success if no network error
      form.reset();
      setMessage('🎉 You\'re on the waitlist! We\'ll email you soon with access details.', 'success');
      submittedEmails.add(payload.email);
      const successModal = document.getElementById('successModal');
      if(successModal){ try { successModal.showModal(); } catch(_){} }
      // Decrement mock counter locally
    } catch(err){
      setMessage('Submission failed: '+ err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // Success modal close handlers
  document.querySelectorAll('[data-success-close]')?.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const dlg = document.getElementById('successModal');
      if(dlg?.open) dlg.close();
    })
  });

  // Real-time field clear errors
  form?.querySelectorAll('input, select').forEach(el=>{
    el.addEventListener('input', ()=>{
      const name = el.getAttribute('name');
      const err = form.querySelector('[data-error-for='+name+']');
      if(err && err.textContent) { err.textContent=''; }
      if(msg && msg.textContent.includes('Please correct')) msg.textContent='';
    });
  });

  // Accessibility: trap focus in modal when open
  // (demo modal removed)
});
