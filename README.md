# RCB Ticket Bot

Automatically finds available RCB match tickets and adds them to cart. Sends notifications via Twilio Studio Flow when a match is found, tickets are available, and when they're added to cart.

## Prerequisites
- Node.js installed on your machine
- AWS Lambda (for deployment) or run locally

## Environment Variables

| Variable Name      | Description                                                        | Example Value              |
|--------------------|--------------------------------------------------------------------|----------------------------|
| AUTH_TOKEN         | Bearer token from shop.royalchallengers.com (grab from browser Network tab) | `D3QuB2x1LJLm...`         |
| TEAM_NAME          | Team name to match against event list                              | `Sunrisers Hyderabad`      |
| TWILIO_ACCOUNT_SID | SID of Twilio account                                              | `ABCDEFGHIJ019283XYZ`      |
| TWILIO_AUTH_TOKEN  | Auth token of Twilio account                                       | `ABCDEFGHIJ019283XYZ`      |
| CALL_FROM_NUMBER   | Twilio number to send from                                         | `+1234567890`              |
| NOTIFY_NUMBER              | Phone number to notify                                  | `+1234567890`              |
| FLOW_TICKET_AVAILABLE      | Twilio Studio Flow SID for event-found notification     | `FWafd14a619ff09dfb...`    |
| FLOW_TICKET_ADDED_TO_CART  | Twilio Studio Flow SID for added-to-cart notification   | `FWddf205f0aa5684...`      |
| FLOW_API_FAILURE           | Twilio Studio Flow SID for API failure notification     | `FW76c70d80f7a0e5...`      |
| SCHEDULER_RULE_NAME        | EventBridge rule name to disable after success          | `rcb-ticket-bot-schedule`  |

## Project Structure

```
index.mjs             — Lambda handler (entry point)
ticketBot.js          — Local runner (loads .env, calls handler)
src/
  config.js           — Constants, stand definitions, batch order
  httpClient.js       — Shared axios client with RCB API headers
  events.js           — Event list fetching and team matching
  seats.js            — Seat availability fetching and formatting
  cart.js             — Add-to-cart API + retry strategies + batch processing
  notify.js           — Twilio Studio Flow notifications
  scheduler.js        — Disables EventBridge rule after successful cart add
```

## Running

Locally (with `.env` file):
```bash
npm run bot
```

As AWS Lambda: deploy with `index.handler` as the entry point. Set env vars in Lambda configuration.

The bot will automatically notify via Twilio Studio Flow when:
1. A matching **event is found** for the team
2. Tickets are successfully **added to cart**

After tickets are added to cart, the bot disables its own EventBridge scheduler rule to stop further invocations. The Lambda's IAM role needs `events:DisableRule` permission for this to work.
