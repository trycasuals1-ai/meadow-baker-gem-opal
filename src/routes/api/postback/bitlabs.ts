import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/postback/bitlabs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleBitlabsPostback } = await import("@/lib/unlock/postback.server");
        return handleBitlabsPostback(request);
      },
    },
  },
});
