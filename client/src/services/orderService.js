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
  formData.append('payment_slip', file); // ✅ เปลี่ยนจาก 'slip' เป็น 'payment_slip'
  const response = await api.post(`/orders/${orderId}/upload-slip`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * อัปโหลดสลิปชำระเงินงวดที่ 2 (ยอดคงเหลือ)
 */
export const uploadFinalPaymentSlip = async (orderId, file) => {
  const formData = new FormData();
  formData.append('payment_slip', file); // ✅ เปลี่ยนจาก 'slip' เป็น 'payment_slip'
  const response = await api.post(`/orders/${orderId}/upload-final-slip`, formData, {
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

// 🛠️ ปรับปรุงฟังก์ชัน updateCraftStatus ให้แพ็ก FormData ส่งรูปภาพและข้อความได้อย่างแม่นยำ
export const updateCraftStatus = async (orderId, statusData) => {
  let payload = statusData;
  let headers = {};

  // ถ้า statusData เป็น FormData อยู่แล้ว ให้ส่งไปตรงๆ ได้เลย
  if (statusData instanceof FormData) {
    payload = statusData;
    headers = { 'Content-Type': 'multipart/form-data' };
  } else {
    // ถ้าส่งมาเป็น Object ปกติ ให้ทำการแปลงเป็น FormData เพื่อรองรับไฟล์รูปภาพ
    const formData = new FormData();
    formData.append('craft_status', statusData.craft_status || statusData.step || '');
    formData.append('step_title', statusData.step_title || statusData.status_title || '');
    formData.append('note', statusData.note || statusData.notes || '');

    if (statusData.image) {
      formData.append('image', statusData.image);
    }

    payload = formData;
    headers = { 'Content-Type': 'multipart/form-data' };
  }

  const response = await api.patch(`/seller/orders/${orderId}/craft-status`, payload, { headers });
  return response.data;
};