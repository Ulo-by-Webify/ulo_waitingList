"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { TURNSTILE_SITE_KEY, type TurnstileAction } from "@/lib/turnstile";

type TurnstileRenderOptions = {
  sitekey: string;
  action: string;
  appearance: "always" | "execute" | "interaction-only";
  size: "normal" | "flexible" | "compact";
  theme: "light" | "dark" | "auto";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => boolean;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
/** Long enough for someone to finish an interactive challenge. */
const TOKEN_WAIT_MS = 30_000;

/** A problem with the security check itself; its message is safe to show as-is. */
export class TurnstileError extends Error {}

const NOT_READY = "The security check didn't finish. Please try again.";
const BLOCKED =
  "The security check couldn't load. Turn off content blockers for this site or refresh the page, then try again.";

let scriptPromise: Promise<TurnstileApi> | null = null;

/** Loads Cloudflare's script once per page, however many forms use it. */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing")));
      script.onerror = () => {
        // Let a later form try again instead of caching the failure.
        scriptPromise = null;
        script.remove();
        reject(new Error("Turnstile script failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

type UseTurnstileResult = {
  /** Place inside the form. Invisible unless Cloudflare needs the visitor to click. */
  widget: ReactNode;
  /** Resolves with a fresh token ("" when Turnstile is off). Throws TurnstileError. */
  getToken: () => Promise<string>;
  /** Tokens are single-use: call after every submission attempt. */
  reset: () => void;
};

/** Cloudflare Turnstile bot check for one form. */
export function useTurnstile(action: TurnstileAction, className = ""): UseTurnstileResult {
  const isEnabled = TURNSTILE_SITE_KEY !== "";
  // State, not a ref: the form may mount later (e.g. after a "Continue" step), and the widget must render then.
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const waitersRef = useRef<Array<(token: string) => void>>([]);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useEffect(() => {
    if (!isEnabled || !container) return;
    let isCancelled = false;

    loadTurnstile()
      .then((api) => {
        if (isCancelled) return;
        widgetIdRef.current = api.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          appearance: "interaction-only",
          size: "flexible",
          theme: "light",
          callback: (token) => {
            tokenRef.current = token;
            const waiters = waitersRef.current;
            waitersRef.current = [];
            waiters.forEach((resolve) => resolve(token));
          },
          "expired-callback": () => {
            tokenRef.current = null;
          },
          // Turnstile retries on its own; returning true marks the error as handled.
          "error-callback": () => {
            tokenRef.current = null;
            return true;
          },
        });
      })
      .catch((error) => {
        console.error("[turnstile]", error);
        if (!isCancelled) setHasLoadFailed(true);
      });

    return () => {
      isCancelled = true;
      const widgetId = widgetIdRef.current;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      widgetIdRef.current = null;
      tokenRef.current = null;
    };
  }, [action, container, isEnabled]);

  const getToken = useCallback((): Promise<string> => {
    if (!isEnabled) return Promise.resolve("");
    if (hasLoadFailed) return Promise.reject(new TurnstileError(BLOCKED));
    if (tokenRef.current) return Promise.resolve(tokenRef.current);

    // Still checking (or waiting on a click): wait for the token instead of failing the submit.
    return new Promise<string>((resolve, reject) => {
      const waiter = (token: string) => {
        window.clearTimeout(timer);
        resolve(token);
      };
      const timer = window.setTimeout(() => {
        waitersRef.current = waitersRef.current.filter((candidate) => candidate !== waiter);
        reject(new TurnstileError(NOT_READY));
      }, TOKEN_WAIT_MS);
      waitersRef.current = [...waitersRef.current, waiter];
    });
  }, [hasLoadFailed, isEnabled]);

  const reset = useCallback(() => {
    tokenRef.current = null;
    const widgetId = widgetIdRef.current;
    if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
  }, []);

  const widget = isEnabled ? <div ref={setContainer} className={`empty:hidden ${className}`} /> : null;

  return { widget, getToken, reset };
}

/** Message to show for a failed submit: the check's own message, or the caller's fallback. */
export function submitErrorMessage(error: unknown, fallback: string): string {
  return error instanceof TurnstileError ? error.message : fallback;
}
