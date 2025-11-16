import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';



export const createPartner = createAsyncThunk(
  'blogs/createPartner',
  async (partnerData, thunkAPI) => {
    try {
      console.log("Sending Webinar data:", partnerData);

      const response = await fetch("https://searchmystudy.com/api/users", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partnerData),
      });

      // console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        return thunkAPI.rejectWithValue(errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      return thunkAPI.rejectWithValue(error.message);
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
  'webinar/fetchPartner',
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

export const deleteWebinar = createAsyncThunk(
  'blogs/deleteWebinar',
  async (ids, { rejectWithValue }) => {
    console.log(ids);
    
    if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No Webinar IDs provided" });
    }
    try {
      const response = await axios.delete("https://searchmystudy.com/api/admin/webinar", {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const updateWebinar = createAsyncThunk(
  'blogs/updateWebinar',
  async ({id, data}, { rejectWithValue }) => {
    if (!id) {
      return rejectWithValue({ message: "No Webinar ID provided" });
    }
    try {
      const response = await axios.put(`https://searchmystudy.com/api/admin/webinar/${id}`,data);
      fetchWebinar();
      console.log("Update response:", response.data);
      
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
      });
  },
});

export default partnerSlice.reducer;
