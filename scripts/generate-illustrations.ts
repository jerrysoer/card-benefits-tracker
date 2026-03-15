import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const ai = new GoogleGenAI({ apiKey });

const STYLE_ANCHOR = `Flat illustration in a modern editorial collage style. Warm color palette: cream, gold (#C8963E), dusty rose (#C4717A), sage green (#6B8F71), deep teal (#2A7C6F), burgundy (#7A3B42). Semi-flat with subtle texture and grain. No outlines or heavy linework. Soft shadows. Slightly vintage feel, like a high-end travel magazine illustration. Clean composition with negative space. No photorealism. No 3D rendering. No gradients. Matte finish. White or transparent background.`;

interface IllustrationSpec {
  id: string;
  filename: string;
  prompt: string;
  width: number;
  height: number;
  category:
    | "issuer"
    | "category"
    | "character"
    | "scene"
    | "decoration"
    | "card-art";
}

const ILLUSTRATIONS: IllustrationSpec[] = [
  // Category 1: Issuer World Illustrations
  {
    id: "issuer_amex",
    filename: "amex-world.png",
    prompt:
      "An elegant first-class airplane cabin interior with champagne flutes, a leather passport holder, and a golden boarding pass. Travel luxury vignette.",
    width: 800,
    height: 400,
    category: "issuer",
  },
  {
    id: "issuer_chase",
    filename: "chase-world.png",
    prompt:
      "A cozy upscale restaurant table set for two with wine glasses, artisan bread, and a city skyline visible through the window. Dining and travel vignette.",
    width: 800,
    height: 400,
    category: "issuer",
  },
  {
    id: "issuer_capital_one",
    filename: "capitalone-world.png",
    prompt:
      "A mountain lodge balcony overlooking a valley with hiking boots, a coffee mug, and binoculars. Adventure travel vignette.",
    width: 800,
    height: 400,
    category: "issuer",
  },
  {
    id: "issuer_citi",
    filename: "citi-world.png",
    prompt:
      "A stylish city streetscape with a vintage taxi, theater marquee, and jazz club neon sign. Urban nightlife vignette.",
    width: 800,
    height: 400,
    category: "issuer",
  },
  {
    id: "issuer_bilt",
    filename: "bilt-world.png",
    prompt:
      "A modern apartment interior with floor-to-ceiling windows, a yoga mat, and a plant-filled balcony overlooking a city. Young professional home vignette.",
    width: 800,
    height: 400,
    category: "issuer",
  },
  {
    id: "issuer_hotel",
    filename: "hotel-world.png",
    prompt:
      "A luxury hotel infinity pool at sunset with lounge chairs, tropical plants, and a cocktail on a side table. Hotel resort vignette.",
    width: 800,
    height: 400,
    category: "issuer",
  },

  // Category 2: Benefit Category Illustrations
  {
    id: "cat_dining",
    filename: "dining.png",
    prompt:
      "A flat illustration of a restaurant table from above with pasta, wine, bread, and cutlery arranged artfully. Food editorial style.",
    width: 400,
    height: 400,
    category: "category",
  },
  {
    id: "cat_travel",
    filename: "travel.png",
    prompt:
      "A flat illustration of a vintage suitcase with travel stickers, a passport, boarding passes, and a small globe. Travel editorial style.",
    width: 400,
    height: 400,
    category: "category",
  },
  {
    id: "cat_streaming",
    filename: "streaming.png",
    prompt:
      "A flat illustration of a cozy couch scene with a TV remote, popcorn bowl, blanket, and streaming service icons as abstract shapes.",
    width: 400,
    height: 400,
    category: "category",
  },
  {
    id: "cat_shopping",
    filename: "shopping.png",
    prompt:
      "A flat illustration of shopping bags, a gift box with ribbon, a receipt, and a credit card arranged in a still life.",
    width: 400,
    height: 400,
    category: "category",
  },
  {
    id: "cat_rideshare",
    filename: "rideshare.png",
    prompt:
      "A flat illustration of a city street with a car, a phone showing a map, and a coffee cup. Urban commute vignette.",
    width: 400,
    height: 400,
    category: "category",
  },
  {
    id: "cat_wellness",
    filename: "wellness.png",
    prompt:
      "A flat illustration of a yoga mat, water bottle, running shoes, and a plant. Health and wellness vignette.",
    width: 400,
    height: 400,
    category: "category",
  },
  {
    id: "cat_airline",
    filename: "airline.png",
    prompt:
      "A flat illustration of a window seat on an airplane with clouds outside, a neck pillow, and headphones.",
    width: 400,
    height: 400,
    category: "category",
  },
  {
    id: "cat_hotel",
    filename: "hotel.png",
    prompt:
      "A flat illustration of a hotel room key card, a fluffy robe, slippers, and a room service tray.",
    width: 400,
    height: 400,
    category: "category",
  },

  // Category 3: Character Mascots
  {
    id: "char_optimizer",
    filename: "optimizer.png",
    prompt:
      "A confident young professional in smart casual clothes, holding a phone and a coffee, with a subtle gold crown floating above their head. Smiling. Full body standing pose.",
    width: 400,
    height: 600,
    category: "character",
  },
  {
    id: "char_hoarder",
    filename: "hoarder.png",
    prompt:
      "A character sitting on a giant pile of coins and treasure like a dragon, hugging a jar of points. Playful and slightly guilty expression. Full body sitting pose.",
    width: 400,
    height: 600,
    category: "character",
  },
  {
    id: "char_newbie",
    filename: "newbie.png",
    prompt:
      "A curious young person looking at a credit card with wonder, surrounded by floating question marks and lightbulbs. Excited expression. Full body standing pose.",
    width: 400,
    height: 600,
    category: "character",
  },
  {
    id: "char_roaster",
    filename: "roaster.png",
    prompt:
      "A character wearing sunglasses and a leather jacket, holding a microphone, with flames in the background. Comedy roast energy. Full body standing pose.",
    width: 400,
    height: 600,
    category: "character",
  },
  {
    id: "char_coach",
    filename: "coach.png",
    prompt:
      "A warm, encouraging figure in athleisure holding a clipboard and giving a thumbs up. Supportive smile. Full body standing pose.",
    width: 400,
    height: 600,
    category: "character",
  },

  // Category 4: Scene Illustrations
  {
    id: "scene_wrapped",
    filename: "wrapped-hero.png",
    prompt:
      "A desk scene from above with a journal, scattered photos, postcards, stamps, a pen, and a coffee cup. Monthly review moment. Scrapbook editorial style.",
    width: 1080,
    height: 600,
    category: "scene",
  },
  {
    id: "scene_year_review",
    filename: "year-review-hero.png",
    prompt:
      "A panoramic illustrated map of a year's journey with miniature landmarks, a winding path, seasonal trees, and milestone flags along the route.",
    width: 1080,
    height: 600,
    category: "scene",
  },
  {
    id: "scene_empty_wallet",
    filename: "empty-wallet.png",
    prompt:
      "An open empty wallet on a table with a few scattered coins, looking hopeful not sad. A plant growing from one coin. New beginnings energy.",
    width: 600,
    height: 400,
    category: "scene",
  },
  {
    id: "scene_full_wallet",
    filename: "full-wallet.png",
    prompt:
      "An overflowing treasure chest with gold coins, credit cards fanned out like a poker hand, points symbols, and sparkles. Achievement unlocked energy.",
    width: 600,
    height: 400,
    category: "scene",
  },
  {
    id: "scene_landing",
    filename: "landing-hero.png",
    prompt:
      "A stylized desk arrangement with multiple credit cards, a journal, a pen, sticky notes with checkmarks, and a small clock. Organized financial life. Bird's eye view.",
    width: 1200,
    height: 600,
    category: "scene",
  },
  {
    id: "scene_subscriptions",
    filename: "subscriptions.png",
    prompt:
      "A flat illustration of app icons floating above a phone like bubbles, some bright and active, some faded and ghostly. Subscription audit concept.",
    width: 600,
    height: 400,
    category: "scene",
  },

  // Category 5: Decorative Elements
  {
    id: "deco_stamp_circle",
    filename: "stamp-circle.png",
    prompt:
      "A single vintage circular postmark stamp with faint text and a date. Faded, weathered look. On transparent/white background.",
    width: 200,
    height: 200,
    category: "decoration",
  },
  {
    id: "deco_stamp_rect",
    filename: "stamp-rect.png",
    prompt:
      "A single vintage rectangular postal stamp with decorative border. Faded, weathered. On transparent/white background.",
    width: 300,
    height: 150,
    category: "decoration",
  },
  {
    id: "deco_ticket",
    filename: "ticket.png",
    prompt:
      "A single vintage admission ticket stub with perforated edge and faint text. On transparent/white background.",
    width: 250,
    height: 100,
    category: "decoration",
  },
  {
    id: "deco_coins",
    filename: "coins.png",
    prompt:
      "A small cluster of 3-4 gold coins, slightly overlapping, with subtle shine. On transparent/white background.",
    width: 150,
    height: 150,
    category: "decoration",
  },
  {
    id: "deco_passport_stamp",
    filename: "passport-stamp.png",
    prompt:
      "A single faded passport entry stamp with a country name and date. Circular. On transparent/white background.",
    width: 200,
    height: 200,
    category: "decoration",
  },
  {
    id: "deco_boarding_pass",
    filename: "boarding-pass.png",
    prompt:
      "A miniature boarding pass stub with abstract text lines and a barcode. On transparent/white background.",
    width: 250,
    height: 100,
    category: "decoration",
  },
  {
    id: "deco_star_badge",
    filename: "star-badge.png",
    prompt:
      "A single gold star badge with a ribbon, like a sheriff's star or achievement medal. On transparent/white background.",
    width: 150,
    height: 150,
    category: "decoration",
  },
  {
    id: "deco_wax_seal",
    filename: "wax-seal.png",
    prompt:
      "A single wax seal stamp in burgundy/gold with an abstract monogram. On transparent/white background.",
    width: 150,
    height: 150,
    category: "decoration",
  },
  {
    id: "deco_paper_clip",
    filename: "paper-clip.png",
    prompt:
      "A single gold paper clip, slightly askew. Photorealistic style but with matte, warm lighting. On transparent/white background.",
    width: 100,
    height: 200,
    category: "decoration",
  },
  {
    id: "deco_tape",
    filename: "tape.png",
    prompt:
      "A strip of semi-transparent washi tape in dusty rose with a subtle pattern. On transparent/white background.",
    width: 300,
    height: 60,
    category: "decoration",
  },

  // Category 6: Stylized Card Art
  {
    id: "card_amex_plat",
    filename: "amex-platinum.png",
    prompt:
      "A stylized illustration of a premium metal credit card in silver/platinum tones with subtle centurion imagery. Flat illustration, not photorealistic.",
    width: 340,
    height: 215,
    category: "card-art",
  },
  {
    id: "card_amex_gold",
    filename: "amex-gold.png",
    prompt:
      "A stylized illustration of a gold metal credit card with warm golden tones and subtle embossed pattern. Flat illustration.",
    width: 340,
    height: 215,
    category: "card-art",
  },
  {
    id: "card_chase_csr",
    filename: "chase-sapphire-reserve.png",
    prompt:
      "A stylized illustration of a dark navy/sapphire blue metal credit card with subtle geometric pattern. Flat illustration.",
    width: 340,
    height: 215,
    category: "card-art",
  },
  {
    id: "card_chase_csp",
    filename: "chase-sapphire-preferred.png",
    prompt:
      "A stylized illustration of a medium blue metal credit card with lighter sapphire accents. Flat illustration.",
    width: 340,
    height: 215,
    category: "card-art",
  },
  {
    id: "card_venture_x",
    filename: "venture-x.png",
    prompt:
      "A stylized illustration of a dark charcoal credit card with red accent stripe. Flat illustration.",
    width: 340,
    height: 215,
    category: "card-art",
  },
  {
    id: "card_bilt",
    filename: "bilt.png",
    prompt:
      "A stylized illustration of a minimalist white/cream credit card with black text. Clean, modern. Flat illustration.",
    width: 340,
    height: 215,
    category: "card-art",
  },
  {
    id: "card_amex_hilton",
    filename: "hilton-aspire.png",
    prompt:
      "A stylized illustration of a dark card with purple/navy tones and subtle hotel imagery. Flat illustration.",
    width: 340,
    height: 215,
    category: "card-art",
  },
  {
    id: "card_citi_strata",
    filename: "citi-strata.png",
    prompt:
      "A stylized illustration of a deep navy credit card with Citi-style arc design. Flat illustration.",
    width: 340,
    height: 215,
    category: "card-art",
  },
];

