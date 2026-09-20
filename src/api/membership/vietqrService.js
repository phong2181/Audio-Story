/**
 * 🏦 VietQR Payment Service
 * Handles all VietQR payment API calls
 */

import axiosInstance from '../axios';

/**
 * Generate VietQR code for payment
 * @param {number} planId - Membership plan ID
 * @returns {Promise<Object>} QR code data with image URL
 */
export const createVietQRPayment = async (planId) => {
  try {
    const response = await axiosInstance.post('/membership/create-payment', {
      plan_id: planId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating VietQR payment:', error);
    throw error;
  }
};

/**
 * Confirm VietQR payment after user transfers money
 * @param {string} paymentCode - Payment code from createVietQRPayment response
 * @returns {Promise<Object>} Confirmation response with VIP expiry date
 */
export const confirmVietQRPayment = async (paymentCode) => {
  try {
    const response = await axiosInstance.post('/membership/confirm-vietqr-payment', {
      payment_code: paymentCode
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming VietQR payment:', error);
    throw error;
  }
};

/**
 * Get membership plans
 * @returns {Promise<Array>} List of membership plans
 */
export const getMembershipPlans = async () => {
  try {
    const response = await axiosInstance.get('/membership');
    return response.data;
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    throw error;
  }
};
