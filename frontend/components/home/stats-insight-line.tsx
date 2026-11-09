"use client";

import { useEffect, useState } from "react";
import { getRandomStatsInsightLine } from "lib/modules/stats/stats.utils"


export function StatsInsightLine() {
  const [insight, setInsight] = useState<string | null>(null);

  function updateInsight() {
      getRandomStatsInsightLine().then(setInsight).then(() => setTimeout(updateInsight, 4321));
  }

  useEffect(updateInsight, []);

  return <span>{insight}</span>;
}

