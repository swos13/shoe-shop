import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { User } from 'next-auth';

import { getStoredProductIds } from '@/utils';
import {
  ICartItem,
  SavedOrderStatus,
  ProductAttributes,
  ProductsResponse,
  OrderResponseBody,
  TSelectedSize,
} from '@/lib/types';
import { queryClient } from '.';
import {
  getFiltersData,
  getMyProducts,
  getProduct,
  getProducts,
  getProductsNames,
  getStored,
  getOrders,
} from './api';
import { getMockProducts } from './mockApi';

/**
 * Custom hook to fetch paginated products using infinite scrolling.
 * It fetches the products page by page and merges them into a single list.
 *
 * @param {ProductsResponse} initialProducts - The initial set of products to start with.
 * @param {Object} [params={}] - Optional query parameters to filter or sort products.
 * @param {User} [user] - The current authenticated user.
 * @returns {Object} - The result of the infinite query, including data, fetching status, and pagination.
 */
export const useProducts = (
  initialProducts?: ProductsResponse,
  params?: {},
  user?: User,
) => {
  const myProducts = user ? 'my-products' : '';
  return useInfiniteQuery({
    queryKey: ['products', JSON.stringify(params) + myProducts],
    queryFn: ({ pageParam }) =>
      user ? getMyProducts(user, pageParam) : getMockProducts(pageParam),
    getNextPageParam: lastPage => {
      if (!lastPage) return undefined;
      const hasNextPage =
        lastPage?.meta?.pagination?.pageCount! >
        lastPage?.meta?.pagination?.page!;
      return hasNextPage ? lastPage?.meta?.pagination?.page! + 1 : undefined;
    },
    select: data => data.pages.flatMap(page => page.data),
    initialPageParam: 1,
    placeholderData: initialProducts
      ? { pages: [initialProducts], pageParams: [1] }
      : undefined,
    staleTime: 0,
  });
};

/**
 * Custom hook to fetch filter data (genders, colors, categories, brands, sizes) from the API.
 *
 * @returns {Object} - The result of the query, including data, fetching status, and potential errors.
 */
export const useFilters = () => {
  return useQuery({
    queryKey: ['filters'],
    queryFn: getFiltersData,
  });
};

/**
 * Custom hook to fetch a single product by its ID from the API.
 *
 * @param {string} id - The ID of the product to retrieve.
 * @returns {Object} - The result of the query, including the product data, fetching status, and potential errors.
 */
export const useProduct = (id: string) => {
  return useQuery({ queryKey: ['product', id], queryFn: () => getProduct(id) });
};

/**
 * Custom hook to fetch product names that contain a specific search string.
 *
 * @param {string} searchString - The string to search for in product names.
 * @returns {Object} - The result of the query, including the product names, fetching status, and potential errors.
 */
export const useProductsNames = (searchString: string) => {
  return useQuery({
    queryKey: ['names', searchString],
    queryFn: () => getProductsNames(searchString),
    select: data => data.data,
  });
};

/**
 * Custom hook to fetch items from cart state.
 *
 * @param {string | undefined} userId - The ID of the current user, or undefined if not authenticated.
 * @returns {Object[]} - The result of the query, including an array of all cart items, fetching status, and potential errors.
 */
export const useQueryCartItems = (userId: string | undefined) => {
  const storageKey = userId ? `cart_${userId}` : 'cart';
  return useQuery<ICartItem[]>({
    queryKey: [storageKey],
    queryFn: () => {
      if (
        typeof window === 'undefined' ||
        globalThis.localStorage === undefined
      ) {
        return [];
      }

      const guestCart = JSON.parse(localStorage.getItem('cart') || '[]');

      if (userId) {
        const userCart = JSON.parse(localStorage.getItem(storageKey) || '[]');

        const mergedCart = mergeCarts(guestCart, userCart);

        localStorage.setItem(storageKey, JSON.stringify(mergedCart));

        localStorage.removeItem('cart');

        return mergedCart;
      }

      return guestCart;
    },
  });
};

/**
 * Merges the guest cart and the user cart by combining matching items.
 *
 * @param {ICartItem[]} guestCart - The cart items for the guest user.
 * @param {ICartItem[]} userCart - The cart items for the authenticated user.
 * @returns {ICartItem[]} - The merged array of cart items.
 */
const mergeCarts = (
  guestCart: ICartItem[],
  userCart: ICartItem[],
): ICartItem[] => {
  const mergedCart = [...guestCart];

  userCart.forEach(userItem => {
    const existingItem = mergedCart.find(
      item =>
        item.id === userItem.id && item.selectedSize === userItem.selectedSize,
    );

    if (existingItem) {
      existingItem.amount += userItem.amount;
    } else {
      mergedCart.push(userItem);
    }
  });

  return mergedCart;
};

