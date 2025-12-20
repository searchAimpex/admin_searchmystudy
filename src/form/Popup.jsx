import React, { useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useDispatch } from "react-redux";
import { createPopup } from "../slice/popupManagement";
import { app } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const storage = getStorage(app);

const Popup = ({ handleClose, loadCounsellors, ele }) => {
  const dispatch = useDispatch();

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

  // File change handler
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageFile: file, imageURL: "" }));
    setUploads((prev) => ({
      ...prev,
      image: { ...prev.image, preview: previewURL, progress: 0, loading: false },
    }));
    validateImage(file);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Validate image dimensions
  const validateImage = (file) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      if (img.width === 700 && img.height === 800) {
        setImageValid(true);
        toast.success("Valid image uploaded!");
      } else {
        setImageValid(false);
        toast.error("Image dimensions must be 700x800 pixels.");
      }
    };

    img.onerror = () => {
      setImageValid(false);
      toast.error("Invalid image file.");
    };

    reader.readAsDataURL(file);
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

  // Upload image to Firebase
  const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `popup/${file?.name}`);
      const metadata = {
        contentType: file?.type,
        contentDisposition: "inline",
      };

      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      setUploads((prev) => ({
        ...prev,
        image: { ...prev.image, loading: true },
      }));

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploads((prev) => ({
            ...prev,
            image: { ...prev.image, progress },
          }));
        },
        (error) => {
          setUploads((prev) => ({
            ...prev,
            image: { ...prev.image, loading: false, progress: 0 },
          }));
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploads((prev) => ({
            ...prev,
            image: { ...prev.image, loading: false, progress: 100 },
          }));
          resolve(url);
        }
      );
    });
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields with valid image.");
      return;
    }

    let formData = {};
    if (form?.imageFile) {
      console.log("Uploading image:", form.imageFile.name);
      const imageUrl = await uploadImage(form.imageFile);
      formData = { ...form, imageURL: imageUrl };
    } else if (form?.imageURL) {
      formData = { ...form, imageURL: form.imageURL };
    } else {
      toast.error("Please upload an image");
      return;
    }

    console.log("Final formData to dispatch:", formData);

    try { 
        console.log( formData,"-------------------------");
      const res = await dispatch(createPopup(formData));
      console.log( res,"-------------------------");

      if (createPopup.fulfilled.match(res)) {
        toast.success("Popup created successfully!");
        loadCounsellors();
        handleClose();
      } else {
        toast.error("Failed to create Popup");
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
              <h5 className="modal-title">Add Popup</h5>
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
                  value={ele?.title}
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
                {ele?.imageURL && (
                  <div className="mt-2">
                    <img
                      src={ele?.imageURL}
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
                  value={ele?.target}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, target: e.target.value }))
                  }
                >
                  <option value="partner">Partner</option>
                  <option value="Searchmystudy">Searchmystudy</option>
                  <option value="Coursefinder">Coursefinder</option>
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
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Popup;
