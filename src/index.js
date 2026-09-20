import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import RouterCustom from './router';
import { Toaster } from "react-hot-toast";
import './style/style.scss';
import './style/theme.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ScrollToTop from 'pages/scrolltotop';
import { ThemeProvider } from 'context/ThemeContext';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // Dữ liệu được coi là "tươi" trong 5 phút
      gcTime: 10 * 60 * 1000,         // Giữ dữ liệu trong bộ nhớ đệm 10 phút (v5 dùng gcTime)
      refetchOnWindowFocus: false,    // Không tự động load lại khi Dũng quay lại tab trình duyệt
      retry: 1,                       // Nếu lỗi mạng, thử lại thêm 1 lần duy nhất
    },
  },
});
const root = ReactDOM.createRoot(document.getElementById('root'));



root.render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" reverseOrder={false} />
        
        
        <ScrollToTop />
        <RouterCustom />
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);
