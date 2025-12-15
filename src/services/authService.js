// src/services/authService.js
import axios from "axios";
import { BASE_URL } from "./httpService"; // import کردن BASE_URL

class AuthService {
  // لاگین کاربر
  async login(username, password) {
    try {
      // حالا BASE_URL از httpService import می‌شود
      console.log("در حال ارسال درخواست لاگین به:", `${BASE_URL}/token`);

      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post(`${BASE_URL}/token`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        timeout: 10000,
      });

      console.log("پاسخ دریافت شده از سرور:", response.data);

      // ذخیره توکن در localStorage
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("token_type", response.data.token_type);
        console.log("توکن با موفقیت ذخیره شد");
      }

      return response.data;
    } catch (error) {
      console.error("خطا در لاگین:", error);
      let errorMessage = "خطا در ارتباط با سرور";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "نام کاربری یا رمز عبور اشتباه است";
        } else if (error.response.status === 404) {
          errorMessage = "آدرس سرویس پیدا نشد. لطفاً از درست بودن آدرس مطمئن شوید";
        } else if (error.response.status === 500) {
          errorMessage = "خطای داخلی سرور";
        } else {
          errorMessage = error.response.data?.detail || `خطا: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = "سرور پاسخ نمی‌دهد. لطفاً اتصال شبکه و اجرا بودن سرور را بررسی کنید";
      } else {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // دریافت اطلاعات کاربر از endpoint جدید
  async getCurrentUser() {
    try {
      console.log("در حال دریافت اطلاعات کاربر از:", `${BASE_URL}/users/me`);
      
      const response = await axios.get(`${BASE_URL}/users/me`, {
        headers: this.getAuthHeader(),
      });

      console.log("پاسخ اطلاعات کاربر:", response.data);

      // تبدیل پاسخ [username, role] به object
      const [username, role] = response.data;
      return {
        username: username,
        role: role.toLowerCase(), // تبدیل به حروف کوچک
        name: this.formatUserName(username) // فرمت کردن نام برای نمایش
      };
    } catch (error) {
      console.error("خطا در دریافت اطلاعات کاربر:", error);
      throw error;
    }
  }

  // فرمت کردن نام کاربر برای نمایش
  formatUserName(username) {
    if (!username) return 'کاربر';
    
    // تبدیل به فرمت مناسب برای نمایش
    // مثلاً: m-sadri → M-Sadri
    return username
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('-');
  }

  // ذخیره اطلاعات کاربر در localStorage
  setUserData(userData) {
    if (userData) {
      localStorage.setItem("user_name", userData.username);
      localStorage.setItem("user_role", userData.role);
      localStorage.setItem("user_display_name", userData.name || this.formatUserName(userData.username));
      console.log("اطلاعات کاربر ذخیره شد:", userData);
    }
  }

  // دریافت اطلاعات کاربر از localStorage
  getUserData() {
    const username = localStorage.getItem("user_name");
    const role = localStorage.getItem("user_role");
    const displayName = localStorage.getItem("user_display_name");
    
    if (username) {
      return {
        username: username,
        role: role,
        name: displayName || this.formatUserName(username),
        isAuthenticated: true
      };
    }
    return null;
  }

  // پاک کردن اطلاعات کاربر
  clearUserData() {
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_display_name");
    console.log("اطلاعات کاربر پاک شد");
  }

  // خروج کاربر
  logout() {
    this.clearUserData();
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    console.log("کاربر با موفقیت خارج شد");
  }

  // بررسی لاگین بودن کاربر
  isLoggedIn() {
    const token = localStorage.getItem("access_token");
    const userData = this.getUserData();
    return !!token && !!userData;
  }

  // دریافت توکن
  getToken() {
    return localStorage.getItem("access_token");
  }

  // دریافت نوع توکن
  getTokenType() {
    return localStorage.getItem("token_type") || "Bearer";
  }

  // دریافت هدر Authorization برای درخواست‌ها
  getAuthHeader() {
    const token = this.getToken();
    const tokenType = this.getTokenType();

    if (token) {
      return {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      };
    }

    return {};
  }

  // دریافت نقش کاربر
  getUserRole() {
    return localStorage.getItem("user_role");
  }

  // دریافت نام کاربر
  getUserName() {
    return localStorage.getItem("user_name");
  }

  // دریافت نام نمایشی کاربر
  getUserDisplayName() {
    return localStorage.getItem("user_display_name") || this.formatUserName(this.getUserName());
  }

  // بررسی دسترسی بر اساس نقش
  hasRole(requiredRole) {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    
    return userRole === requiredRole.toLowerCase();
  }

  // بررسی اینکه کاربر یکی از نقش‌های مورد نظر را دارد
  hasAnyRole(requiredRoles) {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    
    return requiredRoles.map(role => role.toLowerCase()).includes(userRole);
  }

  // بررسی اعتبار توکن (ساده)
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // در پروژه واقعی باید JWT decode کنید و expiration رو چک کنید
      return true;
    } catch (error) {
      console.error("خطا در بررسی اعتبار توکن:", error);
      return false;
    }
  }

  // رفرش توکن (اگر backend پشتیبانی می‌کند)
  async refreshToken() {
    try {
      // این endpoint بستگی به backend دارد
      const response = await axios.post(
        `${BASE_URL}/refresh-token`,
        {},
        {
          headers: this.getAuthHeader(),
        }
      );

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        console.log("توکن با موفقیت رفرش شد");
        return true;
      }
      return false;
    } catch (error) {
      console.error("خطا در رفرش توکن:", error);
      this.logout();
      return false;
    }
  }

  // بررسی وضعیت احراز هویت
  getAuthStatus() {
    const isLoggedIn = this.isLoggedIn();
    const userData = this.getUserData();
    const tokenValid = this.isTokenValid();

    return {
      isLoggedIn,
      isAuthenticated: isLoggedIn && tokenValid,
      user: userData,
      tokenValid,
      hasToken: !!this.getToken()
    };
  }

  // بررسی اتصال به سرور
  async checkServerConnection() {
    try {
      const response = await axios.get(`${BASE_URL}/health`, {
        timeout: 5000
      });
      return {
        connected: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

// ایجاد یک instance از سرویس
const authService = new AuthService();

export default authService;