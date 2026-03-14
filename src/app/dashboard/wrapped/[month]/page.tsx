import WrappedClient from "./WrappedClient";

export function generateStaticParams() {
  // Generate last 24 months of possible wrapped pages
  const params: { month: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    params.push({ month: key });
  }
  return params;
}

export default async function MonthlyWrappedPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  return <WrappedClient month={month} />;
}
