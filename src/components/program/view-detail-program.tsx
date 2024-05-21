import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { api } from "~/utils/api";
import Image from "next/image";

const endpoint = "https://rnkqnviezsjkhfovplik.supabase.co/storage/v1/object/public/";
const bucket = "program_media/";

interface ProgramType {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
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

export default function ViewDetailProgram(props: ViewDetailProgramProps) {
  const { program } = props;
  const { data: fullProgramInfo, refetch: refetchProgram } =
    api.programInfo.getProgramById.useQuery({ id: program.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProgram, setEditedProgram] = useState<ProgramType>(program);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const updateProgram = api.programInfo.updateProgramById.useMutation();


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

  const handleSaveClick = async () => {
    try {
      if (!editedProgram) return;
      const editedProgramAsString = {
        ...editedProgram,
        startDate: editedProgram.startDate.toISOString(),
        endDate: editedProgram.endDate
          ? editedProgram.endDate.toISOString()
          : "",
        maxVolunteer: Number(editedProgram.maxVolunteer), // Ensure maxVolunteer is a number
      };
      await updateProgram.mutateAsync(editedProgramAsString);
      setIsEditing(false);
      setIsConfirmationOpen(false); // Close the confirmation dialog
      await refetchProgram(); // Refetch updated data
      setSnackbarOpen(true); // Show the snackbar on successful update
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
          <Image src={endpoint + bucket + program.image} alt="program image" width={300} height={200} />
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
                  <Typography variant="subtitle1">Start Date</Typography>
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
                  <Typography variant="subtitle1">End Date</Typography>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      id="end-date"
                      type="date"
                      name="endDate"
                      value={
                        editedProgram.endDate
                          ? editedProgram.endDate.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={handleInputChange}
                    />
                  ) : (
                    <Typography>
                      {program.endDate
                        ? formatDate(program.endDate)
                        : "N/A"}
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
