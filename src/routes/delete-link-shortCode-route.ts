import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getLinks } from "../functions/get-links.ts";
import { deleteLink } from "../functions/delete-link.ts";

export const deleteLinkByShortCodeRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.delete(
    "/links",
    {
      schema: {
        summary: "Delete link by short code",
        tags: ["links"],
        body: z.object({
          shortCode: z.string(),
        }),
        response: {
          204: z.object({}).describe("A link deleted by short code"),
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
      const { shortCode } = request.body;
      const { links } = await getLinks({
        searchQuery: shortCode,
      });

      if (links.length === 0) {
        return reply.status(404).send({ message: "Link not found" });
      }

      await deleteLink({ shortCode });

      return reply.status(204).send({});
    },
  );
};
