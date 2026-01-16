import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';


// Create Webinar
export const createWebinar = createAsyncThunk(
  'blogs/createBlog',
  async (blogData, thunkAPI) => {
    try {
      console.log("Sending Webinar data:", blogData);

      const response = await fetch("https://searchmystudy.com/api/admin/webinar", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        return thunkAPI.rejectWithValue(errorData);
      }

      const data = await response.json();
      console.log("Success response data:", data);
      fetchWebinar();
      return data;

    } catch (error) {
      console.error("Fetch error:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Fetch Webinar
export const fetchWebinar = createAsyncThunk(
  'webinar/fetchWebinar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://searchmystudy.com/api/admin/webinar');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);



export const fetchWebinarLeadss = createAsyncThunk(
  'webinar/fetchWebinarLeads',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://searchmystudy.com/api/admin/fetchAll');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);



// DeleteWebinar
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


export const deleteWebinarLeads = createAsyncThunk(
  'leads/deleteWebinarLeads',
  async (ids, { rejectWithValue }) => {
    console.log(ids);
    
    if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No Webinar IDs provided" });
    }
    try {
      const response = await axios.delete("https://searchmystudy.com/api/admin/delete", {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// updateWebinar
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

const webinarSlice = createSlice({
  name: 'webinar',
  initialState: {
    webinars: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWebinar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWebinar.fulfilled, (state, action) => {
        state.loading = false;
        state.webinars = action.payload;
      })
      .addCase(fetchWebinar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default webinarSlice.reducer;
