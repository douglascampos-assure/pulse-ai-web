"use client";
import SimpleCard from "@/src/components/ui/simple-card";
import { LinePerformanceChart } from "@/src/components/charts/line-chart";
import SentimentCard from "@/src/components/ui/sentimentCard";

export default function OverviewTeam({ teamData, performanceData }) {
  return (
    <>
      {/* METRICS ROW */}
      <div className="dark:bg-gray-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator={teamData.members?.length ?? 0}
          description="Members in the team"
          icon="/icons/people.png"
        />
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          // indicator={
          //   teamData.avgWeeklyHours ? teamData.avgWeeklyHours.toFixed(1) : "0"
          // }
          indicator="15h"
          description="Meetings this week"
          icon="/icons/meetings.png"
        />
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator={teamData.totalKudos ?? 0}
          description="Mentions on Slack"
          icon="/icons/slack.png"
        />
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator={teamData.totalCompleted ?? 0}
          description="Completed Tasks"
          icon="/icons/jira.svg"
        />
      </div>

      {/* CHART + WARNINGS ROW */}
      <div className="py-6 rounded-xl grid grid-cols-2 gap-6 bg-white my-6">
        <div className="rounded-xl bg-white shadow-lg p-6 h-[280px]">
          <LinePerformanceChart
            title="Team Performance"
            description="Jira story points by month"
            chartData={performanceData}
            chartConfig={{
              dataKey: "performance",
              xKey: "month",
              color: "var(--chart-3)",
              label: "Performance",
            }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-row justify-center items-stretch">
          {/* Warnings */}
          <div className="flex flex-col justify-between w-1/2 gap-2 pr-5">
            {teamData.warnings && teamData.warnings.length > 0 ? (
              teamData.warnings.map((w, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-center text-xs font-medium rounded-xl shadow-md p-4 h-1/2
                    ${
                      w.type === "negative"
                        ? "bg-red-300 text-black"
                        : w.type === "alert"
                        ? "bg-yellow-200 text-black"
                        : w.type === "positive"
                        ? "bg-green-200 text-black"
                        : "bg-gray-200 text-black"
                    }`}
                >
                  <span>{w.message}</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-gray-500">
                <span>No warnings</span>
              </div>
            )}
          </div>

          {/* Sentiment */}
          <SentimentCard averageSentiment={teamData.averageSentiment} />
        </div>
      </div>
    </>
  );
}
