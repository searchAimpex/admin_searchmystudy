import React, { useState } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useDispatch } from "react-redux";
import { createTestemonial, fetchTestemonial, updateTestemonial } from "../slice/testemonialsManagementSlice";
import { app } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const storage = getStorage(app);

const UsefullInformation = ({ ele, handleClose, loadCounsellors }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    title: ele?.title || "",
    target: ele?.target || "",
    iconURL: ele?.iconURL || "",
    imageURL: ele?.imageURL || ""
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
      if (img.width === 300 && img.height === 250) {
        setImageValid(true);
        toast.success("Valid image uploaded!");
      } else {
        setImageValid(false);
        toast.error("Image dimensions must be 300x250 pixels.");
        toast.error("Image dimensions must be 300x250 pixels.");
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
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.imageFile && !form.imageURL) newErrors.imageURL = "Image is required";
    if (form.rating < 1 || form.rating > 5) newErrors.rating = "Rating must be between 1 and 5";
    if (!imageValid && form.imageFile) newErrors.imageURL = "Image dimensions are invalid";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload image to Firebase
  const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `counsellors/${file?.name}`);
      const metadata = {
        contentType: file?.type,
        contentDisposition: "inline",
      };

      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      setUploads((prev) => ({ ...prev, image: { ...prev.image, loading: true } }));

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploads((prev) => ({ ...prev, image: { ...prev.image, progress } }));
        },
        (error) => {
          setUploads((prev) => ({ ...prev, image: { ...prev.image, loading: false, progress: 0 } }));
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploads((prev) => ({ ...prev, image: { ...prev.image, loading: false, progress: 100 } }));
          resolve(url);
        }
      );
    });
  };

  // Submit handler
  const handleSubmit = async () => {
    let formData = {};
    if (form?.imageFile) {
      const imageUrl = await uploadImage(form.imageFile);
      formData = { ...form, imageURL: imageUrl };
    } else if (form?.imageURL) {
      formData = { ...form, imageURL: form.imageURL };
    } else {
      toast.error("Please upload an image");
      return;
    }

    try {
      if (ele && ele._id) {
        // Updatecons
        // console.log(formData,"---------------------")
        const res = await dispatch(updateTestemonial({ id: ele._id, data: formData }));
        console.log(res);
        
        if (updateTestemonial.fulfilled.match(res)) {
          toast.success("Counsellor updated successfully!");
          dispatch(fetchTestemonial());
          handleClose();
          loadCounsellors();
        } else {
          toast.error("Failed to update Counsellor");
        }
      } else {
        // Create
        if (!validateForm()) {
          toast.error("Please fill in all required fields with valid image.");
          return;
        }
        console.log(formData,":::::::::::::::::::::::::::;");
        
        const res = await dispatch(createTestemonial(formData));
        console.log(res);
        
        if (res?.meta?.requestStatus == "fulfilled") {
          toast.success("Counsellor created successfully!!");
          loadCounsellors();
          handleClose();
        } else {
          toast.error("Failed to create Counsellor");
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
              <h5 className="modal-title">{ele?._id ? "Update Information" : "Add Information"}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <div className="modal-body grid grid-cols-2 gap-3">
              {/* Title */}
              <div className="mb-3 col-span-2">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className={`form-control ${errors.title ? "is-invalid" : ""}`}
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              {/* Name */}
              <div className="mb-3">
                <label className="form-label">Target *</label>
                <input
                  type="text"
                  value={form.target}
                  onChange={(e) => setForm((prev) => ({ ...prev, target: e.target.value }))}
                  className={`form-control ${errors.target ? "is-invalid" : ""}`}
                />
                {errors.target && <div className="invalid-feedback">{errors.target}</div>}
              </div>

            
          

              {/* Image */}
            

                <div className="mb-3">
                <label className="form-label">Image </label>
                {/* <p className="text-[10px]">Image size should be 300x250 px</p> */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "imageURL")}
                  className={`form-control ${errors.imageURL ? "is-invalid" : ""}`}
                />
                {ele?.imageURL && (
                  <div className="mt-2">
                    <img src={ele?.imageURL} alt="preview" style={{ width: "150px" }} />
                  </div>
                )}
                {errors.imageURL && <div className="invalid-feedback">{errors.imageURL}</div>}
              </div>

                <div className="mb-3">
                <label className="form-label">Icon</label>
                {/* <p className="text-[10px]">Image size should be 300x250 px</p> */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "iconURL")}
                  className={`form-control ${errors.iconURL ? "is-invalid" : ""}`}
                />
                {ele?.iconURL && (
                  <div className="mt-2">
                    <img src={ele?.iconURL} alt="preview" style={{ width: "150px" }} />
                  </div>
                )}
                {errors.iconURL && <div className="invalid-feedback">{errors.iconURL}</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleClose}>Close</button>
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

export default UsefullInformation;
