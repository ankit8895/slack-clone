import React from "react";
import { Show, useAuth } from "@clerk/react";
import { Route, Routes, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import CallPage from "./pages/CallPage";
import * as Sentry from "@sentry/react";
import StreamClientProvider from "./providers/StreamClientProvider";

const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);

const App = () => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  return (
    <SentryRoutes>
      <Route
        path="/"
        element={isSignedIn ? <HomePage /> : <Navigate to={"/auth"} replace />}
      />
      <Route
        path="/auth"
        element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace />}
      />
      <Route
        path="/call/:id"
        element={
          isSignedIn ? (
            <StreamClientProvider>
              <CallPage />
            </StreamClientProvider>
          ) : (
            <Navigate to={"/auth"} replace />
          )
        }
      />

      <Route
        path="*"
        element={
          isSignedIn ? (
            <Navigate to={"/"} replace />
          ) : (
            <Navigate to={"/auth"} replace />
          )
        }
      />
    </SentryRoutes>
  );
};

export default App;
