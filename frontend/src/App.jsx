import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import React from "react";

const App = () => {
  return (
    <>
      <header>
        <Show when="signed-out">
          <SignInButton mode="modal" />
          <SignUpButton mode="modal" />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </>
  );
};

export default App;
