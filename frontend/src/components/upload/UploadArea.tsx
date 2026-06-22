import { useCallback, useState } from "react";

interface UploadAreaProps {
  activeTab: "pdf" | "docx";
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onValidationError?: (msg: string) => void;
  error: string | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPT_MAP = { pdf: ".pdf", docx: ".docx" };

export function UploadArea({
  activeTab,
  file,
  onFileSelect,
  onValidationError,
  error,
}: UploadAreaProps) {
  const [dragging, setDragging] = useState(false);

  const validateFile = useCallback(
    (fileToValidate: File): string | null => {
      const allowedExtension = ACCEPT_MAP[activeTab].slice(1);
      const extension = fileToValidate.name.toLowerCase().split(".").pop();

      if (extension !== allowedExtension) {
        return `Invalid file type. Please upload a ${allowedExtension.toUpperCase()} file.`;
      }

      if (fileToValidate.size > MAX_FILE_SIZE) {
        return "File is too large. Maximum size is 10 MB.";
      }

      return null;
    },
    [activeTab]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) {
        const validationError = validateFile(dropped);
        if (validationError) {
          onFileSelect(null);
          onValidationError?.(validationError);
          return;
        }

        onFileSelect(dropped);
      }
    },
    [onFileSelect, onValidationError, validateFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0] || null;
      if (selected) {
        const validationError = validateFile(selected);
        if (validationError) {
          onFileSelect(null);
          onValidationError?.(validationError);
          return;
        }
      }

      onFileSelect(selected);
    },
    [onFileSelect, onValidationError, validateFile]
  );

  const accept = ACCEPT_MAP[activeTab];

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragging
            ? "border-primary-400 bg-primary-50"
            : file
              ? "border-green-300 bg-green-50"
              : error
                ? "border-red-300 bg-red-50"
                : "border-slate-300 hover:border-slate-400"
        }`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {file ? (
          <div>
            <p className="text-sm font-medium text-green-700">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              {(file.size / 1024).toFixed(1)} KB — Click or drop to replace
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-600">
              Drag & drop your {activeTab.toUpperCase()} here, or{" "}
              <span className="text-primary-600 font-medium">click to browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-2">Max file size: 10 MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}
