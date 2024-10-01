import { Box } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

import { stylingConstants } from '@/lib/constants/themeConstants';
import Testimonial from './Testimonial';

interface ISideImageLayoutProps {
  children: React.ReactNode;
  imageSrc: string;
  showTestimonial?: boolean;
}

export default function SideImageLayout({
  children,
  imageSrc,
  showTestimonial,
}: ISideImageLayoutProps) {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: '100vw',
        overflowX: 'clip',
      }}
    >
      <Box
        component="section"
        sx={{
          p: { xs: '0 0 60px 0', lg: '50px 40px' },
          flex: 1,
          minWidth: '50vw',
        }}
      >
        <Box
          component="picture"
          sx={{
            display: 'block',
            m: {
              xs: '18px 20px 14px 20px',
              lg: '0',
            },
            overflowX: 'hidden',
          }}
        >
          <Link href="/products">
            <Image src="/icons/logo.svg" alt="logo" width={40} height={30} />
          </Link>
        </Box>
        <Box
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100% - 130px)',
            borderTop: {
              xs: `1px solid ${stylingConstants.palette.grey[100]}`,
              lg: 'none',
            },
            p: '0 20px',
          }}
        >
          {children}
        </Box>
      </Box>
      <Box
        component="aside"
        sx={{
          position: 'relative',
          display: { xs: 'none', lg: 'flex' },
          maxWidth: '50vw',
        }}
      >
        {showTestimonial && <Testimonial />}
        <Image
          src={imageSrc}
          alt="sneaker"
          width={1000}
          height={1000}
          style={{
            height: '100vh',
            width: 'fit-content',
            position: 'sticky',
            top: '0',
          }}
        />
      </Box>
    </Box>
  );
}
