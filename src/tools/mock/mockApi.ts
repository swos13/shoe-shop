// Mock api for fetching data from mock-data.json file that requires processing - mocking the processes

import {
  Data,
  IAddProductRequest,
  IAddProductResponse,
  IImage,
  IUploadImageRes,
  MockFilters,
  ProductAttributes,
  ProductResponse,
} from '@/lib/types';
import { filterProducts, getExtension } from '@/utils/helperFunctions';
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

export async function addMockProduct(data: IAddProductRequest, user: User) {
  console.log(data);

  return {} as IAddProductResponse;
}

export async function uploadMockImages(formData: FormData) {
  // getting this from the form
  // -path:"./IMG_6186.JPG"
  // relativePath:"./IMG_6186.JPG"
  // lastModified:1783024340446
  // lastModifiedDate:Thu Jul 02 2026 22:32:20 GMT+0200 (czas środkowoeuropejski letni) {}
  // name:"IMG_6186.JPG"
  // size:2849743
  // type:"image/jpeg"
  // webkitRelativePath:""
  // "images": { "data": [ { "id": 10, "attributes": { "width": 100, "height": 100, "url": "/mock-data/mock-images/shoe-8.avif", "provider_metadata": { "public_id": "Shoe 8", "resource_type": "image" }, "createdAt": "2024-11-01T10:00:00.000Z", "updatedAt": "2024-11-01T10:00:00.000Z", "publishedAt": "2024-11-01T10:00:00.000Z", "id": 10 } } ] },
  // 'upload' - return images ready to add to product. But products should hold only ids, and the ids - keys that are also in the focal storage image table. so basically I could add to the focal storage right away and later load from it. But thtat will require to change how products are stored as well, since they have the imgs data

  const images = formData.getAll('files');

  const uploadedImages: IUploadImageRes = images
    .map((image: FormDataEntryValue) => {
      if (typeof image === 'string') return null;

      const now = Date.now().toLocaleString('en-US');

      const ext = getExtension(image);

      const uploadedImage: IImage = {
        originalFile: image,
        id: 22, //new id - make key last id
        name: image.name,
        alternativeText: 'Shoe image',
        caption: '',
        width: NaN,
        height: NaN,
        formats: {},
        hash: '',
        ext: ext,
        url: '',
        mime: `image/${ext}`,
        size: 0,
        previewUrl: '',
        provider: '',
        provider_metadata: {},
        createdAt: now,
        updatedAt: now,
      };

      return uploadedImage;
    })
    .filter(image => image !== null);

  return uploadedImages;
}
