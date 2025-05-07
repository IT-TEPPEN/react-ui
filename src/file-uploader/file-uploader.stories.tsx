import { Meta, StoryObj } from "@storybook/react";
import { FileUploader } from ".";
import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

const meta = {
  title: "Form/FileUploader",
  component: FileUploader,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "FileUploader component for drag-and-drop or click-to-select file uploads. Supports various file types including images, documents, archives, and more.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "80vw" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    className: { control: "text" },
    dropAreaClassName: { control: "text" },
    dragActiveText: { control: "text" },
    defaultText: { control: "text" },
    multiple: { control: "boolean" },
    acceptedFileTypes: { control: "object" },
    allowedExtensions: { control: "object" },
    maxFileSize: {
      control: "number",
      description: "Maximum file size in bytes",
    },
    showFileList: { control: "boolean" },
    showRejectedFiles: { control: "boolean" },
    rejectedFilesText: { control: "text" },
    dropAreaHeight: { control: "text" },
  },
} as Meta<typeof FileUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultText: "ファイルを選択またはドラッグ&ドロップ",
    dragActiveText: "ここにドロップしてください",
    showFileList: true,
    showRejectedFiles: true,
    multiple: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default file uploader that accepts a wide range of file types. Users can drag and drop files or click to browse.",
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    className: "border-blue-500 border-4",
    dropAreaClassName: "bg-blue-50",
    dragActiveText: "Release to upload!",
    defaultText: "Upload your files",
    icon: <FaCloudUploadAlt size={52} color="#2563eb" />,
    dropAreaHeight: "h-60",
  },
  parameters: {
    docs: {
      description: {
        story: "FileUploader with custom styling and text.",
      },
    },
  },
};

export const RestrictedFileTypes: Story = {
  args: {
    defaultText: "Upload images only",
    acceptedFileTypes: ["image/*"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    rejectedFilesText: "Only image files are allowed:",
  },
  parameters: {
    docs: {
      description: {
        story: "FileUploader that only accepts image files.",
      },
    },
  },
};

export const FileSizeLimit: Story = {
  args: {
    defaultText: "Upload files (max 1MB)",
    maxFileSize: 1024 * 1024, // 1MB
    rejectedFilesText: "Files exceeding 1MB size limit:",
  },
  parameters: {
    docs: {
      description: {
        story: "FileUploader with a 1MB file size limit.",
      },
    },
  },
};

// Example of controlled component with external state
export const ExternallyControlled = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-bold mb-2">Externally Controlled FileUploader</h3>
        <p className="text-sm text-gray-600 mb-4">
          This example demonstrates handling files with external state.
        </p>

        <FileUploader
          files={files}
          rejectedFiles={rejectedFiles}
          onFilesAdded={(newFiles) => {
            console.log("Files added:", newFiles);
            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
          }}
          onFilesRejected={(rejectedFiles) => {
            console.log("Files rejected:", rejectedFiles);
            setRejectedFiles(rejectedFiles);
          }}
          useInternalState={false}
          showFileList={false}
          showRejectedFiles={false}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">
            Accepted Files ({files.length})
          </h4>
          {files.length > 0 ? (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="bg-white border border-green-300 p-2 rounded-lg flex justify-between"
                >
                  <span>{file.name}</span>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() =>
                      setFiles(files.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No files uploaded yet</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-2">
            Rejected Files ({rejectedFiles.length})
          </h4>
          {rejectedFiles.length > 0 ? (
            <ul className="space-y-2">
              {rejectedFiles.map((file, index) => (
                <li
                  key={index}
                  className="bg-red-100 border border-red-300 p-2 rounded-lg flex justify-between"
                >
                  <span>{file.name}</span>
                  <span className="text-red-500 text-sm">
                    (Unsupported type)
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No rejected files</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => {
            setFiles([]);
            setRejectedFiles([]);
          }}
        >
          Clear All Files
        </button>
      </div>
    </div>
  );
};

// Example with custom rendering for file items
export const CustomFileRendering = () => {
  return (
    <FileUploader
      defaultText="Upload files with custom rendering"
      renderFileItem={(file) => (
        <div className="flex items-center justify-between bg-white border border-green-300 p-3 rounded-lg">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-md mr-3">
              {file.type.includes("image") ? (
                <span role="img" aria-label="image">
                  🖼️
                </span>
              ) : file.type.includes("pdf") ? (
                <span role="img" aria-label="document">
                  📄
                </span>
              ) : file.type.includes("zip") ||
                file.type.includes("compressed") ? (
                <span role="img" aria-label="archive">
                  🗜️
                </span>
              ) : (
                <span role="img" aria-label="file">
                  📁
                </span>
              )}
            </div>
            <div>
              <div className="font-medium">{file.name}</div>
              <div className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(file.lastModified).toLocaleDateString()}
          </div>
        </div>
      )}
      renderRejectedFileItem={(file) => (
        <div className="flex items-center justify-between bg-red-50 border border-red-300 p-3 rounded-lg">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-md mr-3">
              <span role="img" aria-label="error">
                ⚠️
              </span>
            </div>
            <div>
              <div className="font-medium">{file.name}</div>
              <div className="text-xs text-red-500">
                Unsupported file type: {file.type || "unknown"}
              </div>
            </div>
          </div>
        </div>
      )}
    />
  );
};
