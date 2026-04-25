import { useUser } from "@clerk/react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { getStreamToken } from "../lib/api.js";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default function StreamClientProvider({ children }) {
  const { user, isLoaded } = useUser();
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    let mounted = true;

    const initClient = async () => {
      const tokenData = await getStreamToken();

      const streamClient = StreamVideoClient.getOrCreateInstance({
        apiKey: STREAM_API_KEY,
        user: {
          id: user.id,
          name: user.fullName || user.username || user.id,
          image: user.imageUrl,
        },
        token: tokenData.token,
      });

      if (mounted) setClient(streamClient);
    };

    initClient().catch(console.error);

    return () => {
      mounted = false;
      setClient(null); // Only clear local state, nothing else
    };
  }, [isLoaded, user?.id]);

  if (!client) {
    return null;
  }

  return <StreamVideo client={client}>{children}</StreamVideo>;
}
