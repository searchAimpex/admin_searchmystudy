import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { error } from "jquery";
import { toast } from "react-toastify";

export const FetchTicket = createAsyncThunk(
    'ticket/fetchTicket',
    async () => {
        try {
            const res = await fetch('https://searchmystudy.com/api/admin/ticket');
            const data = await res.json()
            return data;
        } catch (error) {
            console.log(error)
        }
    }
)

export const updateTicketStatus = createAsyncThunk(
  "ticket/updateTicketStatus",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `https://searchmystudy.com/api/admin/ticket/${id}`,
        data
      );

      toast.success("Updated Successfully");
      return res.data;
    } catch (error) {
      toast.error("Failed to update ticket");
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);


const ticketSlice = createSlice({
    name: 'ticket',
    initialState: {
        ticket: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(FetchTicket.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchTicket.fulfilled, (state, action) => {
                state.loading = false;
                state.ticket = action.payload;
            })
            .addCase(FetchTicket.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
})

export default ticketSlice.reducer;