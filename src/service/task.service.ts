import { Provide } from "@midwayjs/core";
import { Task } from "../model/task.model";
import * as fs from 'fs'
import * as path from 'path'


@Provide()
export class TaskService {

    public async create(task: Task) {

        fs.writeFile(path.join("D:", "task.json"), JSON.stringify(task), () => {
            console.log("写入成功");
        })
    }


    public fetch(): Task {
        const data = JSON.parse(fs.readFileSync(path.join("D:", "task.json"), 'utf-8'));
        return new Task(data["name"], data["description"], data["creatAt"]);
    }
}