import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';

export const fetchMbbsStudy = createAsyncThunk(
  'mbbs/fetchMbbsStudy',
    async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://searchmystudy.com/api/admin/countries");
    //   console.log(response?.data,"++++++++++++==");
      
      return Array.isArray(response.data)
        ? response.data.filter(item => item?.mbbsAbroad === true)
        : [];   // returned data will be available in fulfilled reducer
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
    }
);

export const deleteMbbsStudy = createAsyncThunk(
  'abroad/deleteMbbsStudy',
    async (ids, { rejectWithValue }) => {
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

export const createMbbstudyThunk = createAsyncThunk(
  'abroad/createMbbstudyThunk',
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

export const updateMbbsStudy = createAsyncThunk(
  'abroad/updateMbbsStudy',  
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

export const MbbsSlice = createSlice({
  name: 'mbbs_study',
    initialState: {
        studyMbbs: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMbbsStudy.pending, (state) => {
            state.loading = true;
            state.error = null;
            })
            .addCase(fetchMbbsStudy.fulfilled, (state, action) => {
            state.studyMbbs = action.payload;
            state.loading = false;
            })
            .addCase(fetchMbbsStudy.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Failed to fetch abroad study data';
            })
            .addCase(deleteMbbsStudy.pending, (state) => {
            state.loading = true;
            state.error = null;
            })
            .addCase(deleteMbbsStudy.fulfilled, (state, action) => {
            state.studyMbbs = state.studyAbroad.filter(item => !action.payload.ids.includes(item._id));
            state.loading = false;
            })
            .addCase(deleteMbbsStudy.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Failed to delete abroad study data';
            })
            .addCase(createMbbstudyThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
            })
            .addCase(createMbbstudyThunk.fulfilled, (state, action) => {
            state.studyMbbs.push(action.payload);
            state.loading = false;
            })
            .addCase(createMbbstudyThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Failed to create abroad study data';
            });
        }
});

export default MbbsSlice.reducer;