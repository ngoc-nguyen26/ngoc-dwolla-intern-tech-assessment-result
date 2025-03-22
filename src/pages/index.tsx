import React, { useState, FormEvent } from 'react';
import Head from 'next/head';
import useSWR, { mutate } from 'swr';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

// Types for our customers
export type Customer = {
  firstName: string;
  lastName: string;
  businessName?: string;
  email: string;
};

export type Customers = Customer[];

export type ApiError = {
  code: string;
  message: string;
};

const Home = () => {
  // SWR fetcher
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  };

  // Use SWR to fetch customers
  const { data: customers, error, isLoading } = useSWR<Customers, ApiError>(
    '/api/customers',
    fetcher
  );

  // Dialog form state
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');

  // Open dialog
  const handleOpen = () => setOpen(true);

  // Close dialog & reset form
  const handleClose = () => {
    setOpen(false);
    setFirstName('');
    setLastName('');
    setBusinessName('');
    setEmail('');
  };

  // Create a new customer (POST)
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert('Please fill out first name, last name, and email.');
      return;
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, businessName, email }),
      });

      if (!response.ok) {
        const msg = await response.json();
        throw new Error(msg?.message || 'Error adding new customer');
      }

      await mutate('/api/customers');
      handleClose();
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    }
  };

  // Delete a customer
  const handleDelete = async (custEmail: string) => {
    if (!window.confirm(`Are you sure you want to delete customer with email: ${custEmail}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/customers?email=${encodeURIComponent(custEmail)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const msg = await response.json();
        throw new Error(msg?.message || 'Error deleting customer');
      }

      await mutate('/api/customers');
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    }
  };

  return (
    <>
      <Head>
        <title>Customers</title>
      </Head>

      <main style={{ padding: 16 }}>
        <Paper style={{ padding: 16 }}>
          <Box
            mb={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {customers?.length ?? 0} Customers
            </Typography>
            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{ textTransform: 'none' }}
            >
              Add customer +
            </Button>
          </Box>

          {isLoading && <Typography>Loading customers...</Typography>}
          {error && <Typography color="error">Error: {error.message}</Typography>}

          {customers && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((cust) => {
                    const displayName = cust.businessName
                      ? cust.businessName
                      : `${cust.firstName} ${cust.lastName}`;

                    return (
                      <TableRow key={cust.email}>
                        <TableCell>{displayName}</TableCell>
                        <TableCell>{cust.email}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            aria-label="delete"
                            onClick={() => handleDelete(cust.email)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Dialog with smaller text letters */}
        <Dialog open={open} onClose={handleClose} maxWidth="xs">
          <DialogTitle>Add Customer</DialogTitle>
          <form onSubmit={handleCreate}>
            <DialogContent dividers>
              <Box display="flex" gap={1}>
                <TextField
                  required
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  margin="dense"
                  sx={{
                    width: '120px',
                    // ↓ Make label and input text smaller
                    '& .MuiInputBase-input': {
                      fontSize: '0.8rem',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.8rem',
                    },
                  }}
                />
                <TextField
                  required
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  margin="dense"
                  sx={{
                    width: '120px',
                    '& .MuiInputBase-input': {
                      fontSize: '0.8rem',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.8rem',
                    },
                  }}
                />
                <TextField
                  label="Business Name (optional)"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  margin="dense"
                  sx={{
                    width: '160px',
                    '& .MuiInputBase-input': {
                      fontSize: '0.8rem',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.8rem',
                    },
                  }}
                />
              </Box>
              <Box mt={2}>
                <TextField
                  required
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    width: '400px',
                    '& .MuiInputBase-input': {
                      fontSize: '0.8rem',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.8rem',
                    },
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                variant="text"
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ textTransform: 'none' }}
              >
                Create
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </main>
    </>
  );
};

export default Home;
