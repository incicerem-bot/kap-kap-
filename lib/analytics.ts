"use client";

import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

function posthogReady() {
  return typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);
}

export function identifyAnalyticsUser(
  userId: string,
  properties: AnalyticsProperties = {},
) {
  Sentry.setUser({ id: userId });

  if (posthogReady()) {
    posthog.identify(userId, properties);
  }
}

export function resetAnalyticsUser() {
  Sentry.setUser(null);

  if (posthogReady()) {
    posthog.reset();
  }
}

export function captureAnalyticsEvent(
  eventName: string,
  properties: AnalyticsProperties = {},
) {
  Sentry.addBreadcrumb({
    category: "product",
    message: eventName,
    level: "info",
    data: properties,
  });

  if (posthogReady()) {
    posthog.capture(eventName, properties);
  }
}

export function captureApplicationError(
  error: unknown,
  context: AnalyticsProperties = {},
) {
  Sentry.captureException(error, {
    extra: context,
  });
}
