import { asc, desc, ilike } from 'drizzle-orm'
import z from 'zod'
import { db } from '../db/index.ts'
import { schema } from '../db/schemas/index.ts'

const getLinksInput = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(['createdAt']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(20),
})

type GetLinksInput = z.input<typeof getLinksInput>

type GetLinksOutput = {
  links: {
    id: string
    originalUrl: string
    shortCode: string
    accessCount: number
    createdAt: Date
  }[]
}

export async function getLinks(
  input: GetLinksInput
): Promise<GetLinksOutput> {
  const { page, pageSize, searchQuery, sortBy, sortDirection } =
    getLinksInput.parse(input)

  const [links] = await Promise.all([
    db
      .select({
        id: schema.links.id,
        originalUrl: schema.links.originalUrl,
        shortCode: schema.links.shortCode,
        accessCount: schema.links.accessCount,
        createdAt: schema.links.createdAt,
      })
      .from(schema.links)
      .where(
        searchQuery ? ilike(schema.links.shortCode, `%${searchQuery}%`) : undefined
      )
      .orderBy(fields => {
        if (sortBy && sortDirection === 'asc') {
          return asc(fields[sortBy])
        }

        if (sortBy && sortDirection === 'desc') {
          return desc(fields[sortBy])
        }

        return desc(fields.id)
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize)
    ]);

  return {links};
}
