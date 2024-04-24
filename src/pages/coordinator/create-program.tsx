import React from "react";
import { Button, Divider, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: sessionData } = useSession();

  // Check if the user is logged in and has the "volunteer" role
  const isLoggedInCoordinator = sessionData?.user && sessionData.user.role === "coordinator";

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInCoordinator ? (
          <>
            <Typography variant="h5" margin={2} >Create New Program</Typography>
            <Divider />
            <br />
          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>
    </div>
  );
}
