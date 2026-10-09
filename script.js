const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerScoreEl = document.getElementById("playerScore");
const computerScoreEl = document.getElementById("computerScore");

const paddleWidth = 12;
const paddleHeight = 90;
const ballRadius = 8;

const leftPaddle = {
  x: 25,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 7,
};

const rightPaddle = {
  x: canvas.width - 25 - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 5.5,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  vx: 5,
  vy: 4,
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
};

let playerScore = 0;
let computerScore = 0;

function updateScore() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
}

function resetBall(direction = 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
  const speed = 5;

  ball.vx = direction * speed * Math.cos(angle);
  ball.vy = speed * Math.sin(angle);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function handleInput() {
  if (keys.ArrowUp) {
    leftPaddle.y -= leftPaddle.speed;
  }
  if (keys.ArrowDown) {
    leftPaddle.y += leftPaddle.speed;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, canvas.height - leftPaddle.height);
}

function moveComputer() {
  const targetY = ball.y - rightPaddle.height / 2;
  const diff = targetY - rightPaddle.y;
  rightPaddle.y += diff * 0.08;
  rightPaddle.y = clamp(rightPaddle.y, 0, canvas.height - rightPaddle.height);
}

function checkWallCollision() {
  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.vy *= -1;
  }
}

function handlePaddleCollision(paddle) {
  const withinPaddle =
    ball.x + ball.radius >= paddle.x &&
    ball.x - ball.radius <= paddle.x + paddle.width &&
    ball.y >= paddle.y &&
    ball.y <= paddle.y + paddle.height;

  if (!withinPaddle) return;

  const paddleCenter = paddle.y + paddle.height / 2;
  const relativeIntersectY = (ball.y - paddleCenter) / (paddle.height / 2);
  const bounceAngle = relativeIntersectY * (Math.PI / 3);
  const speed = Math.min(10, Math.hypot(ball.vx, ball.vy) + 0.5);

  if (paddle === leftPaddle) {
    ball.x = paddle.x + paddle.width + ball.radius;
    ball.vx = Math.abs(Math.cos(bounceAngle) * speed);
  } else {
    ball.x = paddle.x - ball.radius;
    ball.vx = -Math.abs(Math.cos(bounceAngle) * speed);
  }

  ball.vy = Math.sin(bounceAngle) * speed;
}

function updateGame() {
  handleInput();
  moveComputer();

  ball.x += ball.vx;
  ball.y += ball.vy;

  checkWallCollision();
  handlePaddleCollision(leftPaddle);
  handlePaddleCollision(rightPaddle);

  if (ball.x - ball.radius < 0) {
    computerScore++;
    updateScore();
    resetBall(1);
  }

  if (ball.x + ball.radius > canvas.width) {
    playerScore++;
    updateScore();
    resetBall(-1);
  }
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenterLine() {
  ctx.strokeStyle = "#d1d5db";
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRect(0, 0, canvas.width, canvas.height, "#000");
  drawCenterLine();

  drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, "#60a5fa");
  drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, "#f87171");

  drawBall(ball.x, ball.y, ball.radius, "#f9fafb");
}

function gameLoop() {
  updateGame();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  if (event.key in keys) {
    keys[event.key] = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const relativeY = event.clientY - rect.top;
  leftPaddle.y = relativeY - leftPaddle.height / 2;
  leftPaddle.y = clamp(leftPaddle.y, 0, canvas.height - leftPaddle.height);
});

updateScore();
resetBall(1);
requestAnimationFrame(gameLoop);
