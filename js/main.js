// ─── Preloader ───────────────────────────────────────────
const preloader  = document.getElementById('preloader');
const preBarFill = document.getElementById('preBarFill');
let preProgress  = 0;

// Simula progresso de carregamento
const preInterval = setInterval(() => {
  preProgress += Math.random() * 18;
  if (preProgress > 90) preProgress = 90;
  if (preBarFill) preBarFill.style.width = preProgress + '%';
}, 120);

window.addEventListener('load', () => {
  clearInterval(preInterval);
  if (preBarFill) preBarFill.style.width = '100%';
  setTimeout(() => {
    if (preloader) preloader.classList.add('hide');
    document.body.style.overflow = '';
  }, 350);
});

// Bloqueia scroll enquanto preloader está visível
document.body.style.overflow = 'hidden';

// ─── Navbar ──────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });
navbar.classList.toggle('scrolled', window.scrollY > 60);

// ─── Hamburger ───────────────────────────────────────────
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ─── Hero Title — Split & Animate ────────────────────────
function splitAndAnimate(el) {
  const text = el.textContent;
  el.innerHTML = text.split('').map(char =>
    `<span class="char"><span class="char-inner">${char === ' ' ? '&nbsp;' : char}</span></span>`
  ).join('');

  requestAnimationFrame(() => {
    setTimeout(() => {
      el.classList.add('animated');
      el.querySelectorAll('.char-inner').forEach((c, i) => {
        c.style.transitionDelay = `${0.04 + i * 0.055}s`;
      });
    }, 200);
  });
}

const heroTitle = document.getElementById('heroTitle');
if (heroTitle) splitAndAnimate(heroTitle);

// Fade in supporting hero elements
setTimeout(() => {
  document.getElementById('heroTag')?.classList.add('visible');
  document.getElementById('heroSub')?.classList.add('visible');
  document.getElementById('heroActions')?.classList.add('visible');
}, 180);

// ─── Music — Horizontal Scroll Carousel ──────────────────
const msSection    = document.getElementById('music');
const msCardsEl    = document.getElementById('msCards');
const msCards      = [...document.querySelectorAll('.ms-card')];
const msDots       = [...document.querySelectorAll('.ms-dot')];
const msNumEl      = document.getElementById('msNum');
const msInfoNum    = document.getElementById('msInfoNum');
const msTitle      = document.getElementById('msInfoTitle');
const msSub        = document.getElementById('msInfoSub');
const msBtn        = document.getElementById('msInfoBtn');
const msFill       = document.getElementById('msProgressFill');
const msPlayerArt  = document.getElementById('msPlayerArt');
const msPlayerStr  = document.getElementById('msPlayerStreams');
const msTimeA      = document.getElementById('msPlayerTimeA');
const msTimeB      = document.getElementById('msPlayerTimeB');
const msPlayerEl   = document.getElementById('msPlayer');
const msPlayBtn    = document.getElementById('msPlayBtn');
const MS_TOTAL     = msCards.length;

// Fake durations per track
const MS_DURATIONS = [
  '3:02','3:45','2:58','3:31','2:47',
  '3:14','3:08','2:52','3:27','3:19'
];

// Play button toggle (visual only)
let msIsPlaying = false;
if (msPlayBtn) {
  msPlayBtn.addEventListener('click', () => {
    msIsPlaying = !msIsPlaying;
    msPlayerEl?.classList.toggle('playing', msIsPlaying);
  });
}

// Sync scrubber thumb with fill position
function setPlayerThumb(pct) {
  const thumb = document.querySelector('.ms-player-thumb');
  if (thumb) thumb.style.left = (pct * 100).toFixed(1) + '%';
}

const MS_CARD_W  = 260;
const MS_GAP     = 80;
const MS_STEP    = MS_CARD_W + MS_GAP;

let msLastIdx = -1;

