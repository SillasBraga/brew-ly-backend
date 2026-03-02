import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getLinks } from "../functions/get-links.ts";

const shortCodeRegex = /^[a-zA-Z0-9_-]{3,50}$/;

export const getLinksRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/links",
    {
      schema: {
        summary: "Get all links",
        tags: ["links"],
        querystring: z.object({
          searchQuery: z.string().optional(),
          sortBy: z.enum(["createdAt"]).optional(),
          sortDirection: z.enum(["asc", "desc"]).optional(),
          page: z.coerce.number().optional().default(1),
          pageSize: z.coerce.number().optional().default(20),
        }),
        response: {
          201: z
            .object({
              links: z.array(
                z.object({
                  id: z.string().uuid(),
                  originalUrl: z.string().url(),
                  shortCode: z
                    .string()
                    .regex(shortCodeRegex, "Short URL mal formatada."),
                  accessCount: z.number(),
                  createdAt: z.date(),
                }),
              ),
            })
            .describe("A list of links"),
          400: z
            .object({
              errors: z.array(
                z.object({
                  name: z.string(),
                  error: z.string(),
                }),
              ),
            })
            .describe("Validation fails"),
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize, searchQuery, sortBy, sortDirection } =
        request.query;
      const links = await getLinks({
        page,
        pageSize,
        searchQuery,
        sortBy,
        sortDirection,
      });

      return reply.status(201).send({ ...links });
    },
  );
};
