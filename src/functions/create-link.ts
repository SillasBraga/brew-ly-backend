import z from "zod";
import { db } from "../db/index.ts";
import { links } from "../db/schemas/links.ts";

const shortCodeRegex = /^[a-zA-Z0-9_-]{3,50}$/;

const postLinkInput = z.object({
  originalUrl: z.string().url(),
  shortCode: z.string().regex(shortCodeRegex, "Short URL mal formatada."),
});

type PostLinkInput = z.input<typeof postLinkInput>;

type PostLinkOutput = {
  id: string;
  originalUrl: string;
  shortCode: string;
  accessCount: number;
  createdAt: Date;
};

export async function createLink(
  input: PostLinkInput,
): Promise<PostLinkOutput> {
  const { originalUrl, shortCode } = postLinkInput.parse(input);

  const [link] = await db
    .insert(links)
    .values({
      originalUrl,
      shortCode,
    })
    .returning();

  return { ...link };
}
