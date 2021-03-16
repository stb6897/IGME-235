PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
let app;
window.onload = function () {
    app = new PIXI.Application(
        {
            width: 800,
            height: 600,
            backgroundColor: 0x000000,
        }
    );
    document.body.appendChild(app.view);
    setUp();
}
window.WebFontConfig = {
    google: {
        families: ['Snippet', 'Roboto:700', 'Roboto:400', "MedievalSharp:700", "MedievalSharp:400"]
    },
};
//#region Variables
// Containers
let menuScene;
let mainScene;
let endScene;
let hud;

// General
let camera;
let paused = true;
let timer = new Clock();
let deltaTime = 0;
let gravity = new Vector2D(0, 420);
let background;
let timerText;
let scoreText;
let jump;
let music;

// Player & Platforms
let player;
let playerControls = {
    68: false,
    65: false,
}
let jumpVelocity = 5;
let platforms;
let lava;
let procStage = 0;
let procInc = 0;
//#endregion
//#region VGUI Functions
function StartText() {
    let startStyle = {
        fontFamily: 'MedievalSharp',
        fill: '#ffffff',
        fontSize: 28,
        align: 'center',
    }
    let box = new PIXI.Sprite.from("images/border.png");
    box.width = 700;
    box.height = 180;
    box.anchor.set(0.5);
    box.x = app.view.width / 2;
    box.y = (app.view.height / 2) - 95;
    menuScene.addChild(box);


    let controlsText = new PIXI.Text('Welcome Traveller\n You must scale the castle and escape the lava \nControls: WASD to move. Space to jump.', startStyle);
    controlsText.position.x = app.view.width / 2;
    controlsText.position.y = (app.view.height / 2) - 150;
    controlsText.anchor.x = 0.5;
    menuScene.addChild(controlsText);

    let button = new PIXI.Sprite.from("images/border_start.png");
    button.width = 256;
    button.height = 64;
    button.buttonMode = true;
    button.anchor.set(0.5);
    button.x = app.view.width / 2;
    button.y = (app.view.height / 2) + 70;
    button.interactive = true;
    button.on('mousedown', startGame);
    menuScene.addChild(button);

    let startText = new PIXI.Text('Start', startStyle);
    startText.position.x = app.view.width / 2;
    startText.position.y = (app.view.height / 2) + 50;
    startText.anchor.x = 0.5;
    menuScene.addChild(startText);
}

function EndText() {
    let endStyle = {
        fontFamily: 'MedievalSharp',
        fill: '#ffffff',
        fontSize: 28,
        align: 'center',
    }
    let box = new PIXI.Sprite.from("images/border.png");
    box.width = 700;
    box.height = 180;
    box.anchor.set(0.5);
    box.x = app.view.width / 2;
    box.y = (app.view.height / 2) - 95;
    endScene.addChild(box);

    let deathText = new PIXI.Text('You have perished\n Would you like to try again?', endStyle);
    deathText.position.x = app.view.width / 2;
    deathText.position.y = (app.view.height / 2) - 150;
    deathText.anchor.x = 0.5;
    endScene.addChild(deathText);

    let button = new PIXI.Sprite.from("images/border_start.png");
    button.width = 256;
    button.height = 64;
    button.buttonMode = true;
    button.anchor.set(0.5);
    button.x = app.view.width / 2;
    button.y = (app.view.height / 2) + 70;
    button.interactive = true;
    button.on('mousedown', startGame);
    endScene.addChild(button);

    scoreText = new PIXI.Text('00:00', endStyle);
    scoreText.position.x = app.view.width / 2;
    scoreText.position.y = (app.view.height / 2) - 80;
    scoreText.anchor.x = 0.5;
    endScene.addChild(scoreText);

    let retryText = new PIXI.Text('Retry', endStyle);
    retryText.position.x = app.view.width / 2;
    retryText.position.y = (app.view.height / 2) + 50;
    retryText.anchor.x = 0.5;
    endScene.addChild(retryText);
}

