'use client';

import { useMutation } from '@tanstack/react-query';
import { SignInResponse, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';

import { ILogInRequest, ILogInResponse, IReactQueryError } from '@/lib/types';

/**
 * Custom React hook for handling user sign-in using react-query's `useMutation` hook.
 * This hook makes an API request to authenticate the user and then utilizes `next-auth`
 * to manage the session. In case of successful authentication, the user is redirected
 * to the products page; otherwise, an error message is shown using `notistack`.
 *
 * @function useSignIn
 * @returns {object} Returns a mutation object from `useMutation` which contains methods
 * and status related to the mutation (like `mutate`, `status`, `data`, etc.).
 *
 * @typedef {object} ILogInRequest
 * @property {string} identifier - The email or username of the user.
 * @property {string} password - The password of the user.
 *
 * @typedef {object} ILogInResponse
 * @property {string} jwt - The JSON Web Token received upon successful authentication.
 * @property {object} user - The user details such as id, username, etc.
 *
 * @typedef {object} IReactQueryError
 * @property {object} response - The error response object.
 * @property {object} response.data - Data returned with the error.
 * @property {object} response.data.error - The error details.
 * @property {string} response.data.error.message - The error message.
 *
 * @typedef {object} SignInResponse
 * @property {boolean} ok - Indicates if the sign-in was successful.
 * @property {string} status - Status of the sign-in attempt.
 *
 * @example
 * const { mutate: signIn, status } = useSignIn();
 *
 * signIn({ identifier: 'user@example.com', password: 'password123' });
 */
export const useSignIn = () => {
  const router = useRouter();

  return useMutation<ILogInResponse, IReactQueryError, ILogInRequest>({
    mutationFn: async (credentials: ILogInRequest) => {
      return {} as ILogInResponse;
    },
    onSuccess: (_, userData) => {
      signIn('credentials', {
        identifier: userData.identifier,
        password: userData.password,
        rememberMe: userData.rememberMe,
        redirect: false,
      }).then((value: SignInResponse | undefined) => {
        if (value?.ok) {
          router.push('/products');
        } else {
          enqueueSnackbar('Something went wrong!', { variant: 'error' });
        }
      });
    },
  });
};
