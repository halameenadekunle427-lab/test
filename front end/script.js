/*============================================
   PORTFOLIO — script.js
   ============================================ */

/* ── 1. HEADER: shrink + blur on scroll ── */
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* Inject the .scrolled style dynamically */
const headerStyle = document.createElement('style');
headerStyle.textContent = `
  header {
    transition: padding 0.4s ease, backdrop-filter 0.4s ease,
                background 0.4s ease, box-shadow 0.4s ease;
  }
  header.scrolled {
    padding: 14px 48px;
    background: rgba(245, 240, 232, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 2px 24px rgba(0,0,0,0.07);
    mix-blend-mode: normal;
  }
`;
document.head.appendChild(headerStyle);


/* ── 2. CURSOR: custom dot + ring ── */
const cursorDot  = document.createElement('div');
const cursorRing = document.createElement('div');
cursorDot.id  = 'cursor-dot';
cursorRing.id = 'cursor-ring';
document.body.append(cursorDot, cursorRing);

const cursorStyle = document.createElement('style');
cursorStyle.textContent = `
  * { cursor: none !important; }

  #cursor-dot {
    position: fixed; top: 0; left: 0;
    width: 6px; height: 6px;
    background: var(--accent);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: width 0.2s, height 0.2s, background 0.2s;
  }

  #cursor-ring {
    position: fixed; top: 0; left: 0;
    width: 36px; height: 36px;
    border: 1.5px solid var(--accent);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: transform 0.12s ease, width 0.3s ease,
                height 0.3s ease, border-color 0.3s ease, opacity 0.3s;
    opacity: 0.6;
  }

  body:has(a:hover) #cursor-ring,
  body:has(button:hover) #cursor-ring {
    width: 56px; height: 56px;
    opacity: 1;
    border-color: var(--gold);
  }
`;
document.head.appendChild(cursorStyle);

let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  cursorDot.style.left  = e.clientX + 'px';
  cursorDot.style.top   = e.clientY + 'px';

  /* ring lags slightly for a fluid feel */
  ringX += (e.clientX - ringX) * 0.18;
  ringY += (e.clientY - ringY) * 0.18;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
});

/* smooth ring loop */
(function animateRing() {
  requestAnimationFrame(animateRing);
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
})();


/* ── 3. STAT COUNTERS: count-up on viewport entry ── */
const statNums = document.querySelectorAll('.stat-num');

function parseTarget(el) {
  const raw = el.textContent.trim();          // e.g. "3+" or "10"
  return { value: parseInt(raw), suffix: raw.replace(/\d/g, '') };
}

function countUp(el, target, suffix, duration = 1400) {
  let start = null;
  el.textContent = '0' + suffix;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);          // ease-out cubic
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const { value, suffix } = parseTarget(el);
      countUp(el, value, suffix);
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(n => statsObserver.observe(n));


/* ── 4. HERO TEXT: word-by-word reveal on load ── */
const heroName = document.querySelector('.hero-name');
if (heroName) {
  const html = heroName.innerHTML;

  /* split text nodes into <span> words, preserve <em> and <br> */
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  let wordIdx = 0;
  function wrapTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(/(\s+)/);
      const frag  = document.createDocumentFragment();
      words.forEach(w => {
        if (w.trim()) {
          const span = document.createElement('span');
          span.className = 'reveal-word';
          span.style.cssText = `
            display: inline-block;
            opacity: 0;
            transform: translateY(22px);
            transition: opacity 0.5s ease ${0.3 + wordIdx * 0.12}s,
                        transform 0.5s ease ${0.3 + wordIdx * 0.12}s;
          `;
          span.textContent = w;
          frag.appendChild(span);
          wordIdx++;
        } else {
          frag.appendChild(document.createTextNode(w));
        }
      });
      node.replaceWith(frag);
    } else {
      [...node.childNodes].forEach(wrapTextNodes);
    }
  }

  [...tmp.childNodes].forEach(wrapTextNodes);
  heroName.innerHTML = '';
  heroName.appendChild(tmp);

  /* trigger after a short delay */
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal-word').forEach(s => {
      s.style.opacity   = '1';
      s.style.transform = 'translateY(0)';
    });
  });
}


/* ── 5. PARALLAX: hero image drifts on mouse move ── */
const heroImgBox = document.querySelector('.hero-img-box');
const heroRight  = document.querySelector('.hero-right');

if (heroRight && heroImgBox) {
  heroRight.addEventListener('mousemove', e => {
    const rect   = heroRight.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / rect.width;   // –0.5 … 0.5
    const dy     = (e.clientY - cy) / rect.height;

    heroImgBox.style.transform = `
      perspective(600px)
      rotateY(${dx * 8}deg)
      rotateX(${-dy * 6}deg)
      translateZ(8px)
    `;
  });

  heroRight.addEventListener('mouseleave', () => {
    heroImgBox.style.transition = 'transform 0.6s ease';
    heroImgBox.style.transform  = 'perspective(600px) rotateY(0) rotateX(0) translateZ(0)';
  });

  heroRight.addEventListener('mouseenter', () => {
    heroImgBox.style.transition = 'transform 0.1s ease';
  });
}


/* ── 6. SCROLL INDICATOR: hide when user scrolls ── */
const scrollIndicator = document.querySelector('.hero-scroll');
if (scrollIndicator) {
  window.addEventListener('scroll', () => {
    scrollIndicator.style.opacity = window.scrollY > 100 ? '0' : '1';
    scrollIndicator.style.transition = 'opacity 0.4s ease';
  });
}


/* ── 7. NAVBAR ACTIVE LINK highlight ── */
const navLinks = document.querySelectorAll('.navbar a');
const current  = location.pathname.split('/').pop();

navLinks.forEach(link => {
  if (link.getAttribute('href') === current) {
    link.style.cssText += `
      color: var(--accent);
    `;
    link.style.setProperty('--active', '1');
  }
});


/* ── 8. MAGNETIC BUTTONS ── */
document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const dx   = e.clientX - (rect.left + rect.width  / 2);
    const dy   = e.clientY - (rect.top  + rect.height / 2);
    btn.style.transform    = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
    btn.style.transition   = 'transform 0.1s ease';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform  = 'translate(0,0)';
    btn.style.transition = 'transform 0.4s ease';
  });
});


/* ── 9. GRAIN OVERLAY texture ── */
const grainStyle = document.createElement('style');
grainStyle.textContent = `
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9990;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px 180px;
  }
`;
document.head.appendChild(grainStyle);
  // Mobile menu toggle
        const toggle = document.getElementById('menuToggle');
        const mobileNav = document.getElementById('mobileNav');
        toggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
            toggle.classList.toggle('active');
        });
        