/**
 * Function to add an item to the cart state.
 *
 * If the item with the same `product.id` and `selectedSize` already exists in the cart,
 * its `amount` is incremented. If the item does not exist, it is added to the cart.
 *
 * @param {ProductAttributes} product - The product object that includes all properties of the item to add to the cart.
 * @param {string | undefined} userId - The ID of the current user, or undefined if not authenticated.
 * @param {number | 'unselected'} [selectedSize='unselected'] - The selected size of the product. If no size is selected, it defaults to 'unselected'.
 * @returns {void} Updates the cart state in the query client.
 */
export const addToCartQuery = (
  product: ProductAttributes,
  userId: string | undefined,
  selectedSize: number | 'unselected' = 'unselected',
) => {
  const storageKey = userId ? `cart_${userId}` : 'cart';
  queryClient.setQueryData([storageKey], (oldItems: ICartItem[] = []) => {
    const updatedCart = oldItems.find(
      item => item.id === product.id && item.selectedSize === selectedSize,
    )
      ? oldItems.map(item =>
          item.id === product.id && item.selectedSize === selectedSize
            ? { ...item, amount: item.amount + 1 }
            : item,
        )
      : [...oldItems, { ...product, amount: 1, selectedSize }];

    localStorage.setItem(storageKey, JSON.stringify(updatedCart));

    return updatedCart;
  });
};

/**
 * Function to remove an item from the cart state.
 *
 * It removes the item from the cart that matches the given `id` and `selectedSize`.
 *
 * @param {number} id - The ID of the product to remove from the cart.
 * @param {number | 'unselected'} selectedSize - The selected size of the product to be removed.
 * @param {string | undefined} userId - The ID of the current user, or undefined if not authenticated.
 * @returns {void} Updates the cart state in the query client.
 */
export const deleteFromCartQuery = (
  id: number,
  selectedSize: number | 'unselected',
  userId: string | undefined,
) => {
  const storageKey = userId ? `cart_${userId}` : 'cart';

  queryClient.setQueryData([storageKey], (cartItems: ICartItem[]) => {
    const updatedCart = cartItems.filter(
      item => !(item.id === id && item.selectedSize === selectedSize),
    );

    localStorage.setItem(storageKey, JSON.stringify(updatedCart));

    return updatedCart;
  });
};

/**
 * Function to clear all items in the cart state.
 *
 * @param {string | undefined} userId - The ID of the current user, or undefined if not authenticated.
 * @returns {void} Updates the cart state in the query client.
 */
export const clearCartQuery = (userId: string | undefined) => {
  const storageKey = userId ? `cart_${userId}` : 'cart';
  localStorage.removeItem(storageKey);
  return queryClient.setQueryData([storageKey], []);
};

/**
 * Function to increase the amount of a cart item.
 *
 * It increments the `amount` of the item in the cart that matches the given `id`.
 *
 * @param {number} id - The ID of the product in the cart whose amount needs to be increased.
 * @param {string | undefined} userId - The ID of the current user, or undefined if not authenticated.
 * @param {number | 'unselected'} selectedSize - The selected size of the product to be increased.
 * @returns {void} Updates the cart state in the query client.
 */
export const increaseCartItemAmount = (
  id: number,
  userId: string | undefined,

  selectedSize: number | 'unselected',
) => {
  const storageKey = userId ? `cart_${userId}` : 'cart';
  queryClient.setQueryData([storageKey], (cartItems: ICartItem[]) => {
    const updatedCart = cartItems.map(item =>
      item.id === id && item.selectedSize === selectedSize
        ? { ...item, amount: item.amount + 1 }
        : item,
    );

    localStorage.setItem(storageKey, JSON.stringify(updatedCart));

    return updatedCart;
  });
};

/**
 * Function to decrease the amount of a cart item.
 *
 * It decrements the `amount` of the item in the cart that matches the given `id`.
 * If the item's amount reaches 0, the item is still kept in the cart.
 *
 * @param {number} id - The ID of the product in the cart whose amount needs to be decreased.
 * @param {string | undefined} userId - The ID of the current user, or undefined if not authenticated.
 * @param {number | 'unselected'} selectedSize - The selected size of the product to be decreased.
 * @returns {void} Updates the cart state in the query client.
 */
export const decreaseCartItemAmount = (
  id: number,
  userId: string | undefined,
  selectedSize: number | 'unselected',
) => {
  const storageKey = userId ? `cart_${userId}` : 'cart';
  queryClient.setQueryData([storageKey], (cartItems: ICartItem[]) => {
    const updatedCart = cartItems.map(item =>
      item.id === id && item.selectedSize === selectedSize
        ? { ...item, amount: Math.max(0, item.amount - 1) }
        : item,
    );

    localStorage.setItem(storageKey, JSON.stringify(updatedCart));

    return updatedCart;
  });
};

