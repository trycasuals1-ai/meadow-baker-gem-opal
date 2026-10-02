import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/unlock-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { unlockStatus } = await import("@/lib/unlock/http.server");
        return unlockStatus(request);
      },
    },
  },
});
