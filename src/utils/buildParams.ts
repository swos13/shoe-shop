import { MockFilters } from '@/lib/types';
import { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * Builds query parameters for an API request based on URL search parameters and additional parameters.
 * The function extracts multiple filters like gender, brand, color, size, categories, and price range
 * from the URL search params and formats them into a query object. It also appends any additional parameters provided.
 *
 * @param {ReadonlyURLSearchParams} query - The URL search parameters from which filters are extracted.
 * @param {Record<string, string | number>} [additionalParams={}] - Additional parameters to append to the final query.
 * @returns {Record<string, string | number>} - The resulting object containing all formatted query parameters.
 *
 * @example
 * const query = new URLSearchParams('?gender=male&brand=nike&minPrice=50&maxPrice=200');
 * const additionalParams = { sort: 'price:asc' };
 * const result = buildParams(query, additionalParams);
 * // result => {
 * //   "filters[gender][name][0]": "male",
 * //   "filters[brand][name][0]": "nike",
 * //   "filters[price][$gte]": 50,
 * //   "filters[price][$lte]": 200,
 * //   "sort": "price:asc"
 * // }
 */


type MockParamsType = {
  genders: Array<string>;
  categories: Array<string>;
  brands: Array<string>;
  colors: Array<string>;
  sizes: Array<string>;
}

export default function buildParams(
  query: ReadonlyURLSearchParams | URLSearchParams, // Allow both types
  additionalParams: Record<string, string | number> = {},
): MockFilters {
  const params: MockParamsType = { genders: [], categories: [], brands: [], colors: [], sizes: [] };
  // Helper function to handle both query and object input
  const getAllValues = (key: string): string[] => {
    if (query instanceof URLSearchParams) {
      return query.getAll(key); // Handle URLSearchParams
    } else if (typeof query === 'object') {
      const value = query[key];
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return [];
  };

  const getValue = (key: string): string | null => {
    if (query instanceof URLSearchParams) {
      return query.get(key); // Handle URLSearchParams
    } else if (typeof query === 'object') {
      return query[key] ? String(query[key]) : null;
    }
    return null;
  };

  const genders = getAllValues('gender');
  const brands = getAllValues('brand');
  const colors = getAllValues('color');
  const sizes = getAllValues('sizes');
  const categories = getAllValues('categories');

  const searchString = getValue('search');
  const minPrice = getValue('minPrice') || 0;
  const maxPrice = getValue('maxPrice') || Infinity;



  // genders.forEach((value, index) => {
  //   params[`filters[gender][name][${index}]`] = value;
  // });

  // brands.forEach((value, index) => {
  //   params[`filters[brand][name][${index}]`] = value;
  // });

  // colors.forEach((value, index) => {
  //   params[`filters[color][name][${index}]`] = value;
  // });

  // categories.forEach((value, index) => {
  //   params[`filters[categories][name][${index}]`] = value;
  // });

  // sizes.forEach((value, index) => {
  //   params[`filters[sizes][value][${index}]`] = value;
  // });

  // params['filters[name][$containsi]'] = searchString || '';
  // params['filters[price][$gte]'] = minPrice;
  // params['filters[price][$lte]'] = maxPrice;

  //MOCK API FILTERING

  params.genders = genders;
  params.brands = brands;
  params.colors = colors;
  params.categories = categories;
  params.sizes = sizes;

  return Object.assign(params, additionalParams);
}
