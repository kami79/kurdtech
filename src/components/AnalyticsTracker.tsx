"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnalyticsEvent, getDateKey } from "@/lib/analyticsUtils";

const VISITOR_KEY = "kurdtech_visitor_id";
const LOCAL_EVENTS_KEY = "kurdtech_analytics_events";

function getOrCreateVisitorId(): string {
  try {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = `v-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  } catch {
    return `v-${Date.now()}`;
  }
}

function detectDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return "mobile";
  if (window.innerWidth < 640) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

function saveLocalAnalyticsEvent(ev: AnalyticsEvent) {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    const list: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - 40 * 24 * 60 * 60 * 1000;
    const filtered = Array.isArray(list) ? list.filter((x) => x && x.timestamp >= cutoff) : [];
    filtered.push(ev);
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(filtered.slice(-2000)));
  } catch {}
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<{ path: string; time: number }>({ path: "", time: 0 });

  useEffect(() => {
    if (!pathname) return;

    const now = Date.now();
    // Prevent duplicate double-fires in React StrictMode within 1.5 seconds for the same path
    if (
      lastTrackedRef.current.path === pathname &&
      now - lastTrackedRef.current.time < 1500
    ) {
      return;
    }
    lastTrackedRef.current = { path: pathname, time: now };

    const visitorId = getOrCreateVisitorId();
    const device = detectDeviceType();
    const referrer = typeof document !== "undefined" ? document.referrer || "" : "";
    const articleId = pathname.startsWith("/articles/")
      ? decodeURIComponent(pathname.replace("/articles/", "").split("?")[0])
      : undefined;

    const dateObj = new Date(now);
    const localEv: AnalyticsEvent = {
      id: `loc-${now}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: now,
      dateKey: getDateKey(dateObj),
      hourKey: dateObj.getHours(),
      visitorId,
      path: pathname,
      articleId,
      device,
      referrer: referrer || "ڕاستەوخۆ (Direct)",
    };

    saveLocalAnalyticsEvent(localEv);

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        articleId,
        visitorId,
        device,
        referrer,
      }),
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}

