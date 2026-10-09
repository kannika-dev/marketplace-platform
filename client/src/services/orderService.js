import api from './api';

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const uploadPaymentSlip = async (orderId, file) => {
  const formData = new FormData();
  formData.append('slip', file);
  const response = await api.post(`/orders/${orderId}/upload-slip`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getSellerOrders = async () => {
  const response = await api.get('/seller/orders');
  return response.data;
};

export const updateCraftStatus = async (orderId, statusData) => {
  const response = await api.patch(`/seller/orders/${orderId}/craft-status`, statusData);
  return response.data;
};
