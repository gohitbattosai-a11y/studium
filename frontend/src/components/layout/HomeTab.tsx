import type { Me } from "@/lib/api/types";
import { useMembers } from "@/lib/api/queries";
import { featureOpen } from "@/lib/runtime/release";
import { useStatus } from "@/lib/api/queries";
import MobileMembers from "@/components/layout/MobileMembers";
import { usePetSettings } from "@/components/pets/petSettings";
import Overview from "@/components/Overview";
import WeekPlanner from "@/components/schedule/WeekPlanner";
import type { TabId } from "./tabs";

export default function HomeTab({ me, go }: { me: Me; go: (tab: TabId) => void }) {
  const members = useMembers();
  const status = useStatus();
  const petSettings = usePetSettings();
  const showPet = featureOpen(status.data, "pets", me.role) && petSettings.visible;
  return (
    <>
      <MobileMembers me={me} members={members.data ?? []} showPet={showPet} />
      <Overview me={me} onNavigate={go} />
      <WeekPlanner me={me} />
    </>
  );
}
