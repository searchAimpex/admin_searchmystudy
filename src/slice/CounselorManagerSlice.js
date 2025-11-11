import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';


export const createCounselor = createAsyncThunk(
    'counsellor/createCounsellor',
    async(data,thunkAPI) => {
        try {
            console.log("Sending Counsellor data", data);
            const response = await axios.post("https://searchmystudy.com/api/admin/CreateCounsellor",data);
            return response.data;
        } catch (error) {
            console.log("Fetch error", error.message);
            return thunkAPI.rejectWithValue(error.message)
        }
    }
);



export const fetchCounselor = createAsyncThunk(
    'counsellor/fetchCounsellor',
    async (_,{rejectWithValue}) => {
        try {
            const response = await axios.get("https://searchmystudy.com/api/admin/Counsellor/all");
            return response?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Something went wrong"
            );
        }
    }
);


export const deleteCounselor = createAsyncThunk(
    'counsellor/deleteCounsellor',
    async(ids,{ rejectWithValue })=>{
        if (!ids || ids.length === 0) {
            return rejectWithValue({ message: "No blog IDs provided" });
          }
        try {
            const response = await axios.delete(`https://searchmystudy.com/api/admin/DeleteCounsellors`,{
                data: { ids },
            })
            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || error.message)
        }
    }
);

export const updateCounselor = createAsyncThunk(
    'counsellor/updateCounsellor',
    async({id,data},{ rejectWithValue })=>{
        try {
            const response = await axios.put(`https://searchmystudy.com/api/admin/UpdateCounsellors/${id}`,data)
            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || error.message)
        }
    }
);

const counsellorSlice = createSlice({
    name:'counsellor',
    initialState:{
        counsellors:[],
        error:null,
        loading:null,
    },
    reducers:{},
    extraReducers: (builder)=>{
        builder.addCase(fetchTestemonial.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchTestemonial.fulfilled, (state,action)=>{
            state.loading = false;
            state.counsellors = action.payload;
        })
        .addCase(fetchTestemonial.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export default counsellorSlice.reducer;