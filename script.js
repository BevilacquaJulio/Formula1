/**
 * ══════════════════════════════════════════════════════════════
 * Cinematic frame-scrubbing animation → site page transition
 * ══════════════════════════════════════════════════════════════
 *
 * HOW FRAME FILENAMES ARE CONSTRUCTED
 * ─────────────────────────────────────
 * Path  : FRAME_PREFIX + zero-padded index + FRAME_SUFFIX
 * Example: nova_animacao_img/Car_transforms_into_blueprint_delpmaspu_ - Trim_007.jpg
 * encodeURI() encodes spaces → %20 while preserving the path slashes.
 * Never use encodeURIComponent() here; it would encode "/" as well.
 *
 * KEY CONSTANTS TO TWEAK
 * ─────────────────────
 * FRAME_END           – last frame index (0-based). Change if you add frames.
 * WHEEL_SENSITIVITY   – progress change per pixel of deltaY (mode=0).
 *                       Raise for faster scrub; lower for slow/precise.
 * LERP_FACTOR         – smoothing per rAF tick (0=frozen, 1=instant).
 * OVERLAY_START       – progress at which the text overlay begins to appear.
 * TRANSITION_HOLD_MS  – how long progress must stay at 1.0 before the site
 *                       page is revealed (trackpad stability guard).
 *
 * HOW THE TRANSITION IS TRIGGERED  (Approach A)
 * ──────────────────────────────────────────────
 * When currentProgress settles at ≥ 0.999 for TRANSITION_HOLD_MS milliseconds
 * continuously, enterSite() fires exactly once:
 *   1. Removes the wheel scrubbing listener so no more frame updates.
 *   2. Adds .is-visible to #site → CSS transition fades it in over the canvas.
 *   3. After the fade completes (SITE_FADE_MS), hides #stage and both overlays to
 *      free GPU memory, and marks #site as accessible.
 * If the user scrolls back before the hold expires, the timer resets.
 *
 * HOW OVERLAY INTERFERENCE IS PREVENTED
 * ──────────────────────────────────────
 * #overlay-intro, #overlay-end and #site are siblings of #stage, NOT descendants.
 * Neither uses backdrop-filter or an opaque/semiopaque background panel.
 * These choices avoid the compositing-artifact "cut" that would otherwise
 * appear when a new stacking context is created on top of a <canvas>.
 */

// ─── Dev: skip animation (set to false to restore full animation) ─────────────
const DEV_SKIP_ANIMATION = false;

// ─── Frame sequence constants ─────────────────────────────────────────────────

const FRAME_START = 0;
const FRAME_END = 48;       // ← CHANGE if you add / remove frames
const FRAME_PAD = 3;        // zero-pad width → "000"
const FRAME_PREFIX = 'nova_animacao_img/Car_transforms_into_blueprint_delpmaspu_ - Trim_';
const FRAME_SUFFIX = '.jpg';
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1; // 49

function frameURL(n) {
  const padded = String(n).padStart(FRAME_PAD, '0');
  return encodeURI(`${FRAME_PREFIX}${padded}${FRAME_SUFFIX}`);
}

// ─── Scrubbing constants ──────────────────────────────────────────────────────

// Mouse wheel: deltaY ≈ 100 px/notch → 0.0008 × 100 = 0.08 progress/notch
// (≈ 5.4 frames per notch). Trackpads fire many small deltas naturally.
const WHEEL_SENSITIVITY = 0.0008; // ← raise for faster scrub

// Fraction of gap closed per rAF tick. 0.10 @ 60 fps ≈ 0.5 s to settle.
const LERP_FACTOR = 0.10; // ← raise (e.g. 0.20) for a snappier feel

// Progress at which the intro overlay (title) finishes fading OUT (0 = fully visible → fade done)
const OVERLAY_INTRO_END = 0.30;

// Progress at which the end overlay ("scroll down") begins to fade IN
const OVERLAY_START = 0.90;

// ─── Transition constants ─────────────────────────────────────────────────────

// Duration of the #site CSS fade-in/out (must match CSS transition duration).
const SITE_FADE_MS = 780;

// After exiting back to the animation, block re-entry for this many ms.
const EXIT_COOLDOWN_MS = 1200;

// Total scroll delta (pixels) required to fill each progress circle.
// Higher = slower progression, more deliberate intent.
const SCROLL_EXIT_THRESHOLD = 1800;  // scroll up at top → return to animation
const SCROLL_ENTER_THRESHOLD = 1800;  // scroll down at end → enter website

