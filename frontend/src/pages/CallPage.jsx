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
  console.log("Stream client from context:", client);
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
