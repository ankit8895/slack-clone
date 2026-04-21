import { axiosInstance } from "./axios";

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token"); // axiosInstance already have base urlhence doesn't need to mention full url
  return response.data;
}
