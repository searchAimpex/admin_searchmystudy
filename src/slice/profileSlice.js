import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch Profile
export const fetchProfile = createAsyncThunk(
  'lead/fetchProfile',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(
        `https://searchmystudy.com/api/users/getDataById/68cfd8ae6a4f30b1b8c5b54a`
      );
      return response?.data;
    } catch (error) {
      if (error.response?.data?.message) {
        return thunkAPI.rejectWithValue(error.response.data.message);
      }
      return thunkAPI.rejectWithValue(error.message || "Something Went Wrong");
    }
  }
);

// Update Profile
export const updateProfile = createAsyncThunk(
  'admin/updateProfile',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axios.put(
        `https://searchmystudy.com/api/users/updateUser/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        return thunkAPI.rejectWithValue(error.response.data.message);
      }
      return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    error: null,
    loading: false,
    profile: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default profileSlice.reducer;
