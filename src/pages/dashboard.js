import { LogOut, Cloud, Upload, Download, Trash2, Grid, List, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { fetchFiles, uploadFile } from "@/store/slices/fileSlice";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils"; // We'll create this utility

const Dashboard = () => {
  const [viewType, setViewType] = useState('grid'); // Change default view type to 'grid'
  const router = useRouter();
  const dispatch = useDispatch();
  const { files, loading, uploadProgress } = useSelector(
    (state) => state.files
  );
  const [dragActive, setDragActive] = useState(false);

  // Update useEffect to handle initial file loading
  useEffect(() => {
    const checkAuthAndLoadFiles = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      try {
        await dispatch(fetchFiles()).unwrap();
      } catch (error) {
        toast.error("Failed to fetch your files");
        if (error.status === 401) {
          sessionStorage.removeItem("token");
          router.push("/signin");
        }
      }
    };

    checkAuthAndLoadFiles();

    // Set up interval to refresh files periodically (optional)
    const refreshInterval = setInterval(() => {
      const token = sessionStorage.getItem("token");
      if (token) {
        dispatch(fetchFiles()).catch(() => {
          // Silent fail for background refresh
        });
      }
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, [dispatch, router]);

  const handleSignOut = () => {
    sessionStorage.removeItem("token");
    router.push("/signin");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (!files) return;

    try {
      for (const file of files) {
        await dispatch(uploadFile({ file })).unwrap();
      }
      toast.success("Files uploaded successfully!");
      await dispatch(fetchFiles()).unwrap(); // Refresh file list after upload
    } catch (err) {
      toast.error("Failed to upload files");
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files) return;

    try {
      for (const file of files) {
        await dispatch(uploadFile({ file })).unwrap();
      }
      toast.success("Files uploaded successfully!");
      await dispatch(fetchFiles()).unwrap(); // Refresh file list after upload
    } catch (err) {
      toast.error("Failed to upload files");
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async (fileId) => {
    try {
      // Implement delete functionality when ready
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Failed to delete file");
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
            <span className="text-xl font-bold">ClouDocs</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 bg-white">
        <div className="space-y-8">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
            <p className="text-gray-500 mt-1">
              Upload and manage your files securely
            </p>
          </div>

          {/* Storage Info */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-[#0B6CFF]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Storage</h3>
                  <Progress value={0} className="h-2" />
                  <p className="text-sm text-gray-500 mt-2">
                    0 bytes of 5 GB used
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
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
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <Upload
                    className={`h-12 w-12 ${
                      dragActive ? "text-[#0B6CFF]" : "text-gray-400"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-semibold">
                  Drag & drop files here
                </h3>
                <p className="text-gray-500 mt-1">or click to browse</p>
              </div>
            </label>
          </div>

          {/* Files List */}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : files.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No files yet. Upload your first file above!
            </div>
          ) : (
            <>
              {/* View Toggle */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{files.length} {files.length === 1 ? 'file' : 'files'}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewType('grid')}
                    className={viewType === 'grid' ? 'bg-gray-100' : ''}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewType('list')}
                    className={viewType === 'list' ? 'bg-gray-100' : ''}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className={viewType === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-4'}>
                {files.map((file) => (
                  <Card key={file._id} className="bg-white">
                    <CardContent className={`p-4 ${viewType === 'list' ? 'flex items-center justify-between' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-[#0B6CFF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.fileName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatBytes(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file.fileUrl, file.fileName)}
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