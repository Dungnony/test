import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "../types";

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  username: localStorage.getItem("username"),
  role: localStorage.getItem("role"),
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; username: string; role: string }>
    ) => {
      const { token, username, role } = action.payload;
      state.token = token;
      state.username = username;
      state.role = role;
      state.isAuthenticated = true;

      // Persist to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);
    },
    logout: (state) => {
      state.token = null;
      state.username = null;
      state.role = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
