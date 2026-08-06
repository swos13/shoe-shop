'use client';

import { User } from 'next-auth';

export function getUser(userId: number) {
  const user = localStorage.getItem(`user_${userId}`);

  if (!user) return false;

  return JSON.parse(user) as User;
}

export function setUser(user: User) {
  localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
}
