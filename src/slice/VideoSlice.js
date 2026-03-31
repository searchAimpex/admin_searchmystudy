import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';

export const fetchVideos = createAsyncThunk(
    'admin/fetchVideos',
    async(__,{rejectWithValue})=>{
        try {
            const response = await axios.get("https://searchmystudy.com/api/admin/Video/all");
            return response?.data;
        } catch (error) {
            return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
        }
    }
);

export const createVideo = createAsyncThunk(
    'admin/createVideo',
    async (payload, thunkAPI) => {
      try {
        const isFormData = payload instanceof FormData;
        const response = await fetch('https://searchmystudy.com/api/admin/CreateVideo', {
          method: 'POST',
          ...(isFormData
            ? { body: payload }
            : {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return thunkAPI.rejectWithValue(errorData);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
      }
    }
  );

  export const deleteVideo = createAsyncThunk(
    'admin/deleteVideo',
      async (ids, { rejectWithValue }) => {
          if (!ids || ids.length === 0) {
          return rejectWithValue({ message: "No abroad study IDs provided" });
          }
          try {
          const response = await axios.delete(`https://searchmystudy.com/api/admin/DeleteVideo`, {
            data:{ids}
          });
          return response.data;
          } catch (error) {
          return rejectWithValue(error.response?.data || error.message);
          }
      }
  );

  export const updateVideo = createAsyncThunk(
    'admin/updateVideo',
    async ({ id, data }, thunkAPI) => {
      try {
        const isFormData = data instanceof FormData;
        const response = await fetch(`https://searchmystudy.com/api/admin/UpdateVideo/${id}`, {
          method: 'PUT',
          ...(isFormData
            ? { body: data }
            : {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return thunkAPI.rejectWithValue(errorData);
        }

        const updatedData = await response.json();
        return updatedData;
      } catch (error) {
        return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
      }
    }
  );

  const VideoSlice = createSlice({
    name:'video',
    initialState:{
        videos:null,
        loading:false,
        error:null,
    },
    extraReducers:(builder)=>{
        builder.addCase(fetchVideos.pending,(state)=>{
            state.loading=true;
            state.error = null;
        })
        .addCase(fetchVideos.fulfilled,(state,action)=>{
            state.loading = false;
            state.videos = action.payload;
        })
        .addCase(fetchVideos.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload;
        })
    }
  })

export default VideoSlice.reducer;