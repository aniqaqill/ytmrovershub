import { Typography, Box, Container, Fade, Slide, Grid, Card, CardContent, CardMedia, styled } from "@mui/material";
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ProgramIcon from '@mui/icons-material/Event';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReportIcon from '@mui/icons-material/Report';
import { useEffect, useState } from "react";
import BaseLayout from "~/components/BaseLayout";
import Image from "next/image";
import header from "public/header.jpg";

const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: theme.shadows[3],
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%'
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 10, 
  width: '100%',
  margin: theme.spacing(2, 0)
}));

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <BaseLayout pageIndex={0}>
      <Container>
        <Fade in={loaded} timeout={1000}>
          <Box my={4} display="flex" justifyContent="center">
            <Image src={header} alt="Project Image" width={800} height={400}/>
          </Box>
        </Fade>
        <Slide direction="up" in={loaded} timeout={1000}>
          <Box>
            <Typography variant="body1" paragraph>
              Managing volunteers and aid materials is a complex task for humanitarian aid organizations, with challenges ranging from manual processes to disorganized program management. This project focuses on addressing the specific challenges faced by TMROVERS, a humanitarian aid team within Yayasan TM, in their volunteer and aid material management.
            </Typography>
          </Box>
        </Slide>
        <Grid container spacing={4} mt={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <StyledCardMedia>
                <VolunteerActivismIcon fontSize="large" />
              </StyledCardMedia>
              <CardContent>
                <Typography variant="h6" align="center">Analyze Requirements</Typography>
                <Typography variant="body2" align="center">
                  Analyze the requirements and needs of the humanitarian aid organization to develop a comprehensive system that helps the volunteer management process, improves program and aid material management.
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <StyledCardMedia>
                <ProgramIcon fontSize="large" />
              </StyledCardMedia>
              <CardContent>
                <Typography variant="h6" align="center">Centralized System</Typography>
                <Typography variant="body2" align="center">
                  Develop a centralized online system that allows for the management of volunteers, aid materials, and programs through features like volunteer registration, program control, aid material monitoring, and reporting.
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <StyledCardMedia>
                <InventoryIcon fontSize="large" />
              </StyledCardMedia>
              <CardContent>
                <Typography variant="h6" align="center">Appropriate Technologies</Typography>
                <Typography variant="body2" align="center">
                  Develop the web-based system using appropriate technologies and programming languages, ensuring it is user-friendly and accessible to both volunteers and coordinators.
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <StyledCardMedia>
                <ReportIcon fontSize="large" />
              </StyledCardMedia>
              <CardContent>
                <Typography variant="h6" align="center">Testing</Typography>
                <Typography variant="body2" align="center">
                  Test the system thoroughly to identify and fix any issues or bugs, ensuring it is reliable, secure, and performs well under various conditions.
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Container>
    </BaseLayout>
  );
}
