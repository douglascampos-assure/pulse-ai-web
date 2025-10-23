"use client";

import * as React from "react"

import { PieDonut } from "@/src/components/charts/pie-donut"
import { NavBar } from "@/src/components/general/nav-bar"
import { ComboBox } from "@/src/components/general/combobox"
import { LoaderWrapper } from "@/src/components/general/loader-wrapper"
import { CalendarField } from "@/src/components/general/calendar-field"
import { TableBasic } from "@/src/components/general/table-basic"
import { CardBasic } from "@/src/components/general/card-basic"
import { CardBoard } from "@/src/components/slack/card-board"
import { useSlack } from "@/src/hooks/use-slack"
import { toSnakeCase } from "@/src/utils/texts"

function prepareKudosByFeatureChartData(data) {
  // Count kudos by highlighted_feature
  const counts = data.reduce((acc, item) => {
    const feature = item.highlighted_feature || "Other";
    acc[feature] = (acc[feature] || 0) + 1;
    return acc;
  }, {});

  // Sort by amount (descending)
  const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  // Color palette
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

  // ✅ Correctly map sorted entries
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

function prepareCongratulationsTableData(data) {
  if (!Array.isArray(data) || data.length === 0) return { columns: [], rows: [] };

  const sample = data[0];
  const columns = Object.keys(sample).map((key) => ({
    label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
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

export default function DashboardRoute() {
  const { status, kudos, members, types, details, pins, setMember, setDetail, setPin, setType, setEndDate, setStartDate } = useSlack()
  const [tableData, setTableData] = React.useState({
    columns: [],
    rows: []
  })
  const [chartData, setChartData] = React.useState({
    chartData: [],
    chartConfig: {}
  })
  React.useEffect(() => {
    setTableData(prepareCongratulationsTableData(kudos))
    setChartData(prepareKudosByFeatureChartData(kudos))
  }, [kudos])
  console.log("tableData", tableData)
  console.log("chartData", chartData)

  return (
    <>
      <NavBar />
      <div className="flex flex-col p-4 justify-center items-center">
        <div className="flex flex-col gap-4">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Slack Kudos To You Report</h3>
          <div className="flex flex-row gap-4">
            <LoaderWrapper status={status}>
              <ComboBox label="Teams" />
              <ComboBox label="Team Member" items={members} setSelected={setMember} />
              <CalendarField label="Start Date" setDate={setEndDate} />
              <CalendarField label="End Date" setDate={setStartDate} />
              <ComboBox label="Pin Type" items={pins} setSelected={setPin}  />
              <ComboBox label="Kudos Type" items={types} setSelected={setType} />
              <ComboBox label="Kudos Details" items={details} setSelected={setDetail} />
            </LoaderWrapper>
          </div>
        </div>
        <div className="flex flex-grow flex-row gap-4">
          <LoaderWrapper status={status}>
            <div className="mx-auto aspect-square max-h-[1000px] max-w-[600px] w-[500px] h-[300px]">
              <PieDonut title="Highlighted Features" description="Kudos" centerText="Amount" chartConfig={chartData.chartConfig} chartData={chartData.chartData} />
            </div>
          </LoaderWrapper>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4">
              <LoaderWrapper status={status}>
                <CardBasic />
                <CardBasic />
              </LoaderWrapper>
            </div>
            <LoaderWrapper status={status}><CardBoard /></LoaderWrapper>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Kudos Details</h3>
          <LoaderWrapper status={status}>
            <div className="max-h-[1000px] max-w-[600px]"><TableBasic caption="All kudos made" columns={tableData.columns} rows={tableData.rows} /></div>
          </LoaderWrapper>
        </div>
      </div>
    </>
  );
}