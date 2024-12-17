const spaceContainer = document.querySelector(".spaceContainer");
const spaceship = document.querySelector(".spaceship");
const playerName = document.querySelector(".playerName");
const playerLife = document.querySelector(".life");
const playerScore = document.querySelector(".score");
const gameOverButton = document.querySelector(".gameOver button");

const spaceContainerWidth = spaceContainer.offsetWidth;
const spaceContainerHeight = spaceContainer.offsetHeight;

const spaceshipWidth = spaceship.offsetWidth;
const spaceshipHeight = spaceship.offsetHeight;

const spaceshipSpeed = 10; // px to upper
const shotSpeed = 10; // per second
const spaceshipDamage = 25; // -25 per shot
const timeToEndSpecialShot = 30 * 1000; // 30s

let canShot = true;
let specialShotIsActive = false;
let shootPower = 25; // -25 enemy life

let enemies = [];
let isGameOver = false;
let life = 100;
let score = 0;

let positionX = 0;
let positionY = 0;
let moveX = spaceContainerWidth / 2;
let moveY = 0;

let enemiesDifficultyLevel = 1;
let pointsToIncrementDifficultyLevel = 1000; // each 1000 points
let enemyX = Math.random() * spaceContainerWidth;
let enemyY = 100;

function spaceshipMove() {
  if (isGameOver) return;

  moveX += positionX * spaceshipSpeed;
  moveY += positionY * spaceshipSpeed;

  const discountScreenLimit = spaceshipWidth / 2;

  moveX = Math.max(
    discountScreenLimit,
    Math.min(moveX, spaceContainerWidth - discountScreenLimit)
  );

  moveY = Math.max(
    -discountScreenLimit,
    Math.min(moveY, spaceContainerHeight - spaceshipHeight - discountScreenLimit)
  );

  spaceship.style.left = moveX - discountScreenLimit + "px";
  spaceship.style.bottom = moveY + discountScreenLimit + "px";

  requestAnimationFrame(spaceshipMove);
}

function createShot(className = "shot") {
  if (canShot && !isGameOver) {
    const shot = document.createElement("div");
    shot.classList.add(className);

    if (specialShotIsActive) {
      shot.classList.add("specialShot");

      const shootSound = new Audio("../audios/shootSpecial.mp3");
      shootSound.volume = 0.3;
      shootSound.play();

      shot.style.left = moveX + "px";
      shot.style.bottom = moveY + spaceshipHeight + spaceshipHeight / 8 + "px";
    } else {
      const shootSound = new Audio("../audios/shoot.mp3");
      shootSound.volume = 1;
      shootSound.play();

      shot.style.left = moveX + "px";
      shot.style.bottom = moveY + spaceshipHeight + spaceshipHeight / 4 + "px";
    }

    spaceContainer.appendChild(shot);

    canShot = false;

    setTimeout(() => {
      canShot = true;
    }, 1000 / shotSpeed);
  }
}

function spaceshipShootRemove() {
  const shoots = document.querySelectorAll(".shot");

  shoots.forEach((shot) => {
    shot.addEventListener("animationend", () => {
      shot.remove();
    });
  });
}

class EnemySpaceship {
  constructor(enemyNumber = 1, src, alt, className) {
    this.enemyNumber = enemyNumber;
    this.life = enemyNumber == 1 ? 100 : enemyNumber == 2 ? 300 : 600;
    this.points = enemyNumber == 1 ? 250 : enemyNumber == 2 ? 500 : 1000;
    this.damage = enemyNumber == 1 ? 20 : enemyNumber == 2 ? 30 : 50;

    this.flyCategory = (Math.random() - 0.5) * 3; // positive or negative random number
    this.x = 0;
    this.y = 0;
    this.baseX = Math.ceil(Math.random() * spaceContainerWidth - spaceshipWidth);
    this.speed = (Math.ceil(Math.random() * 5 + 5) / 10) * enemiesDifficultyLevel;

    this.offScreenTopElementDiscount = 200; // px

    this.#createElement(src, alt, className);
  }

  #createElement(src, alt, className) {
    this.element = document.createElement("img");
    this.element.src = src;
    this.element.alt = alt;
    this.element.className = className;

    this.element.style.position = "absolute";
    this.element.style.top = `-${this.offScreenTopElementDiscount}px`; // top: -200px

