import 'dotenv/config'
import twilio from "twilio";


const makeCall = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    const numbersToCall = process.env.NUMBERS_TO_CALL.split(", ");

    const callsPromises = numbersToCall.map(number =>
        client.calls.create({
            url: "http://demo.twilio.com/docs/voice.xml",
            to: number,
            from: process.env.CALL_FROM_NUMBER,
        })
    );

    const sids = [];

    Promise.all(callsPromises)
        .then(calls => {
            calls.forEach(call => sids.push(call.sid));
        })
        .catch(error => console.error("Error making calls:", error));

    return sids;
}

export default makeCall;