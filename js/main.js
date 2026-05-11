// ─── Custom Cursor ───────────────────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX  = mouseX;
let ringY  = mouseY;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
  dot.classList.remove('hidden');
  ring.classList.remove('hidden');
});

document.addEventListener('mouseleave', () => {
  dot.classList.add('hidden');
  ring.classList.add('hidden');
});

(function lerpRing() {
  ringX += (mouseX - ringX) * 0.1;
  ringY += (mouseY - ringY) * 0.1;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(lerpRing);
})();

document.querySelectorAll('a, button, .g-item, .tags span').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

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
const msSection  = document.getElementById('music');
const msCardsEl  = document.getElementById('msCards');
const msCards    = [...document.querySelectorAll('.ms-card')];
const msDots     = [...document.querySelectorAll('.ms-dot')];
const msNumEl    = document.getElementById('msNum');
const msInfoNum  = document.getElementById('msInfoNum');
const msTitle    = document.getElementById('msInfoTitle');
const msSub      = document.getElementById('msInfoSub');
const msBtn      = document.getElementById('msInfoBtn');
const msFill     = document.getElementById('msProgressFill');
const MS_TOTAL   = msCards.length;

const MS_CARD_W  = 260;
const MS_GAP     = 80;
const MS_STEP    = MS_CARD_W + MS_GAP;

let msLastIdx = -1;

// ── Animated info update ──────────────────────────────────
function updateMusicInfo(idx) {
  const data = msCards[idx]?.dataset || {};
  const numStr = String(idx + 1).padStart(2, '0');

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

  // Sub fade-out → swap → fade-in
  if (msSub) {
    msSub.classList.add('ms-out');
    setTimeout(() => {
      msSub.textContent = `${data.feat || ''} · ${data.streams || ''}`;
      msSub.classList.remove('ms-out');
    }, 200);
  }

  // Number flip
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

  if (msFill) msFill.style.width = (progress * 100) + '%';

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
if (heroImg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroImg.style.transform = `translateY(${y * 0.35}px)`;
    }
  }, { passive: true });
}

// ─── Scroll Reveal ───────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});
