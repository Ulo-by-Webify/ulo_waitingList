import { formatDistanceToNow, parseISO } from "date-fns";
import { requireAdmin } from "@/lib/server/admin-guard";
import { isEmailConfigured } from "@/lib/server/mailer";
import { listTeam } from "@/lib/server/team-repo";
import InviteForm from "@/components/admin/team/InviteForm";
import TeamTable, { type MemberView } from "@/components/admin/team/TeamTable";

export default async function TeamPage() {
  const { admin } = await requireAdmin("team");
  const team = await listTeam();
  const withoutMfa = team.filter((m) => !m.mfaEnabled && !m.pendingInvite).length;

  const members: MemberView[] = team.map((m) => ({
    id: m.id,
    email: m.email,
    fullName: m.fullName,
    role: m.role,
    mfaEnabled: m.mfaEnabled,
    isLocked: Boolean(m.lockedUntil),
    pendingInvite: m.pendingInvite,
    activeSessions: m.activeSessions,
    lastLogin: m.lastLoginAt ? formatDistanceToNow(parseISO(m.lastLoginAt), { addSuffix: true }) : "Never",
    isSelf: m.id === admin.id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Team</h1>
        <p className="text-sm text-gray-500">Invite people, set what they can access, and keep accounts secure.</p>
      </div>

      {withoutMfa > 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {withoutMfa} team member{withoutMfa === 1 ? " hasn't" : "s haven't"} turned on two-factor authentication.
          Ask them to set it up under Account → Security.
        </p>
      )}

      <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Invite a team member</h2>
          <p className="text-sm text-gray-500">
            {isEmailConfigured()
              ? "They'll get an email with a link to set their password (valid 7 days)."
              : "Email isn't set up, so you'll get an invite link to share with them."}
          </p>
        </div>
        <InviteForm />
      </section>

      <TeamTable members={members} />
    </div>
  );
}
