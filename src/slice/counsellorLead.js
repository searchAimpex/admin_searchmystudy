import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

export const fetchCounsellorLead = createAsyncThunk(
  'lead/fetchCounsellorLead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://searchmystudy.com/api/admin/lead");
      console.log(response);
      
      // toast.success("Fetch Lead Successfully")
      return response.data; // returned data will be available in fulfilled reducer
      
    } catch (error) {
        toast.error("Failed to fetch lead")
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);


export const fetchCounsellorSingleLead = createAsyncThunk(
  'lead/fetchCounsellorSingleLead',
  async (id, { rejectWithValue }) => {
    try {
      console.log(id,":::::::::::::::::::::::::::::::");
      
      const response = await axios.get(`https://searchmystudy.com/api/admin/leadByCounsellor/${id}`);
      console.log(response);
      
      // toast.success("Fetch Lead Successfully")
      return response.data; // returned data will be available in fulfilled reducer
      
    } catch (error) {
        toast.error("Failed to fetch lead")
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);


export const deleteCounsellorLead = createAsyncThunk(
    "lead/deleteCounsellorLead",
    async(ids,{rejectWithValue})=>{
         if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No blog IDs provided" });
    }
    try {
        const response = await axios.delete("https://searchmystudy.com/api/admin/lead",{data:{ids}});
        // toast.success("Delete lead Successfully");
        return response?.data;
    } catch (error) {
        toast.error("Failed to delete lead")
        return rejectWithValue(error);
    }
    }
);

const counsellorleadSlice = createSlice({
    name:"counsellorLead",
    initialState:{
    counsellorLeads:null,
    loading:false,
    error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchCounsellorLead.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(fetchCounsellorLead.fulfilled,(state,action)=>{
            state.loading=false;
            state.counsellorLeads=action.payload;
        })
        .addCase(fetchCounsellorLead.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })
    }
})

export default counsellorleadSlice.reducer;