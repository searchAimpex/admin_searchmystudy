import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
// import { toast } from 'react-toastify';


export const fetchMbbsCourse = createAsyncThunk(
  'mbbs/fetchMbbsCourse',
    async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://searchmystudy.com/api/admin/course");
      const filter = response.data.filter(item => item?.University?.Country?.mbbsAbroad === true)
      return filter
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
    }
);


export const createMbbsCourse = createAsyncThunk(
    "mbbs/createMbbsCourse",
    async(data,thunkAPI)=>{
        try {
            const response = await axios.post("https://searchmystudy.com/api/admin/course",data)
            toast.success("Course created successfully")
            return response.data
        } catch (error) {
            toast.error("Failed to create course")
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
)

export const deleteMbbsCourse = createAsyncThunk(
  'mbbs/deleteMbbsCourse',
  async (ids, { rejectWithValue }) => {
    try {
      await axios.delete(`https://searchmystudy.com/api/admin/course`, {
        data: { ids }
      });
      return { ids }; // ✅ return the same ids
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMbbsCourse = createAsyncThunk(
  'mbbs/updateMbbsCourse',  
   async ({ id, data }, thunkAPI) => {
    try {
        const response = await axios.put(`https://searchmystudy.com/api/admin/course/${id}`, data )
        return response?.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
    }
}

);

const mbbsCourseSlice = createSlice({
    name:'mbbsCourse',
    initialState:{
    loading:false,
    mbbsCourse:null,
    error:null
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchMbbsCourse.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(fetchMbbsCourse.fulfilled,(state,action)=>{
            state.loading=false;
            state.mbbsCourse=action.payload;
        })
        .addCase(fetchMbbsCourse.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })

        // Create MBBS Course
        .addCase(createMbbsCourse.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(createMbbsCourse.fulfilled,(state,action)=>{
            state.loading=false;
            // Add the new course to the existing courses array
            if(state.mbbsCourse && Array.isArray(state.mbbsCourse)){
                state.mbbsCourse.push(action.payload);
            }
        })
        .addCase(createMbbsCourse.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })

        // Update MBBS Course
        .addCase(updateMbbsCourse.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(updateMbbsCourse.fulfilled,(state,action)=>{
            state.loading=false;
            // Update the course in the existing courses array
            if(state.mbbsCourse && Array.isArray(state.mbbsCourse)){
                const index = state.mbbsCourse.findIndex(course => course._id === action.payload._id);
                if(index !== -1){
                    state.mbbsCourse[index] = action.payload;
                }
            }
        })
        .addCase(updateMbbsCourse.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })

        // Delete MBBS Course
        .addCase(deleteMbbsCourse.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(deleteMbbsCourse.fulfilled,(state,action)=>{
            state.loading=false;
            // Remove deleted courses from the array
            if(state.mbbsCourse && Array.isArray(state.mbbsCourse) && action.payload?.ids){
                state.mbbsCourse = state.mbbsCourse.filter(course => 
                    !action.payload.ids.includes(course._id)
                );
            }
        })
        .addCase(deleteMbbsCourse.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })
    }
})

export default mbbsCourseSlice.reducer;