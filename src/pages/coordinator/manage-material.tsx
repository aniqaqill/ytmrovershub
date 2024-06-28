import React, { useMemo, useState, useEffect } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, Typography, CircularProgress, Tooltip, Divider, Box, Backdrop } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import Link from "next/link";
import DeleteIcon from '@mui/icons-material/Delete';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import Image from "next/image";
import Edit from "@mui/icons-material/Edit";
import EditMaterial from "~/components/material/edit-material";
import s3Client from "../api/storage/s3";
import imageEndpoint from "../api/storage/publicEndpoint";


interface Material {
  id: string;
  name: string;
  description: string;
  quantity: number;
  image: string;
}

export default function Page() {
  const { data: sessionData } = useSession();
  const { data: materials, isLoading, isError, refetch: refetchMaterials } = api.materialInfo.getAllAidMaterial.useQuery();
  const deleteMaterial = api.materialInfo.deleteAidMaterialById.useMutation();

  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const isLoggedInCoordinator = useMemo(() => {
    return sessionData?.user && sessionData.user.role === "coordinator";
  }, [sessionData]);

  useEffect(() => {
    if (!isLoggedInCoordinator) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedInCoordinator]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        await refetchMaterials();
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };

    void fetchData();
  }, [refetchMaterials]);

  const handleOpenConfirmation = (material: Material) => {
    setMaterialToDelete(material);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!materialToDelete) return;
    try {
      const deleteParams = {
        Bucket: "program_media",
        Key: materialToDelete.image,
      };
      const deleteCommand = new DeleteObjectCommand(deleteParams);
      await s3Client.send(deleteCommand);
      console.log('Image deleted successfully from S3');

      await deleteMaterial.mutateAsync({ id: materialToDelete.id });
      console.log('Material deleted successfully from the database');

      setIsConfirmationOpen(false);
      await refetchMaterials();
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error during deletion process:', error);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setMaterialToDelete(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleOpenEditModal = (material: Material) => {
    setSelectedMaterial(material);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedMaterial(null);
  };

  return (
    <BaseLayout pageIndex={1}>
      {isLoggedInCoordinator ? (
        <>
          <Typography margin={2} variant="h5">Manage Aid Material</Typography>
          <Divider />
          <br />
          <Link href="/coordinator/create-material">
            <Button variant="contained" color="secondary">Create New Aid Material</Button>
          </Link>
          <br />
          <br />
          {isLoading ? (
            <Backdrop open>
              <CircularProgress />
            </Backdrop>
          ) : isError ? (
            <Typography variant="body1">An error occurred while fetching data.</Typography>
          ) : (
            <>
              {materials && materials.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" justifyContent="left">
                            {material.image && (
                              <Image
                                src={imageEndpoint() + `${material.image}`}
                                alt={material.name}
                                width={50}
                                height={50}
                                style={{ marginRight: '10px' }}
                              />
                            )}
                            <Typography variant="body1" align="center">
                              {material.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{material.description}</TableCell>
                        <TableCell>{material.quantity}</TableCell>
                        <TableCell>
                          <Tooltip title="Edit Material">
                            <Button variant="text" color="secondary" onClick={() => handleOpenEditModal(material)}><Edit /></Button>
                          </Tooltip>
                          <Tooltip title="Delete Material">
                            <Button
                              variant="text"
                              color="error"
                              onClick={() => handleOpenConfirmation(material)}
                            >
                              <DeleteIcon />
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert severity="info">No materials available.</Alert>
              )}
            </>
          )}
        </>
      ) : (
        <Typography variant="body1">You are not authorized to access this page.</Typography>
      )}

      {/* Edit Material Modal */}
      <Dialog open={isEditModalOpen} onClose={handleCloseEditModal}>
        <DialogTitle>Edit Material</DialogTitle>
        <DialogContent>
          {selectedMaterial && <EditMaterial material={selectedMaterial} onClose={handleCloseEditModal} />}
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deleting a material */}
      <Dialog open={isConfirmationOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this aid material?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for successful deletion */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Material deleted successfully!
        </Alert>
      </Snackbar>
    </BaseLayout>
  );
}
