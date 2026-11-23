"use client";

import { useEffect, useState } from "react";
import { getRandomStatsInsightLine } from "lib/modules/stats/stats.utils"


export function StatsInsightLine() {
  const [insight, setInsight] = useState("Hosting and Serving.");

  function updateInsight() {
    getRandomStatsInsightLine().then(setInsight)
  }

  useEffect(() => {
    const interval = setInterval(updateInsight, 4321);
    return () => { clearInterval(interval); }
  }, []);

  return <span>{insight}</span>;
}