// ─── State ────────────────────────────────────────────────────────────────────

let targetProgress = 0;   // set by wheel events
let currentProgress = 0;   // smoothed via lerp
let lastDrawnFrame = -1;  // avoids redundant drawImage calls

let cleanupTimer = null;  // setTimeout for post-fade GPU cleanup
let siteEntered = false; // true while the site page is active
let exitCooldownEnd = 0;    // timestamp after which re-entry is allowed

// Scroll-driven progress (0..1). Enter: scroll down at end increases. Exit: scroll up at top increases.
let enterProgressAccum = 0;
let exitProgressAccum = 0;

const frames = new Array(TOTAL_FRAMES).fill(null); // Image cache

// ─── DOM references ───────────────────────────────────────────────────────────

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const stage = document.getElementById('stage');
const overlayIntro = document.getElementById('overlay-intro');
const overlayEnd = document.getElementById('overlay-end');
const site = document.getElementById('site');
const exitHint = document.getElementById('exit-hint');
const exitHintFill = document.getElementById('exit-hint-fill');
const enterHint = document.getElementById('enter-hint');
const enterHintFill = document.getElementById('enter-hint-fill');

const EXIT_CIRCLE_CIRCUMFERENCE = 125.6; // 2 * π * 20

// ─── Canvas sizing (HiDPI, "cover" strategy) ──────────────────────────────────

let stageW = 0, stageH = 0;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  stageW = stage.clientWidth;
  stageH = stage.clientHeight;

  canvas.width = Math.round(stageW * dpr);
  canvas.height = Math.round(stageH * dpr);
  canvas.style.width = stageW + 'px';
  canvas.style.height = stageH + 'px';

  // Scale context: all subsequent draw calls use logical CSS pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawFrame(progressToFrameIndex(currentProgress));
}

window.addEventListener('resize', resizeCanvas);

// ─── Frame index ──────────────────────────────────────────────────────────────

function progressToFrameIndex(p) {
  const c = Math.max(0, Math.min(1, p));
  return Math.round(c * (TOTAL_FRAMES - 1));
}

// ─── Canvas draw ("cover") ────────────────────────────────────────────────────

function drawFrame(index) {
  const img = frames[index];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const scale = Math.max(stageW / img.naturalWidth, stageH / img.naturalHeight);
  const dW = img.naturalWidth * scale;
  const dH = img.naturalHeight * scale;
  const offX = (stageW - dW) / 2;
  const offY = (stageH - dH) / 2;

  ctx.clearRect(0, 0, stageW, stageH);
  ctx.drawImage(img, offX, offY, dW, dH);
  lastDrawnFrame = index;
}

// ─── Overlay update ───────────────────────────────────────────────────────────

// We always include translateX(-50%) in the transform string because JS
// overwrites the inline style; omitting it would undo the CSS centering.
function updateOverlay(p) {
  // Intro overlay: fully visible at frame 0, fades out by OVERLAY_INTRO_END
  const introT = Math.max(0, Math.min(1, 1 - p / OVERLAY_INTRO_END));
  overlayIntro.style.opacity = introT;

  // End overlay: invisible at start, fades in from OVERLAY_START → 1.0
  // No position animation — CTA appears in place (green rectangle) with opacity fade only
  const endT = Math.max(0, Math.min(1, (p - OVERLAY_START) / (1 - OVERLAY_START)));
  overlayEnd.style.opacity = endT;
  overlayEnd.style.transform = 'translate(-50%, -50%)';

  // Enter hint visible when overlay-end is visible (last frame); circle fills on scroll
  if (endT > 0) {
    enterHint.classList.add('is-active');
    enterHint.setAttribute('aria-hidden', 'false');
  } else {
    enterHint.classList.remove('is-active');
    enterHint.setAttribute('aria-hidden', 'true');
  }
}

// ─── Enter hint progress (scroll-driven, same logic as exit) ───────────────────

function updateEnterHintProgress(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const offset = EXIT_CIRCLE_CIRCUMFERENCE * (1 - p);
  enterHintFill.style.strokeDashoffset = String(offset);
  // Hint visibility is controlled by updateOverlay (when overlay-end is visible)
}

// ─── Site transition ──────────────────────────────────────────────────────────

