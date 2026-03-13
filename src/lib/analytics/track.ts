import { isDemoMode } from "@/lib/demo/data";

type EventType = "page_view" | "action" | "funnel";

interface TrackEvent {
  eventType: EventType;
  eventName: string;
  pagePath?: string;
  properties?: Record<string, unknown>;
}

/**
 * Fire-and-forget analytics tracking.
 * In demo mode, logs to console. In production, sends to Supabase.
 */
export function track(event: TrackEvent): void {
  if (isDemoMode()) {
    return;
  }

  // Non-blocking: fire and forget
  sendEvent(event).catch(() => {
    // Silently fail — analytics should never break the app
  });
}

async function sendEvent(event: TrackEvent): Promise<void> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  const sessionId = getSessionId();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("cc_analytics_events").insert({
    user_id: user?.id,
    cc_session_id: sessionId,
    cc_event_type: event.eventType,
    cc_event_name: event.eventName,
    cc_page_path: event.pagePath || window.location.pathname,
    cc_referrer: document.referrer || null,
    cc_properties: event.properties || {},
    cc_device_type: getDeviceType(),
    cc_country: null,
    cc_duration_ms: null,
  });
}

function getSessionId(): string {
  const key = "cc_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}
