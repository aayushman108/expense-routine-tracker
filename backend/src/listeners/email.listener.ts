import { appEmitter, EVENTS } from "../utils/emitter.util";
import { sendMail } from "../utils/sendEmail.util";

// Signup verification email listener
appEmitter.on(
  EVENTS.EMAIL.SIGNUP,
  async (data: { email: string; fullName: string; activationCode: string }) => {
    try {
      await sendMail({
        email: data.email,
        subject: "Verify your email",
        template: "emailActivation.ejs",
        data: {
          username: data.fullName,
          activationCode: data.activationCode,
        },
      });
    } catch (error) {
      console.error("Error sending signup email:", error);
    }
  },
);

// Group invitation email listener
appEmitter.on(
  EVENTS.EMAIL.INVITE,
  async (data: {
    email: string;
    adminName: string;
    adminEmail: string;
    groupName: string;
    inviteLink: string;
  }) => {
    try {
      await sendMail({
        email: data.email,
        subject: `Invitation to join group: ${data.groupName}`,
        template: "groupInvitation.ejs",
        data: {
          adminName: data.adminName,
          adminEmail: data.adminEmail,
          groupName: data.groupName,
          inviteLink: data.inviteLink,
        },
      });
    } catch (error) {
      console.error("Error sending invite email:", error);
    }
  },
);

// Expense verified email listener
appEmitter.on(
  EVENTS.EMAIL.EXPENSE_VERIFIED,
  async (data: {
    emails: string[];
    payerName: string;
    expenseDescription: string;
    totalAmount: string;
    currency: string;
  }) => {
    try {
      // For simplicity, handle it in a loop for each email or sending directly
      const sendPromises = data.emails.map((email) =>
        sendMail({
          email: email,
          subject: `Expense Verified: ${data.expenseDescription}`,
          template: "expenseVerified.ejs",
          data: {
            payerName: data.payerName,
            expenseDescription: data.expenseDescription,
            totalAmount: data.totalAmount,
            currency: data.currency,
          },
        }),
      );
      await Promise.all(sendPromises);
    } catch (error) {
      console.error("Error sending expense verified email:", error);
    }
  },
);

// Forgot password email listener
appEmitter.on(
  EVENTS.EMAIL.FORGOT_PASSWORD,
  async (data: { email: string; fullName: string; resetToken: string }) => {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${data.resetToken}`;
      await sendMail({
        email: data.email,
        subject: "Reset your password",
        template: "forgotPassword.ejs",
        data: {
          username: data.fullName,
          resetUrl,
        },
      });
    } catch (error) {
      console.error("Error sending forgot password email:", error);
    }
  },
);

// Settlement proof uploaded email listener
appEmitter.on(
  EVENTS.EMAIL.SETTLEMENT_UPLOADED,
  async (data: {
    receiverEmail: string;
    receiverName: string;
    payerName: string;
    amount: string;
    currency: string;
  }) => {
    try {
      await sendMail({
        email: data.receiverEmail,
        subject: `Payment proof uploaded by ${data.payerName}`,
        template: "settlementUploaded.ejs",
        data: {
          receiverName: data.receiverName,
          payerName: data.payerName,
          amount: data.amount,
          currency: data.currency,
          dashboardUrl: process.env.FRONTEND_URL + "/dashboard",
        },
      });
    } catch (error) {
      console.error("Error sending settlement proof uploaded email:", error);
    }
  },
);

// Settlement confirmed email listener
appEmitter.on(
  EVENTS.EMAIL.SETTLEMENT_CONFIRMED,
  async (data: {
    payerEmail: string;
    payerName: string;
    receiverName: string;
    amount: string;
    currency: string;
  }) => {
    try {
      await sendMail({
        email: data.payerEmail,
        subject: "Settlement confirmed!",
        template: "settlementConfirmed.ejs",
        data: {
          payerName: data.payerName,
          receiverName: data.receiverName,
          amount: data.amount,
          currency: data.currency,
          dashboardUrl: process.env.FRONTEND_URL + "/dashboard",
        },
      });
    } catch (error) {
      console.error("Error sending settlement confirmed email:", error);
    }
  },
);

export const initEmailListeners = () => {
  console.log("Email listeners initialized");
};
