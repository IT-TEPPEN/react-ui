import { useRef, useState } from "react";

interface IPropsFileUploader {
  addFiles: (files: File[]) => void;
  onValidationError?: (rejectedFiles: File[]) => void;
  acceptedFileTypes?: string[];
  allowedExtensions?: string[];
  maxFileSize?: number;
}

interface IReturnFileUploader {
  inputProps: {
    ref: React.RefObject<HTMLInputElement>;
    type: "file";
    accept?: string;
    className?: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
  };
  isDragging: boolean;
  dropSpaceProps: {
    onClick?: React.MouseEventHandler;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
  };
}

// Default accepted file types
const DEFAULT_ACCEPTED_TYPES = [
  "image/*", // image
  "text/*", // .txt
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.ms-outlook", // .msg
  "application/json", // .json
  "application/xml", // .xml
  "application/pdf", // .pdf
  "application/x-compressed", // .tgz
  "application/x-zip-compressed", // .zip
  "application/x-gzip", // .gz
  "application/x-bzip2", // .bz2
  "application/x-tar", // .tar
  "application/x-rar-compressed", // .rar
  "application/x-7z-compressed", // .7z
  "application/zip", // .zip
];

// Default allowed extensions
const DEFAULT_ALLOWED_EXTENSIONS = [
  ".msg",
  ".jpg",
  ".jpeg",
  ".png",
  ".pdf",
  ".xlsx",
  ".docx",
  ".txt",
  ".zip",
];

export function useFileUploader(
  props: IPropsFileUploader
): IReturnFileUploader {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const acceptedTypes = props.acceptedFileTypes || DEFAULT_ACCEPTED_TYPES;
  const allowedExtensions =
    props.allowedExtensions || DEFAULT_ALLOWED_EXTENSIONS;

  const validateFiles = (
    files: File[]
  ): { validFiles: File[]; rejectedFiles: File[] } => {
    const validFiles: File[] = [];
    const rejectedFiles: File[] = [];

    files.forEach((file) => {
      // Check file size if maxFileSize is specified
      if (props.maxFileSize && file.size > props.maxFileSize) {
        rejectedFiles.push(file);
        return;
      }

      const extension = file.name.split(".").pop();
      if (
        extension &&
        allowedExtensions.some(
          (ext) =>
            ext.toLowerCase() === `.${extension.toLowerCase()}` ||
            ext.toLowerCase() === extension.toLowerCase()
        )
      ) {
        validFiles.push(file);
        return;
      }

      if (
        acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            const mainType = type.split("/")[0];
            return file.type.startsWith(`${mainType}/`);
          }
          return file.type === type;
        })
      ) {
        validFiles.push(file);
      } else {
        rejectedFiles.push(file);
      }
    });

    return { validFiles, rejectedFiles };
  };

  const addFiles = (files: File[]) => {
    const { validFiles, rejectedFiles } = validateFiles(files);
    if (validFiles.length > 0) {
      props.addFiles(validFiles);
    }
    if (rejectedFiles.length > 0 && props.onValidationError) {
      props.onValidationError(rejectedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setIsDragging(false);
  };

  return {
    inputProps: {
      ref: inputRef,
      type: "file",
      className: "hidden",
      accept: acceptedTypes.join(","),
      onChange: (e) => {
        if (e.target.files) {
          const selectedFiles = Array.from(e.target.files);
          addFiles(selectedFiles);
        }
      },
    },
    isDragging,
    dropSpaceProps: {
      onClick: () => inputRef.current?.click(),
      onDrop: handleDrop,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
    },
  };
}
