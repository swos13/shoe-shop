'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Typography } from '@mui/material';
import { UseMutationResult, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { enqueueSnackbar } from 'notistack';

import ControlledInput from '@/components/controlled/ControlledInput';
import { IReactQueryError, ISignUpRequest, ISignUpResponse } from '@/lib/types';
import { SignUpFormValidation } from '@/lib/validation';
import { signUp } from '@/tools';
import { stylingConstants } from '@/lib/constants/themeConstants';
import BaseButton from '../ui/BaseButton';
import { buttonStyles } from '@/styles/commonStyles';
import { createUser } from '@/tools/mock/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const defaultValues = {
  firstName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const SignUpForm: React.FC = () => {
  const mutation: UseMutationResult<
    ISignUpResponse,
    IReactQueryError,
    ISignUpRequest
  > = useMutation({
    mutationFn: signUp,
  });

  const { handleSubmit, reset, control } = useForm<
    z.infer<typeof SignUpFormValidation>
  >({
    resolver: zodResolver(SignUpFormValidation),
    defaultValues,
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof SignUpFormValidation>) => {
    try {
      // await mutation.mutateAsync({
      //   firstName: data.firstName,
      //   email: data.email,
      //   password: data.password,
      // });
      setIsPending(true);
      const newUser = await createUser(
        data.firstName,
        data.email,
        data.password,
      );

      if (newUser) setIsSuccess(true);
      reset();
      enqueueSnackbar('Registration successful, now you can sign in', {
        variant: 'success',
        autoHideDuration: 5000,
      });
      router.push('/auth/sign-in');
    } catch (error: any) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    } finally {
      setIsPending(false);
    }
  };

  if (isSuccess) {
    return (
      <Alert
        severity="success"
        sx={{
          maxWidth: '436px',
          py: '14px',
          my: '14px',
          fontSize: '16px',
          borderRadius: '8px',
        }}
      >
        Success. Please, check your email inbox and confirm your registration.
        You can close this tab
      </Alert>
    );
  }

  return (
    <>
      <Box
        component="form"
        sx={{
          m: '40px 0 16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <ControlledInput
          name="firstName"
          control={control}
          label="Name"
          required
          placeholder="Hayman Andrews"
        />
        <ControlledInput
          name="email"
          control={control}
          label="Email"
          required
          placeholder="example@mail.com"
        />
        <ControlledInput
          name="password"
          control={control}
          label="Password"
          required
          placeholder="at least 8 characters"
          type="password"
        />
        <ControlledInput
          name="confirmPassword"
          control={control}
          label="Confirm Password"
          required
          placeholder="at least 8 characters"
          type="password"
        />
        <BaseButton
          type="submit"
          disabled={isPending}
          sx={{
            ...buttonStyles.authBtn,
            ...buttonStyles.disabledBtn,
            mt: '66px',
          }}
        >
          {isPending ? 'Loading...' : 'Sign Up'}
        </BaseButton>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
        <Typography
          variant="body1"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          Already have an account?
        </Typography>
        <Link
          href="/auth/sign-in"
          style={{
            textDecoration: 'none',
            color: stylingConstants.palette.primary.main,
          }}
        >
          <Typography
            variant="body1"
            color={stylingConstants.palette.primary.main}
            sx={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Log in
          </Typography>
        </Link>
      </Box>
    </>
  );
};

export default SignUpForm;
