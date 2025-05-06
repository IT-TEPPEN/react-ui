import { useState } from "react";
import { useFileUploader } from "./hook";
import { LuUpload } from "react-icons/lu";

export interface FileUploaderProps {
  /**
   * Custom class name for the container
   */
  className?: string;
  /**
   * Custom class name for the drop area
   */
  dropAreaClassName?: string;
  /**
   * Text displayed when dragging files over the drop area
   */
  dragActiveText?: string;
  /**
   * Default text for the uploader
   */
  defaultText?: string;
  /**
   * Custom icon component to display instead of the default upload icon
   */
  icon?: React.ReactNode;
  /**
   * Whether to accept multiple files (default: true)
   */
  multiple?: boolean;
  /**
   * List of accepted file types (MIME types or extensions)
   * If not provided, defaults to a predefined list of common formats
   */
  acceptedFileTypes?: string[];
  /**
   * List of allowed file extensions (e.g. ['.jpg', '.pdf'])
   * If not provided, defaults to a predefined list
   */
  allowedExtensions?: string[];
  /**
   * Maximum allowed file size in bytes
   */
  maxFileSize?: number;
  /**
   * External controlled array of files
   */
  files?: File[];
  /**
   * External controlled array of rejected files
   */
  rejectedFiles?: File[];
  /**
   * Callback when files are added (and pass validation)
   */
  onFilesAdded?: (files: File[]) => void;
  /**
   * Callback when files are rejected
   */
  onFilesRejected?: (rejectedFiles: File[]) => void;
  /**
   * Whether to use internal state for files management (default: true if files prop not provided)
   */
  useInternalState?: boolean;
  /**
   * Whether to show the file list below the uploader (default: true)
   */
  showFileList?: boolean;
  /**
   * Whether to show rejected files list (default: true)
   */
  showRejectedFiles?: boolean;
  /**
   * Custom text for rejected files section
   */
  rejectedFilesText?: string;
  /**
   * Custom function to render each file item
   */
  renderFileItem?: (file: File) => React.ReactNode;
  /**
   * Custom function to render each rejected file item
   */
  renderRejectedFileItem?: (file: File) => React.ReactNode;
  /**
   * Height of the drop area (default: "h-40")
   */
  dropAreaHeight?: string;
}

export function FileUploader({
  className = "",
  dropAreaClassName = "",
  dragActiveText = "ここにファイルをドロップ", // "Drop files here"
  defaultText = "ファイルの選択", // "Select files"
  icon = <LuUpload size={48} />,
  multiple = true,
  acceptedFileTypes,
  allowedExtensions,
  maxFileSize,
  files: externalFiles,
  rejectedFiles: externalRejectedFiles,
  onFilesAdded,
  onFilesRejected,
  useInternalState = externalFiles === undefined,
  showFileList = true,
  showRejectedFiles = true,
  rejectedFilesText = "These files are not accepted:",
  renderFileItem,
  renderRejectedFileItem,
  dropAreaHeight = "h-40",
}: FileUploaderProps) {
  // Internal state for files if not controlled externally
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [internalRejectedFiles, setInternalRejectedFiles] = useState<File[]>(
    []
  );

  // Use either external or internal state based on props
  const files = useInternalState ? internalFiles : externalFiles || [];
  const rejectedFiles = useInternalState
    ? internalRejectedFiles
    : externalRejectedFiles || [];

  const { inputProps, dropSpaceProps, isDragging } = useFileUploader({
    addFiles: (newFiles) => {
      if (useInternalState) {
        setInternalFiles((f) => [...f, ...newFiles]);
      }
      onFilesAdded?.(newFiles);
    },
    onValidationError: (rejectedFiles) => {
      if (useInternalState) {
        setInternalRejectedFiles(rejectedFiles);
      }
      onFilesRejected?.(rejectedFiles);
    },
    acceptedFileTypes,
    allowedExtensions,
    maxFileSize,
  });

  return (
    <>
      <div
        className={`w-full mx-auto border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 ${className}`}
      >
        <div
          {...dropSpaceProps}
          className={`cursor-pointer w-full ${dropAreaHeight} flex flex-col gap-5 items-center justify-center rounded-lg transition-colors hover:bg-blue-100 ${
            isDragging ? "bg-blue-100" : ""
          } ${dropAreaClassName}`}
        >
          <div>{icon}</div>
          <p>{isDragging ? dragActiveText : defaultText}</p>
        </div>
        <input {...inputProps} multiple={multiple} />
      </div>

      {showFileList && files.length > 0 && (
        <ul className="space-y-2 mt-4">
          {files.map((file) => (
            <li
              key={`${file.name}-${file.lastModified}`}
              className="bg-white border border-gray-300 p-2 rounded-lg"
            >
              {renderFileItem ? renderFileItem(file) : file.name}
            </li>
          ))}
        </ul>
      )}

      {showRejectedFiles && rejectedFiles.length > 0 && (
        <div className="mt-4 text-red-500">
          <p>{rejectedFilesText}</p>
          <ul className="space-y-2">
            {rejectedFiles.map((file) => (
              <li
                key={`${file.name}-${file.lastModified}`}
                className="bg-red-100 border border-red-300 p-2 rounded-lg"
              >
                {renderRejectedFileItem
                  ? renderRejectedFileItem(file)
                  : file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
