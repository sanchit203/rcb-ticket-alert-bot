import axios from "axios";
import 'dotenv/config'
import makeCall from "./makeCall.js";

const main = async () => {
    const response = (await axios.get(process.env.URL_TO_PING)).data.toLowerCase();
    if(response.includes(process.env.DATE_TO_CHECK.toLowerCase())) {
        return makeCall();
    } else {
        console.log("Tickets not found yet!");
        return [];
    }
}

export default main;

main();