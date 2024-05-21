import React, { useMemo, useEffect, useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Table, TableBody, TableCell, TableHead, TableRow, Typography, CircularProgress, Tooltip, Snackbar, Alert } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import ViewDetailProgram from "~/components/program/view-detail-program";

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

export default function Page() {
  const { data: sessionData } = useSession();
  const isLoggedInCoordinator = useMemo(() => {
    return sessionData?.user && sessionData.user.role === "coordinator";
  }, [sessionData]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
  const [programToDelete, setProgramToDelete] = useState<ProgramType | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { data: programs, isLoading, isError, refetch: refetchPrograms } = api.programInfo.getAllProgram.useQuery();
  const deleteProgram = api.programInfo.deleteProgramById.useMutation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refetchPrograms();
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    void fetchData();
  }, [refetchPrograms]);

  const handleViewProgram = (program: ProgramType) => {
    setSelectedProgram(program);
  };

  const handleCloseModal = () => {
    setSelectedProgram(null);
  };

  const handleOpenConfirmation = (program: ProgramType) => {
    setProgramToDelete(program);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!programToDelete) return;
    try {
      await deleteProgram.mutateAsync({ id: programToDelete.id });
      setIsConfirmationOpen(false);
      await refetchPrograms();
      setSnackbarOpen(true); // Show the snackbar on successful deletion
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setProgramToDelete(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

    // Helper function to format the date
    const formatDate = (dateString :Date ) => {
      //format the date to a more readable format which is dd/mm/yyyy
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
     
    };

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInCoordinator ? (
          <>
            <Typography variant="h5" margin={2}>Manage Programs</Typography>
            <Divider />
            <br /> 
            <Link href="/coordinator/create-program">
              <Button variant="contained"> Create New Program </Button>
            </Link>
            <br />
            {isLoading ? (
              <CircularProgress />
            ) : isError ? (
              <Typography variant="body1">Error fetching programs. Please try again later.</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Program Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programs?.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>{program.name}</TableCell>
                      <TableCell>{program.location}</TableCell>
                      <TableCell>
                        {formatDate(program.startDate)} - {program.endDate ? formatDate(program.endDate) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Program">
                          <Button onClick={() => handleViewProgram(program)}><PreviewIcon/></Button>
                        </Tooltip>
                        <Tooltip title="Delete Program">
                          <Button onClick={() => handleOpenConfirmation(program)}><DeleteIcon color="error"/></Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>

      {/* Render the ViewDetailProgram component inside a dialog */}
      <Dialog open={!!selectedProgram} onClose={handleCloseModal}>
        <DialogTitle>View Program Details</DialogTitle>
        <DialogContent>
          {selectedProgram && <ViewDetailProgram program={selectedProgram} />}
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deleting a program */}
      <Dialog open={isConfirmationOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this program?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for successful deletion */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Program deleted successfully!
        </Alert>
      </Snackbar>
    </div>
  );
}
