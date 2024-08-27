"use client";
import { inter } from "@/theme";
import {
  Box,
  InputBase,
  InputBaseProps,
  InputLabel,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { ComponentProps, useId } from "react";
import warningIcon from "/public/icons/warningIcon.svg";

type InputProps = {
  label: string;
  required?: boolean;
  labelProps?: ComponentProps<typeof InputLabel>;
  inputProps?: InputBaseProps;
  containerProps?: ComponentProps<typeof Box>;
  errorMessage?: string;
};

const Input = ({
  label,
  required,
  containerProps,
  labelProps,
  inputProps,
  errorMessage,
}: InputProps) => {
  const id = useId();
  const theme = useTheme();

  return (
    <Box {...containerProps}>
      <InputLabel htmlFor={id} {...labelProps}>
        {label}
        {required && (
          <Typography
            sx={{
              marginLeft: "5px",
            }}
            component="span"
            color={theme.palette.error.main}
          >
            *
          </Typography>
        )}
      </InputLabel>
      <InputBase
        sx={{
          width: "100%",
          maxWidth: "436px",
          borderRadius: "8px",
          padding: "8px 15px",
          marginY: "3px",
          border: !!errorMessage
            ? `1px solid ${theme.palette.error.main}`
            : `1px solid ${theme.palette.grey[700]}`,
        }}
        {...inputProps}
        id={id}
      />
      {errorMessage && (
        <Box
          sx={{
            color: theme.palette.error.main,
            display: "flex",
            gap: "4px",
            alignItems: "center",
          }}
        >
          <Image src={warningIcon} alt="warning" />
          <Typography
            component="p"
            sx={{
              margin: 0,
              fontSize: theme.typography.body2,
              fontFamily: inter.style.fontFamily,
            }}
          >
            {errorMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Input;