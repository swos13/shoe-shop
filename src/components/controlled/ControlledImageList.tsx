'use client';

import { Control, Controller } from 'react-hook-form';

import { ListProductImages } from '@/components/common';

type Props = {
  queryKey: string[];
  name: string;
  control: any;
};

const ControlledImageList: React.FC<Props> = ({ queryKey, name, control }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ fieldState: { error } }) => {
        return <ListProductImages queryKey={queryKey} error={error} />;
      }}
    />
  );
};

export default ControlledImageList;
