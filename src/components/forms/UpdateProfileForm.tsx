'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ControlledInput } from '@/components/controlled';
import { UpdateProfileFormSkeleton } from '@/components/ui/loading-skeletons/UpdateProfileFormSkeleton';
import { UpdateProfileValidation } from '@/lib/validation';
import { updateProfileFormStyles as styles } from '@/styles/forms/updateProfileForm.style';
import { useUpdateProfileMutation } from '@/hooks';
import BaseButton from '../ui/BaseButton';
import { setUser } from '@/tools/mock/mockUser';
import { User } from 'next-auth';
import { cookies } from 'next/headers';
import { setUserCookie } from '@/tools/mock/actions';

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
};

export const UpdateProfileForm: React.FC = () => {
  const { data: session, status, update } = useSession();

  const [isUpdating, setIsUpdating] = useState(false);

  const { handleSubmit, reset, control } = useForm<
    z.infer<typeof UpdateProfileValidation>
  >({
    resolver: zodResolver(UpdateProfileValidation),
    defaultValues,
  });

  useEffect(() => {
    reset({
      firstName: session?.user.firstName || '',
      lastName: session?.user.lastName || '',
      phoneNumber: session?.user.phoneNumber || '',
      email: session?.user.email || '',
    });
  }, [status]);

  const onSubmit = (data: z.infer<typeof UpdateProfileValidation>) => {
    // await mutateAsync({
    //   ...data,
    //   id: session?.user.id,
    //   jwt: session?.user.accessToken,
    // });

    const updatedUser = {
      ...session?.user,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
    } as User;

    setIsUpdating(true);

    setUser(updatedUser);
    setUserCookie(updatedUser);
    update({ user: updatedUser });
    
    setIsUpdating(false);
  };

  if (status === 'loading') return <UpdateProfileFormSkeleton />;

  return (
    <Box
      component="form"
      autoComplete="on"
      sx={styles.root}
      onSubmit={handleSubmit(onSubmit)}
    >
      <ControlledInput
        required
        name={'firstName'}
        control={control}
        label={'Name'}
        placeholder={'Unknown'}
        inputStyle={styles.field}
      />
      <ControlledInput
        name={'lastName'}
        control={control}
        label={'Surname'}
        placeholder={'Unknown'}
        inputStyle={styles.field}
      />
      <Box sx={styles.notAllowedWrapper}>
        <ControlledInput
          name={'email'}
          control={control}
          label={'Email'}
          placeholder={'example@example.com'}
          inputStyle={styles.field}
          disabled
        />
      </Box>
      <ControlledInput
        name={'phoneNumber'}
        control={control}
        label={'Phone number'}
        placeholder={'+000123456789'}
        inputStyle={styles.field}
      />
      <BaseButton type="submit" sx={styles.submitButton} disabled={isUpdating}>
        {isUpdating ? 'Saving...' : 'Save Changes'}
      </BaseButton>
    </Box>
  );
};
