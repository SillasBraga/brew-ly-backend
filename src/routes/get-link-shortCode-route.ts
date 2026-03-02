import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getLinks } from "../functions/get-links.ts";

const shortCodeRegex = /^[a-zA-Z0-9_-]{3,50}$/;

export const getLinkByShortCodeRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/links/:shortCode",
    {
      schema: {
        summary: "Get link by short code",
        tags: ["links"],
        params: z.object({
          shortCode: z.string(),
        }),
        response: {
          201: z
            .object({
              id: z.string().uuid(),
              originalUrl: z.string().url(),
              shortCode: z
                .string()
                .regex(shortCodeRegex, "Short URL mal formatada."),
              accessCount: z.number(),
              createdAt: z.date(),
            })
            .describe("A link by short code"),
          404: z
            .object({
              message: z.string(),
            })
            .describe("Link not found"),
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
      const { shortCode } = request.params;
      const { links } = await getLinks({
        searchQuery: shortCode,
      });

      if (links.length === 0) {
        return reply.status(404).send({ message: "Link not found" });
      }

      return reply.status(201).send({ ...links[0] });
    },
  );
};