function getAspectRatio(
  width: number,
  height: number
): "16:9" | "1:1" | "9:16" | "3:4" | "4:3" {
  const ratio = width / height;
  if (ratio > 1.4) return "16:9";
  if (ratio > 1.1) return "4:3";
  if (ratio > 0.9) return "1:1";
  if (ratio > 0.6) return "3:4";
  return "9:16";
}

async function generateImage(spec: IllustrationSpec): Promise<boolean> {
  const fullPrompt = `${STYLE_ANCHOR}\n\n${spec.prompt}`;
  const aspectRatio = getAspectRatio(spec.width, spec.height);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio,
        },
      });

      if (response.generatedImages && response.generatedImages[0]) {
        const imageData = response.generatedImages[0].image;
        if (imageData && imageData.imageBytes) {
          const buffer = Buffer.from(imageData.imageBytes, "base64");
          const outputPath = path.join(
            "public",
            "illustrations",
            spec.category,
            spec.filename
          );
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, buffer);
          return true;
        }
      }

      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (attempt === 0) {
        process.stderr.write(`  Retry after error: ${msg}\n`);
        await new Promise((r) => setTimeout(r, 3000));
      } else {
        process.stderr.write(`  FAILED: ${msg}\n`);
        return false;
      }
    }
  }
  return false;
}

async function main() {
  const onlyId = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];
  const specs = onlyId
    ? ILLUSTRATIONS.filter((s) => s.id === onlyId)
    : ILLUSTRATIONS;

  if (onlyId && specs.length === 0) {
    process.stderr.write(`No illustration found with id: ${onlyId}\n`);
    process.stderr.write(
      `Available ids: ${ILLUSTRATIONS.map((s) => s.id).join(", ")}\n`
    );
    process.exit(1);
  }

  let succeeded = 0;
  let failed = 0;

  for (const spec of specs) {
    process.stdout.write(`Generating ${spec.id} (${spec.category}/${spec.filename})... `);
    const ok = await generateImage(spec);
    if (ok) {
      process.stdout.write(`OK\n`);
      succeeded++;
    } else {
      process.stdout.write(`FAILED\n`);
      failed++;
    }
    // Rate limit: 2s between calls
    if (specs.indexOf(spec) < specs.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  process.stdout.write(
    `\nDone. ${succeeded} succeeded, ${failed} failed out of ${specs.length} total.\n`
  );

  if (failed > 0) {
    process.exit(1);
  }
}

main();
