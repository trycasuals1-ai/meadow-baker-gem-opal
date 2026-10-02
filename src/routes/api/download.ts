import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { downloadCourse } = await import("@/lib/unlock/http.server");
        return downloadCourse(request);
      },
    },
  },
});
