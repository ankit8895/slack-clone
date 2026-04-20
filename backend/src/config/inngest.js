import { Inngest } from "inngest";
import { User } from "../models/user.model.js";
import { connectDB } from "./db.js";

export const inngest = new Inngest({ id: "slack-clone" });

// to create/sync user from inngest to mongoDB
const syncUser = inngest.createFunction(
  { id: "sync-user", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    await connectDB();
    const { id, first_name, last_name, image_url, email_addresses } =
      event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      image: image_url,
    };

    await User.create(newUser);
  },
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db", triggers: [{ event: "clerk/user.deleted" }] },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;
    await User.deleteOne({ clerkId: id });
  },
);

export const functions = [syncUser, deleteUserFromDB];
