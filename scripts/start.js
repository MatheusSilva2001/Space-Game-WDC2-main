const inputName = document.querySelector("#name");
const newGameForm = document.querySelector("#newGameForm");
const buttonRank = document.querySelector(".buttonRank");

function handleSubmitNewGame(event) {
  event.preventDefault();
  localStorage.setItem("@spaceshipGame:playerName", inputName.value);
  inputName.value = "";
  window.location.href = "pages/game.html";
}

function navigateRank() {
  window.location.href = "pages/rank.html";
}

newGameForm.addEventListener("submit", handleSubmitNewGame);
buttonRank.addEventListener("click", navigateRank);
