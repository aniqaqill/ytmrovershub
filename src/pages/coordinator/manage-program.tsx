import React from "react";
import { Button, Divider, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Page() {
  const { data: sessionData } = useSession();

  // Check if the user is logged in and has the "volunteer" role
  const isLoggedInCoordinator = sessionData?.user && sessionData.user.role === "coordinator";

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInCoordinator ? (
          <>
            <Typography variant="h5" margin={2}>Manage Programs</Typography>
            <Divider />
            <br /> 
            <Link href="/coordinator/create-program">
            <Button variant="contained"> Create New Program </Button>
            </Link>
            <br />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Program Name</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Summer Camp</TableCell>
                  <TableCell>2022-06-01</TableCell>
                  <TableCell>2022-08-31</TableCell>
                  <TableCell>
                    <Button variant="contained">Edit</Button>
                    <Button variant="contained">Delete</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>
    </div>
  );
}
