import * as Sentry from "@sentry/remix";

Sentry.init({
    dsn: "https://d457c703ad6c9a2851da55f31dc0fc57@o4508727521050624.ingest.us.sentry.io/4508727524851712",
    tracesSampleRate: 1,
    autoInstrumentRemix: true
})