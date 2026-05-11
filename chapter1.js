/* =============================================
   CHAPTER 1 — PRESENTATION ENGINE
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
  document.title = `Ch.1 · Slide ${currentIndex + 1}/${slides.length} — AI Changed the Industry`;
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

// ── Vibe Video — Autoplay + Loop ─────────────
// Twitter/X embeds can't autoplay. We use the fxtwitter API
// to resolve the real .mp4 URL, then drive a native <video>.
function setupVibeVideo() {
  const video    = document.getElementById('vibeVideo');
  const fallback = document.getElementById('vibeFallback');
  if (!video) return;

  const TWEET_ID = '1924399746447269963';

  // Candidates: fxtwitter JSON API → actual mp4 URL
  const apiUrl = `https://api.fxtwitter.com/status/${TWEET_ID}`;

  fetch(apiUrl)
    .then(r => r.json())
    .then(data => {
      // fxtwitter returns tweet.media.videos[0].url for video tweets
      const mp4 = data?.tweet?.media?.videos?.[0]?.url
                || data?.tweet?.media?.all?.[0]?.url;
      if (mp4) {
        video.src = mp4;
        video.load();
        video.play().catch(() => {});
        fallback.style.display = 'none';
      } else {
        showFallback();
      }
    })
    .catch(() => showFallback());

  // Also listen for native video error just in case
  video.addEventListener('error', showFallback);

  // Give it 5s before showing fallback
  const timer = setTimeout(showFallback, 5000);
  video.addEventListener('canplay', () => {
    clearTimeout(timer);
    fallback.style.display = 'none';
    video.play().catch(() => {});
  });

  function showFallback() {
    clearTimeout(timer);
    video.style.display = 'none';
    fallback.style.display = 'flex';
  }
}

// ── Start ─────────────────────────────────────
init();
setupVibeVideo();