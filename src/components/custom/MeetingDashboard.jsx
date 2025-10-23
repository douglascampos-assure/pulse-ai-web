"use client";
import { useState, useEffect } from 'react';
import { ChartPieLabelList } from '@/src/components/custom/ChartPieLabelList'
import { ChartBarDefault } from '@/src/components/custom/ChartBarDefault'
import { HorizontalChart } from '@/src/components/custom/HorizontalChart'
import { PieChartDonut } from '@/src/components/custom/PieChartDonut'
import { DropdownFilter } from '@/src/components/custom/DropdownFilter'
import { DateRangePicker } from '@/src/components/custom/DateRangePicker'
import { StatCard } from '@/src/components/custom/StatCard'
import { useAuth } from "@/src/context/AuthContext";

export function MeetingDashboard({ loadingText, className }) {
  const { user } = useAuth();
  let userEmail = '';
  if (user) {
    userEmail = user.email;
  }

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
  const [participationLevelSummary, setParticipationLevelSummary] = useState([]);
  const [participationLevelChartConfig, setParticipationLevelChartConfig] = useState([]);
  const [averageParticipation, setAverageParticipation] = useState(0);

  const getTransformedData = (data) => {
    const filteredData = data.filter((item) => {

      const matchTitle = meeting_title === "All" || item.titulo === meeting_title;


      if (startSearchingDate && endSearchingDate) {
        const startDate = new Date(startSearchingDate);
        const endDate = new Date(endSearchingDate);
        const itemDate = new Date(item.start_meeting);

        const matchDate = itemDate >= startDate && itemDate <= endDate;

        return matchTitle && matchDate;
      }

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

    console.log('filteredData', filteredData);
    const speakerArray = Object.entries(speakerTotals).map(([speaker, total]) => ({
      speaker_name: speaker,
      total_talking_participation: total
    }));

    const participationTimeChartConfig = {};
    let colorIndex = 1;

    Object.keys(speakerTotals).forEach((speaker) => {
      participationTimeChartConfig[speaker] = {
        label: speaker,
        color: `var(--chart-${colorIndex})`,
      };
      colorIndex++;
    });

    participationTimeChartConfig['total_talking_participation'] = {
      label: 'Participation By Min :'
    };

    console.log('Datos formateados: ', speakerArray);
    console.log('Datos formateados participationTimeChartConfig: ', participationTimeChartConfig);

    const participationCount = filteredData.reduce((acc, curr) => {
      const level = curr.participation_level;
      if (!acc[level]) {
        acc[level] = 0;
      }
      acc[level] += 1;
      return acc;
    }, {});

    const participationLevelSummary = Object.entries(participationCount).map(
      ([level, count]) => ({
        participation_level: level,
        number_of_times: count,
      })
    );

    const participationLevelChartConfig = {};
    participationLevelChartConfig['number_of_times'] = {
      label: 'No. Of Participants :'
    };
    colorIndex = 1;
    Object.keys(participationCount).forEach((level) => {
      participationLevelChartConfig[level] = {
        label: level,
        color: `var(--chart-${colorIndex})`,
      };
      colorIndex++;
    });

    const averageMedian = (() => {
      const uniqueMeetings = {};
      filteredData.forEach(item => {
          if (!uniqueMeetings[item.titulo]) {
            uniqueMeetings[item.titulo] = item.median_talking_participation;
          }
        });
        const medians = Object.values(uniqueMeetings);
        const avg = medians.reduce((sum, val) => sum + val, 0) / medians.length;
        return Number(avg.toFixed(2));
    })();

    console.log("Average median_talking_participation:", averageMedian);

    let result = [];
    result["speakerArray"] = speakerArray
    result["participationTimeChartConfig"] = participationTimeChartConfig;
    result["participants"] = ["All", ...new Set(speakerArray.map(item => item.speaker_name))];
    result["participationLevelSummary"] = participationLevelSummary;
    result["participationLevelChartConfig"] = participationLevelChartConfig;
    result["averageParticipation"] = averageMedian;

    return result
  }

  const getMeetingList = (data) => {
    return ["All", ...new Set(data.map(item => item.titulo))];
  }

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        if (!userEmail) return; // wait until we have the email
        const res = await fetch(`/api/meetings-info?email=${encodeURIComponent(userEmail)}`);

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        console.log('data databricks: ', data);
        setOriginalData(data);
        setMeetingsData(Array.isArray(data) ? data : []);
        const transformed_data = getTransformedData(data, meeting_title);
        //Meetings Dropdown
        setMeetingsList(getMeetingList(data));
        //Team Members list
        setParticipantsLists(transformed_data["participants"]);
        //Pie Chart
        setParticipationLevelSummary(transformed_data["participationLevelSummary"]);
        setParticipationLevelChartConfig(transformed_data["participationLevelChartConfig"]);
        //Bar Chart
        setParticipationByUser(transformed_data["speakerArray"]);
        setParticipationByUserChartConfig(transformed_data["participationTimeChartConfig"]);

        setAverageParticipation(transformed_data["averageParticipation"]);
      } catch (err) {
        console.error("Error fetching Databricks:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [userEmail]);

  useEffect(() => {
    const transformed_data = getTransformedData(originalData);
    setParticipationByUser(transformed_data["speakerArray"]);
    setParticipationByUserChartConfig(transformed_data["participationTimeChartConfig"]);
    setParticipantsLists(transformed_data["participants"]);
    setParticipationLevelSummary(transformed_data["participationLevelSummary"]);
    setParticipationLevelChartConfig(transformed_data["participationLevelChartConfig"]);
    setAverageParticipation(transformed_data["averageParticipation"]);
  }, [meeting_title]);

  useEffect(() => {
    const transformed_data = getTransformedData(originalData);
    setParticipationByUser(transformed_data["speakerArray"]);
    setParticipationByUserChartConfig(transformed_data["participationTimeChartConfig"]);
    setParticipantsLists(transformed_data["participants"]);
    setParticipationLevelSummary(transformed_data["participationLevelSummary"]);
    setParticipationLevelChartConfig(transformed_data["participationLevelChartConfig"]);
    setAverageParticipation(transformed_data["averageParticipation"]);
  }, [startSearchingDate, endSearchingDate]);

   if (isLoading) {
    return <div className={className}>{loadingText || "Loading meetings..."}</div>;
  }

  if (error) {
    return <div className={className}>Error: {error}</div>;
  }

  if (meetingsData.length === 0) {
    return <div className={className}>No meetings found for {userEmail}</div>;
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto p-4">

      {/*  FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        <DropdownFilter
          title="Participation"
          description="Level of Participation"
          items={participantsLists}
          onSelectItem={(value) => console.log("Participation Selected", value)}
        />

        <DropdownFilter
          title="Team Member Name"
          description="List of Team Members"
          items={participantsLists}
          onSelectItem={(value) => console.log("Member Selected", value)}
        />

        <DropdownFilter
          title="Meetings"
          description="List of Meetings"
          items={meetingsList}
          onSelectItem={(value) => {
            setMeetingTitle(value);
            const transformed_data = getTransformedData(originalData);
            setParticipationByUser(transformed_data["speakerArray"]);
            setParticipationByUserChartConfig(transformed_data["participationTimeChartConfig"]);
            setParticipationLevelSummary(transformed_data["participationLevelSummary"]);
            setParticipationLevelChartConfig(transformed_data["participationLevelChartConfig"]);
            setAverageParticipation(transformed_data["averageParticipation"]);
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
      </div>

      {/* Middle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-stretch">
        {/* LEFT: Horizontal Bar Chart */}
        <div className="flex flex-col h-full">
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

        {/* RIGHT: Pie Chart + Stats */}
        <div className="flex flex-col lg:flex-row gap-4 h-full">
          {/* Pie Chart */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex-1 flex items-center justify-center h-[350px]">
              <PieChartDonut
                chartData={participationLevelSummary}
                chartConfig={participationLevelChartConfig}
                dataKey="number_of_times"
                nameKey="participation_level"
                cardTitle="Participation Level"
                cardDescription="Participation level by users"
                footerMessage="Total of participation level by users"
                footerMessage2="Showing All Particpation Levels"
              />
            </div>
          </div>
          {/* Stat Cards */}
          <div className="flex flex-col justify-between gap-4 w-[180px]">
            <StatCard title="Participants" value={participantsLists.length} />
            <StatCard title="Avg. Participation Min" value={averageParticipation} />
          </div>
        </div>
      </div>
    </div>
  );
}