import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Grid,
  CardContent,
  Divider,
  CardMedia,
  Alert,
  Button,
  Modal,
  Box,
  Snackbar,
} from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

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
  volunteers: { userId: string; programId: string }[]; // Adjusted structure
}

export default function Page() {
  const { data: sessionData } = useSession();
  const getAllProgramsQuery = api.programInfo.getAllProgram.useQuery();
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
  const { data: fullProgramInfo } = api.programInfo.getProgramById.useQuery({ id: selectedProgram?.id ?? "" });
  const isLoggedInVolunteer = sessionData?.user && sessionData.user.role === "volunteer";
  const [volunteerCount, setVolunteerCount] = useState<number>(0);
  const registerVolunteer = api.programInfo.registerVolunteer.useMutation();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFull, setIsFull] = useState<boolean>(false);

  useEffect(() => {
    if (selectedProgram) {
      const count = selectedProgram.volunteers.length;
      setVolunteerCount(count);
      const userId = sessionData?.user?.id;
      setIsRegistered(selectedProgram.volunteers.some(v => v.userId === userId));
      setIsFull(count >= selectedProgram.maxVolunteer);
    }
  }, [selectedProgram, sessionData]);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleViewMore = (program: ProgramType) => {
    setSelectedProgram(program);
  };

  const handleCloseModal = () => {
    setSelectedProgram(null);
  };

  const formatTimeTo12Hour = (time24: string) => {
    const [hoursStr, minutes] = time24.split(":");
    const hours = parseInt(hoursStr ?? "0", 10);

    if (isNaN(hours)) {
      return "";
    }

    const suffix = hours >= 12 ? "PM" : "AM";
    const hours12 = ((hours % 12) || 12).toString().padStart(2, "0");
    return `${hours12}:${minutes} ${suffix}`;
  };

  const isProgramInFuture = (program: ProgramType) => {
    const endDateTime = new Date(`${program.startDate.toISOString().split('T')[0]}T${program.endTime}`);
    const currentDateTime = new Date();
    return endDateTime > currentDateTime;
  };

  const getDaysLeft = (program: ProgramType) => {
    const startDate = new Date(program.startDate);
    const currentDate = new Date();
    const timeDifference = startDate.getTime() - currentDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysDifference;
  };

  const handleRegister = async (programId: string) => {
    const volunteerId = sessionData?.user?.id;
    if (!volunteerId) {
      return;
    }

    try {
      await registerVolunteer.mutateAsync({ programId, volunteerId });
      setVolunteerCount((prevCount) => prevCount + 1); // Increment the volunteer count locally
      setIsRegistered(true);
      setSuccessMessage("Successfully registered for the program!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSnackbarClose = () => {
    setSuccessMessage(null);
  };

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInVolunteer ? (
          <>
            <Typography variant="h5" gutterBottom>Programs</Typography>
            <Divider />
            {getAllProgramsQuery.isLoading ? (
              <Typography variant="body1">Loading...</Typography>
            ) : getAllProgramsQuery.error ? (
              <Alert severity="error">Error fetching programs. Please try again later.</Alert>
            ) : (
              <>
                {getAllProgramsQuery.data && getAllProgramsQuery.data.length === 0 ? (
                  <Alert severity="info">There are no programs available.</Alert>
                ) : (
                  <Grid container spacing={3} mt={2}>
                    {getAllProgramsQuery.data
                      ?.filter(isProgramInFuture)
                      .map((program) => {
                        const daysLeft = getDaysLeft(program);
                        const isFull = program.volunteers.length >= program.maxVolunteer;

                        return (
                          <Grid item xs={12} sm={6} md={4} key={program.id}>
                            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ position: 'relative' }}>
                                <CardMedia
                                  component="img"
                                  height="200"
                                  image={endpoint + bucket + program.image}
                                  alt="program image"
                                />
                                { !isFull && daysLeft < 7 && (
                                  <Alert
                                    severity="warning"
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      boxSizing: 'border-box',
                                      borderRadius: 0,
                                      opacity: 0.8,
                                    }}
                                  >
                                    {daysLeft} {daysLeft === 1 ? "day" : "days"} left to register for the program
                                  </Alert>
                                )}
                                {isFull && (
                                  <Alert
                                    severity="error"
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      right: 0,
                                      width: '100%',
                                      boxSizing: 'border-box',
                                      borderRadius: 0,
                                      opacity: 0.8,
                                    }}
                                  >
                                    The program has reach its maximum number of volunteers
                                  </Alert>
                                )}
                              </Box>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>{program.name}</Typography>
                                <Typography variant="body1">Date: {program.startDate ? formatDate(program.startDate) : "N/A"}</Typography>
                                <Typography variant="body1">Time: {formatTimeTo12Hour(program.startTime)} - {formatTimeTo12Hour(program.endTime)}</Typography>
                                <Typography variant="body1">Location: {program.location}</Typography>
                              </CardContent>
                              <Box mt="auto" p={2}>
                                <Button variant="contained" onClick={() => handleViewMore(program)}>View More</Button>
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}
                  </Grid>
                )}
              </>
            )}
          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>

      {/* Modal Popup for Program Details */}
      <Modal open={!!selectedProgram} onClose={handleCloseModal}>
        <Card 
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: '90%', sm: '80%', md: '60%', lg: '50%' },
            maxHeight: "80%",
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }} 
        >
          <CardMedia component="img" height="200" image={endpoint + bucket + selectedProgram?.image} alt="program image" />
          <CardContent>
            <Typography variant="h6" gutterBottom>{selectedProgram?.name}</Typography>
            <Typography variant="body1">{selectedProgram?.description}</Typography>
            <Typography variant="body1">Date: {selectedProgram?.startDate ? formatDate(selectedProgram.startDate) : "N/A"}</Typography>
            <Typography variant="body1">Time: {selectedProgram?.startTime ? formatTimeTo12Hour(selectedProgram.startTime) : 'N/A'} - {selectedProgram?.endTime ? formatTimeTo12Hour(selectedProgram.endTime) : 'N/A'}</Typography>
            <Typography variant="body1">Volunteers Needed: {selectedProgram?.maxVolunteer}</Typography>
            <Typography variant="body1">Location: {selectedProgram?.location}</Typography>
            <br />
            <Typography variant="body1" gutterBottom>For any enquiries: {fullProgramInfo?.coordinator.email}</Typography>
            <Divider />
            <br />
            <Typography variant="body1">Registered Volunteers: {volunteerCount}</Typography>
            
            {isFull ? (
              <Alert severity="error">This program is full and cannot accept more volunteers.</Alert>
            ) : (
              <Button
                variant="contained"
                color="primary"
                disabled={isRegistered}
                onClick={() => handleRegister(selectedProgram!.id)}
              >
                {isRegistered ? "Registered" : "Register"}
              </Button>
            )}
          </CardContent>
        </Card>
      </Modal>

      {/* Snackbar for success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={successMessage}
      />
    </div>
  );
}
