import React, { useState, useMemo } from "react";
import { Typography, Divider, Box, FormControl, Button, TextField, Grid, Snackbar, Alert } from "@mui/material";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import BaseLayout from "~/components/BaseLayout";
import { api } from "~/utils/api";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { env } from '~/env';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import Image from "next/image";

const endpoint = env.NEXT_PUBLIC_s3_endpoint;
const region = "ap-southeast-1";
const accessKey = env.NEXT_PUBLIC_s3_access_key;
const secretKey = env.NEXT_PUBLIC_s3_secret_access;

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

export default function Page() {
  const { data: sessionData } = useSession();
  const [programName, setProgramName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [maxVolunteer, setMaxVolunteer] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter();

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

  const s3Client = new S3Client({
    forcePathStyle: true,
    region,
    endpoint,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const handleUploadImage = async (file: File) => {
    const key = `program/${file.name}`;
    const putObjectCommand = new PutObjectCommand({
      Bucket: "program_media",
      Key: key,
      Body: file, // Include the file data here
      ContentType: file.type, // Dynamically set the content type based on the file
    });
    await s3Client.send(putObjectCommand);
    return key;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!programName || !description || !startDate || !endDate || !location || !maxVolunteer || !file) {
      return;
    }

    try {
      const image = await handleUploadImage(file);

      await createProgram.mutateAsync({
        name: programName,
        description,
        startDate,
        endDate,
        location,
        maxVolunteer,
        coordinatorId,
        image: image,
      });

      setProgramName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setLocation("");
      setMaxVolunteer(0);
      setFile(null);
      setFilePreview(null);

      setSnackbarOpen(true);

      setTimeout(() => {
        void router.push("/coordinator/manage-program");
      }, 3000);
    } catch (error) {
      console.error("Error creating program:", error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
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
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Typography variant="body2">Program Name</Typography>
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
                    <Typography variant="body2">Description</Typography>
                    <TextField
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Typography variant="body2">End Date</Typography>
                    <TextField
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
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
                    <Typography variant="body2">Max Volunteer</Typography>
                    <TextField
                      id="max-volunteer"
                      type="number"
                      value={maxVolunteer}
                      onChange={(e) => setMaxVolunteer(Number(e.target.value))}
                      required
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Typography variant="body2">Program Image</Typography>
                    <Button
                      component="label"
                      role={undefined}
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload file
                      <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
                    </Button>
                    {file && (
                      <Box mt={2} textAlign="center">
                        <Image src={filePreview!} alt={file.name} style={{ maxHeight: 200  }} width={200} height={200} />
                      </Box>
                    )}
                  </FormControl>
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
    </div>
  );
}
