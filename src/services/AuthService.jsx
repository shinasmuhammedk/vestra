import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000", // change if needed
  withCredentials: true,
});

/* 🔐 Forgot Password OTP */
export const sendForgotPasswordOtp = (email) => {
  return API.post("/auth/forgot-password", { email });
};

/* 🔐 Verify OTP */
export const verifyForgotOtp = (email, otp) => {
  return API.post("/auth/verify-forgot-otp", { email, otp });
};

/* 🔐 Reset Password */
export const resetPassword = (email, password) => {
  return API.post("/auth/reset-password", {
    email,
    password,
  });
};