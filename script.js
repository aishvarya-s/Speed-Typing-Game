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

input.addEventListener("input", () => {

  // remove drift when user types
  document.body.classList.remove("drift");

  // reset timer
  clearTimeout(idleTimer);

  // start timer again
  idleTimer = setTimeout(() => {
    document.body.classList.add("drift");
  }, 1500); // 1.5 seconds

  
  const typed = input.value.split("");

  const currentIndex = typed.length - 1;

  if (currentIndex >= 0 && typed[currentIndex] !== text[currentIndex]) {
  triggerShake();
  }

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