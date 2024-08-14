import { Controller, Post, Files, Fields, Get, Param } from '@midwayjs/core';
import { join, dirname } from 'path';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { Post as PostInterface } from '../interface';

@Controller('/')
export class PostController {
    private baseImagePath = join(__dirname, '..', '..', 'src', 'circles_data');
    private postsPath = join(__dirname, '..', '..', 'src', 'circles_data');
    private circlesJsonPath = join(__dirname, '..', '..', 'src', 'circles.json');

    @Get('/getPostid/:circle_id')
    async getPostid(@Param() circle_id) {
        // Param是一个Object
        const id = circle_id.circle_id;
        // console.log(this.getPostsCnt(id));
        const post_id = await this.getPostsCnt(id);
        return post_id + 1;
    }

    @Post('/createpost')
        // 这里不能用Param??????
        // 是config设置问题...
    async createPost(@Files() files, @Fields() fields): Promise<{ success: boolean; post_id?: string }> {
        console.log(files);
        const { circle_id, owner, title, content, images_path } = fields;
        
        // 帖子ID按照发帖顺序递增
        const postsCnt = (await this.getPostsCnt(circle_id)) + 1; 

        // 获取circle_name
        const circleName = await this.getCircleName(circle_id);
        if (!circleName) {
            throw new Error('Circle name not found for the given circle ID');
        }

        
        // 保存图片  收集图片路径
        const imagesPaths: string[] = [];
        for (const file of files) {
            if (!file || typeof file.filename !== 'string') {
                throw new Error('Invalid file object or missing filename property');
            }
            const fileName = `${file.filename}`;
            const filePath = join(this.baseImagePath, circleName, fileName);
            // 这里的路径是为了读文件

            writeFileSync(filePath, readFileSync(file.data));
            // 图片路径:相对于baseImagePath的路径!!!
            imagesPaths.push(join(circleName, `post_${postsCnt}`, fileName));
        }

        // 帖子对应的JSON
        const postJsonPath = join(this.postsPath, circleName, `post_${postsCnt}.json`);
        const post: PostInterface = {
            post_id: String(postsCnt),
            owner: owner,
            title: title,
            content: content,
            images: images_path,
            thumbs: 0,
            comments:[]
        };

        // 确保目录存在(有可能直接访问)
        const directoryPath = dirname(postJsonPath);
        if (!existsSync(directoryPath)) {
            mkdirSync(directoryPath, { recursive: true });
        }

        // 写入帖子信息到JSON文件
        writeFileSync(postJsonPath, JSON.stringify(post, null, 2));

        // 更新circles.json
        const circles: any[] = [];
        if (existsSync(this.circlesJsonPath)) {
            circles.push(...JSON.parse(readFileSync(this.circlesJsonPath, 'utf8')));
        }

        const circle = circles.find(c => c.circle_id === Number(circle_id));
        if (circle) {
            circle.posts_cnt = postsCnt;
            const userIndex = circle.active_users.findIndex(u => u.name === fields.owner);
            if (userIndex === -1) {
                // 如果用户不存在，则添加用户并设置活跃度为1
                circle.active_users.push({ name: fields.owner, point: 1 });
            } else {
                // 如果用户已存在，则增加活跃度
                circle.active_users[userIndex].point += 1;
            }
        } else {
            circles.push({
                circle_id: Number(circle_id),
                icon_url: 'test', 
                circle_name: '1', 
                active_users: [{ name: fields.owner, point: '1' }],
                posts_cnt: postsCnt,
            });
        }

        writeFileSync(this.circlesJsonPath, JSON.stringify(circles, null, 2));

        return { success: true, post_id: String(postsCnt) };
    }

    private async getPostsCnt(circleId: string): Promise<number> {
        const circles: any[] = [];
        if (existsSync(this.circlesJsonPath)) {
            circles.push(...JSON.parse(readFileSync(this.circlesJsonPath, 'utf8')));
        }
        const circle = circles.find(c => c.circle_id === Number(circleId));
        return circle ? circle.posts_cnt : 0;
    }

    private async getCircleName(circleId: string): Promise<string | null> {
        const circles: any[] = [];
        if (existsSync(this.circlesJsonPath)) {
            circles.push(...JSON.parse(readFileSync(this.circlesJsonPath, 'utf8')));
        }
        const circle = circles.find(c => c.circle_id === Number(circleId));
        return circle ? circle.circle_name : null;
    }
//     private async getActiveUsers(circleId: string): Promise<any[]> {
//         const circles: any[] = [];
//         if (existsSync(this.circlesJsonPath)) {
//             circles.push(...JSON.parse(readFileSync(this.circlesJsonPath, 'utf8')));
//         }
//         const circle = circles.find(c => c.circle_id === Number(circleId));
//         return circle ? circle.active_users : [];
//     }
}