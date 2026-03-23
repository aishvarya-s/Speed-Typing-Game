const textDisplay = document.getElementById("text");
const input = document.getElementById("input");

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

input.addEventListener("input", () => {
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