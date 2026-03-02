import z from "zod";
import { db } from "../db/index.ts";
import { links } from "../db/schemas/links.ts";
import { eq, sql } from "drizzle-orm";

const shortCodeRegex = /^[a-zA-Z0-9_-]{3,50}$/;

const incrementAccessLinkInput = z.object({
  shortCode: z.string().regex(shortCodeRegex, "Short URL mal formatada."),
});

type IncrementAccessLinkInput = z.input<typeof incrementAccessLinkInput>;

type IncrementAccessLinkOutput = {
  id: string;
  originalUrl: string;
  shortCode: string;
  accessCount: number;
  createdAt: Date;
};

export async function incrementAccessLink(
  input: IncrementAccessLinkInput,
): Promise<IncrementAccessLinkOutput> {
  const { shortCode } = incrementAccessLinkInput.parse(input);

  const [link] = await db
    .update(links)
    .set({ accessCount: sql`${links.accessCount} + 1` })
    .where(eq(links.shortCode, shortCode))
    .returning();

  return { ...link };
}
