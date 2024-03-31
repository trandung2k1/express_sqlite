import * as express from 'express';
import { Request, Response } from 'express';
import { dataSource } from './app-data-source';
import { Photo } from './entities/Photo';

const port = +process.env.PORT || 4000;
const app = express();

app.use(express.json());
app.get('/photos', async function (req: Request, res: Response) {
    const photoRepository = dataSource.getRepository(Photo);
    const photos = await photoRepository.find();
    return res.status(200).json(photos);
});

app.get('/create-photo', async function (req: Request, res: Response) {
    const photoRepository = dataSource.getRepository(Photo);
    const photo = photoRepository.create({
        name: 'Iphone 15',
        description: 'Iphone 15 Pro Max',
        filename: 'Iphone15.jpg',
        views: 100,
        isPublished: true,
    });

    const saved = await photoRepository.save(photo);
    return res.status(200).json(saved);
});

// Demo transaction
app.get('/update-photo', async function (req: Request, res: Response) {
    const queryRunner = dataSource.createQueryRunner();
    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let photo1 = await queryRunner.manager.findOneByOrFail(Photo, { id: 1 });
        let photo2 = await queryRunner.manager.findOneByOrFail(Photo, { id: 2 });

        photo1 = queryRunner.manager.merge(Photo, photo1, {
            name: 'Iphone 15 Pro Max',
        });

        photo2 = queryRunner.manager.merge(Photo, photo2, {
            name: 'Iphone 15 Pro Max 512GB',
        });

        const savedPhoto1 = await queryRunner.manager.save(Photo, photo1);
        const savedPhoto2 = await queryRunner.manager.save(Photo, photo2);
        await queryRunner.commitTransaction();
        return res.status(200).json({ savedPhoto1, savedPhoto2 });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        return res.status(500).json(error);
    } finally {
        queryRunner.release();
    }
});

app.listen(port, () => {
    dataSource
        .initialize()
        .then(() => {
            console.log('Connected DB successfully');
        })
        .catch((err: any) => {
            console.log(err);
        });
    console.log(`Server listening on http://localhost:${port}`);
}).on('error', (e: Error) => {
    console.log(e);
    process.exit(1);
});
