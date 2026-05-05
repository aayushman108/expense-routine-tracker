import { appEmitter, EVENTS } from "../utils/emitter.util";
import { notificationService } from "../services/notification.service";
import { groupDao } from "../dao/group.dao";
import { authDao } from "../dao/auth.dao";
import { notificationDao } from "../dao/notification.dao";

export const initNotificationListeners = () => {
  // Listen for new group expense creation
  appEmitter.on(
    EVENTS.NOTIFICATION.EXPENSE_CREATED,
    async (payload: {
      groupId: string;
      payerId: string;
      totalAmount: number;
      description: string;
      currency: string;
    }) => {
      try {
        const { groupId, payerId, totalAmount, description, currency } =
          payload;

        // 1. Get payer details to personalize the notification
        const payer = await authDao.findById(payerId);
        const payerName = payer?.full_name || "A group member";

        // 2. Get all group members
        const members = await groupDao.getMembers(groupId);

        // 3. Filter out the payer (sender doesn't need a notification)
        const recipientIds = members
          .map((m: any) => m.user_id)
          .filter((id: string) => id !== payerId);

        if (recipientIds.length === 0) {
          return;
        }

        // 4. Save notifications to database for each recipient
        const notificationData = {
          title: "New Expense Added",
          message: `${payerName} added a new expense: "${description}" for ${currency} ${totalAmount}. Please verify it.`,
          type: "EXPENSE_CREATED",
          data: {
            url: `/dashboard/groups/${groupId}?tab=expenses`,
            groupId,
          },
        };

        for (const userId of recipientIds) {
          await notificationDao.createNotification({
            user_id: userId,
            ...notificationData,
          });
        }

        // 5. Send the push notification
        await notificationService.sendToUsers(recipientIds, {
          title: notificationData.title,
          body: notificationData.message,
          data: {
            ...notificationData.data,
            type: notificationData.type,
          },
        });
      } catch (error) {
        console.error(
          "❌ Error in EXPENSE_CREATED notification listener:",
          error,
        );
      }
    },
  );

  // Listen for member added to group
  appEmitter.on(
    EVENTS.NOTIFICATION.MEMBER_ADDED,
    async (payload: {
      groupId: string;
      groupName: string;
      addedByUserId: string;
      addedByName: string;
      newMemberId: string;
    }) => {
      try {
        const { groupId, groupName, addedByName, newMemberId } = payload;

        const notificationData = {
          title: "Added to Group",
          message: `${addedByName} added you to the group "${groupName}".`,
          type: "MEMBER_ADDED",
          data: {
            url: `/dashboard/groups/${groupId}`,
            groupId,
          },
        };

        await notificationDao.createNotification({
          user_id: newMemberId,
          ...notificationData,
        });

        await notificationService.sendToUser(newMemberId, {
          title: notificationData.title,
          body: notificationData.message,
          data: {
            ...notificationData.data,
            type: notificationData.type,
          },
        });
      } catch (error) {
        console.error("❌ Error in MEMBER_ADDED notification listener:", error);
      }
    },
  );

  // Listen for expense updates
  appEmitter.on(
    EVENTS.NOTIFICATION.EXPENSE_UPDATED,
    async (payload: {
      groupId: string;
      updaterId: string;
      expenseId: string;
      description: string;
    }) => {
      try {
        const { groupId, updaterId, description } = payload;
        const updater = await authDao.findById(updaterId);
        const updaterName = updater?.full_name || "A group member";

        const members = await groupDao.getMembers(groupId);
        const recipientIds = members
          .map((m: any) => m.user_id)
          .filter((id: string) => id !== updaterId);

        if (recipientIds.length === 0) return;

        const notificationData = {
          title: "Expense Updated",
          message: `${updaterName} updated the expense: "${description}".`,
          type: "EXPENSE_UPDATED",
          data: {
            url: `/dashboard/groups/${groupId}?tab=expenses`,
            groupId,
          },
        };

        for (const userId of recipientIds) {
          await notificationDao.createNotification({
            user_id: userId,
            ...notificationData,
          });
        }

        await notificationService.sendToUsers(recipientIds, {
          title: notificationData.title,
          body: notificationData.message,
          data: {
            ...notificationData.data,
            type: notificationData.type,
          },
        });
      } catch (error) {
        console.error(
          "❌ Error in EXPENSE_UPDATED notification listener:",
          error,
        );
      }
    },
  );

  // Listen for expense deletion
  appEmitter.on(
    EVENTS.NOTIFICATION.EXPENSE_DELETED,
    async (payload: {
      groupId: string;
      deleterId: string;
      description: string;
    }) => {
      try {
        const { groupId, deleterId, description } = payload;
        const deleter = await authDao.findById(deleterId);
        const deleterName = deleter?.full_name || "A group member";

        const members = await groupDao.getMembers(groupId);
        const recipientIds = members
          .map((m: any) => m.user_id)
          .filter((id: string) => id !== deleterId);

        if (recipientIds.length === 0) return;

        const notificationData = {
          title: "Expense Deleted",
          message: `${deleterName} deleted the expense: "${description}".`,
          type: "EXPENSE_DELETED",
          data: {
            url: `/dashboard/groups/${groupId}?tab=expenses`,
            groupId,
          },
        };

        for (const userId of recipientIds) {
          await notificationDao.createNotification({
            user_id: userId,
            ...notificationData,
          });
        }

        await notificationService.sendToUsers(recipientIds, {
          title: notificationData.title,
          body: notificationData.message,
          data: {
            ...notificationData.data,
            type: notificationData.type,
          },
        });
      } catch (error) {
        console.error(
          "❌ Error in EXPENSE_DELETED notification listener:",
          error,
        );
      }
    },
  );

  // Listen for expense verification (fully verified)
  appEmitter.on(
    EVENTS.NOTIFICATION.EXPENSE_VERIFIED,
    async (payload: {
      groupId: string;
      expenseId: string;
      description: string;
      payerId: string;
    }) => {
      try {
        const { groupId, description } = payload;

        const members = await groupDao.getMembers(groupId);
        const recipientIds = members.map((m: any) => m.user_id);

        if (recipientIds.length === 0) return;

        const notificationData = {
          title: "Expense Verified",
          message: `Expense "${description}" is now fully verified. You can proceed with settlements.`,
          type: "EXPENSE_VERIFIED",
          data: {
            url: `/dashboard/groups/${groupId}?tab=settlements`,
            groupId,
          },
        };

        for (const userId of recipientIds) {
          await notificationDao.createNotification({
            user_id: userId,
            ...notificationData,
          });
        }

        await notificationService.sendToUsers(recipientIds, {
          title: notificationData.title,
          body: notificationData.message,
          data: {
            ...notificationData.data,
            type: notificationData.type,
          },
        });
      } catch (error) {
        console.error(
          "❌ Error in EXPENSE_VERIFIED notification listener:",
          error,
        );
      }
    },
  );

  // Listen for settlement paid
  appEmitter.on(
    EVENTS.NOTIFICATION.SETTLEMENT_PAID,
    async (payload: {
      groupId: string;
      payerId: string;
      receiverId: string;
      amount: number;
      currency: string;
    }) => {
      try {
        const { groupId, payerId, receiverId, amount, currency } = payload;
        const payer = await authDao.findById(payerId);
        const payerName = payer?.full_name || "A group member";

        const notificationData = {
          title: "Settlement Payment Received",
          message: `${payerName} paid you ${currency} ${amount} and is waiting for your confirmation.`,
          type: "SETTLEMENT_PAID",
          data: {
            url: `/dashboard/groups/${groupId}?tab=settlements`,
            groupId,
          },
        };

        await notificationDao.createNotification({
          user_id: receiverId,
          ...notificationData,
        });

        await notificationService.sendToUser(receiverId, {
          title: notificationData.title,
          body: notificationData.message,
          data: {
            ...notificationData.data,
            type: notificationData.type,
          },
        });
      } catch (error) {
        console.error(
          "❌ Error in SETTLEMENT_PAID notification listener:",
          error,
        );
      }
    },
  );

  // Listen for settlement confirmed
  appEmitter.on(
    EVENTS.NOTIFICATION.SETTLEMENT_CONFIRMED,
    async (payload: {
      groupId: string;
      payerId: string;
      receiverId: string;
      confirmedBy: string;
      amount: number;
      currency: string;
    }) => {
      try {
        const { groupId, receiverId, payerId, amount, currency } = payload;
        const receiver = await authDao.findById(receiverId);
        const receiverName = receiver?.full_name || "A group member";

        const notificationData = {
          title: "Settlement Confirmed",
          message: `${receiverName} confirmed your payment of ${currency} ${amount}.`,
          type: "SETTLEMENT_CONFIRMED",
          data: {
            url: `/dashboard/groups/${groupId}?tab=settlements`,
            groupId,
          },
        };

        await notificationDao.createNotification({
          user_id: payerId,
          ...notificationData,
        });

        await notificationService.sendToUser(payerId, {
          title: notificationData.title,
          body: notificationData.message,
          data: {
            ...notificationData.data,
            type: notificationData.type,
          },
        });
      } catch (error) {
        console.error(
          "❌ Error in SETTLEMENT_CONFIRMED notification listener:",
          error,
        );
      }
    },
  );
};