function enterSite() {
  if (siteEntered) return;
  siteEntered = true;

  enterProgressAccum = 0;
  updateEnterHintProgress(0);

  // Canvas stays frozen on the last frame underneath; stop scrubbing it.
  stage.removeEventListener('wheel', onWheel);

  // Fade out the end overlay while site fades in.
  overlayEnd.style.transition = 'opacity 0.4s ease';
  overlayEnd.style.opacity = '0';
  enterHint.classList.remove('is-active');

  // Reveal site page (0.75 s CSS transition — see #site.is-visible in CSS).
  site.setAttribute('aria-hidden', 'false');
  site.classList.add('is-visible');

  // After the fade, hide the animation layer to free GPU memory.
  // Save the handle so exitSite() can cancel this if the user exits early.
  cleanupTimer = setTimeout(() => {
    cleanupTimer = null;
    stage.style.display = 'none';
    overlayIntro.style.display = 'none';
    overlayEnd.style.display = 'none';
  }, SITE_FADE_MS);
}

// ─── Exit hint progress (scroll-driven) ──────────────────────────────────────

function updateExitHintProgress(progress) {
  const offset = EXIT_CIRCLE_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));
  exitHintFill.style.strokeDashoffset = String(offset);

  if (progress > 0) {
    exitHint.classList.add('is-active');
    exitHint.setAttribute('aria-hidden', 'false');
  } else {
    exitHint.classList.remove('is-active');
    exitHint.setAttribute('aria-hidden', 'true');
  }
}

// ─── Exit site → return to animation ─────────────────────────────────────────

/**
 * Called when exit progress reaches 1.0 (scroll-driven).
 * Reverses the transition: site fades out, canvas scrub resumes from frame 67.
 */
function exitSite() {
  if (!siteEntered) return;
  siteEntered = false;

  exitProgressAccum = 0;
  enterProgressAccum = 0;
  updateExitHintProgress(0);
  updateEnterHintProgress(0);

  // Block re-entry for EXIT_COOLDOWN_MS so the stability timer can't
  // immediately re-trigger enterSite() while the user is still scrolling up.
  exitCooldownEnd = Date.now() + EXIT_COOLDOWN_MS;

  // Cancel the GPU-cleanup timer if it hasn't fired yet (we need the stage).
  if (cleanupTimer) {
    clearTimeout(cleanupTimer);
    cleanupTimer = null;
  }

  // Restore animation layer immediately (it renders behind the fading site).
  stage.style.display = '';
  overlayIntro.style.display = '';
  overlayEnd.style.display = '';

  // Restore end overlay transition to the short JS-driven value.
  overlayEnd.style.transition = 'opacity 0.04s linear';

  // Force a canvas resize/redraw in case the window was resized while in site.
  resizeCanvas();

  // Disable site interaction immediately; CSS fade-out handles the visual.
  site.style.pointerEvents = 'none';
  site.classList.remove('is-visible');

  // Once the CSS fade-out is done, fully reset site pointer-events via class.
  setTimeout(() => {
    site.style.pointerEvents = '';
    site.setAttribute('aria-hidden', 'true');
  }, SITE_FADE_MS);

  // Scroll #site back to top silently so the next entry starts clean.
  site.scrollTop = 0;

  // Resume scrubbing from the last frame; user scrolls up to go backward.
  targetProgress = 1;
  currentProgress = 1;
  lastDrawnFrame = -1; // force redraw on next tick

  stage.addEventListener('wheel', onWheel, { passive: false });
}

// ─── rAF loop ─────────────────────────────────────────────────────────────────

function tick() {
  requestAnimationFrame(tick);

  if (!siteEntered) {
    // Lerp toward targetProgress
    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.00005) {
      currentProgress += diff * LERP_FACTOR;
    } else {
      currentProgress = targetProgress;
    }

    // When user scrubs back from the end, reset enter progress
    if (currentProgress < 0.999) {
      enterProgressAccum = 0;
      updateEnterHintProgress(0);
    }

    const frameIndex = progressToFrameIndex(currentProgress);

    if (frameIndex !== lastDrawnFrame) {
      // Walk back to nearest loaded frame to prevent blank flicker
      let draw = frameIndex;
      while (draw >= 0 && (!frames[draw] || !frames[draw].complete)) {
        draw--;
      }
      if (draw >= 0) drawFrame(draw);
    }

    updateOverlay(currentProgress);
  }
}

