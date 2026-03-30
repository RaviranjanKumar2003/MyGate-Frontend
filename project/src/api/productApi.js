import api from "../api/axios"; // your existing axios instance

const BASE_URL = "/products"; // relative to api baseURL

// Get all products
export const getAllProducts = async () => {
  const res = await api.get(BASE_URL);
  return res.data;
};

// Get product by ID
export const getProductById = async (id) => {
  const res = await api.get(`${BASE_URL}/${id}`);
  return res.data;
};

// Get products by society
export const getProductsBySociety = async (societyId) => {
  const res = await api.get(`${BASE_URL}/society/${societyId}`);
  return res.data;
};

// Get products by seller
export const getProductsBySeller = async (sellerId) => {
  const res = await api.get(`${BASE_URL}/seller/${sellerId}`);
  return res.data;
};

// Create a new product
export const createProduct = async (productDto) => {
  const res = await api.post(BASE_URL, productDto);
  return res.data;
};

// Update a product
export const updateProduct = async (id, productDto) => {
  const res = await api.put(`${BASE_URL}/${id}`, productDto);
  return res.data;
};

// Delete a product
export const deleteProduct = async (id) => {
  const res = await api.delete(`${BASE_URL}/${id}`);
  return res.data;
};