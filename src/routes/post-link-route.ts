import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getLinks } from "../functions/get-links.ts";
import { createLink } from "../functions/create-link.ts";

const shortCodeRegex = /^[a-zA-Z0-9_-]{3,50}$/;

export const postLinkRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/links",
    {
      schema: {
        summary: "Create link",
        tags: ["links"],
        body: z.object({
          originalUrl: z.string().url(),
          shortCode: z
            .string()
            .regex(shortCodeRegex, "Short URL mal formatada."),
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
            .describe("Created link"),
          409: z
            .object({
              message: z.string(),
            })
            .describe("Short URL already exists"),
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
      const { shortCode, originalUrl } = request.body;

      const { links } = await getLinks({
        searchQuery: shortCode,
      });

      if (links.length > 0) {
        return reply.status(409).send({ message: "Short URL already exists" });
      }

      const link = await createLink({ shortCode, originalUrl });

      return reply.status(201).send({ ...link });
    },
  );
};
