import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';




export const fetchContact = createAsyncThunk(
  'contact/fetchContact',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://searchmystudy.com/api/admin/contact/all');
    //   console.log(response.data,"++++++++++++++++");
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);



export const deleteContact = createAsyncThunk(
  'contact/deleteContact',
  async (ids, { rejectWithValue }) => {
    if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No blog IDs provided" });
    }
    try {
      const response = await axios.delete("https://searchmystudy.com/api/admin/contact", {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const updateContact = createAsyncThunk(
  'contact/updateContact',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await fetch(`https://searchmystudy.com/api/admin/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData);
      }

      const resData = await response.json();
      return resData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);
export const createContact = createAsyncThunk(
  'contact/createContact',
  async (blogData, thunkAPI) => {
    try {

      const response = await fetch("https://searchmystudy.com/api/admin/contact", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      // console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        return thunkAPI.rejectWithValue(errorData);
      }

      const data = await response.json();
      console.log("Success response data:", data);
      return data;

    } catch (error) {
      console.error("Fetch error:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
const ContactSlice = createSlice({
  name: 'contact',
  initialState: {
    contact: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      // ===========================
      // 📌 FETCH COUNTRY
      // ===========================
      .addCase(fetchContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contact = action.payload; // array of countries
      })
      .addCase(fetchContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       
  },
});

export default ContactSlice.reducer;
