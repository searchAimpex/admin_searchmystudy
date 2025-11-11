import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';

export const fetchAbroadUniversity = createAsyncThunk(
    'abroad/fetchAbroadProvince',
    async(__,{rejectWithValue})=>{
        try {
            const response = await axios.get("https://searchmystudy.com/api/admin/university");
            return Array.isArray(response.data)
            ? response.data.filter(item => item?.Country?.mbbsAbroad === false)
            : [];
        } catch (error) {
            return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
        }
    }
);

export const createAbroadUniversity = createAsyncThunk(
    'abroad/createAbroadUniversity',
    async (abroadData, thunkAPI) => {
      try {
        const response = await fetch("https://searchmystudy.com/api/admin/university", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(abroadData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          return thunkAPI.rejectWithValue(errorData);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
      }
    }
  );

  export const deleteAbroadUniversity = createAsyncThunk(
    'abroad/deleteAbroadUniversity',
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

  export const updateAbroadUniversity = createAsyncThunk(
    'abroad/updateAbroadUniversity',  
      async ({ id, data }, thunkAPI) => {
          try {
          const response = await fetch(`https://searchmystudy.com/api/admin/university/${id}`, {
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
      
          const updatedData = await response.json();
          return updatedData;
          } catch (error) {
          return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
          }
      }
  );

  const AbroadProvinceSlice = createSlice({
    name:'abroadProvince',
    initialState:{
        abroadUniversity:[],
        loading:false,
        error:false,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchAbroadUniversity.pending,(state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchAbroadUniversity.fulfilled,(state,action)=>{
            state.abroadUniversity = action.payload;
            state.loading = false;
        })
        .addCase(fetchAbroadUniversity.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload;
        })
    }
});

export default AbroadProvinceSlice.reducer;