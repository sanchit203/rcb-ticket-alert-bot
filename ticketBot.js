import "dotenv/config";
import { handler } from "./index.mjs";

handler().then((res) => console.log("\nFinal result:", JSON.stringify(res, null, 2)));
