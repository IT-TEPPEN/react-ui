import { useRef, useState } from "react";

interface IPropsFileUploader {
  addFiles: (files: File[]) => void;
  onValidationError?: (rejectedFiles: File[]) => void;
}

interface IReturnFileUploader {
  inputProps: {
    ref: React.RefObject<HTMLInputElement>;
    type: "file";
    multiple?: boolean;
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

const ACCEPTED_TYPES = [
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

const ALLOWED_EXTENSIONS = [".msg"];

export function useFileUploader(
  props: IPropsFileUploader
): IReturnFileUploader {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFiles = (
    files: File[]
  ): { validFiles: File[]; rejectedFiles: File[] } => {
    const validFiles: File[] = [];
    const rejectedFiles: File[] = [];

    files.forEach((file) => {
      const extension = file.name.split(".").pop();
      if (extension && ALLOWED_EXTENSIONS.includes(`.${extension}`)) {
        validFiles.push(file);
        return;
      }
      if (ACCEPTED_TYPES.some((type) => file.type.match(type))) {
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
      multiple: true,
      className: "hidden",
      accept: ACCEPTED_TYPES.join(","),
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
