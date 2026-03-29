import { get } from "./httpClient.js";

export async function fetchEventList(authToken) {
  console.log("[Events] Fetching event list...");
  const data = await get("/ticket/eventlist/O", authToken);
  const events = data.result || [];
  console.log(`[Events] Found ${events.length} event(s)`);
  return events;
}

export function findMatchingEvent(events, teamName) {
  const needle = teamName.trim().toLowerCase();
  const match = events.find(
    (e) =>
      e.team_1?.trim().toLowerCase().includes(needle) ||
      e.team_2?.trim().toLowerCase().includes(needle)
  );
  if (!match) return null;
  console.log(`[Events] Matched: "${match.event_Name}" (event_Code=${match.event_Code})`);
  return match;
}
