import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';



const API_BASE = 'https://searchmystudy.com/api/users';

export const createPartner = createAsyncThunk(
  'blogs/createPartner',
  async (partnerData, { rejectWithValue }) => {
    try {
      const isFormData = partnerData instanceof FormData;
      const config = isFormData
        ? {} // let browser set Content-Type with boundary for FormData
        : { headers: { 'Content-Type': 'application/json' } };
      const response = await axios.post(`${API_BASE}`, partnerData, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message ?? error.response?.data ?? error.message;
      return rejectWithValue(typeof message === 'string' ? message : 'Request failed');
    }
  }
);
export const fetchPartner = createAsyncThunk(
  'webinar/fetchPartner',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://searchmystudy.com/api/users/profile/all');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);
export const fetchFrenchise = createAsyncThunk(
  'webinar/fetchFrenchise',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://searchmystudy.com/api/users/profile/frenchise');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);
export const deletePartner = createAsyncThunk(
  'blogs/deletePartner',
  async (ids, { rejectWithValue }) => {
    console.log(ids);
    try {
      const response = await axios.delete('https://searchmystudy.com/api/users/profile/delete', {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);
export const updatePartner = createAsyncThunk(
  'blogs/updateWebinar',
  async ({ id, data }, { rejectWithValue }) => {
    if (!id) {
      return rejectWithValue({ message: "No User ID provided" });
    }
    try {
      const isFormData = data instanceof FormData;
      const config = {
        withCredentials: true,
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
      };
      const response = await axios.put(`${API_BASE}/updateUser/${id}`, data, config);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message ?? error.response?.data ?? error.message;
      return rejectWithValue(typeof msg === 'string' ? msg : 'Update failed');
    }
  }
);

export const updateStatus = createAsyncThunk(
  "partner/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    if (!id) {
      return rejectWithValue({ message: "No User ID provided" });
    }

    try {
      const response = await axios.put(
        `https://searchmystudy.com/api/users/statusUpdate/${id}`,
        { status }, // ✅ IMPORTANT
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const partnerSlice = createSlice({
  name: 'partners',
  initialState: {
    partner: [],
    frenchise:[],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartner.fulfilled, (state, action) => {
        state.loading = false;
        state.partner = action.payload;
      })
      .addCase(fetchPartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


        .addCase(fetchFrenchise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFrenchise.fulfilled, (state, action) => {
        state.loading = false;
        state.frenchise = action.payload;
      })
      .addCase(fetchFrenchise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

      
  },
});

export default partnerSlice.reducer;
