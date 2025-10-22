import { BarGraph } from "@/src/components/charts/bar"
import { PieDonut } from "@/src/components/charts/pie-donut"
import { NavBar } from "@/src/components/general/nav-bar"

export default function Home() {
  return (
    <>
      <NavBar />
      <div className="flex-grow grid place-items-center">
        <div className="w-[400px] h-[300px]">
          <BarGraph />
        </div>
        <div className="w-[400px] h-[300px]">
          <PieDonut />
        </div>
      </div>
    </>
  );
}
