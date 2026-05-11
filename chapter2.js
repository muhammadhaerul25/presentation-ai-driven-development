/* =============================================
   CHAPTER 2 — PRESENTATION ENGINE
   Prompt & Context Engineering for Developers
   ============================================= */

'use strict';

// ── State ────────────────────────────────────
let currentIndex = 0;
let isAnimating  = false;
let touchStartX  = 0;
let touchStartY  = 0;

// ── DOM refs ─────────────────────────────────
const slides      = Array.from(document.querySelectorAll('.slide'));
const totalEl     = document.getElementById('totalSlides');
const currentEl   = document.getElementById('currentSlide');
const progressBar = document.getElementById('progressBar');
const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');

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

  slides.forEach(s => s.classList.remove('active', 'prev'));
  next.classList.add('active');
  if (direction !== 'none') prev.classList.add('prev');

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
  document.title = `Ch.2 · Slide ${currentIndex + 1}/${slides.length} — Prompt & Context Engineering`;
}

function updateControls() {
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === slides.length - 1;
}

// ── Events ───────────────────────────────────
function attachEvents() {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('wheel', debounce(onWheel, 80), { passive: true });
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
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
  if (e.target.closest('button, a, pre, .nav-controls')) return;
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

// ── Utility ──────────────────────────────────
function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

// ── Start ─────────────────────────────────────
init();