// ── Animated info update ──────────────────────────────────
function updateMusicInfo(idx) {
  const data   = msCards[idx]?.dataset || {};
  const numStr = String(idx + 1).padStart(2, '0');
  const dur    = MS_DURATIONS[idx] || '3:00';

  // Title slide-out → swap → slide-in
  if (msTitle) {
    msTitle.classList.add('ms-out');
    setTimeout(() => {
      msTitle.textContent = data.title || '';
      msTitle.classList.remove('ms-out');
      msTitle.classList.add('ms-in');
      requestAnimationFrame(() => requestAnimationFrame(() => msTitle.classList.remove('ms-in')));
    }, 220);
  }

  // Artist fade
  if (msSub) {
    msSub.classList.add('ms-out');
    setTimeout(() => {
      msSub.textContent = data.feat || '';
      msSub.classList.remove('ms-out');
    }, 200);
  }

  // Album art swap in player
  if (msPlayerArt) {
    const artEl = msCards[idx]?.querySelector('.ms-card-art');
    const bg    = artEl ? artEl.style.backgroundImage : '';
    msPlayerArt.style.backgroundImage = bg;
  }

  // Streams
  if (msPlayerStr) {
    msPlayerStr.classList.add('ms-out');
    setTimeout(() => {
      msPlayerStr.textContent = data.streams || '';
      msPlayerStr.classList.remove('ms-out');
    }, 200);
  }

  // Duration labels
  if (msTimeB) msTimeB.textContent = dur;
  if (msTimeA) msTimeA.textContent = '0:00';

  // Number flip (hidden compat element)
  const numInner = msInfoNum?.querySelector('.ms-info-num-inner');
  if (numInner) {
    numInner.classList.add('ms-flip-out');
    setTimeout(() => {
      numInner.textContent = numStr;
      numInner.classList.remove('ms-flip-out');
      numInner.classList.add('ms-flip-in');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        numInner.style.transition = 'transform 0.45s var(--ease-out), opacity 0.3s ease';
        numInner.classList.remove('ms-flip-in');
      }));
    }, 220);
  }

  if (msBtn)   msBtn.href = data.href || '#';
  if (msNumEl) msNumEl.textContent = numStr;
  msDots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

// ── Mouse 3D tilt ────────────────────────────────────────
let msTiltRX = 0, msTiltRY = 0;
let msTiltTargetX = 0, msTiltTargetY = 0;
let msActiveCard = null;
let msTiltActive = false;

const msSticky = document.querySelector('.ms-sticky');
if (msSticky) {
  msSticky.addEventListener('mousemove', e => {
    msActiveCard = document.querySelector('.ms-card[data-active="true"]');
    if (!msActiveCard) return;
    const rect = msActiveCard.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    msTiltTargetY =  ((e.clientX - cx) / (rect.width  / 2)) * 14;
    msTiltTargetX = -((e.clientY - cy) / (rect.height / 2)) * 9;
    msTiltActive = true;
  });

  msSticky.addEventListener('mouseleave', () => {
    msTiltTargetX = 0;
    msTiltTargetY = 0;
    msTiltActive = false;
  });
}

// Lerp tilt loop
(function tiltLoop() {
  msTiltRX += (msTiltTargetX - msTiltRX) * 0.1;
  msTiltRY += (msTiltTargetY - msTiltRY) * 0.1;

  if (Math.abs(msTiltRX) > 0.05 || Math.abs(msTiltRY) > 0.05 || msTiltActive) {
    const card = document.querySelector('.ms-card[data-active="true"]');
    if (card) {
      const scale = msTiltActive ? 1.04 : 1;
      card.style.transform = `scale(${scale}) rotateY(${msTiltRY}deg) rotateX(${msTiltRX}deg)`;
    }
  }
  requestAnimationFrame(tiltLoop);
})();

