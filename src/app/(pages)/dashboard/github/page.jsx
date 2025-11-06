"use client";

import * as React from "react"

import {
  Card,
  CardContent,
} from "@/src/components/ui/card"
import { BarLabel } from "@/src/components/charts/bar-label"
import { BarLabelCustom } from "@/src/components/charts/bar-label-custom"
import { BarMultiple } from "@/src/components/charts/bar-multiple"
import { ComboBox } from "@/src/components/general/combobox"
import { LoaderWrapper } from "@/src/components/general/loader-wrapper"
import { TableBasic } from "@/src/components/general/table-basic"
import { toSnakeCase } from "@/src/utils/texts"
import { useGithub } from "@/src/hooks/use-github"


const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-5)",
]

function prepareChartDataLabel(data) {
  const chartData = data.map((item, idx) => ({
    text: toSnakeCase(item.developer),
    label: item.developer,
    days_since_last_activity: item.days_since_last_activity,
    fill: colors[idx % colors.length],
  }))

  const chartConfig = Object.fromEntries(
    data.map((item, idx) => [
      toSnakeCase(item.developer),
      { label: item.developer, color: colors[idx % colors.length] },
    ])
  )

  return { chartData, chartConfig }
}

function prepareChartDataLabelCustom(data) {
  const chartData = data.map((item, idx) => ({
    text: toSnakeCase(item.developer),
    label: item.developer,
    overall_score: item.overall_score,
    fill: colors[idx % colors.length],
  }))

  const chartConfig = Object.fromEntries(
    data.map((item, idx) => [
      toSnakeCase(item.developer),
      { label: item.developer, color: colors[idx % colors.length] },
    ])
  )

  return { chartData, chartConfig }
}

function prepareChartDataMultiple(data) {
  const chartData = data.map((item, idx) => ({
    text: toSnakeCase(item.developer),
    label: item.developer,
    avg_comments_received: item.avg_comments_received,
    avg_comments_per_pr: item.avg_comments_per_pr,
    avg_review_comments_per_pr: item.avg_review_comments_per_pr,
    receives_review_feedback: item.receives_review_feedback,
    fill: colors[idx % colors.length],
  }))

  const chartConfig = Object.fromEntries(
    data.map((item, idx) => [
      toSnakeCase(item.developer),
      { label: item.developer, color: colors[idx % colors.length] },
    ])
  )

  return { chartData, chartConfig }
}

function prepareChartDataMultipleFrequency(data) {
  const chartData = data.map((item, idx) => ({
    text: toSnakeCase(item.developer),
    label: item.developer,
    total_prs_all_time: item.total_prs_all_time,
    commits_per_week: item.commits_per_week,
    prs_per_week: item.prs_per_week,
    fill: colors[idx % colors.length],
  }))

  const chartConfig = Object.fromEntries(
    data.map((item, idx) => [
      toSnakeCase(item.developer),
      { label: item.developer, color: colors[idx % colors.length] },
    ])
  )

  return { chartData, chartConfig }
}

function formatLabel(key) {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");

  return spaced.replace(/\b\w/g, (l) => l.toUpperCase());
};

function prepareTableData(data) {
  if (!Array.isArray(data) || data.length === 0) return { columns: [], rows: [] };

  const sample = data[0];
  const columns = Object.keys(sample).map((key) => ({
    label: formatLabel(key),
    field: key,
    className: "",
    classNameRows: "",
    totalRow: (key !== 'developer' && key !== 'activity_status'),
    type: key === 'developer' ? "identifier" : key === 'activity_status' ? "text" : "int",
  }));
  const rows = data.map((item) => ({
    ...item,
    last_updated: new Date(item.last_updated).toLocaleDateString(),
  }));
  return { columns, rows };
}


export default function GithubPage() {
  const { status, statusFilters, developers, data, setDeveloper } = useGithub()
  const [tableData, setTableData] = React.useState({
    columns: [],
    rows: []
  })
  const [chartDataLabel, setChartDataLabel] = React.useState({
    chartData: [],
    chartConfig: {}
  })
  const [chartDataLabelCustom, setChartDataLabelCustom] = React.useState({
    chartData: [],
    chartConfig: {}
  })
  const [chartDataMultiple, setChartDataMultiple] = React.useState({
    chartData: [],
    chartConfig: {}
  })
  const [chartDataMultipleFrequency, setChartDataMultipleFrequency] = React.useState({
    chartData: [],
    chartConfig: {}
  })
  React.useEffect(() => {
    setTableData(prepareTableData(data))
    setChartDataLabel(prepareChartDataLabel(data))
    setChartDataLabelCustom(prepareChartDataLabelCustom(data))
    setChartDataMultiple(prepareChartDataMultiple(data))
    setChartDataMultipleFrequency(prepareChartDataMultipleFrequency(data))
  }, [data])
  return (
    <div className="flex flex-col p-4 justify-center items-center gap-4">
      <div className="flex flex-col gap-4 w-[80vw]">
        <Card className="w-full">
          <CardContent className="flex gap-4 flex-col justify-center items-center">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Github</h3>
            <div className="flex flex-row gap-4">
              <LoaderWrapper status={statusFilters}>
                <ComboBox label="Developer" items={developers} setSelected={setDeveloper} />
              </LoaderWrapper>
            </div>
          </CardContent>
        </Card>
      </div>
      <LoaderWrapper status={status}>
        <div className="flex flex-grow flex-col gap-4 w-[80vw]">
          <div className="flex flex-grow flex-row gap-4 w-[80vw] h-[500px]">
            <div className="mx-auto aspect-square w-[40vw] h-[500px]">
              <BarLabel
                title="Inactive Days per Developer"
                description="Number of days that have passed without activity for each developer"
                chartConfig={chartDataLabel.chartConfig}
                chartData={chartDataLabel.chartData}
                labelKey="label"
                valueKey="days_since_last_activity"
              />
            </div>
            <div className="mx-auto aspect-square w-[40vw] h-[500px] max-h-[500px]">
              <BarLabelCustom
                title="Overall Score"
                description="Based on number of PRs and Commits per week, merge success rate, days without activity, level of engagement, average comments and feedback received by PR"
                chartConfig={chartDataLabelCustom.chartConfig}
                chartData={chartDataLabelCustom.chartData}
                labelKey="label"
                valueKey="overall_score"
              />
            </div>
          </div>
          <div className="flex flex-grow flex-row gap-4 w-[80vw] h-[500px]">
            <div className="mx-auto aspect-square w-[40vw] h-[500px]">
              <BarMultiple
                title="Pull Requests"
                description="Number of pull requests by developer"
                chartConfig={chartDataMultiple.chartConfig}
                chartData={chartDataMultiple.chartData}
              />
            </div>
            <div className="mx-auto aspect-square w-[40vw] h-[500px]">
              <BarMultiple
                title="Frequency"
                description="Number of PRs and commits per week compared to overall PRs"
                chartConfig={chartDataMultipleFrequency.chartConfig}
                chartData={chartDataMultipleFrequency.chartData}
              />
            </div>
          </div>
          {<div className="flex flex-col gap-4 w-[80vw] z-10">
            <Card className="w-full">
              <CardContent className="w-full">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Details</h3>
                <div className="h-full w-full"><TableBasic caption="All github data" columns={tableData.columns} rows={tableData.rows} /></div>
              </CardContent>
            </Card>
          </div>}
        </div>
      </LoaderWrapper>
    </div>
  );
}
