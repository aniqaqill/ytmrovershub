import React, { useState } from "react";
import { api } from "~/utils/api";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Typography, Dialog, DialogContent, DialogActions, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import Image from "next/image";

const endpoint = "https://rnkqnviezsjkhfovplik.supabase.co/storage/v1/object/public/";
const bucket = "program_media/";

interface ProgramType {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    startTime: string;
    endTime: string;
    location: string;
}

interface UpdateFormProps {
    program: ProgramType | null;
}

const FormList: React.FC<UpdateFormProps> = ({ program }) => {
    const { data: forms, isLoading, isError } = api.formInfo.getFormsByProgram.useQuery(
        { programId: program?.id ?? "" },
        { enabled: !!program }
    );
    const updateFormStatus = api.formInfo.updateFormStatus.useMutation();
    
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const sendEmailCertificate = api.sendEmailCert.useMutation();

    const handleStatusChange = async (formId: string, status: 'SUBMITTED' | 'APPROVED' | 'REJECTED') => {
        const form = forms?.find(f => f.id === formId);
        if (form) {
            updateFormStatus.mutate({ id: formId, status }, {
                onSuccess: () => {
                    console.log(`Form ${formId} status updated to ${status}`);
                    if (status === 'APPROVED' && form.user?.email && form.user?.name ) {
                        sendEmailCertificate.mutate({email: form.user?.email, name:form.user.name, cert: `ssddsd`});
                    }
                }
            });
        }
    };

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
        setIsModalOpen(false);
    };

    if (!program) {
        return null;
    }

    return (
        <div>
            {isLoading ? (
                <CircularProgress />
            ) : isError ? (
                <Typography>Error loading forms.</Typography>
            ) : forms?.length === 0 ? (
                <Typography>No submissions left to verify.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Volunteer Name</TableCell>
                                <TableCell>Date Completed</TableCell>
                                <TableCell>Feedback</TableCell>
                                <TableCell>Image</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {forms?.map((form) => (
                                <TableRow key={form.id}>
                                    <TableCell>{form.user.name}</TableCell>
                                    <TableCell>{new Date(form.dateCompleted).toLocaleDateString()}</TableCell>
                                    <TableCell>{form.feedback}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleImageClick(`${endpoint}${bucket}${form.images[0]}`)}>View Image</Button>
                                    </TableCell>
                                    <TableCell>{form.status}</TableCell>
                                    <TableCell>
                                        <Button color="success" onClick={() => handleStatusChange(form.id, 'APPROVED')}>Approve</Button>
                                        <Button color="error" onClick={() => handleStatusChange(form.id, 'REJECTED')}>Reject</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="lg">
                <DialogActions>
                    <IconButton edge="end" color="inherit" onClick={handleCloseModal} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </DialogActions>
                <DialogContent>
                    {selectedImage && <Image src={selectedImage} alt="Selected image" width={750} height={500} />}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FormList;
