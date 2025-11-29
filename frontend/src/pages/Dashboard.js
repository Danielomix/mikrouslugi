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
} from '@mui/material';
import {
  ShoppingCart,
  TrendingUp,
  Inventory,
  People,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    recentProducts: [],
    loading: true,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const productsResponse = await api.getProducts({ limit: 5 });
      
      setStats({
        totalProducts: productsResponse.pagination?.total || 0,
        totalUsers: 1, // Since we only have current user info
        recentProducts: productsResponse.products || [],
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
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
        <Typography variant="h4" component="h1" gutterBottom>
          Witaj, {user.name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Przegląd systemu mikrousług - zarządzaj produktami i monitoruj statystyki
        </Typography>
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
            title="Użytkownicy"
            value={stats.totalUsers}
            icon={<People />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sprzedaż"
            value="₹2.4M"
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Zamówienia"
            value="1,234"
            icon={<ShoppingCart />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Recent Products and Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2">
                  Ostatnie Produkty
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate('/products/new')}
                >
                  Dodaj Produkt
                </Button>
              </Box>
              
              {stats.recentProducts.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
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
                      py={2}
                      borderBottom="1px solid #f0f0f0"
                    >
                      <Box>
                        <Typography variant="subtitle1">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.description}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6" color="primary">
                          ${product.price}
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

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" mb={3}>
                Szybkie Akcje
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                  onClick={() => navigate('/products/new')}
                  sx={{ py: 1.5 }}
                >
                  Dodaj Nowy Produkt
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ShoppingCart />}
                  onClick={() => navigate('/products')}
                  sx={{ py: 1.5 }}
                >
                  Przeglądaj Produkty
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUp />}
                  sx={{ py: 1.5 }}
                  disabled
                >
                  Raporty (Wkrótce)
                </Button>
              </Box>

              <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom>
                  💡 Wskazówka
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  System mikrousług pozwala na niezależne skalowanie każdego komponentu!
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