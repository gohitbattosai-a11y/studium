import { FlaskConical, Wrench } from "lucide-react";
import { testingFeatures } from "@/lib/runtime/release";
import type { Role, SiteStatus } from "@/lib/api/types";

export default function StatusBanner({ status, role }: { status: SiteStatus | undefined; role: Role }) {
  if (!status) return null;
  const testing = role === "admin" ? testingFeatures(status) : [];
  if (!status.updating && testing.length === 0) return null;
  return (
    <div className="space-y-2" data-testid="status-banner">
      {status.updating && (
        <div className="flex items-center gap-2 rounded-lg border border-[#D29922]/40 bg-[#342207] px-3 py-2 text-sm text-[#E3B341]">
          <Wrench className="size-4 shrink-0" /> Aggiornamento in corso: il sito è chiuso per i non admin.
        </div>
      )}
      {testing.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-[#388BFD]/40 bg-[#0C2D6B]/40 px-3 py-2 text-sm text-[#79B8FF]">
          <FlaskConical className="size-4 shrink-0" /> In test, visibili solo agli admin: {testing.join(", ")}.
        </div>
      )}
    </div>
  );
}
