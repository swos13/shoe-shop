import localForage from 'localforage';

export const productsStore = localForage.createInstance({
  name: 'products',
});

export const imagesStore = localForage.createInstance({
  name: 'images',
});
