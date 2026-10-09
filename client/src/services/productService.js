import api from './api';

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (formData) => {
  const response = await api.post('/seller/products', formData);
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await api.put(`/seller/products/${id}`, formData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/seller/products/${id}`);
  return response.data;
};

export const getSellerProducts = async () => {
  const response = await api.get('/seller/products');
  return response.data;
};