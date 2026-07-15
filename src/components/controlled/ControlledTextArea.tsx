import { Control, Controller } from 'react-hook-form';
import { ReactElement } from 'react';

import { TextArea } from '@/components/ui';
import { stylingConstants } from '@/lib/constants/themeConstants';
import ErrorMessage from '@/components/ui/ErrorMessage';

type Props = {
  name: string;
  control: any;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  children: ReactElement<any, any>;
};

const ControlledTextArea = ({
  name,
  control,
  label,
  placeholder,
  disabled = false,
  children,
}: Props) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <TextArea
            labelText={label}
            name={name}
            style={{
              maxWidth: '436px',
              borderColor: `${error ? stylingConstants.palette.error.main : stylingConstants.palette.grey[700]}`,
              marginTop: '3px',
              marginBottom: '3px',
            }}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required
            disabled={disabled}
            data-testid="description-input"
          >
            {children}
          </TextArea>
          {error && (
            <ErrorMessage
              label="product-description"
              errorMessage={error?.message}
            />
          )}
        </>
      )}
    />
  );
};

export default ControlledTextArea;
