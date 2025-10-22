"use client";
import { useState, useEffect } from 'react';
import { ChartPieLabelList } from '@/src/components/custom/ChartPieLabelList'
import { ChartBarDefault } from '@/src/components/custom/ChartBarDefault'
import { HorizontalChart } from '@/src/components/custom/HorizontalChart'
import { PieChartDonut } from '@/src/components/custom/PieChartDonut'
import { DropdownFilter } from '@/src/components/custom/DropdownFilter'
import { DateRangePicker } from '@/src/components/custom/DateRangePicker'

export function MeetingDashboard({ text, loadingText, loading, className, email }) {
  const [meetingsData, setMeetingsData] = useState([]);
  const [participationByUser, setParticipationByUser] = useState([])
  const [participationByUserChartConfig, setParticipationByUserChartConfig] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetingsList, setMeetingsList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [meeting_title, setMeetingTitle] = useState('All');
  const [startSearchingDate, setStartSearchingDate] = useState(null);
  const [endSearchingDate, setEndSearchingDate] = useState(null);
  const [participantsLists, setParticipantsLists] = useState([]);

  const getTransformedData = (data) => {
    const filteredData = data.filter((item) => {
      // 🟣 Filter by meeting title
      const matchTitle = meeting_title === "All" || item.titulo === meeting_title;

      // 🟣 Filter by date range (if provided)
      if (startSearchingDate && endSearchingDate) {
        const startDate = new Date(startSearchingDate);
        const endDate = new Date(endSearchingDate);
        const itemDate = new Date(item.start_meeting);

        // Include only items whose start_meeting is within range
        const matchDate = itemDate >= startDate && itemDate <= endDate;

        return matchTitle && matchDate;
      }

      // If no date range selected, just filter by title
      return matchTitle;
    });

    const speakerTotals = filteredData.reduce((acc, curr) => {
      console.log('meeting_title', meeting_title);
      if (meeting_title !== 'All' && meeting_title !== curr.titulo)
      {
          return false;
      }

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
    result["participants"] = ["All", ...new Set(speakerArray.map(item => item.speaker_name))];
    return result
  }

  const getMeetingList = (data) => {
    return ["All", ...new Set(data.map(item => item.titulo))];
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
        console.log('Databricks data', data)
        setOriginalData(data);
        setMeetingsData(Array.isArray(data) ? data : []);
        const transformed_data = getTransformedData(data, meeting_title);
        setParticipationByUser(transformed_data["speakerArray"]);
        setParticipationByUserChartConfig(transformed_data["chartConfig"]);
        setMeetingsList(getMeetingList(data));
        setParticipantsLists(transformed_data["participants"]);
      } catch (err) {
        console.error("Error fetching Databricks:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [email]);

  useEffect(() => {
    const transformed_data = getTransformedData(originalData);
    setParticipationByUser(transformed_data["speakerArray"]);
    setParticipationByUserChartConfig(transformed_data["chartConfig"]);
    setParticipantsLists(transformed_data["participants"]);
  }, [meeting_title]);

  useEffect(() => {
    const transformed_data = getTransformedData(originalData);
    setParticipationByUser(transformed_data["speakerArray"]);
    setParticipationByUserChartConfig(transformed_data["chartConfig"]);
    setParticipantsLists(transformed_data["participants"]);
  }, [startSearchingDate, endSearchingDate]);

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
    <>
      <DropdownFilter 
        title="Team Member Name"
        description='List of Meetings'
        items={participantsLists}
        onSelectItem={(value) => {
          console.log('Member Selected', value)
        }}
      />
      <DropdownFilter 
        title="Meetings"
        description='List of Meetings'
        items={meetingsList}
        onSelectItem={(value) => {
          setMeetingTitle(value);
          const transformed_data = getTransformedData(originalData);
          setParticipationByUser(transformed_data["speakerArray"]);
          setParticipationByUserChartConfig(transformed_data["chartConfig"]);
        }}
      />
      <DateRangePicker
        onChange={(range) => {
          if (range.start && range.end) {
            setStartSearchingDate(range.start);
            setEndSearchingDate(range.end);
          }
        }}
      />
      <div  className="flex flex-col gap-8 w-full max-w-2xl mx-auto p-4">
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
      </div>
    </>
  );
}