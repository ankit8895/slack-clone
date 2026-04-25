// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router";
// import { useQuery } from "@tanstack/react-query";
// import { useUser } from "@clerk/react";
// import toast from "react-hot-toast";
// import { getStreamToken } from "../lib/api.js";
// import {
//   StreamVideo,
//   StreamVideoClient,
//   StreamCall,
//   CallControls,
//   SpeakerLayout,
//   StreamTheme,
//   CallingState,
//   useCallStateHooks,
// } from "@stream-io/video-react-sdk";

// import "@stream-io/video-react-sdk/dist/css/styles.css";

// const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// const CallPage = () => {
//   const { id: callId } = useParams();
//   const { user, isLoaded } = useUser();

//   const [client, setClient] = useState(null);
//   const [call, setCall] = useState(null);
//   const [isConnecting, setIsConnecting] = useState(true);

//   const { data: tokenData } = useQuery({
//     queryKey: ["streamToken"],
//     queryFn: getStreamToken,
//     enabled: !!user,
//   });

//   useEffect(() => {
//     let isMounted = true;
//     let videoClientRef;
//     let callRef;

//     const initCall = async () => {
//       if (!tokenData?.token || !user || !callId) return;

//       try {
//         const videoClient = new StreamVideoClient({
//           apiKey: STREAM_API_KEY,
//           user: {
//             id: user.id,
//             name: user.fullName,
//             image: user.imageUrl,
//           },
//           token: tokenData.token,
//         });
//         videoClientRef = videoClient;

//         const callInstance = videoClient.call("default", callId);
//         callRef = callInstance;
//         await callInstance.join({ create: true });

//         if (!isMounted) return;
//         setClient(videoClient);
//         setCall(callInstance);
//       } catch (error) {
//         console.log("Error init call:", error);
//         toast.error("Cannot connect to the call");
//       } finally {
//         if (isMounted) setIsConnecting(false);
//       }
//     };

//     initCall();

//     return () => {
//       isMounted = false;
//       try {
//         callRef?.leave?.();
//       } catch {}
//       try {
//         // Disconnect the user/session
//         videoClientRef?.disconnectUser?.();
//         videoClientRef?.destroy?.();
//       } catch {}
//     };
//   }, [tokenData, user, callId]);

//   if (isConnecting || !isLoaded) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         Connecting to call...
//       </div>
//     );
//   }
//   return (
//     <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
//       <div className="relative w-full max-w-4xl mx-auto">
//         {client && call ? (
//           <StreamVideo client={client}>
//             <StreamCall call={call}>
//               <CallContent />
//             </StreamCall>
//           </StreamVideo>
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <p>Could not initialize call. Please refresh or try again later</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const CallContent = () => {
//   const { useCallCallingState } = useCallStateHooks();

//   const callingState = useCallCallingState();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (callingState === CallingState.LEFT) return navigate("/");
//   }, [callingState, navigate]);

//   return (
//     <StreamTheme>
//       <SpeakerLayout />
//       <CallControls />
//     </StreamTheme>
//   );
// };

// export default CallPage;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useUser } from "@clerk/react";
import toast from "react-hot-toast";
import {
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const CallPage = () => {
  const { id: callId } = useParams();
  const { isLoaded } = useUser();
  const client = useStreamVideoClient(); // comes from StreamClientProvider above

  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    if (!client || !callId) return;

    let mounted = true;
    const callInstance = client.call("default", callId);

    callInstance
      .join({ create: true })
      .then(() => {
        if (mounted) setCall(callInstance);
      })
      .catch((err) => {
        console.error("Error joining call:", err);
        toast.error("Cannot connect to the call");
      })
      .finally(() => {
        if (mounted) setIsConnecting(false);
      });

    return () => {
      mounted = false;

      if (callInstance.state.callingState !== CallingState.LEFT)
        callInstance.leave().catch(() => {});
    };
  }, [client, callId]);

  if (!isLoaded || isConnecting) {
    return (
      <div className="h-screen flex items-center justify-center">
        Connecting to call...
      </div>
    );
  }

  if (!call) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Could not initialize call. Please refresh or try again later.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      <StreamCall call={call}>
        <CallContent />
      </StreamCall>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  // navigate() in a useEffect, not during render
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
