'use client';

import { useRouter } from 'next/navigation';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { enqueueSnackbar } from 'notistack';

import { IReactQueryError } from '@/lib/types';
import { IAddProductRequest } from '@/lib/types/requests/product.type';
import { IAddProductResponse } from '@/lib/types/responses/product.type';
import { addMockProduct } from '@/tools/mock/mockApi';

/**
 * Custom hook for creating a product using a mutation.
 *
 * @returns {UseMutationResult<IAddProductResponse, IReactQueryError, IAddProductRequest>} - The mutation result object from React Query.
 *
 * @description This hook allows the user to create a product by calling the `addProduct` function.
 * It uses `useMutation` to handle the mutation logic, displays success/error messages, and redirects upon success.
 */
export const useCreateProduct = (): UseMutationResult<
  IAddProductResponse,
  IReactQueryError,
  IAddProductRequest
> => {
  const { data: session } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: IAddProductRequest) => {
      return addMockProduct(data, session?.user.accessToken);
    },
    onSuccess: () => {
      enqueueSnackbar('Product added successfully.', {
        variant: 'success',
        autoHideDuration: 2000,
      });
      router.push('/profile/my-products');
    },
    onError: () => {
      enqueueSnackbar('Creating product failed', {
        variant: 'error',
        autoHideDuration: 2000,
      });
    },
  });
};
