import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, MenuItem, Select, FormControl, InputLabel, type SelectChangeEvent, Snackbar, Alert  } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";


interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  contactNumber: string | null;
}

export default function Page() {
  const { data: sessionData } = useSession();
  const isLoggedInAdmin = sessionData?.user && sessionData.user.role === "admin";
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User | null>(null); // State to hold form data
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const updateUser = api.userInfo.updateUserById.useMutation();
  const getAllUsersQuery = api.userInfo.getAllUser.useQuery();

  // Function to handle opening the modal and setting the selected user
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData(user); // Initialize form data with selected user data
    setOpen(true);
  };

  // Function to handle closing the modal
  const handleClose = () => {
    setOpen(false);
  };

  // Function to handle text input changes
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Function to handle select changes
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!formData) return;
      await updateUser.mutateAsync({
        id: formData.id,
        name: formData.name ?? "",
        email: formData.email ?? "",
        role: formData.role,
        contactNumber: formData.contactNumber ?? "",
      });
      setOpen(false); // Close the modal after successful update
      setSnackbarOpen(true); // Show success notification

      await getAllUsersQuery.refetch(); // Refetch user list data after successful update
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };



  //get user list
  const { data: userList } = getAllUsersQuery;

  useEffect(() => {
    if (!isLoggedInAdmin) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoggedInAdmin]);

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInAdmin ? (
          <>
            <Typography variant="h5">List of User</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Contact Number</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userList?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.contactNumber}</TableCell>
                      <TableCell>
                        <Button variant="contained" color="primary" onClick={() => handleEditClick(user)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Modal for editing user */}
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Edit User {selectedUser?.name}</DialogTitle>
              <DialogContent>
                {/* Form for editing user information */}
                <form onSubmit={handleSubmit}>
                  <TextField
                    name="name"
                    label="Name"
                    value={formData?.name ?? ""}
                    onChange={handleTextInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    name="email"
                    label="Email"
                    value={formData?.email ?? ""}
                    onChange={handleTextInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      labelId="role-label"
                      id="role"
                      name="role"
                      value={formData?.role ?? ""}
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="volunteer">Volunteer</MenuItem>
                      <MenuItem value="coordinator">Coordinator</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    name="contactNumber"
                    label="Contact Number"
                    value={formData?.contactNumber ?? ""}
                    onChange={handleTextInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <DialogActions>
                    <Button onClick={handleClose} color="error" variant="contained">
                      Cancel
                    </Button>
                    <Button type="submit" color="primary" variant="contained">
                      Save
                    </Button>
                  </DialogActions>
                </form>
              </DialogContent>
            </Dialog>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              >
                <Alert onClose={handleCloseSnackbar} severity="success">
                  User updated successfully!
                </Alert>
                </Snackbar>

          </>
        ) : (
          <Typography variant="body1">You are not authorized to access this page.</Typography>
        )}
      </BaseLayout>
    </div>
  );
}
