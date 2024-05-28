import React, { useState, useEffect } from "react";
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Button } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

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
  const getRegisteredPrograms = api.programInfo.getVolunteerPrograms.useQuery({ volunteerId: sessionData?.user?.id ?? "" });
  // Check if the user is logged in and has the "volunteer" role
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
  }, [getRegisteredPrograms, isLoggedInVolunteer]);

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

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInVolunteer ? (
          <>
            <Typography variant="h5" gutterBottom>
              Registered Programs
            </Typography>
            {loading ? (
              <Typography variant="body1">Loading...</Typography>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : registeredPrograms.length === 0 ? (
              <Alert severity="info">You are not registered in any programs.</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Program Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {registeredPrograms.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell>{program.name}</TableCell>
                        <TableCell>{program.description}</TableCell>
                        <TableCell>{formatDate(program.startDate)}</TableCell>
                        <TableCell>
                          {formatTimeTo12Hour(program.startTime)} - {formatTimeTo12Hour(program.endTime)}
                        </TableCell>
                        <TableCell>{program.location}</TableCell>
                        <TableCell>
                          <Button variant="contained" color="primary">
                            Form
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>
    </div>
  );
}
