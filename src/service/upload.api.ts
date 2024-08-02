import { Api } from '@midwayjs/hooks';
import {
    Upload,
    useFiles,
} from '@midwayjs/hooks-upload';

export default Api(
    Upload('/api/upload/:id'),
    async (id) => {
        const files = useFiles();
        return files;
    }
);