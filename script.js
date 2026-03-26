const textDisplay = document.getElementById("text");
const input = document.getElementById("input");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const timeDisplay = document.getElementById("time");

let idleTimer;
let currentText = "";
let spans = [];

// ✅ stats
let startTime = null;
let totalKeystrokes = 0;
let totalMistakes = 0;

// ✅ pause tracking (for API delay)
let pausedTime = 0;
let pauseStart = null;

// ✅ timer system
let gameDuration = 0;
let timeLeft = 0;
let timerInterval = null;
let gameActive = false;

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

  // resume timer after pause
  if (pauseStart) {
    pausedTime += (new Date() - pauseStart);
    pauseStart = null;
  }
}

// 🎮 start game
function startGame(seconds) {
  gameDuration = seconds;
  timeLeft = seconds;

  // reset stats
  startTime = null;
  totalKeystrokes = 0;
  totalMistakes = 0;
  pausedTime = 0;
  pauseStart = null;

  gameActive = true;

  input.disabled = false;
  input.value = "";
  input.focus();

  wpmDisplay.innerText = 0;
  accuracyDisplay.innerText = 100;
  timeDisplay.innerText = timeLeft;

  nextSentence();

  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
}

// ⏱️ timer countdown
function updateTimer() {
  timeLeft--;
  timeDisplay.innerText = timeLeft;

  // 🔥 optional: turn red when low
  if (timeLeft <= 10) {
    timeDisplay.style.color = "#f44336";
  } else {
    timeDisplay.style.color = "white";
  }

  if (timeLeft <= 0) {
    endGame();
  }
}

// 💻 keypress handling
input.addEventListener("keydown", (e) => {

  if (!gameActive) return;

  if (e.key === "Enter") {

    // pause timer during sentence load
    pauseStart = new Date();

    if (input.value !== currentText) {
      totalMistakes += 5; // penalty
      triggerShake();
    }

    nextSentence();
    return;
  }

  if (e.key.length > 1 && e.key !== "Backspace") return;

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

  if (!gameActive) return;

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

// 🏁 end game
function endGame() {
  clearInterval(timerInterval);
  gameActive = false;

  input.disabled = true;

  // ✅ FIX: remove drift blur
  clearTimeout(idleTimer);
  document.body.classList.remove("drift");

  const finalWPM = wpmDisplay.innerText;
  const finalAccuracy = accuracyDisplay.innerText;

  document.getElementById("final-wpm").innerText = finalWPM;
  document.getElementById("final-accuracy").innerText = finalAccuracy;

  document.getElementById("result").classList.remove("hidden");
}

function restartGame() {
  document.getElementById("result").classList.add("hidden");

  // reset UI
  wpmDisplay.innerText = 0;
  accuracyDisplay.innerText = 100;
  timeDisplay.innerText = 0;

  // reset stats
  startTime = null;
  totalKeystrokes = 0;
  totalMistakes = 0;
  pausedTime = 0;
  pauseStart = null;

  // clear text + input
  currentText = "";
  textDisplay.innerHTML = "";
  input.value = "";
  input.disabled = true;

  // remove drift if any
  clearTimeout(idleTimer);
  document.body.classList.remove("drift");
}

// 🔒 disable input initially
input.disabled = true;