import React, { useState, useEffect } from "react";
import { Typography, Alert, Button, Dialog, Backdrop, CircularProgress,Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import CreateForm from "~/components/form/create-form";
import FormStatus from "~/components/form/getEachFormStatus";

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
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
  const getRegisteredPrograms = api.programInfo.getVolunteerPrograms.useQuery({ volunteerId: sessionData?.user?.id ?? "" });
  const isLoggedInVolunteer = sessionData?.user && sessionData.user.role === "volunteer";
 
  

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
    setSelectedProgram(program);
    setOpenForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedProgram(null);
  };

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInVolunteer ? (
          <>
            <Typography variant="h5" gutterBottom>
              Registered Programs
            </Typography>
            {loading ? (
              <Backdrop open>
                <CircularProgress />
              </Backdrop>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : registeredPrograms.length === 0 ? (
              <Alert severity="info">You are not registered in any programs.</Alert>
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
                  {registeredPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>{program.name}</TableCell>
                      <TableCell>{formatDate(program.startDate)}</TableCell>
                      <TableCell>{formatTimeTo12Hour(program.startTime)}</TableCell>
                      <TableCell>{formatTimeTo12Hour(program.endTime)}</TableCell>
                      <TableCell>{program.location}</TableCell>
                      <TableCell><FormStatus program={program}/></TableCell>
                      <TableCell>
                        <Button onClick={() => handleFormOpen(program)} variant="contained" color="secondary">
                          Submit Forn
                        </Button>
                        <Button variant="contained" color="error">
                          Cancel Registration
                        </Button>
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

      <Dialog open={openForm} onClose={handleFormClose} fullWidth={true}>
        <CreateForm program={selectedProgram} onClose={handleFormClose} />
      </Dialog>
    </div>
  );
}
