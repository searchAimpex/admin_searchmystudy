import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { createWebinar, updateWebinar } from "../slice/webinarSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const buildWebinarFormData = (form, imageFile) => {
  const fd = new FormData();
  fd.append("trainer_name", form.trainer_name ?? "");
  fd.append("trainer_profession", form.trainer_profession ?? "");
  fd.append("title", form.title ?? "");
  fd.append("weekday", form.weekday ?? "");
  fd.append("date", form.date ?? "");
  fd.append("timeStart", form.timeStart ?? "");
  fd.append("timeEnd", form.timeEnd ?? "");
  if (imageFile) {
    fd.append("imageURL", imageFile);
  } else if (form.imageURL) {
    fd.append("imageURL", form.imageURL);
  }
  return fd;
};

const CreateWebinar = ({ ele, handleClose, fetchData }) => {
  const dispatch = useDispatch();
  const previewBlobRef = useRef(null);

  const [form, setForm] = useState({
    trainer_name: ele?.trainer_name || "",
    trainer_profession: ele?.trainer_profession || "",
    title: ele?.title || "",
    weekday: ele?.weekday || "",
    date: ele?.date || "",
    timeStart: ele?.timeStart || "",
    timeEnd: ele?.timeEnd || "",
    imageURL: ele?.imageURL || "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(ele?.imageURL || "");
  const [errors, setErrors] = useState({});

  const revokeBlobPreview = () => {
    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current);
      previewBlobRef.current = null;
    }
  };

  useEffect(() => {
    revokeBlobPreview();
    setForm({
      trainer_name: ele?.trainer_name || "",
      trainer_profession: ele?.trainer_profession || "",
      title: ele?.title || "",
      weekday: ele?.weekday || "",
      date: ele?.date || "",
      timeStart: ele?.timeStart || "",
      timeEnd: ele?.timeEnd || "",
      imageURL: ele?.imageURL || "",
    });
    setImageFile(null);
    setImagePreview(ele?.imageURL || "");
  }, [ele]);

  useEffect(() => () => revokeBlobPreview(), []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    revokeBlobPreview();
    const objectUrl = URL.createObjectURL(file);
    previewBlobRef.current = objectUrl;
    setImagePreview(objectUrl);
    setImageFile(file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.trainer_name.trim()) newErrors.trainer_name = "Trainer Name is required";
    if (!form.trainer_profession.trim()) newErrors.trainer_profession = "Trainer Profession is required";
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.weekday.trim()) newErrors.weekday = "Weekday is required";
    if (!form.date.trim()) newErrors.date = "Date is required";
    if (!form.timeStart.trim()) newErrors.timeStart = "Start Time is required";
    if (!form.timeEnd.trim()) newErrors.timeEnd = "End Time is required";
    if (!imageFile && !String(form.imageURL || "").trim()) {
      newErrors.imageURL = "Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const formData = buildWebinarFormData(form, imageFile);

      if (ele && ele._id) {
        const res = await dispatch(updateWebinar({ id: ele._id, data: formData }));
        console.log(res,"res+++++++++++++++++++++++++++++");
        if (updateWebinar.fulfilled.match(res)) {
          toast.success("Webinar updated successfully!");
          handleClose();
          fetchData?.();
        } else if (updateWebinar.rejected.match(res)) {
          toast.error(
            "Failed to update Webinar: " + (res.payload?.message || res.error?.message || "Unknown error")
          );
        }
      } else {
        const res = await dispatch(createWebinar(formData));
        if (createWebinar.fulfilled.match(res)) {
          toast.success("Webinar created");
          handleClose();
          fetchData?.();
        } else if (createWebinar.rejected.match(res)) {
          toast.error(res.payload?.message || res.error?.message || "Webinar creation failed");
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
          <div className="p-20 modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Webinar</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <div className="p-4">
              <div className="col-12 mb-3">
                <label className="form-label">Trainer Name</label>
                <input
                  type="text"
                  value={form.trainer_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, trainer_name: e.target.value }))}
                  className={`form-control ${errors.trainer_name ? "is-invalid" : ""}`}
                />
                {errors.trainer_name && <div className="invalid-feedback">{errors.trainer_name}</div>}
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Trainer Profession</label>
                <input
                  type="text"
                  value={form.trainer_profession}
                  onChange={(e) => setForm((prev) => ({ ...prev, trainer_profession: e.target.value }))}
                  className={`form-control ${errors.trainer_profession ? "is-invalid" : ""}`}
                />
                {errors.trainer_profession && <div className="invalid-feedback">{errors.trainer_profession}</div>}
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className={`form-control ${errors.title ? "is-invalid" : ""}`}
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Weekday</label>
                <input
                  type="text"
                  value={form.weekday}
                  onChange={(e) => setForm((prev) => ({ ...prev, weekday: e.target.value }))}
                  className={`form-control ${errors.weekday ? "is-invalid" : ""}`}
                />
                {errors.weekday && <div className="invalid-feedback">{errors.weekday}</div>}
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Select Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  className={`form-control form-control-lg ${errors.date ? "is-invalid" : ""}`}
                />
                {errors.date && <div className="invalid-feedback">{errors.date}</div>}
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  value={form.timeStart}
                  onChange={(e) => setForm((prev) => ({ ...prev, timeStart: e.target.value }))}
                  className={`form-control form-control-lg ${errors.timeStart ? "is-invalid" : ""}`}
                />
                {errors.timeStart && <div className="invalid-feedback">{errors.timeStart}</div>}
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  value={form.timeEnd}
                  onChange={(e) => setForm((prev) => ({ ...prev, timeEnd: e.target.value }))}
                  className={`form-control form-control-lg ${errors.timeEnd ? "is-invalid" : ""}`}
                />
                {errors.timeEnd && <div className="invalid-feedback">{errors.timeEnd}</div>}
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`form-control form-control-lg ${errors.imageURL ? "is-invalid" : ""}`}
                />
                <p style={{ color: "red" }}>Image Size should be 1200x600 px</p>

                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="preview" style={{ maxWidth: "100%", width: 500 }} />
                  </div>
                )}
                {errors.imageURL && <div className="invalid-feedback d-block">{errors.imageURL}</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                {ele && ele._id ? "Update webinar" : "Create Webinar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateWebinar;
