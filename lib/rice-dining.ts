export type Meal = "Lunch" | "Dinner";
export type DietTag = "V" | "VG" | "GF" | "H";

export type MenuItem = {
  name: string;
  tags: DietTag[];
  note: string;
  tone: "coral" | "gold" | "green";
};

export type RiceMenu = Record<Meal, Record<string, MenuItem[]>>;

export type MenuFetchResult = {
  source: string;
  fetchedAt: string;
  live: boolean;
  menus: RiceMenu;
  warning?: string;
};

const source = process.env.RICE_DINING_SOURCE_URL ?? "https://dining.rice.edu";
const serverySources = {
  North: `${source}/north-servery`,
  West: `${source}/west-servery`,
  South: `${source}/south-servery`,
  Seibel: `${source}/seibel-servery`,
  "South Main": `${source}/south-main-servery`
} as const;

export const demoMenus: RiceMenu = {
  Lunch: {
    North: [
      { name: "Grilled salmon", tags: ["GF"], note: "lemon herb butter", tone: "coral" },
      { name: "Lentil curry", tags: ["VG", "V"], note: "coconut, tomato, basmati", tone: "gold" },
      { name: "Roasted squash", tags: ["V", "GF"], note: "sage + pepitas", tone: "green" }
    ],
    West: [
      { name: "Falafel bowl", tags: ["V"], note: "hummus, pickled onion", tone: "gold" },
      { name: "Tomato bisque", tags: ["VG"], note: "basil oil, sourdough", tone: "coral" }
    ],
    South: [
      { name: "Chicken tenders", tags: [], note: "house honey mustard", tone: "coral" },
      { name: "Cauliflower fried rice", tags: ["V", "GF"], note: "sesame, scallion", tone: "green" }
    ],
    Baker: [
      { name: "Mushroom risotto", tags: ["V", "GF"], note: "parmesan, crispy herbs", tone: "green" },
      { name: "Sweet potato fries", tags: ["V"], note: "smoked paprika", tone: "gold" }
    ]
  },
  Dinner: {
    North: [
      { name: "Lunar New Year dumplings", tags: ["V"], note: "vegetable + ginger", tone: "coral" },
      { name: "Lion's head meatballs", tags: [], note: "soy glaze, bok choy", tone: "gold" },
      { name: "Red bean soup", tags: ["VG", "GF"], note: "warm sesame, citrus", tone: "coral" }
    ],
    West: [
      { name: "Pork chops", tags: ["GF"], note: "apple mustard jus", tone: "coral" },
      { name: "Stir-fry noodles", tags: ["V"], note: "ginger, snow peas", tone: "gold" }
    ],
    South: [
      { name: "Crispy tofu", tags: ["V", "GF"], note: "chili crisp, cucumber", tone: "green" },
      { name: "Caesar salad", tags: [], note: "parmesan, sourdough", tone: "green" }
    ],
    Baker: [
      { name: "Braised beef", tags: [], note: "red wine gravy", tone: "coral" },
      { name: "Herbed polenta", tags: ["V", "GF"], note: "roasted tomato", tone: "gold" }
    ]
  }
};

function tagFor(text: string): DietTag | null {
  const value = text.toLowerCase();
  if (value.includes("vegan")) return "VG";
  if (value.includes("vegetarian")) return "V";
  if (value.includes("gluten")) return "GF";
  if (value.includes("halal")) return "H";
  return null;
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMealSection(section: string): MenuItem[] {
  return Array.from(section.matchAll(/<div class=["']mname["'][^>]*>([\s\S]*?)<\/div>([\s\S]*?)<\/a>/gi))
    .map((match) => {
      const name = decodeHtml(match[1]);
      const tags = Array.from(match[2].matchAll(/data-content=["']([^"']+)["']/gi))
        .map((tag) => tagFor(decodeHtml(tag[1])))
        .filter((tag): tag is DietTag => Boolean(tag));
      return {
        name,
        tags,
        note: "Rice Dining menu",
        tone: (tags.includes("VG") || tags.includes("V") ? "green" : "coral") as MenuItem["tone"]
      };
    })
    .filter((item) => item.name.length > 0);
}

function parseMenuFromHtml(html: string, servery: string): Partial<RiceMenu> | null {
  const dailyBlock = html.match(/<div id=["']block-weeklymenubystations["'][\s\S]*?<div id=["']block-weeklylunch["']/i)?.[0];
  if (!dailyBlock) return null;
  const sections = Array.from(dailyBlock.matchAll(/<h2>\s*(LUNCH|DINNER)\s*<\/h2>([\s\S]*?)(?=<h2>\s*(?:LUNCH|DINNER)\s*<\/h2>|$)/gi));
  const result: Partial<RiceMenu> = {};
  for (const section of sections.slice(0, 2)) {
    const meal = section[1].toLowerCase() === "lunch" ? "Lunch" : "Dinner";
    const items = parseMealSection(section[2]);
    if (items.length) result[meal] = { [servery]: items };
  }
  return Object.keys(result).length ? result : null;
}

export async function fetchRiceMenus(): Promise<MenuFetchResult> {
  const fetchedAt = new Date().toISOString();

  try {
    const responses = await Promise.all(
      Object.entries(serverySources).map(async ([servery, url]) => {
        const response = await fetch(url, {
          headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "OwlEats/0.1 (+Rice Dining menu preview)" },
          next: { revalidate: 3600 }
        });
        if (!response.ok) throw new Error(`${servery} returned HTTP ${response.status}`);
        return parseMenuFromHtml(await response.text(), servery);
      })
    );
    const menus: RiceMenu = { Lunch: {}, Dinner: {} };
    for (const parsed of responses) {
      if (parsed?.Lunch) Object.assign(menus.Lunch, parsed.Lunch);
      if (parsed?.Dinner) Object.assign(menus.Dinner, parsed.Dinner);
    }
    if (!Object.keys(menus.Lunch).length && !Object.keys(menus.Dinner).length) {
      throw new Error("No daily menu items were found in the Rice Dining pages");
    }
    return { source, fetchedAt, live: true, menus };
  } catch (error) {
    return {
      source,
      fetchedAt,
      live: false,
      menus: demoMenus,
      warning: error instanceof Error ? error.message : "Rice Dining menu fetch failed"
    };
  }
}
