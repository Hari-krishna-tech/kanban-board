import { getInsights } from "@/actions/insights";
import { InsightsClient } from "./insights-client";

export default async function InsightsPage() {
  const data = await getInsights();
  return (
    <div className="h-full overflow-y-auto">
      <InsightsClient data={data} />
    </div>
  );
}
