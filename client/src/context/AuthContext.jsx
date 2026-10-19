import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('craft_token') || null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('craft_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Save cart changes to localStorage
  useEffect(() => {
    localStorage.setItem('craft_cart', JSON.stringify(cart));
  }, [cart]);

  // Check initial token and retrieve current user profile
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('craft_token');
      if (storedToken) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const res = await api.get('/auth/profile');
          if (res.data && res.data.data) {
            setUser(res.data.data);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // 💡 อัปเดต login: ดึงข้อมูลโปรไฟล์แบบเต็มทันทีหลังเข้าสู่ระบบ เพื่อให้ได้ข้อมูลที่อยู่และเบอร์โทรครบถ้วน
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: fallbackUser } = res.data.data;

    localStorage.setItem('craft_token', receivedToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    setToken(receivedToken);

    try {
      const profileRes = await api.get('/auth/profile');
      if (profileRes.data && profileRes.data.data) {
        setUser(profileRes.data.data);
        return profileRes.data.data;
      }
    } catch (err) {
      console.warn('Failed to fetch full profile after login:', err);
      setUser(fallbackUser);
    }
    return fallbackUser;
  };

  // 💡 อัปเดต register: ดึงข้อมูลโปรไฟล์แบบเต็มทันทีหลังสมัครสมาชิก
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: receivedToken, user: fallbackUser } = res.data.data;

    localStorage.setItem('craft_token', receivedToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    setToken(receivedToken);

    try {
      const profileRes = await api.get('/auth/profile');
      if (profileRes.data && profileRes.data.data) {
        setUser(profileRes.data.data);
        return profileRes.data.data;
      }
    } catch (err) {
      console.warn('Failed to fetch full profile after register:', err);
      setUser(fallbackUser);
    }
    return fallbackUser;
  };

  const logout = () => {
    localStorage.removeItem('craft_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const upgradeToSeller = async (shopData) => {
    const res = await api.post('/auth/upgrade-seller', shopData);
    const { token: updatedToken, user: updatedUser } = res.data.data;

    localStorage.setItem('craft_token', updatedToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${updatedToken}`;
    setToken(updatedToken);
    setUser(updatedUser);
    return updatedUser;
  };

  // Cart operations
  const addToCart = (product, quantity = 1, options = {}) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { ...product, quantity, selectedOptions: options }];
    });
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const role = user?.role || 'guest';
  const isBuyer = role === 'buyer';
  const isSeller = role === 'seller';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        isBuyer,
        isSeller,
        isAdmin,
        login,
        register,
        logout,
        upgradeToSeller,
        cart,
        addToCart,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};