
class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // If only JS had operator overloading.
    add(otherVector) {
        this.x = this.x + otherVector.x;
        this.y = this.y + otherVector.y;
    }
    sub(otherVector) {
        this.x = this.x - otherVector.x;
        this.y = this.y - otherVector.y;
    }
    mul(scalar) {
        this.x = this.x * scalar;
        this.y = this.y * scalar;
    }
    div(scalar) {
        this.x = this.x / scalar;
        this.y = this.y / scalar;
    }
    addNew(otherVector) {
        return new Vector2D(this.x + otherVector.x, this.y + otherVector.y);
    }
    subNew(otherVector) {
        return new Vector2D(this.x - otherVector.x, this.y - otherVector.y);
    }
    mulNew(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
    divNew(scalar) {
        return new Vector2D(this.x / scalar, this.y / scalar);
    }
}

class Camera {
    constructor(width, height) {
        this.position = new Vector2D(0, 0);
        this.width = width / 2;
        this.height = height / 2;
    }
    transformSprite(sprite, position) {
        let offset = new Vector2D(position.x - this.position.x, this.position.y - position.y);
        let rd = 100;
        sprite.x = offset.x + this.width;
        sprite.y = offset.y + this.height;
        sprite.visible = true;
        /*if (sprite.x < 0 - rd || sprite.x > (this.width * 2) + rd || sprite.y < 0 - rd || sprite.y > (this.height * 2) + rd) {
            sprite.visible = false;
        }*/
    }
}

class Entity {
    constructor(spriteImage) {
        this.sprite = new PIXI.Sprite.from(spriteImage);
        this.sprite.anchor.set(0.5);
        this.sprite.visible = true;
        this.position = new Vector2D(0, 0);
        this.velocity = new Vector2D(0, 0);
        this.acceleration = new Vector2D(0, 0);
        this.mass = 1.0;
    }
    updateTransform(deltaTime) {
        // Transform Object
        let newPos = new Vector2D(this.position.x, this.position.y);
        this.acceleration.mul(deltaTime)
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;

        newPos.x += this.velocity.x;
        newPos.y += this.velocity.y;

        // Zero out acceleration
        this.acceleration.x = 0;
        this.acceleration.y = 0;

        this.position = newPos;
    }
    applyForce(forceVector) {
        this.acceleration.add(forceVector.divNew(this.mass));
    }
    collide(target) {
        let aBounds = this.sprite.getBounds();
        let bBounds = target.sprite.getBounds();

        let a = {
            top: aBounds.y,
            left: aBounds.x,
            bottom: aBounds.y + aBounds.height,
            right: aBounds.x + aBounds.width,
            x: aBounds.x,
            y: aBounds.y,
            hWidth: aBounds.width / 2,
            hHeight: aBounds.height / 2
        }
        let b = {
            top: bBounds.y,
            left: bBounds.x,
            bottom: bBounds.y + bBounds.height,
            right: bBounds.x + bBounds.width,
            x: bBounds.x,
            y: bBounds.y,
            hWidth: bBounds.width / 2,
            hHeight: bBounds.height / 2
        }

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

        if (oX > oY) {
            if (dy > 0) {
                //console.log("B");
                this.position.y = target.position.y + cH + 0.01;
            }
            else {
                //console.log("T");
                this.position.y = target.position.y - cH - 0.01;
            }
            this.velocity.y = target.velocity.y;
            if (target.velocity.x != 0) {
                this.velocity.x = target.velocity.x * 1.3;
            }
            this.grounded = true;
        }
        else {
            if (dx > 0) {
                //console.log("R");
                this.position.x = target.position.x - cW - 0.01;
            }
            else {
                //console.log("L");
                this.position.x = target.position.x + cW + 0.01;
            }
            this.velocity.x = target.velocity.x;
        }
        return true;
    }
}

class Player extends Entity {
    constructor(spriteImage) {
        super(spriteImage);
        this.sprite.height = 32;
        this.sprite.width = 32;
    }
}
class Platform extends Entity {
    constructor(spriteImage) {
        super(spriteImage);
        this.sprite.height = 24;
        this.sprite.width = 100;
        this.sprite.tint = 0xff0000;
    }
}
class PlatformTall extends Entity {
    constructor(spriteImage) {
        super(spriteImage);
        this.sprite.height = 180;
        this.sprite.width = 12;
        this.sprite.tint = 0xff0000;
    }
}
class Lava extends Entity {
    constructor(spriteImage) {
        super(spriteImage);
    }
}