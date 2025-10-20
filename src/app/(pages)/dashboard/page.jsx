import { BarGraph } from "@/src/components/charts/bar"
import { NavBar } from "@/src/components/general/nav-bar"

export default function DashboardRoute() {
  return (
    <>
        <div>Put your chart here</div>
        <div>Put your chart here</div>
        <div>Put your chart here</div>
        <div className="font-sans min-h-screen flex flex-col">
            <NavBar />
            <div className="flex-grow grid place-items-center">
                <div className="w-[500px] h-[300px]">
                <BarGraph />
                </div>
            </div>
        </div>
    </>
  );
}