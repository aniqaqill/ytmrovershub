import React from "react";
import { Box, Typography, Link } from "@mui/material";

const VerifyRequest: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        padding: "20px",
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Please Verify Your Email
      </Typography>
      <Typography variant="body1" align="center" gutterBottom>
        We have sent a verification link to your email address. Please check
        your inbox and click on the link to verify your email.
      </Typography>
    <Typography variant="body1" align="center">
        Didn&apos;t receive the email?{" "}
        <Link href="/authentication/signIn" color="primary">
            Try again
        </Link>
    </Typography>
    </Box>
  );
};

export default VerifyRequest;
