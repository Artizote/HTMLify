"use client";

import { useEffect, useState } from "react";
import { getRandomStatsInsightLine } from "lib/modules/stats/stats.utils"


export function StatsInsightLine() {
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
      getRandomStatsInsightLine().then(setInsight);
  }, []);

  return <span>{insight}</span>;
}

