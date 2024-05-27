import React, { useState} from "react";
import { useRouter } from "next/router";
import { Button, Typography, Box, FormControl, TextField, Grid, Snackbar, Alert } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import Image from "next/image";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";
import { api } from "~/utils/api";

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

interface EditMaterialProps {
  material: {
    id: string;
    name: string;
    description: string;
    quantity: number;
    image: string;
  };
  onClose: () => void;
}

const endpoint = "https://rnkqnviezsjkhfovplik.supabase.co/storage/v1/object/public/";
const bucket = "program_media/";

const EditMaterial: React.FC<EditMaterialProps> = ({ material,onClose }) => {
  const [name, setName] = useState(material.name);
  const [description, setDescription] = useState(material.description);
  const [quantity, setQuantity] = useState(material.quantity);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter();

  const updateMaterial = api.materialInfo.updateAidMaterialById.useMutation();

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

  const s3Client = new S3Client({
    forcePathStyle: true,
    region: "ap-southeast-1",
    endpoint: env.NEXT_PUBLIC_s3_endpoint,
    credentials: {
      accessKeyId: env.NEXT_PUBLIC_s3_access_key,
      secretAccessKey: env.NEXT_PUBLIC_s3_secret_access,
    },
  });

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
    try {
      let image = material.image;

      if (file) {
        image = await handleUploadImage(file);
      }

      await updateMaterial.mutateAsync({
        id: material.id,
        name,
        description,
        quantity,
        image,
      });

      // Show success snackbar
      setSnackbarOpen(true);

      // Close modal after a delay
      setTimeout(() => {
        setSnackbarOpen(false);
        router.reload();
      }, 3000);
    } catch (error) {
      console.error("Error updating aid material:", error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
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
            {(file ?? material.image) && (
              <Box mt={2} textAlign="center">
                <Image
                  src={filePreview ?? `${endpoint}${bucket}${material.image}`}
                  alt={name}
                  style={{ maxHeight: 200 }}
                  width={200}
                  height={200}
                />
              </Box>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Grid container justifyContent="space-between" spacing={2}>
            <Grid item>
              <Button type="submit" variant="contained">Update Material</Button>
            </Grid>
            <Grid item>
              <Button onClick={onClose} variant="contained" color="error">Cancel</Button>
            </Grid>
          </Grid>
        </Grid>

      </Grid>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Aid material updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditMaterial;
