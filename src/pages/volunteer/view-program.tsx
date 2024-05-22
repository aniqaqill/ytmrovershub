import React, { useState } from "react";
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
}

export default function Page() {
  const { data: sessionData } = useSession();
  const getAllProgramsQuery = api.programInfo.getAllProgram.useQuery();
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);

  // Check if the user is logged in and has the "volunteer" role
  const isLoggedInVolunteer = sessionData?.user && sessionData.user.role === "volunteer";

  // Helper function to format the date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle opening the modal popup with program details
  const handleViewMore = (program: ProgramType) => {
    setSelectedProgram(program);
  };

  // Handle closing the modal popup
  const handleCloseModal = () => {
    setSelectedProgram(null);
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
                    {getAllProgramsQuery.data?.map((program) => (
                      <Grid item xs={12} sm={6} md={4} key={program.id}>
                        <Card>
                          <CardMedia component="img" height="200" image={endpoint + bucket + program.image} alt="program image" />
                          <CardContent>
                            <Typography variant="h6" gutterBottom>{program.name}</Typography>
                            <Typography variant="body1">Date: {program.startDate ? formatDate(program.startDate) : "N/A"} </Typography>
                            <Typography variant="body1">Time: {formatTimeTo12Hour(program.startTime)} - {formatTimeTo12Hour(program.endTime)}</Typography>
                            <Typography variant="body1">Location: {program.location}</Typography>
                            <Button variant="contained" onClick={() => handleViewMore(program)}>View More</Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
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
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, bgcolor: "background.paper", boxShadow: 24, p: 4 }}>
          <Typography variant="h5" gutterBottom>{selectedProgram?.name}</Typography>
          <Typography variant="body1">Date: {selectedProgram ? formatDate(selectedProgram.startDate) : "N/A"}</Typography>
          <Typography variant="body1">Time: {selectedProgram ? formatTimeTo12Hour(selectedProgram.startTime) : ""} - {selectedProgram ? formatTimeTo12Hour(selectedProgram.endTime) : ""}</Typography>
          <Typography variant="body1">Location: {selectedProgram?.location}</Typography>
          <Typography variant="body1">Description: {selectedProgram?.description}</Typography>
        </Box>
      </Modal>
    </div>
  );
}
