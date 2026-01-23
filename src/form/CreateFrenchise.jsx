import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createWebinar, updateWebinar } from "../slice/webinarSlice";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createPartner, updatePartner } from "../slice/PartnerSlice";

const storage = getStorage(app);

const CreateFrenchise = ({ ele, handleClose, fetchData }) => {
  const dispatch = useDispatch();
  console.log(ele);

  const [showPassword, setShowPassword] = useState(false);

  const [formValues, setFormValues] = useState({
    email: ele?.email || '',
    password: ele?.password || '',
    role: ele?.role || 'franchise',
    name: ele?.name || 'Null',
    OwnerName: ele?.OwnerName || '',
    OwnerFatherName: ele?.OwnerFatherName || '',
    InsitutionName: ele?.InsitutionName || '',
    ContactNumber: ele?.ContactNumber || '',
    WhatsAppNumber: ele?.WhatappNumber || '',
    CenterCode: ele?.CenterCode || '',
    DateOfBirth: ele?.DateOfBirth || '',
    city: ele?.city || '',
    state: ele?.state || '',
    zipCode: ele?.zipCode || '',
    address: ele?.address || '',
    FrontAdhar: ele?.FrontAdhar || null,
    BackAdhar: ele?.BackAdhar || null,
    PanCard: ele?.PanCard || null,
    ProfilePhoto: ele?.ProfilePhoto || null,
    VisitOffice: ele?.VistOffice || '',
    OfficePhoto: ele?.OfficePhoto || null,
    OwnerPhoto: ele?.OwnerPhoto || null,
    CancelledCheck: ele?.CancelledCheck || null,
    Logo: ele?.Logo || null,
    accountedDetails: ele?.accountedDetails || '',
    IFSC: ele?.IFSC || '',
    bankName: ele?.bankName || '',
    passwordTracker: ele?.passwordTracker || '',
    mou: ele?.mou || '',
    registration: ele?.registration || '',
  });
  // console.log(formValues)
  const [uploads, setUploads] = useState({
    FrontAdhar: { progress: 0, preview: formValues.FrontAdhar || null, loading: false },
    BackAdhar: { progress: 0, preview: formValues.BackAdhar || null, loading: false },
    PanCard: { progress: 0, preview: formValues.PanCard || null, loading: false },
    ProfilePhoto: { progress: 0, preview: formValues.ProfilePhoto || null, loading: false },
    OwnerPhoto: { progress: 0, preview: formValues.OwnerPhoto || null, loading: false },
    OfficePhoto: { progress: 0, preview: formValues.OfficePhoto || null, loading: false },
    CancelledCheck: { progress: 0, preview: formValues.CancelledCheck || null, loading: false },
    Logo: { progress: 0, preview: formValues.Logo || null, loading: false },
    mou: { progress: 0, preview: formValues.mou || null, loading: false },
    registration: { progress: 0, preview: formValues.registration || null, loading: false },
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], loading: true, preview: previewURL } }));

    const storageRef = ref(storage, `partners/${fieldName}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], progress } }));
      },
      (error) => {
        console.error("Upload error:", error);
        toast.error("Failed to upload " + fieldName);
        setUploads(prev => ({ ...prev, [fieldName]: { progress: 0, preview: null, loading: false } }));
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setFormValues(prev => ({ ...prev, [fieldName]: url }));
        setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], loading: false, progress: 100, preview: url } }));
        toast.success(`${fieldName} uploaded`);
      }
    );
  };

const validateForm = () => {
  const newErrors = {};

  if (!formValues.name?.trim()) {
    newErrors.name = "Name is required";
  }

  if (!formValues.email?.trim()) {
    newErrors.email = "Email is required";
  }

  if (!formValues.ContactNumber?.trim()) {
    newErrors.ContactNumber = "Contact number is required";
  }

  // 🔐 Password validation (only when creating OR when user enters password)
  if (!ele?._id || formValues.password) {
    if (!formValues.password || formValues.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = async () => {
    // if (!validateForm()) {
    //   toast.error("Please fill required fields");
    //   return;
    // }

    try {

      // send formValues to your create/update action
      // console.log(formValues);

      console.log(formValues, "++++++++++++++++++++++++++++++++++++")
      if (ele && ele._id) {
        const res = await dispatch(updatePartner({ id: ele._id, data: formValues }));
        // console.log(res);
        if (updatePartner.fulfilled.match(res)) {
          toast.success("Partner updated");
          handleClose();
          fetchData?.();
        } else {
          toast.error("Update failed");
        }
      } else {
        const res = await dispatch(createPartner(formValues));
        console.log(res.payload)
        if (res?.type?.endsWith("/fulfilled")) {
          toast.success("Partner created");
          handleClose();
          fetchData?.();
        } else {

          toast.error(res?.payload?.message);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog" style={{ maxWidth: 900 }}>
          <div className="modal-content p-20">
            <div className="modal-header">
              <h5 className="modal-title">{ele ? "Edit Partner" : "Create"}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Owner Name</label>
                  <input name="OwnerName" value={formValues.OwnerName} onChange={handleInputChange} className="form-control" />
                </div>


                <div className="col-md-6">
                  <label className="form-label">Owner Father's Name</label>
                  <input name="OwnerFatherName" value={formValues.OwnerFatherName} onChange={handleInputChange} className="form-control" />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Institution Name</label>
                  <input name="InsitutionName" value={formValues.InsitutionName} onChange={handleInputChange} className="form-control" />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Contact Number</label>
                  <input name="ContactNumber" maxLength={10} value={formValues.ContactNumber} onChange={handleInputChange} className={`form-control ${errors.ContactNumber ? "is-invalid" : ""}`} />
                  {errors.ContactNumber && <div className="invalid-feedback">{errors.ContactNumber}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label">WhatsApp Number</label>
                  <input name="WhatsAppNumber" maxLength={10} value={formValues.WhatsAppNumber} onChange={handleInputChange} className="form-control" />
                </div>


                <div className="col-md-4">
                  <label className="form-label">Center Code</label>
                  <input name="CenterCode" maxLength={8} value={formValues.CenterCode} onChange={handleInputChange} className="form-control" />
                </div>



                <div className="col-md-4">
                  <label className="form-label">Date Of Birth</label>
                  <input type="date" name="DateOfBirth" value={formValues.DateOfBirth} onChange={handleInputChange} className="form-control" />
                </div>


                <div className="col-md-6">
                  <label className="form-label">Type</label>

                  <select
                    name="role"
                    value={formValues.role}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="partner" selected>Partner</option>
                    <option value="franchise" disabled>Franchise</option>
                  </select>
                </div>

                <div className="col-m d-6" style={{ width: "100%" }}>
                  <label className="form-label">Email</label>
                  <input name="email" style={{ width: "100%" }} value={formValues.email} onChange={handleInputChange} className={`form-control ${errors.email ? "is-invalid" : ""}`} />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                   className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    value={formValues.passwordTracker || formValues.password}
                     minLength={8}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* 
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input name="name" value={formValues.name} onChange={handleInputChange} className={`form-control ${errors.name ? "is-invalid" : ""}`} />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div> */}











                <div className="col-md-4">
                  <label className="form-label">City</label>
                  <input name="city" value={formValues.city} onChange={handleInputChange} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">State</label>
                  <input name="state" value={formValues.state} onChange={handleInputChange} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Zip Code</label>
                  <input name="zipCode" maxLength={6} type="number" value={formValues.zipCode} onChange={handleInputChange} className="form-control" />
                </div>

                <div className="col-12">
                  <label className="form-label">Address</label>
                  <textarea name="address" value={formValues.address} onChange={handleInputChange} className="form-control" />
                </div>




                {/* Bank details */}
                {/* <div className="">
                  <label className="form-label">Accounted Details</label>
                  <input name="accountedDetails" value={formValues.accountedDetails} onChange={handleInputChange} className="form-control" />
                </div> */}
                {/* <div className="col-md-4">
                  <label className="form-label">IFSC</label>
                  <input name="IFSC" value={formValues.IFSC} onChange={handleInputChange} className="form-control" />
                </div> */}
                {/* <div className="col-md-4">
                  <label className="form-label">Bank Name</label>
                  <input name="bankName" value={formValues.bankName} onChange={handleInputChange} className="form-control" />
                </div> */}

                {/* File uploads */}
                {["FrontAdhar", "BackAdhar", "OfficePhoto", "OwnerPhoto", "VisitOffice", "MOU", "PanCard", "Registration"].map((f) => (
                  <div className="col-md-6" key={f}>
                    <label className="form-label">{f}</label>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, f)} className="form-control" />
                    {uploads[f]?.preview && (
                      <div className="mt-2">
                        <img src={uploads[f].preview} alt={f} style={{ maxWidth: 200, maxHeight: 120 }} />
                        <div>Progress: {Math.round(uploads[f].progress)}%</div>
                      </div>
                    )}
                  </div>
                ))}

              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                {ele && ele._id ? "Update Partner" : "Create Partner"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateFrenchise;
