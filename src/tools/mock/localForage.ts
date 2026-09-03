import { ProductResponse } from '@/lib/types';
import localForage from 'localforage';
import productsData from '~/mock-data/mock-products.json';

export const productsStore = localForage.createInstance({
  name: 'products',
});

export const imagesStore = localForage.createInstance({
  name: 'images',
});

export async function initStores() {
  const productItem = await productsStore.getItem('shoe_1');
  const imageItem = await imagesStore.getItem('shoe_1_img_1');

  if (productItem && imageItem) return;

  await productsStore.clear();
  await imagesStore.clear();

  const { products } = productsData;

  products.forEach(product => {
    productsStore.setItem(`shoe_${product.data.id}`, product);
  });

  await productsStore.setItem('products_amount', products.length);

  return;
}

export async function getAllProducts() {
  try {
    const amountOfProducts = await productsStore.getItem('products_amount');

    if (!amountOfProducts || typeof amountOfProducts !== 'number')
      throw new Error('Error retrieving products from the database');

    const products = [];
    let i = 0;
    let productMaxId = amountOfProducts;
    while (i < productMaxId) {
      const product = await productsStore.getItem(`shoe_${i + 1}`);

      if (!product) {
        productMaxId++;
      }
      i++;
      products.push(product);
    }
    return products;
  } catch (error) {
    console.error(error);
  }
}

export async function addProduct(newProduct: ProductResponse) {
  try {
    await productsStore.setItem(`shoe_${newProduct.data.id}`, newProduct);
  } catch (error) {
    console.error('Error while saving new product', error);
    return false;
  }
  return true;
}