/**
 * Function to change the selected size of a shoe in the cart for a specific user.
 *
 * If the new size already exists in the cart for the same shoe, it combines the amounts.
 * Otherwise, it updates the selected size of the shoe.
 *
 * @param {ICartItem} shoe - The shoe item in the cart whose size is being changed.
 * @param {number} newSize - The new size to update the shoe to.
 * @param {string | undefined} userId - The ID of the current user, or undefined if not authenticated.
 * @returns {void} Updates the cart state in the query client.
 */
export const changeSelectedSize = (
  shoe: ICartItem,
  newSize: number,
  userId: string | undefined,
) => {
  const storageKey = userId ? `cart_${userId}` : 'cart';
  queryClient.setQueryData([storageKey], (cartItems: ICartItem[]) => {
    const existedItem = cartItems.find(
      item => item.id === shoe.id && item.selectedSize === newSize,
    );

    let updatedCart;
    if (existedItem) {
      updatedCart = cartItems
        .map(item => {
          if (item.id === shoe.id && item.selectedSize === newSize)
            return { ...item, amount: item.amount + shoe.amount };
          if (item.id === shoe.id && item.selectedSize === shoe.selectedSize)
            return null;
          return item;
        })
        .filter(item => item !== null);
    } else {
      updatedCart = cartItems.map(item =>
        item.id === shoe.id && item.selectedSize === shoe.selectedSize
          ? { ...item, selectedSize: newSize }
          : item,
      );
    }

    localStorage.setItem(storageKey, JSON.stringify(updatedCart));

    return updatedCart;
  });
};

/**
 * Function to update cart, wishlis and recently viewed products when user deletes a product that exist in these stores.
 *
 * @param {number} id - The ID of the product in the cart that no longer exist in the database.
 * @param {'lastViewed' | 'wishlisted' | 'cart'} storeName - Name of the store that will be updated
 * @param {string | undefined} userId - The ID of the current user, or undefined if not authenticated.
 * @returns {void} Updates the store state in the query client and localStorage.
 */
export const removeProductFromStore = (
  id: number,
  storeName: 'lastViewed' | 'wishlisted' | 'cart',
  userId?: string,
) => {
  const storageKey = userId ? `${storeName}_${userId}` : storeName;

  if (storeName === 'cart') {
    queryClient.setQueryData([storageKey], (cartItems: ICartItem[]) => {
      const updatedCart = cartItems.filter(product => product.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updatedCart));
      return updatedCart;
    });
  } else {
    const storedIds = getStoredProductIds(storeName, userId);
    const updatedStoredIds = storedIds.filter(
      productId => productId !== id.toString(),
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedStoredIds));
  }
};

/**
 * Invoke of removeProductFromStore function for all stores.
 *
 * @param {number} id - The ID of the product in the cart that no longer exist in the database.
 * @param {string | undefined} userId - The ID of the current user, or undefined if not authenticated.
 * @returns {void} Updates the store state in the query client and localStorage.
 */
export const removeProductFromStoresOnDelete = (
  id: number,
  userId?: string,
) => {
  removeProductFromStore(id, 'lastViewed', userId);
  removeProductFromStore(id, 'wishlisted', userId);
  removeProductFromStore(id, 'cart', userId);
};

/**
 * Validate products in the cart, wishlist and recently-viewed by checking their existence in the backend.
 *
 * @param {'lastViewed' | 'wishlisted' | 'cart'} storeName - Name of the store that will be validated
 * @param {string} userId - The ID of the current user, or undefined if not authenticated.
 * @returns {booleann} - Returns boolean to let the related component know whether there is any change in the array.
 */
