import { Box, Container, Tooltip, Typography } from '@mui/material';
import Image from 'next/image';

import { ImageSlider } from '@/components/common';
import { productIdStyles as styles } from '@/styles/product/product.style';
// import { getProduct } from '@/tools';
import { getMockProduct } from '@/tools/mockApi';
import ActionButtons from './ActionButtons';
import { textOverflowEllipsis } from '@/styles/commonStyles';
import { ISingleProductPageProps } from '@/lib/types';
import BackButton from '@/components/common/BackButton';
import { formatAmount } from '@/utils';

const SingleProductPage = async (props: ISingleProductPageProps) => {
  console.log('On the product page');
  if (!props || !props.params || !props.params.productId) return null;
  const { productId } = props.params;

  const product = await getMockProduct(productId);
  if (!product?.data?.attributes) return null;

  const {
    name,
    price,
    gender: genderData,
    sizes: sizesData,
    images: imagesData,
    description,
    color,
  } = product?.data.attributes;

  const gender = genderData?.data?.attributes?.name;
  const sizes = sizesData?.data || [];
  const images =
    imagesData?.data?.map(
      image => `/mock-data/mock-images/${image?.attributes?.url}`,
    ) || [];

  return (
    <Container sx={styles.root}>
      <BackButton />
      <Container
        data-testid="singleProductPage__root"
        maxWidth={false}
        sx={styles.childRoot}
      >
        <Box
          data-testid="singleProductPage__imageSliderContainer"
          sx={{
            ...styles.productContainer,
            alignItems: { xs: 'center', lg: 'flex-start' },
          }}
        >
          {images.length > 0 ? (
            <ImageSlider images={images} name={name} />
          ) : (
            <Box sx={styles.noImageBox}>
              <Image
                data-testid="singleProductPage__withoutSliderImage"
                width={250}
                height={250}
                src="/icons/galleryIcon.svg"
                alt="no image"
              />
            </Box>
          )}
        </Box>
        <Box
          data-testid="singleProductPage__infoContainer"
          sx={{
            ...styles.productContainer,
            maxWidth: '900px',
            alignSelf: 'center',
          }}
        >
          <Box sx={styles.productName}>
            <Tooltip title={name} placement="top-end">
              <Typography
                data-testid="singleProductPage__name"
                variant="h1"
                sx={{ ...textOverflowEllipsis.multiLine }}
              >
                {name}
              </Typography>
            </Tooltip>

            <Tooltip title={price} placement="top-end">
              <Typography
                data-testid="singleProductPage__price"
                variant="h3"
                sx={{
                  minWidth: '110px',
                  lineHeight: { xs: '35px', md: '53px' },
                  ...textOverflowEllipsis.singleLine,
                }}
              >
                ${formatAmount(price)}
              </Typography>
            </Tooltip>
          </Box>
          <Box sx={styles.genderAndColor}>
            {gender && (
              <Typography
                data-testid="singleProductPage__gender"
                variant="h4"
                sx={styles.productLabel}
              >
                {gender}&apos;s Shoes
              </Typography>
            )}
            {color && (
              <Typography
                data-testid="singleProductPage__color"
                variant="h4"
                sx={styles.productLabel}
              >
                Color: {color?.data?.attributes.name}
              </Typography>
            )}
          </Box>
          <ActionButtons
            sizes={sizes}
            product={{
              ...product?.data.attributes,
              id: Number(productId),
            }}
            id={productId}
          />
          <Box sx={styles.descriptionContainer}>
            <Typography variant="h4" sx={styles.productLabel}>
              Description
            </Typography>
            <Typography
              data-testid="singleProductPage__description"
              variant="body3"
              sx={styles.productLabel}
            >
              {description}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Container>
  );
};

export default SingleProductPage;
