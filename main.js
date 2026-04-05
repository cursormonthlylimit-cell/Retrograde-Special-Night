document.addEventListener('DOMContentLoaded', () => {

  /* ── CURSOR GLOW ── */
  const glow = document.getElementById('cursorGlow');
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });

  /* ── SCROLL REVEAL (shared for tickets + terms cards) ── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const i = +(entry.target.dataset.revealIndex || 0);
      setTimeout(() => entry.target.classList.add('revealed'), i * 80);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.07 });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.dataset.revealIndex = i;
    io.observe(el);
  });

  /* ── FLIP CARDS (Terms only) ── */
  let flippedCount = 0;

  document.querySelectorAll('.tcard:not(.tcard-wide)').forEach(card => {
    let flipped = false;
    card.addEventListener('click', () => {
      flipped = !flipped;
      card.classList.toggle('flipped', flipped);
      if (flipped && !card.dataset.counted) {
        card.dataset.counted = '1';
        flippedCount++;
        updateProgress();
      }
    });
  });

  /* Auto-count wide terms cards when visible */
  const wideIo = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const c = entry.target;
      if (!c.dataset.counted) {
        c.dataset.counted = '1';
        flippedCount++;
        updateProgress();
      }
      wideIo.unobserve(c);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.tcard-wide').forEach(c => wideIo.observe(c));

  function updateProgress() {
    const pct = Math.min((flippedCount / 11) * 100, 100);
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressCount').textContent = Math.min(flippedCount, 11) + ' / 11';
  }

  /* ── FILTER TABS (Terms section) ── */
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      document.querySelectorAll('.tcard').forEach((card, idx) => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('hidden-cat', !match);
        if (match) {
          card.classList.remove('revealed');
          setTimeout(() => card.classList.add('revealed'), idx * 55 + 60);
        }
      });
    });
  });

  /* ── PARALLAX on flyer ── */
  const flyerImg = document.getElementById('flyerImg');
  window.addEventListener('scroll', () => {
    if (!flyerImg) return;
    flyerImg.style.transform = `translateY(${window.scrollY * 0.1}px)`;
  }, { passive: true });

  /* ── TICKET CARD hover shimmer ── */
  document.querySelectorAll('.ticket-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
      card.style.transform = `translateY(-4px) rotateX(${-y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

});

/* ── MODAL ── */
function triggerAgree() {
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  spawnParticles();
}
function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

/* ── GOLD PARTICLES ── */
function spawnParticles() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:1100;pointer-events:none;width:100%;height:100%;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const cols = ['#fac800','#fde06a','#f5a623','#c9960e','#fffde0','#fac800'];
  const pts = Array.from({length: 80}, () => ({
    x: canvas.width / 2, y: canvas.height / 2,
    vx: (Math.random() - .5) * 22, vy: (Math.random() - 1.4) * 22,
    sz: Math.random() * 9 + 3,
    col: cols[Math.floor(Math.random() * cols.length)],
    life: 1, g: .48,
    shape: Math.random() > .4 ? 'circle' : 'rect'
  }));
  let raf;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= .017;
      if (p.life <= 0) return;
      alive = true;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.col;
      ctx.beginPath();
      if (p.shape === 'circle') ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
      else ctx.rect(p.x, p.y, p.sz * 2, p.sz * .7);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (alive) raf = requestAnimationFrame(draw);
    else { cancelAnimationFrame(raf); document.body.removeChild(canvas); }
  };
  raf = requestAnimationFrame(draw);
}
