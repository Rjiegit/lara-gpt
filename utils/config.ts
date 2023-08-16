export const config = {
  pinecone_environment: process.env.PINECONE_ENVIRONMENT ?? '',
  pincecone_api_key: process.env.PINECONE_API_KEY ?? '',
  pinecone_index_name: process.env.PINECONE_INDEX_NAME ?? '',
  openai_api_key: process.env.OPENAI_API_KEY ?? '',
};

export const testDocs = [
  {
    namespace: 'v8',
    filePath: 'docs/test/v8',
  },
  {
    namespace: 'v9',
    filePath: 'docs/test/v9',
  },
  {
    namespace: 'v10',
    filePath: 'docs/test/v10',
  },
];

export const docs = [
  {
    namespace: 'v9',
    filePath: 'docs/v9',
  },
  {
    namespace: 'v10',
    filePath: 'docs/v10',
  },
];
