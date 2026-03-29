import { STAND_BATCHES } from "./src/config.js";
import { fetchEventList, findMatchingEvent } from "./src/events.js";
import { formatSeatNo, formatSeatId } from "./src/seats.js";
import { processBatch, tryAddFromBatch } from "./src/cart.js";
import { notifyEventFound, notifyTicketsAddedToCart, notifyApiFailure } from "./src/notify.js";
import { disableSchedulerRule } from "./src/scheduler.js";

export const handler = async (event) => {
  const authToken = process.env.AUTH_TOKEN;
  const teamName = process.env.TEAM_NAME;

  if (!authToken || !teamName) {
    const msg = "Missing required env vars: AUTH_TOKEN and TEAM_NAME";
    console.error(msg);
    return { statusCode: 400, body: msg };
  }

  console.log(`[Bot] Starting ticket bot for team: "${teamName}"`);

  try {
    const events = await fetchEventList(authToken);
    const matchedEvent = findMatchingEvent(events, teamName);
    if (!matchedEvent) {
      const msg = `No event found for team "${teamName}"`;
      console.log(`[Bot] ${msg}`);
      return { statusCode: 200, body: msg };
    }

    await notifyEventFound();
    await disableSchedulerRule();

    for (const batch of STAND_BATCHES) {
      const batchNames = batch.map((s) => s.name).join(" + ");
      console.log(`[Bot] Processing batch: ${batchNames}`);

      const { availableStands } = await processBatch(authToken, matchedEvent, batch);

      if (availableStands.length === 0) {
        console.log(`[Bot] No available seats in batch: ${batchNames}`);
        continue;
      }

      const cartResult = await tryAddFromBatch(authToken, matchedEvent, availableStands);

      if (cartResult?.success) {
        await notifyTicketsAddedToCart(cartResult.stand, cartResult.seats);

        const summary = {
          message: "Tickets added to cart!",
          stand: cartResult.stand,
          strategy: cartResult.strategy,
          partial: cartResult.partial || false,
          seats: cartResult.seats.map((s) => ({
            seatNo: formatSeatNo(s),
            seatId: formatSeatId(s),
            row: s.row,
            seat: s.seat_No,
          })),
        };
        console.log(`[Bot] SUCCESS:`, JSON.stringify(summary, null, 2));
        return { statusCode: 200, body: JSON.stringify(summary) };
      }

      console.log(`[Bot] No tickets added from batch: ${batchNames}`);
    }

    const msg = "No available seats found across any stand";
    console.log(`[Bot] ${msg}`);
    return { statusCode: 200, body: msg };
  } catch (err) {
    console.error(`[Bot] Error:`, err.message);
    await notifyApiFailure();
    await disableSchedulerRule();
    return { statusCode: 200, body: err.message };
  }
};
