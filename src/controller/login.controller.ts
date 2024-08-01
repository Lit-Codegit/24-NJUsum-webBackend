
import { Body, Controller, Inject, Post} from '@midwayjs/core';
// import { Context } from '@midwayjs/koa';
import { LoginRequestBody } from '../interface';
import { LoginService } from '../service/login.service';

@Controller('/')
export class LoginController {
    
    // 注入,相当于创建一个实例,作为成员
    @Inject()
    loginService: LoginService;

    @Post('/login')
    async login(@Body() body: LoginRequestBody): Promise<{ success: boolean; message: string }> {
        
        const result = await this.loginService.login(body);

        return result;
    }
}