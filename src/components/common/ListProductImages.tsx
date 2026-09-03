'use client';

import {
  Box,
  Grid,
  IconButton,
  InputLabel,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import Image from 'next/image';
import { Gallery } from 'iconsax-react';
import { useDropzone } from 'react-dropzone';
import { useQuery } from '@tanstack/react-query';

import { stylingConstants } from '@/lib/constants/themeConstants';
import styles from '@/styles/forms/productForm.style';
import DeleteModal from '@/components/modals/DeleteModal';
import ErrorMessage from '../ui/ErrorMessage';
import { IImage, IListProductImagesProps, TMyImage } from '@/lib/types';
import RequiredStar from '../ui/RequiredStar';
import ImageWithSkeleton from './ImageWithSkeleton';
import { queryClient } from '@/tools';
import { getItemUrl } from '@/utils/helperFunctions';
import { useUploadImages } from '@/hooks';

const ListProductImages = ({ queryKey, error }: IListProductImagesProps) => {
  const { data: images } = useQuery<IImage[] | TMyImage[]>({
    queryKey,
    initialData: [],
    enabled: false,
  });

  const [idDeleteModal, setIdDeleteModal] = useState<null | number>(null);
  const [skeletonAmount, setSkeletonAmount] = useState<number>(0);

  const uploadImagesMutation = useUploadImages();

  const onDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setSkeletonAmount(acceptedFiles.length);
    const formData = new FormData();

    Array.from(acceptedFiles).forEach(file => {
      formData.append('files', file);
    });

    uploadImagesMutation.mutateAsync(formData, {
      onSuccess: (data: IImage[]) => {
        console.log('success data', data);
        queryClient.setQueryData(queryKey, (prev: IImage[] | null) =>
          prev ? [...prev, ...data] : [...data],
        );
        setSkeletonAmount(0);
      },
      onError: () => {
        setSkeletonAmount(0);
      },
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  const onDelete = () => {
    queryClient.setQueryData(queryKey, (prev: IImage[]) =>
      prev.filter(item => item.id !== idDeleteModal),
    );
    setIdDeleteModal(null);
  };

  const onOpenDeleteModal = (id: number) => {
    setIdDeleteModal(id);
  };

  const onCloseDeleteModal = () => setIdDeleteModal(null);

  return (
    <Box
      sx={{ ...styles.inputContainer, maxWidth: { xs: '436px', lg: 'none' } }}
    >
      <InputLabel>
        Product Images
        <RequiredStar />
      </InputLabel>
      <Grid
        container
        spacing={{ xs: 2, sm: 5, lg: 2 }}
        sx={{ minWidth: { xl: '692px' } }}
      >
        {Array.isArray(images) &&
          images.map(item => {
            console.log('item:', item);
            return (
              <Grid key={item.id} item xs={6} lg={12} xl={6}>
                <Box sx={styles.productImageContainer}>
                  <Box sx={styles.imageCoverOnHover}>
                    <IconButton
                      sx={styles.trashIconContainer}
                      data-testid="delete-image-button"
                      onClick={() => onOpenDeleteModal(item.id)}
                    >
                      <Image
                        width={20}
                        height={20}
                        src={'/icons/trash.svg'}
                        alt="trash"
                      />
                    </IconButton>
                  </Box>
                  <ImageWithSkeleton
                    src={
                      'attributes' in item
                        ? item.attributes.url
                        : URL.createObjectURL((item as IImage).originalFile!)
                    }
                  />
                </Box>
                <DeleteModal
                  open={Boolean(idDeleteModal)}
                  name="selected image"
                  onClose={onCloseDeleteModal}
                  onSubmit={onDelete}
                  text={`Do you want to delete the selected image?`}
                />
              </Grid>
            );
          })}
        {Array.from({ length: skeletonAmount }).map((_, i) => (
          <Grid
            key={'placeholderImageEditModal' + i}
            item
            xs={6}
            lg={12}
            xl={6}
          >
            <Box sx={styles.productImageContainer} data-testid="skeleton">
              <Skeleton variant="rectangular" width="100%" height="100%" />
            </Box>
          </Grid>
        ))}
        <Grid
          item
          xs={12}
          sm={Array.isArray(images) && images?.length > 0 ? 6 : 12}
          lg={12}
          xl={6}
          padding={0}
        >
          <Paper
            {...getRootProps()}
            elevation={0}
            sx={{
              ...styles.imageUploadBox,
              borderColor: `${error && Array.isArray(images) && images.length < 1 ? stylingConstants.palette.error.main : isDragActive ? '#aaa' : stylingConstants.palette.text.secondary}`,
              mb: '3px',
            }}
          >
            <input name="image" {...getInputProps()} data-testid="file-input" />
            <Gallery
              size="38"
              color={stylingConstants.palette.grey[500]}
              style={{ flexShrink: 0 }}
            />
            <Typography variant="body1" sx={styles.imageUploadText}>
              Drop your image here, <br />
              or select{' '}
              <span style={{ color: '#151e7a', textDecoration: 'underline' }}>
                click to browse
              </span>
            </Typography>
          </Paper>
          {error && Array.isArray(images) && images.length < 1 && (
            <ErrorMessage errorMessage={error?.message} label={'image-list'} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ListProductImages;
