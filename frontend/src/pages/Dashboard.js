import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ShoppingCart,
  TrendingUp,
  Inventory,
  People,
  Add,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalInventoryItems: 0,
    recentProducts: [],
    recentOrders: [],
    analyticsData: null,
    loading: true,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true); // silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (silent = false) => {
    try {
      console.log('Fetching dashboard data...');
      if (!silent) {
        setStats(prev => ({ ...prev, loading: true }));
      } else {
        setRefreshing(true);
      }

      // Fetch data from multiple services in parallel
      const [productsResponse, ordersResponse, inventoryResponse, analyticsResponse] = await Promise.allSettled([
        api.getProducts({ limit: 5 }),
        api.getOrders({ limit: 5 }),
        api.getInventory({ limit: 10 }),
        api.getDashboardData().catch(err => ({ success: false, error: err.message }))
      ]);

      console.log('Dashboard API Responses:', {
        products: productsResponse.value,
        orders: ordersResponse.value,
        inventory: inventoryResponse.value,
        analytics: analyticsResponse.value
      });
      
      // Process products data
      const products = productsResponse.status === 'fulfilled' && productsResponse.value?.success 
        ? productsResponse.value 
        : { products: [], pagination: { total: 0 } };

      // Process orders data
      const orders = ordersResponse.status === 'fulfilled' && ordersResponse.value?.success 
        ? ordersResponse.value 
        : { orders: [], pagination: { total: 0 } };

      // Process inventory data
      const inventory = inventoryResponse.status === 'fulfilled' && inventoryResponse.value?.success 
        ? inventoryResponse.value 
        : { items: [], pagination: { total: 0 } };

      // Process analytics data
      const analytics = analyticsResponse.status === 'fulfilled' && analyticsResponse.value?.success 
        ? analyticsResponse.value 
        : null;

      setStats({
        totalProducts: products.pagination?.total || 0,
        totalOrders: orders.pagination?.total || 0,
        totalInventoryItems: inventory.pagination?.total || 0,
        recentProducts: products.products || [],
        recentOrders: orders.orders || [],
        analyticsData: analytics,
        loading: false,
      });

      console.log('Dashboard stats updated:', {
        totalProducts: products.pagination?.total || 0,
        totalOrders: orders.pagination?.total || 0,
        totalInventoryItems: inventory.pagination?.total || 0,
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      console.error('Dashboard error details:', error.response?.data);
      setStats(prev => ({ ...prev, loading: false }));
    } finally {
      setRefreshing(false);
    }
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: 3 } : {},
        transition: 'all 0.2s ease-in-out',
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h3" component="div" color={color}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (stats.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Witaj, {user.name}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Przegląd systemu mikrousług - dane aktualizowane w czasie rzeczywistym
            </Typography>
          </Box>
          <IconButton 
            onClick={() => fetchDashboardData()} 
            disabled={refreshing}
            color="primary"
            size="large"
          >
            <Refresh sx={{ transform: refreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Produkty"
            value={stats.totalProducts}
            icon={<Inventory />}
            color="primary"
            onClick={() => navigate('/products')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Zamówienia"
            value={stats.totalOrders}
            icon={<ShoppingCart />}
            color="warning"
            onClick={() => navigate('/orders')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Magazyn"
            value={stats.totalInventoryItems}
            icon={<Inventory />}
            color="info"
            onClick={() => navigate('/inventory')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Analityka"
            value={stats.analyticsData ? "📊" : "📈"}
            icon={<TrendingUp />}
            color="success"
            onClick={() => navigate('/analytics')}
          />
        </Grid>
      </Grid>

      {/* Recent Products and Orders */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2">
                  Ostatnie Produkty
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => navigate('/products/new')}
                >
                  Dodaj
                </Button>
              </Box>
              
              {stats.recentProducts.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    Brak produktów. Dodaj pierwszy produkt!
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {stats.recentProducts.map((product) => (
                    <Box
                      key={product._id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1.5}
                      borderBottom="1px solid #f0f0f0"
                    >
                      <Box>
                        <Typography variant="subtitle2">
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.description?.substring(0, 30)}...
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="subtitle2" color="primary">
                          {product.price} PLN
                        </Typography>
                        <Chip
                          label={product.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2">
                  Ostatnie Zamówienia
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ShoppingCart />}
                  onClick={() => navigate('/orders')}
                >
                  Zobacz wszystkie
                </Button>
              </Box>
              
              {stats.recentOrders.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    Brak zamówień. Pierwsze zamówienie można utworzyć w sekcji Zamówienia!
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {stats.recentOrders.map((order) => (
                    <Box
                      key={order._id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1.5}
                      borderBottom="1px solid #f0f0f0"
                    >
                      <Box>
                        <Typography variant="subtitle2">
                          {order.orderNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.items?.length} produktów
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="subtitle2" color="primary">
                          {order.finalAmount || order.totalAmount} PLN
                        </Typography>
                        <Chip
                          label={order.status}
                          size="small"
                          color={order.status === 'delivered' ? 'success' : 
                                 order.status === 'cancelled' ? 'error' : 'warning'}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" mb={3}>
                Szybkie Akcje
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Add />}
                    onClick={() => navigate('/products/new')}
                    sx={{ py: 1.5 }}
                  >
                    Dodaj Produkt
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ShoppingCart />}
                    onClick={() => navigate('/orders')}
                    sx={{ py: 1.5 }}
                  >
                    Nowe Zamówienie
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Inventory />}
                    onClick={() => navigate('/inventory')}
                    sx={{ py: 1.5 }}
                  >
                    Sprawdź Magazyn
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TrendingUp />}
                    onClick={() => navigate('/analytics')}
                    sx={{ py: 1.5 }}
                  >
                    Analityka
                  </Button>
                </Grid>
              </Grid>

              <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom>
                  💡 Wskazówka
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dane na dashboardzie są aktualizowane w czasie rzeczywistym z wszystkich 8 mikrousług!
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;