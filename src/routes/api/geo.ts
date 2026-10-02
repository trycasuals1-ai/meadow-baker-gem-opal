import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/geo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { geoPayload } = await import("@/lib/unlock/http.server");
        return geoPayload(request);
      },
    },
  },
});
