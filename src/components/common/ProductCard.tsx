'use client';

import { MoreHoriz } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { BagTick } from 'iconsax-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { MouseEvent, useState } from 'react';

import ButtonMenu from '@/components/common/ButtonMenu';
import { useDeleteProduct } from '@/hooks';
import { ProductAttributes } from '@/lib/types';
import { textOverflowEllipsis } from '@/styles/commonStyles';
import { addToCartQuery } from '@/tools';
import WishlistIcon from './WishlistIcon';
import { formatAmount } from '@/utils';

type Props = {
  product: ProductAttributes;
  imagePriority: boolean;
  user?: User;
  handleWishlist?: (productId: string) => void;
};

const ProductCard = ({
  product,
  imagePriority,
  user,
  handleWishlist,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: session, status } = useSession();
  const addToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    addToCartQuery(product, session?.user?.id);

    enqueueSnackbar('Successfully added to cart', {
      variant: 'success',
      autoHideDuration: 2000,
    });
  };

  const pathName = usePathname();
  const isProfile = pathName.includes('/profile/my-products');
  const isWishlist = pathName.includes('/profile/my-wishlist');
  const mutation = useDeleteProduct(
    product.name,
    product.id,
    session?.user?.id,
  );

  const deleteProduct = (id: number) => {
    try {
      if (user) mutation.mutateAsync({ user, id });
    } catch (error: any) {
      throw new Error('Something went wrong...');
    }
  };

  return (
    <Box
      data-testid="product-card"
      sx={{ position: 'relative', width: '100%' }}
    >
      <Link
        data-testid="product-card__link"
        href={`/products/${product.id}`}
        style={{ textDecoration: 'none' }}
      >
        <Card
          sx={{
            width: 1,
            borderRadius: 0,
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ position: 'relative', aspectRatio: 320 / 380 }}>
            {!isProfile && status === 'authenticated' && (
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: '0%',
                  transition: 'opacity 0.3s ease-in-out',
                  ':hover': { opacity: '100%' },
                  zIndex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <IconButton
                  data-testid={`add-to-cart-${product.id}`}
                  sx={{
                    backgroundColor: 'rgba(255,255,255, 0.70)',
                    borderRadius: '50%',
                    flexDirection: 'column',
                    fontSize: '14px',
                    width: '100px',
                    height: '100px',
                    boxShadow: '0px 4px 10px 0px #00000026',
                  }}
                  onClick={addToCart}
                >
                  <BagTick />
                  Add to cart
                </IconButton>
              </Box>
            )}
            {product.images?.data ? (
              <Image
                src={`/mock-data/mock-images/${product.images.data[0].attributes.url}`}
                alt={product.name!}
                fill
                style={{ objectFit: 'cover' }}
                priority={imagePriority}
                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                unoptimized
              />
            ) : (
              <Paper
                sx={{
                  height: 1,
                  backgroundColor: 'grey.A100',
                  borderRadius: 0,
                }}
              >
                <Image fill src="/icons/galleryIcon.svg" alt="icon" />
              </Paper>
            )}
          </Box>
          <CardActionArea
            LinkComponent={Link}
            sx={{
              '&:hover .MuiCardActionArea-focusHighlight': {
                opacity: 0,
              },
              backgroundColor: 'background.paper',
              flex: 1,
            }}
          >
            <CardContent sx={{ pl: 0, pr: 0 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  gap: '1rem',
                  p: 0,
                }}
              >
                <Box>
                  <Tooltip title={product.name} placement="top-end">
                    <Typography
                      variant="h3"
                      sx={{
                        ...textOverflowEllipsis.multiLine,
                        fontSize: { xs: '10px', sm: '22px' },
                      }}
                    >
                      {product.name}
                    </Typography>
                  </Tooltip>
                  {product.gender?.data?.attributes.name && (
                    <Typography
                      variant="h5"
                      textTransform="capitalize"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '9px', sm: '18px' },
                      }}
                    >
                      {`${product.gender?.data?.attributes.name}'s Shoes`}
                    </Typography>
                  )}
                </Box>
                <Typography
                  variant="h3"
                  sx={{ fontSize: { xs: '10px', sm: '22px' } }}
                >
                  ${formatAmount(product.price)}
                </Typography>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      </Link>
      {isProfile && (
        <Box>
          <IconButton
            data-testid="product-card__button-menu"
            aria-label="settings"
            sx={{
              position: 'absolute',
              zIndex: '1',
              p: '10px',
              top: 5,
              right: 5,
            }}
            onClick={e => setAnchorEl(e.currentTarget)}
          >
            <MoreHoriz />
          </IconButton>
          <ButtonMenu
            name={product.name}
            productid={product.id!}
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            onClose={() => setAnchorEl(null)}
            onDeleteProduct={() => deleteProduct(product.id)}
            product={product}
          />
        </Box>
      )}
      {isWishlist && handleWishlist && (
        <WishlistIcon handleWishlist={handleWishlist} id={product.id} />
      )}
    </Box>
  );
};
export default ProductCard;
