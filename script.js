const textDisplay = document.getElementById("text");
const input = document.getElementById("input");
const scoreDisplay = document.getElementById("score");

let idleTimer;
let score = 0;
let currentText = "";
let spans = [];

// ✅ render text
function renderText(text) {
  textDisplay.innerHTML = "";
  text.split("").forEach(char => {
    const span = document.createElement("span");
    span.innerText = char;
    textDisplay.appendChild(span);
  });
  spans = textDisplay.querySelectorAll("span");
}

// 💥 shake effect
function triggerShake() {
  const game = document.getElementById("game");
  game.classList.add("shake");
  setTimeout(() => game.classList.remove("shake"), 200);
}

// ✅ update score
function addScore() {
  score += 1;
  scoreDisplay.innerText = score;
}

// 🌐 fetch sentence from Quotable API
async function nextSentence() {
  try {
    const res = await fetch("https://api.quotable.io/random?minLength=60&maxLength=120");
    const data = await res.json();

    currentText = data.content; // ✅ clean quote
  } catch (err) {
    console.error("API failed, using fallback", err);
    currentText = "Practice typing every day to improve your speed";
  }

  renderText(currentText);
  input.value = "";
}

// 💻 handle keypress
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (input.value === currentText) {
      addScore();
      nextSentence(); // ✅ fetch next quote
    } else {
      triggerShake();
    }
    return;
  }

  if (e.key.length > 1) return;

  const typed = input.value;
  const currentIndex = typed.length;

  if (e.key.toLowerCase() !== currentText[currentIndex]?.toLowerCase()) {
    triggerShake();
  }
});

// 🌪️ drift + 🎯 coloring
input.addEventListener("input", () => {
  document.body.classList.remove("drift");
  clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {
    document.body.classList.add("drift");
  }, 1500);

  const typed = input.value.split("");

  spans.forEach((span, idx) => {
    const char = typed[idx];

    if (char == null) {
      span.classList.remove("correct", "wrong");
    } else if (char === span.innerText) {
      span.classList.add("correct");
      span.classList.remove("wrong");
    } else {
      span.classList.add("wrong");
      span.classList.remove("correct");
    }
  });
});

// ✅ start game
nextSentence();