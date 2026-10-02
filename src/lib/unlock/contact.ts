import { createServerFn } from "@tanstack/react-start";

export const loadContact = createServerFn({ method: "GET" }).handler(async () => {
  const { contactEmail } = await import("./public-env.server.ts");
  return { contactEmail: contactEmail() };
});
