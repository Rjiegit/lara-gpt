import { PineconeClient } from '@pinecone-database/pinecone';
import { config } from '@/utils/config';

if (!config.pinecone_environment || !config.pincecone_api_key) {
  throw new Error('Pinecone environment or api key vars missing');
}

async function initPinecone() {
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: config.pinecone_environment,
      apiKey: config.pincecone_api_key,
    });

    return pinecone;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to initialize Pinecone Client');
  }
}

export const pinecone = await initPinecone();
