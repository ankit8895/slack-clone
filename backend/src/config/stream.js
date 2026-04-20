import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

const streamcClient = StreamChat.getInstance(
  ENV.STREAM_API_KEY,
  ENV.STREAM_SECRET_KEY,
);

export const upsertStreamUser = async (userData) => {
  try {
    await streamcClient.upsertUser(userData);
    console.log("Stream user upserted successfully:", userData.name);
    return userData;
  } catch (error) {
    console.log("Error upserting Stream user:", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await streamcClient.deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting Stream user:", error);
  }
};

// for stream authentication
export const generateStreamToken = (userId) => {
  try {
    const userIdString = userId.toString();
    return streamcClient.createToken(userIdString);
  } catch (error) {
    console.log("Error generating stream token:", error);
    return null;
  }
};
