/**
 * Merge class names, filtering out falsy values
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Get issuer display name
 */
export function getIssuerName(issuer: string): string {
  const names: Record<string, string> = {
    amex: "American Express",
    chase: "Chase",
    citi: "Citi",
    capital_one: "Capital One",
    bilt: "Bilt",
    barclays: "Barclays",
    us_bank: "US Bank",
  };
  return names[issuer] || issuer;
}

/**
 * Get category display label
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    dining: "Dining",
    travel: "Travel",
    streaming: "Streaming",
    shopping: "Shopping",
    rideshare: "Rideshare",
    wellness: "Wellness",
    airline: "Airline",
    hotel: "Hotel",
    entertainment: "Entertainment",
    other: "Other",
  };
  return labels[category] || category;
}

/**
 * Get category icon (Lucide icon name)
 */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    dining: "utensils",
    travel: "plane",
    streaming: "tv",
    shopping: "shopping-bag",
    rideshare: "car",
    wellness: "heart",
    airline: "plane",
    hotel: "building",
    entertainment: "music",
    other: "circle",
  };
  return icons[category] || "circle";
}
