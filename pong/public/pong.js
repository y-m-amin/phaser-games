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
    this.load.image('paddle', 'assets/paddle.png');
    this.load.image('ball', 'assets/ball.png');
}

let paddleLeft, paddleRight, ball;
let cursors;
let keys;
let scoreLeft = 0, scoreRight = 0;
let scoreTextLeft, scoreTextRight;

function create() {
    paddleLeft = this.physics.add.sprite(50, this.physics.world.bounds.height / 2, 'paddle');
    paddleLeft.setDisplaySize(20, 100);
    paddleLeft.setCollideWorldBounds(true);
    paddleLeft.setImmovable(true);

    paddleRight = this.physics.add.sprite(this.physics.world.bounds.width - 50, this.physics.world.bounds.height / 2, 'paddle');
    paddleRight.setDisplaySize(20, 100);
    paddleRight.setCollideWorldBounds(true);
    paddleRight.setImmovable(true);

    ball = this.physics.add.sprite(this.physics.world.bounds.width / 2, this.physics.world.bounds.height / 2, 'ball');
    ball.setDisplaySize(20, 20);
    ball.setCollideWorldBounds(true);
    ball.setBounce(1, 1);
    ball.setVelocity(150, 150);

    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,S');

    this.physics.add.collider(ball, paddleLeft, hitPaddle, null, this);
    this.physics.add.collider(ball, paddleRight, hitPaddle, null, this);

    scoreTextLeft = this.add.text(100, 50, '0', { fontSize: '32px', fill: '#fff' });
    scoreTextRight = this.add.text(600, 50, '0', { fontSize: '32px', fill: '#fff' });
}

function update() {
    if (keys.W.isDown) {
        paddleLeft.setVelocityY(-300);
    } else if (keys.S.isDown) {
        paddleLeft.setVelocityY(300);
    } else {
        paddleLeft.setVelocityY(0);
    }

    if (cursors.up.isDown) {
        paddleRight.setVelocityY(-300);
    } else if (cursors.down.isDown) {
        paddleRight.setVelocityY(300);
    } else {
        paddleRight.setVelocityY(0);
    }

    if (ball.x < 0) {
        scoreRight += 1;
        updateScore();
        resetBall();
    } else if (ball.x > config.width) {
        scoreLeft += 1;
        updateScore();
        resetBall();
    }
}

function hitPaddle(ball, paddle) {
    let diff = 0;
    if (ball.y < paddle.y) {
        diff = paddle.y - ball.y;
        ball.setVelocityY(-10 * diff);
    } else if (ball.y > paddle.y) {
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
