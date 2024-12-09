import User from "@/modals/user.modal";
import { connect } from "@/db";

export async function heartRefillJob() {
  try {
    await connect();

    // Define the maximum number of hearts
    const MAX_HEARTS = 5;

    // Update all users who need heart refill
    const now = new Date();
    await User.updateMany(
      {
        userHearts: { $lt: MAX_HEARTS }, // Users with less than max hearts
        lastHeartUpdate: { $lte: new Date(now.getTime() - 5 * 60 * 1000) }, // Last update more than 5 minutes ago
      },
      {
        $inc: { userHearts: 1 }, // Increment hearts by 1
        $set: { lastHeartUpdate: now }, // Update the last heart update time
      }
    );

    console.log("Heart refill job executed successfully.");
  } catch (error) {
    console.error("Error running heart refill job:", error);
  }
}
