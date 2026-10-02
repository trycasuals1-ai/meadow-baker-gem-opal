import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/postback/lootably")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleLootablyPostback } = await import("@/lib/unlock/postback.server");
        return handleLootablyPostback(request);
      },
    },
  },
});
