import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const createAxiosInstance = (token) => {
  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const uploadFile = createAsyncThunk(
  "files/upload",
  async ({ file }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      const api = createAxiosInstance(token);
      const response = await api.post("/upload", formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Upload failed");
    }
  }
);

export const fetchFiles = createAsyncThunk("files/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const token = sessionStorage.getItem("token");
    const api = createAxiosInstance(token);
    const response = await api.get("/files");
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Failed to fetch files");
  }
});

export const deleteFile = createAsyncThunk("files/delete", async (fileId, { rejectWithValue }) => {
  try {
    const token = sessionStorage.getItem("token");
    const api = createAxiosInstance(token);
    await api.delete(`/files/${fileId}`);
    return fileId;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Delete failed");
  }
});

export const downloadFile = createAsyncThunk(
  "files/download",
  async (fileId, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/files/${fileId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      // if (!response.ok) {
      //   throw new Error('Download failed');
      // }

      // Get the content type and filename from headers
      const contentType = response.headers.get('content-type');
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = `file-${fileId}`;

      // Try to get filename from content-disposition
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }

      // Create blob with proper content type
      const blob = await response.blob();
      const blobWithType = new Blob([blob], { type: contentType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blobWithType);

      // Create and trigger download
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = decodeURIComponent(fileName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      return { fileId, fileName };
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Download failed' });
    }
  }
);

export const previewFile = createAsyncThunk(
  "files/preview",
  async (fileId, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const api = createAxiosInstance(token);
      const response = await api.get(`/files/${fileId}/preview`);
      
      // Check if we have a previewUrl in the response
      if (response.data && response.data.previewUrl) {
        // Open the preview URL in a new tab
        window.open(response.data.previewUrl, '_blank');
        return response.data;
      } else {
        throw new Error('Preview URL not found');
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Preview failed");
    }
  }
);

const fileSlice = createSlice({
  name: "files",
  initialState: {
    files: [],
    loadingAll: false,
    uploading: false,
    deleting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchFiles.pending, (state) => {
        state.loadingAll = true;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loadingAll = false;
        state.files = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loadingAll = false;
        state.error = action.payload;
      })

      // UPLOAD
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.files.unshift(action.payload); // Optimistic UI
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteFile.pending, (state, action) => {
        state.deleting = true;
        // Optimistic removal
        state.files = state.files.filter((f) => f._id !== action.meta.arg);
      })
      .addCase(deleteFile.fulfilled, (state) => {
        state.deleting = false;
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // DOWNLOAD
      .addCase(downloadFile.pending, (state) => {
        // No state change needed for download pending
      })
      .addCase(downloadFile.fulfilled, (state) => {
        // No state change needed for download fulfilled
      })
      .addCase(downloadFile.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default fileSlice.reducer;
