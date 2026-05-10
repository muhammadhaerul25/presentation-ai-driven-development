/* =============================================
   PRESENTATION ENGINE
   ============================================= */

'use strict';

// ── State ────────────────────────────────────
let currentIndex = 0;
let isAnimating = false;
let touchStartX = 0;
let touchStartY = 0;

// ── DOM refs ─────────────────────────────────
const slides        = Array.from(document.querySelectorAll('.slide'));
const totalEl       = document.getElementById('totalSlides');
const currentEl     = document.getElementById('currentSlide');
const progressBar   = document.getElementById('progressBar');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');

// ── Init ─────────────────────────────────────
function init() {
  totalEl.textContent = slides.length;
  goTo(0, 'none');
  updateControls();
  attachEvents();
}

// ── Navigation ───────────────────────────────
function goTo(index, direction = 'next') {
  if (isAnimating) return;
  if (index < 0 || index >= slides.length) return;

  isAnimating = true;

  const prev = slides[currentIndex];
  const next = slides[index];

  // Remove all state classes
  slides.forEach(s => s.classList.remove('active', 'prev'));

  // Activate
  next.classList.add('active');
  if (direction !== 'none') {
    prev.classList.add('prev');
  }

  currentIndex = index;
  updateHUD();
  updateControls();

  setTimeout(() => {
    slides.forEach(s => s.classList.remove('prev'));
    isAnimating = false;
  }, 550);
}

function nextSlide() {
  if (currentIndex < slides.length - 1) goTo(currentIndex + 1, 'next');
}

function prevSlide() {
  if (currentIndex > 0) goTo(currentIndex - 1, 'prev');
}

// ── HUD Update ───────────────────────────────
function updateHUD() {
  currentEl.textContent = currentIndex + 1;

  const progress = ((currentIndex + 1) / slides.length) * 100;
  progressBar.style.width = progress + '%';

  document.title = `Slide ${currentIndex + 1}/${slides.length} — AI-Driven Development`;
}

function updateControls() {
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === slides.length - 1;
}

// ── Events ───────────────────────────────────
function attachEvents() {
  // Keyboard
  document.addEventListener('keydown', onKeyDown);

  // Mouse wheel (debounced)
  document.addEventListener('wheel', debounce(onWheel, 80), { passive: true });

  // Touch
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });

  // Click zones (click right half = next, left half = prev)
  document.getElementById('slidesContainer').addEventListener('click', onContainerClick);
}

function onKeyDown(e) {
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      e.preventDefault();
      nextSlide();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      prevSlide();
      break;
    case 'Home':
      e.preventDefault();
      goTo(0, 'none');
      break;
    case 'End':
      e.preventDefault();
      goTo(slides.length - 1, 'next');
      break;
    case 'f':
    case 'F':
      toggleFullscreen();
      break;
    case 'Escape':
      if (document.fullscreenElement) toggleFullscreen();
      break;
  }
}

function onWheel(e) {
  if (e.deltaY > 0) nextSlide();
  else prevSlide();
}

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function onTouchEnd(e) {
  const dx = touchStartX - e.changedTouches[0].clientX;
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    dx > 0 ? nextSlide() : prevSlide();
  }
}

function onContainerClick(e) {
  // Ignore clicks on nav buttons, interactive elements, or code blocks
  if (e.target.closest('button, a, pre, .code-block, .nav-controls, .slide-map')) return;
  const x = e.clientX / window.innerWidth;
  if (x > 0.65) nextSlide();
  else if (x < 0.35) prevSlide();
}

// ── Fullscreen ───────────────────────────────
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}

// ── Slide Map Toggle ─────────────────────────
function toggleSlideMap() {
  // Simple: jump to a prompted slide number
  const num = parseInt(prompt(`Go to slide (1–${slides.length}):`));
  if (!isNaN(num) && num >= 1 && num <= slides.length) {
    const dir = num - 1 > currentIndex ? 'next' : 'prev';
    goTo(num - 1, dir);
  }
}

// ── Utility ──────────────────────────────────
function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

// ── Context Diagram Lines ────────────────────
// Draw SVG connector lines between the center and each pill
function drawContextLines() {
  const diagram = document.querySelector('.context-diagram');
  if (!diagram) return;

  const core = diagram.querySelector('.ctx-core');
  if (!core) return;

  let svg = diagram.querySelector('.ctx-svg-lines');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('ctx-svg-lines');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;';
    diagram.appendChild(svg);
  }

  svg.innerHTML = '';

  const dRect = diagram.getBoundingClientRect();
  const cRect = core.getBoundingClientRect();
  const cx = cRect.left - dRect.left + cRect.width / 2;
  const cy = cRect.top - dRect.top + cRect.height / 2;

  const pills = diagram.querySelectorAll('.ctx-pill');
  const colors = ['#4285F4','#EA4335','#FBBC04','#34A853','#4285F4','#EA4335'];

  pills.forEach((pill, i) => {
    const pRect = pill.getBoundingClientRect();
    const px = pRect.left - dRect.left + pRect.width / 2;
    const py = pRect.top - dRect.top + pRect.height / 2;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', px);
    line.setAttribute('y2', py);
    line.setAttribute('stroke', colors[i]);
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-opacity', '0.25');
    line.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(line);
  });
}

// Context diagram observer (slide-8 removed from deck)

// ── Start ─────────────────────────────────────
init();