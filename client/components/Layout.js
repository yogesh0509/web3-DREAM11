import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppBar, Box, IconButton, Toolbar, Typography, Drawer, List, ListItem, ListItemText, useTheme, useMediaQuery, MenuIcon } from '@mui/material';

const variants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: '-100%' },
};

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#000000' }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Website
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={isOpen} onClose={toggleDrawer}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer}
          onKeyDown={toggleDrawer}
        >
          <List>
            <ListItem>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem>
              <ListItemText primary="About" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Services" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Contact" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

    </>
  );
};

export default Layout;