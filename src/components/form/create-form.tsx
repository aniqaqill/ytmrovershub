import React, { useState} from "react";
import { DialogTitle, DialogContent, DialogActions, Button, FormControl, TextField, FormLabel, Box, Snackbar, Alert, IconButton, Dialog, Typography } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from "next/image";
import {  PutObjectCommand } from "@aws-sdk/client-s3";
import { api } from "~/utils/api";
import  s3Client  from "../../pages/api/storage/s3";
import { styled } from '@mui/material/styles';
import { useSession } from "next-auth/react";

interface ProgramType {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  startTime: string;
  endTime: string;
  location: string;
}

interface CreateFormProps {
  program: ProgramType | null;
  onClose: () => void;
}


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

const CreateForm: React.FC<CreateFormProps> = ({ program, onClose }) => {
  const { data: sessionData } = useSession();
  const [feedback, setFeedback] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const createForm = api.formInfo.createForm.useMutation();
  const getStatusEachProgramByVolunteer = api.formInfo.getStatusEachProgramByVolunteer.useQuery ({ volunteerId: sessionData?.user?.id ?? "", programId: program?.id ?? "" });


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    setFiles(selectedFiles);
    setFilePreviews(selectedFiles.map(file => URL.createObjectURL(file)));
  };

  const handleUploadImage = async (file: File) => {
    const key = `form_media/${file.name}`;
    const putObjectCommand = new PutObjectCommand({
      Bucket: "program_media",
      Key: key,
      Body: file,
      ContentType: file.type,
    });
    await s3Client.send(putObjectCommand);
    return key;
  };

  const handleSubmitClick = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmationOpen(false);
    if (!sessionData || !sessionData.user || !program) {
      console.error("User session or program data is missing.");
      return;
    }
    try {
      const imageKeys = await Promise.all(files.map(handleUploadImage));

      await createForm.mutateAsync({
        dateCompleted: new Date(),
        feedback,
        images: imageKeys,
        status: "SUBMITTED",
        volunteerId: sessionData.user.id,
        programId: program.id,
      });

      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error creating form:", error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleRemoveImage = (index: number) => {
    const updatedFiles = [...files];
    const updatedPreviews = [...filePreviews];
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
  };

  return (
    <>
    {getStatusEachProgramByVolunteer.data === "APPROVED" && (
      <>
      <DialogTitle>Submission Form for {program?.name}</DialogTitle>
      <DialogContent>
        <Typography>
          Your submission has been approved. Thank you for your participation!
          <br />
          Please check your email. A certificate of participation has been sent to you.
        </Typography>
      </DialogContent>
      </>
    )}
    {getStatusEachProgramByVolunteer.data === "SUBMITTED" && (
      <>
      <DialogTitle>Submission Form for {program?.name}</DialogTitle>
      <DialogContent>
        <Typography>
          Your submission has been submmited. Please wait for the approval.
        </Typography>
      </DialogContent>
      </>
    )}
    {getStatusEachProgramByVolunteer.data === "REJECTED" && (
      <>
      <DialogTitle>Submission Form for {program?.name}</DialogTitle>
      <DialogContent>
        <Typography>
          Your submission has been rejected. Please contact the coordinator for more information.
        </Typography>
      </DialogContent>
      </>
    )}
    {getStatusEachProgramByVolunteer.data === null && (
      <>
 <DialogTitle>Submission Form for {program?.name}</DialogTitle>
 <DialogContent>
   <form onSubmit={(e) => e.preventDefault()}>
     <FormControl fullWidth margin="normal">
       <FormLabel>Feedback</FormLabel>
       <TextField
         multiline
         rows={4}
         variant="outlined"
         fullWidth
         placeholder="Enter feedback here"
         value={feedback}
         onChange={(e) => setFeedback(e.target.value)}
         required
       />
     </FormControl>
     <FormControl fullWidth margin="normal">
       <FormLabel>Upload Images</FormLabel>
       <Button
         component="label"
         variant="contained"
         startIcon={<CloudUploadIcon />}
       >
         Upload file
         <VisuallyHiddenInput
           type="file"
           accept="image/*"
           multiple
           onChange={handleFileChange}
         />
       </Button>
       <Box mt={2} display="flex" flexWrap="wrap">
         {filePreviews.map((preview, index) => (
           <Box key={index} position="relative" m={1}>
             <Image
               src={preview}
               alt={`Preview ${index + 1}`}
               width={100}
               height={100}
               style={{ objectFit: 'cover' }}
             />
             <IconButton
               onClick={() => handleRemoveImage(index)}
               style={{ position: 'absolute', top: 0, right: 0 }}
             >
               <DeleteIcon color="error" />
             </IconButton>
           </Box>
         ))}
       </Box>
     </FormControl>
     <DialogActions>
       <Button color="error" onClick={onClose}>Cancel</Button>
       <Button onClick={handleSubmitClick} variant="contained" color="primary">
         Submit
       </Button>
     </DialogActions>
   </form>
 </DialogContent>
  </>
      )}
    <>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Form submitted successfully!
        </Alert>
      </Snackbar>
      <Dialog
        open={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
      >
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to submit this form?</Typography>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => setIsConfirmationOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
    </>

  );
};

export default CreateForm;
