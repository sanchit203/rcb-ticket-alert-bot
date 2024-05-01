import main from "./app.js";

export const handler = async (event) => {
  const sids = await main();
  const response = {
    statusCode: 200,
    body: JSON.stringify(sids),
  };
  return response;
};