export const validateStoredItems = async (
  storeName: 'lastViewed' | 'wishlisted' | 'cart',
  userId?: string,
) => {
  const storageKey = userId ? `${storeName}_${userId}` : storeName;
  const productIds = getStoredProductIds(storeName, userId);

  const validatedProducts = await Promise.allSettled(
    productIds.map(id => getProduct(id)),
  );

  const validProductIds = validatedProducts
    .filter(response => response.status === 'fulfilled')
    .map(result => result.value.data.id);

  const validCartItems = validatedProducts
    .filter(response => response.status === 'fulfilled')
    .map(result => ({
      ...result.value.data.attributes,
      id: Number(result.value.data.id),
    }));

  const invalidProductIds = validatedProducts.filter(
    response => response.status === 'rejected',
  );

  if (storeName === 'cart') {
    // update the cart with the validated data and keeping the amount for each item
    // if the selected size of the product is no longer available, change it as 'unselected'
    queryClient.setQueryData([storageKey], (cartItems: ICartItem[]) => {
      const filteredCart = cartItems.filter(product =>
        validProductIds.includes(product.id),
      );

      if (validCartItems.length === filteredCart.length) {
        const updatedCart = validCartItems.reduce(
          (acc: ICartItem[], product, index) => {
            const checkSize = product.sizes?.data.find(
              size =>
                product.id === filteredCart[index].id &&
                Number(size.attributes.value) ===
                  filteredCart[index].selectedSize,
            );
            const selectedSize: TSelectedSize = checkSize
              ? Number(checkSize.attributes.value)
              : 'unselected';

            const existingProduct = acc.find(
              item =>
                item.id === product.id && item.selectedSize === selectedSize,
            );

            if (existingProduct) {
              existingProduct.amount += filteredCart[index].amount;
            } else {
              acc.push({
                ...product,
                amount: filteredCart[index].amount,
                selectedSize: selectedSize,
              });
            }

            return acc;
          },
          [],
        );
        localStorage.setItem(storageKey, JSON.stringify(updatedCart));
        return updatedCart;
      }
      return cartItems;
    });
    queryClient.invalidateQueries({ queryKey: [storageKey] });
  } else {
    const updatedStoredIds = productIds.filter(productId =>
      validProductIds.includes(Number(productId)),
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedStoredIds));
  }

  return invalidProductIds.length > 0;
};

/**
 * Custom hook to fetch lastViewed or wishlisted products by their IDs.
 *
 * @param {'lastViewed' | 'wishlisted'} key - The key that determines whether to fetch last viewed or wishlisted products.
 * @param {string[]} ids - Array of product IDs to retrieve.
 * @param {number} pageSize - Number of products to retrieve per page.
 * @returns {Object} - The result of the query, including last viewed product data, fetching status, and potential errors.
 */
export const useStored = (
  key: 'lastViewed' | 'wishlisted',
  ids: string[],
  pageSize: number = 12,
) => {
  return useQuery({
    queryKey: [key, ids, pageSize],
    queryFn: () => getStored(ids, pageSize),
    select: data => data.data,
  });
};

/**
 * Custom hook to fetch paginated orders using infinite scrolling.
 * It fetches the orders page by page and merges them into a single list.
 *
 * @param {User} [user] - The current authenticated user.
 * @returns {Object} - The result of the infinite query, including data, fetching status, and pagination.
 */
export const useOrders = (user: User, initialOrders: OrderResponseBody[]) => {
  return useInfiniteQuery({
    queryKey: ['orders'],
    queryFn: ({ pageParam }) => getOrders(user.id!, pageParam),
    getNextPageParam: lastPage =>
      lastPage.has_more ? lastPage.next_page : undefined,
    select: data => data.pages.flatMap(page => page.orders),
    initialPageParam: '',
    initialData: {
      pages: initialOrders,
      pageParams: [
        '',
        ...initialOrders.map(page => page.next_page).slice(0, -1),
      ],
    },
    staleTime: 0,
  });
};

/**
 * Custom hook to fetch order statuses state.
 *
 * @returns {Object[]} - The result of the query.
 */
export const useOrderStatuses = () => {
  const storageKey = 'order_statuses';
  return useQuery<Map<string, SavedOrderStatus>>({
    queryKey: [storageKey],
    queryFn: () => {
      if (
        typeof window === 'undefined' ||
        globalThis.localStorage === undefined
      ) {
        return new Map<string, SavedOrderStatus>();
      }
      return new Map<string, SavedOrderStatus>(
        JSON.parse(localStorage.getItem(storageKey) || '[]'),
      );
    },
  });
};

/**
 * Function to save order statuses state.
 *
 *
 * @param {Map<string,SavedOrderStatus>} orderStatus - The map with order ids as keys and status as values.
 * @returns {void} Updates the order statuses state.
 */
export const saveOrderStatuses = (
  orderStatuses: Map<string, SavedOrderStatus>,
) => {
  const storageKey = `order_statuses`;
  queryClient.setQueryData([storageKey], () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify(Array.from(orderStatuses.entries())),
    );

    return orderStatuses;
  });
};

/**
 * Function to add new order status.
 *
 *
 * @param {string} id - Id of payment intent that status refers to.
 * @returns {void} Updates the order statuses state.
 */
export const addOrderStatus = (id: string) => {
  const storageKey = `order_statuses`;
  queryClient.setQueryData([storageKey], () => {
    const orderStatuses = new Map<string, SavedOrderStatus>(
      JSON.parse(localStorage.getItem(storageKey) || '[]'),
    );

    orderStatuses.set(id, {
      status: 'shipped',
      updated: new Date().getTime(),
    });

    localStorage.setItem(
      storageKey,
      JSON.stringify(Array.from(orderStatuses.entries())),
    );

    return orderStatuses;
  });
};
