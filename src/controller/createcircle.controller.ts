import { Controller, Post, Files, Fields } from '@midwayjs/core';
// import { CircleRequestBody } from '../interface';
import { join } from 'path';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { Circle } from '../interface';

@Controller('/')
export class CreateController {

    private circleJsonPath = join(__dirname, '..','..','src', 'circles.json');
    // 图片存储路径
    private baseImagePath = join(__dirname, '..','..', 'src', 'circles_data');

    @Post('/createcircle')
    async createCircle(@Files() file, @Fields() fields): Promise<{ success: boolean; url?: string }> {

        console.log(file);
        const { circle_name } = fields;

        // 检查circle_name是否已存在
        if (await this.checkCircleNameExists(circle_name)) {
            return { success: false, url: null };
        }

        // 保存图片
        const imageUrl = await this.saveImage(circle_name, file);

        if (!imageUrl) {
            return { success: false, url: null };
        }

        // 更新circle.json
        await this.updateCircleJson(circle_name, imageUrl[0]);

        return { success: true, url: imageUrl[0]};
    }

    private async checkCircleNameExists(circleName: string): Promise<boolean> {
        if (!existsSync(this.circleJsonPath)) {
            return false;
        }

        const circles: Circle[] = JSON.parse(readFileSync(this.circleJsonPath, 'utf8'));
        // 数组的 some 方法: 遍历数组中的每个元素，并对每个元素执行一个测试函数。如果测试函数对任何元素返回 true，那么 some 方法会返回 true
        return circles.some(circle => circle.circle_name === circleName);
    }

    private async saveImage(circleName: string, files: any): Promise<string[]> {
        try {
            // 确保目录存在
            const circleDir = join(this.baseImagePath, circleName);
            if (!existsSync(circleDir)) {
                mkdirSync(circleDir, { recursive: true });
            }

            const savedFilePaths: string[] = [];

            for (const file of files) {
                if (!file || typeof file.filename !== 'string') {
                    throw new Error('Invalid file object or missing filename property');
                }

                // 提取原始文件名的后缀
                const extension = file.filename.slice(file.filename.lastIndexOf('.'));
                // 保存文件
                const filePath = join(circleDir, 'circle_icon_' + circleName + extension);
                // file.data 是文件内容的字符串形式，如果是 Buffer，直接 file.data
                writeFileSync(filePath, readFileSync(file.data));

                // re图片绝对路径
                savedFilePaths.push(filePath);
            }

            return savedFilePaths;
        } catch (error) {
            console.error('Error saving image:', error);
            return null;
        }
    }

    private async updateCircleJson(circleName: string, imageUrl: string): Promise<void> {
        let circles: Circle[] = [];

        if (existsSync(this.circleJsonPath)) {
            circles = JSON.parse(readFileSync(this.circleJsonPath, 'utf8'));
        }

        let numOfCircles = circles.length;
        circles[numOfCircles] = { 
            circle_id: numOfCircles,
            icon_name: imageUrl,
            circle_name:circleName,
            active_users: [],
            posts_cnt:0
         };

        writeFileSync(this.circleJsonPath, JSON.stringify(circles, null, 2));
    }
}
