const textDisplay = document.getElementById("text");
const input = document.getElementById("input");

let idleTimer; 

// sample text
const text = "The quick brown fox jumps over the lazy dog";

textDisplay.innerHTML = "";

// split text into spans (so we can color each letter)
text.split("").forEach(char => {
  const span = document.createElement("span");
  span.innerText = char;
  textDisplay.appendChild(span);
});

const spans = textDisplay.querySelectorAll("span");

function triggerShake() {
  const game = document.getElementById("game");

  game.classList.add("shake");

  setTimeout(() => {
    game.classList.remove("shake");
  }, 200);
}

// 💥 SHAKE LOGIC (keydown)
input.addEventListener("keydown", (e) => {

  // ignore special keys
  if (e.key.length > 1) return;

  const typed = input.value;
  const currentIndex = typed.length;

  if (e.key !== text[currentIndex]) {
    triggerShake();
  }
});

// 🌪️ DRIFT + 🎯 COLORING (input)
input.addEventListener("input", () => {

  // remove drift when typing
  document.body.classList.remove("drift");

  // reset idle timer
  clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {
    document.body.classList.add("drift");
  }, 1500);

  const typed = input.value.split("");

  spans.forEach((span, index) => {
    const char = typed[index];

    if (char == null) {
      span.classList.remove("correct");
      span.classList.remove("wrong");
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
