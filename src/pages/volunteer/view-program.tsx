import React from "react";
import { Card, Typography, Grid, CardContent, Divider, CardMedia } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";


const endpoint = "https://rnkqnviezsjkhfovplik.supabase.co/storage/v1/object/public/";
const bucket = "program_media/";



export default function Page() {
  const { data: sessionData } = useSession();
  const getAllProgramsQuery = api.programInfo.getAllProgram.useQuery();
  


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

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInVolunteer ? (
          <>
            <Typography variant="h5" gutterBottom>Programs</Typography>
            <Divider />
            <Grid container spacing={3} mt={2}>
              {getAllProgramsQuery.data?.map((program) => (
                <Grid item xs={12} sm={6} md={4} key={program.id}>
                  <Card>
                    <CardMedia component="img" height="200" image={endpoint + bucket + program.image} alt="program image" />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{program.name}</Typography>
                      <Typography variant="body1">{program.description}</Typography>
                      <Typography variant="body1">Date: {program.startDate ? formatDate(program.startDate) : "N/A"} - {program.endDate ? formatDate(program.endDate) : "N/A"}  </Typography>
                      <Typography variant="body1">Location: {program.location}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>
    </div>
  );
}
