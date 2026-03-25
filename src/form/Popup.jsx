import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createPopup, updatePopup } from "../slice/popupManagement";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Popup = ({ handleClose, loadCounsellors, ele }) => {
  const dispatch = useDispatch();
// console.log(ele,"ele+++++++++++++++++++++++++++++++++++++");
  const [form, setForm] = useState({
    title: ele?.title || "",
    imageURL: ele?.imageURL || "",
    imageFile:ele?.imageFile||  null,
    target:ele?.target ||  "partner", 
  });

  const [uploads, setUploads] = useState({
    image: { progress: 0, preview: null, loading: false },
  });

  const [imageValid, setImageValid] = useState(false);
  const [errors, setErrors] = useState({});

  const resolvePreviewUrl = (url) => {
    if (!url) return "";
    if (
      url.startsWith("blob:") ||
      url.startsWith("data:") ||
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }
    if (url.startsWith("/")) return `https://backend.searchmystudy.com${url}`;
    return `https://backend.searchmystudy.com/${url}`;
  };

  // File change handler
  
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setImageValid(false); // validateImage runs async
    setForm((prev) => ({ ...prev, imageFile: file, imageURL: "" }));
    setUploads((prev) => ({
      ...prev,
      image: { ...prev.image, preview: previewURL, progress: 0, loading: false },
    }));
    validateImage(file).then((valid) => {
      setImageValid(valid);
      if (valid) toast.success("Valid image uploaded!");
      else toast.error("Image dimensions must be 700x800 pixels.");
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };



  // Validate image dimensions
  const validateImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => resolve(img.width === 700 && img.height === 800);
      img.onerror = () => resolve(false);

      reader.readAsDataURL(file);
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.imageFile && !form.imageURL)
      newErrors.imageURL = "Image is required";
    if (!imageValid && form.imageFile)
      newErrors.imageURL = "Image dimensions are invalid";
    if (!form.target) newErrors.target = "Target is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (form.imageFile) {
      const valid = await validateImage(form.imageFile);
      setImageValid(valid);
      if (!valid) {
        setErrors((prev) => ({ ...prev, imageURL: "Image dimensions are invalid" }));
        toast.error("Image dimensions must be 700x800 pixels.");
        return;
      }
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields with valid image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("target", form.target);

    // Important: send `imageURL` in FormData.
    if (form?.imageFile) {
      formData.append("imageURL", form.imageFile);
    } else if (form?.imageURL) {
      formData.append("imageURL", form.imageURL);
    } else {
      toast.error("Please upload an image");
      return;
    }
  
    try {
      if (ele?._id) {
        const res = await dispatch(updatePopup({ id: ele._id, data: formData }));
        console.log(res,"+++++++++++++++++++++++++++++++++++++");
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Popup updated successfully!");
          loadCounsellors?.();
          handleClose?.();
        } else {
          toast.error(
            res?.payload?.message ||
              res?.error?.message ||
              "Failed to update Popup"
          );
        }
      } else {
        const res = await dispatch(createPopup(formData));
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Popup created successfully!");
          loadCounsellors?.();
          handleClose?.();
        } else {
          toast.error(
            res?.payload?.message ||
              res?.error?.message ||
              "Failed to create Popup"
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
      <div
        className="modal d-block"
        style={{ background: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog" style={{ maxWidth: "800px" }}>
          <div className="modal-content p-4">
            <div className="modal-header">
              <h5 className="modal-title">{ele?._id ? "Edit Popup" : "Add Popup"}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              ></button>
            </div>

            <div className="modal-body grid grid-cols-2 gap-3">
              {/* Title */}
              <div className="mb-3 col-span-2">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className={`form-control ${
                    errors.title ? "is-invalid" : ""
                  }`}
                />
                {errors.title && (
                  <div className="invalid-feedback">{errors.title}</div>
                )}
              </div>

              {/* Image */}
              <div className="mb-3">
                <label className="form-label">Image *</label>
                <p className="text-[10px]">Image size should be 700x800 px</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "imageURL")}
                  className={`form-control ${
                    errors.imageURL ? "is-invalid" : ""
                  }`}
                />
                {(uploads.image.preview || ele?.imageURL || form.imageURL) && (
                  <div className="mt-2">
                    <img
                      src={resolvePreviewUrl(uploads.image.preview || ele?.imageURL || form.imageURL)}
                      alt="preview"
                      style={{ width: "150px" }}
                    />
                  </div>
                )}
                {errors.imageURL && (
                  <div className="invalid-feedback">{errors.imageURL}</div>
                )}
              </div>

              {/* Target Dropdown */}
              <div className="mb-3 col-span-2">
                <label className="form-label">Target *</label>
                <select
                  className={`form-select ${
                    errors.target ? "is-invalid" : ""
                  }`}
                  value={form.target}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, target: e.target.value }))
                  }
                >
                  <option value="partner">Partner</option>
                  <option value="Searchmystudy">Searchmystudy</option>
                  <option value="franchise">Franchise</option>
                </select>
                {errors.target && (
                  <div className="invalid-feedback">{errors.target}</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {ele?._id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Popup;
