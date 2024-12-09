import User from "@/modals/user.modal";
import { connect } from "@/db";

export async function heartRefillJob() {
  try {
    await connect(); // Ensure MongoDB connection is established

    // Define the maximum number of hearts
    const MAX_HEARTS = 5;

    // Get the current time
    const now = new Date();

    // Update all users who need a heart refill
    await User.updateMany(
      {
        userHearts: { $lt: MAX_HEARTS }, // Users with less than 5 hearts
        lastHeartUpdate: { $lte: new Date(now.getTime() - 5 * 60 * 1000) }, // Last update was more than 5 minutes ago
      },
      {
        $inc: { userHearts: 1 }, // Increment the heart count by 1
        $set: { lastHeartUpdate: now }, // Update the last heart update timestamp
      }
    );

    console.log("Heart refill job executed successfully.");
  } catch (error) {
    console.error("Error running heart refill job:", error);
  }
}
