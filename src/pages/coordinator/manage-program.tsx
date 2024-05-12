import React, { useMemo, useEffect, useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent,  Divider, Table, TableBody, TableCell, TableHead, TableRow, Typography, CircularProgress, Tooltip} from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";
import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
import PreviewIcon from '@mui/icons-material/Preview';
import ViewDetailProgram from "~/components/program/view-detail-program";


interface ProgramType {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  location: string;
  maxVolunteer: number;
  coordinatorId: string;
}



export default function Page() {
  const { data: sessionData } = useSession();
  const isLoggedInCoordinator = useMemo(() => {
    return sessionData?.user && sessionData.user.role === "coordinator";
  }, [sessionData]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
  const { data: programs, isLoading, isError, refetch: refetchPrograms } = api.programInfo.getAllProgram.useQuery();
  const deleteProgram = api.programInfo.deleteProgramById.useMutation();

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await refetchPrograms();
      } catch (error) {
        // Handle error if needed
        console.error('Error fetching programs:', error);
      }
    };
  
    void fetchData();
  }, [refetchPrograms]);


  const handleViewProgram = (program: ProgramType) => {
    setSelectedProgram(program);
  };
  

  const handleCloseModal = () => {
    setSelectedProgram(null);
  };

  const handleDeleteProgram = async (program: ProgramType) => {
    try {
      await deleteProgram.mutateAsync({ id: program.id });
      await refetchPrograms();
    } catch (error) {
      // Handle error if needed
      console.error('Error deleting program:', error);
    }
  }

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
            {isLoading ? (
              <CircularProgress /> // Show loading indicator while fetching data
            ) : isError ? (
              <Typography variant="body1">Error fetching programs. Please try again later.</Typography> // Show error message if fetch fails
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Program Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programs?.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>{program.name}</TableCell>
                      <TableCell>{program.location}</TableCell>
                      <TableCell>
                        {new Date(program.startDate).toLocaleDateString()}
                        {program.endDate ? ` - ${new Date(program.endDate).toLocaleDateString()}` : ''}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Program">
                          <Button onClick={() => handleViewProgram(program)}><PreviewIcon/></Button>
                        </Tooltip>
                        <Tooltip title="Delete Program">
                          <Button onClick={() => handleDeleteProgram(program)}><DeleteIcon color="error"/></Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>

      {/* Render the ViewDetailProgram component inside a dialog */}
      <Dialog open={!!selectedProgram} onClose={handleCloseModal}>
        <DialogTitle>View Program Details</DialogTitle>
        <DialogContent>
          {selectedProgram && <ViewDetailProgram program={selectedProgram} />}
        </DialogContent>

      </Dialog>
    </div>
  );
}
