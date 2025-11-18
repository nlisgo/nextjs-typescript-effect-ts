'use client';

import { Option } from 'effect';
import { JSX, PropsWithChildren, useState } from 'react';
import { Header } from '../Header/Header';
import './page.css';

type User = Option.Option<{
  name: string,
}>;

export const Page = ({ children }: PropsWithChildren): JSX.Element => {
  const [user, setUser] = useState<User>();

  return (
    <>
      <Header
        user={user ?? Option.none()}
        onLogin={() => setUser(Option.some({ name: 'Jane Doe' }))}
        onLogout={() => setUser(Option.none())}
        onCreateAccount={() => setUser(Option.some({ name: 'Jane Doe' }))}
      />

      <section className="content-wrapper">
        {children}
      </section>
    </>
  );
};