    document.querySelector(".enemies").appendChild(this.element);
  }

  fly() {
    this.y += this.speed;
    this.x =
      ((Math.cos((this.y / 100) * this.flyCategory) * score) / 100) * this.flyCategory +
      this.baseX;

    this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;

    if (this.y - this.offScreenTopElementDiscount > spaceContainerHeight) {
      this.element.remove();
    }
  }

  destroyEnemySpaceship() {
    enemies = enemies.filter((enemy) => enemy != this);
    this.element.src = `../images/explosion2.gif`;

    let explosionSound;
    if (this.enemyNumber == 3) {
      explosionSound = new Audio("../audios/explosion2.mp3");
    } else {
      explosionSound = new Audio("../audios/explosion1.mp3");
    }

    explosionSound.volume = 0.4;
    explosionSound.play();

    setTimeout(() => {
      this.element.remove();
    }, 1000);
  }
}

class SpecialCharge extends EnemySpaceship {
  constructor(enemyNumber, src, alt, className) {
    super(enemyNumber, src, alt, className);
  }

  removeElement() {
    enemies = enemies.filter((enemy) => enemy != this);
    this.element.remove();
  }
}

function createEnemies() {
  enemiesDifficultyLevel =
    score == 0 ? 1 : Math.ceil(score / pointsToIncrementDifficultyLevel);

  const delayIntervalTime = Math.max(
    500,
    Math.random() * 1000 + 1000 / enemiesDifficultyLevel
  );

  const intervalID = setInterval(() => {
    let randomEnemyType = Math.ceil(Math.random() * 100);

    if (randomEnemyType <= 50) {
      randomEnemyType = 1; // 50%
    } else if (randomEnemyType <= 80) {
      randomEnemyType = 2; // 30%
    } else if (randomEnemyType <= 95) {
      randomEnemyType = 3; // 15%
    } else if (randomEnemyType <= 100) {
      enemies.push(
        new SpecialCharge(1, "../images/logo-rj.png", "logo-rj", "chargeSpecialShot")
      ); // 5%

      return;
    }

    enemies.push(
      new EnemySpaceship(
        randomEnemyType,
        `../images/enemy${randomEnemyType}.gif`,
        `enemy${randomEnemyType}`,
        `enemy${randomEnemyType}`
      )
    );

    if (isGameOver) clearInterval(intervalID);
  }, delayIntervalTime);
}

function animateFlyEnemies() {
  enemies.forEach((enemy) => {
    enemy.fly();
  });

  requestAnimationFrame(animateFlyEnemies);
}

function collisionEnemiesShot() {
  const enemiesDOM = document.querySelectorAll(".enemies img");
  const shootsDOM = document.querySelectorAll(".shot");

  enemiesDOM.forEach((enemyDOM) => {
    const enemy = enemies.find((enemy) => enemy.element == enemyDOM);

    if (!enemy) return;

    if (enemy.element.className == "chargeSpecialShot") return; // not destroy charge special shot

    shootsDOM.forEach((shootDOM) => {
      const shootRect = shootDOM.getBoundingClientRect();
      const enemyRect = enemyDOM.getBoundingClientRect();

      let discountCollision = enemy.enemyNumber == 3 ? 40 : 10;
      if (
        enemyRect.left < shootRect.right &&
        enemyRect.right > shootRect.left &&
        enemyRect.top + discountCollision < shootRect.bottom &&
        enemyRect.bottom - discountCollision > shootRect.top
      ) {
        shootDOM.remove();
        enemy.life -= Math.ceil(shootPower * (Math.random() + 1));

        setPlayerScore(specialShotIsActive ? 20 : 10);

        if (enemy.life <= 0) {
          // destroy
          enemy.destroyEnemySpaceship();
          setPlayerScore(enemy.points);
        }
      }
    });
  });

  requestAnimationFrame(collisionEnemiesShot);
}

