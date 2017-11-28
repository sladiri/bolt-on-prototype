// @ts-check
import * as React from "react";
import { F, lift } from "@grammarly/focal";
import { Form, TextInput, PasswordInput } from "a-plus-forms";

export const UserPanel = lift(
  ({ userName, login, logout }) =>
    userName ? (
      <F.div>
        {userName}
        <Form onSubmit={logout}>
          <button>Sign Out</button>
        </Form>
      </F.div>
    ) : (
      <Form onSubmit={login}>
        <TextInput name="userName" label="Username" />
        <PasswordInput name="password" label="Password" />
        <button>Sign In</button>
      </Form>
    )
);
