import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createPartner, updatePartner } from "../slice/PartnerSlice";

const storage = getStorage(app);

const CreatePartner = ({ ele, handleClose, fetchData }) => {
  const dispatch = useDispatch();
  console.log(ele, "-----------------------");
  const [showPassword, setShowPassword] = useState(false);

  const initial = {
    name: ele?.name || ele?.OwnerName || "demo",
    email: ele?.email || "",
    password: "",
    mou:ele?.mou || "",
    passwordTracker: ele?.passwordTracker || "",
    role: ele?.role || "partner",
    OwnerName: ele?.OwnerName || ele?.name || "",
    OwnerFatherName: ele?.OwnerFatherName || "",
    InsitutionName: ele?.InsitutionName || "",
    ContactNumber: ele?.ContactNumber || "",
    WhatappNumber: ele?.WhatappNumber || ele?.WhatappNumber || "",
    CenterCode: ele?.CenterCode || "",
    DateOfBirth: ele?.DateOfBirth ? ele.DateOfBirth.split("T")[0] : "",
    city: ele?.city || "",
    state: ele?.state || "",
    zipCode: ele?.zipCode || "",
    address: ele?.address || "",
    FrontAdhar: ele?.FrontAdhar || ele?.FrontAadhar || "",
    BackAdhar: ele?.BackAdhar || ele?.BackAadhar || "",
    PanCard: ele?.PanCard || "",
    ProfilePhoto: ele?.ProfilePhoto || "",
    OwnerPhoto: ele?.OwnerPhoto || "",
    OfficePhoto: ele?.OfficePhoto || "",
    VistOffice: ele?.VistOffice || ele?.VisitOffice || "",
    CancelledCheck: ele?.CancelledCheck || "",
    Logo: ele?.Logo || "",
    mou: ele?.mou || ele?.MOU || "",
    registration: ele?.registration || ele?.Registration || "",
    accountedDetails: ele?.accountedDetails || "",
    IFSC: ele?.IFSC || "",
    bankName: ele?.bankName || "",
    bio: ele?.bio || "",
  };

  const [formValues, setFormValues] = useState(initial);

  useEffect(() => {
    setFormValues(prev => ({ ...prev, ...(ele || {}) }));
    // populate upload previews from ele if available
    // eslint-disable-next-line
  }, [ele]);

  const [uploads, setUploads] = useState({
    FrontAdhar: { progress: 0, preview: initial.FrontAdhar || null, loading: false },
    BackAdhar: { progress: 0, preview: initial.BackAdhar || null, loading: false },
    PanCard: { progress: 0, preview: initial.PanCard || null, loading: false },
    ProfilePhoto: { progress: 0, preview: initial.ProfilePhoto || null, loading: false },
    OwnerPhoto: { progress: 0, preview: initial.OwnerPhoto || null, loading: false },
    OfficePhoto: { progress: 0, preview: initial.OfficePhoto || null, loading: false },
    CancelledCheck: { progress: 0, preview: initial.CancelledCheck || null, loading: false },
    Logo: { progress: 0, preview: initial.Logo || null, loading: false },
    mou: { progress: 0, preview: initial.mou || null, loading: false },
    registration: { progress: 0, preview: initial.registration || null, loading: false },
  });

  // keep uploads previews in sync when ele changes
  useEffect(() => {
    if (!ele) return;
    setUploads(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (ele[k]) next[k].preview = ele[k];
      });
      return next;
    });
  }, [ele]);

  const anyUploading = () => Object.values(uploads).some(u => u.loading === true);

  const requiredMark = <span style={{ color: "red" }}>*</span>;

  const handleInputChange = (e) => {
    const { name } = e.target;
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], loading: true, preview: previewURL, progress: 0 } }));

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
        setErrors(prev => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
        toast.success(`${fieldName} uploaded`);
      }
    );
  };

  const REQUIRED_MSG = "This field is required";

  const validateForm = () => {
    const newErrors = {};

    if (!formValues.OwnerName?.trim()) newErrors.OwnerName = REQUIRED_MSG;
    if (!formValues.OwnerFatherName?.trim()) newErrors.OwnerFatherName = REQUIRED_MSG;
    if (!formValues.InsitutionName?.trim()) newErrors.InsitutionName = REQUIRED_MSG;
    if (!formValues.ContactNumber?.trim()) newErrors.ContactNumber = REQUIRED_MSG;
    if (!formValues.WhatappNumber?.trim()) newErrors.WhatappNumber = REQUIRED_MSG;
    if (!formValues.CenterCode?.trim()) newErrors.CenterCode = REQUIRED_MSG;
    if (!formValues.DateOfBirth?.trim()) newErrors.DateOfBirth = REQUIRED_MSG;
    if (!formValues.role?.trim()) newErrors.role = REQUIRED_MSG;
    if (!formValues.email?.trim()) newErrors.email = REQUIRED_MSG;
    if (!formValues.city?.trim()) newErrors.city = REQUIRED_MSG;
    if (!formValues.state?.trim()) newErrors.state = REQUIRED_MSG;
    if (formValues.zipCode === undefined || formValues.zipCode === "" || String(formValues.zipCode).trim() === "") newErrors.zipCode = REQUIRED_MSG;
    if (!formValues.address?.trim()) newErrors.address = REQUIRED_MSG;

    if (!ele?._id) {
      if (!formValues.password || formValues.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
    }

    fileFields.forEach((f) => {
      if (!formValues[f]?.trim()) newErrors[f] = REQUIRED_MSG;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const [errors, setErrors] = useState({});

  const fileFields = [
    "ProfilePhoto",
    "FrontAdhar",
    "BackAdhar",
    "PanCard",
    "OwnerPhoto",
    "OfficePhoto",
    "CancelledCheck",
    "Logo",
    "mou",
    "registration",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (anyUploading()) {
      toast.error("Please wait for file uploads to finish.");
      return;
    }

    if (!validateForm()) {
      console.log(formValues)
      toast.error("Please fix validation errors.");
      return;
    }

    try {
      const payload = { ...formValues };

      // ensure there's a 'name' field. backend may require name; prefer explicit name or OwnerName
      if ((!payload.name || String(payload.name).trim() === "") && payload.OwnerName) {
        payload.name = payload.OwnerName;
      }

      // remove empty-string fields to avoid backend validation failures for optional fields
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || payload[k] === undefined) delete payload[k];
      });

      // coerce zipCode to number if present and numeric
      if (payload.zipCode !== undefined) {
        const z = Number(payload.zipCode);
        if (!Number.isNaN(z)) payload.zipCode = z;
        else delete payload.zipCode;
      }

      if (payload.DateOfBirth) {
        payload.DateOfBirth = new Date(payload.DateOfBirth).toISOString();
      }

      // don't overwrite password with empty value on update
      if (ele && ele._id && !payload.password) delete payload.password;

      if (ele && ele._id) {
        console.log(payload, "-------------------------")
        const res = await dispatch(updatePartner({ id: ele._id, data: payload }));
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Partner updated");
          fetchData?.();
          handleClose?.();
        } else {
          const msg = res?.payload?.message || res?.error?.message || "Update failed";
          toast.error(msg);
        }
      } else {
        // console.log(payload, "//////////------------/////////////////////");

        const res = await dispatch(createPartner(payload));
        console.log(res)
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Partner created");
          fetchData?.();
          handleClose?.();
        } else {
          // surface full server error for easier debugging
          const msg = res?.payload || res?.error || res;
          console.error("createPartner failed:", msg);
          const userMsg = (res?.payload && res.payload.message) || (res?.error && res.error.message) || "Creation failed";
          toast.error(userMsg);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
    }
  };
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };
  // console.log(initial.mou,"???????????????????????????????????");
  return (
    <>
      <ToastContainer />
      <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog" style={{ maxWidth: 900 }}>
          <div className="modal-content p-20">
            <div className="modal-header">
              <h5 className="modal-title">{ele ? "Edit Partner" : "Create Partner"}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Owner Name {requiredMark}</label>
                    <input name="OwnerName" value={formValues.OwnerName} onChange={handleInputChange} className={`form-control ${errors.OwnerName ? "is-invalid" : ""}`} />
                    {errors.OwnerName && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.OwnerName}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Owner Father's Name {requiredMark}</label>
                    <input name="OwnerFatherName" value={formValues.OwnerFatherName} onChange={handleInputChange} className={`form-control ${errors.OwnerFatherName ? "is-invalid" : ""}`} />
                    {errors.OwnerFatherName && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.OwnerFatherName}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Institution Name {requiredMark}</label>
                    <input name="InsitutionName" value={formValues.InsitutionName} onChange={handleInputChange} className={`form-control ${errors.InsitutionName ? "is-invalid" : ""}`} />
                    {errors.InsitutionName && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.InsitutionName}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Contact Number {requiredMark}</label>
                    <input name="ContactNumber" type="number" maxLength={10} value={formValues.ContactNumber} onChange={handleInputChange} className={`form-control ${errors.ContactNumber ? "is-invalid" : ""}`} />
                    {errors.ContactNumber && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.ContactNumber}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">WhatsApp Number {requiredMark}</label>
                    <input maxLength={10} type="number" name="WhatappNumber" value={formValues.WhatappNumber} onChange={handleInputChange} className={`form-control ${errors.WhatappNumber ? "is-invalid" : ""}`} />
                    {errors.WhatappNumber && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.WhatappNumber}</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Center Code {requiredMark}</label>
                    <input name="CenterCode" value={formValues.CenterCode} onChange={handleInputChange} className={`form-control ${errors.CenterCode ? "is-invalid" : ""}`} />
                    {errors.CenterCode && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.CenterCode}</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Date Of Birth {requiredMark}</label>
                    <input type="date" name="DateOfBirth" value={formValues.DateOfBirth} onChange={handleInputChange} className={`form-control ${errors.DateOfBirth ? "is-invalid" : ""}`} />
                    {errors.DateOfBirth && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.DateOfBirth}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Type {requiredMark}</label>
                    <select name="role" value={formValues.role} onChange={handleInputChange} className={`form-control ${errors.role ? "is-invalid" : ""}`}>
                      <option value="partner">Partner</option>
                      <option value="franchise" disabled>Franchise</option>
                    </select>
                    {errors.role && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.role}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email {requiredMark}</label>
                    <input name="email" value={formValues.email} onChange={handleInputChange} className={`form-control ${errors.email ? "is-invalid" : ""}`} />
                    {errors.email && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.email}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Password {!ele?._id && requiredMark}</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        value={formValues.passwordTracker || formValues.password}
                        onChange={handleInputChange}
                        placeholder={ele?._id ? "Leave blank to keep current" : "Enter password (min 8 characters)"}
                      />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(prev => !prev)}>
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {errors.password && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.password}</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">City {requiredMark}</label>
                    <input name="city" value={formValues.city} onChange={handleInputChange} className={`form-control ${errors.city ? "is-invalid" : ""}`} />
                    {errors.city && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.city}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">State {requiredMark}</label>
                    <input name="state" value={formValues.state} onChange={handleInputChange} className={`form-control ${errors.state ? "is-invalid" : ""}`} />
                    {errors.state && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.state}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Zip Code {requiredMark}</label>
                    <input type="number" name="zipCode" value={formValues.zipCode} onChange={handleInputChange} className={`form-control ${errors.zipCode ? "is-invalid" : ""}`} />
                    {errors.zipCode && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.zipCode}</div>}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Address {requiredMark}</label>
                    <textarea name="address" value={formValues.address} onChange={handleInputChange} className={`form-control ${errors.address ? "is-invalid" : ""}`} />
                    {errors.address && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors.address}</div>}
                  </div>

                  {fileFields.map((f) => (
                    <div className="col-md-6" key={f}>
                      <label className="form-label">{f} {requiredMark}</label>
                      <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, f)} className={`form-control ${errors[f] ? "is-invalid" : ""}`} />
                      {errors[f] && <div className="invalid-feedback d-block" style={{ color: "red" }}>{errors[f]}</div>}
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
                <button type="submit" className="btn btn-primary" disabled={anyUploading()}>
                  {anyUploading() ? "Uploading..." : (ele && ele._id ? "Update Partner" : "Create Partner")}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePartner;
