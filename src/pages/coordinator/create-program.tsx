import { Typography, Divider, Box, FormControl, Button, TextField,  Grid } from "@mui/material";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useMemo } from "react";
import BaseLayout from "~/components/BaseLayout";
import { api } from "~/utils/api";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Page() {
  const { data: sessionData } = useSession();
  const [programName, setProgramName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [maxVolunteer, setMaxVolunteer] = useState(0);

  const isLoggedInCoordinator = useMemo(() => {
    return sessionData?.user && sessionData.user.role === "coordinator";
  }, [sessionData]);

  const coordinatorId = sessionData?.user?.id ?? "";

  const createProgram = api.programInfo.createProgram.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitting form");
    console.log("coordinatorId", coordinatorId);
  
    // Check if any required fields are empty
    if (!programName || !description || !startDate || !endDate || !location || !maxVolunteer) {
      // Display an error message or prevent form submission
      return;
    }
  
    try {
      // Make the API call to create the program
      await createProgram.mutateAsync({
        name: programName,
        description: description,
        startDate: startDate,
        endDate: endDate,
        location: location,
        maxVolunteer: maxVolunteer,
        coordinatorId: coordinatorId, // Connect program with coordinator
      });
  
      // Reset form fields after successful submission
      setProgramName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setLocation("");
      setMaxVolunteer(0);
    } catch (error) {
      // Handle any errors that occur during the API call
      console.error("Error creating program:", error);
      // Optionally display an error message to the user
    }
  };
  

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInCoordinator ? (
          <>
          <Link href="/coordinator/manage-program" >
                <Button startIcon={<ArrowBackIcon />}>Back</Button>
          </Link>
              <Typography variant="h5" margin={2}>Create New Program</Typography>
              <Divider />
              <br />
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
                margin={2}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} >
                    <FormControl fullWidth>
                      <Typography variant="body2">Program Name</Typography>
                      <TextField
                        id="program-name"
                        value={programName}
                        onChange={(e) => setProgramName(e.target.value)}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} >
                    <FormControl fullWidth>
                      <Typography variant="body2">Description</Typography>
                      <TextField
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <Typography variant="body2">Start Date</Typography>
                      <TextField
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <Typography variant="body2">End Date</Typography>
                      <TextField
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <Typography variant="body2">Location</Typography>
                      <TextField
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <Typography variant="body2">Max Volunteer</Typography>
                      <TextField
                        id="max-volunteer"
                        value={maxVolunteer}
                        onChange={(e) => setMaxVolunteer(Number(e.target.value))}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained">Create Program</Button>
                  </Grid>
                </Grid>
              </Box>
            
          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>
    </div>
  );
}
