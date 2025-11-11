import React, { useState, useEffect } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useDispatch } from "react-redux";
import { createTestemonial, fetchTestemonial  , updateTestemonial } from "../slice/testemonialsManagementSlice";
import { app } from "../firebase";
import {  ToastContainer } from "react-toastify";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createCounselor, updateCounselor } from "../slice/CounselorManagerSlice";

const storage = getStorage(app);

const CreateCounselor = ({ ele, handleClose, loadCounsellors }) => {
  const dispatch = useDispatch();
  // console.log(ele);
  

  const [form, setForm] = useState({
    name: ele?.name || "",
    course: ele?.course || "",
    experience: ele?.experience || "",
    imageURL: ele?.imageURL || "",
  });

  const [uploads, setUploads] = useState({
    image: { progress: 0, preview: null, loading: false },
  });

  const [imageValid, setImageValid] = useState(false);
  const [errors, setErrors] = useState({});

  // Update form when ele prop changes (for editing existing testimonials)
  useEffect(() => {
    if (ele && ele._id) {
      setForm({
        name: ele?.name || "",
        course: ele?.course || "",
        experience: ele?.experience || "",
        imageURL: ele?.imageURL || "",
      });
      
      // If there's an existing image, set it as valid
      if (ele?.imageURL) {
        setImageValid(true);
      }
    }
  }, [ele]);

  // Handle file selection
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageFile: file, imageUrl: "" }));
    setUploads((prev) => ({ ...prev, image: { ...prev.image, preview: previewURL, progress: 0, loading: false } }));
    validateImage(file); // validate dimensions
    setErrors((prev) => ({ ...prev, [field]: "" }));
    // console.log(form);

  };

  // Validate image dimensions (example: 1200x600 px)
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

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.course.trim()) newErrors.course = "Course is required";
    if (!form.experience.trim()) newErrors.experience = "Experience is required";
    
    // For new testimonials, image is required
    // For existing testimonials, either existing image or new image is fine
    if (!ele?._id && !form.imageFile) {
      newErrors.imageURL = "Image is required";
    }
    
    // Only validate dimensions if a new image is uploaded
    if (form.imageFile && !imageValid) {
      newErrors.imageURL = "Image dimensions are invalid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `counsellors/${file?.name}`);

      const metadata = {
        contentType: file?.type,          // sets correct MIME type
        contentDisposition: "inline",    // ensures browser opens in new tab
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


  //   const handleSubmit = async () => {
  //     console.log("Form Data:", form);
  //     console.log(form.imageURL);
  //     let formData = {}
  //     console.log(ele);

  //     try {
  // if(form.imageURL){
  //             const imageUrl = await uploadImage(form.imageFile);
  //             formData = {
  //               name: form.name,
  //               course: form.course,
  //               experience: form.experience,
  //               imageURL: imageUrl,
  //             }
  //         } else{
  //             alert("Please upload an image")
  //         }

  //          if (ele && ele._id) {
  //               console.log("FORM DATA", formData);

  //               // Update existing webinar
  //               const res = await dispatch(updateCounsellor({id:ele._id,data:formData}));
  //               console.log(res);


  //               if (updateCounsellor.fulfilled.match(res)) {
  //                 alert("Counsellor updated successfully!");
  //                 handleClose();
  //               } else if (updateCounsellor.rejected.match(res)) {
  //                 alert("Failed to update Counsellor: " + (res.payload?.message || res.error.message || "Unknown error"));
  //               }
  //             } else {
  //                if (!validateForm()) {
  //       toast.error("Please fill in all required fields with valid image.");
  //       return;
  //     }
  //               // Create new counsellor
  //               const res = await dispatch(createCounsellor(formData));
  //             handleClose();

  //               if (createCounsellor.fulfilled.match(res)) {
  //                 alert("Counsellor created successfully!");
  //                 handleClose();
  //               } else if (createCounsellor.rejected.match(res)) {
  //                 alert("Failed to create Counsellor: " + (res.payload?.message || res.error.message || "Unknown error"));
  //               }
  //             }
  //     }
  //      catch (error) {
  //       toast.error("Unexpected error: " + error.message);
  //     }
  //   };


  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields with valid image.");
      return;
    }

    let formData = {
      name: form?.name,
      course: form?.course,
      experience: form?.experience,
    };

    try {
      if (ele && ele._id) {
        // Update existing testimonial
        if (form?.imageFile) {
          // Upload new image if provided
          const imageUrl = await uploadImage(form.imageFile);
          formData.imageURL = imageUrl;
        } else {
          // Keep existing image if no new image uploaded
          formData.imageURL = ele?.imageURL;
        }

        const res = await dispatch(updateCounselor({ id: ele._id, data: formData }));       
        if (updateCounselor.fulfilled.match(res)) {
          toast.success("Testimonial updated successfully!");
          dispatch(fetchTestemonial());
          handleClose();
          loadCounsellors();
        } else {
          toast.error("Failed to update Testimonial: " + (res.payload?.message || res.error.message || "Unknown error"));
        }
      } else {
        // Create new testimonial
        if (!form?.imageFile) {
          toast.error("Please upload an image for new testimonials.");
          return;
        }
        
        const imageUrl = await uploadImage(form.imageFile);
        formData.imageURL = imageUrl;
        
        const res = await dispatch(createCounselor(formData));
        
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Testimonial created successfully!");
          loadCounsellors();
          handleClose();
        } else {
          toast.error("Failed to create Testimonial: " + (res.payload?.message || res.error.message || "Unknown error"));
        }
      }
    } catch (error) {
      toast.error("Unexpected error: " + error.message);
    }
  }
  return (
    <>
      <ToastContainer />
      <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog" style={{ maxWidth: "800px" }}>
          <div className="modal-content p-4">
            <div className="modal-header">
              <h5 className="modal-title">{ele?"Update Testemonial":"Create Testemonial"}</h5>
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
                  onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))}
                  className={`form-control ${errors.experience ? "is-invalid" : ""}`}
                  placeholder="Enter experience"
                />
                {errors.experience && <div className="invalid-feedback">{errors.experience}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Image</label>
                <p className="text-[10px]">Image size should be 300x250 px</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "imageUrl")}
                  className={`form-control ${errors.imageUrl ? "is-invalid" : ""}`}
                />
                {/* Show existing image preview */}
                {ele?.imageURL && !uploads.image.preview && (
                  <div className="mt-2">
                    <p className="text-muted text-sm">Current image:</p>
                    <img 
                      src={ele?.imageURL} 
                      alt="Current testimonial" 
                      style={{ 
                        width: '300px', 
                        height: '250px', 
                        objectFit: 'cover',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }} 
                    />
                  </div>
                )}
                
                {/* Show new image preview */}
                {uploads.image.preview && (
                  <div className="mt-2">
                    <p className="text-muted text-sm">New image preview:</p>
                    <img 
                      src={uploads.image.preview} 
                      alt="New testimonial preview" 
                      style={{ 
                        width: '300px', 
                        height: '250px', 
                        objectFit: 'cover',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }} 
                    />
                  </div>
                )}
                
                {/* Show upload progress */}
                {uploads.image.loading && (
                  <div className="mt-2">
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploads.image.progress}%` }}
                      >
                        {Math.round(uploads.image.progress)}%
                      </div>
                    </div>
                  </div>
                )}
                {errors.imageURL && <div className="invalid-feedback">{errors.imageURL}</div>}
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
