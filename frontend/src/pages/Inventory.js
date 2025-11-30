import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Snackbar
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon
} from '@mui/icons-material';
import api from '../services/api';

function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [inventoryResponse, lowStockResponse] = await Promise.all([
        api.getInventory(),
        api.getLowStockItems()
      ]);

      if (inventoryResponse.success) {
        setInventoryItems(inventoryResponse.items || []);
      }

      if (lowStockResponse.success) {
        setLowStockItems(lowStockResponse.items || []);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      setSnackbar({
        open: true,
        message: 'Błąd podczas ładowania danych magazynowych',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (item) => {
    if (item.availableQuantity <= 0) return 'error';
    if (item.quantity <= item.reorderPoint) return 'warning';
    return 'success';
  };

  const getStatusLabel = (item) => {
    if (item.availableQuantity <= 0) return 'Wyprzedane';
    if (item.quantity <= item.reorderPoint) return 'Niski stan';
    return 'Dostępne';
  };

  const displayedItems = showLowStockOnly ? lowStockItems : inventoryItems;

  if (loading) {
    return <Typography>Ładowanie danych magazynowych...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Zarządzanie Magazynem
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* TODO: Dodawanie produktów do magazynu */}}
        >
          Dodaj produkt
        </Button>
      </Box>

      {/* Alerty o niskim stanie */}
      {lowStockItems.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            >
              {showLowStockOnly ? 'Pokaż wszystko' : 'Pokaż problemy'}
            </Button>
          }
        >
          <strong>Uwaga!</strong> {lowStockItems.length} produktów ma niski stan magazynowy
        </Alert>
      )}

      {/* Statystyki szybkie */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <InventoryIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Produkty w magazynie
                  </Typography>
                  <Typography variant="h6">
                    {inventoryItems.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarningIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Niski stan magazynowy
                  </Typography>
                  <Typography variant="h6">
                    {lowStockItems.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingDownIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Wyprzedane
                  </Typography>
                  <Typography variant="h6">
                    {inventoryItems.filter(item => item.availableQuantity <= 0).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Przełącznik filtrowania */}
      <Box mb={2}>
        <FormControlLabel
          control={
            <Switch
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
            />
          }
          label="Pokaż tylko produkty z niskim stanem magazynowym"
        />
      </Box>

      {/* Tabela produktów */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Nazwa produktu</TableCell>
              <TableCell align="center">Stan magazynowy</TableCell>
              <TableCell align="center">Zarezerwowane</TableCell>
              <TableCell align="center">Dostępne</TableCell>
              <TableCell align="center">Próg uzupełnienia</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Magazyn</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary">
                    {showLowStockOnly ? 'Brak produktów z niskim stanem' : 'Brak produktów w magazynie'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayedItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {item.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="bold">
                      {item.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="warning.main">
                      {item.reservedQuantity || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={item.availableQuantity <= 0 ? 'error.main' : 'success.main'}
                    >
                      {item.availableQuantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="textSecondary">
                      {item.reorderPoint}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(item)}
                      color={getStatusColor(item)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {item.warehouse?.name || 'Główny'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar dla komunikatów */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Inventory;