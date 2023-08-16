import { Document } from 'langchain/document';
import { TextLoader } from 'langchain/document_loaders';

export class CustomMarkdownLoader extends TextLoader {
  private _version: string | undefined;

  public async load(): Promise<Document[]> {
    let text: string;
    let metadata: Record<string, string>;
    if (typeof this.filePathOrBlob === 'string') {
      const { readFile } = await TextLoader.imports();
      text = await readFile(this.filePathOrBlob, 'utf8');
      metadata = { source: this.filePathOrBlob };
    } else {
      text = await this.filePathOrBlob.text();
      metadata = { source: 'blob', blobType: this.filePathOrBlob.type };
    }
    const parsed = await this.parse(text);
    parsed.forEach((pageContent, i) => {
      if (typeof pageContent !== 'string') {
        throw new Error(
          `Expected string, at position ${i} got ${typeof pageContent}`,
        );
      }
    });
    return parsed.map(
      (pageContent, i) =>
        new Document({
          pageContent,
          metadata: {
            ...metadata,
            line: i + 1,
            version: this._version,
          },
        }),
    );
  }

  public set version(version: string) {
    this._version = version;
  }

  static createFromMetadata(
    filePathOrBlob: string | Blob,
    metadata: {
      version: string;
    },
  ) {
    const loader = new CustomMarkdownLoader(filePathOrBlob);
    loader.version = metadata.version;

    return loader;
  }
}
