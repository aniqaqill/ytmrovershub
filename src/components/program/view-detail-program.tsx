import React, { useState, useEffect, useMemo } from "react";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  FormControl,
  Box,
} from "@mui/material";
import { api } from "~/utils/api";
import Image from "next/image";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { env } from "~/env";


const endpoint = "https://rnkqnviezsjkhfovplik.supabase.co/storage/v1/object/public/";
const bucket = "program_media/";

interface ProgramType {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  startTime: string;
  endTime: string;
  location: string;
  maxVolunteer: number;
  coordinatorId: string;
  image: string;
}


interface ViewDetailProgramProps {
  program: ProgramType;
}

  // Helper function to format the date
  const formatDate = (dateString :Date ) => {
    //format the date to a more readable format which is dd/mm/yyyy
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
   
  };

  const formatTimeTo12Hour = (time24: string) => {
    const [hoursStr, minutes] = time24.split(":");
    const hours = parseInt(hoursStr ?? "0", 10); // Use "0" as the default value if hoursStr is undefined
  
    if (isNaN(hours)) {
      return ""; // Return an empty string if the parsing fails
    }
  
    const suffix = hours >= 12 ? "PM" : "AM";
    const hours12 = ((hours % 12) || 12).toString().padStart(2, "0");
    return `${hours12}:${minutes} ${suffix}`;
  };

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
  
  

export default function ViewDetailProgram(props: ViewDetailProgramProps) {
  const { program } = props;
  const { data: fullProgramInfo, refetch: refetchProgram } =
    api.programInfo.getProgramById.useQuery({ id: program.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProgram, setEditedProgram] = useState<ProgramType>(program);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const updateProgram = api.programInfo.updateProgramById.useMutation();
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const s3Client = useMemo(() => new S3Client({
    forcePathStyle: true,
    region: "ap-southeast-1",
    endpoint: env.NEXT_PUBLIC_s3_endpoint,
    credentials: {
      accessKeyId: env.NEXT_PUBLIC_s3_access_key,
      secretAccessKey: env.NEXT_PUBLIC_s3_secret_access,
    },
  }), []);

  useEffect(() => {
    setEditedProgram(program);
    
  }, [program]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleOpenConfirmation = () => {
    setIsConfirmationOpen(true);
  };

  const handleCloseConfirmation = async () => {
    
    setIsConfirmationOpen(false);
    await refetchProgram(); // Refetch the program data to reset the changes
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile!);
      setFilePreview(URL.createObjectURL(selectedFile!));
    }
  };


  const handleSaveClick = async () => {
    try {
      if (!editedProgram) return;
      const editedProgramAsString = {
        ...editedProgram,
        startDate: editedProgram.startDate.toISOString(),
        maxVolunteer: Number(editedProgram.maxVolunteer), // Ensure maxVolunteer is a number
        materials: []
      };
  
      // Check if a file is selected for upload
      if (file) {
        // If there is an old image, delete it from storage
        if (program.image) {
          const deleteObjectCommand = new DeleteObjectCommand({
            Bucket: "program_media",
            Key: program.image,
          });
          await s3Client.send(deleteObjectCommand);
        }
  
        // Upload the new image to storage
        const key = `program/${file.name}`;
        const putObjectCommand = new PutObjectCommand({
          Bucket: "program_media",
          Key: key,
          Body: file,
          ContentType: file.type,
        });
        await s3Client.send(putObjectCommand);
  
        // Update the program data with the URL or key of the new image
        editedProgramAsString.image = key;
      }
  
      // Perform the update operation
      await updateProgram.mutateAsync(editedProgramAsString);
  
      // Reset the file state
      setFile(null);
  
      // Close the confirmation dialog and update state
      setIsEditing(false);
      setIsConfirmationOpen(false);
  
      // Refetch updated data
      await refetchProgram();
  
      // Show success message
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating program:", error);
      // Handle error as needed
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "maxVolunteer") {
      setEditedProgram((prevState) => ({
        ...prevState,
        [name]: Number(value), // Explicitly convert to number
      }));
    } else if (name === "startDate" || name === "endDate") {
      setEditedProgram((prevState) => ({
        ...prevState,
        [name]: new Date(value),
      }));
    } else {
      setEditedProgram((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Grid> 
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          {isEditing ? <FormControl fullWidth>
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
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                    )}
                    </FormControl>
          :  
          <Image
          src={endpoint + bucket + program.image}
          alt="program image"
          width={500}
          height={500}
          style={{ width: '100%', objectFit: 'contain'}}
        />}
         
        </Typography>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1">Name</Typography>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      name="name"
                      value={editedProgram.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <Typography>{program.name}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1">Description</Typography>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      name="description"
                      value={editedProgram.description}
                      onChange={handleInputChange}
                      multiline
                      rows={4}
                      fullWidth
                    />
                  ) : (
                    <Typography>{program.description}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1">Date</Typography>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      id="start-date"
                      type="date"
                      name="startDate"
                      value={editedProgram.startDate
                        .toISOString()
                        .split("T")[0]}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <Typography>
                      {program.startDate
                        ? formatDate(program.startDate)
                        : "N/A"}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1">Start Time</Typography>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      name="startTime"
                      value={editedProgram.startTime}
                      onChange={handleInputChange}
                      type="time"
                    />
                  ) : (
                    <Typography>
                    {formatTimeTo12Hour(program.startTime)}
                  </Typography>
            
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
              <TableCell>
                  <Typography variant="subtitle1">End Time</Typography>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      name="endTime"
                      value={editedProgram.endTime}
                      onChange={handleInputChange}
                      type="time"
                    />
                  ) : (
                    <Typography>
                    {formatTimeTo12Hour(program.endTime)}
                  </Typography>
            
                  )}
                </TableCell>

              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1">Location</Typography>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      name="location"
                      value={editedProgram.location}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <Typography>{program.location}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1">Max Volunteer</Typography>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      name="maxVolunteer"
                      value={editedProgram.maxVolunteer}
                      onChange={handleInputChange}
                      type="number"
                      InputProps={{ inputProps: { min: 0 } }} // Set minimum value to 0
                    />
                  ) : (
                    <Typography>{program.maxVolunteer}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1">Coordinator</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{fullProgramInfo?.coordinator.name}</Typography>
                </TableCell>
              </TableRow>
              <TableRow></TableRow>
                <TableCell>
                  <Typography variant="subtitle1">Materials</Typography>
                </TableCell>
                <TableCell>
              {fullProgramInfo?.materials && fullProgramInfo.materials.length > 0 ? (
                <TableContainer>
                  <Table> 
                    <TableBody>
                      {fullProgramInfo.materials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell>
                            {material.aidMaterial.name} - {material.quantityUsed}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No materials used</Alert>
              )}
            </TableCell>

              {isEditing ? (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Button variant="contained" onClick={handleOpenConfirmation}>
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Button variant="contained" onClick={handleEditClick}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* Confirmation dialog for saving changes */}
      <Dialog open={isConfirmationOpen} onClose={handleCloseConfirmation}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent sx={{ minWidth: "50%" }}>
          <DialogContentText>
            Are you sure you want to update this program?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleCloseConfirmation}>Cancel</Button>
          <Button onClick={handleSaveClick} color="primary">
            Yes, Update
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          Program updated successfully!
        </Alert>
      </Snackbar>
    </Grid>
  );
}
