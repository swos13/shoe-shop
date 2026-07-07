import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { User } from 'next-auth';
import { signIn } from 'next-auth/react';
import Stripe from 'stripe';

import {
  ApiResponseList,
  BaseWithName,
  BaseWithValue,
  IForgotPasswordReq,
  IForgotPasswordRes,
  IImage,
  ILogInRequest,
  IResetPasswordRequest,
  IResetPasswordResponse,
  ISignUpRequest,
  ISignUpResponse,
  IUpdateUserRequest,
  IUploadImageRes,
  IUser,
  ProductResponse,
  ProductsResponse,
} from '@/lib/types';
import { IAddProductResponse } from '@/lib/types/responses/product.type';
import { IAddProductRequest } from '@/lib/types/requests/product.type';
import axiosInstance from '@/tools/axios';
import { generateRandomUsername } from '@/utils/helperFunctions';

/**
 * Fetches data from a given URL using axios and handles any errors.
 *
 * @template T
 * @param {string} url - The API endpoint to fetch data from.
 * @param {AxiosRequestConfig} [options={}] - Optional axios request configuration.
 * @returns {Promise<T>} - The data retrieved from the API.
 * @throws Will throw an error if the request fails.
 */
export const fetchData = async <T>(
  url: string,
  options: AxiosRequestConfig = {},
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.get(url, options);
    return response.data;
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw new Error('Could not get data');
  }
};

/**
 * Sends a POST request to a given URL using axios and handles errors.
 *
 * @template T
 * @param {string} url - The API endpoint to post data to.
 * @param {Record<string, any>} options - The data to be sent in the POST request.
 * @param {AxiosRequestConfig<any>} [config] - The axios request config to be sent in the POST request.
 * @returns {Promise<T>} - The response data.
 * @throws Will throw an error if the request fails.
 */
export const postData = async <T>(
  url: string,
  options: Record<string, any>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.post(
      url,
      options,
      config,
    );
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error;
    } else {
      throw new Error('Unknown error while request');
    }
  }
};

export const deleteData = async <T>(
  url: string,
  options: Record<string, any>,
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.delete(url, options);
    return response.data;
  } catch (error) {
    console.error('Error when trying to delete item:', error);
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error;
    } else {
      throw new Error('Unknown error');
    }
  }
};
/**
 * Sends an HTTP PUT request to the specified URL with the provided options and headers.
 *
 * @template T - The expected type of the response data.
 * @param {string} url - The URL to send the PUT request to.
 * @param {Record<string, any>} options - The request body or other options to send with the PUT request.
 * @param {any} headers - Headers to include in the request.
 * @returns {Promise<T>} - A promise that resolves with the response data of type `T`.
 * @throws {any} - Throws the error response from the server if it's an Axios error, or a generic error if an unknown error occurs.
 *
 * @example
 * const data = await putData<{ success: boolean }>(
 *   'https://api.example.com/resource',
 *   { key: 'value' },
 *   { Authorization: 'Bearer token' }
 * );
 */
export const putData = async <T>(
  url: string,
  options: Record<string, any>,
  headers: any,
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.put(url, options, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error('Error putting data:', error);
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error;
    } else {
      throw new Error('Unkhown error while request');
    }
  }
};

/**
 * Fetches a paginated list of products from the API.
 *
 * @param {number} page - The page number to retrieve.
 * @param {Object} [params] - Optional query parameters for the request.
 * @returns {Promise<ProductsResponse>} - The response containing the product data.
 */
export const getProducts = async (
  page: number,
  params?: {},
): Promise<ProductsResponse> => {
  return await fetchData<ProductsResponse>('/products', {
    params: {
      populate: '*',
      'pagination[page]': page,
      'pagination[pageSize]': 12,
      sort: 'createdAt:desc',
      'filters[teamName]': 'team-1',
      ...params,
    },
  });
};

/**
 * Fetches the maximum price of the products.
 *
 * @returns {Promise<ProductsResponse>} - The response containing the product with the maximum price.
 */
export const getMaxPrice = async (): Promise<ProductsResponse> => {
  return fetchData<ProductsResponse>('/products', {
    params: {
      'pagination[page]': 1,
      'pagination[pageSize]': 1,
      fields: 'price',
      sort: 'price:desc',
    },
  });
};

/**
 * Fetches a single product by its ID.
 *
 * @param {string} id - The ID of the product to retrieve.
 * @returns {Promise<ProductResponse>} - The response containing the product data.
 */
export const getProduct = async (id: string): Promise<ProductResponse> => {
  return fetchData<ProductResponse>(`/products/${id}`, {
    params: {
      populate: '*',
    },
  });
};

/**
 * Fetches product names matching a search string.
 *
 * @param {string} searchString - The string to search for in product names.
 * @returns {Promise<ProductsResponse>} - The response containing the product names.
 */
export const getProductsNames = async (
  searchString: string,
): Promise<ProductsResponse> => {
  return fetchData<ProductsResponse>('/products', {
    params: {
      fields: 'name',
      'filters[name][$containsi]': searchString,
      'filters[teamName]': 'team-1',
    },
  });
};

