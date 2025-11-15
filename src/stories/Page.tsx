'use client';

import { JSX, PropsWithChildren, useState } from 'react';

import { Header } from './Header';
import './page.css';

type User = {
  name: string,
};

export const Page = ({ children }: PropsWithChildren): JSX.Element => {
  const [user, setUser] = useState<User>();

  return (
    <article>
      <Header
        user={user}
        onLogin={() => setUser({ name: 'Jane Doe' })}
        onLogout={() => setUser(undefined)}
        onCreateAccount={() => setUser({ name: 'Jane Doe' })}
      />

      <section className="storybook-page">
        {children}
      </section>
    </article>
  );
};
