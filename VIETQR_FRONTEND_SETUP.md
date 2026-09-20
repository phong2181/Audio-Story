# 🚀 VietQR Frontend Integration Guide

## 📁 File Structure

```
src/
├── api/
│   ├── axios.js              # Axios instance (has token auto-injection)
│   ├── homePage/
│   │   └── index.js          # Keep existing hooks
│   └── membership/
│       └── vietqrService.js   # ✅ NEW - VietQR API calls
│
├── pages/
│   └── users/
│       └── Membership/
│           ├── index.js              # ✅ UPDATED - Main component
│           ├── VietQRPayment.js       # ✅ NEW - QR payment component
│           ├── vietqrPayment.scss     # ✅ NEW - Styles
│           └── style.scss             # Keep existing styles
```

---

## 🎯 Files Created/Modified

### 1. **✅ NEW: `src/api/membership/vietqrService.js`**

```javascript
/**
 * VietQR Payment Service
 * Handles all API calls
 */
import axiosInstance from '../axios';

// Create Payment (Generate QR)
export const createVietQRPayment = async (planId) => {
  const response = await axiosInstance.post('/membership/create-payment', {
    plan_id: planId
  });
  return response.data;
};

// Confirm Payment (Manual)
export const confirmVietQRPayment = async (paymentCode) => {
  const response = await axiosInstance.post('/membership/confirm-vietqr-payment', {
    payment_code: paymentCode
  });
  return response.data;
};

// Get Plans
export const getMembershipPlans = async () => {
  const response = await axiosInstance.get('/membership');
  return response.data;
};
```

---

### 2. **✅ NEW: `src/pages/users/Membership/VietQRPayment.js`**

Full QR payment component with:
- QR code generation & display
- Payment details showing
- Payment confirmation button
- Error handling & success modal
- Mobile responsive design

**Usage:**
```jsx
<VietQRPayment 
  plan={selectedPlan}
  onSuccess={(response) => {
    // Handle success - navigate, show alert, etc.
  }}
  onClose={() => {
    // Handle close - go back to membership page
  }}
/>
```

---

### 3. **✅ NEW: `src/pages/users/Membership/vietqrPayment.scss`**

Complete styling for:
- QR code container
- Payment details layout
- Confirmation buttons
- Loading & error states
- Mobile responsive design

---

### 4. **✅ UPDATED: `src/pages/users/Membership/index.js`**

Changes made:
- ❌ Removed: `useCreatePayment` hook (MoMo)
- ✅ Added: `VietQRPayment` component import
- ✅ Added: `selectedPlan` state for tracking selected plan
- ✅ Added: `showVietQR` state for showing/hiding VietQR modal
- ✅ Updated: `handleSelectPlan()` - Shows confirmation dialog
- ✅ Added: `handlePaymentSuccess()` - Handles after payment
- ✅ Added: `handlePaymentCancel()` - Handles cancel action
- ✅ Added: Conditional rendering - Shows VietQRPayment when `showVietQR` is true

**Flow:**
1. User clicks "Nâng cấp ngay"
2. Check if logged in → Show confirmation
3. User confirms → Show VietQR component
4. User scan QR → Clicks "Đã chuyển tiền"
5. API confirms → Show success & redirect

---

## 🔧 Setup Steps

### Step 1: Install Dependencies (if needed)

```bash
npm install axios sweetalert2
```

### Step 2: Check Token Setup

Make sure `src/api/axios.js` has proper token injection:

```javascript
axiosinstance.interceptors.request.use((config) => {
    let token = null;
    
    if (config.url && config.url.includes('/admin')) {
        token = localStorage.getItem("adminToken");
    } else {
        token = localStorage.getItem("ACCESS_TOKEN");  // Client token
    }
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});
```

### Step 3: Verify Backend Routes

Backend should have these routes registered in `routes/api.php`:

```php
Route::middleware('auth:client')->group(function () {
    Route::post('/membership/create-payment', [MembershipController::class, 'createPayment']);
    Route::post('/membership/confirm-vietqr-payment', [MembershipController::class, 'confirmVietQRPayment']);
});

Route::post('/membership/vietqr-bank-webhook', [MembershipController::class, 'vietqrBankWebhook']);
```

### Step 4: Test Locally

```bash
# 1. Start your React dev server
npm start

# 2. Navigate to membership page
http://localhost:3000/membership

# 3. Login to account

# 4. Click "Nâng cấp ngay" on a plan

# 5. Confirm dialog appears

# 6. VietQRPayment component should render with QR code
```

