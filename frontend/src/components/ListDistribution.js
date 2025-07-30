import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import axios from 'axios';

const ListDistribution = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/lists`);
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Distribution History
      </Typography>

      {lists.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No distributions found. Upload a file to get started.
          </Typography>
        </Paper>
      ) : (
        lists.map((list) => (
          <Card key={list._id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {list.fileName}
                </Typography>
                <Chip 
                  label={`${list.totalItems} items`} 
                  color="primary" 
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Uploaded on: {new Date(list.createdAt).toLocaleString()}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Agent Distributions:
              </Typography>

              {list.distributions.map((dist, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                      <Typography>{dist.agentName}</Typography>
                      <Chip 
                        label={`${dist.itemCount} items`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>First Name</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dist.items.map((item, itemIndex) => (
                            <TableRow key={itemIndex}>
                              <TableCell>{item.firstName}</TableCell>
                              <TableCell>{item.phone}</TableCell>
                              <TableCell>{item.notes || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default ListDistribution;
