// src/features/auth/authSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

// ------------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------------
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

// ------------------------------------------------------------------
// SIGNUP (User self-registers if added by admin)
// ------------------------------------------------------------------
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, userData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    }
  }
);

// ------------------------------------------------------------------
// CREATE USER (Admin adds user manually)
// ------------------------------------------------------------------
export const createUser = createAsyncThunk(
  "auth/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/create-user`, userData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error creating user."
      );
    }
  }
);

// ------------------------------------------------------------------
// GET USERS (Admin view all users)
// ------------------------------------------------------------------
export const getUsers = createAsyncThunk(
  "auth/getUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/get-users`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users."
      );
    }
  }
);

// ------------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------------
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  localStorage.removeItem("user");
  return null;
});

// ------------------------------------------------------------------
// CREATE REQUIREMENT
// ------------------------------------------------------------------
export const createRequirement = createAsyncThunk(
  "requirements/createRequirement",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/requirements`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create requirement"
      );
    }
  }
);

// ------------------------------------------------------------------
// FETCH ALL REQUIREMENTS
// ------------------------------------------------------------------
export const fetchRequirements = createAsyncThunk(
  "requirements/fetchRequirements",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/get-requirements`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch requirements"
      );
    }
  }
);

// ------------------------------------------------------------------
// ASSIGN REQUIREMENT TO RECRUITER
// ------------------------------------------------------------------
export const assignRequirement = createAsyncThunk(
  "requirements/assignRequirement",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/assign-requirement`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Requirement assignment failed"
      );
    }
  }
);

// ------------------------------------------------------------------
// CREATE CLIENT (Admin only)
// ------------------------------------------------------------------
export const createClient = createAsyncThunk(
  "clients/createClient",
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/create-client`, clientData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create client"
      );
    }
  }
);


// ------------------------------------------------------------------
// FETCH CLIENTS
// ------------------------------------------------------------------
export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/clients`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch clients"
      );
    }
  }
);


// ------------------------------------------------------------------
// INITIAL STATE
// ------------------------------------------------------------------
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  usersList: [], // For admin getUsers
  requirements: [],
  clients: [],
  loading: false,
  error: null,
  successMessage: null,
};

// ------------------------------------------------------------------
// SLICE
// ------------------------------------------------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = "Login successful!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // SIGNUP
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE USER (ADMIN)
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET USERS (ADMIN)
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.usersList = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.successMessage = "Logged out successfully!";
      })
      // CREATE CLIENT
      .addCase(createClient.pending, (s) => { s.loading = true; })
      .addCase(createClient.fulfilled, (s, a) => {
      s.loading = false;
      s.successMessage = "Client created successfully!";
      })
      .addCase(createClient.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload;
      })

     // FETCH CLIENTS
    .addCase(fetchClients.pending, (s) => { s.loading = true; })
    .addCase(fetchClients.fulfilled, (s, a) => {
    s.loading = false;
    s.clients = a.payload;
    })
    .addCase(fetchClients.rejected, (s, a) => {
    s.loading = false;
    s.error = a.payload;
    })
    .addCase(createRequirement.pending, (s) => { s.loading = true; })
    .addCase(createRequirement.fulfilled, (s) => { s.loading = false; s.successMessage = "Requirement created"; })
    .addCase(createRequirement.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

    .addCase(fetchRequirements.pending, (s) => { s.loading = true; })
    .addCase(fetchRequirements.fulfilled, (s, a) => { s.loading = false; s.requirements = a.payload; })
    .addCase(fetchRequirements.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

    .addCase(assignRequirement.pending, (s) => { s.loading = true; })
    .addCase(assignRequirement.fulfilled, (s) => { s.loading = false; s.successMessage = "Requirement assigned"; })
    .addCase(assignRequirement.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearMessages } = authSlice.actions;
export default authSlice.reducer;
