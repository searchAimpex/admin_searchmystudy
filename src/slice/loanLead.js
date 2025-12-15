import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';




export const statusLoanLead = createAsyncThunk(
    "loan/statusLoanLead",
    async({id,data},rejectWithValue)=>{
        try {
            const response = await axios.put(`https://searchmystudy.com/api/admin/loan/status/${id}`,data);
            toast.success("Update Lead Successfully")
            return response?.data
        } catch (error) {
            toast.error("Failed to update lead")   
         return rejectWithValue(error)
        }
    }
);



export const fetchLoanLead = createAsyncThunk(
  'loan/fetchLoanLead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://searchmystudy.com/api/admin/loan');
    //   console.log(response.data,"++++++++++++++++");
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);



export const deleteLoanLead = createAsyncThunk(
  'loan/deleteLoanLead',
  async (ids, { rejectWithValue }) => {
    if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No blog IDs provided" });
    }
    try {
      const response = await axios.delete("https://searchmystudy.com/api/admin/loan", {
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

const loanLeadSlice = createSlice({
  name: 'loan',
  initialState: {
    lead: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      // ===========================
      // 📌 FETCH COUNTRY
      // ===========================
      .addCase(fetchLoanLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoanLead.fulfilled, (state, action) => {
        state.loading = false;
        state.loan = action.payload; // array of countries
      })
      .addCase(fetchLoanLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       
  },
});

export default loanLeadSlice.reducer;
