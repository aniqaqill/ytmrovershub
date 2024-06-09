import React, { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress, Typography, Dialog, DialogContent, DialogActions, IconButton, Snackbar, Alert, Chip, TextField, Box, MenuItem, Select,  FormControl,
    Tooltip
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import Image from "next/image";
import { api } from "~/utils/api";
import imageEndpoint from "~/pages/api/storage/publicEndpoint";

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
    const { data: forms, isLoading, isError, refetch } = api.formInfo.getFormsByProgram.useQuery(
        { programId: program?.id ?? "" },
        { enabled: !!program }
    );
    const updateFormStatus = api.formInfo.updateFormStatus.useMutation();
    const sendEmailCertificate = api.sendEmailCert.useMutation();

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [filteredForms, setFilteredForms] = useState(forms ?? []);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [confirmationModal, setConfirmationModal] = useState<{ isOpen: boolean, formId: string | null, status: 'APPROVED' | 'REJECTED' | null }>({ isOpen: false, formId: null, status: null });
    const [snackbar, setSnackbar] = useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: '' });

    useEffect(() => {
        if (forms) {
            setFilteredForms(
                forms.filter(form =>
                    form.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    (statusFilter === "" || form.status === statusFilter)
                )
            );
        }
    }, [forms, searchQuery, statusFilter]);

    const handleStatusChange = async () => {
        if (confirmationModal.formId && confirmationModal.status) {
            const form = forms?.find(f => f.id === confirmationModal.formId);
            if (form) {
                updateFormStatus.mutate({ id: confirmationModal.formId, status: confirmationModal.status }, {
                    onSuccess: () => {
                        if (confirmationModal.status === 'APPROVED' && form.user?.email && form.user?.name) {
                            sendEmailCertificate.mutate({ email: form.user.email, name: form.user.name, program: program?.name ?? "" });
                            setSnackbar({ isOpen: true, message: `Form status updated to ${confirmationModal.status} and certificate has been sent` });
                        }
                        void refetch();
                    }
                });
            }
            setConfirmationModal({ isOpen: false, formId: null, status: null });
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

    const handleOpenConfirmationModal = (formId: string, status: 'APPROVED' | 'REJECTED') => {
        setConfirmationModal({ isOpen: true, formId, status });
    };

    const handleCloseConfirmationModal = () => {
        setConfirmationModal({ isOpen: false, formId: null, status: null });
    };

    const getStatusChipColor = (status: 'SUBMITTED' | 'APPROVED' | 'REJECTED') => {
        switch (status) {
            case 'APPROVED':
                return 'success';
            case 'REJECTED':
                return 'error';
            case 'SUBMITTED':
                return 'warning';
        }
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
                <Typography>No submissions to verify.</Typography>
            ) : (
                <>  
                    <br />
                    <Box display="flex" justifyContent="flex-end" marginBottom={2}>
                        <TextField
                            placeholder="Search by name"
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="small"
                        />

                        <Tooltip title="Filter by status">
                        <FormControl variant="outlined" size="small">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>All</em>
                                </MenuItem>
                                <MenuItem value="SUBMITTED">Submitted</MenuItem>
                                <MenuItem value="APPROVED">Approved</MenuItem>
                                <MenuItem value="REJECTED">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                        </Tooltip>
                    </Box>
                    <Box sx={{ border: 1, borderColor: 'divider' }}>
                    <Table size="small" aria-label="form-list"  >
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
                            {filteredForms?.map((form) => (
                                <TableRow key={form.id}>
                                    <TableCell>{form.user.name}</TableCell>
                                    <TableCell>{new Date(form.dateCompleted).toLocaleDateString()}</TableCell>
                                    <TableCell>{form.feedback}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleImageClick(imageEndpoint() + form.images[0])}>View Image</Button>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={form.status} color={getStatusChipColor(form.status)} />
                                    </TableCell>
                                    <TableCell>
                                        <Button color="success" onClick={() => handleOpenConfirmationModal(form.id, 'APPROVED')}>Approve</Button>
                                        <Button color="error" onClick={() => handleOpenConfirmationModal(form.id, 'REJECTED')}>Reject</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </Box>
                </>
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
            <Dialog open={confirmationModal.isOpen} onClose={handleCloseConfirmationModal}>
                <DialogContent>
                    <Typography>Are you sure you want to {confirmationModal.status?.toLowerCase()} this form?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmationModal} color="error">Cancel</Button>
                    <Button onClick={handleStatusChange} color="secondary">Confirm</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbar.isOpen} autoHideDuration={3000} onClose={() => setSnackbar({ isOpen: false, message: '' })}>
                <Alert onClose={() => setSnackbar({ isOpen: false, message: '' })} severity="success">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default FormList;
