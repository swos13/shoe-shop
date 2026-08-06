'use server';

import { User } from "next-auth";
import { cookies } from "next/headers";

export async function setUserCookie(user: User) {
    const cookieStore = cookies();
    cookieStore.set(`user_${user.id}`, JSON.stringify(user));
}