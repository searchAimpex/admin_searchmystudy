import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';

export const fetchWebDetails = createAsyncThunk(
    'abroad/fetchWebDetails',
    async(__,{rejectWithValue})=>{
        try {
            const response = await axios.get("https://searchmystudy.com/api/admin/getWebsiteDetails");
            return response
        } catch (error) {
            return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
        }
    }
);

export const updateWebsiteDetail = createAsyncThunk(
  "abroad/updateWebsiteDetail",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://searchmystudy.com/api/admin/updateWebsiteDetail/68c5011fc58bc72964c5bd58`,
        data
      );
      return response.data; // return only the response data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);


// Create Webinar
export const createWebsiteDetail = createAsyncThunk(
    'blogs/createWebsiteDetail',
    async (blogData, thunkAPI) => {
      try {
        console.log("Sending Webinar data:", blogData);
  
        const response = await fetch("https://searchmystudy.com/api/admin/createWebsiteDetail", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(blogData),
        });

  
        console.log("Response status:", response.status);
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response data:", errorData);
          return thunkAPI.rejectWithValue(errorData);
        }
  
        const data = await response.json();
        console.log("Success response data:", data);
        fetchWebinar();
        return data;
  
      } catch (error) {
        console.error("Fetch error:", error);
        return thunkAPI.rejectWithValue(error.message);
      }
    }
  );
  

 const abroadProvinceSlice = createSlice({
    name:'abroadProvince',
    initialState:{
        abroadProvince:[],
        loading:false,
        error:false,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetc.pending,(state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchWebDetails.fulfilled,(state,action)=>{
            state.abroadProvince = action.payload;
            state.loading = false;
        })
        .addCase(fetchWebDetails.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload;
        })
    }
})
export default abroadProvinceSlice.reducer;