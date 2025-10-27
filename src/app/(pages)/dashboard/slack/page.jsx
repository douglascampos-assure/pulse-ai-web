"use client";

import * as React from "react"

import {
  Card,
  CardContent,
} from "@/src/components/ui/card"
import { Wordcloud } from "@/src/components/charts/wordcloud"
import { ComboBox } from "@/src/components/general/combobox"
import { LoaderWrapper } from "@/src/components/general/loader-wrapper"
import { CalendarField } from "@/src/components/general/calendar-field"
import { TableBasic } from "@/src/components/general/table-basic"
import { CardBasic } from "@/src/components/general/card-basic"
import { TopTeamMembers } from "@/src/components/slack/top-team-members"
import { useSlack } from "@/src/hooks/use-slack"


function prepareKudosByFeatureWordCloudData(data) {
  const counts = data.reduce((acc, item) => {
    const feature = item.highlighted_feature || "Other";
    acc[feature] = (acc[feature] || 0) + 1;
    return acc;
  }, {});

  const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const words = sortedEntries.map(([feature, count]) => ({
    text: feature,
    value: count,
  }));

  return words;
}

function prepareCongratulationsTableData(data) {
  if (!Array.isArray(data) || data.length === 0) return { columns: [], rows: [] }

  const columns = [
    {
        "label": "Email",
        "field": "workEmail",
        "className": "",
        "classNameRows": "",
        "totalRow": false,
        "type": "string"
    },
    {
        "label": "Message",
        "field": "plain_message",
        "className": "",
        "classNameRows": "",
        "totalRow": false,
        "type": "string"
    },
    {
        "label": "Highlighted Features",
        "field": "highlighted_features",
        "className": "",
        "classNameRows": "",
        "totalRow": false,
        "type": "string"
    },
    {
        "label": "Type",
        "field": "type_congratulation",
        "className": "",
        "classNameRows": "",
        "totalRow": false,
        "type": "string"
    },
    {
        "label": "Detail",
        "field": "detail_congratulation",
        "className": "",
        "classNameRows": "",
        "totalRow": false,
        "type": "string"
    },
    {
        "label": "Pin",
        "field": "pin_congratulation",
        "className": "",
        "classNameRows": "",
        "totalRow": false,
        "type": "string"
    },
    {
        "label": "Supervisor",
        "field": "supervisor",
        "className": "",
        "classNameRows": "",
        "totalRow": false,
        "type": "string"
    },
    {
        "label": "Date",
        "field": "congratulations_date",
        "className": "",
        "classNameRows": "",
        "totalRow": false,
        "type": "string"
    }
  ]

  const rows = data.map((item) => ({
    ...item,
    congratulations_date: new Date(item.congratulations_date).toLocaleDateString(),
  }))

  return { columns, rows }
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

export default function SlackPage() {
  const { status, statusFilters, kudos, members, types, details, pins, supervisors, member, setMember, setDetail, setPin, setType, setEndDate, setStartDate, setSupervisor } = useSlack()
  const [tableData, setTableData] = React.useState({
    columns: [],
    rows: []
  })
  const [words, setWords] = React.useState([])
  const [userMentions, setUserMentions] = React.useState([])
  React.useEffect(() => {
    setTableData(prepareCongratulationsTableData(kudos))
    setUserMentions(groupAndSortKudos(kudos))
    setWords(prepareKudosByFeatureWordCloudData(kudos))
  }, [kudos])
  return (
    <div className="flex flex-col p-4 justify-center items-center gap-4">
      <div className="flex flex-col gap-4 w-[80vw]">
        <Card className="w-full">
          <CardContent className="flex gap-4 flex-col justify-center items-center">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Slack</h3>
            <div className="flex flex-row gap-4">
              <LoaderWrapper status={statusFilters}>
                    {supervisors.length > 1 && <ComboBox label="Supervisor" items={supervisors} setSelected={setSupervisor} />}
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
            <Wordcloud words={words} />
          </LoaderWrapper>
        </div>
        <div className="flex flex-col gap-1 w-[20vw] h-[500px]">
          <div className={!member ? "flex flex-row gap-4 h-[140px]" : "flex flex-row gap-4 h-full"}>
            <LoaderWrapper status={status}>
              <CardBasic footer="Number of mentions" value={kudos.length} />
            </LoaderWrapper>
          </div>
          {!member && <LoaderWrapper status={status}>
            <TopTeamMembers userMentions={userMentions}/>
          </LoaderWrapper>}
        </div>
      </div>
      <div className="flex flex-col gap-4 w-[80vw] z-10">
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
  );
}
