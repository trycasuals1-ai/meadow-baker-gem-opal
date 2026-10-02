function read(name: string): string | null {
  const value = process.env[name]?.trim() ?? "";
  if (!value || value.length > 200) return null;
  return value;
}

export function contactEmail(): string | null {
  const value = read("CONTACT_EMAIL");
  if (!value || !value.includes("@")) return null;
  return value;
}

export function bitlabsAppToken(): string | null {
  return read("BITLABS_APP_TOKEN");
}

export function lootablyPlacementId(): string | null {
  return read("LOOTABLY_PLACEMENT_ID");
}
