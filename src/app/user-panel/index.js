import * as React from "react";
import { F, lift } from "@grammarly/focal";
import { Form, TextInput, PasswordInput } from "a-plus-forms";

export const UserPanel = lift(
  ({ userName, login, logout, search }) =>
    userName ? (
      <F.div>
        {userName}
        <Form onSubmit={logout}>
          <button>Logout</button>
        </Form>
      </F.div>
    ) : (
      <Form onSubmit={login}>
        <TextInput name="userName" label="Username" onChange={search} />
        <PasswordInput name="password" label="Password" />
        <button>Login</button>
      </Form>
    ),
);
