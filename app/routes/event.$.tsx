import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { eventStream } from "remix-utils/sse/server";
import { allowAny } from "~/lib/auth.server";
import { emitter } from "~/lib/emitter.server";

export async function loader(req: LoaderFunctionArgs) {
    const user = await allowAny(req)
    const path = `/${req.params["*"]}`;
    
    return eventStream(req.request.signal, (send) => {
      const handler = (message: string) => {
        send({ data: Date.now().toString() });
      };
    
      emitter.addListener(path, handler);
      return () => {
        emitter.removeListener(path, handler);
      };
    });
}