import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://bloger.test/api/";
// Tăng timeout mặc định lên 60s để hỗ trợ các thao tác dài (upload file, TTS...).
// Riêng TTS sẽ ghi đè timeout lên 5 phút trong generateTTSAudioAPI.
const timeout = +(process.env.REACT_APP_API_TIMEOUT) || 60000;

const axiosinstance = axios.create({
    baseURL,
    timeout,
});

// PHẦN QUAN TRỌNG NHẤT: Gắn Token vào mọi request gửi đi
axiosinstance.interceptors.request.use(
    (config) => {
        let token = null;

        // Kiểm tra xem URL có phải là của Admin/Staff không
        if (config.url && config.url.includes('/admin')) {
            token = localStorage.getItem("adminToken");
        } else {
            // Lấy token của Client. 
            // Lưu ý: Hãy thay thế "clientToken" bằng key bạn thực tế sử dụng để lưu token client
            token = localStorage.getItem("ACCESS_TOKEN");
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }

);

// axiosinstance.interceptors.request.use(

//     (config) => {

//             const token = localStorage.getItem("adminToken"); // Lấy token từ LocalStorage

//             if (token) {

//                 config.headers.Authorization = `Bearer ${token}`;

//             }

//             return config;

//         },

//         (error) => {

//             return Promise.reject(error);

//         }

// );

axiosinstance.interceptors.response.use(
    function (response) {
        // Laravel trả về data trực tiếp thì lấy luôn
        if (response.data) {
            return response.data;
        }
        return response.data || response;
    },
    function (error) {
        // Nếu Server trả về 401, có thể Token hết hạn, bạn nên xóa auth và cho login lại
        if (error.response && error.response.status === 401) {
            // localStorage.removeItem("admin_auth");
            // window.location.href = "/admin/login"; 
        }
        return Promise.reject(error || new Error("Unknown Error"));
    }
)

export default axiosinstance;