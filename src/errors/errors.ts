
export class NoFirstNodeError extends Error {
    constructor() {
        super("No first node found");
    }
}