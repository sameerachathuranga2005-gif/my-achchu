const PASSWORD = "sameera";
const TOTAL = 6;
const COOLDOWN_MS = 5000;
const YOUTUBE_VIDEO_ID = "8sPeScHtQEk";

const html = document.documentElement;
const body = document.body;
const gate = document.getElementById("gate");
const form = document.getElementById("gate-form");
const input = document.getElementById("gate-pass");
const errorEl = document.getElementById("gate-error");
const pages = [...document.querySelectorAll(".page")];
const nextBtn = document.getElementById("next-btn");
const backBtn = document.getElementById("back-btn");
const countEl = document.getElementById("pager-count");
const chapterButtons = [...document.querySelectorAll(".nav-links button")];
const gotoButtons = [...document.querySelectorAll("[data-goto]")];
const hearts = document.querySelector(".hearts");
const bgMusic = document.getElementById("bg-music");
const videoCaption = document.querySelector(".video-caption");
const mediaStatus = document.getElementById("media-status");
const thankYou = document.getElementById("thank-you");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let pageIndex = 0;
let unlocked = false;
let isCooldown = false;
let finaleEnded = false;
let thanked = false;
let isFinished = false;
let cooldownTimer = null;
const reducedMotion = reducedMotionQuery.matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---------- YouTube IFrame API player ----------
let ytPlayer = null;
let ytReady = false;

window.onYouTubeIframeAPIReady = function () {
  const container = document.getElementById("finale-video");
  if (!container) return;
  ytPlayer = new YT.Player("finale-video", {
    videoId: YOUTUBE_VIDEO_ID,
    playerVars: {
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
    },
    events: {
      onReady: () => {
        ytReady = true;
        if (pageIndex === TOTAL - 1 && unlocked) {
          playFinale();
        }
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.ENDED) {
          finaleEnded = true;
          videoCaption?.classList.add("is-complete");
          updateControls();
          setMediaStatus("Video එක ඉවරයි. Thanks button එක ඔබන්න.");
        }
      },
      onError: () => {
        setMediaStatus("The final scene could not be loaded. Please try again.");
      },
    },
  });
};

// Load YouTube IFrame API
(function loadYouTubeAPI() {
  if (window.YT) return;
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScript = document.getElementsByTagName("script")[0];
  firstScript.parentNode.insertBefore(tag, firstScript);
})();

html.classList.add("is-locked");

const updateControls = () => {
  const atStart = pageIndex === 0;
  const atEnd = pageIndex === TOTAL - 1;

  countEl.textContent = `${pageIndex + 1} / ${TOTAL}`;
  nextBtn.textContent = atEnd ? (thanked ? "Thanks Achchu" : finaleEnded ? "Thanks" : "Finish") : "Next";
  nextBtn.disabled = isCooldown || (atEnd && (!finaleEnded || thanked));
  backBtn.disabled = isCooldown || atStart || isFinished;

  chapterButtons.forEach((button, index) => {
    const active = Number(button.dataset.goto) === pageIndex;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
    button.setAttribute("aria-label", `Open story chapter ${index + 1}`);
    button.setAttribute("aria-disabled", String(isCooldown || isFinished));
  });
};

const triggerCooldown = () => {
  window.clearTimeout(cooldownTimer);
  isCooldown = true;
  updateControls();

  cooldownTimer = window.setTimeout(() => {
    isCooldown = false;
    updateControls();
  }, COOLDOWN_MS);
};

const setMediaStatus = (message = "") => {
  if (mediaStatus) mediaStatus.textContent = message;
};

const pauseFinale = () => {
  if (ytReady && ytPlayer && typeof ytPlayer.pauseVideo === "function") {
    ytPlayer.pauseVideo();
  }
};

const playFinale = () => {
  finaleEnded = false;
  thanked = false;
  thankYou?.setAttribute("hidden", "");
  videoCaption?.classList.remove("is-complete");
  setMediaStatus("");

  if (!ytReady || !ytPlayer) {
    setMediaStatus("Loading video...");
    return;
  }

  if (reducedMotion) {
    setMediaStatus("Select Play to watch the final scene.");
    return;
  }

  try {
    ytPlayer.seekTo(0, true);
    ytPlayer.mute();
    ytPlayer.playVideo();
  } catch (err) {
    setMediaStatus("Select play to begin the final scene.");
  }
};