/**
 * Fetches filter data for genders, colors, categories, brands, and sizes.
 *
 * @returns {Promise<{ genders: ApiResponseList<BaseWithName>, colors: ApiResponseList<BaseWithName>, categories: ApiResponseList<BaseWithName>, brands: ApiResponseList<BaseWithName>, sizes: ApiResponseList<BaseWithValue> }>}
 * - An object containing filter data for various categories.
 * @throws Will throw an error if the request fails.
 */
export const getFiltersData = async () => {
  try {
    // const [genders, colors, categories, brands, sizes] = await Promise.all([
    //   fetchData<ApiResponseList<BaseWithName>>('/genders'),
    //   fetchData<ApiResponseList<BaseWithName>>('/colors'),
    //   fetchData<ApiResponseList<BaseWithName>>('/categories'),
    //   fetchData<ApiResponseList<BaseWithName>>('/brands'),
    //   fetchData<ApiResponseList<BaseWithValue>>('/sizes'),
    // ]);

    const data = await fetch(`${process.env.API_URL}/mock-data/mock-filters.json`, { cache: 'no-store' });
    const { filters } = await data.json();
    console.log("reponse data:", filters.genders)
    const { genders, colors, categories, brands, sizes } = filters;
    return {
      genders,
      colors,
      categories,
      brands,
      sizes,
    };
  } catch (error) {
    console.error('Error retrieving filters data:', error);
    throw new Error('Could not get filters data');
  }
};

/**
 * Attempts to log in a user using the provided credentials.
 *
 * @param {ILogInRequest} user - The user's login credentials.
 * @returns {Promise<any>} - The result of the sign-in attempt.
 */
export const logIn = async (user: ILogInRequest): Promise<any> => {
  const result = signIn('credentials', {
    redirect: false,
    identifier: user.identifier,
    password: user.password,
  });

  return result;
};

/**
 * Registers a new user using the provided information.
 *
 * @param {ISignUpRequest} user - The user's registration information.
 * @returns {Promise<ISignUpResponse>} - The response after registration.
 */
export const signUp = async (
  user: ISignUpRequest,
): Promise<ISignUpResponse> => {
  const username = generateRandomUsername();

  return postData<ISignUpResponse>('/auth/local/register', {
    ...user,
    username,
  });
};

/**
 * Sends a forgot password request to the API.
 *
 * @param {IForgotPasswordReq} data - The forgot password request data.
 * @returns {Promise<IForgotPasswordRes>} - The response after the request is processed.
 */
export const forgotPassword = async (
  data: IForgotPasswordReq,
): Promise<IForgotPasswordRes> => {
  return postData<IForgotPasswordRes>('/auth/forgot-password', data);
};

/**
 * Resets the user's password using the provided data.
 *
 * @param {IResetPasswordRequest} data - The reset password request data.
 * @returns {Promise<IResetPasswordResponse>} - The response after the password reset.
 */

export const resetPassword = async (
  data: IResetPasswordRequest,
): Promise<IResetPasswordResponse> => {
  if (!data.code) {
    throw Error(`Your link doesn't have the required param "code"`);
  }

  return postData<IResetPasswordResponse>('/auth/reset-password', data);
};

/**
 * Fetches products associated with the currently authenticated user.
 *
 * @param {User} user - The authenticated user object.
 * @returns {Promise<ProductsResponse>} - The response containing the user's products.
 */
export const getMyProducts = async (
  user: User,
  page: number,
): Promise<ProductsResponse> => {
  return fetchData<ProductsResponse>('/products', {
    params: {
      'filters[userID]': user.id,
      populate: '*',
      'pagination[page]': page,
      'pagination[pageSize]': 12,
      'filters[teamName]': 'team-1',
      sort: 'createdAt:desc',
    },
    headers: {
      Authorization: `Bearer ${user?.accessToken}`,
    },
  });
};

/**
 * Uploads an image file to the server using a POST request.
 *
 * This function sends a `multipart/form-data` request to the `/upload` endpoint,
 * allowing the upload of image files. The server response, which includes
 * the uploaded image's details, is returned.
 *
 * @param {any} file - The file object to be uploaded. It should be a `File` or `Blob` in `FormData`.
 * @returns {Promise<IUploadImageRes>} - A promise that resolves to the response from the server containing the image details.
 *
 * @throws {Error} - If the request fails or the server responds with an error.
 *
 * @example
 * const imageFile = document.querySelector('input[type="file"]').files[0];
 * const response = await uploadImage(imageFile);
 * console.log(response); // Outputs the uploaded image details
 */

