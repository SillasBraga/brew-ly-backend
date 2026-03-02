import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { exportLinks } from "../functions/export-links.ts";

export const exportLinksRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/links/export",
    {
      schema: {
        summary: "Export all links in a CSV file",
        tags: ["links"],
        body: z.object({}),
        response: {
          201: z
            .object({
              reportUrl: z.string(),
            })
            .describe("CSV file URL link"),
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
      const exportsLinks = await exportLinks();

      return reply.status(201).send({ ...exportsLinks });
    },
  );
};
