import { Body, Controller, Param, Post } from "@midwayjs/core";
import { ThreadDto } from "../dto/thread.dto";

@Controller('/thread')
export class ThreadController {

    @Post("/create")
    public async create(@Body() form: ThreadDto){
        console.log(form);
    }


    @Post("/:threadid/comment")
    public async comment(@Param("threadid") threadid: string) {
        console.log(threadid);
    }
}