// ── Scroll logic ─────────────────────────────────────────
function updateMusicCarousel() {
  if (!msSection || !msCardsEl) return;

  const rect       = msSection.getBoundingClientRect();
  const scrollable = msSection.offsetHeight - window.innerHeight;
  const progress   = Math.max(0, Math.min(1, -rect.top / scrollable));

  if (msFill) {
    const pct = progress * 100;
    msFill.style.width = pct + '%';
    setPlayerThumb(progress);

    // Update elapsed time label based on scroll progress within current track
    const dur   = MS_DURATIONS[Math.round(progress * (MS_TOTAL - 1))] || '3:00';
    const parts = dur.split(':');
    const total = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    // progress within the current card window
    const cardProgress = (progress * (MS_TOTAL - 1)) % 1;
    const elapsed = Math.round(cardProgress * total);
    if (msTimeA) msTimeA.textContent = `${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`;
  }

  const targetFloat = progress * (MS_TOTAL - 1);
  const activeIdx   = Math.round(targetFloat);

  const viewCenter = window.innerWidth / 2;
  const tx = viewCenter - (targetFloat * MS_STEP + MS_CARD_W / 2);
  msCardsEl.style.transform = `translateY(-50%) translateX(${tx}px)`;

  msCards.forEach((card, i) => {
    const d    = i - targetFloat;
    const absD = Math.abs(d);
    const isActive = activeIdx === i;
    const scale   = Math.max(0.7, 1 - absD * 0.1);
    const rotate  = d * 6;
    const opacity = Math.max(0.28, 1 - absD * 0.25);
    card.dataset.active = isActive ? 'true' : 'false';
    // Don't override active card if tilt is in control
    if (!isActive) {
      card.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
      card.style.opacity   = opacity;
    } else {
      card.style.opacity = '1';
    }
  });

  if (activeIdx !== msLastIdx) {
    updateMusicInfo(activeIdx);
    msLastIdx = activeIdx;
  }
}

updateMusicCarousel();
window.addEventListener('scroll', updateMusicCarousel, { passive: true });

// ─── Parallax Hero ───────────────────────────────────────
const heroImg = document.getElementById('heroImg');
const heroSection = document.getElementById('hero');

// scroll parallax
let heroScrollY = 0;
if (heroImg) {
  window.addEventListener('scroll', () => {
    heroScrollY = window.scrollY;
    if (heroScrollY < window.innerHeight * 1.2) {
      applyHeroTransform();
    }
  }, { passive: true });
}

// mouse parallax — só a imagem se move
let heroMX = 0, heroMY = 0;
let heroTX = 0, heroTY = 0;
let heroRafId = null;

if (heroSection && heroImg) {
  heroSection.addEventListener('mousemove', e => {
    const cx = heroSection.offsetWidth  / 2;
    const cy = heroSection.offsetHeight / 2;
    heroMX = ((e.clientX - cx) / cx) * 18;   // ±18px horizontal
    heroMY = ((e.clientY - cy) / cy) * 12;   // ±12px vertical
    if (!heroRafId) heroRafId = requestAnimationFrame(lerpHero);
  });

  heroSection.addEventListener('mouseleave', () => {
    heroMX = 0;
    heroMY = 0;
  });
}

function lerpHero() {
  heroTX += (heroMX - heroTX) * 0.07;
  heroTY += (heroMY - heroTY) * 0.07;
  applyHeroTransform();
  heroRafId = requestAnimationFrame(lerpHero);
}

function applyHeroTransform() {
  if (!heroImg) return;
  const scrollShift = heroScrollY * 0.35;
  heroImg.style.transform = `translate(${heroTX}px, calc(${heroTY}px + ${scrollShift}px))`;
}

// ─── Scroll Reveal ───────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px 0px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .g-wipe').forEach(el => {
  revealObserver.observe(el);
});

// Fallback: revela itens já visíveis no carregamento (ex: navegação via #hash)
setTimeout(() => {
  document.querySelectorAll('.g-wipe:not(.visible), .reveal-up:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      el.classList.add('visible');
    }
  });
}, 50);

