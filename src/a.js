class Ship {
  constructor(texture) {
    this.position = createVector(width / 2, height / 2);
    this.direction = createVector(0, -1);
    this.size = createVector(64, 64); // Resize the texture
    this.texture = texture;
  }

  update() {
    let angle = atan2(mouseY - this.position.y, mouseX - this.position.x);
    this.direction = createVector(cos(angle), sin(angle));
  }

  display() {
    push();
    translate(this.position.x, this.position.y);
      rotate(this.direction.heading() + PI / 2);
      imageMode(CENTER);
    image(this.texture, 0, 0, this.size.x, this.size.y);
    pop();
  }

  collidesWith(gameObject) {
    let distance = this.position.dist(gameObject.position);
    return distance < (this.size.x / 2) + (gameObject.size.x / 2);
  }
}

class Bullet {
  constructor(position, direction, texture) {
    this.position = position.copy();
    this.direction = direction.copy();
    this.texture = texture;
    this.size = createVector(16, 16); // Resize the texture
    this.velocity = this.direction.mult(42);
    this.life = 60; // Life in frames
  }

  update() {
    this.position.add(this.velocity);
    this.life -= 1;
  }

  isOffscreen() {
    return this.position.x < 0 || this.position.x > width || this.position.y < 0 || this.position.y > height;
  }

  display() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.direction.heading() + PI / 2);
    image(this.texture, 0, 0, this.size.x, this.size.y);
    pop();
  }

  collidesWith(gameObject) {
    let distance = this.position.dist(gameObject.position);
    return distance < (this.size.x / 2) + (gameObject.size.x / 2);
  }
}

class Asteroid {
  constructor(position, texture) {
    this.position = position.copy();
    this.direction = p5.Vector.random2D();
    this.texture = texture;
    this.size = createVector(64, 64); // Resize the texture
    this.velocity = this.direction.mult(10);
  }

  update() {
    this.position.add(this.velocity);
    this.wrapAround();
  }

  display() {
    push();
    translate(this.position.x, this.position.y);
    image(this.texture, 0, 0, this.size.x, this.size.y);
    pop();
  }

  wrapAround() {
    if (this.position.x > width + this.size.x / 2) {
      this.position.x = -this.size.x / 2;
    } else if (this.position.x < -this.size.x / 2) {
      this.position.x = width + this.size.x / 2;
    }
    if (this.position.y > height + this.size.y / 2) {
      this.position.y = -this.size.y / 2;
    } else if (this.position.y < -this.size.y / 2) {
      this.position.y = height + this.size.y / 2;
    }
  }

  collidesWith(gameObject) {
    let distance = this.position.dist(gameObject.position);
    return distance < (this.size.x / 2) + (gameObject.size.x / 2);
  }
}


let ship;
let bullets = [];
let asteroids = [];
let lives = 3;
let gameOver = false;
let score = 0;

let shipTexture;
let bulletTexture;
let asteroidTexture;

function preload() {
    shipTexture = loadImage('/teamemacs/img/emacs.png');
    asteroidTexture = loadImage('/teamemacs/img/vim.png');
  backgroundTexture = loadImage('/teamemacs/img/bg.png');
  bulletTexture = loadImage('/teamemacs/img/gnu.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  ship = new Ship(shipTexture);

  for (let i = 0; i < 5; i++) {
    let x = random(width);
    let y = random(height);
    let position = createVector(x, y);
    asteroids.push(new Asteroid(position, asteroidTexture));
  }
}

function draw() {
  background(backgroundTexture);

  if (gameOver) {
    displayGameOver();
  } else {
    for (let asteroid of asteroids) {
      asteroid.update();
      asteroid.display();
    }

    ship.update();
    ship.display();

    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].update();
      bullets[i].display();

      if (bullets[i].isOffscreen() || bullets[i].life <= 0) {
        bullets.splice(i, 1);
      }
    }
    checkCollisions();
    displayHUD();
    spawnAsteroids();
  }
}

function spawnAsteroids() {
  if (asteroids.length < 10) {
      let x = random(width);
      let y = random(height);
      let position = createVector(x, y);
      asteroids.push(new Asteroid(position, asteroidTexture));
  }
}

function mousePressed() {
  if (!gameOver) {
    bullets.push(new Bullet(ship.position, ship.direction, bulletTexture));
  }
    else
    {
    const buttonX = width / 2 - 100;
    const buttonY = height / 2 + 100;
    const buttonW = 200;
    const buttonH = 50;
    if (
      mouseX >= buttonX &&
      mouseX <= buttonX + buttonW &&
      mouseY >= buttonY &&
      mouseY <= buttonY + buttonH
    ) {
      const tweetLink = generateTweetLink(score);
      window.open(tweetLink, "_blank");
    }
    }
}

function checkCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = asteroids.length - 1; j >= 0; j--) {
      if (bullets[i] && bullets[i].collidesWith(asteroids[j])) {
        bullets.splice(i, 1);
        asteroids.splice(j, 1);
        score += 10;
        break;
      }
    }

  for (let i = asteroids.length - 1; i >= 0; i--) {
    if (ship.collidesWith(asteroids[i])) {
      loseLife();
      asteroids.splice(i, 1);
      break;
    }
  }
      
  }
}

function loseLife() {
  lives--;
  if (lives <= 0) {
    gameOver = true;
  }
}

function displayHUD() {
  textAlign(LEFT, TOP);
  textSize(40);
    fill(255);
  text(`Score: ${score}`, 10, 10);
    text(`Lives: ${lives}`, 10, 50);
}

function displayGameOver() {
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  text('GAME OVER', width / 2 , height / 2 );
  textSize(24);
  text(`Score: ${score}`, width / 2, height / 2 + 40);
    text(`#teamEmacs for life, made w ❤ & chatGPT`, width / 2, height / 2 + 80);

      const buttonX = width / 2 - 100;
  const buttonY = height / 2 + 100;
  const buttonW = 200;
  const buttonH = 50;
  drawTweetButton(buttonX, buttonY, buttonW, buttonH);
}

function generateTweetLink(score) {
  const base = "https://twitter.com/intent/tweet";
  const text = encodeURIComponent(`I just scored ${score} points at @julienbarbier42's game! Can you beat my score and help #teamEmacs?\nHow-to create this game using AI: https://twitter.com/julienbarbier42/status/1654664825048567809 \nPlay: `);
  const url = encodeURIComponent(window.location.href);
  return `${base}?text=${text}&url=${url}`;
}

function drawTweetButton(x, y, w, h) {
  fill(29, 161, 242);
  rect(x, y, w, h, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Tweet Your Score", x + w / 2, y + h / 2);
}


preload();
setup();
draw();
