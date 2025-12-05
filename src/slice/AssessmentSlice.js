import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

export const FetchAssessment = createAsyncThunk(
  'lead/FetchAssessment',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://searchmystudy.com/api/admin/profile");
      console.log(response);

      return response.data; // returned data will be available in fulfilled reducer

    } catch (error) {
      toast.error("Failed to fetch lead")
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);


export const updateAssessment = createAsyncThunk(
  'blogs/updateAssessment',
  async ({id, data}, { rejectWithValue }) => {
    if (!id) {
      return rejectWithValue({ message: "No Webinar ID provided" });
    }
    try {
      console.log(data,"--------------------");
      
      const response = await axios.put(`https://searchmystudy.com/api/admin/profile/update/${id}`,data);
      // fetchWebinar();     
      // console.log("Update response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createAssessment = createAsyncThunk(
  'lead/createAssessment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("https://searchmystudy.com/api/admin/profile", data);
      toast.success("Create Assessment Successfully");
      return response.data;
    } catch (error) {
      toast.error("Failed to create assessment");
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
)



export const statusAssesmment = createAsyncThunk(
    "lead/statusAssesmment",
    async({id,data},rejectWithValue)=>{
        try {
            const response = await axios.put(`https://searchmystudy.com/api/admin/profile/status/${id}`,data);
            toast.success("Update Lead Successfully")
            return response?.data
        } catch (error) {
            toast.error("Failed to update lead")   
         return rejectWithValue(error)
        }
    }
);

export const statusStudent = createAsyncThunk(
    "student/statusStudent",
    async({id,data},rejectWithValue)=>{
        try {
            const response = await axios.put(`https://searchmystudy.com/api/admin/student/status/${id}`,data);
            // toast.success("Update Lead Successfully")
            return response?.data
        } catch (error) {
            toast.error("Failed to update lead")   
         return rejectWithValue(error)
        }
    }
);
export const deleteLead = createAsyncThunk(
  "lead/deleteLead",
  async (ids, { rejectWithValue }) => {

    console.log(ids, "|||||||||||||||||||||||||||||||||||||||||");

    if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No IDs provided" });
    }

    try {
      const response = await axios.delete(
        "https://searchmystudy.com/api/admin/profile",
        {
          data: { ids }   // 👈 IMPORTANT!
        }
      );

      // toast.success("Delete lead Successfully");
      return response?.data;

    } catch (error) {
      toast.error("Failed to delete lead");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



// export const deleteQuery = createAsyncThunk(
//     "lead/deleteQuery",
//     async(ids,{rejectWithValue})=>{
//          if (!ids || ids.length === 0) {
//       return rejectWithValue({ message: "No IDs provided" });
//     }
//     try {
//         const response = await axios.delete("https://searchmystudy.com/api/admin/deleteQueryById",{data:{ids}});
//         toast.success("Delete lead Successfully");
//         return response?.data;
//     } catch (error) {
//         toast.error("Failed to delete lead")
//         return rejectWithValue(error);
//     }
//     }
// );
const AssessmentSlice = createSlice({
  name: "Assessment",
  initialState: {
    assessment: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(FetchAssessment.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
      .addCase(FetchAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.assessment = action.payload;
      })
      .addCase(FetchAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })




  }
})

export default AssessmentSlice.reducer;