import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Payment as PaymentIcon,
  CreditCard,
  AccountBalanceWallet,
  MonetizationOn,
  TrendingUp,
  PlayArrow
} from '@mui/icons-material';
import api from '../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState({
    status: '',
    method: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalRevenue: 0
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // States for creating new payment
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [newPayment, setNewPayment] = useState({
    orderId: '',
    amount: '',
    method: 'card',
    description: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.getPayments();
      
      if (response.success) {
        setPayments(response.payments);
        calculateStats(response.payments);
      } else {
        setError('Błąd podczas pobierania płatności: ' + response.message);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Błąd podczas pobierania płatności');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData) => {
    const stats = {
      total: paymentsData.length,
      completed: paymentsData.filter(p => p.status === 'completed').length,
      pending: paymentsData.filter(p => p.status === 'pending').length,
      failed: paymentsData.filter(p => p.status === 'failed').length,
      totalRevenue: paymentsData
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0)
    };
    setStats(stats);
  };

  const fetchOrders = async () => {
    try {
      const response = await api.getOrders();
      if (response.success) {
        setOrders(response.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleCreatePayment = async () => {
    try {
      const response = await api.createPayment({
        orderId: newPayment.orderId,
        amount: parseFloat(newPayment.amount),
        method: newPayment.method,
        description: newPayment.description
      });
      
      if (response.success) {
        setCreateDialogOpen(false);
        setNewPayment({ orderId: '', amount: '', method: 'card', description: '' });
        fetchPayments(); // Refresh the list
        setError('');
      } else {
        setError('Błąd podczas tworzenia płatności: ' + response.message);
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      setError('Błąd podczas tworzenia płatności');
    }
  };

  const handleCreateDialogOpen = () => {
    fetchOrders();
    setCreateDialogOpen(true);
  };

  const handleProcessPayment = async (paymentId) => {
    try {
      const response = await api.processPayment(paymentId);
      
      if (response.success) {
        fetchPayments(); // Refresh the list
        setError('');
        setSuccessMessage('Płatność została rozpoczęta do przetwarzania');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Błąd podczas przetwarzania płatności: ' + response.message);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Błąd podczas przetwarzania płatności');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'processing':
        return 'info';
      case 'cancelled':
        return 'default';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Ukończone';
      case 'pending':
        return 'Oczekuje';
      case 'failed':
        return 'Nieudane';
      case 'processing':
        return 'Przetwarzanie';
      case 'cancelled':
        return 'Anulowane';
      case 'refunded':
        return 'Zwrócone';
      default:
        return status;
    }
  };

  const getMethodText = (method) => {
    switch (method) {
      case 'card':
        return 'Karta płatnicza';
      case 'bank_transfer':
        return 'Przelew bankowy';
      case 'paypal':
        return 'PayPal';
      case 'cash_on_delivery':
        return 'Za pobraniem';
      default:
        return method;
    }
  };

  const handlePaymentClick = (payment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const filteredPayments = payments.filter(payment => {
    if (filter.status && payment.status !== filter.status) return false;
    if (filter.method && payment.method !== filter.method) return false;
    return true;
  });

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PaymentIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Płatności
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PaymentIcon />}
          onClick={handleCreateDialogOpen}
        >
          Dodaj płatność
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MonetizationOn color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Łączne przychody
                  </Typography>
                  <Typography variant="h6">
                    ${stats.totalRevenue.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CreditCard color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Ukończone
                  </Typography>
                  <Typography variant="h6">
                    {stats.completed}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalanceWallet color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Oczekujące
                  </Typography>
                  <Typography variant="h6">
                    {stats.pending}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Łącznie
                  </Typography>
                  <Typography variant="h6">
                    {stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="">Wszystkie</MenuItem>
                <MenuItem value="completed">Ukończone</MenuItem>
                <MenuItem value="pending">Oczekujące</MenuItem>
                <MenuItem value="failed">Nieudane</MenuItem>
                <MenuItem value="processing">Przetwarzanie</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Metoda</InputLabel>
              <Select
                value={filter.method}
                onChange={(e) => setFilter({ ...filter, method: e.target.value })}
                label="Metoda"
              >
                <MenuItem value="">Wszystkie</MenuItem>
                <MenuItem value="card">Karta płatnicza</MenuItem>
                <MenuItem value="bank_transfer">Przelew bankowy</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="cash_on_delivery">Za pobraniem</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="outlined" 
              onClick={() => setFilter({ status: '', method: '' })}
              fullWidth
            >
              Wyczyść filtry
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Płatności</TableCell>
              <TableCell>Kwota</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Metoda</TableCell>
              <TableCell>Data utworzenia</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment._id} hover>
                <TableCell>
                  <Typography variant="body2" color="primary">
                    {payment.paymentId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    ${payment.amount.toLocaleString()} {payment.currency}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(payment.status)}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {getMethodText(payment.method)}
                </TableCell>
                <TableCell>
                  {new Date(payment.createdAt).toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handlePaymentClick(payment)}
                    >
                      Szczegóły
                    </Button>
                    {payment.status === 'pending' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<PlayArrow />}
                        onClick={() => handleProcessPayment(payment._id)}
                      >
                        Przetwórz
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredPayments.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="textSecondary">
            Brak płatności spełniających kryteria filtrowania
          </Typography>
        </Paper>
      )}

      {/* Payment Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedPayment && (
          <>
            <DialogTitle>
              Szczegóły płatności: {selectedPayment.paymentId}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={getStatusText(selectedPayment.status)}
                    color={getStatusColor(selectedPayment.status)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Kwota
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    ${selectedPayment.amount.toLocaleString()} {selectedPayment.currency}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Metoda płatności
                  </Typography>
                  <Typography gutterBottom>
                    {getMethodText(selectedPayment.method)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    ID zamówienia
                  </Typography>
                  <Typography gutterBottom>
                    {selectedPayment.orderId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Data utworzenia
                  </Typography>
                  <Typography gutterBottom>
                    {new Date(selectedPayment.createdAt).toLocaleString('pl-PL')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Ostatnia aktualizacja
                  </Typography>
                  <Typography gutterBottom>
                    {new Date(selectedPayment.updatedAt).toLocaleString('pl-PL')}
                  </Typography>
                </Grid>
                {selectedPayment.failureReason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Powód niepowodzenia
                    </Typography>
                    <Typography color="error">
                      {selectedPayment.failureReason}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Zamknij
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Payment Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj nową płatność</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Zamówienie</InputLabel>
              <Select
                value={newPayment.orderId}
                onChange={(e) => {
                  const selectedOrder = orders.find(order => order._id === e.target.value);
                  setNewPayment({
                    ...newPayment, 
                    orderId: e.target.value,
                    amount: selectedOrder ? selectedOrder.totalAmount : ''
                  });
                }}
                label="Zamówienie"
              >
                {orders.map((order) => (
                  <MenuItem key={order._id} value={order._id}>
                    #{order._id.slice(-6)} - ${order.totalAmount} ({order.status})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Kwota"
              type="number"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
              sx={{ mb: 2 }}
              inputProps={{ min: 0, step: 0.01 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Metoda płatności</InputLabel>
              <Select
                value={newPayment.method}
                onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}
                label="Metoda płatności"
              >
                <MenuItem value="card">Karta płatnicza</MenuItem>
                <MenuItem value="bank_transfer">Przelew bankowy</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="cash_on_delivery">Za pobraniem</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Opis (opcjonalny)"
              value={newPayment.description}
              onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Anuluj
          </Button>
          <Button 
            onClick={handleCreatePayment}
            variant="contained"
            disabled={!newPayment.orderId || !newPayment.amount}
          >
            Utwórz płatność
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Payments;