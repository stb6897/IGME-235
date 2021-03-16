class Entity {
    constructor(spriteImage, width, height) {
        this.sprite = new PIXI.Sprite.from(spriteImage);
        this.sprite.width = width || this.sprite.width;
        this.sprite.height = height || this.sprite.height;
        this.sprite.anchor.set(0.5);
        this.sprite.visible = true;
        this.position = new Vector2D(0, 0);
        this.velocity = new Vector2D(0, 0);
        this.acceleration = new Vector2D(0, 0);
    }
    getRectangle() {
        let bounds = this.sprite.getBounds();
        let rect = {
            top: bounds.y,
            left: bounds.x,
            bottom: bounds.y + bounds.height,
            right: bounds.x + bounds.width,
            x: bounds.x,
            y: bounds.y,
            hWidth: bounds.width / 2,
            hHeight: bounds.height / 2
        }
        return rect;
    }
    // Simple AABB checker.
    intersects(target) {
        let a = this.getRectangle();
        let b = target.getRectangle();
        return (a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom);
    }
    collide(target) {
        let a = this.getRectangle();
        let b = target.getRectangle();

        if (a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom) {
            return false;
        }

        let aC = new Vector2D(a.x + a.hWidth, a.y + a.hHeight);
        let bC = new Vector2D(b.x + b.hWidth, b.y + b.hHeight);

        let dx = bC.x - aC.x;
        let dy = bC.y - aC.y;

        let cW = a.hWidth + b.hWidth;
        let cH = a.hHeight + b.hHeight;

        let oX = cW - Math.abs(dx);
        let oY = cH - Math.abs(dy);

        // We first need to check which axis we want to resolve.
        if (oX > oY) {
            // Resolves on the Y
            if (dy > 0) {
                this.position.y = target.position.y + cH + 0.01;
                // Sets grounded. Basically just used for the player to see if they can jump.
                this.grounded = true;
                this.velocity.y = target.velocity.y;
            }
            else {
                this.position.y = target.position.y - cH - 0.01;
                if (this.velocity.y > 0) {
                    this.velocity.y = target.velocity.y;
                }
            }

            // This is also just for the player & moving platforms.
            if (target.velocity.x != 0) {
                this.velocity.x = target.velocity.x * 1.3;
            }
        }
        else {
            // Resolves on the X
            if (dx > 0) {
                this.position.x = target.position.x - cW - 0.01;
            }
            else {
                this.position.x = target.position.x + cW + 0.01;
            }
            this.velocity.x = target.velocity.x;
        }
        return true;
    }
    updateTransform(deltaTime) {
        // Transform Object
        let newPos = new Vector2D(this.position.x, this.position.y);
        this.acceleration = Vector2D.mul(this.acceleration, deltaTime);
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;

        newPos.x += this.velocity.x;
        newPos.y += this.velocity.y;

        // Zero out acceleration
        this.acceleration.x = 0;
        this.acceleration.y = 0;

        this.position = newPos;
    }
    // While not used by all ents this is good for adding more custom behavior.
    update(deltaTime) {
        this.updateTransform(deltaTime);
    }
}
class Player extends Entity {
    constructor() {
        super("images/character.png", 32, 32);
    }
}
class Platform extends Entity {
    constructor(spriteImage, scale) {
        super(spriteImage, 40 * scale, 10 * scale);
    }
}
class MovingPlatform extends Entity {
    constructor(spriteImage, scale) {
        super(spriteImage, 40 * scale, 10 * scale);
        this.rng = Util.getRandom(0, 1);
    }
    update(deltaTime) {
        if (Math.ceil(timer.curTime()) % 2 == 0) {
            if (this.rng > 0.5) {
                this.velocity.x = -1;
            }
            else {
                this.velocity.x = 1;
            }
        }
        else {
            if (this.rng > 0.5) {
                this.velocity.x = 1;
            }
            else {
                this.velocity.x = -1;
            }
        }
        super.update(deltaTime);
    }
}
class Barrier extends Entity {
    constructor(spriteImage, width, height) {
        super(spriteImage, width, height);
        this.sprite.tint = 0x000000;
    }
}
class Lava extends Entity {
    constructor(spriteImage) {
        super(spriteImage, 3000, 500);
        this.sprite.tint = 0xFF7F00;
    }
}