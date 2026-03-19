import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';




export const fetchComission = createAsyncThunk(
  'comission/fetchComission',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://searchmystudy.com/api/admin/commission');
    //   console.log(response.data,"++++++++++++++++");
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);



export const deleteCmission = createAsyncThunk(
  'comisison/deleteCmission',
  async (ids, { rejectWithValue }) => {
    if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No blog IDs provided" });
    }
    try {
      const response = await axios.delete("https://searchmystudy.com/api/admin/commission", {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const updateLoanLead = createAsyncThunk(
  'loan/updateLoanLead',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await fetch(`https://searchmystudy.com/api/admin/file/${id}`, {
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
export const createCommission = createAsyncThunk(
  'comission/createCommission',
  async (data, thunkAPI) => {
    try {
      const isFormData = data instanceof FormData;
      const config = {
        method: 'POST',
        ...(isFormData ? { body: data } : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
      };
      const response = await fetch("http://localhost:5001/api/admin/commission", config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return thunkAPI.rejectWithValue(errorData?.message || errorData || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);
const ComissionSlice = createSlice({
  name: 'comission',
  initialState: {
    comission: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      // ===========================
      // 📌 FETCH COUNTRY
      // ===========================
      .addCase(fetchComission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComission.fulfilled, (state, action) => {
        state.loading = false;
        state.comission = action.payload; // array of countries
      })
      .addCase(fetchComission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       
  },
});

export default ComissionSlice.reducer;
