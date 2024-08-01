export class Task {

    private name: string;

    description: string;

    createAt: Date;

    constructor(name: string, description: string, createAt = new Date()) {
        this.name = name;
        this.description = description;
        this.createAt = createAt;
    }

    public getName() {
        return this.name;
    }
}