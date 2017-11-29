// @ts-check
import * as React from "react";
import { F, lift } from "@grammarly/focal";
import { Form, TextInput, PasswordInput } from "a-plus-forms";
import { ImageButton } from "components/image-button";

export const UserPanel = lift(
  ({ userName, login, logout }) =>
    userName ? (
      <F.div>
        {userName}
        <Form onSubmit={logout}>
          <ImageButton className="sock-btn" alt="Logout" />
        </Form>
      </F.div>
    ) : (
      <Form onSubmit={login}>
        <TextInput name="userName" label="Username" />
        <PasswordInput name="password" label="Password" />
        <ImageButton className="sock-btn" alt="Login" />
      </Form>
    )
);
