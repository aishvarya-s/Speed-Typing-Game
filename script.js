const textDisplay = document.getElementById("text");
const input = document.getElementById("input");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const timeDisplay = document.getElementById("time");

let idleTimer;
let currentText = "";
let spans = [];

// typing stats
let startTime = null;
let totalKeystrokes = 0;
let totalMistakes = 0;

// pause tracking
let pausedTime = 0;
let pauseStart = null;

// timer system
let gameDuration = 0;
let timeLeft = 0;
let timerInterval = null;
let gameActive = false;

// mode flag
let isPracticeMode = false;

// track mistakes per character
let mistakeMap = {};


// normalize text casing
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^\w|\.\s*\w)/g, c => c.toUpperCase());
}

// render text as spans
function renderText(text) {
  textDisplay.innerHTML = "";

  text.split("").forEach(char => {
    const span = document.createElement("span");
    span.innerText = char;
    textDisplay.appendChild(span);
  });

  spans = textDisplay.querySelectorAll("span");
}

// shake animation on error
function triggerShake() {
  const game = document.getElementById("game");
  game.classList.add("shake");
  setTimeout(() => game.classList.remove("shake"), 200);
}

// fetch next sentence
async function nextSentence() {
  clearTimeout(idleTimer);
  document.body.classList.remove("drift");

  try {
    const res = await fetch("https://dummyjson.com/quotes/random");
    const data = await res.json();

    currentText = normalizeText(data.quote);

  } catch (err) {
    console.warn("api failed");
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

// start game
function startGame(seconds) {
  isPracticeMode = false;

  gameDuration = seconds;
  timeLeft = seconds;

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

  document.getElementById("stats").style.display = "flex";

  nextSentence();

  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
}

// update countdown timer
function updateTimer() {
  timeLeft--;
  timeDisplay.innerText = timeLeft;

  timeDisplay.style.color = timeLeft <= 10 ? "#f44336" : "white";

  if (timeLeft <= 0) {
    endGame();
  }
}

// handle key presses
input.addEventListener("keydown", (e) => {

  if (!gameActive) return;

  if (e.key === "Enter") {

    // practice mode enter
    if (isPracticeMode) {
      document.getElementById("practice-popup").classList.remove("hidden");
      gameActive = false;
      return;
    }

    // normal mode enter
    pauseStart = new Date();

    if (input.value !== currentText) {
      totalMistakes += 5;
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

      // track weak characters
      let expectedChar = currentText[currentIndex];

      // only track letters (ignore space, punctuation, numbers)
      if (expectedChar && /[a-zA-Z]/.test(expectedChar)) {
        expectedChar = expectedChar.toLowerCase(); // normalize
        mistakeMap[expectedChar] = (mistakeMap[expectedChar] || 0) + 1;
      }

      triggerShake();
    }
  }
});

// handle typing input
input.addEventListener("input", () => {

  if (!gameActive) return;

  if (!startTime && !isPracticeMode) {
    startTime = new Date();
  }

  document.body.classList.remove("drift");
  clearTimeout(idleTimer);

  // idle effect trigger
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

// update wpm and accuracy
function updateStats() {
  if (!startTime || isPracticeMode) return;

  const timeElapsed = ((new Date() - startTime - pausedTime) / 1000 / 60);

  // avoid early spikes
  if (totalKeystrokes < 5) {
    wpmDisplay.innerText = "...";
    return;
  }

  if (timeElapsed < 0.01) return;

  const correctChars = totalKeystrokes - totalMistakes;
  const wordsTyped = correctChars / 5;

  const wpm = Math.round(wordsTyped / timeElapsed) || 0;

  const accuracy = totalKeystrokes === 0
    ? 100
    : Math.round((correctChars / totalKeystrokes) * 100);

  wpmDisplay.innerText = wpm;
  accuracyDisplay.innerText = accuracy;
}

// get most mistaken characters
function getWeakChars() {
  return Object.keys(mistakeMap)
    .sort((a, b) => mistakeMap[b] - mistakeMap[a])
    .slice(0, 5);
}

// generate practice text from weak keys
function generatePracticeText() {
  const weakChars = getWeakChars();

  if (weakChars.length === 0) {
    return "practice makes perfect";
  }

  let words = [];

  for (let i = 0; i < 15; i++) {
    let word = "";
    let wordLength = Math.floor(Math.random() * 4) + 3;

    for (let j = 0; j < wordLength; j++) {
      let char = weakChars[Math.floor(Math.random() * weakChars.length)];
      word += char.toLowerCase();
    }

    words.push(word);
  }

  return words.join(" ");
}

// start practice mode
function startPractice() {
  document.getElementById("result").classList.add("hidden");

  isPracticeMode = true;

  gameActive = true;
  input.disabled = false;
  input.value = "";
  input.focus();

  startTime = null;
  pausedTime = 0;

  clearInterval(timerInterval);
  timeDisplay.innerText = "Practice";

  document.getElementById("stats").style.display = "none";

  currentText = generatePracticeText();
  renderText(currentText);
}

// continue practice
function continuePractice() {
  document.getElementById("practice-popup").classList.add("hidden");

  gameActive = true;
  input.value = "";
  input.focus();

  currentText = generatePracticeText();
  renderText(currentText);
}

// exit practice
function exitPractice() {
  document.getElementById("practice-popup").classList.add("hidden");
  restartGame();
}

// end game
function endGame() {
  clearInterval(timerInterval);
  gameActive = false;

  input.disabled = true;

  clearTimeout(idleTimer);
  document.body.classList.remove("drift");

  document.getElementById("final-wpm").innerText = wpmDisplay.innerText;
  document.getElementById("final-accuracy").innerText = accuracyDisplay.innerText;

  const weakChars = getWeakChars();
  document.getElementById("weak-keys").innerText =
    weakChars.length ? weakChars.join(", ") : "None 🎉";

  document.getElementById("result").classList.remove("hidden");
}

// reset game state
function restartGame() {
  document.getElementById("result").classList.add("hidden");

  wpmDisplay.innerText = 0;
  accuracyDisplay.innerText = 100;
  timeDisplay.innerText = 0;

  startTime = null;
  totalKeystrokes = 0;
  totalMistakes = 0;
  pausedTime = 0;
  pauseStart = null;

  mistakeMap = {};

  currentText = "";
  textDisplay.innerHTML = "";
  input.value = "";
  input.disabled = true;

  clearTimeout(idleTimer);
  document.body.classList.remove("drift");
}

// disable input initially
input.disabled = true;