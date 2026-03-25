import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';


// Create Webinar
export const createPopup = createAsyncThunk(
  'blogs/createBlog',
  async (blogData, thunkAPI) => {
    try {
      console.log("Sending Webinar data:", blogData);

      const url = "https://searchmystudy.com/api/admin/popup";

      // If uploading an image, blogData must be FormData (multipart).
      // Do not JSON-stringify FormData; it becomes {} on the backend.
      if (blogData instanceof FormData) {
        const response = await axios.post(url, blogData);
        return response.data;
      }

      const response = await axios.post(url, blogData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;

    } catch (error) {
      const msg = error.response?.data ?? error.message;
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const fetchPopup = createAsyncThunk(
  'webinar/fetchPopup',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://searchmystudy.com/api/admin/popup');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);

export const updatePopup = createAsyncThunk(
  'popup/updatePopup',
  async ({ id, data }, thunkAPI) => {
    try {
      if (!id) {
        return thunkAPI.rejectWithValue({ message: "Popup id is required" });
      }

      const isFormData = data instanceof FormData;
      const response = await fetch(`https://searchmystudy.com/api/admin/popup/${id}`, {
        method: 'PUT',
        headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        return thunkAPI.rejectWithValue(json?.message || json || "Update failed");
      }
      return json;
      
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Update failed");
    }
  }
);


export const deletePopup = createAsyncThunk(
  'blogs/deletePopup',
  async (ids, { rejectWithValue }) => {
    // console.log(ids);
    
    if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No Webinar IDs provided" });
    }
    try {
      const response = await axios.delete("https://searchmystudy.com/api/admin/popup", {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


const webinarSlice = createSlice({
  name: 'webinar',
  initialState: {
    popup: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopup.fulfilled, (state, action) => {
        state.loading = false;
        state.popup = action.payload;
      })
      .addCase(fetchPopup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default webinarSlice.reducer;
