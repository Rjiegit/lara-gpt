import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { CustomMarkdownLoader } from '@/utils/customMarkdownLoader';
import { testDocs } from '@/utils/config';

async function ingests(options: { namespace: string; filePath: string }) {
  /*load raw docs from the all files in the directory */
  const directoryLoader = new DirectoryLoader(options.filePath, {
    '.md': (path) =>
      CustomMarkdownLoader.createFromMetadata(path, {
        version: options.namespace,
      }),
  });

  const rawDocs = await directoryLoader.load();

  /* Split text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await textSplitter.splitDocuments(rawDocs);
  console.log('split docs', docs);

  console.log('creating vector store...');
  /*create and store the embeddings in the vectorStore*/
  const embeddings = new OpenAIEmbeddings();
  const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

  // remove all documents from the namespace
  await index.delete1Raw({
    namespace: options.namespace,
    deleteAll: true,
  });

  //embed the PDF documents
  await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex: index,
    namespace: options.namespace,
    textKey: 'text',
  });
}

export const run = async () => {
  try {
    await Promise.all(testDocs.map((options) => ingests(options)));
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
