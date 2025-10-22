"use client";
import { useState, useEffect } from 'react';
import { ChartPieLabelList } from '@/src/components/custom/ChartPieLabelList'
import { ChartBarDefault } from '@/src/components/custom/ChartBarDefault'
import { HorizontalChart } from '@/src/components/custom/HorizontalChart'
import { PieChartDonut } from '@/src/components/custom/PieChartDonut'

export function MeetingDashboard({ text, loadingText, loading, className, email }) {
  const [meetingsData, setMeetingsData] = useState([]);
  const [participationByUser, setParticipationByUser] = useState([])
  const [participationByUserChartConfig, setParticipationByUserChartConfig] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getParticipationByUser = (data) => {
    const speakerTotals = data.reduce((acc, curr) => {
      const { speaker_name, talking_participation } = curr;

      if (!acc[speaker_name]) {
        acc[speaker_name] = 0;
      }
      acc[speaker_name] += talking_participation;

      return acc;
    }, {});

    const speakerArray = Object.entries(speakerTotals).map(([speaker, total]) => ({
      speaker_name: speaker,
      total_talking_participation: total
    }));

    const chartConfig = {};
    let colorIndex = 1;

    Object.keys(speakerTotals).forEach((speaker) => {
      chartConfig[speaker] = {
        label: speaker,
        color: `var(--chart-${colorIndex})`,
      };
      colorIndex++;
    });

    chartConfig['total_talking_participation'] = {
      label: 'Participation By Min :'
    };

    console.log('Datos formateados: ', speakerArray);
    console.log('Datos formateados chartConfig: ', chartConfig);
    let result = [];
    result["speakerArray"] = speakerArray
    result["chartConfig"] = chartConfig;
    return result
  }

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const userEmail =
          !email || (typeof email === "string" && email.trim().length === 0)
            ? "brian.perez@assuresoft.com"
            : email;

        const res = await fetch(`/api/meetings-info?email=${encodeURIComponent(userEmail)}`);

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Datos de Databricks:", data);

        setMeetingsData(Array.isArray(data) ? data : []);
        const participation_by_user = getParticipationByUser(data);
        setParticipationByUser(participation_by_user["speakerArray"]);
        setParticipationByUserChartConfig(participation_by_user["chartConfig"]);
      } catch (err) {
        console.error("Error fetching Databricks:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [email]);

   if (isLoading) {
    return <div className={className}>{loadingText || "Loading meetings..."}</div>;
  }

  if (error) {
    return <div className={className}>❌ Error: {error}</div>;
  }

  if (meetingsData.length === 0) {
    return <div className={className}>No meetings found for {email}</div>;
  }

  return (
    <div  className="flex flex-col gap-8 w-full max-w-2xl mx-auto p-4">
      <ChartPieLabelList
          chartData={participationByUser}
          chartConfig={participationByUserChartConfig}
          dataKey="total_talking_participation"
          nameKey="speaker_name"
          cardTitle="Participation By Meeting"
          cardDescription="How much a user participated on meetings on minutes"
          footerMessage="Total number of time on meeting"
          footerMessage2="Showing All Meetings"
      />
      <div className="flex flex-col w-full max-w-2xl h-[600px] mx-auto p-4">
          <ChartBarDefault
            chartData={participationByUser}
            chartConfig={participationByUserChartConfig}
            dataKey="total_talking_participation"
            nameKey="speaker_name"
            cardTitle="Participation By Meeting"
            cardDescription="How much a user participated on meetings on minutes"
            footerMessage="Total number of time on meeting"
            footerMessage2="Showing All Meetings"
        />
      </div>
      <div className="flex flex-col w-full max-w-4xl h-[600px] mx-auto p-4">
          <HorizontalChart
            chartData={participationByUser}
            chartConfig={participationByUserChartConfig}
            dataKey="total_talking_participation"
            nameKey="speaker_name"
            cardTitle="Participation By Meeting"
            cardDescription="How much a user participated on meetings on minutes"
            footerMessage="Total number of time on meeting"
            footerMessage2="Showing All Meetings"
        />
      </div>
      <div className="h-[400px]">
          <PieChartDonut
            chartData={participationByUser}
            chartConfig={participationByUserChartConfig}
            dataKey="total_talking_participation"
            nameKey="speaker_name"
            cardTitle="Participation By Meeting"
            cardDescription="How much a user participated on meetings on minutes"
            footerMessage="Total number of time on meeting"
            footerMessage2="Showing All Meetings"
          />
      </div>
    </div>
  );
}