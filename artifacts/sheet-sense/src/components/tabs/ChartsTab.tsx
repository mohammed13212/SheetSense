import type { ChartData } from "@/types";
import { Visualizations } from "@/components/Visualizations";

interface ChartsTabProps {
  chartData?: ChartData;
}

export function ChartsTab({ chartData }: ChartsTabProps) {
  return (
    <div className="p-6">
      <Visualizations chartData={chartData} />
    </div>
  );
}
