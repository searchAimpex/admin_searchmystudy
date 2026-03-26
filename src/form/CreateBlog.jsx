import { useState } from "react";
import TextEditor from "./TextEditor";
import { createBlogThunk } from "../slice/blogSlice";
import { useDispatch } from "react-redux";
import {  toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateBlog({ handleClose ,loadBlogs}) {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    title: "",
    bannerURL: "",
    date: "",
    content: "",
    thumbnailURL: "",
  });

  const [uploads, setUploads] = useState({
    banner: { progress: 0, preview: null, name: "", file: null },
    thumbnail: { progress: 0, preview: null, name: "", file: null },
  });

  const [errors, setErrors] = useState({});

  const handleFileChange = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, [`${type}URL`]: file.name }));
    setUploads((prev) => ({
      ...prev,
      [type]: { progress: 100, preview: previewURL, name: file.name, file },
    }));
    setErrors((prev) => ({ ...prev, [`${type}URL`]: "" }));
  };

  const handleContentChange = (value) => {
    setForm((prev) => ({ ...prev, content: value }));
    setErrors((prev) => ({ ...prev, content: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.bannerURL.trim()) newErrors.bannerURL = "Banner image is required";
    if (!form.date.trim()) newErrors.date = "Date is required";
    if (!form.content.trim()) newErrors.content = "Content is required";
    if (!form.thumbnailURL.trim()) newErrors.thumbnailURL = "Thumbnail image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error("Please fill in all required fields.");
    return;
  }
  try {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("date", form.date);
    formData.append("content", form.content);
    if (uploads.banner.file) {
      formData.append("bannerURL", uploads.banner.file);
    } else if (form.bannerURL) {
      formData.append("bannerURL", form.bannerURL);
    }
    if (uploads.thumbnail.file) {
      formData.append("thumbnailURL", uploads.thumbnail.file);
    } else if (form.thumbnailURL) {
      formData.append("thumbnailURL", form.thumbnailURL);
    }

    const res = await dispatch(createBlogThunk(formData));
    console.log(res, "<<< Blog creation response >>>");

    if (createBlogThunk.fulfilled.match(res)) {
      alert("✅ Blog created successfully!")
      toast.success("✅ Blog created successfully!");
      handleClose(); 
      loadBlogs()
    } else if (createBlogThunk.rejected.match(res)) {
      // Failure case with detailed error
      const errorMsg =
        res.payload?.message || res.error?.message || "Unknown error occurred.";
      toast.error("❌ Failed to create blog: " + errorMsg);
    }
  } catch (error) {
    // Unexpected runtime errors
    toast.error("⚠️ Unexpected error: " + (error.message || "Something went wrong"));
  }
};


  return (
    <>
      <ToastContainer />
      <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog" style={{ maxWidth: "800px" }}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Blog</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <div className="p-4">
              {/* Title */}
              <div className="col-12 mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? "is-invalid" : ""}`}
                  placeholder="Enter title here"
                  value={form.title}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, title: e.target.value }));
                    setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              {/* Banner Upload */}
              <div className="col-12 mb-3">
                <label className="form-label">Upload Banner</label>
                <input
                  className={`form-control form-control-lg ${errors.bannerURL ? "is-invalid" : ""}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "banner")}
                />
                <p style={{ color: "red" }}>Banner Size should be 2400x400 px</p>
                {uploads.banner.preview && <img src={uploads.banner.preview} alt="banner" width="200" />}
                {errors.bannerURL && <div className="invalid-feedback">{errors.bannerURL}</div>}
              </div>

              {/* Thumbnail Upload */}
              <div className="col-12 mb-3">
                <label className="form-label">Upload Thumbnail</label>
                <input
                  className={`form-control form-control-lg ${errors.thumbnailURL ? "is-invalid" : ""}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "thumbnail")}
                />
                <p style={{ color: "red" }}>Thumbnail Size should be 1200x900 px</p>
                {uploads.thumbnail.preview && <img src={uploads.thumbnail.preview} alt="thumbnail" width="200" />}
                {errors.thumbnailURL && <div className="invalid-feedback">{errors.thumbnailURL}</div>}
              </div>

              {/* Content */}
              <div className="col-12 mb-3">
                <label className="form-label">Content</label>
                <TextEditor content={form.content} setContent={handleContentChange} />
                {errors.content && <div style={{ color: "red", marginTop: "5px" }}>{errors.content}</div>}
              </div>

              {/* Date */}
              <div className="col-12 mb-3">
                <label className="form-label">Select Date</label>
                <input
                  className={`form-control form-control-lg ${errors.date ? "is-invalid" : ""}`}
                  type="date"
                  value={form.date}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, date: e.target.value }));
                    setErrors((prev) => ({ ...prev, date: "" }));
                  }}
                />
                {errors.date && <div className="invalid-feedback">{errors.date}</div>}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                Save Blog
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
