import api from './api';

/**
 * สร้างคำสั่งซื้อใหม่ (รองรับทั้ง FormData สำหรับแนบไฟล์สลิป 'payment_slip' และ JSON Object ทั่วไป)
 */
export const createOrder = async (orderData) => {
  const isFormData = orderData instanceof FormData;
  const response = await api.post('/orders', orderData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
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

/**
 * อัปโหลดสลิปชำระเงินงวดแรก / เต็มจำนวน (แนบฟิลด์ 'payment_slip')
 */
export const uploadPaymentSlip = async (orderId, file) => {
  const formData = new FormData();
  formData.append('payment_slip', file);
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
  formData.append('payment_slip', file);
  const response = await api.post(`/orders/${orderId}/upload-final-slip`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * ดึงรายการคำสั่งซื้อฝั่งผู้ขาย (ดึงข้อมูลสลิปทั้งสองงวด สินค้าแยกชิ้นย่อย 1:1 และ Timeline)
 */
export const getSellerOrders = async () => {
  try {
    const response = await api.get('/seller/orders');
    return response.data;
  } catch (err) {
    const fallbackRes = await api.get('/orders/seller-orders');
    return fallbackRes.data;
  }
};

/**
 * ผู้ซื้อยืนยันได้รับสินค้าและเสร็จสิ้นคำสั่งซื้อ
 */
export const confirmReceivedOrder = async (orderId) => {
  const response = await api.patch(`/orders/${orderId}/confirm-received`);
  return response.data;
};

/**
 * อัปเดตสเต็ปงานคราฟต์ / Artisan Journal พร้อมรองรับการแนบรูปภาพความคืบหน้า
 */
export const updateCraftStatus = async (orderId, statusData) => {
  let payload = statusData;
  let headers = {};

  if (statusData instanceof FormData) {
    payload = statusData;
    headers = { 'Content-Type': 'multipart/form-data' };
  } else {
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