import { Inject, Controller, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import * as fs from 'fs'
import * as path from 'path'
@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Get('/get_user')
  async getUser(@Query('uid') uid) {
    const user = await this.userService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }


  @Get('/circles')
  async getCircles(ctx: Context) {
    const filePath = path.join('src', 'circles.json');

    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const circles = JSON.parse(fileContent);
      const circlesWithUrls = circles.map(circle => ({
        ...circle,
        icon_url: 'http://127.0.0.1:7002'+`/circles_pub/${circle.circle_name}/${circle.icon_url}` // 用静态资源配置
      }));
      ctx.body = circlesWithUrls;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: 'Error reading circles data' };
    }
  }

  @Get('/:circleId/:postId')
  async getPost(ctx: Context) {
    const { circleId, postId } = ctx.params;
    const filePath = path.join('src', 'circles_data', circleId, `post_${postId}.json`);

    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      ctx.body = JSON.parse(fileContent);
    } catch (error) {
      ctx.status = 404;
      ctx.body = { message: 'Post not found' };
    }
  }
  
}

