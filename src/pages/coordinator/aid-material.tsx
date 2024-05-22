import React, { useMemo } from "react";
import { Typography } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: sessionData } = useSession();

  const isLoggedInCoordinator = useMemo(() => {
    return sessionData?.user && sessionData.user.role === "coordinator";
  }, [sessionData]);

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInCoordinator ? (
          <>
            <Typography variant="h5">Page for coordinator to manage aid material</Typography>
          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>
    </div>
  );
}
