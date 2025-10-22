import { BarGraph } from "@/src/components/charts/bar"
import { PieDonut } from "@/src/components/charts/pie-donut"
import { NavBar } from "@/src/components/general/nav-bar"
import { ComboBox } from "@/src/components/general/combobox"
import { CalendarField } from "@/src/components/general/calendar-field"
import { TableBasic } from "@/src/components/general/table-basic"

export default function DashboardRoute() {
  return (
    <>
      <NavBar />
      <div className="flex gap-4">
        <ComboBox itemsLabel="Teams" />
        <ComboBox itemsLabel="Team Member" />
        <CalendarField label="Start Date" />
        <CalendarField label="End Date"  />
        <ComboBox itemsLabel="Team Member" />
      </div>
      <div className="flex-grow grid place-items-center">
        <PieDonut />
        <BarGraph />
        <TableBasic />
      </div>
    </>
  );
}