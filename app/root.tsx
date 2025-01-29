import type { LinksFunction } from "@remix-run/cloudflare";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";

import styles from "./tailwind.css?url"
import { Toaster } from "sonner";
import { GlobalLoading } from "./components/GlobalLoading";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <Meta />
        <Links />
      </head>
      <body>
        <GlobalLoading />
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary() {
  const error = useRouteError();

  // Log the error to the console
  console.error(error);

  if (isRouteErrorResponse(error)) {
    const title = `${error.status} ${error.statusText}`;

    let message;
    switch (error.status) {
      case 401:
        message =
          'Oops! Looks like you tried to visit a page that you do not have access to.';
        break;
      case 404:
        message =
          'Oops! Looks like you tried to visit a page that does not exist.';
        break;
      default:
        message = JSON.stringify(error.data, null, 2);
        break;
    }

    return <ErrorLayout title={title} description={message} />
  }

  return <ErrorLayout title="There was an error" description={`${error}`} />
}

function ErrorLayout({ title, description }: { title: string; description: string }) {
  return <div className="flex h-screen w-full justify-center items-center">
    <div className="prose">
      <h1>{title}</h1>
      <div>{description}</div>
    </div>
  </div>
}