import React, { useEffect, useState } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useDispatch, useSelector } from "react-redux";
import { createTestemonial, fetchTestemonial, updateTestemonial } from "../slice/testemonialsManagementSlice";
import { app } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Modal,
  Button,
  Form,
  Accordion,
  Card,
  Row,
  Col
} from 'react-bootstrap';
import TextEditor from "./TextEditor";
import { createInformation, fetchInformation, updateInformation } from "../slice/UsefullInfocatiion";
import { fetchCountry } from "../slice/CountrySlicr";
const storage = getStorage(app);

const UsefullInformation = ({ ele, handleClose, loadData }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    title: ele?.title || "",
    target1: ele?.target1 || false,
    target: ele?.target || false,
    iconURL: ele?.iconURL || "",
    imageURL: ele?.imageURL || "",
    description: ele?.description || "",
    imageFile: null,
    iconFile: null
  });

  const [uploads, setUploads] = useState({
    image: { progress: 0, preview: null, loading: false },
    icon: { progress: 0, preview: null, loading: false },
  });

  const [imageValid, setImageValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const countries = useSelector(
    (state) => state.country.country||[]
  );
  const fetchCountryData = async ()=>{
    const a = await dispatch(fetchCountry());
  // console.log(a,"+++++++++++++++++++++++++++++");  
  }
  useEffect(() => {
    fetchCountryData();
  }, []);

  // Sync form from ele when opening edit (so iconURL and other fields show correctly)
  useEffect(() => {
    if (!ele) return;
    setForm((prev) => ({
      ...prev,
      title: ele.title ?? prev.title,
      target1: ele.target1 ?? prev.target1,
      target: ele.target ?? prev.target,
      iconURL: ele.iconURL ?? prev.iconURL,
      imageURL: ele.imageURL ?? prev.imageURL,
      description: ele.description ?? prev.description,
      imageFile: null,
      iconFile: null,
    }));
    setUploads((prev) => ({
      ...prev,
      image: { ...prev.image, preview: ele.imageURL || null },
      icon: { ...prev.icon, preview: ele.iconURL || null },
    }));
  }, [ele?._id]);

  // File change handler – updates form state for both image and icon
  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    if (field === "imageURL") {
      setForm((prev) => ({ ...prev, imageFile: file, imageURL: "" }));
      setUploads((prev) => ({
        ...prev,
        image: { ...prev.image, preview: previewURL, progress: 0, loading: false },
      }));
      validateImage(file);
    } else if (field === "iconURL") {
      setForm((prev) => ({ ...prev, iconFile: file, iconURL: "" }));
      setUploads((prev) => ({
        ...prev,
        icon: { ...prev.icon, preview: previewURL, progress: 0, loading: false },
      }));
    }
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

  // Validate form – all fields from form state
  const validateForm = () => {
    const newErrors = {};
    if (!form.title?.trim()) newErrors.title = "Title is required";
    if (!form.target1 && !form.target) newErrors.target = "Select at least one target";
    if (!form.imageFile && !form.imageURL) newErrors.imageURL = "Image is required";
    if (!imageValid && form.imageFile) newErrors.imageURL = "Image dimensions are invalid";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload file to Firebase (image or icon)
  const uploadFile = async (file, field) => {
    const folder = field === "icon" ? "icons" : "counsellors";
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `${folder}/${file?.name}`);
      const metadata = {
        contentType: file?.type,
        contentDisposition: "inline",
      };

      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      setUploads((prev) => ({ ...prev, [field]: { ...prev[field], loading: true } }));

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploads((prev) => ({ ...prev, [field]: { ...prev[field], progress } }));
        },
        (error) => {
          setUploads((prev) => ({ ...prev, [field]: { ...prev[field], loading: false, progress: 0 } }));
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploads((prev) => ({ ...prev, [field]: { ...prev[field], loading: false, progress: 100 } }));
          resolve(url);
        }
      );
    });
  };

