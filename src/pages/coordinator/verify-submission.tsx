import React, { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "~/components/BaseLayout";
import { Divider, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Backdrop, CircularProgress, Button, Dialog, Stack, DialogContent } from "@mui/material";
import { api } from "~/utils/api";
import FormList from "~/components/form/form-list";
import { Close as CloseIcon } from "@mui/icons-material";


interface ProgramType {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    startTime: string;
    endTime: string;
    location: string;
    maxVolunteer: number;
    coordinatorId: string;
    image: string;
}

export default function VerifySubmission() {
    const { data: sessionData } = useSession();
    const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
    const isLoggedInCoordinator = useMemo(() => {
        return sessionData?.user && sessionData.user.role === "coordinator";
    }, [sessionData]);

    const { data: programs, isLoading, isError } = api.programInfo.getAllProgram.useQuery();

    const ongoingPrograms = useMemo(() => {
        return programs?.filter((program) => new Date(program.startDate) > new Date());
    }, [programs]);

    const pastPrograms = useMemo(() => {
        return programs?.filter((program) => new Date(program.startDate) < new Date());
    }, [programs]);

    const formatTimeTo12Hour = (time24: string) => {
        const [hoursStr, minutes] = time24.split(":");
        const hours = parseInt(hoursStr ?? "0", 10);

        if (isNaN(hours)) {
            return "";
        }

        const suffix = hours >= 12 ? "PM" : "AM";
        const hours12 = ((hours % 12) || 12).toString().padStart(2, "0");
        return `${hours12}:${minutes} ${suffix}`;
    };

    const handleViewSubmissions = (programId: string) => {
        setSelectedProgram(programs?.find((program) => program.id === programId) ?? null);
    }

    return (
        <BaseLayout pageIndex={1}>
            <Typography margin={2} variant="h5">Verify Submission</Typography>
            <Divider />
            {isLoggedInCoordinator ? (
                <div>
                    <Typography variant="h6">Ongoing Programs</Typography>
                    <TableContainer component={Paper}>
                        {isLoading ? (
                            <Backdrop open>
                                <CircularProgress />
                            </Backdrop>
                        ) : isError ? (
                            <Typography variant="body1">Error fetching programs. Please try again later.</Typography>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Program Name</TableCell>
                                        <TableCell>Start Date</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {ongoingPrograms?.map((program) => (
                                        <TableRow key={program.id}>
                                            <TableCell>{program.name}</TableCell>
                                            <TableCell>{new Date(program.startDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{formatTimeTo12Hour(program.startTime)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    onClick={() => handleViewSubmissions(program.id)}
                                                >
                                                    View Submissions
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>
                    <Typography variant="h6">Past Programs</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Program Name</TableCell>
                                    <TableCell>Start Date</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pastPrograms?.map((program) => (
                                    <TableRow key={program.id}>
                                        <TableCell>{program.name}</TableCell>
                                        <TableCell>{new Date(program.startDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{formatTimeTo12Hour(program.startTime)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => handleViewSubmissions(program.id)}
                                            >
                                                View Submissions
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {selectedProgram && (
                    <Dialog fullWidth={true} maxWidth="lg" open={!!selectedProgram} onClose={() => setSelectedProgram(null)}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" padding={2}>
                            <Typography variant="h5">{selectedProgram?.name}</Typography>
                            <Button onClick={() => setSelectedProgram(null)}><CloseIcon/></Button>
                        </Stack>
                        <Divider />
                        <DialogContent>
                        <FormList
                            program={selectedProgram}
                        />
                        </DialogContent>
                    </Dialog>
                    )}
                </div>
            ) : (
                <div>
                    <Typography variant="body1">Coordinator is not logged in</Typography>
                </div>
            )}
        </BaseLayout>
    );
}
