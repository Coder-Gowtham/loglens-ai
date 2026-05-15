import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";

console.log("Trust proxy from server.js:", app.get("trust proxy"));


app.listen(env.port, () => {
  console.log(`LogLens AI backend running on http://localhost:${env.port}`);
});