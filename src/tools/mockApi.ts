// Mock api for fetching data from mock-data.json file that requires processing - mocking the processes

import { MockFilters, ProductResponse } from '@/lib/types';
import { filterProducts } from '@/utils/helperFunctions';
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
