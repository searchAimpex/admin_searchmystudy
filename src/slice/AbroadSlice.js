import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';

export const fetchAbroadStudy = createAsyncThunk(
  'abroad/fetchAbroadStudy',
    async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://searchmystudy.com/api/admin/countries");
      // console.log(response?.data,"++++++++++++==");
      
      return Array.isArray(response.data)
        ? response.data.filter(item => item?.mbbsAbroad === false)
        : [];   // returned data will be available in fulfilled reducer
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
    }
);

export const deleteAbroadStudy = createAsyncThunk(
  'abroad/deleteAbroadStudy',
    async (ids, { rejectWithValue }) => {
      console.log(ids);
      
        if (!ids || ids.length === 0) {
        return rejectWithValue({ message: "No abroad study IDs provided" });
        }
        try {
        const response = await axios.delete(`https://searchmystudy.com/api/admin/countries`, {
          data:{ids}
        });
        return response.data;
        } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createAbroadStudyThunk = createAsyncThunk(
  'abroad/createAbroadStudy',
  async (abroadData, thunkAPI) => {
    try {
      const response = await fetch("https://searchmystudy.com/api/admin/countries", {
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

export const updateAbroadStudy = createAsyncThunk(
  'abroad/updateAbroadStudy',  
    async ({ id, data }, thunkAPI) => {
        try {
        const response = await fetch(`https://searchmystudy.com/api/admin/countries/${id}`, {
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

export const abroadSlice = createSlice({
  name: 'abroad',
    initialState: {
        studyAbroad: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAbroadStudy.pending, (state) => {
            state.loading = true;
            state.error = null;
            })
            .addCase(fetchAbroadStudy.fulfilled, (state, action) => {
            state.studyAbroad = action.payload;
            state.loading = false;
            })
            .addCase(fetchAbroadStudy.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Failed to fetch abroad study data';
            })
            // .addCase(deleteAbroadStudy.pending, (state) => {
            // state.loading = true;
            // state.error = null;
            // })
            // .addCase(deleteAbroadStudy.fulfilled, (state, action) => {
            // state.studyAbroad = state.studyAbroad.filter(item => !action.payload.ids.includes(item._id));
            // state.loading = false;
            // })
            // .addCase(deleteAbroadStudy.rejected, (state, action) => {
            // state.loading = false;
            // state.error = action.payload || 'Failed to delete abroad study data';
            // })
            .addCase(createAbroadStudyThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
            })
            .addCase(createAbroadStudyThunk.fulfilled, (state, action) => {
            state.studyAbroad.push(action.payload);
            state.loading = false;
            })
            .addCase(createAbroadStudyThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Failed to create abroad study data';
            });
        }
});

export default abroadSlice.reducer;