import { formatDistanceToNow, parseISO } from "date-fns";
import { ClockIcon } from "@heroicons/react/24/outline";
import EmptyState from "@/components/admin/EmptyState";
import { requireAdmin } from "@/lib/server/admin-guard";
import { remainingRecoveryCodes } from "@/lib/server/mfa-repo";
import { listSecurityEvents } from "@/lib/server/security-events";
import { listActiveSessions } from "@/lib/server/sessions-repo";
import { parseUserAgent } from "@/lib/server/user-agent";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import { formatAccountDate } from "@/components/admin/AccountSection";
import TwoFactorPanel from "@/components/admin/security/TwoFactorPanel";
import SessionsList, { type SessionView } from "@/components/admin/security/SessionsList";

const ago = (iso: string) => formatDistanceToNow(parseISO(iso), { addSuffix: true });

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 id={id} className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function SecurityPage() {
  const { admin, session } = await requireAdmin();
  const [sessions, events, codesLeft] = await Promise.all([
    listActiveSessions(admin.id),
    listSecurityEvents(admin.id, 15),
    admin.mfaEnabled ? remainingRecoveryCodes(admin.id) : Promise.resolve(0),
  ]);

  const sessionViews: SessionView[] = sessions.map((s) => {
    const ua = parseUserAgent(s.userAgent ?? "");
    return {
      id: s.id,
      device: `${ua.browser} on ${ua.os}`,
      isMobile: ua.device !== "desktop",
      ip: s.ip,
      lastSeen: ago(s.lastSeenAt),
      signedIn: ago(s.createdAt),
      isCurrent: s.id === session.id,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Security</h1>
        <p className="text-sm text-gray-500">Password, two-factor authentication, sessions and recent activity.</p>
      </div>

      <Section id="mfa-heading" title="Two-factor authentication" description="Require a code from an authenticator app every time you sign in.">
        <TwoFactorPanel enabled={admin.mfaEnabled} remainingCodes={codesLeft} />
      </Section>

      <Section
        id="password-heading"
        title="Password"
        description={`Changing it signs you out everywhere else. Last changed: ${formatAccountDate(admin.passwordChangedAt, "never")}.`}
      >
        <ChangePasswordForm />
      </Section>

      <Section id="sessions-heading" title="Where you're signed in" description="Sign out any session you don't recognise.">
        <SessionsList sessions={sessionViews} />
      </Section>

      <Section id="activity-heading" title="Recent activity" description="Sign-ins and security changes on your account.">
        {events.length === 0 ? (
          <EmptyState
            variant="compact"
            icon={ClockIcon}
            title="No activity yet"
            description="Sign-ins and security changes on your account will be listed here."
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {events.map((e) => {
              const isWarning = ["login_failed", "mfa_failed", "account_locked"].includes(e.event);
              return (
                <li key={e.id} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                  <span className={isWarning ? "text-red-700" : "text-gray-900"}>
                    {e.label}
                    {e.detail && <span className="text-gray-500"> · {e.detail}</span>}
                  </span>
                  <span className="shrink-0 text-xs text-gray-500" title={e.createdAt}>
                    {e.ip ? `${e.ip} · ` : ""}
                    {ago(e.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}
