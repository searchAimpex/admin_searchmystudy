// features/auth/authSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';



export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://searchmystudy.com/api/users/auth", // make sure backend port is correct
        data,
        {
          withCredentials: true, // 🔑 important to save cookies
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);





export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://searchmystudy.com/api/admin/verifyToken/${token}`,
        {}, 
        {
          withCredentials: true, // important if you want cookies
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);






export const resetPwd = createAsyncThunk(
  "auth/resetPwd",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://searchmystudy.com/api/users/resetPwd/${email}`,
        {}, 
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);




export const changePwd = createAsyncThunk(
  "auth/changePwd",
  async ({ password, email }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://searchmystudy.com/api/users/changePwd`, // just the endpoint
        { password, email }, // send as body
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);



const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
