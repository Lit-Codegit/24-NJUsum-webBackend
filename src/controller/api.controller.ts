import { Inject, Controller, Get, Post, Body, Query, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import * as fs from 'fs'
import * as path from 'path'
import { readFileSync, writeFileSync } from 'fs';
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

// 获取兴趣圈全列表
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

// 获取某个兴趣圈
  @Get('/circle/:id')
  async getCirclePosts(@Param() id) {
    const circle_id = id.id;
    const circlesJsonPath = path.join('src', 'circles.json');
    
      const circlesContent = await fs.promises.readFile(circlesJsonPath, 'utf8');
      const circles = JSON.parse(circlesContent);

      // 寻找与circle_id匹配的circle_name
      const circle = circles.find(c => c.circle_id == circle_id);
      if (!circle) {
        this.ctx.status = 404;
        this.ctx.body = { message: 'Circle not found' };
        return;
      }
      const circle_name = circle.circle_name;
      

    const circlesDataPath = path.join('src', 'circles_data', circle_name);

    try {
      // 读取circle_data文件夹下的所有帖子文件
      const files = await fs.promises.readdir(circlesDataPath);

      console.log('processing')


      const postsPromises = files.map(file => {
        if (file.startsWith('post_') && file.endsWith('.json')) {
          return fs.promises.readFile(path.join(circlesDataPath, file), 'utf8');
        }
        return null;
      });

      // 等待所有帖子文件读取完成!!!否则白屏
      const postsContents = await Promise.all(postsPromises);

      
      const posts = postsContents
        .filter(content => content !== null) // 过滤null值
        .map(content => JSON.parse(content))
        // .map(post => ({
        //   ...post,
        //   images: post.images.map(() => `http://127.0.0.1:7002/circles_pub/${circle_id}/pic_${post.post_id}`) // 添加图片URL前缀
        // }));

      this.ctx.body = posts; // 返回帖子数组
    } catch (error) {
      this.ctx.status = 500;
      this.ctx.body = { message: 'Error reading directory', error: error.message };
    }
  }


  @Get('/circle/:circle_id/post/:post_id')
  async getPostDetail() {
    try {
      const { circle_id, post_id } = this.ctx.params; // 解构出 circle_id 和 post_id

      const circlesJsonPath = path.join(__dirname, '..', '..', 'src', 'circles.json');
      const circles = JSON.parse(readFileSync(circlesJsonPath, 'utf8'));

      const circle_name = (circles.find(circle => circle.circle_id === Number(circle_id))).circle_name;

      const filePath = path.join(__dirname, '..', '..', 'src', `circles_data/${circle_name}/post_${post_id}.json`);

      const post = JSON.parse(readFileSync(filePath, 'utf8'));
      return { success: true, data: post };
    } catch (error) {
      return { success: false, message: 'Post not found' };
    }
  }

  @Post('/circle/:circle_id/post/:post_id/like')
  async likePost() {
    try {
      const { circle_id, post_id } = this.ctx.params; 
      const circlesJsonPath = path.join(__dirname,'..', '..','src', 'circles.json');
      const circles = JSON.parse(readFileSync(circlesJsonPath, 'utf8'));

      const circle_name = (circles.find(circle => circle.circle_id === Number(circle_id))).circle_name;

      const filePath = path.join(__dirname, '..','..','src', `circles_data/${circle_name}/post_${post_id}.json`);

      const post = JSON.parse(readFileSync(filePath, 'utf8'));
      post.thumbs += 1; // ...
      // 可能是因为写入的是disc?
      writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf8');
      return { success: true, data: post.thumbs };
    } catch (error) {
      return { success: false, message: 'Failed to like post' };
    }
  }

  @Post('/circle/:circle_id/post/:post_id/comment')
  async submitComment(@Body('content') content:string) {
    const { circle_id, post_id } = this.ctx.params; 
    try {
      const circlesJsonPath = path.join(__dirname, '..', '..', 'src', 'circles.json');
      const circles = JSON.parse(readFileSync(circlesJsonPath, 'utf8'));

      const circle_name = (circles.find(circle => circle.circle_id === Number(circle_id))).circle_name;

      const filePath = path.join(__dirname, '..', '..', 'src', `circles_data/${circle_name}/post_${post_id}.json`);

      const post = JSON.parse(readFileSync(filePath, 'utf8'));
      post.comments.push( content ); // 加评论
      writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf8');
      return { success: true, data: post.comments };
    } catch (error) {
      return { success: false, message: 'Failed to submit comment' };
    }
  }

}


