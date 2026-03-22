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

// Create a second-country document
export const createSecondCountry = createAsyncThunk(
  'country/createSecondCountry',
  async (countryData, thunkAPI) => {
    try {
      const response = await fetch('https://searchmystudy.com/api/users/secondcountry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(countryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

// Update a second-country document by id
export const updateSecondCountry = createAsyncThunk(
  'country/updateSecondCountry',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await fetch(`https://searchmystudy.com/api/users/secondcountry/${id}`, {
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


export const deleteSecondCountry = createAsyncThunk(
  'blogs/deleteSecondCountry',
  async (ids, { rejectWithValue }) => {
    if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No blog IDs provided" });
    }
    try {
      const response = await axios.delete("https://searchmystudy.com/api/users/secondcountry", {
        data: { ids },
      });

      // 🔥 Attach the deleted ids manually to the payload
      return { ...response.data, deletedIds: ids };

    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const fetchCountry = createAsyncThunk(
  'country/fetchCountry',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://searchmystudy.com/api/users/secondcountry');
    //   console.log(response.data,"++++++++++++++++");
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);


export const fetchFile = createAsyncThunk(
  'file/fetchFile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://searchmystudy.com/api/admin/files');
      // console.log(response.data,"++++++++++++++++");
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);


const FILE_API_BASE = 'http://searchmystudy.com'; // use 'http://localhost:5001' for local dev

export const createFile = createAsyncThunk(
  'country/createFile',
  async (data, thunkAPI) => {
    try {
      const url = `${FILE_API_BASE}/api/admin/file`;
      if (data instanceof FormData) {
        const response = await axios.post(url, data);
        return response.data;
      }
      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message ?? error.response?.data ?? error.message;
      return thunkAPI.rejectWithValue(typeof msg === 'string' ? msg : 'Request failed');
    }
  }
);

export const deleteFiles = createAsyncThunk(
  'file/deleteFiles',
  async (ids, { rejectWithValue }) => {
    if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No file IDs provided" });
    }
    try {
      const response = await axios.delete(`${FILE_API_BASE}/api/admin/file`, {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const updateFile = createAsyncThunk(
  'file/updateFile',
  async ({ id, data }, thunkAPI) => {
    try {
      const url = `${FILE_API_BASE}/api/admin/file/${id}`;
      if (data instanceof FormData) {
        const response = await axios.put(url, data);
        return response.data;
      }
      const response = await axios.put(url, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message ?? error.response?.data ?? error.message;
      return thunkAPI.rejectWithValue(typeof msg === 'string' ? msg : 'Request failed');
    }
  }
);
const countrySlice = createSlice({
  name: 'country',
  initialState: {
    country: null,
    file:null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      // ===========================
      // 📌 FETCH COUNTRY
      // ===========================
      .addCase(fetchCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.country = action.payload; // array of countries
      })
      .addCase(fetchCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       .addCase(fetchFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFile.fulfilled, (state, action) => {
        state.loading = false;
        state.file = action.payload;
      })
      .addCase(fetchFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default countrySlice.reducer;
