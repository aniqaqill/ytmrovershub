import React from "react";
import { Typography } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: sessionData } = useSession();

  // Check if the user is logged in and has the "volunteer" role
  const isLoggedInVolunteer = sessionData?.user && sessionData.user.role === "coordinator";

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInVolunteer ? (
          <>
            <Typography variant="h5">Page for coordinator to manage program</Typography>
          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>
    </div>
  );
}
