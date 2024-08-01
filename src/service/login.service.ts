import { Provide } from '@midwayjs/core';
import { LoginRequestBody } from '../interface';
import * as fs from 'fs';
@Provide()
export class LoginService {
    async login(body: LoginRequestBody): Promise<{ success: boolean; message: string }> {

        const { username, passwd } = body;
        const users = JSON.parse(fs.readFileSync('./src/users.json', 'utf-8'));
        const userFind = users.find(u => u.username === username && u.passwd === passwd);

        if (userFind) {
            return {
                success: true,
                message: 'login'
            };
        } else {
            return {
                success: false,
                message: 'failed'
            };
        }
    }
}