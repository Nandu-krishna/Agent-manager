import React, { useState } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AgentManagement from '../components/AgentManagement';
import FileUpload from '../components/FileUpload';
import ListDistribution from '../components/ListDistribution';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MERN Agent Manager - Welcome, {user?.email}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Agent Management" />
            <Tab label="Upload & Distribute" />
            <Tab label="Distribution History" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <AgentManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <FileUpload />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ListDistribution />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Dashboard;
