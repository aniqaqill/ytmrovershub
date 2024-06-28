import React, { useState, useEffect } from "react";
import {
  Typography, Alert, Button, Dialog, Backdrop, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar,
  Divider
} from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import CreateForm from "~/components/form/create-form";
import FormStatus from "~/components/form/getEachFormStatus";
import DeleteIcon from '@mui/icons-material/Delete';

interface ProgramType {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  startTime: string;
  endTime: string;
  location: string;
}

export default function Page() {
  const { data: sessionData } = useSession();
  const [registeredPrograms, setRegisteredPrograms] = useState<ProgramType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
  const [programToUnregister, setProgramToUnregister] = useState<ProgramType | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const getRegisteredPrograms = api.programInfo.getVolunteerPrograms.useQuery({ volunteerId: sessionData?.user?.id ?? "" });
  const unregisterVolunteer = api.programInfo.unregisterVolunteer.useMutation();
  const isLoggedInVolunteer = sessionData?.user && sessionData.user.role === "volunteer";

  useEffect(() => {
    if (!isLoggedInVolunteer) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedInVolunteer]);

  useEffect(() => {
    if (isLoggedInVolunteer) {
      if (getRegisteredPrograms.error) {
        setError(getRegisteredPrograms.error.message);
      } else if (getRegisteredPrograms.data) {
        setRegisteredPrograms(getRegisteredPrograms.data);
      }
      setLoading(false);
    }
  }, [isLoggedInVolunteer, getRegisteredPrograms]);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  const handleFormOpen = (program: ProgramType) => {
    const now = new Date();
    const eventDate = new Date(program.startDate);
    const [startHours, startMinutes] = program.startTime.split(":").map(Number);
    
    // Use default values for hours and minutes in case they are undefined
    const hours = startHours ?? 0;
    const minutes = startMinutes ?? 0;
  
    eventDate.setHours(hours);
    eventDate.setMinutes(minutes);
  
    // Set eventDate to one day before the actual start date
    const openDate = new Date(eventDate);
    openDate.setDate(eventDate.getDate() - 1);
  
    // Check if the current time is within the range starting one day before the event
    const endDate = new Date(program.startDate);
    const [endHours, endMinutes] = program.endTime.split(":").map(Number);
    endDate.setHours(endHours ?? 0, endMinutes ?? 0);
  
    if (now >= openDate && now <= endDate) {
      setSelectedProgram(program);
      setOpenForm(true);
    } else {
      setShowAlert(true);
    }
  };
  
  

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedProgram(null);
  };

  const handleConfirmOpen = (program: ProgramType) => {
    setProgramToUnregister(program);
    setOpenConfirm(true);
  };

  const handleConfirmClose = () => {
    setOpenConfirm(false);
    setProgramToUnregister(null);
  };

  const handleUnregister = async () => {
    if (programToUnregister && sessionData?.user?.id) {
      try {
        await unregisterVolunteer.mutateAsync({
          programId: programToUnregister.id,
          volunteerId: sessionData.user.id,
        });
        setRegisteredPrograms((prev) =>
          prev.filter((program) => program.id !== programToUnregister.id)
        );
        setOpenConfirm(false);
      } catch (error) {
        setError("Failed to unregister from the program. Please try again.");
      }
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const today = new Date();
  const upcomingPrograms = registeredPrograms.filter((program) => new Date(program.startDate) >= today);
  const pastPrograms = registeredPrograms.filter((program) => new Date(program.startDate) < today);

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInVolunteer ? (
          <>
            <Typography variant="h4" gutterBottom>
              Registered Programs
            </Typography>
            <Divider />
            {loading ? (
              <Backdrop open>
                <CircularProgress />
              </Backdrop>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Upcoming Programs
                </Typography>
                {upcomingPrograms.length === 0 ? (
                  <Alert severity="info">You have no upcoming programs.</Alert>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upcomingPrograms.map((program) => (
                        <TableRow key={program.id}>
                          <TableCell>{program.name}</TableCell>
                          <TableCell>{formatDate(program.startDate)}</TableCell>
                          <TableCell>{formatTimeTo12Hour(program.startTime)}</TableCell>
                          <TableCell>{formatTimeTo12Hour(program.endTime)}</TableCell>
                          <TableCell>{program.location}</TableCell>
                          <TableCell><FormStatus program={program}/></TableCell>
                          <TableCell>
                            <Button onClick={() => handleFormOpen(program)} variant="contained" color="secondary">
                              Submit Form
                            </Button>
                            <Tooltip title="Cancel Registration">
                              <Button onClick={() => handleConfirmOpen(program)} variant="text" color="error">
                                <DeleteIcon />
                              </Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
                  Past Programs (History)
                </Typography>
                {pastPrograms.length === 0 ? (
                  <Alert severity="info">You have no past programs.</Alert>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pastPrograms.map((program) => (
                        <TableRow key={program.id}>
                          <TableCell>{program.name}</TableCell>
                          <TableCell>{formatDate(program.startDate)}</TableCell>
                          <TableCell>{formatTimeTo12Hour(program.startTime)}</TableCell>
                          <TableCell>{formatTimeTo12Hour(program.endTime)}</TableCell>
                          <TableCell>{program.location}</TableCell>
                          <TableCell><FormStatus program={program}/></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>

      <Dialog open={openForm} onClose={handleFormClose} fullWidth={true}>
        <CreateForm program={selectedProgram} onClose={handleFormClose} />
      </Dialog>

      <Dialog open={openConfirm} onClose={handleConfirmClose}>
        <DialogTitle>Confirm Unregistration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to unregister from the program {programToUnregister?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUnregister} color="error" autoFocus>
            Unregister
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showAlert} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity="warning">
          You can only submit the form once the program has started.
        </Alert>
      </Snackbar>
    </div>
  );
}
