const textDisplay = document.getElementById("text");
const input = document.getElementById("input");

let idleTimer;

// sentences
const texts = [
  "The quick brown fox jumps over the lazy dog",
  "Typing fast is a useful skill to learn",
  "Practice daily to improve your accuracy",
  "Errors will make the screen shake violently",
  "Stay focused or the screen will drift away"
];

let index = 0;
let currentText = texts[index];
let spans = [];

// render text
function renderText(text) {
  textDisplay.innerHTML = "";

  text.split("").forEach(char => {
    const span = document.createElement("span");
    span.innerText = char;
    textDisplay.appendChild(span);
  });

  spans = textDisplay.querySelectorAll("span"); // ✅ update spans
}

renderText(currentText);

// 💥 SHAKE FUNCTION
function triggerShake() {
  const game = document.getElementById("game");

  game.classList.add("shake");

  setTimeout(() => {
    game.classList.remove("shake");
  }, 200);
}

// ➡️ NEXT LINE
function nextLine() {
  index = (index + 1) % texts.length;
  currentText = texts[index];

  renderText(currentText);

  input.value = "";
  document.body.classList.remove("drift");
}

// 💥 SHAKE + ENTER LOGIC
input.addEventListener("keydown", (e) => {

  // ENTER → check if correct
  if (e.key === "Enter") {
    if (input.value === currentText) {
      nextLine();
    }
    return;
  }

  // ignore special keys
  if (e.key.length > 1) return;

  const typed = input.value;
  const currentIndex = typed.length;

  // case-insensitive compare
  if (e.key.toLowerCase() !== currentText[currentIndex]?.toLowerCase()) {
    triggerShake();
  }
});

// 🌪️ DRIFT + 🎯 COLORING
input.addEventListener("input", () => {

  // remove drift when typing
  document.body.classList.remove("drift");

  clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {
    document.body.classList.add("drift");
  }, 1500);

  const typed = input.value.split("");

  spans.forEach((span, index) => {
    const char = typed[index];

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
});