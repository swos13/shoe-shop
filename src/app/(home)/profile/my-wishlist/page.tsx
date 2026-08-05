'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';

import StoredProducts from '@/components/common/StoredProducts';
import { useStored, validateStoredItems } from '@/tools';
import { getStoredProductIds } from '@/utils';

export default function MyWishlist() {
  const { data: session } = useSession();
  const productIds = getStoredProductIds('wishlisted', session?.user?.id);
  const { data: products, isLoading } = useStored('wishlisted', productIds);

  useEffect(() => {
    if (products && products?.length > 0) {
      const isProductRemoved = validateStoredItems(
        'wishlisted',
        session?.user?.id,
      );

      if (isProductRemoved) {
        enqueueSnackbar(
          'Some products have been removed from your wishlist because they are no longer available.',
          {
            variant: 'default',
            autoHideDuration: 5000,
            preventDuplicate: true,
          },
        );
      }
    }
  }, [products]);

  return (
    <StoredProducts
      products={products}
      isLoading={isLoading}
      title="My Wishlist"
      emptyStateText={`You haven't added any products to your wishlist yet`}
    />
  );
}
