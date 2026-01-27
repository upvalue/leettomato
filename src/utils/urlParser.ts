export function extractSlugFromUrl(url: string): string | null {
  const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
  return match ? match[1].toLowerCase() : null;
}

export function buildLeetCodeUrl(slug: string): string {
  return `https://leetcode.com/problems/${slug}/`;
}
