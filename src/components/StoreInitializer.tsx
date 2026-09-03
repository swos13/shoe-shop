'use client';

import PageLoading from '@/app/loading';
import { initStores } from '@/tools/mock/localForage';
import { ReactNode, useEffect, useState } from 'react';

export function StoreInitializer({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initStores().finally(() => setIsReady(true));
  }, []);

  return !isReady ? <PageLoading /> : <>{children}</>;
}
