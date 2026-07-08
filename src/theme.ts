'use client';

import { alpha, createTheme } from '@mui/material/styles';
import { Work_Sans, Nunito_Sans } from 'next/font/google';

import { stylingConstants } from './lib/constants/themeConstants';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    body3: React.CSSProperties;
    menu: React.CSSProperties;
    category: React.CSSProperties;
    extremeHuge: React.CSSProperties;
    orderLabel: React.CSSProperties;
    orderInfo: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
    menu?: React.CSSProperties;
    category?: React.CSSProperties;
    extremeHuge?: React.CSSProperties;
    orderLabel?: React.CSSProperties;
    orderInfo?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body3: true;
    menu: true;
    category: true;
    extremeHuge: true;
    orderLabel: true;
    orderInfo: true;
  }
}

const workSans = Work_Sans({
  weight: ['300', '400', '500', '600', '900'],
  style: 'normal',
  display: 'swap',
  subsets: ['latin'],
  fallback: ['system-ui', 'arial'],
});

const nunitoSans = Nunito_Sans({
  weight: ['700'],
  style: 'normal',
  display: 'swap',
  subsets: ['latin'],
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false,
});

let theme = createTheme();

theme = createTheme({
  ...stylingConstants,

  typography: {
    allVariants: {
      fontWeight: 500,
    },
    fontFamily: workSans.style.fontFamily,
    h1: {
      fontSize: 45,
      lineHeight: '53px',
      [theme.breakpoints.down('md')]: {
        fontSize: 30,
        lineHeight: '35px',
      },
    },
    h2: {
      fontSize: 25,
      [theme.breakpoints.down('md')]: {
        fontSize: 20,
      },
    },
    h3: {
      fontSize: 22,
    },
    h4: {
      fontSize: 20,
      [theme.breakpoints.down('md')]: {
        fontSize: 15,
      },
    },
    h5: {
      fontSize: 18,
    },

    body1: {
      fontSize: 15,
      color: '#5c5c5c',
      [theme.breakpoints.down('md')]: {
        fontSize: 12,
      },
    },
    body2: {
      fontSize: 15,
      color: '#5c5c5c',
      fontWeight: 300,
      [theme.breakpoints.down('md')]: {
        fontSize: 12,
      },
    },
    body3: {
      fontFamily: workSans.style.fontFamily,
      fontSize: 16,
      color: '#494949',
      fontWeight: 300,
      [theme.breakpoints.down('md')]: {
        fontSize: 12,
      },
    },
    menu: {
      fontFamily: workSans.style.fontFamily,
      fontSize: 15,
      color: '#000',
      fontWeight: 300,
    },
    category: {
      fontFamily: workSans.style.fontFamily,
      fontSize: 16,
      color: '#000',
      fontWeight: 500,
    },
    extremeHuge: {
      fontFamily: workSans.style.fontFamily,
      fontSize: 140,
      lineHeight: '164px',
      color: '#000',
      fontWeight: 900,
      [theme.breakpoints.down('xl')]: {
        fontSize: 80,
        lineHeight: '92px',
      },
      [theme.breakpoints.down('lg')]: {
        fontSize: 60,
        lineHeight: '72px',
      },
    },
    orderLabel: {
      fontFamily: nunitoSans.style.fontFamily,
      fontSize: 14,
      color: '#8C9196',
      fontWeight: 700,
      [theme.breakpoints.down('lg')]: {
        fontSize: 12,
      },
      [theme.breakpoints.down('sm')]: {
        fontSize: 10,
      },
    },
    orderInfo: {
      fontFamily: nunitoSans.style.fontFamily,
      fontSize: 14,
      color: '#1E2832',
      fontWeight: 700,
      [theme.breakpoints.down('lg')]: {
        fontSize: 12,
      },
      [theme.breakpoints.down('sm')]: {
        fontSize: 10,
      },
    },
  },
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '12px',
          '&:hover': { backgroundColor: theme.palette.grey[100] },
        }),
      },
    },
    MuiCssBaseline: {
      styleOverrides: theme => ({
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: theme.palette.grey[300],
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 11,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[300],
            border: '2px solid transparent',
            backgroundClip: 'padding-box',
            borderRadius: 10,
            transition: 'background-color 0.3s ease-in-out',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover':
            {
              backgroundColor: theme.palette.grey[400],
            },
        },
      }),
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.spacing(),
          padding: ['7px', '16px'].join(' '),
        }),

        input: () => ({
          fontSize: 15,
          fontWeight: 400,
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: () => ({
          fontSize: 15,
          color: 'text.secondary',
          mb: '5px',
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          whiteSpace: 'nowrap',
          boxShadow: 'none',
          borderRadius: theme.spacing(),
          '&:hover': {
            boxShadow: 'none',
          },
          '&.Mui-disabled': {
            borderColor: 'rgba(0, 0, 0, 0.12)',
          },
        },
        contained: ({ theme }) => ({
          color: theme.palette.common.white,
          border: `1px solid ${theme.palette.primary.main}`,
          '&:hover': {
            color: theme.palette.primary.main,
            backgroundColor: 'transparent',
          },
        }),
        outlined: ({ theme }) => ({
          border: `1px solid ${theme.palette.primary.main}`,
          '&:hover': {
            color: theme.palette.common.white,
            backgroundColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderWidth: 1,
          borderColor: theme.palette.grey[100],
        }),
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderWidth: 1,
          borderRadius: 2,
          borderColor: theme.palette.grey[700],
        }),
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: () => ({
          padding: 0,
          border: 'none',

          '&.Mui-focused': {
            borderColor: `${theme.palette.grey[700]}`,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: 'none',

            borderColor: `${theme.palette.grey[700]}`,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        }),
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: () => ({
          backgroundColor: theme.palette.grey[300],
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: () => ({
          height: '60px',
          [theme.breakpoints.up('md')]: {
            height: '120px',
          },
        }),
      },
    },
  },
});

theme = createTheme(theme, {
  palette: {
    backdrop: theme.palette.augmentColor({
      color: {
        main: alpha('#F3F3F3', 0.9),
      },
      name: 'backdrop',
    }),
  },
});

export default theme;
