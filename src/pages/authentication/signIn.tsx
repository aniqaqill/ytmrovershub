import { signIn, useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Typography, Link, Card, useTheme } from '@mui/material';
import Image from "next/image";
import logo from '../../../public/logo.png';

interface CopyrightProps {
  website: string;
}

function Copyright({ website, ...props }: CopyrightProps) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href={website}>
        {website}
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const SignIn: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const theme = useTheme();

  useEffect(() => {
    if (session) {
      void router.push("/");
    }
  }, [session, router]);

  const handleEmailSignIn = async () => {
    await signIn("email", { email, callbackUrl: "/" });
  };


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email') as string;
    setEmail(email);
    void handleEmailSignIn();
  };

  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ height: '80vh' }}>
      <Grid item>
        <Card sx={{ padding: '30px', borderRadius: '30px', boxShadow: 5, backgroundColor: theme.palette.primary.main }}>
          <Grid item>
            <Image src={logo} alt="logo" width={300} height={100} />
          </Grid>
          <Typography component="h1"  color={theme.palette.primary.contrastText}>
            Sign in to your account
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              variant="outlined"

              required
              fullWidth
              id="email"
              placeholder="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              sx={{ bgcolor: 'white', borderRadius: '5px' }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              color="secondary"
            >
              Sign In
            </Button>
          </Box>
          <Box mt={3}>
            <Copyright website="ytmrovershub" />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SignIn;