import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';

export const fetchQuery = createAsyncThunk(
    'lead/fetchQuery',
    async(__,{rejectWithValue})=>{
        try {
            const response = await axios.get("https://searchmystudy.com/api/admin/getAllQuery");
            console.log(response.data);
            
            return response?.data?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Something Went Wrong");
        }
    }
);

export const deleteQuery = createAsyncThunk(
    'lead/deleteQuery',
    async(ids,{rejectWithValue})=>{
        if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No IDs provided" });
    }
        try {
            const response = await axios.delete("https://searchmystudy.com/api/admin/getAllQuery",ids);
            toast.success("Delete Successfully");
            return response?.data
        } catch (error) {
            return rejectWithValue(error)
        }
    }
);

const querySlice = createSlice({
    name:'query',
    initialState:{
        error:null,
        loading:false,
        queries:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchQuery.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(fetchQuery.fulfilled,(state,action)=>{
            state.loading=false;
            state.queries=action.payload;
        })
        .addCase(fetchQuery.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })
    }
});

export default querySlice.reducer;