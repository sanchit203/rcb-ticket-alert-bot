# RCB TICKET ALERT BOT

## Local Setup

### Prerequisites
- Node.js installed on your machine

### Environment Variables
| Variable Name     | Description                               | Example Value       |
|-------------------|-------------------------------------------|----------------------|
| CALL_FROM_NUMBER  | Number given by Twilio to make calls     | +1234567890          |
| NUMBERS_TO_CALL   | Comma-separated Twilio verified numbers  | +1234567890, +1234567890, +1234567890 |
| DATE_TO_CHECK     | Date of ticket for which alert is needed | May 12               |
| TWILIO_ACCOUNT_SID| SID of Twilio account                    | ABCDEFGHIJ019283XYZ |
| TWILIO_AUTH_TOKEN | Auth token of Twilio account             | ABCDEFGHIJ019283XYZ |
| URL_TO_PING       | RCB Website URL                          | https://shop.royalchallengers.com/ticket |

Ensure you fill in the appropriate values for each environment variable before running the application.