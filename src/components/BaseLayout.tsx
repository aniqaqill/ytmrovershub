import React from "react";
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { styled, useTheme, type Theme, type CSSObject } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import HomeIcon from '@mui/icons-material/Home';
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, Button, Menu, MenuItem, Tooltip} from "@mui/material";
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import GridViewIcon from '@mui/icons-material/GridView';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import logo from '../../public/logo.png';
import Image from "next/image";
import router from "next/router";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

type BaseLayoutProps = {
    children: React.ReactNode;
    pageIndex: number;
};


const BaseLayoutDrawer: React.FC<BaseLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const { data: sessionData } = useSession();
  const userRole = sessionData?.user?.role;

  
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

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

  // Define lists based on user roles
  const lists = [
    {
      role: undefined, // Default role
      items: [
        { text: 'Home', icon: <HomeIcon />, href: '/' },
        // { text: 'About', icon: <GridViewIcon />, href: '/about' },
      ],
    },
    {
      role: 'coordinator',
      items: [
        { text: 'Home', icon: <HomeIcon />, href: '/' },
        { text: 'Manage Program', icon: <AllInboxIcon />, href: '/coordinator/manage-program' },
        { text: 'Aid Material', icon: <AppRegistrationIcon />, href: '/coordinator/aid-material' },
      ],
    },
    {
      role: 'volunteer',
      items: [
        { text: 'Home', icon: <HomeIcon />, href: '/' },
        { text: 'View Program', icon: <GridViewIcon />, href: '/volunteer/view-program' },
        { text: 'Registered Program', icon: <AppRegistrationIcon />, href: '/volunteer/registered' },
      ],
    },
  ];
  const currentList = lists.find(list => list.role === userRole);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Adjust margin-right for space between menu icon and logo */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 2,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Image src={logo} alt="logo" width={150} height={50} />
            <Box sx={{ flexGrow: 0 }}>
            {sessionData ? (
            <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {sessionData?.user?.image && (
                    <Avatar src={sessionData?.user?.image} />
                )}
                </IconButton>
            </Tooltip> ) : (
            <Button color="inherit" onClick={() => signIn()}>Sign in</Button>
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
                    {/* Profile option */}
                    <MenuItem onClick={() => router.push('/profile')}>
                    <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                    {/* Sign out option */}
                    <MenuItem onClick={() => signOut()}>
                    <Typography textAlign="center">Sign out</Typography>
                    </MenuItem>
                </Menu>
                </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />

        {/* Render list items based on user role */}
        <List>
  {currentList?.items.map((item) => (
    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
      <ListItemButton
        sx={{
          minHeight: 48,
          justifyContent: open ? 'initial' : 'center',
          px: 2.5,
        }}
        href={item.href}
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
      <Box component="main" sx={{ flexGrow: 1, p: 1 }}>
        <DrawerHeader />
        {children}
      </Box>
      </Box>

  );
}

export default BaseLayoutDrawer;
