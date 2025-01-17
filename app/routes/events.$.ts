import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { eventStream } from "remix-utils/sse/server";
import { allowAny } from "~/lib/auth.server";
import { emitter } from "~/lib/emitter.server";

export async function loader(req: LoaderFunctionArgs) {
  const user = await allowAny(req)
  const path = `/${req.params["*"]}`;

  return eventStream(req.request.signal, (send) => {
    const handler = (message: string) => {
      // In SSE, you typically send `event`, `data`, or both.
      // `remix-utils` will JSON-stringify automatically if you provide an object.
      // But here, we’re just sending the current timestamp as `data`.
      send({ data: Date.now().toString() });
    };

    // This "connection" event is presumably an internal event.
    // If you're just logging connections, you can do so here:
    // emitter.on("connection", () => {
    //   console.log("connect");
    // });

    // Listen to your dynamic channel (path).
    emitter.addListener(path, handler);
    // Optional keep-alive to avoid timeouts
    const heartbeatInterval = setInterval(() => {
      send({ event: "ping", data: "" });
    }, 8_000);

    // Return an unsubscribe function that cleans up the listener.
    return () => {
      clearInterval(heartbeatInterval);
      emitter.removeListener(path, handler);
    };
  });
}