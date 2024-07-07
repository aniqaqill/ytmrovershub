import { Typography, Box, Container, Fade, Slide } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import BaseLayout from "~/components/BaseLayout";
import header from "public/header.jpg";


export default function Home() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <BaseLayout pageIndex={0}>
      <Container>
        <Fade in={loaded} timeout={1000}>
          <Typography variant="h4" gutterBottom>
            Welcome to TM ROVERS
          </Typography>
        </Fade>
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
      </Container>
    </BaseLayout>
  );
}
