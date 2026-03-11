import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import scalarUI from "@scalar/fastify-api-reference";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  hasZodFastifySchemaValidationErrors,
} from "fastify-type-provider-zod";
import { getLinksRoute } from "./routes/get-links-route.ts";
import { getLinkByShortCodeRoute } from "./routes/get-link-shortCode-route.ts";
import { postLinkRoute } from "./routes/post-link-route.ts";
import { patchLinkByShortCodeRoute } from "./routes/patch-link-shortCode-route.ts";
import { deleteLinkByShortCodeRoute } from "./routes/delete-link-shortCode-route.ts";
import { exportLinksRoute } from "./routes/export-links-route.ts";
import { env } from "./env.ts";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.validation,
    });
  }

  console.error(error);

  return reply.status(500).send({ message: "Internal server error." });
});

app.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Brev.ly",
      version: "1.0.0",
    },
  },

  transform: jsonSchemaTransform,
});

app.register(getLinksRoute);
app.register(getLinkByShortCodeRoute);
app.register(postLinkRoute);
app.register(patchLinkByShortCodeRoute);
app.register(deleteLinkByShortCodeRoute);
app.register(exportLinksRoute);

app.get("/openapi.json", () => app.swagger());

app.register(scalarUI, {
  routePrefix: "/docs",
  configuration: {
    layout: "modern",
  },
});

app.listen({ port: env.PORT || 3333, host: "0.0.0.0" })
  .then(() => {
    console.log("HTTP server running!");
  });
