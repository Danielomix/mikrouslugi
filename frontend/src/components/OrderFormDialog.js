import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Alert,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

function OrderFormDialog({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState({
    items: [{ productId: '', quantity: 1, price: 0 }],
    shippingAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Polska'
    },
    notes: ''
  });

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts();
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Błąd podczas ładowania produktów');
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderData.items];
    newItems[index][field] = value;
    
    // If product is selected, set the price
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].price = product.price;
      }
    }
    
    setOrderData({ ...orderData, items: newItems });
  };

  const addItem = () => {
    setOrderData({
      ...orderData,
      items: [...orderData.items, { productId: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = orderData.items.filter((_, i) => i !== index);
    setOrderData({ ...orderData, items: newItems });
  };

  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (orderData.items.some(item => !item.productId || item.quantity <= 0)) {
        setError('Wszystkie produkty muszą być wybrane z poprawną ilością');
        setLoading(false);
        return;
      }

      if (!orderData.shippingAddress.street || !orderData.shippingAddress.city || 
          !orderData.shippingAddress.postalCode) {
        setError('Adres dostawy jest wymagany');
        setLoading(false);
        return;
      }

      const response = await api.createOrder(orderData);
      onSuccess('Zamówienie zostało utworzone pomyślnie');
      onClose();
      
      // Reset form
      setOrderData({
        items: [{ productId: '', quantity: 1, price: 0 }],
        shippingAddress: {
          street: '',
          city: '',
          postalCode: '',
          country: 'Polska'
        },
        notes: ''
      });
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.response?.data?.message || 'Błąd podczas tworzenia zamówienia');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : '';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Nowe zamówienie</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {/* Products Section */}
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Produkty
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Produkt</TableCell>
                <TableCell>Ilość</TableCell>
                <TableCell>Cena</TableCell>
                <TableCell>Suma</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderData.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Autocomplete
                      value={products.find(p => p._id === item.productId) || null}
                      onChange={(event, newValue) => {
                        handleItemChange(index, 'productId', newValue?._id || '');
                      }}
                      options={products}
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField {...params} label="Wybierz produkt" size="small" />
                      )}
                      sx={{ minWidth: 200 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      size="small"
                      sx={{ width: 80 }}
                      inputProps={{ min: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    {item.price.toFixed(2)} PLN
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {(item.price * item.quantity).toFixed(2)} PLN
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => removeItem(index)}
                      disabled={orderData.items.length === 1}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Button
          startIcon={<AddIcon />}
          onClick={addItem}
          variant="outlined"
          size="small"
          sx={{ mb: 3 }}
        >
          Dodaj produkt
        </Button>

        {/* Shipping Address */}
        <Typography variant="h6" gutterBottom>
          Adres dostawy
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <TextField
            label="Ulica"
            value={orderData.shippingAddress.street}
            onChange={(e) => setOrderData({
              ...orderData,
              shippingAddress: { ...orderData.shippingAddress, street: e.target.value }
            })}
            fullWidth
          />
          <TextField
            label="Miasto"
            value={orderData.shippingAddress.city}
            onChange={(e) => setOrderData({
              ...orderData,
              shippingAddress: { ...orderData.shippingAddress, city: e.target.value }
            })}
            fullWidth
          />
          <TextField
            label="Kod pocztowy"
            value={orderData.shippingAddress.postalCode}
            onChange={(e) => setOrderData({
              ...orderData,
              shippingAddress: { ...orderData.shippingAddress, postalCode: e.target.value }
            })}
            fullWidth
          />
          <TextField
            label="Kraj"
            value={orderData.shippingAddress.country}
            onChange={(e) => setOrderData({
              ...orderData,
              shippingAddress: { ...orderData.shippingAddress, country: e.target.value }
            })}
            fullWidth
          />
        </Box>

        {/* Notes */}
        <TextField
          label="Notatki (opcjonalne)"
          value={orderData.notes}
          onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        {/* Total */}
        <Box sx={{ textAlign: 'right', mt: 2 }}>
          <Typography variant="h6">
            Łączna suma: {calculateTotal().toFixed(2)} PLN
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anuluj
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Tworzenie...' : 'Utwórz zamówienie'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OrderFormDialog;