export const uploadImages = async (
  formData: FormData,
): Promise<IUploadImageRes> => {
  return postData<IUploadImageRes>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Updates the user profile by sending a PUT request to the server with the provided user data.
 *
 * @param {IUpdateUserRequest} user - The user data to be updated. It should contain the user ID and JWT for authorization.
 * @returns {Promise<IUser>} - A promise that resolves with the updated user profile data.
 *
 * @throws {any} - Throws an error if the request fails.
 *
 * @example
 * const updatedUser = await updateProfile({
 *   id: 123,
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'johndoe@example.com',
 *   jwt: 'your-jwt-token',
 * });
 */
export const updateProfile = async (
  user: IUpdateUserRequest,
): Promise<IUser> => {
  const body = { ...user, id: undefined, jwt: undefined };
  const headers = {
    Authorization: `Bearer ${user?.jwt}`,
  };
  return putData<IUser>(`/users/${user.id}`, body, headers);
};

/**
 * Deletes the user's avatar by setting it to null and updates the user's profile.
 *
 * @param {Object} params - The parameters required to delete the avatar.
 * @param {number} params.userId - The unique ID of the user whose avatar is to be deleted.
 * @param {string} params.jwt - The JSON Web Token (JWT) used for authenticating the user.
 *
 * @returns {Promise<IUser>} A promise that resolves to the updated user profile.
 *
 * @example
 * // Usage
 * const updatedUser = await deleteAvatar({ userId: 1, jwt: 'your_jwt_token' });
 * console.log(updatedUser.avatar); // null
 */

export const deleteAvatar = async ({
  userId,
  jwt,
}: {
  userId: number;
  jwt: string;
}): Promise<IUser> => updateProfile({ avatar: null, id: userId, jwt });

export const addProduct = async (
  data: IAddProductRequest,
  token: string,
): Promise<IAddProductResponse> => {
  if (!token) throw new Error('No JWT token available');

  const headers: any = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await axiosInstance.post<IAddProductResponse>(
    '/products',
    data,
    { headers },
  );

  return response.data;
};

export const addImages = async (data: any): Promise<IImage[]> => {
  const headers: any = {
    'Content-Type': 'multipart/form-data',
  };

  const response = await axiosInstance.post('/upload', data, { headers });

  return response.data;
};

export const getStored = async (ids: string[], pageSize: number) => {
  if (!ids.length) {
    return { data: [] };
  }

  const limitedIds = ids.slice(0, pageSize);

  const response = await fetchData<ProductsResponse>('/products', {
    params: {
      'pagination[page]': 1,
      'pagination[pageSize]': pageSize,
      'filters[id][$in]': limitedIds,
      populate: '*',
    },
  });

  const sortedData = response.data.sort(
    (a, b) => ids.indexOf(a.id.toString()) - ids.indexOf(b.id.toString()),
  );

  return { ...response, data: sortedData };
};

export const deleteProduct = async ({
  user,
  id,
}: {
  user: User;
  id: number;
}) => {
  return deleteData<Response>(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${user?.accessToken}`,
    },
  });
};

export const editProduct = async ({
  data,
  token,
  id,
}: {
  data: IAddProductRequest;
  token: string;
  id: number;
}): Promise<IAddProductResponse> => {
  const headers: any = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await axiosInstance.put<IAddProductResponse>(
    `/products/${id}?populate=*`,
    data,
    { headers },
  );

  return response.data;
};

export const fetchOrdersFromStripe = async (
  userId: string,
  pageParam?: string,
) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const limit = 8;

  const searchInvoicesResult = await stripe.invoices.search({
    query: `metadata["userId"]:"${userId}"`,
    limit,
    page: pageParam ? pageParam : undefined,
  });

  const invoices = searchInvoicesResult.data;

  if (invoices.length === 0) {
    return {
      orders: [],
      has_more: false,
      next_page: '',
    };
  }

  let query = '';

  invoices.forEach((invoice, index) => {
    query += `metadata["invoiceId"]:"${invoice.id}"`;
    if (index !== invoices.length - 1) query += ' OR ';
  });

  const searchPaymentIntentsResult = await stripe.paymentIntents.search({
    query,
    limit: limit * 2,
  });

  const paymentIntentsData = searchPaymentIntentsResult.data;
  const orders = paymentIntentsData
    .map(paymentIntent => ({
      paymentIntent,
      invoice: invoices.find(
        invoice => invoice.id === paymentIntent.metadata.invoiceId,
      ),
    }))
    .filter(
      order =>
        order.invoice !== undefined &&
        order.invoice.lines.data.length > 0 &&
        order.paymentIntent.shipping?.address !== undefined,
    );

  return {
    orders,
    has_more: searchInvoicesResult.has_more,
    next_page: searchInvoicesResult.next_page,
  };
};

export const getInitialOrders = async (userId: string) => {
  let lastFetch = await fetchOrdersFromStripe(userId);
  const initialOrdersData = [lastFetch];

  while (
    initialOrdersData.reduce((length, page) => length + page.orders.length, 0) <
      10 &&
    lastFetch.has_more
  ) {
    lastFetch = await fetchOrdersFromStripe(
      userId,
      lastFetch.next_page ? lastFetch.next_page : undefined,
    );
    initialOrdersData.push(lastFetch);
  }
  return Response.json(initialOrdersData);
};

export const getOrders = async (userId: string, pageParam?: string) => {
  return await axios
    .get(
      `/api/orders?userId=${userId}${pageParam ? '&pageParam=' + pageParam : ''}`,
    )
    .then(res => res.data)
    .catch(error => {
      console.error('Error while getting orders:', error);
    });
};
