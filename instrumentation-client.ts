import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

if (sentryDsn) {
  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
      replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.02 : 0,
      replaysOnErrorSampleRate: 1,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          maskAllInputs: true,
          blockAllMedia: true,
        }),
      ],
      sendDefaultPii: false,
      enableLogs: true,
    });
  } catch (error) {
    console.error("[KapışKapış] Sentry başlatılamadı.", error);
  }
}

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();

if (posthogToken) {
  try {
    posthog.init(posthogToken, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com",
      defaults: "2026-05-30",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      person_profiles: "identified_only",
    });
  } catch (error) {
    console.error("[KapışKapış] PostHog başlatılamadı.", error);
  }
}

export const onRouterTransitionStart = (...args: Parameters<typeof Sentry.captureRouterTransitionStart>) => {
  try {
    return Sentry.captureRouterTransitionStart(...args);
  } catch {
    return undefined;
  }
};
