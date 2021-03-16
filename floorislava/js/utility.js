class Util {
    constructor() { }
    static clamp(a, b, c) {
        return Math.max(b, Math.min(c, a));
    }
    static lerp(start, end, amt) {
        return start * (1 - amt) + amt * end;
    }
    static getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }
}
class Clock {
    constructor() {
        this.time = 0;
    }
    tick(deltaTime) {
        this.time += deltaTime;
    }
    curTime() {
        return this.time;
    }
}
class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // If only JS had operator overloading.
    // So instead I just made static methods.
    static add(vector, vector2) {
        let newVector = new Vector2D(0, 0);
        newVector.x = vector.x + vector2.x;
        newVector.y = vector.y + vector2.y;
        return newVector;
    }
    static sub(vector, vector2) {
        let newVector = new Vector2D(0, 0);
        newVector.x = vector.x - vector2.x;
        newVector.y = vector.y - vector2.y;
        return newVector;
    }
    static mul(vector, scalar) {
        let newVector = new Vector2D(vector.x, vector.y);
        newVector.x = newVector.x * scalar;
        newVector.y = newVector.y * scalar;
        return newVector;
    }
    static div(vector, scalar) {
        let newVector = new Vector2D(vector.x, vector.y);
        newVector.x = newVector.x / scalar;
        newVector.y = newVector.y / scalar;
        return newVector;
    }
}
class Camera {
    constructor(width, height) {
        this.position = new Vector2D(0, 0);
        this.width = width / 2;
        this.height = height / 2;
    }
    transformSprite(sprite, position) {
        // This offset lets us get the correct position for the sprite on screen.
        let offset = new Vector2D(position.x - this.position.x, this.position.y - position.y);
        sprite.x = offset.x + this.width;
        sprite.y = offset.y + this.height;
    }
}