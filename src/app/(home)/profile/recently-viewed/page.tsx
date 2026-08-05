'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import StoredProducts from '@/components/common/StoredProducts';
import { useStored, validateStoredItems } from '@/tools';
import { getStoredProductIds } from '@/utils';
import { enqueueSnackbar } from 'notistack';

export default function RecentlyViewed() {
  const { data: session } = useSession();
  const productIds = getStoredProductIds('lastViewed', session?.user?.id);
  const { data: products, isLoading } = useStored('lastViewed', productIds);

  useEffect(() => {
    if (products && products?.length > 0) {
      const isProductRemoved = validateStoredItems(
        'lastViewed',
        session?.user?.id,
      );

      if (isProductRemoved) {
        enqueueSnackbar(
          'Some products have been removed from the history because they are no longer available.',
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
      title="Recently viewed"
      emptyStateText={`You haven't viewed any products yet`}
    />
  );
}
