import {connect, ConsumeMessage, Connection, Channel} from 'amqplib'

async function main(): Promise<void> {
	const connection: Connection = await connect('amqp://localhost');
	const channel: Channel = await connection.createChannel();

	const QUEUE_NAME = 'user_requests';
	await channel.assertQueue(QUEUE_NAME, { durable: false });

	console.log('Task Service waiting for user requests...');

	await channel.consume(QUEUE_NAME, async (message: ConsumeMessage | null): Promise<void> => {
		if (!message) return

		const userRequest = JSON.parse(message.content.toString());

		const processedResult = { result: 'Task processed successfully', input: userRequest };

		const replyQueue = message.properties.replyTo;
		const replyMessage = JSON.stringify(processedResult);

		channel.sendToQueue(replyQueue, Buffer.from(replyMessage), {
			correlationId: message.properties.correlationId,
		});

		console.log('Task processed and response sent:', processedResult);
	}, { noAck: true });
}

main().catch(console.error);