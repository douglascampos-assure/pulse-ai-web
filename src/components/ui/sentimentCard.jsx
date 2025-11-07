"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";
import { Smile, Meh, Frown, InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export default function SentimentCard({ averageSentiment = "Neutral" }) {
  const sentimentConfig = {
    Positive: {
      color: "bg-white text-black",
      icon: <Smile className="w-16 h-16 text-black" />,
      title: "Average Sentiment",
      message: "Your team seems motivated and positive in the last 25 days!",
    },
    Neutral: {
      color: "bg-white text-black",
      icon: <Meh className="w-16 h-16 text-black" />,
      title: "Average Sentiment",
      message: "Your team has been balanced — keep up the steady energy!",
    },
    Negative: {
      color: "bg-white text-black",
      icon: <Frown className="w-16 h-16 text-black" />,
      title: "Average Sentiment",
      message: "Your team seems low in spirit lately. Try boosting morale!",
    },
  };

  // Si no hay sentimiento, por defecto “Neutral”
  const { color, icon, title, message } =
    sentimentConfig[averageSentiment] || sentimentConfig.Neutral;

  return (
    <Card
      className={`flex flex-col items-center justify-between rounded-xl shadow-lg p-4 w-full h-60 ${color}`}
    >
      <CardHeader className="relative w-full flex justify-center items-center font-bold text-lg">
        {title}
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="size-3 cursor-pointer text-slate-400 hover:text-slate-600" />
          </TooltipTrigger>
          <TooltipContent>
            {
              "Negative: <=50, Neutral: >50 and <=70, Positive: >70 and <=85, Outstanding: >85"
            }
          </TooltipContent>
        </Tooltip>
      </CardHeader>

      <CardContent className="flex items-center justify-center flex-grow">
        {icon}
      </CardContent>

      <CardFooter className="text-center text-sm px-3 w-[80%]">
        {message}
      </CardFooter>
    </Card>
  );
}
