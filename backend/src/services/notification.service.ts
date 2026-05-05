import admin from "firebase-admin";
import { notificationDao } from "../dao/notification.dao";
import { ENV } from "src/constants";

// ── Firebase Admin SDK Initialization ──
// Uses a service account key file or Application Default Credentials.
// Set GOOGLE_APPLICATION_CREDENTIALS env var or place the key in config.

if (!admin.apps.length) {
  try {
    const {
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY,
      FIREBASE_SERVICE_ACCOUNT_KEY,
    } = ENV;

    if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
      // Best fix: Use individual fields. Handles newline escaping in Render/Netlify.
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      console.log("✅ Firebase Admin initialized with individual credentials");
    } else if (FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Fallback: Use the full JSON string
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT_KEY)),
      });
      console.log("✅ Firebase Admin initialized with service account JSON");
    } else {
      // Final fallback: Application Default Credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log("✅ Firebase Admin initialized with Application Default Credentials");
    }
  } catch (error) {
    console.error(
      "❌ Failed to initialize Firebase Admin:",
      error instanceof Error ? error.message : error,
    );
    console.warn("⚠️  Push notifications will not be available.");
  }
}

interface SendNotificationOptions {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

/**
 * Send a push notification to a single user (all their registered devices).
 */
const sendToUser = async (
  userId: string,
  options: SendNotificationOptions,
): Promise<void> => {
  const tokens = await notificationDao.getTokensByUserId(userId);
  if (tokens.length === 0) return;

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: options.title,
      body: options.body,
      ...(options.imageUrl && { imageUrl: options.imageUrl }),
    },
    data: options.data || {},
    webpush: {
      fcmOptions: {
        link: options.data?.url || "/dashboard",
      },
    },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === "messaging/invalid-registration-token" ||
            errorCode === "messaging/registration-token-not-registered"
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      // Remove stale tokens
      for (const token of invalidTokens) {
        await notificationDao.removeToken(token);
      }
    }
  } catch (error) {
    console.error("Error sending notification to user:", userId, error);
  }
};

/**
 * Send a push notification to multiple users.
 */
const sendToUsers = async (
  userIds: string[],
  options: SendNotificationOptions,
): Promise<void> => {
  const tokenRecords = await notificationDao.getTokensByUserIds(userIds);
  if (tokenRecords.length === 0) return;

  const tokens = tokenRecords.map((r) => r.token);

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: options.title,
      body: options.body,
      ...(options.imageUrl && { imageUrl: options.imageUrl }),
    },
    data: options.data || {},
    webpush: {
      fcmOptions: {
        link: options.data?.url || "/dashboard",
      },
    },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === "messaging/invalid-registration-token" ||
            errorCode === "messaging/registration-token-not-registered"
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      for (const token of invalidTokens) {
        await notificationDao.removeToken(token);
      }
    }
  } catch (error) {
    console.error("Error sending notification to users:", error);
  }
};

/**
 * Get notification history for a user.
 */
const getNotifications = async (userId: string) => {
  return await notificationDao.getUserNotifications(userId);
};

/**
 * Mark a notification as read.
 */
const markAsRead = async (notificationId: string, userId: string) => {
  return await notificationDao.markAsRead(notificationId, userId);
};

export const notificationService = {
  sendToUser,
  sendToUsers,
  getNotifications,
  markAsRead,
};
