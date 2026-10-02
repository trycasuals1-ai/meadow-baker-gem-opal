import { cleanVisitorId } from "./unlock/ids";

const KEY = "courseunlock.uid";

export function visitorId(): string {
  try {
    const existing = cleanVisitorId(localStorage.getItem(KEY));
    if (existing) return existing;
  } catch {
    /* private mode */
  }
  const id = crypto.randomUUID();
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* the id still works for this page view */
  }
  return id;
}
