const textDisplay = document.getElementById("text");
const input = document.getElementById("input");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");

let idleTimer;
let currentText = "";
let spans = [];

// ✅ stats
let startTime = null;
let totalKeystrokes = 0;
let totalMistakes = 0;

// ✅ pause tracking (NEW)
let pausedTime = 0;
let pauseStart = null;

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

// 🌐 fetch sentence
async function nextSentence() {

  // ✅ STOP drift immediately
  clearTimeout(idleTimer);
  document.body.classList.remove("drift");

  try {
    const res = await fetch("https://api.quotable.io/random?minLength=60&maxLength=120");
    const data = await res.json();
    currentText = data.content;
  } catch (err) {
    console.error("API failed", err);
    currentText = "Practice typing every day to improve your speed";
  }

  renderText(currentText);
  input.value = "";

  // ✅ resume timer after pause
  if (pauseStart) {
    pausedTime += (new Date() - pauseStart);
    pauseStart = null;
  }
}

// 💻 keypress handling
input.addEventListener("keydown", (e) => {

  if (e.key === "Enter") {

    // ✅ pause timer while loading next sentence
    pauseStart = new Date();

    if (input.value !== currentText) {
      triggerShake();
    }

    nextSentence();
    return;
  }

  // ignore special keys except backspace
  if (e.key.length > 1 && e.key !== "Backspace") return;

  // track keystrokes (ignore backspace)
  if (e.key !== "Backspace") {
    totalKeystrokes++;

    const currentIndex = input.value.length;

    if (e.key !== currentText[currentIndex]) {
      totalMistakes++;
      triggerShake();
    }
  }
});

// 🌪️ typing + coloring + drift
input.addEventListener("input", () => {

  // start timer once
  if (!startTime) {
    startTime = new Date();
  }

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
    } 
    else if (char === span.innerText) {
      span.classList.add("correct");
      span.classList.remove("wrong");
    } 
    else {
      span.classList.add("wrong");
      span.classList.remove("correct");
    }
  });

  updateStats();
});

// 📊 stats calculation
function updateStats() {
  if (!startTime) return;

  // ✅ exclude paused time
  const timeElapsed = ((new Date() - startTime - pausedTime) / 1000 / 60);

  const correctChars = totalKeystrokes - totalMistakes;
  const wordsTyped = correctChars / 5;

  const wpm = Math.round(wordsTyped / timeElapsed) || 0;

  const accuracy = totalKeystrokes === 0
    ? 100
    : Math.round((correctChars / totalKeystrokes) * 100);

  wpmDisplay.innerText = wpm;
  accuracyDisplay.innerText = accuracy;
}

// ✅ start game
nextSentence();