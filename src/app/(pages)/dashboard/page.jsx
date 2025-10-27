import SimpleCard from "@/src/components/ui/simple-card";

export default function DashboardPage() {
  return (
    <div className="p-6 flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Titulo */}
      <div className="mb-4 w-full text-center">
        <h1
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "36px",
          }}
          className="text-gray-900 dark:text-gray-100"
        >
          Overview
        </h1>
      </div>

      {/* Filtro Teams */}
      <div className="mb-6 flex justify-end">
        <select className="block w-64 rounded-md border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
          <option>Team A</option>
          <option>Team B</option>
          <option>Team C</option>
        </select>
      </div>

      {/* Resume 1 */}
      <div className="mb-1 py-5 flex justify-center px-8 bg-white rounded-xl shadow-lg">
        <div className="flex items-center w-full px-10">
          <SimpleCard
            bgColor="bg-[#C4E7FF]"
            textColor="text-black"
            width="w-44"
            height="h-44"
            indicator="4"
            description="Teams"
          />

          <div className="flex flex-col justify-center gap-4 flex-grow ml-8">
            <div
              className="w-full h-8 rounded-xl shadow-md flex items-center px-4 py-2 text-sm font-medium"
              style={{ backgroundColor: "#FFBABA", color: "#000" }}
            >
              <span>Team Phoenix: Average sentiment this week is Negative</span>
            </div>
            <div
              className="w-full h-8 rounded-xl shadow-md flex items-center px-4 py-2 text-sm font-medium"
              style={{ backgroundColor: "#FFBABA", color: "#000" }}
            >
              <span>
                There is 1 team member with the camera on less than 85% of the
                times
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Resume 2 */}
      <div className="py-6 dark:bg-gray-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator="8"
          description="Members in the team"
          icon="/icons/people.png"
        />
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator="24"
          description="Meetings this week"
          icon="/icons/meetings.png"
        />
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator="500"
          description="Mentions on Slack"
          icon="/icons/slack.png"
        />
        <SimpleCard
          bgColor="bg-white"
          textColor="text-black"
          indicator=""
          description="Completed Tasks"
          icon="/icons/jira.svg"
        />
      </div>
      {/* Resume 3 */}
      <div className="py-6 rounded-xl grid grid-cols-2 gap-6 bg-white">
        <div className="py-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          aa
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-center items-center">
          <SimpleCard
            bgColor="bg-[#C4E7FF]"
            textColor="text-black"
            width="w-64"
            height="h-44"
            indicator="92%"
            description="Engagement Rate"
          />
        </div>
      </div>
    </div>
  );
}
