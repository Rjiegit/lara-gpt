/**
 * Change the namespace to the namespace on Pinecone you'd like to store your embeddings.
 */

import { config } from '@/utils/config';

if (!config.pinecone_index_name) {
  throw new Error('Missing Pinecone index name in config file');
}

const PINECONE_INDEX_NAME = config.pinecone_index_name;

const PINECONE_NAME_SPACE = 'v10';

export { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE };
