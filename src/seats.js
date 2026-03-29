import { VENUE_CODE } from "./config.js";
import { get } from "./httpClient.js";

export async function fetchSeatList(authToken, eventCode, standCode, standName) {
  console.log(`[Seats] Fetching seat list for ${standName} (code=${standCode})...`);
  const data = await get(`/ticket/seatlist/${VENUE_CODE}/${eventCode}/${standCode}`, authToken);
  if (data.status !== "Success") {
    console.warn(`[Seats] ${standName} API returned status: ${data.status}`);
    return [];
  }
  const allSeats = data.result || [];
  const available = allSeats.filter((s) => s.status === "O" && s.bucket === "O");
  console.log(`[Seats] ${standName}: ${available.length} available out of ${allSeats.length} total`);
  return available;
}

export function formatSeatNo(seat) {
  return `${seat.row}-${seat.seat_No}`;
}

export function formatSeatId(seat) {
  return String(seat.serial_No);
}
