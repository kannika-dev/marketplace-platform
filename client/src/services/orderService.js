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

// 🛠️ แก้ไขฟังก์ชันนี้ให้รองรับการส่งรูปภาพผ่าน FormData แบบอัตโนมัติ
export const updateCraftStatus = async (orderId, statusData) => {
  let payload = statusData;
  let headers = {};

  // ถ้ามีไฟล์รูปภาพแนบมาด้วย (เช่น image file หรือ formData) ให้แพັກใส่ FormData
  if (statusData instanceof FormData) {
    payload = statusData;
    headers = { 'Content-Type': 'multipart/form-data' };
  } else if (statusData && statusData.image) {
    const formData = new FormData();
    formData.append('craft_status', statusData.craft_status || '');
    formData.append('step_title', statusData.step_title || '');
    formData.append('note', statusData.note || '');
    formData.append('image', statusData.image);
    payload = formData;
    headers = { 'Content-Type': 'multipart/form-data' };
  }

  const response = await api.patch(`/seller/orders/${orderId}/craft-status`, payload, { headers });
  return response.data;
};