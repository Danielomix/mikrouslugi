import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import api from '../services/api';

function Analytics() {
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, salesResponse] = await Promise.all([
        api.getDashboardData(),
        api.getSalesAnalytics(period)
      ]);

      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.dashboard);
      }

      if (salesResponse.success) {
        setSalesData(salesResponse.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon: Icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Icon color={color} sx={{ fontSize: 40 }} />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Typography>Ładowanie analityki...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analityka i Raporty
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Okres</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            label="Okres"
          >
            <MenuItem value="day">Dzisiaj</MenuItem>
            <MenuItem value="week">Tydzień</MenuItem>
            <MenuItem value="month">Miesiąc</MenuItem>
            <MenuItem value="year">Rok</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Metryki główne */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Całkowita sprzedaż"
            value={`${dashboardData?.overview.totalRevenue?.toFixed(2) || '0.00'} PLN`}
            icon={MoneyIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Liczba zamówień"
            value={dashboardData?.overview.totalOrders || 0}
            icon={ShoppingCartIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Liczba użytkowników"
            value={dashboardData?.overview.totalUsers || 0}
            icon={PeopleIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Produkty w magazynie"
            value={dashboardData?.overview.totalProducts || 0}
            icon={TrendingUpIcon}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Statystyki sprzedaży */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statystyki sprzedaży - {period === 'day' ? 'Dzisiaj' : period === 'week' ? 'Ten tydzień' : period === 'month' ? 'Ten miesiąc' : 'Ten rok'}
            </Typography>
            {salesData && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Przychód:</strong> {salesData.totalRevenue?.toFixed(2) || '0.00'} PLN
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Liczba zamówień:</strong> {salesData.totalOrders || 0}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Średnia wartość zamówienia:</strong> {salesData.averageOrderValue?.toFixed(2) || '0.00'} PLN
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Najlepsze produkty */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Najlepiej sprzedające się produkty
            </Typography>
            {salesData?.topProducts && salesData.topProducts.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produkt</TableCell>
                      <TableCell align="right">Sprzedaż</TableCell>
                      <TableCell align="right">Przychód</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell align="right">{product.sales}</TableCell>
                        <TableCell align="right">{product.revenue?.toFixed(2)} PLN</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="textSecondary">Brak danych o sprzedaży produktów</Typography>
            )}
          </Paper>
        </Grid>

        {/* Ostatnia aktywność */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ostatnia aktywność
            </Typography>
            {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
              <List dense>
                {dashboardData.recentActivity.map((activity, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={activity.message}
                      secondary={new Date(activity.timestamp).toLocaleString('pl-PL')}
                    />
                    <Chip
                      label={activity.type}
                      size="small"
                      color={activity.type === 'order' ? 'primary' : activity.type === 'payment' ? 'success' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">Brak ostatniej aktywności</Typography>
            )}
          </Paper>
        </Grid>

        {/* Metryki dzisiejsze */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dzisiejsze metryki
            </Typography>
            {dashboardData?.metrics && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Zamówienia dziś:</Typography>
                  <Typography variant="h6">{dashboardData.metrics.ordersToday || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Przychód dziś:</Typography>
                  <Typography variant="h6">{dashboardData.metrics.revenueToday?.toFixed(2) || '0.00'} PLN</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Nowi użytkownicy:</Typography>
                  <Typography variant="h6">{dashboardData.metrics.newUsersToday || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Alerty magazynowe:</Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" color="warning.main">
                      {dashboardData.metrics.lowStockAlerts || 0}
                    </Typography>
                    {dashboardData.metrics.lowStockAlerts > 0 && (
                      <WarningIcon color="warning" sx={{ ml: 1 }} />
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics;