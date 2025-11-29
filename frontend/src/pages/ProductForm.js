import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save, Cancel, Add, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home',
    'Sports',
    'Food',
    'Other',
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      sku: '',
      images: [{ url: '', alt: '' }],
    },
  });

  const watchedImages = watch('images');

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchProduct = async () => {
    try {
      setFetching(true);
      const response = await api.getProduct(id);
      const product = response.product;
      
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        sku: product.sku,
        images: product.images?.length > 0 ? product.images : [{ url: '', alt: '' }],
      });
      
      setTags(product.tags || []);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Nie udało się pobrać danych produktu');
      navigate('/products');
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const productData = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        tags: tags,
        images: data.images.filter(img => img.url.trim() !== ''),
      };

      if (isEdit) {
        await api.updateProduct(id, productData);
        toast.success('Produkt został zaktualizowany');
      } else {
        await api.createProduct(productData);
        toast.success('Produkt został utworzony');
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      const errorMessage = error.response?.data?.message || 'Nie udało się zapisać produktu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addImageField = () => {
    const currentImages = watchedImages || [];
    setValue('images', [...currentImages, { url: '', alt: '' }]);
  };

  const removeImageField = (index) => {
    const currentImages = watchedImages || [];
    if (currentImages.length > 1) {
      setValue('images', currentImages.filter((_, i) => i !== index));
    }
  };

  if (fetching) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEdit ? '✏️ Edytuj Produkt' : '➕ Dodaj Nowy Produkt'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isEdit ? 'Zaktualizuj informacje o produkcie' : 'Uzupełnij dane nowego produktu'}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Podstawowe informacje
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ 
                    required: 'Nazwa produktu jest wymagana',
                    minLength: { value: 2, message: 'Nazwa musi mieć co najmniej 2 znaki' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nazwa produktu"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="sku"
                  control={control}
                  rules={{ 
                    required: 'SKU jest wymagane',
                    pattern: {
                      value: /^[A-Z0-9-]+$/,
                      message: 'SKU może zawierać tylko duże litery, cyfry i myślniki'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="SKU"
                      error={!!errors.sku}
                      helperText={errors.sku?.message || "Format: LAP-001"}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ 
                    required: 'Opis produktu jest wymagany',
                    maxLength: { value: 1000, message: 'Opis może mieć maksymalnie 1000 znaków' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Opis produktu"
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              {/* Pricing and Stock */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Cena i dostępność
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="price"
                  control={control}
                  rules={{ 
                    required: 'Cena jest wymagana',
                    min: { value: 0, message: 'Cena musi być większa od 0' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Cena ($)"
                      type="number"
                      step="0.01"
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="stock"
                  control={control}
                  rules={{ 
                    required: 'Stan magazynowy jest wymagany',
                    min: { value: 0, message: 'Stan magazynowy nie może być ujemny' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Stan magazynowy"
                      type="number"
                      error={!!errors.stock}
                      helperText={errors.stock?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Kategoria jest wymagana' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Kategoria</InputLabel>
                      <Select {...field} label="Kategoria">
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && (
                        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                          {errors.category.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Tags */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Tagi
                </Typography>
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box display="flex" gap={1}>
                  <TextField
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    label="Dodaj tag"
                    size="small"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button
                    variant="outlined"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                  >
                    <Add />
                  </Button>
                </Box>
              </Grid>

              {/* Images */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Zdjęcia produktu
                </Typography>
                {watchedImages?.map((image, index) => (
                  <Box key={index} display="flex" gap={2} mb={2} alignItems="center">
                    <Controller
                      name={`images.${index}.url`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={`URL zdjęcia ${index + 1}`}
                          placeholder="https://example.com/image.jpg"
                        />
                      )}
                    />
                    <Controller
                      name={`images.${index}.alt`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Alt text"
                          sx={{ minWidth: 200 }}
                        />
                      )}
                    />
                    {watchedImages.length > 1 && (
                      <Button
                        color="error"
                        onClick={() => removeImageField(index)}
                      >
                        <Delete />
                      </Button>
                    )}
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addImageField}
                  sx={{ mt: 1 }}
                >
                  Dodaj kolejne zdjęcie
                </Button>
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/products')}
                    disabled={loading}
                  >
                    Anuluj
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      isEdit ? 'Zaktualizuj' : 'Zapisz'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ProductForm;