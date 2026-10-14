export class NoFirstNodeError extends Error {
    constructor() {
        super("No first node");
        this.name = "NoFirstNodeError";
        Object.setPrototypeOf(this, NoFirstNodeError.prototype);
    }
}
