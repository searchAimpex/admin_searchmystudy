import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { Nav } from 'react-bootstrap';




export const fetchNav = createAsyncThunk(
  'nav/fetchNav',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://searchmystudy.com/api/admin/nav');
    //   console.log(response.data,"++++++++++++++++");
      
      return response.data.navItems
  ;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);



export const deleteNav = createAsyncThunk(
  'nav/deleteNav',
  async (ids, { rejectWithValue }) => {
    if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No data provided" });
    }
    try {
      const response = await axios.delete("http://localhost:3000/api/admin/nav", {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const updateNav = createAsyncThunk(
  'nav/updateNav',
  async ({ id, data }, thunkAPI) => {
    try {
      console.log(data,"-------------------")
      const response = await fetch(`http://localhost:3000/api/admin/nav/${id}`, {
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
export const createNav = createAsyncThunk(
  'nav/createNav',
  async (blogData, thunkAPI) => {
    try {

      const response = await fetch("https://searchmystudy.com/api/admin/nav", {
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
      return data;

    } catch (error) {
      console.error("Fetch error:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
const NavSlice = createSlice({
  name: 'nav',
  initialState: {
    nav: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      // ===========================
      // 📌 FETCH COUNTRY
      // ===========================
      .addCase(fetchNav.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNav.fulfilled, (state, action) => {
        state.loading = false;
        state.nav = action.payload; // array of countries
      })
      .addCase(fetchNav.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       
  },
});

export default NavSlice.reducer;
