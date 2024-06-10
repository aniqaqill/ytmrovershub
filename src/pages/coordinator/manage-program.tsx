import React, { useMemo, useEffect, useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, CircularProgress, Tooltip, Snackbar, Alert,
  Stack, Backdrop, TextField
} from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import ViewDetailProgram from "~/components/program/view-detail-program";
import { DeleteObjectCommand } from "@aws-sdk/client-s3"; 
import s3Client from "../api/storage/s3";

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
  materials: { id: string; quantityUsed: number }[]; // Ensure materials is included
}

export default function Page() {
  const { data: sessionData } = useSession();
  const isLoggedInCoordinator = useMemo(() => { return sessionData?.user && sessionData.user.role === "coordinator";}, [sessionData]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
  const [programToDelete, setProgramToDelete] = useState<ProgramType | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { data: programs, isLoading, isError, refetch: refetchPrograms } = api.programInfo.getAllProgram.useQuery();
  const deleteProgram = api.programInfo.deleteProgramById.useMutation();
  const [upcomingSearchQuery, setUpcomingSearchQuery] = useState("");
  const [pastSearchQuery, setPastSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoggedInCoordinator) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedInCoordinator]);

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

  try {
    // Check if the image is not empty before attempting to delete it from S3
    if (programToDelete?.image) {
      const deleteParams = {
        Bucket: "program_media", // Replace with your S3 bucket name
        Key: programToDelete?.image,
      };
      const deleteCommand = new DeleteObjectCommand(deleteParams);
      await s3Client.send(deleteCommand);

      console.log('Image deleted successfully from S3');
    }

    // Delete the program from the database
    await deleteProgram.mutateAsync({ id: programToDelete?.id ?? "" });
    console.log('Program deleted successfully from the database');

    setIsConfirmationOpen(false);
    await refetchPrograms();
    setSnackbarOpen(true); // Show the snackbar on successful deletion
  } catch (error) {
    console.error('Error during deletion process:', error);
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
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter programs into upcoming and past
  const currentDate = new Date();
  const upcomingPrograms = programs?.filter(program => new Date(program.startDate) >= currentDate);
  const pastPrograms = programs?.filter(program => new Date(program.startDate) < currentDate);

  // Filter programs based on search queries
  const filteredUpcomingPrograms = upcomingPrograms?.filter(program =>
    program.name.toLowerCase().includes(upcomingSearchQuery.toLowerCase())
  );

  const filteredPastPrograms = pastPrograms?.filter(program =>
    program.name.toLowerCase().includes(pastSearchQuery.toLowerCase())
  );

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInCoordinator ? (
          <>
            <Typography variant="h4" margin={2}>Manage Programs</Typography>
            <Divider />
            <br />
            <Link href="/coordinator/create-program">
              <Button variant="contained" color="secondary">Create New Program</Button>
            </Link>
            <br />
            {isLoading ? (
              <Backdrop open>
                <CircularProgress />
              </Backdrop>
            ) : isError ? (
              <Typography variant="body1">Error fetching programs. Please try again later.</Typography>
            ) : (
              <>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" margin={2}>Upcoming Programs</Typography>
                <TextField
                  placeholder="Search by Name"
                  variant="outlined"
                  value={upcomingSearchQuery}
                  onChange={(e) => setUpcomingSearchQuery(e.target.value)}
                  size="small"
                />
              </Stack>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Program Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(filteredUpcomingPrograms?.length ?? 0) > 0 ? (
                      filteredUpcomingPrograms?.map((program) => (
                        <TableRow key={program.id}>
                          <TableCell>{program.name}</TableCell>
                          <TableCell>{program.location}</TableCell>
                          <TableCell>{formatDate(program.startDate)}</TableCell>
                          <TableCell>
                            <Tooltip title="View Program">
                              <Button color="secondary" onClick={() => handleViewProgram(program)}><PreviewIcon /></Button>
                            </Tooltip>
                            <Tooltip title="Delete Program">
                              <Button onClick={() => handleOpenConfirmation(program)}><DeleteIcon color="error" /></Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Alert severity="info">There are no upcoming programs.</Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" margin={2}>Past Programs</Typography>
                <TextField
                  placeholder="Search"
                  variant="outlined"
                  value={pastSearchQuery}
                  onChange={(e) => setPastSearchQuery(e.target.value)}
                  size="small"
                  style={{ margin: 10 }}
                />
              </Stack>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Program Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(filteredPastPrograms?.length ?? 0) > 0 ? (
                      filteredPastPrograms?.map((program) => (
                        <TableRow key={program.id}>
                          <TableCell>{program.name}</TableCell>
                          <TableCell>{program.location}</TableCell>
                          <TableCell>{formatDate(program.startDate)}</TableCell>
                          <TableCell>
                            <Tooltip title="View Program">
                              <Button color="secondary" onClick={() => handleViewProgram(program)}><PreviewIcon /></Button>
                            </Tooltip>
                            <Tooltip title="Delete Program">
                              <Button onClick={() => handleOpenConfirmation(program)}><DeleteIcon color="error" /></Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Alert severity="info">There are no past programs.</Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
            <Dialog open={isConfirmationOpen} onClose={handleCancelDelete}>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete the program {programToDelete?.name} ?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelDelete}>Cancel</Button>
                <Button onClick={handleConfirmDelete} color="error">Confirm</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={selectedProgram !== null} onClose={handleCloseModal}>
              <DialogTitle>Program Detail</DialogTitle>
              <DialogContent>
                {selectedProgram && (
                  <ViewDetailProgram program={selectedProgram}  />
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseModal}>Close</Button>
              </DialogActions>
            </Dialog>
            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
              <Alert onClose={handleSnackbarClose} severity="success">
                Program deleted successfully.
              </Alert>
            </Snackbar>
          </>
        ) : (
          <Backdrop open>
            <CircularProgress />
          </Backdrop>
        )}
      </BaseLayout>
    </div>
  );
}
