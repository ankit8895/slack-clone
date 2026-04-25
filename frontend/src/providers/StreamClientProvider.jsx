// frontend/src/providers/StreamClientProvider.jsx
import { useUser } from "@clerk/react";
import { useEffect, useState } from "react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { getStreamToken } from "../lib/api.js";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default function StreamClientProvider({ children }) {
  const { user, isLoaded } = useUser();
  const [client, setClient] = useState(null);

  useEffect(() => {
    // Wait for Clerk to load and user to be available
    if (!isLoaded || !user) return;

    // tokenProvider lets Stream handle token refresh automatically
    const tokenProvider = async () => {
      const data = await getStreamToken(); // hits /chat/token via axiosInstance
      return data.token;
    };

    // getOrCreateInstance prevents duplicate clients (safe in StrictMode)
    const streamClient = StreamVideoClient.getOrCreateInstance({
      apiKey: STREAM_API_KEY,
      user: {
        id: user.id,
        name: user.fullName || user.username || user.id,
        image: user.imageUrl,
      },
      tokenProvider,
    });

    setClient(streamClient);

    return () => {
      streamClient.disconnectUser().catch(console.error);
      setClient(null);
    };
  }, [isLoaded, user?.id]);

  // Don't render children until client is ready
  if (!client) return null;

  return <StreamVideo client={client}>{children}</StreamVideo>;
}
