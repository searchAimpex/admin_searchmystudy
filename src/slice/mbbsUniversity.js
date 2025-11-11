import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';


export const fetchMbbsUniversity = createAsyncThunk(
    'mbbs/fetchMbbsUniversity',
    async(__,{rejectWithValue})=>{
        try {
            const response = await axios.get("https://searchmystudy.com/api/admin/university");
            return Array.isArray(response.data)
            ? response.data.filter(item => item?.Country?.mbbsAbroad === true)
            : [];
        } catch (error) {
            return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
        }
    }
);

export const creatembbsUniversity = createAsyncThunk(
    'mbbs/createMbbsUniversity',
    async (data, thunkAPI) => {
      try {
        const response = await axios.post("https://searchmystudy.com/api/admin/university",data);
        return response?.data;
      } catch (error) {
        return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
      }
    }
  );

    export const deleteMbbsUniversity = createAsyncThunk(
    'mbbs/deleteMbbsUniversity',
      async (ids, { rejectWithValue }) => {
          if (!ids || ids.length === 0) {
          return rejectWithValue({ message: "No abroad study IDs provided" });
          }
          try {
          const response = await axios.delete(`https://searchmystudy.com/api/admin/university`, {
            data:{ids}
          });
          return response.data;
          } catch (error) {
          return rejectWithValue(error.response?.data || error.message);
          }
      }
  );

  export const updateMbbsUniversity = createAsyncThunk(
    'mbbs/updateMbbsUniversity',  
      async ({ id, data }, thunkAPI) => {
          try {
                const response = await axios.put(`https://searchmystudy.com/api/admin/university/${id}`,data);
                return response?.data
          } catch (error) {
          return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
          }
      }
  );

  const mbbsUniversitySlice = createSlice({
    name:"mbbsUniversity",
    initialState:{
        mbbsUniversity:null,
        loading:false,
        error:null
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchMbbsUniversity.pending,(state)=>{
            state.loading=true;
        })
        .addCase(fetchMbbsUniversity.fulfilled,(state,action)=>{
            state.loading=false;
            state.mbbsUniversity=action.payload;
        })
        .addCase(fetchMbbsUniversity.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload
        })
    }
  })

export default mbbsUniversitySlice.reducer