function HUD() {
    let box = new PIXI.Sprite.from("images/border.png");
    box.width = 128;
    box.height = 32;
    box.anchor.set(0.5);
    box.x = app.view.width / 2;
    box.y = 25;
    hud.addChild(box);
    let timerStyle = {
        fontFamily: 'MedievalSharp',
        fill: '#ffffff',
        fontSize: 26,
        align: 'center',
    }

    timerText = new PIXI.Text('00:00', timerStyle);
    timerText.position.x = app.view.width / 2;
    timerText.position.y = 10;
    timerText.anchor.x = 0.5;
    hud.addChild(timerText);
}
//#endregion
//#region Proc Gen & Milestones
function CheckMilestone() {
    let distance = Math.abs(player.position.y - lava.position.y);
    let diff = Util.clamp((timer.curTime() / 60), 0, 1);
    if (distance > 500) {
        lava.velocity.y = 5 * diff;
    }
    else if (distance > 1000) {
        lava.velocity.y = 8 * diff;
    }
    else {
        lava.velocity.y = 2 * diff;
    }
}
function RunProcGen() {
    if (player.position.y > procStage - 300) {
        procStage = procStage + 100;

        let origin = new Vector2D(0, procStage);
        let rng = Util.getRandom(0, 100);

        let xOffset = 0;
        if (procInc % 2 == 0) {
            xOffset = 100;
        }
        else {
            xOffset = -100;
        }
        xOffset += Util.getRandom(-5, 5);

        // 60% chance of moving platform
        if (rng > 60) {
            SpawnMovingPlatform(origin.x + xOffset, origin.y - Util.getRandom(0, 10));
        }
        else {
            SpawnPlatform(origin.x + xOffset, origin.y);
        }

        // Proc inc is just so we alternate which side we place a platform on.
        procInc += 1;

        // Place some platforms on the sides to give it more randomness.
        SpawnPlatform(origin.x + 400 - Util.getRandom(0, 200), origin.y);
        SpawnPlatform(origin.x - 400 + Util.getRandom(0, 200), origin.y);
    }
}
//#endregion
//#region Helpers
function SpawnBarrier(xPos, yPos, width, height) {
    let entity = new Barrier("images/blank.png", width, height);
    entity.position.x = xPos;
    entity.position.y = yPos;
    platforms.push(entity);
    mainScene.addChild(entity.sprite);
    return entity;
}

function SpawnPlatform(xPos, yPos) {
    let entity = new Platform("images/static_platform.png", 2.5);
    entity.position.x = xPos;
    entity.position.y = yPos;
    platforms.push(entity);
    mainScene.addChild(entity.sprite);
    return entity;
}

function SpawnMovingPlatform(xPos, yPos) {
    let entity = new MovingPlatform("images/moving_platform.png", 2.5);
    entity.position.x = xPos;
    entity.position.y = yPos;
    platforms.push(entity);
    mainScene.addChild(entity.sprite);
    return entity;
}

function RemovePlatform(entity) {
    entity.shouldDelete = true;
    mainScene.removeChild(entity.sprite);
}

function UpdatePlayerMovement() {
    if (playerControls[65]) {
        player.velocity.x = -3;
    }
    else if (playerControls[68]) {
        player.velocity.x = 3;
    }
    else {
        player.velocity.x = player.velocity.x * 0.7;
    }
}