const handleSubmit = async () => {
  if (loading) return;
  setLoading(true);
  const toastId = toast.loading(
    ele ? "Updating information..." : "Creating information..."
  );

  try {
    let formData = {
      title: form.title,
      target1: form.target1,
      target: form.target,
      description: form.description,
    };
    // Image upload
    if (form?.imageFile) {
      formData.imageURL = await uploadFile(form.imageFile, "image");
    } else if (form?.imageURL) {
      formData.imageURL = form.imageURL;
    } else {
      throw new Error("Please upload an image");
    }

    // Icon upload (optional)
    if (form?.iconFile) {
      formData.iconURL = await uploadFile(form.iconFile, "icon");
    } else if (form?.iconURL) {
      formData.iconURL = form.iconURL;
    }
    
    let res;
    
    if (ele && ele._id) {
      // UPDATE
      res = await dispatch(
        updateInformation({ id: ele._id, data: formData })
      );
      
      if (res.meta.requestStatus !== "fulfilled") {
        throw new Error("Failed to update information alert");
      }
      
      toast.success("Information updated successfully!", { id: toastId });
      dispatch(fetchInformation());
    } else {
      // CREATE
      if (!validateForm()) {
        throw new Error("Please fill all required fields.");
      }
      
      res = await dispatch(createInformation(formData));
      console.log(formData,"+++++++++++++++++")

      if (res.meta.requestStatus !== "fulfilled") {
        throw new Error("Failed to create information alert");
      }

      toast.success("Information created successfully!", { id: toastId });
    }

    handleClose();
    loadData();

  } catch (error) {
    toast.error(error.message || "Something went wrong", {
      id: toastId,
    });
  } finally {
    setLoading(false);
  }
};


  const handleContentChange = (value) => {
    setForm((prev) => ({ ...prev, description: value }));
    setErrors((prev) => ({ ...prev, description: "" }));
  };

  return (
    <>
      <ToastContainer />
      <style>{`
        .professional-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        .professional-modal-content {
          background: #ffffff;
          border-radius: 12px;
          // box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          max-width: 800px;
          width: 95%;
          max-height: 90vh;
          overflow-y: auto;
        }
       
        .professional-modal-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .professional-modal-body {
          padding:0px 32px;
        }
        .form-section {
          margin-bottom: 28px;
        }
        .form-section:last-of-type {
          margin-bottom: 0;
        }
        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
          display: block;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-label .required {
          color: #ef4444;
          margin-left: 4px;
        }
        .form-control {
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 14px;
          transition: all 0.3s ease;
          background-color: #f9fafb;
        }
      
        .form-control.is-invalid {
          border-color: #ef4444;
          background-color: #fef2f2;
        }
        .invalid-feedback {
          display: block;
          color: #ef4444;
          font-size: 12px;
          margin-top: 6px;
          font-weight: 500;
        }
        .form-check {
          padding: 0;
          margin: 0;
        }
        .form-check-input {
          width: 18px;
          height: 18px;
          margin-top: 3px;
          margin-right: 8px;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }
       
        .form-check-label {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          user-select: none;
        }
        .radio-group {
          display: flex;
          gap: 24px;
          margin-top: 12px;
        }
       
        
        .upload-emoji {
          font-size: 32px;
          margin-bottom: 12px;
          display: block;
          animation: bounce 2s infinite;
        }
        
        .upload-text-secondary {
          font-size: 12px;
          color: #6b7280;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .preview-container {
          margin-top: 16px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .preview-item {
          position: relative;
        }
        .preview-item img {
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          max-height: 140px;
          width: 140px;
          object-fit: cover;
          // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .preview-item-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }
        .preview-item:hover .preview-item-overlay {
          opacity: 1;
        }
        .progress-bar-container {
          margin-top: 12px;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }
      
        .professional-modal-footer {
          background: #f9fafb;
          padding: 20px 32px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #e5e7eb;
          border-radius: 0 0 12px 12px;
        }
        .btn-close-modal {
          background: #ffffff;
          color: #6b7280;
          border: 1.5px solid #e5e7eb;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-close-modal:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #d1d5db;
          color: #374151;
        }
       
        .btn-submit-modal:hover:not(:disabled) {
          transform: translateY(-2px);
          // box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
        }
        .btn-submit-modal:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .spinner-icon {
          display: inline-block;
          width: 14px;
          height: 14px;
          margin-right: 8px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .close-btn-icon {
          background: rgba(255, 255, 255, 0.2);
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-btn-icon:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .two-col-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .icon-upload-wrapper {
          position: relative;
        }
      
        @media (max-width: 600px) {
          .two-col-grid {
            grid-template-columns: 1fr;
          }
          .professional-modal-content {
            width: 100%;
            max-height: 100vh;
            border-radius: 12px 12px 0 0;
          }
          .radio-group {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>

      <div className="professional-modal-overlay">
        <div className="professional-modal-content">
          <div className="profesional-modal-header">
            <h5 className="professioal-modal-title">
              {ele?._id ? "📝 Update Information" : "Add Information"}
            </h5>
            <button 
              type="button" 
              className="close-btn-icon"
              onClick={handleClose} 
              disabled={loading}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="professional-modal-body">
            {/* Title Section */}
            <div className="form-section">
              <label className="form-label">
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                placeholder="Enter information title"
                disabled={loading}
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            {/* Target Section */}
            <div className="form-section">
              <label className="form-label">
                Select Target <span className="required">*</span>
              </label>
              <div className="radio-group">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="target1"
                    checked={form.target1}
                    onChange={(e) => setForm((prev) => ({ ...prev, target1: e.target.checked }))}
                    className={`form-check-input ${errors.target ? "is-invalid" : ""}`}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="target1">
                    Partner
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="target"
                    checked={form.target}
                    onChange={(e) => setForm((prev) => ({ ...prev, target: e.target.checked }))}
                    className={`form-check-input ${errors.target ? "is-invalid" : ""}`}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="target">
                    Franchise
                  </label>
                </div>
              </div>
              {errors.target && <div className="invalid-feedback">{errors.target}</div>}
            </div>

            {/* Description Section */}
            <div className="form-section">
              <label className="form-label">Description</label>
              <TextEditor name="description" content={form?.description} setContent={handleContentChange} />
            </div>

           <div className="mb-3">
                <label className="form-label">Image </label>
                {/* <p className="text-[10px]">Image size should be 300x250 px</p> */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "imageURL")}
                  className={`form-control ${errors.imageURL ? "is-invalid" : ""}`}
                  disabled={loading}
                />
                {(uploads.image.preview || form.imageURL) && (
                  <div className="mt-2">
                    <img src={uploads.image.preview || form.imageURL} alt="preview" style={{ width: "150px" }} />
                  </div>
                )}
                {errors.imageURL && <div className="invalid-feedback">{errors.imageURL}</div>}
              </div>

                <div className="mb-3">
                <label className="form-label">Country (Icon URL)</label>
                <select
                  name="iconURL"
                  value={form.iconURL || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, iconURL: e.target.value }))}
                  className="form-control"
                  disabled={loading}
                >
                  <option value="">Select Country</option>
                  {(countries || []).map((c) => (
                    <option key={c._id} value={c.flagURL || ""}>{c.name}</option>
                  ))}
                </select>
                {form.iconURL && (
                  <div className="mt-2">
                    <img src={form.iconURL} alt="Flag" style={{ width: "32px", height: "auto" }} />
                  </div>
                )}
              </div>
          </div>

          <div className="professional-modal-footer">
            <button 
              className="btn-close-modal" 
              onClick={handleClose} 
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn-submit-modal" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-icon"></span>
                  {ele && ele._id ? "Updating..." : "Creating..."}
                </>
              ) : (
                ele && ele._id ? "💾 Update" : "➕ Create"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UsefullInformation;
