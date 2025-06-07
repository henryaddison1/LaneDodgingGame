while (true) {
    playerName = prompt("Enter your name:");

    if (playerName && playerName.length <= 10) {
        break;
    }
}

// grabs canvas 2D drawing context
const canvas = document.getElementById('gamecanvas');
const ctx = canvas.getContext('2d');
const imgwidth = 40;
const imgheight = 80;

// array holding x positions for lanes
const lanes = [
    canvas.width / 4 - imgwidth / 2,
    3 * canvas.width / 4 - imgwidth / 2
];

// game variables
let score = 0;
let speed = 2;
let gameover = false;
let currentlane = 0;
let spawntimer = 0;

const playerImg = document.getElementById('playerImage');
const obstacleImg = document.getElementById('obstacleImage');

// defines object (player's vehicle)
const player = {
    x: lanes[currentlane],
    y: canvas.height - imgheight - 10,
    width: imgwidth,
    height: imgheight,
    img: playerImg
};

// empty array for obstacles, obstacles added here as objects representing position and size
const obstacles = [];

function createobstacle() {
    // randomly chooses lane 0 or 1
    const lane = Math.floor(Math.random() * 2);
    // adds new obstacle starting above the top of the canvas
    obstacles.push({
        x: lanes[lane],
        y: -imgheight,
        width: imgwidth,
        height: imgheight
    });
}

// main game loop, updates every frame
function updategame() {
    if (gameover) return;

    // clears previous frame’s drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draws dashed line
    // note: used ChatGPT to find the right commands here, including clearRect from above
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);


    // updates player's x position and draws them
    player.x = lanes[currentlane];
    ctx.drawImage(player.img, player.x, player.y, player.width, player.height);

    // gradually increase speed with score
    speed = 2 + score * 0.004;

    // loops through each object in obstacles arrary
    for (let i = 0; i < obstacles.length; i++) {
        // saves current obstacle into a variable called obs
        const obs = obstacles[i];
        // moves current obstacle downward by increasing its y position based on the current speed
        obs.y += speed;
        // draws obstacle image on canvas at current ob's (x, y) coords
        ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);

        // collision detection
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            endgame();
            return;
        }
    }

    // removes first obstacle from the array if it’s gone off canvas
    while (obstacles.length && obstacles[0].y > canvas.height) {
        obstacles.shift();
    }

    // increment spawntimer by 1 every frame
    // ChapGPT helped me formulate an idea on how to spawn obstacles far enough to assure the player car could still fit through
    spawntimer++;

    const lastobstacle = obstacles[obstacles.length - 1];
    // min vertical spacing between obstacles
    const minspacing = imgheight * 2;

    // min number of frames that must pass before the next obstacle can be spawned
    const spawnthreshold = Math.max(60 - speed * 3, 15);

    // only spawn if no obstacles yet or last obstacle is far enough away vertically
    if (!lastobstacle || lastobstacle.y > minspacing) {
        // and only if enough frames have passed since the last spawn
        if (spawntimer >= spawnthreshold) {
            createobstacle();
            spawntimer = 0;
        }
    }

    // increments and displays score
    score++;
    document.getElementById('scoredisplay').innerText = `Score: ${score}`;

    // requests next frame to continue loop
    requestAnimationFrame(updategame);
}

function endgame() {
    gameover = true;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.font = '15px Arial';
    ctx.fillText(`${playerName} you scored ${score}`, canvas.width / 2, canvas.height / 2 - 29);
    ctx.font = '15px Arial';
    ctx.fillText('Press space to play again', canvas.width / 2, canvas.height / 2 - 3);
    document.getElementById('instructions').style.display = 'inline-block';
}

function resetgame() {
    score = 0;
    speed = 2;
    currentlane = 0;
    obstacles.length = 0;
    gameover = false;
    spawntimer = 0;
    document.getElementById('scoredisplay').innerText = `Score: ${score}`;
    updategame();
}

// listens for key presses, movement (arrow left/right) or restart (space)
document.addEventListener('keydown', e => {
    if (gameover && e.code === 'Space') return resetgame();

    if (!gameover) {
        if (e.key === 'ArrowLeft' && currentlane > 0) currentlane--;
        if (e.key === 'ArrowRight' && currentlane < 2 - 1) currentlane++;
    }
});

// starts game loop
updategame();
