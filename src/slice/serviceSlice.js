import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// create Service
export const createService = createAsyncThunk(
  "service/createServices",
  async (serviceData, thunkAPI) => {
    try {
      console.log("Sending service data", serviceData);

      const response = await axios.post(
        "https://searchmystudy.com/api/admin/CreateService",
        serviceData
      );
      console.log("Response status:", response.status);
      fetchServices();
      return response.data;
    } catch (error) {
      console.error("Fetch error:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Fetch Services
export const fetchServices = createAsyncThunk(
    'service/fetchServices',
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get('https://searchmystudy.com/api/admin/Services/all');
        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message || 'Something went wrong'
        );
      }
    }
  );

// Delete Services
export const deleteService = createAsyncThunk(
    'services/deleteServices',
    async (ids, { rejectWithValue }) => {
      if (!ids || ids.length === 0) {
        return rejectWithValue({ message: "No blog IDs provided" });
      }
      try {
        const response = await axios.delete(`https://searchmystudy.com/api/admin/DeleteService`,{
          data: { ids },
        });
        
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );
// update Services
export const updateService = createAsyncThunk(
    'services/updateServices',
    async ({id, data}, { rejectWithValue }) => {
      try {
        console.log(id);
        console.log(data);
        
        const response = await axios.put(`https://searchmystudy.com/api/admin/UpdateServices/${id}`,data);
        console.log("response"+response.data);
        fetchServices()
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

const serviceSlice = createSlice({
  name: "service",
  initialState: {
    services: null,
    loading: false,
    error: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default serviceSlice.reducer;
