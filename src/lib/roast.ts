import { storage } from "@/lib/storage/adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { logEvent } from "@/lib/storage/event-log";
import roastData from "../../data/roasts.json";

interface RoastHistory {
  roasts: Array<{
    text: string;
    generatedAt: string;
    walletScore: number;
  }>;
  dailyCount: number;
  lastDate: string;
}

const MAX_DAILY_ROASTS = 3;

export async function generateRoast(walletScore: number): Promise<{
  text: string;
  limited: boolean;
  remaining: number;
}> {
  const history = await storage.get<RoastHistory>(STORAGE_KEYS.roasts, {
    roasts: [],
    dailyCount: 0,
    lastDate: "",
  });

  const today = new Date().toISOString().split("T")[0];

  // Reset daily counter
  if (history.lastDate !== today) {
    history.dailyCount = 0;
    history.lastDate = today;
  }

  // Check rate limit
  if (history.dailyCount >= MAX_DAILY_ROASTS) {
    return {
      text: "your wallet can only take so much. come back tomorrow.",
      limited: true,
      remaining: 0,
    };
  }

  // Select roast based on score tier
  let pool: string[];
  if (walletScore < 50) {
    pool = roastData.low_score;
  } else if (walletScore < 80) {
    pool = roastData.mid_score;
  } else {
    pool = roastData.high_score;
  }

  // Deterministic-ish selection: use score + daily count as seed
  const index = (walletScore + history.dailyCount) % pool.length;
  const text = pool[index];

  history.dailyCount++;
  history.roasts.push({
    text,
    generatedAt: new Date().toISOString(),
    walletScore,
  });

  // Keep last 20 roasts
  if (history.roasts.length > 20) {
    history.roasts.splice(0, history.roasts.length - 20);
  }

  await storage.set(STORAGE_KEYS.roasts, history);
  logEvent("roast_generated", { text, wallet_score: walletScore });

  return {
    text,
    limited: false,
    remaining: MAX_DAILY_ROASTS - history.dailyCount,
  };
}

export async function getLastRoast(): Promise<string | null> {
  const history = await storage.get<RoastHistory>(STORAGE_KEYS.roasts, {
    roasts: [],
    dailyCount: 0,
    lastDate: "",
  });
  if (history.roasts.length === 0) return null;
  return history.roasts[history.roasts.length - 1].text;
}

export async function hasEverRoasted(): Promise<boolean> {
  const history = await storage.get<RoastHistory>(STORAGE_KEYS.roasts, {
    roasts: [],
    dailyCount: 0,
    lastDate: "",
  });
  return history.roasts.length > 0;
}
