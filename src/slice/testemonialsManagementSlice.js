import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const createTestemonial = createAsyncThunk(
    'testemonial/createTestemonial',
    async(data,thunkAPI) => {
        try {
            const response = await axios.post("https://searchmystudy.com/api/admin/CreateTestimonials",data);
                console.log(response,"++++++++++++++");
                
            return response.data;
            
        } catch (error) {
            console.log("Fetch error", error.message);
            return thunkAPI.rejectWithValue(error.message)
        }
    }
);
export const fetchTestemonial = createAsyncThunk(
    'testemonial/fetchTestemonial',
    async (_,{rejectWithValue}) => {
        try {
            const response = await axios.get(" https://searchmystudy.com/api/admin/Testimonials/all");
            return response?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Something went wrong"
            );
        }
    }
);
export const deleteTestemonial = createAsyncThunk(
    'testemonial/deleteTestemonial',
    async(ids,{ rejectWithValue })=>{
        if (!ids || ids.length === 0) {
            return rejectWithValue({ message: "No blog IDs provided" });
          }
        try {
            const response = await axios.delete(`https://searchmystudy.com/api/admin/DeleteTestimonials`,{
                data: { ids },
            })
            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || error.message)
        }
    }
);

export const updateTestemonial = createAsyncThunk(
    'testemonial/updateTestemonial',
    async({id,data},{ rejectWithValue })=>{
        try {
            const response = await axios.put(`https://searchmystudy.com/api/admin/UpdateTestimonials/${id}`,data)
            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || error.message)
        }
    }
);

const testemonialSlice = createSlice({
    name:'testemonial',
    initialState:{
        testemonial:[],
        error:null,
        loading:null,
    },
    reducers:{},
    extraReducers: (builder)=>{
        // Fetch Testimonials
        builder.addCase(fetchTestemonial.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchTestemonial.fulfilled, (state,action)=>{
            state.loading = false;
            state.testemonial = action.payload;
        })
        .addCase(fetchTestemonial.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload;
        })
        
        // Create Testimonial
        .addCase(createTestemonial.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(createTestemonial.fulfilled, (state,action)=>{
            state.loading = false;
            state.testemonial.push(action.payload);
        })
        .addCase(createTestemonial.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload;
        })
        
        // Update Testimonial
        .addCase(updateTestemonial.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(updateTestemonial.fulfilled, (state,action)=>{
            state.loading = false;
            const index = state.testemonial.findIndex(item => item._id === action.payload._id);
            if (index !== -1) {
                state.testemonial[index] = action.payload;
            }
        })
        .addCase(updateTestemonial.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload;
        })
        
        // Delete Testimonial
        .addCase(deleteTestemonial.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteTestemonial.fulfilled, (state,action)=>{
            state.loading = false;
            // Remove deleted items from state
            const deletedIds = action.payload.deletedIds || [];
            state.testemonial = state.testemonial.filter(item => !deletedIds.includes(item._id));
        })
        .addCase(deleteTestemonial.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export default testemonialSlice.reducer;