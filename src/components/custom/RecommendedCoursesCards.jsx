import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Zap, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";  

const getColor = (percentage) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
};

export const RecommendedCoursesCards = ({ coursesData }) => {
    if (!coursesData || coursesData.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Top Recommended Courses</h2>

            <div className="grid gap-y-3 gap-x-10 grid-cols-2 justify-center">
                {coursesData.slice(0, 4).map((course, index) => (
                <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-500"
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 min-h-[65px]">
                    <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">
                        {course.Recommended_Course}
                    </CardTitle>
                    <Zap className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    </CardHeader>

                    <CardContent className="space-y-2 pt-1">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Average Match:</span>
                        <span
                        className={`text-2xl font-bold ${getColor(course.avg_score)}`}
                        >
                        {course.avg_score}%
                        </span>
                    </div>

                    <div className="flex items-start space-x-2 text-sm text-gray-700">
                        <Target className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-400" />
                        <span className="font-medium">Skill:</span>
                        <Tooltip>
                        <TooltipTrigger className="cursor-pointer text-left">
                            <span className="line-clamp-2">
                            {course.Skill_to_Improve.join(", ") || "Not Specified"}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">{course.Skill_to_Improve.join(", ")}</p>
                        </TooltipContent>
                        </Tooltip>
                    </div>

                    <p className="font-medium text-blue-900 mt-1">
                        Total recommendations: {course.times_recommended}
                    </p>
                    </CardContent>
                </Card>
                ))}
            </div>
            </div>

    );
};
