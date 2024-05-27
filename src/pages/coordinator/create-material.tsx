import React, { useState, useMemo } from "react";
import Link from "next/link";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import { Button, Typography, Box, FormControl, TextField, Grid, Snackbar, Alert, Divider } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import Image from "next/image";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function CreateMaterial() {
  const { data: sessionData } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter();

  const isLoggedInCoordinator = useMemo(() => {
    return sessionData?.user && sessionData.user.role === "coordinator";
  }, [sessionData]);

  const createMaterial = api.materialInfo.createAidMaterial.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile!);
      setFilePreview(URL.createObjectURL(selectedFile!));
    } else {
      setFile(null);
      setFilePreview(null);
    }
  };

  const s3Client = useMemo(() => new S3Client({
    forcePathStyle: true,
    region: "ap-southeast-1",
    endpoint: env.NEXT_PUBLIC_s3_endpoint,
    credentials: {
      accessKeyId: env.NEXT_PUBLIC_s3_access_key,
      secretAccessKey: env.NEXT_PUBLIC_s3_secret_access,
    },
  }), []);

  const handleUploadImage = async (file: File) => {
    const key = `material/${file.name}`;
    const putObjectCommand = new PutObjectCommand({
      Bucket: "program_media",
      Key: key,
      Body: file,
      ContentType: file.type,
    });
    await s3Client.send(putObjectCommand);
    return key;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !description || !quantity || !file) {
      return;
    }

    try {
      const image = await handleUploadImage(file);

      await createMaterial.mutateAsync({
        name,
        description,
        quantity,
        image,
      });

      // Reset form fields
      setName("");
      setDescription("");
      setQuantity(0);
      setFile(null);
      setFilePreview(null);

      // Show success snackbar
      setSnackbarOpen(true);

      // Redirect after a delay
      setTimeout(() => {
        void router.push("/coordinator/manage-material");
      }, 3000);
    } catch (error) {
      console.error("Error creating aid material:", error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <BaseLayout pageIndex={1}>
      {isLoggedInCoordinator ? (
        <>
          <Link href="/coordinator/manage-material" passHref>
            <Button startIcon={<ArrowBackIcon />}>Back</Button>
          </Link>
          <Typography variant="h5" margin={2}>Create New Aid Material</Typography>
          <Divider />
          <br />
          <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
            margin={2}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <FormControl fullWidth>
                  <Typography variant="body2">Material Name :</Typography>
                  <TextField
                    id="material-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Typography variant="body2">Description : </Typography>
                  <TextField
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    multiline
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography variant="body2">Quantity</Typography>
                  <TextField
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 0) {
                        setQuantity(value);
                      }
                    }}
                    inputProps={{ min: 1 }}
                    required
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Typography variant="body2">Material Image</Typography>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload file
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {file && (
                    <Box mt={2} textAlign="center">
                      <Image
                        src={filePreview!}
                        alt={file.name}
                        style={{ maxHeight: 200 }}
                        width={200}
                        height={200}
                      />
                    </Box>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained">Create Material</Button>
              </Grid>
            </Grid>
          </Box>

          <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
              Aid material created successfully! Redirecting to manage materials...
            </Alert>
          </Snackbar>
        </>
      ) : (
        <Typography variant="body1">You are not authorized to access this page.</Typography>
      )}
    </BaseLayout>
  );
}
