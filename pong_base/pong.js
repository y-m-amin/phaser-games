const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Load images from the local assets folder
    this.load.image('paddle', '../assets/paddle.png');
    this.load.image('ball', '../assets/ball.png');
}

let paddleLeft, paddleRight, ball;
let cursors, keys;
let scoreLeft = 0, scoreRight = 0;
let scoreTextLeft, scoreTextRight;

// Variables for AI control, which you can adjust for difficulty
let aiSpeed = 400; // Speed of AI paddle movement
let aiReactionDelay = 0; // Delay frames for AI reaction
let aiCurrentFrame = 0; // Counter for AI reaction delay
let aiTolerance = .01; // Tolerance range to reduce stuttering

function create() {
    // Create paddles with specific sizes
    paddleLeft = this.physics.add.sprite(50, this.physics.world.bounds.height / 2, 'paddle');
    paddleLeft.setDisplaySize(20, 100); // Set width and height in pixels
    paddleLeft.setCollideWorldBounds(true);
    paddleLeft.setImmovable(true);

    paddleRight = this.physics.add.sprite(this.physics.world.bounds.width - 50, this.physics.world.bounds.height / 2, 'paddle');
    paddleRight.setDisplaySize(20, 100); // Set width and height in pixels
    paddleRight.setCollideWorldBounds(true);
    paddleRight.setImmovable(true);

    // Create ball
    ball = this.physics.add.sprite(this.physics.world.bounds.width / 2, this.physics.world.bounds.height / 2, 'ball');
    ball.setDisplaySize(20, 20); // Set width and height in pixels
    ball.setCollideWorldBounds(true);
    ball.setBounce(1, 1);
    ball.setVelocity(150, 150);

    // Enable input for left paddle
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,S');
    this.input.keyboard.on('keydown_W', moveUpPaddleLeft, this);
    this.input.keyboard.on('keyup_W', stopPaddleLeft, this);
    this.input.keyboard.on('keydown_S', moveDownPaddleLeft, this);
    this.input.keyboard.on('keyup_S', stopPaddleLeft, this);

    // Collisions
    this.physics.add.collider(ball, paddleLeft, hitPaddle, null, this);
    this.physics.add.collider(ball, paddleRight, hitPaddle, null, this);

    // Score text
    scoreTextLeft = this.add.text(100, 50, '0', { fontSize: '32px', fill: '#fff' });
    scoreTextRight = this.add.text(600, 50, '0', { fontSize: '32px', fill: '#fff' });
}

function update() {
    // Move left paddle with 'W' and 'S' keys
    if (keys.W.isDown) {
        paddleLeft.setVelocityY(-300);
    } else if (keys.S.isDown) {
        paddleLeft.setVelocityY(300);
    } else {
        paddleLeft.setVelocityY(0);
    }

    // AI Control for Right Paddle
    if (aiCurrentFrame >= aiReactionDelay) {
        if (ball.x > 400){
            if (ball.y < paddleRight.y) {
                paddleRight.setVelocityY(-aiSpeed);
            } else if (ball.y > paddleRight.y) {
                paddleRight.setVelocityY(aiSpeed);
            } else {
                paddleRight.setVelocityY(0);
            }
            aiCurrentFrame = 0; // Reset the delay counter
        } 
    }
    else {
        aiCurrentFrame++;
    }

    // Check for scoring
    if (ball.x <= 10) {
        console.log("right wall hit");
        scoreRight += 1;
        updateScore();
        resetBall();
    } else if (ball.x >= config.width-10) {
        console.log("left wall hit");
        scoreLeft += 1;
        updateScore();
        resetBall();
    }
}
function moveUpPaddleLeft() {
    paddleLeft.setVelocityY(-300);
}

function moveDownPaddleLeft() {
    paddleLeft.setVelocityY(300);
}

function stopPaddleLeft() {
    paddleLeft.setVelocityY(0);
}

function hitPaddle(ball, paddle) {
    let diff = 0;
    if (ball.y < paddle.y) {
        console.log("ball hit");
        diff = paddle.y - ball.y;
        ball.setVelocityY(-10 * diff);
    } else if (ball.y > paddle.y) {
        console.log("ball hit");
        diff = ball.y - paddle.y;
        ball.setVelocityY(10 * diff);
    } else {
        ball.setVelocityY(2 + Math.random() * 8);
    }
}

function resetBall() {
    ball.setPosition(config.width / 2, config.height / 2);
    ball.setVelocity(150, 150 * (Math.random() > 0.5 ? 1 : -1));
}

function updateScore() {
    scoreTextLeft.setText(scoreLeft);
    scoreTextRight.setText(scoreRight);
}
