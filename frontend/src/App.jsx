import React from "react";
import { Show } from "@clerk/react";
import { Route, Routes, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";

const App = () => {
  return (
    <>
      <Show when="signed-in">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<Navigate to={"/"} replace />} />
        </Routes>
      </Show>

      <Show when="signed-out">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to={"/auth"} replace />} />
        </Routes>
      </Show>
    </>
  );
};

export default App;
