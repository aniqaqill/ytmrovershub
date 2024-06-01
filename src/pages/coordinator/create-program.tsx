import React, { useState, useMemo, useEffect } from "react";
import {
  Typography, Divider, Box, FormControl, Button, TextField,
  Grid, Snackbar, Alert,
} from "@mui/material";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import BaseLayout from "~/components/BaseLayout";
import { api } from "~/utils/api";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import Image from "next/image";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";

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

interface Material {
  id: string;
  name: string;
  quantity: number;
}

export default function CreateProgram() {
  const { data: sessionData } = useSession();
  const [programName, setProgramName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [location, setLocation] = useState("");
  const [maxVolunteer, setMaxVolunteer] = useState(0);
  const [selectedMaterials, setSelectedMaterials] = useState<{ id: string; quantity: number; }[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter();
  const materials =  api.materialInfo.getAllAidMaterial.useQuery().data;


  useEffect(() => {
    const fetchMaterials = async () => {

      
      if (materials) {
        setAvailableMaterials(materials);
      }
    };
    void fetchMaterials();
  }, [materials]);
  
    

  const isLoggedInCoordinator = useMemo(() => {
    return sessionData?.user && sessionData.user.role === "coordinator";
  }, [sessionData]);

  const coordinatorId = sessionData?.user?.id ?? "";
  const createProgram = api.programInfo.createProgram.useMutation();

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
    const key = `program/${file.name}`;
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
    if (!programName || !description || !startDate || !startTime || !endTime || !location || !maxVolunteer || !file) {
      return;
    }

    try {
      const image = await handleUploadImage(file);

      await createProgram.mutateAsync({
        name: programName,
        description,
        startDate,
        startTime: startTime,
        endTime: endTime,
        location,
        maxVolunteer,
        coordinatorId,
        image,
        materials: selectedMaterials
      });

      // Reset form fields
      setProgramName("");
      setDescription("");
      setStartDate("");
      setStartTime("00:00");
      setEndTime("00:00");
      setLocation("");
      setMaxVolunteer(0);
      setFile(null);
      setFilePreview(null);
      setSelectedMaterials([]);

      // Show success snackbar
      setSnackbarOpen(true);

      // Redirect after a delay
      setTimeout(() => {
        void router.push("/coordinator/manage-program");
      }, 3000);
    } catch (error) {
      console.error("Error creating program:", error);
    }
  };

  const handleMaterialChange = (materialId: string, quantity: number) => {
    setSelectedMaterials((prevMaterials) => {
      const existingMaterial = prevMaterials.find((m) => m.id === materialId);
      if (existingMaterial) {
        return prevMaterials.map((m) => m.id === materialId ? { ...m, quantity } : m);
      } else {
        return [...prevMaterials, { id: materialId, quantity }];
      }
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <BaseLayout pageIndex={1}>
      {isLoggedInCoordinator ? (
        <>
          <Link href="/coordinator/manage-program" passHref>
            <Button startIcon={<ArrowBackIcon />}>Back</Button>
          </Link>
          <Typography variant="h5" margin={2}>Create New Program</Typography>
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
                  <Typography variant="body2">Program Name :</Typography>
                  <TextField
                    id="program-name"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
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
                  <Typography variant="body2">Start Date</Typography>
                  <TextField
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <Typography variant="body2">Start Time</Typography>
                  <TextField
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <Typography variant="body2">End Time</Typography>
                  <TextField
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography variant="body2">Location</Typography>
                  <TextField
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography variant="body2">Max Volunteers</Typography>
                  <TextField
                    id="max-volunteer"
                    type="number"
                    value={maxVolunteer}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 0) {
                        setMaxVolunteer(value);
                      }
                    }}
                    inputProps={{ min: 1 }}
                    required
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Typography variant="body2">Program Image</Typography>
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
                  <Typography variant="body2">Aid Materials</Typography>
                  {availableMaterials.map((material) => (
                    <FormControl fullWidth key={material.id} >
                      <Typography>{material.name} (Available: {material.quantity})</Typography>
                      <TextField
                        type="number"
                        inputProps={{ min: 0, max: material.quantity }}
                        onChange={(e) => handleMaterialChange(material.id, Number(e.target.value))}
                        fullWidth
                      />
                    </FormControl>
                  ))}

              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained">Create Program</Button>
              </Grid>
            </Grid>
          </Box>

          <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
              Program created successfully! Redirecting to manage programs...
            </Alert>
          </Snackbar>
        </>
      ) : (
        <Typography variant="body1">You are not authorized to access this page.</Typography>
      )}
    </BaseLayout>
  );
}
