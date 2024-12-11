import User from "@/modals/user.modal";
import { connect } from "@/db";

export async function heartRefillJob() {
  try {
    await connect(); 

    const MAX_HEARTS = 5;

    const now = new Date();

    await User.updateMany(
      {
        userHearts: { $lt: MAX_HEARTS }, 
        lastHeartUpdate: { $lte: new Date(now.getTime() - 5 * 60 * 1000) }, 
      },
      {
        $inc: { userHearts: 1 }, 
        $set: { lastHeartUpdate: now }, 
      }
    );

    console.log("Heart refill job executed successfully.");
  } catch (error) {
    console.error("Error running heart refill job:", error);
  }
}
