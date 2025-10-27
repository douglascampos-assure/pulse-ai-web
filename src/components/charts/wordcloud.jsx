"use client";

import * as React from "react";
import { WordCloud } from "@isoterik/react-word-cloud";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/card";

const wordsDefault = [
  { text: "told", value: 84 },
  { text: "mistake", value: 11 },
  { text: "thought", value: 16 },
  { text: "bad", value: 17 },
  { text: "great", value: 52 },
  { text: "excellent", value: 28 },
  { text: "feature", value: 20 },
  { text: "design", value: 24 },
  { text: "react", value: 14 },
];

export function Wordcloud({ words = wordsDefault }) {
  const containerRef = React.useRef(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const memoizedWords = React.useMemo(() => words.slice(0, 80), [words]);

  return (
    <Card className="mx-auto aspect-square w-[60vw] h-[500px]">
      <CardHeader>
        <CardTitle>What Makes the Team Shine</CardTitle>
      </CardHeader>

      <CardContent
        ref={containerRef}
        className="flex items-center justify-center h-full"
      >
        {size.width > 0 && (
          <WordCloud
            words={memoizedWords}
            width={size.width}
            height={size.height}
            padding={2}
            spiral="rectangular"
            rotate={() => 0}
            fontSize={(word) => Math.min(12 + word.value * 2, 60)}
            color={(word, index) => `var(--chart-${(index % 9) + 1})`}
          />
        )}
      </CardContent>
    </Card>
  );
}
