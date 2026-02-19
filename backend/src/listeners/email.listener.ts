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

export const initEmailListeners = () => {
  console.log("Email listeners initialized");
};
