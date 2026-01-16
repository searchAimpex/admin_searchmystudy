import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

export const fetchContactUsLead = createAsyncThunk(
  'lead/fetchContactUsLead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://searchmystudy.com/api/admin/contactlead");
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

export const websiteLeads = createAsyncThunk(
    'lead/websiteLeads',
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get("https://searchmystudy.com/api/admin/getAllQuery");
        return response.data; 
      } catch (error) {
          toast.error("Failed to fetch lead")
        return rejectWithValue(
          error.response?.data?.message || 'Something went wrong'
        );
      }
    }
  );



export const createContactUsLead = createAsyncThunk(
    'lead/createContactUsLead',
    async(data,thunkAPI)=>{
        try {
            const response = await axios.post("https://searchmystudy.com/api/admin/contactlead",data);
            toast.success("Lead created successfully")
            return response.data
        } catch (error) {
            toast.error("Failed to create lead")
            return thunkAPI.rejectWithValue(error)
        }
    }
);

export const updateContactUsLead = createAsyncThunk(
    "lead/updateContactUsLead",
    async({id,data},rejectWithValue)=>{
        try {
            const response = await axios.put(`https://searchmystudy.com/api/admin/contactlead/${id}`,data);
            toast.success("Update Lead Successfully")
            return response?.data
        } catch (error) {
            toast.error("Failed to update lead")   
         return rejectWithValue(error)
        }
    }
);

export const deleteContactUsLead = createAsyncThunk(
    "lead/deleteContactUsLead",
    async(ids,{rejectWithValue})=>{
         if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No IDs provided" });
    }
    try {
        const response = await axios.delete("https://searchmystudy.com/api/admin/contactlead",{data:{ids}});
        toast.success("Delete lead Successfully");
        return response?.data;
    } catch (error) {
        toast.error("Failed to delete lead")
        return rejectWithValue(error);
    }
    }
    
);


export const deleteQueries = createAsyncThunk(
    "lead/deleteContactUsLead",
    async(ids,{rejectWithValue})=>{
         if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No IDs provided" });
    }
    try {
        const response = await axios.delete("https://searchmystudy.com/api/admin/deleteQueries",{data:{ids}});
        toast.success("Delete lead Successfully");
        return response?.data;
    } catch (error) {
        toast.error("Failed to delete lead")
        return rejectWithValue(error);
    }
    }
    
);


export const deleteQuery = createAsyncThunk(
    "lead/deleteQuery",
    async(ids,{rejectWithValue})=>{
         if (!ids || ids.length === 0) {
      return rejectWithValue({ message: "No IDs provided" });
    }
    try {
        const response = await axios.delete("https://searchmystudy.com/api/admin/deleteQueryById",{data:{ids}});
        toast.success("Delete lead Successfully");
        return response?.data;
    } catch (error) {
        toast.error("Failed to delete lead")
        return rejectWithValue(error);
    }
    }
);
const contactUsleadSlice = createSlice({
    name:"contactUsLead",
    initialState:{
        contactUsLeads:null,
        websiteLead:null,
    loading:false,
    error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchContactUsLead.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(fetchContactUsLead.fulfilled,(state,action)=>{
            state.loading=false;
            state.contactUsLeads=action.payload;
        })
        .addCase(fetchContactUsLead.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })



        .addCase(websiteLeads.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(websiteLeads.fulfilled,(state,action)=>{
            state.loading=false;
            state.websiteLead=action.payload;
        })
        .addCase(websiteLeads.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })

        // Create Contact Us Lead
        .addCase(createContactUsLead.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(createContactUsLead.fulfilled,(state,action)=>{
            state.loading=false;
            // Add the new lead to the existing leads array
            if(state.contactUsLeads && Array.isArray(state.contactUsLeads)){
                state.contactUsLeads.push(action.payload);
            }
        })
        .addCase(createContactUsLead.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })

        // Update Contact Us Lead
        .addCase(updateContactUsLead.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(updateContactUsLead.fulfilled,(state,action)=>{
            state.loading=false;
            // Update the lead in the existing leads array
            if(state.contactUsLeads && Array.isArray(state.contactUsLeads)){
                const index = state.contactUsLeads.findIndex(lead => lead._id === action.payload._id);
                if(index !== -1){
                    state.contactUsLeads[index] = action.payload;
                }
            }
        })
        .addCase(updateContactUsLead.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })

        // Delete Contact Us Lead
        .addCase(deleteContactUsLead.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(deleteContactUsLead.fulfilled,(state,action)=>{
            state.loading=false;
            // Remove deleted leads from the array
            if(state.contactUsLeads && Array.isArray(state.contactUsLeads) && action.payload?.deletedIds){
                state.contactUsLeads = state.contactUsLeads.filter(lead => 
                    !action.payload.deletedIds.includes(lead._id)
                );
            }
        })
        .addCase(deleteContactUsLead.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })

        // Delete Query
        .addCase(deleteQuery.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(deleteQuery.fulfilled,(state,action)=>{
            state.loading=false;
            // Remove deleted queries from the array
            if(state.websiteLead && Array.isArray(state.websiteLead) && action.payload?.deletedIds){
                state.websiteLead = state.websiteLead.filter(query => 
                    !action.payload.deletedIds.includes(query._id)
                );
            }
        })
        .addCase(deleteQuery.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })
    }
})

export default contactUsleadSlice.reducer;