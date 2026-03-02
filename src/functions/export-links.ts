import { PassThrough, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { stringify } from "csv-stringify";
import { asc } from "drizzle-orm";
import { schema } from "../db/schemas/index.ts";
import { db, pg } from "../db/index.ts";
import { links } from "../db/schemas/links.ts";
import { uploadFileToStorage } from "../storage/upload-file-to-storage.ts";

type ExportLinksOutput = {
  reportUrl: string;
};

export async function exportLinks(): Promise<ExportLinksOutput> {
  const { sql, params } = db
    .select()
    .from(schema.links)
    .orderBy(asc(links.id))
    .toSQL();

  const cursor = pg.unsafe(sql, params as string[]).cursor(2);

  const csv = stringify({
    delimiter: ",",
    header: true,
    columns: [
      { key: "id", header: "ID" },
      { key: "original_url", header: "Original URL" },
      { key: "short_code", header: "Short Code" },
      { key: "access_count", header: "Access Count" },
      { key: "created_at", header: "Created At" },
    ],
  });

  const uploadToStorageStream = new PassThrough();

  const convertToCSVPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks: unknown[], encoding, callback) {
        for (const chunk of chunks) {
          this.push(chunk);
        }

        callback();
      },
    }),
    csv,
    uploadToStorageStream,
  );

  const uploadToStorage = uploadFileToStorage({
    contentType: "text/csv",
    folder: "downloads",
    fileName: `${new Date().toISOString()}-uploads.csv`,
    contentStream: uploadToStorageStream,
  });

  const [{ url }] = await Promise.all([uploadToStorage, convertToCSVPipeline]);

  return { reportUrl: url };
}
