import { Stack } from '@mui/material';

import { getMockFiltersData, getMaxPrice } from '@/tools';
import { buildParams } from '@/utils';
import FilterToggle from './FilterToggle';
import { getMockMaxPrice, getMockProducts } from '@/tools/mock/mockApi';

type Props = {
  searchParams: URLSearchParams;
};

const Products = async ({ searchParams }: Props) => {
  const filters = await getMockFiltersData();
  const params = buildParams(searchParams);
  const initialProducts = await getMockProducts(1, params);
  const maxPrice = await getMockMaxPrice();
  return (
    <Stack
      direction="row"
      justifyContent="center"
      sx={{ maxWidth: 1850, mx: 'auto', px: '20px' }}
    >
      <FilterToggle
        maxPrice={maxPrice}
        initialProducts={initialProducts}
        filtersData={filters}
      />
    </Stack>
  );
};

export default Products;
