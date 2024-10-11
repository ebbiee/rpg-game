import Phaser from 'phaser'
import './css/styles.css'
import sky from '../assets/bg.png';
import ground from '../assets/platform.png';
import star from '../assets/star.png';
import bomb from '../assets/bomb.png';
import dude from '../assets/dude.png';

let config = {
    type: Phaser.AUTO,
    height: window.innerHeight,
    width: window.innerWidth,           
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let player;
let stars;
let bombs;
let platforms;
let cursors;
let score = 0;
let gameOver = false;
let scoreText;

let game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', sky);
    this.load.image('ground', ground);
    this.load.image('star', star);
    this.load.image('bomb', bomb);
    this.load.spritesheet('dude', dude, { frameWidth: 32, frameHeight: 48 });
  }

function create() {
    this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'sky').setDisplaySize(window.innerWidth, window.innerHeight);
    
    platforms = this.physics.add.staticGroup();

    platforms.create(window.innerWidth / 2, window.innerHeight - 32, 'ground').setScale(window.innerWidth / 400, 2).refreshBody();

    platforms.create(window.innerWidth * 0.75, window.innerHeight * 0.5, 'ground');
    platforms.create(window.innerWidth * 0.1, window.innerHeight * 0.35, 'ground');
    platforms.create(window.innerWidth * 0.9, window.innerHeight * 0.3, 'ground');

    player = this.physics.add.sprite(100, window.innerHeight - 150, 'dude');
    //to bounce off surfaces
    player.setBounce(0.2);
    //for the player not to go off screen
    player.setCollideWorldBounds(true);
//using the frames to control the player movements(the frame are inside the images)
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: window.innerWidth / 12 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
//to dectect the player collecting the star
    this.physics.add.overlap(player, stars, collectStar, null, this);
    
//to detect the playerr hitting the bomb
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-450);
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        let bomb = bombs.create(x, 16, 'bomb');
        //bounce without stopping
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}
