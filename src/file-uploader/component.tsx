import { useState } from "react";
import { useFileUploader } from "./hook";
import { LuUpload } from "react-icons/lu";

interface FileUploaderProps {}

export function FileUploader(props: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);
  const { inputProps, dropSpaceProps, isDragging } = useFileUploader({
    addFiles: (files) => {
      setFiles((f) => [...f, ...files]);
    },
    onValidationError: (rejectedFiles) => {
      setRejectedFiles(rejectedFiles);
    },
  });

  return (
    <>
      <div className="w-full mx-auto border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div
          {...dropSpaceProps}
          className={`cursor-pointer w-full h-40 flex flex-col gap-5 items-center justify-center rounded-lg transition-colors hover:bg-blue-100 ${
            isDragging ? "bg-blue-100" : ""
          }`}
        >
          <div>
            <LuUpload size={48} />
          </div>
          <p>{isDragging ? "ここにファイルをドロップ" : "ファイルの選択"}</p>
        </div>
        <input {...inputProps} />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2 mt-4">
          {files.map((file) => (
            <li
              key={file.name}
              className="bg-white border border-gray-300 p-2 rounded-lg"
            >
              {file.name}
            </li>
          ))}
        </ul>
      )}

      {rejectedFiles.length > 0 && (
        <div className="mt-4 text-red-500">
          <p>These files are not accepted:</p>
          <ul className="space-y-2">
            {rejectedFiles.map((file) => (
              <li
                key={file.name}
                className="bg-red-100 border border-red-300 p-2 rounded-lg"
              >
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