// ─── Wheel handler ────────────────────────────────────────────────────────────

// { passive: false } is required so that preventDefault() can block the
// default scroll action. Passive listeners ignore preventDefault() calls.
function onWheel(e) {
  let delta = e.deltaY;
  if (e.deltaMode === 1) delta *= 20;   // Firefox: lines → pixels
  if (e.deltaMode === 2) delta *= 400;  // pages → pixels

  const atEnd = currentProgress >= 0.999;

  if (atEnd) {
    // At end: scroll-driven enter progress (same logic as exit)
    const inCooldown = Date.now() < exitCooldownEnd;
    if (delta > 0) {
      e.preventDefault();
      if (!inCooldown) {
        enterProgressAccum += delta / SCROLL_ENTER_THRESHOLD;
        enterProgressAccum = Math.min(1, enterProgressAccum);
        updateEnterHintProgress(enterProgressAccum);
        if (enterProgressAccum >= 1) enterSite();
      }
    } else {
      // Scroll up → decrease enter progress, or scrub back if already 0
      if (enterProgressAccum > 0) {
        e.preventDefault();
        enterProgressAccum += delta / SCROLL_ENTER_THRESHOLD; // delta < 0
        enterProgressAccum = Math.max(0, enterProgressAccum);
        updateEnterHintProgress(enterProgressAccum);
      } else {
        // Allow scrubbing back into the animation
        e.preventDefault();
        targetProgress = Math.max(0, Math.min(1, targetProgress + delta * WHEEL_SENSITIVITY));
      }
    }
  } else {
    e.preventDefault();
    targetProgress = Math.max(0, Math.min(1, targetProgress + delta * WHEEL_SENSITIVITY));
  }
}

if (!DEV_SKIP_ANIMATION) {
  stage.addEventListener('wheel', onWheel, { passive: false });
}

// ─── Exit-to-animation wheel trigger on #site ─────────────────────────────────

/**
 * Progress is scroll-driven: scroll up at top increases it, scroll down decreases it.
 * No timer — the circle fills slowly as the user scrolls. User can cancel anytime
 * by scrolling down. exitSite() fires only when progress reaches 1.0.
 */
site.addEventListener('wheel', (e) => {
  if (!siteEntered) return;

  let delta = e.deltaY;
  if (e.deltaMode === 1) delta *= 20;
  if (e.deltaMode === 2) delta *= 400;

  const atTop = site.scrollTop <= 0;

  if (!atTop && exitProgressAccum <= 0) return; // only consider exit progress at top or if partially filled

  if (delta < 0) {
    // Scroll up → increase progress
    if (atTop) {
      e.preventDefault();
      exitProgressAccum += (-delta) / SCROLL_EXIT_THRESHOLD;
    }
  } else {
    // Scroll down → decrease progress (cancel)
    if (exitProgressAccum > 0) {
      e.preventDefault(); // This is the crucial line: Prevent the natural scroll down effect!
      exitProgressAccum -= delta / SCROLL_EXIT_THRESHOLD;
    }
  }

  exitProgressAccum = Math.max(0, Math.min(1, exitProgressAccum));
  updateExitHintProgress(exitProgressAccum);

  if (exitProgressAccum >= 1) {
    exitSite();
  }
}, { passive: false });

// ─── About timeline stagger reveal ────────────────────────────────────────────

(function initTimelineReveal() {
  const items = document.querySelectorAll('.tl-item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(el => observer.observe(el));

  window.addEventListener('load', () => {
    items.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        setTimeout(() => el.classList.add('visible'), i * 100);
      }
    });
  });
})();

// ─── Gallery carousel (Photo Gallery) ─────────────────────────────────────────

