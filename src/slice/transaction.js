import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { error } from "jquery";
import { toast } from "react-toastify";

export const FetchTransaction = createAsyncThunk(
    'transaction/FetchTransaction',
    async () => {
        try {
            const res = await fetch('https://searchmystudy.com/api/admin/transaction');
            const data = await res.json()
            return data;
        } catch (error) {
            console.log(error)
        }
    }
)


export const createTransaction = createAsyncThunk(
  "transaction/createTransaction",
  async (data)=>{
    try {
      const response = await axios.post(`https://searchmystudy.com/api/admin/transaction`,data)
      return response.data
    } catch (error) {
      console.log(error)
    }
  }
)

export const deleteTransaction = createAsyncThunk(
  "transaction/deleteTransaction",
  async (ids,{rejectWithValue})=>{
    try {
      console.log(ids)
      const res = await axios.delete("https://searchmystud.com/api/admin/transaction",
        {data:{ids}}
      )
      return res.data
    } catch (error) {
      console.log(error)
    }
  }
)

const transactionSlice = createSlice({
    name: 'ticket',
    initialState: {
        transaction: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(FetchTransaction.pending, (state) => {
                state.loading = true;
            })
            .addCase(FetchTransaction.fulfilled, (state, action) => {
                state.loading = false;
                state.transaction = action.payload;
            })
            .addCase(FetchTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
})

export default transactionSlice.reducer;