'use client';

import { Box, Container, Divider, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { enqueueSnackbar } from 'notistack';
import { Fragment, useEffect } from 'react';

import { BagItem, BagSummary } from '@/components/bag';
import BaseButton from '@/components/ui/BaseButton';
import BagItemsSkeleton from '@/components/ui/loading-skeletons/BagItemsSkeleton';
import SummarySectionSkeleton from '@/components/ui/loading-skeletons/SummarySectionSkeleton';
import { useIsMobile } from '@/hooks';
import { bagPageStyles as styles } from '@/styles/bag/bag.style';
import { useQueryCartItems, validateStoredItems } from '@/tools';
import EmptyPage from './checkout/components/EmptyPage';

const Bag = () => {
  const { data: session } = useSession();
  const { data: cart = [], isLoading } = useQueryCartItems(session?.user?.id);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (cart.length > 0) {
      const isProductRemoved = validateStoredItems('cart', session?.user?.id);
      if (isProductRemoved) {
        enqueueSnackbar(
          'Some products have been removed from the cart because they are no longer available.',
          {
            variant: 'default',
            autoHideDuration: 5000,
            preventDuplicate: true,
          },
        );
      }
    }
  }, []);

  return (
    <>
      <Typography
        data-testid="bag__title-mobile"
        variant="h1"
        sx={styles.rootTitleMobile}
      >
        Cart
      </Typography>
      <Divider sx={{ display: { xs: 'block', md: 'none' }, mb: '17px' }} />
      {isLoading ? (
        <Container component={'main'} maxWidth="xl" sx={styles.main}>
          <BagItemsSkeleton />
          <SummarySectionSkeleton />
        </Container>
      ) : cart.length ? (
        <Container component={'main'} maxWidth="xl" sx={styles.main}>
          <Box sx={styles.container}>
            <Typography
              data-testid="bag__title-desktop"
              variant="h1"
              sx={styles.rootTitleDesktop}
            >
              Cart
            </Typography>
            {cart.map((shoe, index) => (
              <Fragment key={shoe.id + '_' + shoe.selectedSize}>
                <BagItem item={shoe} />
                {index < cart.length - 1 && (
                  <Divider sx={styles.itemsDivider} />
                )}
              </Fragment>
            ))}
            <BaseButton variant="text" sx={styles.continueShopping}>
              <Link href="/products">Continue Shopping</Link>
            </BaseButton>
          </Box>
          {!isMobile && (
            <Box sx={styles.bagSummaryContainerMd}>
              <BagSummary />
            </Box>
          )}
        </Container>
      ) : (
        <EmptyPage />
      )}
      {cart.length > 0 && isMobile && (
        <>
          <Divider sx={{ display: { xs: 'block', md: 'none' }, mt: '17px' }} />
          <Typography
            data-testid="summary__title-mobile"
            variant="h1"
            sx={styles.summaryTitleXs}
          >
            Summary
          </Typography>
          <Divider sx={{ display: { xs: 'block', md: 'none' }, mb: '17px' }} />
          <Container
            component={'main'}
            maxWidth="xl"
            sx={styles.bagSummaryContainerXs}
          >
            <BagSummary />
          </Container>
        </>
      )}
    </>
  );
};

export default Bag;
