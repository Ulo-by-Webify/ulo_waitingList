import "server-only";

export type Device = "desktop" | "mobile" | "tablet";
export type UserAgentInfo = { device: Device; browser: string; os: string };

const BOT_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch|go-http-client/i;

export function isBot(userAgent: string): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

function detectDevice(ua: string): Device {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android/i.test(ua)) return "mobile";
  return "desktop";
}

// Order matters: Edge/Opera/Samsung UAs also contain "Chrome", and Chrome contains "Safari".
const BROWSERS: [RegExp, string][] = [
  [/edg\//i, "Edge"],
  [/opr\/|opera/i, "Opera"],
  [/samsungbrowser/i, "Samsung Internet"],
  [/firefox|fxios/i, "Firefox"],
  [/chrome|crios/i, "Chrome"],
  [/safari/i, "Safari"],
];

const OPERATING_SYSTEMS: [RegExp, string][] = [
  [/windows/i, "Windows"],
  [/iphone|ipad|ipod/i, "iOS"],
  [/android/i, "Android"],
  [/mac os x|macintosh/i, "macOS"],
  [/cros/i, "ChromeOS"],
  [/linux/i, "Linux"],
];

function firstMatch(ua: string, table: [RegExp, string][]): string {
  return table.find(([pattern]) => pattern.test(ua))?.[1] ?? "Other";
}

export function parseUserAgent(ua: string): UserAgentInfo {
  return { device: detectDevice(ua), browser: firstMatch(ua, BROWSERS), os: firstMatch(ua, OPERATING_SYSTEMS) };
}
