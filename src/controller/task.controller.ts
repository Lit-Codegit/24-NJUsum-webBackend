import { Controller, Get, Inject, Post } from "@midwayjs/core";
import { TaskService } from "../service/task.service";
import { Task } from "../model/task.model";

@Controller("/task")
export class TaskController {

    @Inject()
    taskService: TaskService;

    @Post('/create')
    public async create() {
        const task: Task = new Task("Web Development", "Day 3");
        this.taskService.create(task);
    }

    @Get('/fetch')
    public async fetch() {
        return this.taskService.fetch();
    }

    
}