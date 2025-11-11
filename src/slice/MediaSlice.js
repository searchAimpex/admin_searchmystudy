import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';

export const fetchMedias = createAsyncThunk(
    'admin/fetchMedias',
    async(__dirname,{rejectWithValue})=>{
        try {
            const response = await axios.get("https://searchmystudy.com/api/admin/media")
            console.log("fetch Response", response);
            return response?.data
            
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Something went wrong"
            );
        }
    }
);

export const createMedia = createAsyncThunk(
    'admin/createMedia',
    async (data, thunkAPI) => {
        try {
            const response = await axios.post("https://searchmystudy.com/api/admin/media",data)
            console.log("Create Response", response);
            return response?.data
        } catch (error) {
        return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
        }
    }
);

  export const deleteMedia = createAsyncThunk(
    'admin/deleteMedia',
      async (ids, { rejectWithValue }) => {
          if (!ids || ids.length === 0) {
          return rejectWithValue({ message: "No abroad study IDs provided" });
          }
          try {
          const response = await axios.delete(`https://searchmystudy.com/api/admin/media`, {
            data:{ids}
          });
          return response.data;
          } catch (error) {
          return rejectWithValue(error.response?.data || error.message);
          }
      }
  );

export const updateMedia = createAsyncThunk(
    'admin/updateMedia',
    async ({id, data}, thunkAPI) => {
        try {
            const response = await axios.put(`https://searchmystudy.com/api/admin/media/${id}`,data)
            console.log("Create Response", response);
            return response?.data
        } catch (error) {
        return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
        }
    }
);

const MediaSlice = createSlice({
    name:'media',
    initialState:{
        medias:null,
        loading:false,
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchMedias.pending,(state)=>{
            state.loading = true;
            state.error=null;
        })
        .addCase(fetchMedias.fulfilled,(state,action)=>{
            state.loading=false;
            state.medias=action.payload;
        })
        .addCase(fetchMedias.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })
    }
})

export default MediaSlice.reducer;