---

## 🧪 Testing API Integration

### Test 1: Generate QR

```javascript
// In browser console
import { createVietQRPayment } from 'api/membership/vietqrService';

createVietQRPayment(1).then(res => {
  console.log('QR Response:', res);
  // Should return: { success: true, qrUrl, qrData, accountNumber, amount, ... }
});
```

### Test 2: Confirm Payment

```javascript
// After generating QR
import { confirmVietQRPayment } from 'api/membership/vietqrService';

confirmVietQRPayment('1692864537_5').then(res => {
  console.log('Confirm Response:', res);
  // Should return: { success: true, message, vip_expires_at }
});
```

---

## 🎨 Styling Overview

### Colors
- Primary: `#667eea` (Purple)
- Success: `#27ae60` (Green)
- Error: `#d63031` (Red)
- Background: `#f9f9f9` (Light Gray)

### Components
- `.payment-container` - Main container
- `.qr-container` - QR code wrapper
- `.payment-details` - Details section
- `.confirmation-section` - Confirm buttons
- `.confirm-btn` - Green success button
- `.cancel-btn` - Gray cancel button

---

## 📱 Mobile Responsiveness

- **Desktop**: QR 280x280px, full layout
- **Tablet**: QR 240x240px, adjusted padding
- **Mobile**: QR 200x200px, stacked layout

Automatically switches based on screen width:
- `@media (max-width: 600px)` - Mobile styles

---

## 🚨 Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Token expired/missing | User needs to login again |
| `400 Bad Request` | Payment not confirmed by bank yet | Wait 1-2 minutes and retry |
| `404 Not Found` | Route not registered | Check `routes/api.php` |
| `500 Server Error` | Backend issue | Check Laravel logs |
| QR image won't load | vietqr.io API down | Fallback to QR data string |

---

## 🔄 Payment Flow Diagram

```
┌─ User clicks "Nâng cấp ngay"
│
├─ Check login status
│  ├─ Not logged → Show login dialog
│  └─ Logged → Continue
│
├─ Show confirmation modal
│  ├─ User cancels → Return to membership
│  └─ User confirms → Continue
│
├─ Call createVietQRPayment API
│  ├─ Success → Show VietQRPayment component
│  └─ Error → Show error message
│
├─ User scans QR & transfers money
│
├─ User clicks "Đã chuyển tiền"
│
├─ Call confirmVietQRPayment API
│  ├─ Success → Show success modal & redirect
│  ├─ Pending → Show "Wait 1-2 minutes"
│  └─ Error → Show error message
│
└─ User redirected to /dashboard (VIP activated)
```

---

## 📚 Component Props

### VietQRPayment

```javascript
<VietQRPayment
  // Required
  plan={{
    id: 1,
    name: "Premium Monthly",
    price: 99000,
    type: "monthly"
  }}
  
  // Callbacks
  onSuccess={(response) => {
    // { success: true, message, vip_expires_at }
  }}
  
  onClose={() => {
    // User clicked close/cancel
  }}
/>
```

---

## 🎯 Next Steps

1. ✅ Files created/updated
2. ✅ Test locally in browser
3. ⏳ Update backend `.env` with real bank details
4. ⏳ Test with actual bank account
5. ⏳ Deploy to production
6. ⏳ Optional: Setup bank webhook for automatic confirmation

---

## 💡 Tips & Tricks

### Tip 1: Check Token in Console
```javascript
console.log(localStorage.getItem('ACCESS_TOKEN'));
```

### Tip 2: Test Payment Code
```javascript
// Use dummy payment code for testing
const testPaymentCode = '1692864537_5';
await confirmVietQRPayment(testPaymentCode);
```

### Tip 3: Add Loading State
```javascript
const [isLoading, setIsLoading] = useState(false);

const handlePay = async () => {
  setIsLoading(true);
  try {
    await confirmVietQRPayment(paymentCode);
  } finally {
    setIsLoading(false);
  }
};
```

### Tip 4: Copy Account Number
Component already has copy button - users can click to copy account number

---

## 🔐 Security Notes

1. ✅ Token automatically injected by axios interceptor
2. ✅ All API calls require authentication (`auth:client`)
3. ✅ Payment verification happens on backend
4. ✅ QR data doesn't expose sensitive info
5. ✅ User input sanitized by backend

---

## 📞 Support

- **Frontend Issues**: Check browser console for errors
- **API Issues**: Check Laravel logs at `storage/logs/`
- **Payment Issues**: Check VietQR API at https://vietqr.io/api-docs

