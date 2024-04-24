import React, { useEffect, useState } from "react";
import { Typography, TextField, Button } from "@mui/material";
import BaseLayout from "~/components/BaseLayout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

interface UpdateUserRequest {
  name: string ;
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
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const { data: userData } = api.userInfo.getUserById.useQuery({
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
    setIsUpdating(true);
    try {
      const userId = sessionData?.user.id;
      if (!userId) {
        throw new Error("User ID is undefined");
      }
      await updateUser.mutateAsync({
        id: userId,
        name: formData.name,
        email: formData.email, // Include email in the update request
        role: sessionData?.user.role ?? "",
        contactNumber: formData.contactNumber,
      });
      setUpdateSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };


  // Check if the user is authenticated and has the "volunteer" or "coordinator" role
  const isLoggedInVolunteer =
    sessionData?.user &&
    (sessionData.user.role === "volunteer" ||
      sessionData.user.role === "coordinator" )

  return (
    <div>
      <BaseLayout pageIndex={1}>
        {isLoggedInVolunteer ? (
          <>
            <Typography variant="h5">User Profile</Typography>
            {updateSuccess && (
              <Typography variant="body1" color="success">
                User details updated successfully!
              </Typography>
            )}
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
    </div>
  );
}
