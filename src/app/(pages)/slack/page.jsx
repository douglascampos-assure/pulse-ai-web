"use client";

import * as React from "react"

import Sidebar from "@/src/components/dashboard/Sidebar";
import {
  Card,
  CardContent,
} from "@/src/components/ui/card"
import { PieDonut } from "@/src/components/charts/pie-donut"
import { ComboBox } from "@/src/components/general/combobox"
import { LoaderWrapper } from "@/src/components/general/loader-wrapper"
import { CalendarField } from "@/src/components/general/calendar-field"
import { TableBasic } from "@/src/components/general/table-basic"
import { CardBasic } from "@/src/components/general/card-basic"
import { CardBoard } from "@/src/components/slack/card-board"
import { useSlack } from "@/src/hooks/use-slack"
import { toSnakeCase } from "@/src/utils/texts"

function prepareKudosByFeatureChartData(data) {
  const counts = data.reduce((acc, item) => {
    const feature = item.highlighted_feature || "Other";
    acc[feature] = (acc[feature] || 0) + 1;
    return acc;
  }, {});

  const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
    "var(--chart-9)",
  ];

  const chartData = sortedEntries.map(([feature, amount], idx) => ({
    text: toSnakeCase(feature),
    label: feature,
    amount,
    fill: colors[idx % colors.length],
  }));

  const chartConfig = Object.fromEntries(
    sortedEntries.map(([feature], idx) => [
      toSnakeCase(feature),
      { label: feature, color: colors[idx % colors.length] },
    ])
  );

  return { chartData, chartConfig };
}

function formatLabel(key) {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")// from displayName -> display Name
    .replace(/_/g, " ");// from first_name -> first name

  return spaced.replace(/\b\w/g, (l) => l.toUpperCase());
};

function prepareCongratulationsTableData(data) {
  if (!Array.isArray(data) || data.length === 0) return { columns: [], rows: [] };

  const sample = data[0];
  const columns = Object.keys(sample).map((key) => ({
    label: formatLabel(key),
    field: key,
    className: "",
    classNameRows: "",
    totalRow: false,
    type: typeof sample[key],
  }));

  const rows = data.map((item) => ({
    ...item,
    congratulations_date: new Date(item.congratulations_date).toLocaleDateString(),
  }));

  return { columns, rows };
}

function groupAndSortKudos(data = []) {
  if (!Array.isArray(data)) return []

  const grouped = data.reduce((acc, kudo) => {
    const name = kudo.displayName

    if (!acc[name]) {
      acc[name] = {
        displayName: name,
        jobTitle: kudo.jobTitle,
        photoUrl: kudo.photoUrl,
        kudosCount: 0,
        kudosList: [],
      }
    }

    acc[name].kudosCount += 1
    acc[name].kudosList.push(kudo)

    return acc;
  }, {});

  return Object.values(grouped).sort(
    (a, b) => b.kudosCount - a.kudosCount
  )
}


export default function DashboardRoute() {
  const { status, statusFilters, kudos, members, types, details, pins, supervisors, setMember, setDetail, setPin, setType, setEndDate, setStartDate, setSupervisor } = useSlack()
  const [tableData, setTableData] = React.useState({
    columns: [],
    rows: []
  })
  const [chartData, setChartData] = React.useState({
    chartData: [],
    chartConfig: {}
  })
  const [userMentions, setUserMentions] = React.useState([])
  React.useEffect(() => {
    setTableData(prepareCongratulationsTableData(kudos))
    setChartData(prepareKudosByFeatureChartData(kudos))
    setUserMentions(groupAndSortKudos(kudos))
  }, [kudos])

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar showThemeToggle={true} />
      <main className="flex-1 p-6 overflow-y-auto bg-primary-foreground">
        <div className="flex flex-col p-4 justify-center items-center gap-4">
          <div className="flex flex-col gap-4 w-[80vw]">
            <Card className="w-full">
              <CardContent className="flex gap-4 flex-col justify-center items-center">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Slack Kudos To You Report</h3>
                <div className="flex flex-row gap-4">
                  <LoaderWrapper status={statusFilters}>
                        <ComboBox label="Supervisor" items={supervisors} setSelected={setSupervisor} />
                        <ComboBox label="Team Member" items={members} setSelected={setMember} />
                        <CalendarField label="Start Date" setDate={setStartDate} />
                        <CalendarField label="End Date" setDate={setEndDate} />
                        <ComboBox label="Pin Type" items={pins} setSelected={setPin}  />
                        <ComboBox label="Kudos Type" items={types} setSelected={setType} />
                        <ComboBox label="Kudos Details" items={details} setSelected={setDetail} />
                  </LoaderWrapper>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-grow flex-row gap-4 w-[80vw] h-[500px]">
            <div className="mx-auto aspect-square w-[60vw] h-[500px]">
              <LoaderWrapper status={status}>
                <PieDonut title="Highlighted Features" description="Kudos" centerText="Amount" chartConfig={chartData.chartConfig} chartData={chartData.chartData} />
              </LoaderWrapper>
            </div>
            <div className="flex flex-col gap-1 w-[20vw] h-[500px]">
              <div className="flex flex-row gap-4 h-[140px]">
                <LoaderWrapper status={status}>
                  <CardBasic footer="Mentions on #kudos_to_you" value={kudos.length} />
                </LoaderWrapper>
              </div>
              <LoaderWrapper status={status}>
                <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 h-full">
                  {userMentions.map(userMention =>
                    <CardBoard
                      key={userMention.displayName}
                      photoUrl={userMention.photoUrl}
                      name={userMention.displayName}
                      position={userMention.jobTitle}
                      mentions={userMention.kudosCount}
                    />
                  )}
                </div>
              </LoaderWrapper>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-[80vw]">
            <Card className="w-full">
              <CardContent className="w-full">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Kudos Details</h3>
                <LoaderWrapper status={status}>
                  <div className="h-full w-full"><TableBasic caption="All kudos made" columns={tableData.columns} rows={tableData.rows} /></div>
                </LoaderWrapper>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}