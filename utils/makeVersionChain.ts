import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { config } from '@/utils/config';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { PineconeClient } from '@pinecone-database/pinecone';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.
If multiple versions are provided, please organize them separately and compare the differences.
Response should be in 正體中文
Finally, three possible extension questions were asked for the question.

{context}

Question: {question}

格式
---
(回答)

你可能會有興趣：
* (延伸問題1)
* (延伸問題2)
* (延伸問題3)
---
`;

const documentNumber = 2;

export const getDocuments = async (options: {
  query: string;
  namespaces: string[];
}) => {
  const client = new PineconeClient();
  await client.init({
    apiKey: config.pincecone_api_key,
    environment: config.pinecone_environment,
  });
  const pineconeIndex = client.Index(config.pinecone_index_name);

  const promiseResult = options.namespaces.map(async (namespace) => {
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      {
        pineconeIndex,
        namespace,
      },
    );

    return vectorStore.similaritySearch(options.query, documentNumber);
  });

  const result = await Promise.all(promiseResult);

  return result.flat().map((item) => {
    item.pageContent = `Version: ${item.metadata.version}\n Data: ${item.pageContent}`;
    return item;
  });
};

export const makeChain = async (options: {
  namespaces: string[];
  question: string;
}) => {
  const docs = await getDocuments({
    namespaces: options.namespaces,
    query: options.question,
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings(),
  );

  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    // modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
    modelName: 'gpt-4',
  });

  return ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(docs.length * documentNumber),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
      verbose: true,
    },
  );
};
