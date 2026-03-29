import axios from "axios";
import { BASE_URL } from "./config.js";

function getHeaders(authToken) {
  return {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    authorization: `Bearer ${authToken}`,
    origin: "https://shop.royalchallengers.com",
    referer: "https://shop.royalchallengers.com/",
    "sec-ch-ua": '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
  };
}

export async function get(path, authToken) {
  const url = `${BASE_URL}${path}`;
  console.log(`[HTTP] GET ${url}`);
  const { data } = await axios.get(url, { headers: getHeaders(authToken) });
  console.log(`[HTTP] GET ${path} response:`, JSON.stringify(data));
  return data;
}

export async function post(path, authToken, body) {
  const url = `${BASE_URL}${path}`;
  console.log(`[HTTP] POST ${url}`, JSON.stringify(body));
  const { data } = await axios.post(url, body, {
    headers: { ...getHeaders(authToken), "content-type": "application/json" },
  });
  console.log(`[HTTP] POST ${path} response:`, JSON.stringify(data));
  return data;
}
