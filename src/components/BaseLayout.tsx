import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Divider from "@mui/material/Divider";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import HomeIcon from "@mui/icons-material/Home";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button,  Drawer, Container, Alert } from "@mui/material";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import GridViewIcon from "@mui/icons-material/GridView";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import PersonIcon from '@mui/icons-material/Person';
import logo from "../../public/logo.png";
import Image from "next/image";
import { useRouter } from "next/router";
import FactCheckIcon from '@mui/icons-material/FactCheck';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Logout, PeopleAltRounded } from "@mui/icons-material";
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { api } from "~/utils/api";
import Link from "next/link";

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  position: 'fixed',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    zIndex: theme.zIndex.drawer + 1,
    position: 'fixed',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

type BaseLayoutProps = {
  children: React.ReactNode;
  pageIndex?: number;
};

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { data: sessionData } = useSession();
  const router = useRouter();
  const userRole = sessionData?.user?.role;
  const { data } = api.userInfo.getUserById.useQuery({
    id: sessionData?.user.id ?? "",
  });






  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const lists = useMemo(() => [
    {
      role: undefined,
      items: [{ text: 'Home', icon: <HomeIcon />, onClick: () => router.push('/') }],
    },
    {
      role: 'coordinator',
      items: [
        { text: 'Home', icon: <HomeIcon />, onClick: () => router.push('/') },
        { text: 'Manage Program', icon: <AllInboxIcon />, onClick: () => router.push('/coordinator/manage-program') },
        { text: 'Aid Material', icon: <InventoryIcon />, onClick: () => router.push('/coordinator/manage-material') },
        { text: 'Verify Submission', icon: <FactCheckIcon/>, onClick: () => router.push('/coordinator/verification-program-list')},
        { text: 'Analytics', icon: <AnalyticsIcon />, onClick: () => router.push('/coordinator/analytics')},
        { text: 'Profile', icon: <PersonIcon  />, onClick: () => router.push('/profile') }

      ],
    },
    {
      role: 'volunteer',
      items: [
        { text: 'Home', icon: <HomeIcon />, onClick: () => router.push('/') },
        { text: 'View Program', icon: <GridViewIcon />, onClick: () => router.push('/volunteer/view-program')  },
        { text: 'Registered Program', icon: <AppRegistrationIcon />, onClick: () => router.push('/volunteer/registered-program')  },
        { text: 'Profile', icon: <PersonIcon  />, onClick: () => router.push('/profile') },
      ]
      ,
    },
    {
      role: 'admin',
      items: [
        { text: 'Home', icon: <HomeIcon />, onClick: () => router.push('/') },
        { text: 'User List', icon: <PeopleAltRounded  />, onClick: () => router.push('/admin/user-list') },
        { text: 'Profile', icon: <PersonIcon  />, onClick: () => router.push('/profile') }
      ],
    }
  ], [router]);

  const currentList = lists.find(list => list.role === userRole);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {sessionData && (
            <IconButton
              color="inherit"
              aria-label={open ? "close drawer" : "open drawer"}
              onClick={open ? handleDrawerClose : handleDrawerOpen}
              edge="start"
              sx={{ marginRight: 2 }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          )}
          <Button color="inherit" onClick={() => router.push('/')} disableFocusRipple disableTouchRipple>
          <Image src={logo} alt="logo" width={150} height={50} />
          </Button>
          <Box sx={{ flexGrow: 0 }}>
            {sessionData ? (
              <Typography variant="body1" color='white' sx={{ mr: 1 }}> Hi {sessionData.user.name} !</Typography>
            ) : (
              <Button color="inherit" onClick={() => signIn(undefined, { callbackUrl: '/' })}>
                Sign in
              </Button>
            )}
          </Box>
        </Toolbar>
        {(sessionData && (!data?.name)) && (
          <Alert severity="warning">
            Please complete your profile with your name. <Link href="/profile">Click here to complete your profile.</Link>
          </Alert>
        )}
      </AppBar>
      {sessionData && (
              <Drawer variant="persistent" open={open}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6">Menu</Typography>
                  </Box>
                  <Divider />
                  <List>
                    {currentList?.items.map((item) => (
                      <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                          sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                          }}
                          onClick={item.onClick}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 3 : 'auto',
                              justifyContent: 'center',
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Divider />
                  <ListItemButton
                    sx={{
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                    }}
                    onClick={() => signOut()}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      <Logout />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" sx={{ opacity: open ? 1 : 0 }} />
                  </ListItemButton>
                </Box>
              </Box>
            </Drawer>
      )}
      <Container component="main" sx={{ flexGrow: 1, p: 1 }} maxWidth="lg">
        <DrawerHeader />
        {children}
      </Container>
    </Box>
  );
};

export default BaseLayout;
