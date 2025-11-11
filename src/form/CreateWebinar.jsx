import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createWebinar, updateWebinar } from "../slice/webinarSlice";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {  toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const storage = getStorage(app);

const CreateWebinar = ({ ele, handleClose,fetchData }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    trainer_name: ele?.trainer_name || "",
    trainer_profession: ele?.trainer_profession || '',
    title: ele?.title || '',
    weekday: ele?.weekday || '',
    date: ele?.date || '',
    timeStart: ele?.timeStart || "",
    timeEnd: ele?.timeEnd || "",
    imageURL: ele?.imageURL || ''
  });

  const [uploads, setUploads] = useState({
    image: { progress: 0, preview: null, name: "", loading: false },
  });

  const [errors, setErrors] = useState({});

  // Firebase upload
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setUploads((prev) => ({
      ...prev,
      image: { ...prev.image, loading: true, name: file.name, preview: previewURL },
    }));

    const storageRef = ref(storage, `webinar/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploads((prev) => ({ ...prev, image: { ...prev.image, progress } }));
      },
      (error) => {
        console.error("Upload error:", error);
        toast.error("Failed to upload image");
        setUploads((prev) => ({
          ...prev,
          image: { progress: 0, preview: null, name: "", loading: false },
        }));
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setForm((prev) => ({ ...prev, imageURL: url }));
        setUploads((prev) => ({ ...prev, image: { ...prev.image, loading: false, progress: 100 } }));
        toast.success("Image uploaded successfully!");
      }
    );
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
    if (!form.imageURL.trim()) newErrors.imageURL = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      console.log("Form Data:", form);

      if (ele && ele._id) {
        // Update existing webinar
        
        const res = await dispatch(updateWebinar({ id: ele._id, data: form }));
        
        console.log(res);
        if (updateWebinar.fulfilled.match(res)) {
          alert("Webinar updated successfully!");
          handleClose();
          fetchData()
        } else if (updateWebinar.rejected.match(res)) {
          alert("Failed to update Webinar: " + (res.payload?.message || res.error.message || "Unknown error"));
        }
      } else {
        const res = await dispatch(createWebinar(form))
        if (res.type === "blogs/createBlog/fulfilled") {
          // alert("✅ Webinar created:", res.payload);
          handleClose()
          fetchData()
          // show success toast / redirect
        } else if (res.type === "blogs/createBlog/rejected") {
          toast.error("❌ Webinar creation failed:", res.error?.message || "Unknown error");
          // show error toast
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
              {/* Trainer Name */}
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

              {/* Trainer Profession */}
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

              {/* Title */}
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

              {/* Weekday */}
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

              {/* Date */}
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

              {/* Start Time */}
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

              {/* End Time */}
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

              {/* Image Upload */}
              <div className="col-12 mb-3">
                <label className="form-label">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "imageURL")}
                  className={`form-control form-control-lg ${errors.imageURL ? "is-invalid" : ""}`}
                />
                <p style={{ color: "red" }}>Image Size should be 1200x600 px</p>

                {ele?.imageURL && (
                  <div className="mt-2">
                    <img src={ele?.imageURL} alt="preview" style={{ width: "500px" }} />
                    <div>Upload Progress: {Math.round(uploads.image.progress)}%</div>
                  </div>
                )}
                {errors.imageURL && <div className="invalid-feedback">{errors.imageURL}</div>}
              </div>
            </div>

            {/* Footer */}
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
