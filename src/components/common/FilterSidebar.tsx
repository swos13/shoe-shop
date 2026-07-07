'use client';

import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { BaseWithName, BaseWithValue, FiltersData } from '@/lib/types';
import { BaseSidebar } from '../ui';
import { Category } from './Category';
import PriceSlider from './PriceSlider';

type Props = {
  open: boolean;
  isMobile: boolean;
  searchingString: string;
  productsCount: number;
  filtersData: FiltersData;
  onClose: () => void;
  maxPrice: number;
};

export const FilterSidebar = ({
  open,
  isMobile,
  searchingString,
  productsCount,
  filtersData,
  onClose,
  maxPrice,
}: Props) => {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  
  const { genders, colors, brands, categories, sizes } = filtersData;

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams);
    const searchParam = params.get('search')
      ? '?search=' + params.get('search')
      : '';
    router.push(`${pathName}${searchParam}`);
  };

  const categoryData = [
    { name: 'Gender', options: genders },
    { name: 'Color', options: colors },
    { name: 'Brand', options: brands },
    { name: 'Categories', options: categories },
    { name: 'Sizes', options: sizes },
  ];
  // console.log("Categories data:", categoryData)

  const Content = () => {
    return (
      <>
        <Stack
          sx={{
            flexDirection: { xs: 'row-reverse', md: 'column' },
            justifyContent: 'space-between',
            gap: 3,
            backgroundColor: 'background.paper',
            p: '15px',
          }}
        >
          {isMobile ? (
            <IconButton
              data-testid="closeFilters"
              onClick={onClose}
              sx={{ display: { md: 'none' } }}
            >
              <Image
                src={'/icons/cross.svg'}
                alt="close"
                width={20}
                height={20}
              />
            </IconButton>
          ) : (
            <Box>
              <Typography>
                {searchingString
                  ? `Searching results for: ${searchingString}`
                  : 'Shoes'}
              </Typography>
              <Typography>
                {searchingString && `Products found - ${productsCount}`}
              </Typography>
            </Box>
          )}
          <Button onClick={handleClearFilters} variant="outlined">
            Clear filters
          </Button>
        </Stack>

        {/* Categories */}
        {categoryData.map(({ name, options }) => (
          <Category
            key={name}
            name={name}
            options={options.data?.map(option => ({
              id: option.id,
              value:
                name === 'Sizes'
                  ? (option.attributes as BaseWithValue).value
                  : (option.attributes as BaseWithName).name,
            }))}
          />
        ))}
        <Category name="Price">
          <PriceSlider maxPrice={maxPrice} />
        </Category>
      </>
    );
  };

  return (
    <>
      <BaseSidebar
        isMobile={isMobile}
        open={open}
        containerStyle={{ p: '24px 0px' }}
        onClose={onClose}
        filters={true}
      >
        <Content />
      </BaseSidebar>
    </>
  );
};
