import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';


export const createInformation = createAsyncThunk(
    'information/createInformation',
    async(data,thunkAPI) => {
        try {
            console.log("Sending Counsellor data", data);
            const response = await axios.post("https://searchmystudy.com/api/admin/upload",data);
            return response.data;
        } catch (error) {
            console.log("Fetch error", error.message);
            return thunkAPI.rejectWithValue(error.message)
        }
    }
);




export const fetchInformation = createAsyncThunk(
    'information/fetchInformation',
    async (_,{rejectWithValue}) => {
        try {
            const response = await axios.get("https://searchmystudy.com/api/admin/upload");
            return response?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Something went wrong"
            );
        }
    }
);

export const deleteInformation = createAsyncThunk(
    'information/deleteInformation',
    async(ids,{ rejectWithValue })=>{
        if (!ids || ids.length === 0) {
            return rejectWithValue({ message: "No blog IDs provided" });
          }
        try {
            const response = await axios.delete(`http://localhost:5001/api/admin/upload`,{
                data: { ids },
            })
            // const response = await axios.delete("http://localhost:5001/api/admin/upload",data);

            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || error.message)
        }
    }
);


export const updateInformation = createAsyncThunk(
    'information/updateInformation',
    async({id,data},{ rejectWithValue })=>{
        try {
            const response = await axios.put(`https://searchmystudy.com/api/admin//upload/${id}`,data)
            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || error.message)
        }
    }
);

const informationSlice = createSlice({
    name:'information',
    initialState:{
        // counsellors:[],
        information:[],
        error:null,
        loading:null,
    },
    reducers:{},
    extraReducers: (builder)=>{
        builder.addCase(fetchInformation.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchInformation.fulfilled, (state,action)=>{
            state.loading = false;
            state.information = action.payload;
        })
        .addCase(fetchInformation.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export default informationSlice.reducer;