import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
  });

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home',
    'Sports',
    'Food',
    'Other',
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await api.getProducts(params);
      setProducts(response.products || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Nie udało się pobrać produktów');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handleDelete = async (product) => {
    try {
      await api.deleteProduct(product._id);
      toast.success('Produkt został usunięty');
      fetchProducts();
      setDeleteDialog({ open: false, product: null });
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Nie udało się usunąć produktu');
    }
  };

  const openDeleteDialog = (product) => {
    setDeleteDialog({ open: true, product });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, product: null });
  };

  const ProductCard = ({ product }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h2" gutterBottom>
            {product.name}
          </Typography>
          <Chip
            label={product.category}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {product.description}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="h5" color="primary" component="span">
            ${product.price}
          </Typography>
          <Chip
            label={`Stock: ${product.stock}`}
            size="small"
            color={product.stock > 0 ? 'success' : 'error'}
            variant="outlined"
          />
        </Box>
        
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          SKU: {product.sku}
        </Typography>
        
        {product.tags && product.tags.length > 0 && (
          <Box mt={1}>
            {product.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={() => navigate(`/products/edit/${product._id}`)}
        >
          Edytuj
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<Delete />}
          onClick={() => openDeleteDialog(product)}
        >
          Usuń
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Produkty 🛍️
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/products/new')}
          size="large"
        >
          Dodaj Produkt
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtry
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Szukaj"
                variant="outlined"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Kategoria</InputLabel>
                <Select
                  value={filters.category}
                  label="Kategoria"
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">Wszystkie</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Min. cena"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Max. cena"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={3} display="flex" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Znaleziono: {pagination.total || 0} produktów
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={60} />
        </Box>
      ) : products.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="h6">Brak produktów</Typography>
          <Typography>
            Nie znaleziono produktów spełniających kryteria wyszukiwania.
            <Button onClick={() => navigate('/products/new')} sx={{ ml: 1 }}>
              Dodaj pierwszy produkt
            </Button>
          </Typography>
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              {[...Array(pagination.pages)].map((_, index) => (
                <Button
                  key={index + 1}
                  variant={pagination.page === index + 1 ? 'contained' : 'outlined'}
                  sx={{ mx: 0.5 }}
                  onClick={() => handleFilterChange('page', index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/products/new')}
      >
        <Add />
      </Fab>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Usuń produkt
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Czy na pewno chcesz usunąć produkt "{deleteDialog.product?.name}"?
            Ta operacja jest nieodwracalna.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Anuluj</Button>
          <Button
            onClick={() => handleDelete(deleteDialog.product)}
            color="error"
            autoFocus
          >
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Products;