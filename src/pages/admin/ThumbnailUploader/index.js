import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./style.scss";

export default function ImageUploader({ onFiles }) {
  const [preview, setPreview] = useState([]);
  const onDrop = useCallback((acceptedFiles) => {
    if (onFiles) onFiles(acceptedFiles);

    const newPreviews = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setPreview((prev) => [...prev, ...newPreviews]);
  }, [onFiles]);

  const removeImage = (index) => {
    setPreview((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
  });

  

  return (
    <div className="dropzone-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Thả ảnh vào đây…</p>
        ) : (
          <p>Kéo & thả ảnh hoặc bấm để chọn</p>
        )}
        <div className="preview-list">
        {preview.map((file, idx) => (
          <div key={idx} className="preview-item">
            <img src={file.preview} alt={file.name} />
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation(); // 🔹 Ngăn không cho click lan lên dropzone
                removeImage(idx);
              }}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
