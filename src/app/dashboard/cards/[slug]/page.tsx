import { DEMO_CARDS } from "@/lib/demo/data";
import CardDetailClient from "./CardDetailClient";

export function generateStaticParams() {
  return DEMO_CARDS.map((card) => ({ slug: card.cc_card_slug }));
}

export default function CardDetailPage() {
  return <CardDetailClient />;
}