function collisionEnemiesWithSpaceship() {
  const enemiesDOM = document.querySelectorAll(".enemies img");
  const spaceshipRect = spaceship.getBoundingClientRect();

  enemiesDOM.forEach((enemyDOM) => {
    const enemy = enemies.find((enemy) => enemy.element == enemyDOM);

    if (!enemy) return;

    const enemyRect = enemyDOM.getBoundingClientRect();

    let discountCollision = enemy.enemyNumber == 3 ? 40 : 20;
    if (
      spaceshipRect.left + discountCollision < enemyRect.right &&
      spaceshipRect.right - discountCollision > enemyRect.left &&
      spaceshipRect.top + discountCollision * 2 < enemyRect.bottom &&
      spaceshipRect.bottom - discountCollision * 2 > enemyRect.top
    ) {
      if (enemy.element.className == "chargeSpecialShot") {
        const chargeSpecialShotSound = new Audio("../audios/next_level.mp3");
        chargeSpecialShotSound.play();

        specialShotIsActive = true;
        shootPower = 100;
        setPlayerScore(2000);
        enemy.removeElement();

        setTimeout(() => {
          specialShotIsActive = false;
          shootPower = 25;
        }, 30 * 1000); // 30s
      } else {
        enemy.destroyEnemySpaceship();
        setPlayerDamage(enemy.damage);
      }
    }
  });

  requestAnimationFrame(collisionEnemiesWithSpaceship);
}

function gameControls(key) {
  switch (key.code) {
    case "Space":
      createShot();
      spaceshipShootRemove();
      break;
    case "ArrowUp":
    case "KeyW":
      positionY = 1;
      break;
    case "ArrowDown":
    case "KeyS":
      positionY = -1;
      break;
    case "ArrowLeft":
    case "KeyA":
      positionX = -1;
      spaceship.style.transform = "rotate(-15deg)";
      break;
    case "ArrowRight":
    case "KeyD":
      positionX = 1;
      spaceship.style.transform = "rotate(15deg)";
      break;
    default:
      break;
  }
}

function gameControlsCancel(key) {
  switch (key.code) {
    case "Space":
      break;
    case "ArrowUp":
    case "KeyW":
    case "ArrowDown":
    case "KeyS":
      positionY = 0;
      break;
    case "ArrowLeft":
    case "KeyA":
    case "ArrowRight":
    case "KeyD":
      positionX = 0;
      spaceship.style.transform = "rotate(0deg)";
      break;
    default:
      break;
  }
}

function setPlayerName() {
  playerName.innerHTML = localStorage.getItem("@spaceshipGame:playerName");
}

function setPlayerLife(lifePoints) {
  life = lifePoints;
  playerLife.innerHTML = `Nave ${life}%`;

  if (life < 30) {
    playerLife.style.color = "red";
  } else {
    playerLife.style.color = "var(--color-light-200)";
  }
}

function setPlayerScore(points) {
  score += points;
  playerScore.innerHTML = String(score).padStart(9, "0");
}

function setPlayerDamage(damage = 20) {
  const criticalDamage = Math.ceil(damage * (Math.random() + 1));

  life -= criticalDamage;
  playerLife.innerHTML = `Nave ${life < 0 ? 0 : life}%`;

  if (life <= 30) {
    playerLife.style.color = "red";
  }

  const hitSound = new Audio("../audios/hit.mp3");
  hitSound.volume = 0.8;
  hitSound.play();

  if (life < 0) {
    gameOver();
  }
}

function saveUserScore({ name, score }) {
  const storageRank = JSON.parse(localStorage.getItem("@spaceshipGame:rank"));

  if (storageRank) {
    localStorage.setItem(
      "@spaceshipGame:rank",
      JSON.stringify([...storageRank, { name, score }])
    );
  } else {
    localStorage.setItem("@spaceshipGame:rank", JSON.stringify([{ name, score }]));
  }
}

function gameOver() {
  isGameOver = true;

  const gameOverElement = document.querySelector(".gameOver");
  gameOverElement.style.display = "flex";

  spaceship.style.backgroundImage = `url(../images/explosion2.gif)`;

  explosionSound = new Audio("../audios/explosion2.mp3");
  explosionSound.volume = 0.4;
  explosionSound.play();

  setTimeout(() => {
    spaceship.remove();
  }, 1000);

  saveUserScore({ name: playerName.innerHTML, score });
}

function backPage() {
  window.history.back();
}

const backButton = document.querySelector(".gameOver button");
backButton.addEventListener("click", backPage);

document.addEventListener("keydown", gameControls);
document.addEventListener("keyup", gameControlsCancel);

setPlayerName();
spaceshipMove();
createEnemies();
animateFlyEnemies();
collisionEnemiesShot();
collisionEnemiesWithSpaceship();
