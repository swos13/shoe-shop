// Mock api for fetching data from mock-data.json file that requires processing - mocking the processes

import {
  Data,
  MockFilters,
  ProductAttributes,
  ProductResponse,
} from '@/lib/types';
import { filterProducts } from '@/utils/helperFunctions';
import { User } from 'next-auth';
import filtersData from '~/mock-data/mock-filters.json';
import productsData from '~/mock-data/mock-products.json';

export const getMockFiltersData = async () => {
  try {
    // await fetch(`${process.env.API_URL}/mock-data/mock-filters.json`);

    const { filters } = filtersData;
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

export async function getMockProducts(
  pageParam: number = 1,
  params?: MockFilters,
) {
  const { products } = productsData;

  let filteredProducts = products.map(
    (product: ProductResponse) => product.data,
  );

  if (
    params &&
    (params?.genders.length > 0 ||
      params?.categories.length > 0 ||
      params?.colors.length > 0 ||
      params?.brands.length > 0 ||
      params?.sizes.length > 0)
  )
    filteredProducts = filterProducts(filteredProducts, params);

  const pageSize = 10;
  const startIndex = (pageParam - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const pageData = filteredProducts.slice(startIndex, endIndex);

  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    data: pageData,
    meta: {
      pagination: {
        page: pageParam,
        pageSize,
        pageCount: Math.ceil(filteredProducts.length / pageSize),
        total: filteredProducts.length,
      },
    },
  };
}

export async function getMockMaxPrice() {
  const { products } = productsData;
  const prices = products.map(
    (product: ProductResponse) => product.data.attributes.price,
  );
  return Math.max(...prices);
}

export function getMockProduct(id: string) {
  const { products } = productsData;

  return products.find(product => product.data.id.toString() === id);
}

export async function getMyMockProducts(user: User, page: number = 1) {
  const { products } = productsData;

  let filteredProducts = products
    .map((product: ProductResponse) => product.data)
    .filter(
      (product: Data<ProductAttributes>) =>
        product.attributes.id.toString() === user.id,
    );

  const pageSize = 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const pageData = filteredProducts.slice(startIndex, endIndex);

  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    data: pageData,
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(filteredProducts.length / pageSize),
        total: filteredProducts.length,
      },
    },
  };
}

export const getStoredMocks = async (ids: string[], pageSize: number) => {
  if (!ids.length) {
    return { data: [] };
  }

  const limitedIds = ids.slice(0, pageSize);

  const { products } = productsData;

  const filteredProducts = products
    .map((product: ProductResponse) => product.data)
    .filter((product: Data<ProductAttributes>) =>
      limitedIds.includes(product.id.toString()),
    );

  const sortedData = filteredProducts.sort(
    (a, b) => ids.indexOf(a.id.toString()) - ids.indexOf(b.id.toString()),
  );

  return { data: sortedData };
};
