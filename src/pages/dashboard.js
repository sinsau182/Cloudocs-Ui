import { LogOut, Cloud, Upload, Download, Trash2, Grid, List, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { fetchFiles, uploadFile, deleteFile, downloadFile, previewFile } from "@/store/slices/fileSlice";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils";

const Dashboard = () => {
  const [viewType, setViewType] = useState("grid");
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const { files, loadingAll, uploading, deleting } = useSelector(
    (state) => state.files
  );

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    dispatch(fetchFiles()).unwrap().catch((error) => {
      toast.error("Failed to fetch files");
      if (error.status === 401) {
        sessionStorage.removeItem("token");
        router.push("/signin");
      }
    });
  }, [dispatch, router]);

  const handleSignOut = () => {
    sessionStorage.removeItem("token");
    router.push("/signin");
  };

const ALLOWED_MIME_TYPES = new Set([
  "text/plain",        // .txt
  "image/jpeg",        // .jpg, .jpeg
  "image/png",         // .png
  "application/pdf",   // .pdf
  "application/json",  // .json
]);

const ALLOWED_EXTENSIONS = new Set([
  ".txt", ".jpg", ".jpeg", ".png", ".pdf", ".json"
]);

const isAllowedFile = (file) => {
  const ext = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
  return (
    ALLOWED_MIME_TYPES.has(file.type) &&
    ALLOWED_EXTENSIONS.has(`.${ext}`)
  );
};

// Handles list of files for both select and drop
const handleFiles = async (fileList) => {
  if (!fileList) return;
  for (const file of fileList) {
    if (!isAllowedFile(file)) {
      toast.error(`${file.name} is not a supported file type.`);
      continue;
    }
    try {
      await dispatch(uploadFile({ file })).unwrap();
      toast.success(`${file.name} uploaded successfully!`);
    } catch {
      toast.error(`Failed to upload ${file.name}`);
    }
  }
};

const handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(e.type === "dragenter" || e.type === "dragover");
};

const handleDrop = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
  await handleFiles(e.dataTransfer?.files);
};

const handleFileSelect = async (e) => {
  await handleFiles(e.target.files);
};

  const handleDownload = async (fileId) => {
    try {
      await dispatch(downloadFile(fileId)).unwrap();
      toast.success("File downloaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to download file");
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await dispatch(deleteFile(fileId)).unwrap();
      toast.success("File deleted successfully");
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const handlePreview = async (fileId) => {
    try {
      await dispatch(previewFile(fileId)).unwrap();
      console.log("Preview dispatched");
      toast.success("File previewed successfully");
    } catch (error) {
      toast.error(error.message || "Failed to preview file");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0B6CFF] rounded-xl flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0B6CFF]">ClouDocs</span>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-500" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8 bg-white">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
            <p className="text-gray-500 mt-1">Upload and manage your files securely</p>
            {uploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}
            {deleting && <p className="text-sm text-red-500 mt-2">Deleting file...</p>}
          </div>

          <div
            className={`border-2 border-dashed ${
              dragActive ? "border-[#0B6CFF] bg-blue-50" : "border-gray-200"
            } rounded-lg p-12`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload" className="cursor-pointer text-center block">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="text-lg font-semibold">Drag & drop files here</h3>
              <p className="text-gray-500 mt-1">or click to browse</p>
            </label>
          </div>

          {loadingAll ? (
            <div className="text-center py-8 text-gray-500">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No files yet. Upload your first file above!</div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-black">
                  {files.length} {files.length === 1 ? "file" : "files"}
                </h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className={`text-gray-400 ${viewType === 'grid' ? 'bg-gray-800 text-gray-50' : ''}`} onClick={() => setViewType("grid")}>
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className={`text-gray-400 ${viewType === 'list' ? 'bg-gray-800 text-gray-50' : ''}`} onClick={() => setViewType("list")}>
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div
                className={viewType === "grid" ? "grid grid-cols-3 gap-4" : "space-y-4"}
              >
                {files.map((file) => (
                  <Card key={file._id} className="bg-white">
                    <CardContent
                      className={`p-4 ${
                        viewType === "list" ? "flex items-center justify-between" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-[#0B6CFF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate"
                          onClick={() => handlePreview(file._id)}>{file.fileName}</p>
                          <p className="text-sm text-gray-500">
                            {formatBytes(file.size)} •{" "}
                            {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file._id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
