/* ===========================
   Audio Waveform Canvas Animation
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
      { r: 168, g: 85, b: 247 },   // purple
      { r: 6, g: 182, b: 212 },     // cyan
      { r: 124, g: 58, b: 237 },    // violet
      { r: 8, g: 145, b: 178 },     // dark cyan
      { r: 236, g: 72, b: 153 },    // pink
    ];

    for (let i = 0; i < 5; i++) {
      this.waves.push({
        amplitude: 30 + Math.random() * 40,
        frequency: 0.005 + Math.random() * 0.01,
        speed: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
        color: colors[i],
        yOffset: 0.4 + (i * 0.05),
        lineWidth: 1.5 + Math.random(),
      });
    }
  }

  initParticles() {
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  drawWave(wave) {
    const { ctx, canvas } = this;
    const { amplitude, frequency, speed, phase, color, yOffset, lineWidth } = wave;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.15)`;
    ctx.lineWidth = lineWidth;

    const baseY = canvas.height * yOffset;

    for (let x = 0; x < canvas.width; x++) {
      const y = baseY + Math.sin(x * frequency + this.time * speed + phase) * amplitude
        + Math.sin(x * frequency * 1.5 + this.time * speed * 0.7) * (amplitude * 0.3);

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Fill below wave with subtle gradient
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, baseY - amplitude, 0, canvas.height);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.03)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  drawParticles() {
    const { ctx } = this;
    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += 0.02;

      // Wrap around
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      const opacity = p.opacity * (0.5 + Math.sin(p.pulse) * 0.5);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168, 85, 247, ${opacity})`;
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
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
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
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Staggered delay for grid items
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  });

  document.querySelectorAll('.animate-on-scroll').forEach((el, i) => {
    el.dataset.delay = (i % 4) * 100;
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
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
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
    const scrollY = window.scrollY + 100;
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
    // HTML標準の画面遷移をブロックする（裏側で通信するため）
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
      // ボタンを「送信中...」のローディング状態に変更
      const submitBtn = document.getElementById('submitBtn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');

      btnText.style.display = 'none';
      btnLoading.style.display = 'inline-flex';
      submitBtn.disabled = true;

      // Google reCAPTCHA v3 のトークン（人間である証明）を裏側で取得
      // ※ '6LeXVYgsAAAAAKVdj9Tvd0UlGHY8hpxKeUqboFMX' を実際のものに書き換えること
      grecaptcha.ready(function() {
        grecaptcha.execute('6LeXVYgsAAAAAKVdj9Tvd0UlGHY8hpxKeUqboFMX', {action: 'submit'}).then(function(token) {
          
          // フォームのデータを自動で収集し、取得したトークンを密かに追加
          const formData = new FormData(form);
          formData.append('g-recaptcha-response', token);

          // Fetch APIを使ってFormspreeへ裏側からデータを送信
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
            // ボタンの状態を元に戻す
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
      // Add visual feedback
      const card = btn.closest('.pricing-card');
      const planName = card.querySelector('.plan-name').textContent;

      // Scroll to contact and pre-select service
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
