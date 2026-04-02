import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createCounselor, updateCounselor } from "../slice/CounselorManagerSlice";

const BACKEND_ASSET_BASE = "https://backend.searchmystudy.com";

function getPreviewUrl(value) {
  if (value == null || value === "") return "";
  let s = typeof value === "string" ? value.trim() : String(value).trim();
  if (!s) return "";
  const blobAt = s.toLowerCase().indexOf("blob:");
  if (blobAt > 0) s = s.slice(blobAt);
  if (/^blob:/i.test(s) || /^data:/i.test(s)) return s;
  if (/^https?:\/\//i.test(s)) return s;
  return `${BACKEND_ASSET_BASE}/${s.replace(/^\/+/, "")}`;
}

/** Build multipart body for create/update counselor APIs. */
function counselorFormToFormData(f) {
  const fd = new FormData();
  fd.append("name", f.name ?? "");
  fd.append("course", f.course ?? "");
  fd.append("experience", f.experience ?? "");
  if (f.imageFile) {
    fd.append("imageURL", f.imageFile, f.imageFile.name);
  } else if (f.imageURL) {
    fd.append("imageURL", f.imageURL);
  }
  return fd;
}

const CreateCounselor = ({ ele, handleClose, loadCounsellors }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: ele?.name || "",
    course: ele?.course || "",
    experience: ele?.experience || "",
    imageURL: ele?.imageURL || "",
    imageFile: null,
  });

  const [uploads, setUploads] = useState({
    image: { preview: null },
  });

  const [imageValid, setImageValid] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ele && ele._id) {
      setForm({
        name: ele?.name || "",
        course: ele?.course || "",
        experience: ele?.experience || "",
        imageURL: ele?.imageURL || "",
        imageFile: null,
      });
      setUploads({ image: { preview: null } });
      setImageValid(!!ele?.imageURL);
    } else {
      setForm({
        name: "",
        course: "",
        experience: "",
        imageURL: "",
        imageFile: null,
      });
      setUploads({ image: { preview: null } });
      setImageValid(false);
    }
  }, [ele]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageFile: file }));
    setUploads((prev) => ({ ...prev, image: { preview: previewURL } }));
    validateImage(file);
    setErrors((prev) => ({ ...prev, imageURL: undefined }));
  };

  const validateImage = (file) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (ev) => {
      img.src = ev.target.result;
    };

    img.onload = () => {
      if (img.width === 300 && img.height === 250) {
        setImageValid(true);
        toast.success("Valid image uploaded!");
      } else {
        setImageValid(false);
        toast.error("Image dimensions must be 300x250 pixels.");
      }
    };

    img.onerror = () => {
      setImageValid(false);
      toast.error("Invalid image file.");
    };

    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.course.trim()) newErrors.course = "Course is required";
    if (!form.experience.trim()) newErrors.experience = "Experience is required";

    if (!ele?._id && !form.imageFile) {
      newErrors.imageURL = "Image is required";
    }

    if (form.imageFile && !imageValid) {
      newErrors.imageURL = "Image dimensions are invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields with valid image.");
      return;
    }

    try {
      if (ele && ele._id) {
        const fd = counselorFormToFormData(form);
        const res = await dispatch(updateCounselor({ id: ele._id, data: fd }));
        if (updateCounselor.fulfilled.match(res)) {
          toast.success("Counsellor updated successfully!");
          loadCounsellors?.();
          handleClose();
        } else {
          toast.error(
            "Failed to update: " +
              (res.payload?.message || res.error?.message || "Unknown error")
          );
        }
      } else {
        const fd = counselorFormToFormData(form);
        if (!form.imageFile) {
          toast.error("Please upload an image.");
          return;
        }
        const res = await dispatch(createCounselor(fd));
        if (createCounselor.fulfilled.match(res)) {
          toast.success("Counsellor created successfully!");
          loadCounsellors?.();
          handleClose();
        } else {
          toast.error(
            "Failed to create: " +
              (res.payload?.message || res.error?.message || "Unknown error")
          );
        }
      }
    } catch (error) {
      toast.error("Unexpected error: " + error.message);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog" style={{ maxWidth: "800px" }}>
          <div className="modal-content p-4">
            <div className="modal-header">
              <h5 className="modal-title">
                {ele ? "Update Counsellor" : "Create Counsellor"}
              </h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  placeholder="Enter name"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Course</label>
                <input
                  type="text"
                  value={form.course}
                  onChange={(e) => setForm((prev) => ({ ...prev, course: e.target.value }))}
                  className={`form-control ${errors.course ? "is-invalid" : ""}`}
                  placeholder="Enter course"
                />
                {errors.course && <div className="invalid-feedback">{errors.course}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  value={form.experience}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, experience: e.target.value }))
                  }
                  className={`form-control ${errors.experience ? "is-invalid" : ""}`}
                  placeholder="Enter experience"
                />
                {errors.experience && (
                  <div className="invalid-feedback">{errors.experience}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Image</label>
                <p className="small text-muted">Image size should be 300×250 px</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`form-control ${errors.imageURL ? "is-invalid" : ""}`}
                />

                {ele?.imageURL && !uploads.image.preview && (
                  <div className="mt-2">
                    <p className="text-muted small">Current image:</p>
                    <img
                      src={getPreviewUrl(ele.imageURL)}
                      alt="Current"
                      style={{
                        width: "300px",
                        height: "250px",
                        objectFit: "cover",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}

                {uploads.image.preview && (
                  <div className="mt-2">
                    <p className="text-muted small">New image preview:</p>
                    <img
                      src={uploads.image.preview}
                      alt="Preview"
                      style={{
                        width: "300px",
                        height: "250px",
                        objectFit: "cover",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}

                {errors.imageURL && (
                  <div className="invalid-feedback d-block">{errors.imageURL}</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {ele && ele._id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCounselor;
