// @ts-check
import * as React from "react";
import { F } from "@grammarly/focal";
import { Form, TextInput, PasswordInput } from "a-plus-forms";

const sendToServer = ({ username, password }) => {
  console.log("servr", username, password);
};

export const Counter = ({ count, onClick }) => {
  return (
    <F.div>
      You have clicked this button {count} time(s).&nbsp;
      <button onClick={onClick}>Click</button>
      <Form onSubmit={sendToServer}>
        <TextInput name="username" label={"Username"} />
        <PasswordInput name="password" label="Password" />
        <button type="submit">Sign In</button>
      </Form>
    </F.div>
  );
};