// ─── Gallery — 3D tilt on hover ──────────────────────────
document.querySelectorAll('.g-item').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect  = card.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const rx    = -((e.clientY - cy) / (rect.height / 2)) * 6;
    const ry    =  ((e.clientX - cx) / (rect.width  / 2)) * 8;
    card.style.transform = `scale(1.03) rotateX(${rx}deg) rotateY(${ry}deg)`;
    const img = card.querySelector('img');
    if (img) img.style.transform = `scale(1.06) translateX(${ry * -0.8}px) translateY(${rx * 0.8}px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    const img = card.querySelector('img');
    if (img) img.style.transform = '';
  });
});

// ─── 2. Glitch periódico no título ───────────────────────
const glitchTitle = document.getElementById('heroTitle');
if (glitchTitle) {
  const triggerGlitch = () => {
    glitchTitle.classList.add('glitching');
    setTimeout(() => glitchTitle.classList.remove('glitching'), 520);
  };
  // Primeiro glitch após 3s, depois a cada 5-8s aleatório
  setTimeout(function scheduleGlitch() {
    triggerGlitch();
    setTimeout(scheduleGlitch, 5000 + Math.random() * 3000);
  }, 3000);
}

// ─── 3. Equalizer no hero ────────────────────────────────
const heroEq = document.getElementById('heroEq');
if (heroEq) {
  const BAR_COUNT = 32;
  for (let i = 0; i < BAR_COUNT; i++) {
    const span = document.createElement('span');
    const dur  = (0.5 + Math.random() * 0.9).toFixed(2) + 's';
    const del  = (-Math.random() * 2).toFixed(2) + 's';
    span.style.setProperty('--d', dur);
    span.style.animationDelay = del;
    heroEq.appendChild(span);
  }
}

// ─── 4. Stats counter ────────────────────────────────────
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el       = entry.target;
    const target   = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0');
    const duration = 1800;
    const start    = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val  = target * ease;
      el.textContent = decimals > 0 ? val.toFixed(decimals) : Math.floor(val);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
    };
    requestAnimationFrame(tick);
    statsObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statsObserver.observe(el));

// ─── 5. Lightbox ─────────────────────────────────────────
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lbImg');
const lbClose   = document.getElementById('lbClose');
const lbPrev    = document.getElementById('lbPrev');
const lbNext    = document.getElementById('lbNext');
const lbBackdrop = document.getElementById('lbBackdrop');
const lbCurrent = document.getElementById('lbCurrent');
const lbTotal   = document.getElementById('lbTotal');

// Recolhe todas as imagens da galeria
const galleryImgs = [...document.querySelectorAll('.g-item img')];
let lbIndex = 0;

if (lbTotal) lbTotal.textContent = galleryImgs.length;

function lbOpen(idx) {
  lbIndex = idx;
  lbImg.src = galleryImgs[idx].src;
  lbImg.alt = galleryImgs[idx].alt;
  if (lbCurrent) lbCurrent.textContent = idx + 1;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function lbClose_fn() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function lbNavigate(dir) {
  const wrap    = document.querySelector('.lb-img-wrap');
  lbIndex = (lbIndex + dir + galleryImgs.length) % galleryImgs.length;
  wrap.classList.add('lb-transition');
  setTimeout(() => {
    lbImg.src = galleryImgs[lbIndex].src;
    lbImg.alt = galleryImgs[lbIndex].alt;
    if (lbCurrent) lbCurrent.textContent = lbIndex + 1;
    wrap.classList.remove('lb-transition');
  }, 200);
}

// Abre ao clicar na imagem
galleryImgs.forEach((img, i) => {
  img.parentElement.style.cursor = 'pointer';
  img.parentElement.addEventListener('click', () => lbOpen(i));
});

if (lbClose)   lbClose.addEventListener('click', lbClose_fn);
if (lbBackdrop) lbBackdrop.addEventListener('click', lbClose_fn);
if (lbPrev)    lbPrev.addEventListener('click', () => lbNavigate(-1));
if (lbNext)    lbNext.addEventListener('click', () => lbNavigate(1));

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      lbClose_fn();
  if (e.key === 'ArrowLeft')   lbNavigate(-1);
  if (e.key === 'ArrowRight')  lbNavigate(1);
});
