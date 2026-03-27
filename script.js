/* ===========================
   Audio Waveform Canvas Animation
   White-based with blue & pink accents
   =========================== */
class WaveAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.waves = [];
    this.particles = [];
    this.animationId = null;
    this.time = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initWaves();
    this.initParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initWaves() {
    const colors = [
      { r: 74, g: 124, b: 247 },    // blue
      { r: 139, g: 92, b: 246 },    // purple
      { r: 244, g: 114, b: 182 },   // pink
    ];

    for (let i = 0; i < 3; i++) {
      this.waves.push({
        amplitude: 20 + Math.random() * 25,
        frequency: 0.003 + Math.random() * 0.005,
        speed: 0.01 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2,
        color: colors[i],
        yOffset: 0.42 + (i * 0.06),
        lineWidth: 1.5 + Math.random() * 0.5,
      });
    }
  }

  initParticles() {
    const particleColors = [
      { r: 74, g: 124, b: 247 },
      { r: 244, g: 114, b: 182 },
      { r: 139, g: 92, b: 246 },
    ];

    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.15 + 0.05,
        pulse: Math.random() * Math.PI * 2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
      });
    }
  }

  drawWave(wave) {
    const { ctx, canvas } = this;
    const { amplitude, frequency, speed, phase, color, yOffset, lineWidth } = wave;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.12)`;
    ctx.lineWidth = lineWidth;

    const baseY = canvas.height * yOffset;

    for (let x = 0; x < canvas.width; x++) {
      const y = baseY + Math.sin(x * frequency + this.time * speed + phase) * amplitude
        + Math.sin(x * frequency * 1.5 + this.time * speed * 0.7) * (amplitude * 0.2);

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Subtle fill below wave
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, baseY - amplitude, 0, canvas.height);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.02)`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  drawParticles() {
    const { ctx } = this;
    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += 0.015;

      // Wrap around
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      const opacity = p.opacity * (0.5 + Math.sin(p.pulse) * 0.5);
      const { r, g, b } = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.fill();
    });
  }

  animate() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.drawParticles();
    this.waves.forEach(wave => this.drawWave(wave));

    this.time++;
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

/* ===========================
   Counter Animation
   =========================== */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const duration = 2500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      counter.textContent = Math.round(target * eased);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  });
}

/* ===========================
   Scroll Animations (Intersection Observer)
   =========================== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px',
  });

  document.querySelectorAll('.animate-on-scroll').forEach((el, i) => {
    el.dataset.delay = (i % 4) * 120;
    observer.observe(el);
  });

  // Counter animation trigger
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) statsObserver.observe(statsSection);
}

/* ===========================
   Navigation
   =========================== */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Scroll behavior
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Active link highlighting
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = navLinks.querySelector(`a[href="#${id}"]`);

      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          link.style.color = 'var(--text-primary)';
        } else {
          link.style.color = '';
        }
      }
    });
  });
}

/* ===========================
   Contact Form
   =========================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const serviceRadios = document.querySelectorAll('input[name="service"]');
  const mixFields = document.getElementById('mixFields');
  const obsFields = document.getElementById('obsFields');

  // Show/hide conditional fields
  serviceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const value = radio.value;
      mixFields.style.display = (value === 'mix' || value === 'both') ? 'block' : 'none';
      obsFields.style.display = (value === 'obs' || value === 'both') ? 'block' : 'none';
    });
  });

  // Form validation & Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Clear previous errors
    form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    form.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));

    // Name validation
    const name = document.getElementById('name');
    if (!name.value.trim()) {
      showError('name', 'nameError', 'お名前を入力してください');
      isValid = false;
    }

    // Contact method validation
    const contactMethod = document.getElementById('contact-method');
    if (!contactMethod.value) {
      showError('contact-method', 'contactMethodError', '連絡先種別を選択してください');
      isValid = false;
    }

    // Contact ID validation
    const contactId = document.getElementById('contact-id');
    if (!contactId.value.trim()) {
      showError('contact-id', 'contactIdError', '連絡先IDを入力してください');
      isValid = false;
    }

    // Service validation
    const serviceSelected = document.querySelector('input[name="service"]:checked');
    if (!serviceSelected) {
      document.getElementById('serviceError').textContent = 'サービスを選択してください';
      isValid = false;
    }

    if (isValid) {
      const submitBtn = document.getElementById('submitBtn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');

      btnText.style.display = 'none';
      btnLoading.style.display = 'inline-flex';
      submitBtn.disabled = true;

      grecaptcha.ready(function() {
        grecaptcha.execute('6LeXVYgsAAAAAKVdj9Tvd0UlGHY8hpxKeUqboFMX', {action: 'submit'}).then(function(token) {
          
          const formData = new FormData(form);
          formData.append('g-recaptcha-response', token);

          fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
          })
          .then(response => {
            if (response.ok) {
              form.style.display = 'none';
              document.getElementById('formSuccess').style.display = 'block';
            } else {
              response.json().then(data => {
                if (Object.hasOwn(data, 'errors')) {
                  alert(data["errors"].map(error => error["message"]).join(", "));
                } else {
                  alert("送信に失敗しました。時間をおいて再度お試しください。");
                }
              });
            }
          })
          .catch(error => {
            alert("通信エラーが発生しました。ネットワーク環境をご確認ください。");
          })
          .finally(() => {
            btnText.style.display = 'inline-flex';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
          });
        });
      });
    }
  });

  function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add('error');
    document.getElementById(errorId).textContent = message;
  }

  // Clear error on input
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errorEl = input.parentElement.querySelector('.form-error');
      if (errorEl) errorEl.textContent = '';
    });
  });
}

/* ===========================
   Smooth Scroll for Pricing Buttons
   =========================== */
function initPricingButtons() {
  document.querySelectorAll('.pricing-card .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.pricing-card');
      const planName = card.querySelector('.plan-name').textContent;

      setTimeout(() => {
        const cardId = card.id;
        if (cardId.includes('mix')) {
          const mixRadio = document.querySelector('input[name="service"][value="mix"]');
          if (mixRadio) {
            mixRadio.checked = true;
            mixRadio.dispatchEvent(new Event('change'));
          }
        } else if (cardId.includes('obs')) {
          const obsRadio = document.querySelector('input[name="service"][value="obs"]');
          if (obsRadio) {
            obsRadio.checked = true;
            obsRadio.dispatchEvent(new Event('change'));
          }
        }
      }, 500);
    });
  });
}

/* ===========================
   Initialization
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  // Init canvas animation
  new WaveAnimation('waveCanvas');

  // Init components
  initScrollAnimations();
  initNavigation();
  initContactForm();
  initPricingButtons();
});
