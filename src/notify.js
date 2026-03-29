import twilio from "twilio";

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    console.warn("[Notify] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set, skipping notification");
    return null;
  }
  return twilio(accountSid, authToken);
}

async function triggerFlow(flowSid, label) {
  const client = getClient();
  if (!client) return null;

  const from = process.env.CALL_FROM_NUMBER;
  const to = process.env.NOTIFY_NUMBER;

  if (!from || !to) {
    console.warn("[Notify] CALL_FROM_NUMBER or NOTIFY_NUMBER not configured, skipping notification");
    return null;
  }

  console.log(`[Notify] Triggering ${label} flow to ${to}`);
  try {
    const execution = await client.studio.v2
      .flows(flowSid)
      .executions.create({ to, from });
    console.log(`[Notify] ${label} execution started (sid=${execution.sid})`);
    return execution.sid;
  } catch (err) {
    console.error(`[Notify] ${label} execution failed: ${err.message}`);
    return null;
  }
}

export async function notifyEventFound() {
  console.log("[Notify] Event matched — sending notification");
  return triggerFlow(process.env.FLOW_TICKET_AVAILABLE, "ticket-available");
}

export async function notifyApiFailure() {
  console.log("[Notify] API failure — sending notification");
  return triggerFlow(process.env.FLOW_API_FAILURE, "api-failure");
}

export async function notifyTicketsAddedToCart(standName, seats) {
  const seatList = seats.map((s) => `${s.row}-${s.seat_No}`).join(", ");
  console.log(`[Notify] Tickets added to cart in ${standName} (${seatList}) — sending notification`);
  return triggerFlow(process.env.FLOW_TICKET_ADDED_TO_CART, "ticket-added-to-cart");
}
