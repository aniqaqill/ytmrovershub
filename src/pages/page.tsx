import React from "react";
import { Button, Typography } from "@mui/material";
import Link from "next/link";
import BaseLayout from "~/components/VolunteerBaseLayout";
import {  useSession } from "next-auth/react";


export default function Page() {
  const { data: sessionData } = useSession();
  
  return (
    <div>
      <BaseLayout pageIndex={1} >
      <Typography>
      {sessionData && <p>Logged in as {sessionData.user?.name}</p>}
      </Typography>
      <Button>
        <Link href="/">Go to Home</Link>
      </Button>
      <Typography variant="h1">Page</Typography>
      </BaseLayout>
    </div>
  );
}