const PASSWORD = "sameera";
const TOTAL = 6;

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
const navButtons = [...document.querySelectorAll("[data-goto]")];
const hearts = document.querySelector(".hearts");

const bgMusic = document.getElementById("bg-music");
const finaleVideo = document.getElementById("finale-video");

let pageIndex = 0;
let unlocked = false;
let isCooldown = false;

html.classList.add("is-locked");

// Floating hearts setup
for (let i = 0; i < 18; i += 1) {
  const heart = document.createElement("span");
  heart.textContent = "♥";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.animationDuration = `${7 + Math.random() * 8}s`;
  heart.style.animationDelay = `${Math.random() * 6}s`;
  heart.style.fontSize = `${10 + Math.random() * 16}px`;
  hearts.append(heart);
}

// Handle 5-second delay for buttons
const triggerCooldown = () => {
  isCooldown = true;
  nextBtn.disabled = true;
  backBtn.disabled = true;
  navButtons.forEach((btn) => (btn.style.pointerEvents = "none"));

  setTimeout(() => {
    isCooldown = false;
    nextBtn.disabled = false;
    backBtn.disabled = pageIndex === 0;
    navButtons.forEach((btn) => (btn.style.pointerEvents = "auto"));
  }, 5000);
};

const setPage = (index) => {
  if (!unlocked || isCooldown) return;
  const next = Math.max(0, Math.min(TOTAL - 1, index));

  pages.forEach((page, i) => {
    page.classList.toggle("is-leave", i === pageIndex && i !== next);
    page.classList.toggle("is-active", i === next);
  });

  pageIndex = next;
  countEl.textContent = `${pageIndex + 1} / ${TOTAL}`;
  
  nextBtn.textContent = pageIndex === TOTAL - 1 ? "Again" : "Next";

  document.querySelectorAll(".nav-links button").forEach((btn) => {
    btn.classList.toggle("is-active", Number(btn.dataset.goto) === pageIndex);
  });

  // Handle Video auto-play on Page 6 (Index 5)
  if (pageIndex === TOTAL - 1) {
    if (finaleVideo) {
      finaleVideo.currentTime = 0;
      finaleVideo.play().catch((e) => console.log("Video play error:", e));
    }
  } else {
    if (finaleVideo && !finaleVideo.paused) {
      finaleVideo.pause();
    }
  }

  // Trigger 5-second wait time before allowing next action
  triggerCooldown();
};

const unlock = () => {
  unlocked = true;
  html.classList.remove("is-locked");
  body.classList.remove("is-locked");
  gate.hidden = true;
  
  // Play Background Music after unlock
  if (bgMusic) {
    bgMusic.play().catch((e) => console.log("Audio play blocked:", e));
  }

  setPage(0);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = input.value.trim().toLowerCase();
  if (value === PASSWORD) {
    errorEl.hidden = true;
    unlock();
    return;
  }
  errorEl.hidden = false;
  input.value = "";
  input.focus();
});

nextBtn.addEventListener("click", () => {
  if (isCooldown) return;
  if (pageIndex === TOTAL - 1) {
    setPage(0);
    return;
  }
  setPage(pageIndex + 1);
});

backBtn.addEventListener("click", () => {
  if (isCooldown) return;
  setPage(pageIndex - 1);
});

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (isCooldown) return;
    setPage(Number(btn.dataset.goto));
  });
});

// Tilt animations
const tilt = (event) => {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  card.style.transform = `rotateX(${(-y * 12).toFixed(2)}deg) rotateY(${(x * 14).toFixed(2)}deg) translateZ(12px)`;
};

const untilt = (event) => {
  event.currentTarget.style.transform = "";
};

document.querySelectorAll(".tilt").forEach((el) => {
  el.addEventListener("mousemove", tilt);
  el.addEventListener("mouseleave", untilt);
});