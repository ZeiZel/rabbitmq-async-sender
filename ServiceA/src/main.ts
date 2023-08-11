import express, {Request, Response, NextFunction} from 'express';
import bodyParser from 'body-parser';
import amqp from 'amqplib';

const app = express();
app.use(bodyParser.json());

const QUEUE_NAME = 'user_requests';

async function bootstrap(): Promise<void> {
	const connection = await amqp.connect('amqp://localhost');
	const channel = await connection.createChannel();

	await channel.assertQueue(QUEUE_NAME, { durable: false });

	app.post('/send-request', async (req: Request, res: Response, next: NextFunction) => {
		const userRequest = req.body;

		channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(userRequest)));

		console.log('User request sent to RabbitMQ:', userRequest);
		res.status(200).json({ message: 'Request sent to RabbitMQ' });
	});

	app.listen(3001, () => {
		console.log('User Service listening on port 3001');
	});
}

bootstrap().catch(console.error);