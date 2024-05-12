import React, { useState } from "react";
import { Grid, Table, TableBody, TableCell, TableContainer, TableRow, Typography, Button, TextField } from "@mui/material";
import { api } from "~/utils/api";

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

interface ViewDetailProgramProps {
  program: ProgramType;
}

export default function ViewDetailProgram(props: ViewDetailProgramProps) {
  const { program } = props;
  const { data: fullProgramInfo ,refetch } = api.programInfo.getProgramById.useQuery({ id: program.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProgram, setEditedProgram] = useState(program);
  const updateProgram = api.programInfo.updateProgramById.useMutation();

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      if (!editedProgram) return;
      const editedProgramAsString = {
        ...editedProgram,
        startDate: editedProgram.startDate.toISOString(),
        endDate: editedProgram.endDate ? editedProgram.endDate.toISOString() : '', 
      };
      await updateProgram.mutateAsync(editedProgramAsString);
      setIsEditing(false);
      await refetch();
    } catch (error) {
      console.error("Error updating program:", error);
      // Handle error as needed
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProgram(prevState => ({
      ...prevState,
      [name]: name === 'startDate' || name === 'endDate' ? new Date(value) : value
    }));
  };

  return (
    <Grid>
      <Grid item xs={12}>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><Typography variant="subtitle1">Name</Typography></TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField name="name" value={editedProgram.name} onChange={handleInputChange} />
                  ) : (
                    <Typography>{program.name}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Typography variant="subtitle1">Description</Typography></TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField name="description" value={editedProgram.description} onChange={handleInputChange} />
                  ) : (
                    <Typography>{program.description}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Typography variant="subtitle1">Start Date</Typography></TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField name="startDate" value={editedProgram.startDate} onChange={handleInputChange} />
                  ) : (
                    <Typography>{program.startDate ? program.startDate.toLocaleDateString() : 'N/A'}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Typography variant="subtitle1">End Date</Typography></TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField name="endDate" value={editedProgram.endDate} onChange={handleInputChange} />
                  ) : (
                    <Typography>{program.endDate ? program.endDate.toLocaleDateString() : "N/A"}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Typography variant="subtitle1">Location</Typography></TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField name="location" value={editedProgram.location} onChange={handleInputChange} />
                  ) : (
                    <Typography>{program.location}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Typography variant="subtitle1">Max Volunteer</Typography></TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField name="maxVolunteer" value={editedProgram.maxVolunteer} onChange={handleInputChange} />
                  ) : (
                    <Typography>{program.maxVolunteer}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Typography variant="subtitle1">Coordinator</Typography></TableCell>
                <TableCell>
                  <Typography>{fullProgramInfo?.user?.name}</Typography>
                </TableCell>
              </TableRow>
              {isEditing ? (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Button variant="contained" onClick={handleSaveClick}>Save</Button>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Button variant="contained" onClick={handleEditClick}>Edit</Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}



