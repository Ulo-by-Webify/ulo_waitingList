import { USER_TYPES, type UserType } from "@/lib/validation";
import { listAllSignups, listAllSubscribers } from "@/lib/server/waitlist-repo";
import { serverError } from "@/lib/server/http";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { toCsv } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvResponse(csv: string, name: string) {
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ulo-${name}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const auth = await requireApi("waitlist");
  if (isResponse(auth)) return auth;
  const params = new URL(request.url).searchParams;
  try {
    if (params.get("dataset") === "newsletter") {
      const subscribers = await listAllSubscribers();
      return csvResponse(
        toCsv(["Email", "Subscribed at"], subscribers.map((s) => [s.email, s.createdAt])),
        "newsletter",
      );
    }

    const type = params.get("type");
    const signups = await listAllSignups({
      search: params.get("q")?.trim() || undefined,
      userType: USER_TYPES.includes(type as UserType) ? (type as UserType) : undefined,
    });
    return csvResponse(
      toCsv(
        ["Name", "Email", "Country", "Type", "Joined at"],
        signups.map((s) => [s.fullName, s.email, s.country, s.userType, s.createdAt]),
      ),
      "waitlist",
    );
  } catch (error) {
    return serverError("admin-export", error);
  }
}
