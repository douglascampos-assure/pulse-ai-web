import { BarGraph } from "@/src/components/charts/bar"
import { PieDonut } from "@/src/components/charts/pie-donut"
import { NavBar } from "@/src/components/general/nav-bar"
import { MeetingDashboard } from "@/src/components/custom/MeetingDashboard"

export default function DashboardRoute() {
  return (
    <>
      <NavBar />
      <div className="flex-grow grid place-items-center">
        <MeetingDashboard />
      </div>
    </>
  );
}