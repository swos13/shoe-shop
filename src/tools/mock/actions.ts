'use server';

import { User } from "next-auth";
import { cookies } from "next/headers";
import mockUsersData from '~/mock-data/mock-users.json';

export async function setUserCookie(user: User) {
    const cookieStore = cookies();
    cookieStore.set(`user_${user.id}`, JSON.stringify(user));
}

export async function createUser(
    firstName: string,
    email: string,
    password: string
) {

    const cookieStore = cookies();
    const usersCount = cookieStore.get('mockUsersCount')?.value;

    if (!usersCount) return false;
    const usersAmount = JSON.parse(usersCount);

    if (mockUsersData.users.find(user => user.data.user.email === email))
        throw new Error('Account registered with this email already exists.')

    for (let i = 2; i < usersAmount; i++) {
        const checkedUser = cookieStore.get(`user_${i + 1}`)?.value;

        if (checkedUser && (JSON.parse(checkedUser) as User).email === email)
            throw new Error('Account registered with this email already exists.')
    }
    const newId = usersAmount + 1;

    const newUser = {
        "id": newId,
        "username": firstName,
        "password": password,
        "firstName": firstName,
        "lastName": "",
        "email": email,
        "phoneNumber": "",
    };

    cookieStore.set(`user_${newId}`, JSON.stringify(newUser));
    cookieStore.set('mockUsersCount', JSON.stringify(newId));

    return newUser;
}