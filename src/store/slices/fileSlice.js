// filepath: c:\TypeFace\dropbox-clone-frontend\src\store\slices\filesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with auth header
const createAxiosInstance = (token) => {
  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const uploadFile = createAsyncThunk(
  'files/upload',
  async ({ file }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const formData = new FormData();
      formData.append('file', file);

      const api = createAxiosInstance(token);
      const response = await api.post('/upload', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchFiles = createAsyncThunk(
  'files/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const api = createAxiosInstance(token);
      const response = await api.get('/files');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const downloadFile = createAsyncThunk(
  'files/download',
  async (fileId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const api = createAxiosInstance(token);
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `file-${fileId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return fileId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    files: [],
    loading: false,
    error: null,
    uploadProgress: 0
  },
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.files.push(action.payload);
        state.uploadProgress = 0;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      })
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default filesSlice.reducer;