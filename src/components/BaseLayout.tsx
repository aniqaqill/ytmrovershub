import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { styled} from "@mui/material/styles";
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Divider from "@mui/material/Divider";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import HomeIcon from "@mui/icons-material/Home";
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, Button,  Menu, MenuItem, Tooltip,Drawer, Container } from "@mui/material";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import GridViewIcon from "@mui/icons-material/GridView";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import PeopleIcon from "@mui/icons-material/People";
import logo from "../../public/logo.png";
import Image from "next/image";
import { useRouter } from "next/router";

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
    // width: `calc(100% - ${drawerWidth}px)`,
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

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

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
        { text: 'Aid Material', icon: <AppRegistrationIcon />, onClick: () => router.push('/coordinator/manage-material') },
        { text: 'Verify Submission', icon: <GridViewIcon />, onClick: () => router.push('/coordinator/verify-submission')}
      ],
    },
    {
      role: 'volunteer',
      items: [
        { text: 'Home', icon: <HomeIcon />, onClick: () => router.push('/') },
        { text: 'View Program', icon: <GridViewIcon />, onClick: () => router.push('/volunteer/view-program')  },
        { text: 'Registered Program', icon: <AppRegistrationIcon />, onClick: () => router.push('/volunteer/registered-program')  },
      ],
    },
    {
      role: 'admin',
      items: [
        { text: 'Home', icon: <HomeIcon />, onClick: () => router.push('/') },
        { text: 'User List', icon: <PeopleIcon />, onClick: () => router.push('/admin/user-list') },
      ],
    }
  ], [router]);

  const currentList = lists.find(list => list.role === userRole);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={open} >
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
          <Image src={logo} alt="logo" width={150} height={50} />
          <Box sx={{ flexGrow: 0 }}>
            {sessionData ? (
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar>{sessionData.user.name?.charAt(0)}</Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Button color="inherit" onClick={() => signIn(undefined, { callbackUrl: '/' })}>
                Sign in
              </Button>
            )}
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => router.push('/profile')}>
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={() => signOut()}>
                <Typography textAlign="center">Sign out</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      {sessionData && (
        <Drawer 
          variant="persistent"
          open={open}

        >
          <DrawerHeader>
            <Typography variant="h6">Menu</Typography>


          </DrawerHeader>
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
                  onClick={item.onClick} // Change href to onClick
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
