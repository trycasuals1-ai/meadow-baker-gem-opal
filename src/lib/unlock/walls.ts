export function bitlabsWallUrl(token: string, visitorId: string): string {
  const url = new URL("https://web.bitlabs.ai/");
  url.searchParams.set("uid", visitorId);
  url.searchParams.set("token", token);
  return url.toString();
}

export function lootablyWallUrl(placementId: string, visitorId: string): string {
  const url = new URL("https://wall.lootably.com/");
  url.searchParams.set("placementID", placementId);
  url.searchParams.set("sid", visitorId);
  return url.toString();
}
