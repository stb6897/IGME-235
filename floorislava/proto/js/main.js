let app;
window.onload = function () {
    app = new PIXI.Application(
        {
            width: 500,
            height: 500,
            backgroundColor: 0x000000
        }
    );
    document.body.appendChild(app.view);
    setUp();
}


//#region Variables
/*
    Containers
*/
let menuScene;
let mainScene;
let endScene;
let hud;
let camera;

/*
    Main Variables
*/
let paused = true;
let player;
let platforms;
let lava;
let score;
let deltaTime;
let gravity;

//#endregion
//#region Setup & Helpers
function SpawnPlatform(xPos, yPos, width, height) {
    let entity = new Platform("images/blank.png");
    entity.position.x = xPos;
    entity.position.y = yPos;
    entity.sprite.width = width;
    entity.sprite.height = height;
    platforms.push(entity);
    mainScene.addChild(entity.sprite);
    return entity;
}
function SpawnPlatformTall(xPos, yPos) {
    let entity = new PlatformTall("images/blank.png");
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
function setUp() {
    // Containers
    hud = new PIXI.Container();
    hud.visible = true;

    menuScene = new PIXI.Container();
    menuScene.visible = true;

    mainScene = new PIXI.Container();
    mainScene.visible = false;

    endScene = new PIXI.Container();
    endScene.visible = false;

    app.stage.addChild(hud);
    app.stage.addChild(menuScene);
    app.stage.addChild(mainScene);
    app.stage.addChild(endScene);

    camera = new Camera(app.view.width, app.view.height);

    player = new Player("images/blank.png");
    player.mass = 1;
    player.position.x = 0
    mainScene.addChild(player.sprite);

    /*
    lava = new Lava("images/blank.png");
    lava.sprite.width = 500;
    lava.position.y = -250;
    lava.rect = lava.sprite.getBounds();
    mainScene.addChild(lava.sprite);
    */

    startGame();

    app.ticker.add(mainLoop);
}

//#endregion
//#region Main Game
let lr = {
    68: false,
    65: false,
}
let movingPlat;
let movingPlat2;
function testLevel() {
    SpawnPlatform(0, -150, 1000, 20);
    SpawnPlatform(0, 300, 1000, 20);
    SpawnPlatform(-500, 60, 20, 500);
    SpawnPlatform(500, 60, 20, 500);

    SpawnPlatform(100, -80, 100, 20);
    SpawnPlatform(240, 50, 100, 20);
    SpawnPlatform(100, 100, 100, 20);
    SpawnPlatform(180, -20, 20, 20);



    movingPlat = SpawnPlatform(-200, 50, 100, 20);
    movingPlat2 = SpawnPlatform(-200, 230, 100, 20);

    SpawnPlatform(-400, 50, 100, 20);
    SpawnPlatform(-490, 140, 60, 20);
}
function startGame() {

    menuScene.visible = false;
    mainScene.visible = true;
    platforms = [];

    gravity = new Vector2D(0, 300);
    paused = false;
    player.grounded = false;
    testLevel();
}
Math.clamp = function (a, b, c) {
    return Math.max(b, Math.min(c, a));
}
let ticker = 0;
function mainLoop() {
    if (paused) return;

    deltaTime = 1 / app.ticker.FPS;
    if (deltaTime > 1 / 12) deltaTime = 1 / 12;

    player.acceleration.sub(gravity);

    player.updateTransform(deltaTime);
    camera.transformSprite(player.sprite, player.position);
    //camera.transformSprite(lava.sprite, lava.position);

    ticker = ticker + (deltaTime);
    if (Math.round(ticker * 0.5) % 2 == 0) {
        movingPlat.velocity.x = -1;
        movingPlat2.velocity.x = 1;
    }
    else {
        movingPlat.velocity.x = 1;
        movingPlat2.velocity.x = -1;
    }

    player.grounded = false;
    for (let index = 0; index < platforms.length; index++) {
        let platform = platforms[index];

        platform.updateTransform(deltaTime);
        camera.transformSprite(platform.sprite, platform.position);

        if (player.collide(platform, deltaTime)) {

        }
    }
    if (lr[65]) {
        player.velocity.x = -3;
    }
    else if (lr[68]) {
        player.velocity.x = 3;
    }
    else {
        player.velocity.x = player.velocity.x * 0.7;
    }


    //lava.position.y += 30 * deltaTime;




    camera.position = player.position;



}

let controls = {
    68: function () {
        lr[68] = true;
    },
    65: function () {
        lr[65] = true;
    },
    87: function () {
        if (player.grounded) {
            player.velocity.y += 4;
        }
    }
}
let controlsUp = {
    68: function () {
        lr[68] = false;
    },
    65: function () {
        lr[65] = false;
    }
}
function keyUp(e) {
    //console.log(e.keyCode)
    if (controlsUp[e.keyCode]) {
        controlsUp[e.keyCode]();
    }
}
function keyDown(e) {
    if (controls[e.keyCode]) {
        controls[e.keyCode]();
    }
}
window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);
//#endregion