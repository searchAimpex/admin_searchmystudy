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


export const fetchCoursefinderCounselor = createAsyncThunk(
  "counsellor/fetchCoursefinderCounselor",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/admin/extrauserall"
      );
      console.log(response);
      
      // 👇 assuming API returns { data: [] }
      const allUsers = response?.data || [];

      // 👇 filter only counsellors
      const counsellors = allUsers.filter(
        (ele) => ele.role === "counsellor"
      );

      return counsellors;
    } catch (error) {
      console.error(error);
      return rejectWithValue(
        error.response?.data || "Failed to fetch counsellors"
      );
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

export const deleteCounselorCoursefinder = createAsyncThunk(
    'counsellor/deleteCounselorCoursefinder',
    async(ids,{ rejectWithValue })=>{
        if (!ids || ids.length === 0) {
            return rejectWithValue({ message: "No blog IDs provided" });
          }
        try {
            const response = await axios.delete(`https://searchmystudy.com/api/admin/deleteExtrauser`,{
                data: { ids },
            })
            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || error.message)
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
        courseFinderCounsellor:[],
        error:null,
        loading:null,
    },
    reducers:{},
    extraReducers: (builder)=>{
        builder.addCase(fetchCounselor.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchCounselor.fulfilled, (state,action)=>{
            state.loading = false;
            state.counsellors = action.payload;
        })
        .addCase(fetchCounselor.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload;
        });



        builder.addCase(fetchCoursefinderCounselor.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchCoursefinderCounselor.fulfilled, (state,action)=>{
            state.loading = false;
            state.courseFinderCounsellor = action.payload;
        })
        .addCase(fetchCoursefinderCounselor.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export default counsellorSlice.reducer;