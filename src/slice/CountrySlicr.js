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



export const fetchCountry = createAsyncThunk(
  'webinar/fetchCountry',
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



const countrySlice = createSlice({
  name: 'country',
  initialState: {
    country: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.country = action.payload;
      })
      .addCase(fetchCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default countrySlice.reducer;
