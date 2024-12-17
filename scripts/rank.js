function createBodyTableRank() {
  const storageRank = JSON.parse(localStorage.getItem("@spaceshipGame:rank"));

  let rankSorted;
  if (storageRank) {
    rankSorted = storageRank
      .sort((a, b) => b.score - a.score)
      .filter((_v, index) => index < 10);
  }

  const bodyTableRank = document.querySelector(".tableRank tbody");

  bodyTableRank.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    bodyTableRank.innerHTML += `
     <tr>
        <td>${i + 1}</td>
        <td>${rankSorted ? rankSorted[i]?.name || "" : ""}</td>
        <td>${rankSorted ? rankSorted[i]?.score || "" : ""}</td>
      </tr>
    `;
  }
}

function backPage() {
  window.history.back();
}

const backButton = document.querySelector(".backButton");
backButton.addEventListener("click", backPage);

createBodyTableRank();
