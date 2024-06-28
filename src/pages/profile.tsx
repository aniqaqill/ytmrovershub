import React, { useEffect, useState } from "react";
import { Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

interface UpdateUserRequest {
  name: string;
  email: string;
  contactNumber: string;
}

export default function Page() {
  const { data: sessionData } = useSession();
  const [formData, setFormData] = useState<UpdateUserRequest>({
    name: "",
    email: "",
    contactNumber: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { data: userData ,refetch: refetchUser  } = api.userInfo.getUserById.useQuery({
    id: sessionData?.user.id ?? "",
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name ?? '',
        email: userData.email ?? "",
        contactNumber: userData.contactNumber ?? "",
      });
    }
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const updateUser = api.userInfo.updateUserById.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsConfirmationOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setIsUpdating(true);
    setIsConfirmationOpen(false);
    try {
      const userId = sessionData?.user.id;
      if (!userId) {
        throw new Error("User ID is undefined");
      }
      await updateUser.mutateAsync({
        id: userId,
        name: formData.name,
        email: formData.email,
        role: sessionData?.user.role ?? "",
        contactNumber: formData.contactNumber,
      });
      setSnackbarOpen(true); // Open snackbar on success
      await refetchUser();
      // Refetch user data
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Check if the user is authenticated and has the "volunteer" or "coordinator" role
  const isLoggedIn =
    sessionData?.user &&
    (sessionData.user.role === "volunteer" || sessionData.user.role === "coordinator" || sessionData.user.role === "admin");

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedIn ? (
          <>
            <Typography variant="h5">User Profile</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                disabled
              />
              <TextField
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isUpdating}
              >
                Update
              </Button>
            </form>
          </>
        ) : (
          <Typography variant="body1">
            You are not authorized to access this page.
          </Typography>
        )}
      </BaseLayout>

      {/* Confirmation dialog */}
      <Dialog open={isConfirmationOpen} onClose={() => setIsConfirmationOpen(false)}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to update your profile details?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmationOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmUpdate} color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success message */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          User details updated successfully!
        </Alert>
      </Snackbar>
    </div>
  );
}
