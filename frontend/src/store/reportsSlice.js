import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportsAPI } from '../api/axios';

export const fetchReports = createAsyncThunk('reports/fetchAll', async (params, { rejectWithValue }) => {
  try { const { data } = await reportsAPI.getAll(params); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to fetch reports'); }
});

export const fetchMyReports = createAsyncThunk('reports/fetchMy', async (params, { rejectWithValue }) => {
  try { const { data } = await reportsAPI.getMy(params); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const fetchReportById = createAsyncThunk('reports/fetchById', async (id, { rejectWithValue }) => {
  try { const { data } = await reportsAPI.getById(id); return data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    list: [], myList: [], selected: null,
    loading: false, error: null,
    meta: { total: 0, page: 1, pages: 1 },
    filters: { status: '', priority: '', category: '', search: '' },
  },
  reducers: {
    setFilters: (state, { payload }) => { state.filters = { ...state.filters, ...payload }; },
    clearSelected: (state) => { state.selected = null; },
    addReport: (state, { payload }) => { state.list.unshift(payload); state.meta.total += 1; },
    updateReportInList: (state, { payload }) => {
      const idx = state.list.findIndex(r => r._id === payload._id);
      if (idx !== -1) state.list[idx] = payload;
      if (state.selected?._id === payload._id) state.selected = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchReports.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload.data; s.meta = payload.meta; })
      .addCase(fetchReports.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(fetchMyReports.pending, (s) => { s.loading = true; })
      .addCase(fetchMyReports.fulfilled, (s, { payload }) => { s.loading = false; s.myList = payload.data; s.meta = payload.meta; })
      .addCase(fetchMyReports.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(fetchReportById.pending, (s) => { s.loading = true; })
      .addCase(fetchReportById.fulfilled, (s, { payload }) => { s.loading = false; s.selected = payload; })
      .addCase(fetchReportById.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });
  },
});

export const { setFilters, clearSelected, addReport, updateReportInList } = reportsSlice.actions;
export default reportsSlice.reducer;


