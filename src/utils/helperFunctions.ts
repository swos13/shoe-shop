import {
  Data,
  IImage,
  MockFilters,
  ProductAttributes,
  TMyImage,
} from '@/lib/types';

export const capitalizeFirstLetter = (text: string) => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function generateRandomUsername() {
  const adjectives = [
    'Quick',
    'Lazy',
    'Happy',
    'Sad',
    'Brave',
    'Clever',
    'Bright',
    'Bold',
    'Curious',
    'Mighty',
  ];

  const nouns = [
    'Lion',
    'Tiger',
    'Elephant',
    'Eagle',
    'Falcon',
    'Shark',
    'Dragon',
    'Wolf',
    'Bear',
    'Panther',
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 100000);

  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

export const getItemUrl = (item: IImage | TMyImage): string => {
  if ('previewUrl' in item && item.previewUrl) return item.previewUrl; // Handle IImage case
  if ('url' in item && item?.url) return item?.url;
  if ('attributes' in item && item?.attributes?.previewUrl)
    return item?.attributes.previewUrl;
  if ('attributes' in item && item?.attributes.url) return item?.attributes.url;

  return 'https://lightwidget.com/wp-content/uploads/localhost-file-not-found.jpg';
};

export const filterProducts = (
  products: Data<ProductAttributes>[],
  filters: MockFilters,
) => {
  const filteredProducts = products.filter(product => {
    const { genders, categories, colors, sizes, brands } = filters;
    if (genders.includes(`${product.attributes.gender?.data?.attributes.name}`))
      return true;
    if (colors.includes(`${product.attributes.color?.data?.attributes.name}`))
      return true;
    if (brands.includes(`${product.attributes.brand?.data?.attributes.name}`))
      return true;

    const productCategories = product.attributes.categories?.data;
    if (
      productCategories &&
      productCategories.some(category =>
        categories.includes(category.attributes.name),
      )
    )
      return true;

    const productSizes = product.attributes.sizes?.data;
    if (
      productSizes &&
      productSizes.some(size => sizes.includes(`${size.attributes.value}`))
    )
      return true;

    return false;
  });

  return filteredProducts;
};

export function getExtension(file: File) {
  const fileName = file.name;

  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex === -1) return '';

  return fileName.slice(lastDotIndex + 1).toLowerCase();
}
