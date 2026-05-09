import { ENV } from "../constants";

/**
 * Sends a GET request to the specified URL.
 * Uses the native fetch API available in Node.js 18+.
 */
const ping = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Minimal log for unsuccessful ping in case of issues
      console.warn(`Keep-alive ping failed with status: ${response.status}`);
    }
  } catch (error) {
    // Fail silently to avoid cluttering logs with network noise
  }
};

/**
 * Initializes a lightweight cron job that pings the server every 10 minutes
 * to prevent Render free tier from sleeping.
 */
export const initKeepAlive = () => {
  const url = `${ENV.BACKEND_URL}/api/health`;

  // Only run in production to avoid unnecessary pings during development
  if (ENV.NODE_ENV !== "production") {
    return;
  }

  console.log(`⏱️  Keep-alive initialized. Pinging ${url} every 10 minutes.`);

  // Ping immediately on startup to ensure it's working
  ping(url);

  // Set interval for every 10 minutes (600,000 ms)
  setInterval(
    () => {
      ping(url);
    },
    10 * 60 * 1000,
  );
};