function FormatTimeText(string) {
    let rawTime = parseInt(string, 10);
    let minutes = Math.floor(rawTime / 60);
    let seconds = rawTime - (minutes * 60);

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return minutes + ":" + seconds;
}
function setUp() {
    // Containers
    hud = new PIXI.Container();
    hud.visible = false;

    menuScene = new PIXI.Container();
    menuScene.visible = true;

    mainScene = new PIXI.Container();
    mainScene.visible = false;

    endScene = new PIXI.Container();
    endScene.visible = false;

    // Adds the background to the stage. Is not added to any scene because its used in all of them.
    background = new PIXI.Sprite.from("images/bg.png");
    background.anchor.set(0.5);
    background.visible = true;
    let bgRatio = background.width / background.height;
    background.width = app.view.width;
    background.height = app.view.height * bgRatio;
    background.x = app.view.width / 2;
    background.y = app.view.height / 2;

    // Adds Containers
    app.stage.addChild(background);
    app.stage.addChild(menuScene);
    app.stage.addChild(mainScene);
    app.stage.addChild(endScene);
    app.stage.addChild(hud);

    // Sets up the camera, player, and lava.
    camera = new Camera(app.view.width, app.view.height);
    player = new Player();

    mainScene.addChild(player.sprite);
    lava = new Lava("images/blank.png");
    hud.addChild(lava.sprite);

    // Sounds
    jump = new Howl({
        src: ['sounds/jump.wav']
    });
    jump.volume(0.4);
    music = new Howl({
        src: ['sounds/music.wav'],
    });

    // Adds all the VGUI.
    StartText();
    EndText();
    HUD();

    // Starts ticker
    app.ticker.add(mainLoop);
}
//#endregion
//#region Main Game
function startingPlatforms() {
    SpawnPlatform(0, -100);
}
function startGame() {
    menuScene.visible = false;
    endScene.visible = false;
    mainScene.visible = true;
    hud.visible = true;
    if (platforms) {
        for (let index = 0; index < platforms.length; index++) {
            RemovePlatform(platforms[index])
        }
    }

    platforms = [];

    startingPlatforms();

    player.position = new Vector2D(0, 0);
    player.velocity = new Vector2D(0, 0);
    camera.position = player.position;

    lava.position.y = -500;
    lava.velocity.y = 0.3;

    procStage = player.position.y - 120;

    paused = false;
    music.volume(0.15);
    music.loop(true);
    music.play();
}
function endGame() {
    menuScene.visible = false;
    mainScene.visible = false;
    endScene.visible = true;
    hud.visible = false;
    paused = true;
    timer.time = 0;
    scoreText.text = "Survived Time: " + timerText.text;
    music.stop();
}
function mainLoop() {
    if (paused) return;

    // Gets delta time and increases timer.
    deltaTime = 1 / app.ticker.FPS;
    if (deltaTime > 1 / 12) deltaTime = 1 / 12;
    timer.tick(deltaTime);

    // Updates cameras position and the player.
    camera.position.x = Util.lerp(camera.position.x, player.position.x, deltaTime * 2);
    camera.position.y = Util.lerp(camera.position.y, player.position.y, deltaTime * 2);
    player.acceleration = Vector2D.sub(player.acceleration, gravity);
    player.update(deltaTime);
    camera.transformSprite(player.sprite, player.position);

    // Checks for collisions with platforms and updates platforms.
    player.grounded = false;
    for (let index = 0; index < platforms.length; index++) {
        let platform = platforms[index];

        platform.update(deltaTime);
        camera.transformSprite(platform.sprite, platform.position);
        player.collide(platform, deltaTime);

        if (platform.position.y < lava.position.y) {
            RemovePlatform(platform);
        }
    }

    // Move Lava & Update Player Movement
    lava.update(deltaTime);
    camera.transformSprite(lava.sprite, lava.position);
    UpdatePlayerMovement();

    // Filters out platforms long gone.
    platforms = platforms.filter(p => !p.shouldDelete);

    // Update Timer Text
    timerText.text = FormatTimeText(timer.curTime());

    // Runs proc gen & Lava Milestones
    RunProcGen();
    CheckMilestone();

    // Checks if the lava has got the player.
    if (lava.intersects(player)) {
        endGame();
    }
}
//#endregion
//#region Controls
let keysDown = {
    68: function () {
        playerControls[68] = true;
    },
    65: function () {
        playerControls[65] = true;
    },
    87: function () {
        if (player.grounded) {
            jump.play();
            player.velocity.y += jumpVelocity;
        }
    },
    32: function () {
        if (player.grounded) {
            jump.play();
            player.velocity.y += jumpVelocity;
        }
    }
}
let keysUp = {
    68: function () {
        playerControls[68] = false;
    },
    65: function () {
        playerControls[65] = false;
    }
}
function keyUp(e) {
    if (keysUp[e.keyCode]) {
        keysUp[e.keyCode]();
    }
}
function keyDown(e) {
    if (keysDown[e.keyCode]) {
        keysDown[e.keyCode]();
    }
}
window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);
//#endregion