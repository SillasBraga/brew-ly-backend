import z from "zod";
import { db } from "../db/index.ts";
import { links } from "../db/schemas/links.ts";
import { eq } from "drizzle-orm";

const shortCodeRegex = /^[a-zA-Z0-9_-]{3,50}$/;

const deleteLinkInput = z.object({
  shortCode: z.string().regex(shortCodeRegex, "Short URL mal formatada."),
});

type DeleteLinkInput = z.input<typeof deleteLinkInput>;

export async function deleteLink(input: DeleteLinkInput): Promise<any> {
  const { shortCode } = deleteLinkInput.parse(input);

  return await db.delete(links).where(eq(links.shortCode, shortCode));
}