(function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const counterCurrent = document.getElementById('counterCurrent');
  const counterTotal = document.getElementById('counterTotal');
  const progressFill = document.getElementById('carouselProgressFill');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  const thumbnailsContainer = document.getElementById('carouselThumbnails');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track) return;

  const slides = [...track.querySelectorAll('.slide')];
  const total = slides.length;
  let current = 0;
  let autoTimer = null;
  let progressTimer = null;
  let progressVal = 0;
  const DURATION = 5000;
  const INTERVAL = 50;

  if (counterTotal) counterTotal.textContent = String(total).padStart(2, '0');

  function goTo(index) {
    slides[current].classList.remove('active');
    const thumbs = [...thumbnailsContainer.querySelectorAll('.thumb')];
    const dots = [...dotsContainer.querySelectorAll('.dot')];
    if (thumbs[current]) thumbs[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');

    current = (index + total) % total;

    slides[current].classList.add('active');
    if (thumbs[current]) thumbs[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
    track.style.transform = `translateX(-${current * 100}%)`;
    if (counterCurrent) counterCurrent.textContent = String(current + 1).padStart(2, '0');

    if (thumbs[current] && thumbnailsContainer) {
      const thumb = thumbs[current];
      const thumbLeft = thumb.offsetLeft;
      const thumbCenter = thumbLeft + thumb.offsetWidth / 2;
      const containerCenter = thumbnailsContainer.clientWidth / 2;
      thumbnailsContainer.scrollTo({
        left: thumbCenter - containerCenter,
        behavior: 'smooth'
      });
    }

    resetProgress();
  }

  function resetProgress() {
    clearInterval(progressTimer);
    clearInterval(autoTimer);
    progressVal = 0;
    if (progressFill) progressFill.style.width = '0%';

    progressTimer = setInterval(() => {
      progressVal += (INTERVAL / DURATION) * 100;
      if (progressFill) progressFill.style.width = Math.min(progressVal, 100) + '%';
    }, INTERVAL);

    autoTimer = setInterval(() => goTo(current + 1), DURATION);
  }

  function buildThumbnails() {
    if (!thumbnailsContainer) return;
    slides.forEach((slide, i) => {
      const img = slide.querySelector('img');
      const src = img ? img.src : '';
      const thumb = document.createElement('div');
      thumb.className = 'thumb' + (i === 0 ? ' active' : '');
      thumb.dataset.index = i;
      thumb.innerHTML = `<img src="${src}" alt="">`;
      thumb.addEventListener('click', () => goTo(+thumb.dataset.index));
      thumbnailsContainer.appendChild(thumb);
    });
  }

  function buildDots() {
    if (!dotsContainer) return;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goTo(+dot.dataset.index));
      dotsContainer.appendChild(dot);
    }
  }

  buildThumbnails();
  buildDots();

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
  });

  document.addEventListener('keydown', e => {
    const wrapper = track.closest('.carousel-wrapper');
    if (!wrapper?.closest('#site')?.classList.contains('is-visible')) return;
    if (e.key === 'ArrowRight') { goTo(current + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { goTo(current - 1); e.preventDefault(); }
  });

  resetProgress();
})();

// ─── Header visibility: hide when scrolled past hero section-inner, show when back ─

(function initHeaderScrollHide() {
  const header = document.getElementById('site-header');
  const hero = document.getElementById('home');
  const sectionInner = hero?.querySelector('.section-inner');
  if (!header || !hero || !sectionInner) return;

  function updateHeaderVisibility() {
    if (!site.classList.contains('is-visible')) return;
    const main = hero.closest('main');
    const innerBottom = (main ? main.offsetTop : 0) + hero.offsetTop + sectionInner.offsetTop + sectionInner.offsetHeight;
    if (site.scrollTop > innerBottom - 50) {
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }
  }

  site.addEventListener('scroll', updateHeaderVisibility, { passive: true });
  window.addEventListener('resize', updateHeaderVisibility);
  if (site.classList.contains('is-visible')) setTimeout(updateHeaderVisibility, 100);
})();

// ─── Race Video Player ────────────────────────────────────────────────────────

