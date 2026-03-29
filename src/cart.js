import { TICKET_QTY } from "./config.js";
import { post } from "./httpClient.js";
import { fetchSeatList, formatSeatNo, formatSeatId } from "./seats.js";

async function addToCart(authToken, { eventGroupId, eventId, standId, qty, seatNos, seatIds }) {
  const payload = { eventGroupId, eventId, standId, qty, seatNos, seatIds };
  console.log(`[Cart] Adding to cart:`, JSON.stringify(payload));
  const data = await post("/checkout/ticketaddtocart", authToken, payload);
  console.log(`[Cart] Response:`, JSON.stringify(data));
  return data;
}

async function tryAddToCart(authToken, event, stand, availableSeats) {
  if (availableSeats.length < TICKET_QTY) {
    console.log(`[Cart] ${stand.name}: Only ${availableSeats.length} seats available, need ${TICKET_QTY}. Skipping.`);
    return null;
  }

  const baseParams = {
    eventGroupId: event.event_Group_Code,
    eventId: event.event_Code,
    standId: stand.code,
  };

  const seatsToTry = availableSeats.slice(0, TICKET_QTY);

  // Strategy 1: single call with qty=2 and comma-separated values
  console.log(`[Cart] Strategy 1: Single API call with qty=${TICKET_QTY}`);
  try {
    const result = await addToCart(authToken, {
      ...baseParams,
      qty: TICKET_QTY,
      seatNos: seatsToTry.map(formatSeatNo).join(","),
      seatIds: seatsToTry.map(formatSeatId).join(","),
    });
    if (result.status === "Success") {
      console.log(`[Cart] Strategy 1 succeeded for ${stand.name}!`);
      return { success: true, strategy: 1, stand: stand.name, seats: seatsToTry, response: result };
    }
    console.warn(`[Cart] Strategy 1 returned non-success: ${result.message}`);
  } catch (err) {
    console.warn(`[Cart] Strategy 1 failed: ${err.message}`);
  }

  // Strategy 2: separate calls each with qty=1
  console.log(`[Cart] Strategy 2: ${TICKET_QTY} separate API calls with qty=1`);
  const addedSeats = [];
  for (const seat of seatsToTry) {
    try {
      const result = await addToCart(authToken, {
        ...baseParams,
        qty: 1,
        seatNos: formatSeatNo(seat),
        seatIds: formatSeatId(seat),
      });
      if (result.status === "Success") {
        addedSeats.push(seat);
        console.log(`[Cart] Strategy 2: seat ${formatSeatNo(seat)} added`);
      } else {
        console.warn(`[Cart] Strategy 2: seat ${formatSeatNo(seat)} returned: ${result.message}`);
      }
    } catch (err) {
      console.warn(`[Cart] Strategy 2: seat ${formatSeatNo(seat)} failed: ${err.message}`);
    }
  }
  if (addedSeats.length === TICKET_QTY) {
    console.log(`[Cart] Strategy 2 succeeded for ${stand.name}!`);
    return { success: true, strategy: 2, stand: stand.name, seats: addedSeats };
  }
  if (addedSeats.length > 0) {
    console.log(`[Cart] Strategy 2 partially succeeded: ${addedSeats.length}/${TICKET_QTY} for ${stand.name}`);
    return { success: true, strategy: 2, stand: stand.name, seats: addedSeats, partial: true };
  }

  // Strategy 3: iterate over all remaining available seats, refresh list on failure
  console.log(`[Cart] Strategy 3: Trying all available seats with refresh on failure`);
  let currentSeats = [...availableSeats];
  const strategy3Added = [];
  const triedSerials = new Set(seatsToTry.map((s) => s.serial_No));

  for (let i = 0; i < currentSeats.length && strategy3Added.length < TICKET_QTY; i++) {
    const seat = currentSeats[i];
    if (triedSerials.has(seat.serial_No)) continue;
    triedSerials.add(seat.serial_No);

    try {
      const result = await addToCart(authToken, {
        ...baseParams,
        qty: 1,
        seatNos: formatSeatNo(seat),
        seatIds: formatSeatId(seat),
      });
      if (result.status === "Success") {
        strategy3Added.push(seat);
        console.log(`[Cart] Strategy 3: seat ${formatSeatNo(seat)} added (${strategy3Added.length}/${TICKET_QTY})`);
      } else {
        console.warn(`[Cart] Strategy 3: seat ${formatSeatNo(seat)} returned: ${result.message}. Refreshing...`);
        const refreshed = await fetchSeatList(authToken, event.event_Code, stand.code, stand.name);
        const alreadyAdded = new Set(strategy3Added.map((s) => s.serial_No));
        currentSeats = refreshed.filter((s) => !alreadyAdded.has(s.serial_No));
        i = -1;
      }
    } catch (err) {
      console.warn(`[Cart] Strategy 3: seat ${formatSeatNo(seat)} failed: ${err.message}. Refreshing...`);
      const refreshed = await fetchSeatList(authToken, event.event_Code, stand.code, stand.name);
      const alreadyAdded = new Set(strategy3Added.map((s) => s.serial_No));
      currentSeats = refreshed.filter((s) => !alreadyAdded.has(s.serial_No));
      i = -1;
    }
  }

  if (strategy3Added.length > 0) {
    return {
      success: true,
      strategy: 3,
      stand: stand.name,
      seats: strategy3Added,
      partial: strategy3Added.length < TICKET_QTY,
    };
  }

  console.log(`[Cart] All strategies exhausted for ${stand.name}`);
  return null;
}

export async function processBatch(authToken, event, stands) {
  const results = await Promise.all(
    stands.map(async (stand) => {
      const seats = await fetchSeatList(authToken, event.event_Code, stand.code, stand.name);
      return { stand, seats };
    })
  );

  const availableStands = results.filter(({ seats }) => seats.length >= TICKET_QTY);
  return { availableStands, results };
}

export async function tryAddFromBatch(authToken, event, availableStands) {
  for (const { stand, seats } of availableStands) {
    const cartResult = await tryAddToCart(authToken, event, stand, seats);
    if (cartResult?.success) return cartResult;
  }
  return null;
}
