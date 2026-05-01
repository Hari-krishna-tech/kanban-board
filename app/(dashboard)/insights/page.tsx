import { getInsights } from "@/actions/insights";
import { InsightsClient } from "./insights-client";

export default async function InsightsPage() {
  const data = await getInsights();
  return <InsightsClient data={data} />;
}
