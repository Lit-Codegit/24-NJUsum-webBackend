import { Controller, Post, Files, Fields } from '@midwayjs/core';
// import { CircleRequestBody } from '../interface';
import { join } from 'path';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';


@Controller('/')
export class CreateController {


    private circleJsonPath = join(__dirname, '..', 'circle.json');
    // 图片存储路径
    private baseImagePath = join(__dirname, '..', 'src', 'circles_data');

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
        await this.updateCircleJson(circle_name, imageUrl);

        return { success: true, url: imageUrl };
    }

    private async checkCircleNameExists(circleName: string): Promise<boolean> {
        if (!existsSync(this.circleJsonPath)) {
            return false;
        }

        const circles = JSON.parse(readFileSync(this.circleJsonPath, 'utf8'));
        return circles[circleName] ? true : false;
    }

    private async saveImage(circleName: string, file: any): Promise<string> {
        try {
            // 确保目录存在
            const circleDir = join(this.baseImagePath, circleName);
            if (!existsSync(circleDir)) {
                mkdirSync(circleDir, { recursive: true });
            }

            // 保存文件
            const filePath = join(circleDir, file.originalFilename);
            writeFileSync(filePath, file.content);

            // 返回图片的相对路径
            return join(circleName, file.originalFilename);
        } catch (error) {
            console.error('Error saving image:', error);
            return null;
        }
    }

    private async updateCircleJson(circleName: string, imageUrl: string): Promise<void> {
        let circles = {};

        if (existsSync(this.circleJsonPath)) {
            circles = JSON.parse(readFileSync(this.circleJsonPath, 'utf8'));
        }

        circles[circleName] = { imageUrl };

        writeFileSync(this.circleJsonPath, JSON.stringify(circles, null, 2));
    }
}
