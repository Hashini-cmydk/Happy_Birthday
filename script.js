const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const answerMessage = document.getElementById("answerMessage");
const giftButton = document.getElementById("giftButton");
const giftMessage = document.getElementById("giftMessage");
const musicToggle = document.getElementById("musicToggle");
const birthdayAudio = document.getElementById("birthdayAudio");
const giftHeart = giftMessage.querySelector(".gift-heart");

function createCursorTrail() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const trail = document.createElement("div");
  trail.className = "cursor-trail";
  trail.setAttribute("aria-hidden", "true");
  document.body.appendChild(trail);

  const maxParticles = 48;
  const particles = new Set();
  let lastSpawn = 0;

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;

    trail.style.setProperty("--cursor-x", `${event.clientX}px`);
    trail.style.setProperty("--cursor-y", `${event.clientY}px`);

    const now = performance.now();
    if (now - lastSpawn < 32 || particles.size >= maxParticles) return;
    lastSpawn = now;

    const particleCount = Math.min(2, maxParticles - particles.size);
    for (let i = 0; i < particleCount; i += 1) {
      const particle = document.createElement("span");
      particle.className = `cursor-particle${Math.random() > 0.55 ? " cursor-particle--sparkle" : ""}`;
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 54}px`);
      particle.style.setProperty("--drift-y", `${(Math.random() - 0.5) * 54 - 14}px`);
      trail.appendChild(particle);
      particles.add(particle);

      particle.addEventListener("animationend", () => {
        particles.delete(particle);
        particle.remove();
      }, { once: true });
    }
  });
}

createCursorTrail();

function createFloatingCakes() {
  const floatingCakes = document.querySelector(".floating-cakes");
  if (!floatingCakes || floatingCakes.querySelector(".floating-cake")) return;

  const cakePositions = [
    { left: "8%", dx: "-22px", dxEnd: "18px", duration: "18s", delay: "0s" },
    { left: "22%", dx: "18px", dxEnd: "-22px", duration: "20s", delay: "3s" },
    { left: "36%", dx: "-18px", dxEnd: "20px", duration: "19s", delay: "1s" },
    { left: "55%", dx: "20px", dxEnd: "-18px", duration: "17s", delay: "4s" },
    { left: "72%", dx: "-26px", dxEnd: "22px", duration: "21s", delay: "2s" },
    { left: "88%", dx: "24px", dxEnd: "-22px", duration: "18s", delay: "5s" }
  ];

  cakePositions.forEach(({ left, dx, dxEnd, duration, delay }) => {
    const cake = document.createElement("span");
    cake.className = "floating-cake";
    cake.textContent = "🎂";
    cake.style.left = left;
    cake.style.setProperty("--dx", dx);
    cake.style.setProperty("--dx-end", dxEnd);
    cake.style.setProperty("--duration", duration);
    cake.style.setProperty("--delay", delay);
    floatingCakes.appendChild(cake);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createFloatingCakes, { once: true });
} else {
  createFloatingCakes();
}

function updateMusicButtonLabel() {
  if (!musicToggle || !birthdayAudio) return;
  musicToggle.textContent = birthdayAudio.paused ? "♫ Play birthday song" : "♫ Pause birthday song";
}

function ensureMusicPlaying() {
  if (!birthdayAudio) return;

  if (birthdayAudio.paused) {
    birthdayAudio.volume = 0.55;
    birthdayAudio.play().catch(() => {});
  }

  updateMusicButtonLabel();
}

async function toggleBirthdayMusic() {
  if (!birthdayAudio) return;

  try {
    if (birthdayAudio.paused) {
      birthdayAudio.volume = 0.55;
      await birthdayAudio.play();
    } else {
      birthdayAudio.pause();
    }
  } catch (error) {
    // Ignore autoplay restrictions and keep the page state stable.
  }

  updateMusicButtonLabel();
}

if (musicToggle) {
  musicToggle.addEventListener("click", toggleBirthdayMusic);
}

document.addEventListener("pointerdown", () => {
  ensureMusicPlaying();
}, { once: true });

yesButton.addEventListener("click", () => {
  answerMessage.textContent = "Yayyy! I knew it! Sending you the biggest hug ever! 💙";
  yesButton.textContent = "I LOVE YOU TOO! 💞";
  yesButton.classList.add("chosen");
  createHearts();
  ensureMusicPlaying();
});

let noClicks = 0;
const noMessages = [
  "Are you sure? 🥺",
  "Think about it one more time 🙈",
  "My heart is getting shy… 💗",
  "Maybe try the pink button? 🥹"
];

noButton.addEventListener("click", () => {
  answerMessage.textContent = noMessages[Math.min(noClicks, noMessages.length - 1)];
  noClicks += 1;
  noButton.style.transform = `translate(${(Math.random() - 0.5) * 90}px, ${(Math.random() - 0.5) * 35}px)`;
  if (noClicks >= 4) {
    noButton.textContent = "Okay, one more chance? 💕";
    noButton.style.transform = "none";
  }
  ensureMusicPlaying();
});

let giftAnimationStarted = false;

giftButton.addEventListener("click", () => {
  if (giftAnimationStarted) return;
  giftAnimationStarted = true;

  const message = giftMessage.querySelector("p");
  const characters = Array.from(message.textContent.replace(/\s+/g, " ").trim());
  let characterIndex = 0;
  const typeNextCharacter = () => {
    if (characterIndex >= characters.length) {
      giftHeart.hidden = false;
      return;
    }

    message.textContent += characters[characterIndex];
    characterIndex += 1;
    window.setTimeout(typeNextCharacter, 35);
  };

  const cake = giftMessage.querySelector(".birthday-cake");
  const startTypingAfterCake = (event) => {
    if (event.target !== cake || event.animationName !== "cakeReveal") return;
    cake.removeEventListener("animationend", startTypingAfterCake);
    typeNextCharacter();
  };
  cake.addEventListener("animationend", startTypingAfterCake);
  giftMessage.hidden = false;
  giftButton.innerHTML = '<span class="gift-box">💝</span>';
  giftButton.disabled = true;
  giftButton.setAttribute("aria-label", "Birthday gift opened");
  message.textContent = "";
  giftHeart.hidden = true;
  giftMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  ensureMusicPlaying();
});

function createHearts() {
  for (let i = 0; i < 16; i++) {
    const heart = document.createElement("span");
    heart.textContent = ["💗", "💖", "💕", "✨"][Math.floor(Math.random() * 4)];
    heart.style.position = "fixed";
    heart.style.left = `${10 + Math.random() * 80}%`;
    heart.style.top = `${15 + Math.random() * 65}%`;
    heart.style.fontSize = `${18 + Math.random() * 18}px`;
    heart.style.pointerEvents = "none";
    heart.style.zIndex = "20";
    heart.style.transition = "transform 1.4s ease, opacity 1.4s ease";
    document.body.appendChild(heart);
    requestAnimationFrame(() => {
      heart.style.transform = `translateY(-${80 + Math.random() * 140}px) rotate(${Math.random() * 50 - 25}deg)`;
      heart.style.opacity = "0";
    });
    setTimeout(() => heart.remove(), 1500);
  }
}
