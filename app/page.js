import { BarGraph } from "@/components/charts/bar"
import { NavBar } from "@/components/general/nav-bar"

export default function Home() {
  return (
    <div className="font-sans min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow grid place-items-center">
        <div className="w-[500px] h-[300px]">
          <BarGraph />
        </div>
      </div>
    </div>
  );
}