const focusPageHeading = (page) => {
  const heading = page.querySelector("h1, h2, h3");
  if (!heading) return;
  if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
  window.setTimeout(() => heading.focus({ preventScroll: true }), 80);
};

const setPage = (index, { focus = true, cooldown = true } = {}) => {
  if (!unlocked || isCooldown || isFinished) return;

  const next = Math.max(0, Math.min(TOTAL - 1, index));
  const previous = pageIndex;
  const changed = next !== previous;

  if (changed || next !== TOTAL - 1) finaleEnded = false;

  pages.forEach((page, i) => {
    const active = i === next;
    page.classList.toggle("is-leave", i === previous && changed);
    page.classList.toggle("is-active", active);
    page.setAttribute("aria-hidden", String(!active));
  });

  pageIndex = next;
  updateControls();

  if (pageIndex === TOTAL - 1) {
    playFinale();
  } else {
    pauseFinale();
  }

  if (focus && changed) focusPageHeading(pages[pageIndex]);
  if (changed && cooldown) triggerCooldown();
};

const unlock = () => {
  unlocked = true;
  html.classList.remove("is-locked");
  body.classList.remove("is-locked");
  if (gate) gate.hidden = true;

  if (bgMusic) {
    bgMusic.volume = 0.42;
    bgMusic.play().catch(() => {});
  }

  setPage(0, { focus: false, cooldown: false });
  nextBtn.focus();
};

const createHearts = () => {
  if (reducedMotion || !hearts) return;

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 18; i += 1) {
    const heart = document.createElement("span");
    heart.textContent = i % 3 === 0 ? "♡" : "♥";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${7 + Math.random() * 8}s`;
    heart.style.animationDelay = `${Math.random() * 6}s`;
    heart.style.fontSize = `${10 + Math.random() * 16}px`;
    fragment.append(heart);
  }
  hearts.append(fragment);
};

const setupTilt = () => {
  if (reducedMotion || !finePointer) return;

  document.querySelectorAll(".tilt").forEach((card) => {
    const tilt = (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateZ(12px)`;
    };

    const reset = () => {
      card.style.transform = "";
    };

    card.addEventListener("pointermove", tilt, { passive: true });
    card.addEventListener("pointerleave", reset);
    card.addEventListener("blur", reset, true);
  });
};

const completeStory = () => {
  if (pageIndex !== TOTAL - 1 || !finaleEnded || isFinished) return;

  thanked = true;
  isFinished = true;
  if (thankYou) {
    thankYou.textContent = "Thanks Achchu 💖";
    thankYou.removeAttribute("hidden");
  }
  videoCaption?.classList.add("is-complete");
  body.classList.add("is-finished");
  updateControls();
  setMediaStatus("Thanks Achchu.");
};

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = input.value.trim().toLowerCase();

  if (value === PASSWORD) {
    if (errorEl) errorEl.hidden = true;
    unlock();
    return;
  }

  if (errorEl) errorEl.hidden = false;
  input.value = "";
  input.focus();
});

nextBtn?.addEventListener("click", () => {
  if (pageIndex === TOTAL - 1) {
    completeStory();
    return;
  }
  setPage(pageIndex + 1);
});

backBtn?.addEventListener("click", () => {
  setPage(pageIndex - 1);
});

chapterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setPage(Number(button.dataset.goto));
  });
});

gotoButtons
  .filter((button) => button.classList.contains("nav-mark"))
  .forEach((button) => {
    button.addEventListener("click", () => setPage(0));
  });

document.addEventListener("keydown", (event) => {
  if (!unlocked || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;

  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLButtonElement ||
    target.closest("iframe, audio, form, [contenteditable='true']")
  ) {
    return;
  }

  if (isCooldown) return;
  event.preventDefault();
  setPage(pageIndex + (event.key === "ArrowRight" ? 1 : -1));
});

pages.forEach((page, index) => {
  page.setAttribute("aria-hidden", String(index !== pageIndex));
});

createHearts();
setupTilt();
updateControls();

if (body.classList.contains("is-locked") && input) input.focus();
