import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Seed script: reads data/cards.json and upserts into Supabase
 *
 * Usage: npx tsx scripts/seed-cards.ts
 *
 * Requires environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

interface CardJson {
  slug: string;
  name: string;
  issuer: string;
  annual_fee: number;
  benefits: BenefitJson[];
}

interface BenefitJson {
  name: string;
  value: number;
  period: string;
  period_count: number;
  category: string;
  reset_type: string;
  merchant_notes?: string | null;
  activation_required?: boolean;
  activation_notes?: string | null;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing required environment variables:");
    console.error("  NEXT_PUBLIC_SUPABASE_URL");
    console.error("  SUPABASE_SERVICE_ROLE_KEY");
    console.error("\nSet these in your .env.local file.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Read cards.json
  const dataPath = join(process.cwd(), "data", "cards.json");
  const raw = readFileSync(dataPath, "utf-8");
  const { cards } = JSON.parse(raw) as { cards: CardJson[] };

  console.log(`Found ${cards.length} cards to seed.\n`);

  let totalBenefits = 0;

  for (const card of cards) {
    // Upsert card
    const { data: cardData, error: cardError } = await supabase
      .from("cc_cards")
      .upsert(
        {
          cc_card_name: card.name,
          cc_issuer: card.issuer,
          cc_annual_fee: card.annual_fee,
          cc_card_slug: card.slug,
          cc_is_active: true,
        },
        { onConflict: "cc_card_slug" }
      )
      .select("id")
      .single();

    if (cardError) {
      console.error(`Error upserting card "${card.name}":`, cardError.message);
      continue;
    }

    const cardId = cardData.id;
    console.log(`  ${card.name} (${card.slug}) → ${cardId}`);

    // Upsert benefits
    for (const benefit of card.benefits) {
      const annualTotal = benefit.value * benefit.period_count;

      const { error: benefitError } = await supabase
        .from("cc_benefits")
        .upsert(
          {
            cc_card_id: cardId,
            cc_benefit_name: benefit.name,
            cc_benefit_value: benefit.value,
            cc_benefit_period: benefit.period,
            cc_period_count: benefit.period_count,
            cc_annual_total: annualTotal,
            cc_reset_type: benefit.reset_type || "calendar",
            cc_category: benefit.category || "other",
            cc_merchant_notes: benefit.merchant_notes || null,
            cc_activation_required: benefit.activation_required || false,
            cc_activation_notes: benefit.activation_notes || null,
            cc_is_active: true,
          },
          {
            onConflict: "cc_card_id,cc_benefit_name",
            ignoreDuplicates: false,
          }
        );

      if (benefitError) {
        console.error(
          `    Error upserting benefit "${benefit.name}":`,
          benefitError.message
        );
      } else {
        totalBenefits++;
      }
    }
  }

  console.log(
    `\nDone! Seeded ${cards.length} cards with ${totalBenefits} benefits.`
  );
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
