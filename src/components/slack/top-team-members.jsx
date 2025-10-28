"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/card";
import { CardBoard } from "@/src/components/slack/card-board"

export function TopTeamMembers({ userMentions = [] }) {
  return (
    <Card className="mx-auto w-full h-[355px] flex flex-col">
      <CardHeader>
        <CardTitle>Most Appreciated Team Members</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 p-2 rounded-md">
        {userMentions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {userMentions.map((userMention) => (
              <CardBoard
                key={userMention.displayName}
                photoUrl={userMention.photoUrl}
                name={userMention.displayName}
                position={userMention.jobTitle}
                mentions={userMention.kudosCount}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center mt-10">
            No team member data available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