(function initVideoPlayer() {
  const video       = document.getElementById('raceVideo');
  const container   = document.getElementById('vidContainer');
  const overlay     = document.getElementById('vidOverlay');
  const playBtn     = document.getElementById('vidPlayBtn');
  const toggleBtn   = document.getElementById('vidToggleBtn');
  const muteBtn     = document.getElementById('vidMuteBtn');
  const fsBtn       = document.getElementById('vidFsBtn');
  const progressFill  = document.getElementById('vidProgressFill');
  const progressThumb = document.getElementById('vidProgressThumb');
  const progressTrack = document.getElementById('vidProgressTrack');
  const timeDisplay   = document.getElementById('vidTimeDisplay');
  const iconPlay    = document.getElementById('vidIconPlay');
  const iconPause   = document.getElementById('vidIconPause');

  if (!video) return;

  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function updateProgress() {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    progressFill.style.width = pct + '%';
    progressThumb.style.left = pct + '%';
    timeDisplay.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
  }

  function play() {
    video.play();
    container.classList.add('playing');
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
  }

  function pause() {
    video.pause();
    container.classList.remove('playing');
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
  }

  playBtn.addEventListener('click', play);
  overlay.addEventListener('click', play);
  toggleBtn.addEventListener('click', () => video.paused ? play() : pause());
  video.addEventListener('click', () => video.paused ? play() : pause());

  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('ended', () => {
    container.classList.remove('playing');
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
  });

  progressTrack.addEventListener('click', e => {
    const rect = progressTrack.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  });

  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.style.opacity = video.muted ? '0.35' : '1';
  });

  fsBtn.addEventListener('click', () => {
    const isVideoFs = video.webkitDisplayingFullscreen === true;
    const isContainerFs = document.fullscreenElement === container;

    if (isVideoFs && video.webkitExitFullscreen) {
      video.webkitExitFullscreen();
    } else if (isContainerFs) {
      document.exitFullscreen();
    } else {
      if (video.webkitEnterFullscreen) {
        if (video.paused) video.play();
        video.webkitEnterFullscreen();
      } else if (video.requestFullscreen) {
        if (video.paused) video.play();
        video.requestFullscreen();
      } else if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    }
  });
})();

// ─── Contact form (Formspree) ─────────────────────────────────────────────────

(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.querySelector('span')?.textContent || 'Send Message';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Enviando...';
    }

    const formData = new FormData(form);
    const action = form.getAttribute('action');

    if (!action || action.includes('YOUR_FORM_ID')) {
      alert('Configure o Formspree: substitua YOUR_FORM_ID no action do formulário pelo ID do seu formulário.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = originalText;
      }
      return;
    }

    try {
      const res = await fetch(action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      const data = await res.json();

      if (data.ok) {
        form.reset();
        if (submitBtn) submitBtn.querySelector('span').textContent = 'Mensagem enviada!';
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.querySelector('span').textContent = originalText;
          }
        }, 3000);
      } else {
        throw new Error(data.error || 'Erro ao enviar');
      }
    } catch (err) {
      alert('Não foi possível enviar. Tente novamente ou use o e-mail direto: affonso@giaffone.com');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = originalText;
      }
    }
  });
})();

// ─── Anchor navigation inside #site ──────────────────────────────────────────

// #site is position:fixed with overflow-y:auto (an independent scroll viewport).
// Native anchor links scroll the document, not the fixed container, so they
// would have no effect. We intercept them and scrollTo() within #site instead.
document.querySelectorAll('#site a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      // 72 px header offset so the section heading is not hidden under the sticky bar
      site.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
    }
  });
});

// ─── Mobile nav (hamburger + dropdown) ─────────────────────────────────────────

(function initMobileNav() {
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open);
    nav.setAttribute('aria-hidden', !open);
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
    });
  });
})();

// ─── Progressive preloading ───────────────────────────────────────────────────

function loadFrame(index) {
  return new Promise(resolve => {
    if (frames[index]) { resolve(frames[index]); return; }

    const img = new Image();
    img.src = frameURL(FRAME_START + index);
    img.onload = () => { frames[index] = img; resolve(img); };
    img.onerror = () => resolve(null); // graceful skip; tick() walks back
  });
}

async function preloadAll() {
  await loadFrame(0);     // frame 0 first → user sees content immediately
  resizeCanvas();
  drawFrame(0);

  const BATCH = 4;
  for (let i = 1; i < TOTAL_FRAMES; i += BATCH) {
    const batch = [];
    for (let j = i; j < Math.min(i + BATCH, TOTAL_FRAMES); j++) {
      batch.push(loadFrame(j));
    }
    await Promise.all(batch);

    // Yield between batches to keep the main thread responsive
    await new Promise(r => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(r, { timeout: 200 });
      } else {
        setTimeout(r, 0);
      }
    });
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

const isMobile = window.matchMedia('(max-width: 768px)').matches;

if (DEV_SKIP_ANIMATION || isMobile) {
  siteEntered = true;
  stage.style.display = 'none';
  overlayIntro.style.display = 'none';
  overlayEnd.style.display = 'none';
  site.setAttribute('aria-hidden', 'false');
  site.classList.add('is-visible');
} else {
  resizeCanvas();
  tick();
  preloadAll();
}
