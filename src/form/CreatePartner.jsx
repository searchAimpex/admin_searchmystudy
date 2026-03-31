import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { createPartner, updatePartner } from "../slice/PartnerSlice";

const BACKEND_ASSET_BASE = "https://backend.searchmystudy.com";

const FILE_FIELDS_LIST = [
  "ProfilePhoto", "FrontAdhar", "BackAdhar", "PanCard",
  "OwnerPhoto", "OfficePhoto", "mou", "registration", "VistOffice",
  "CancelledCheck",
];

// Must match backend multer .fields([{ name: "FrontAdhar" }, ...]) exactly.
// If you get "Unexpected field", check your backend and keep only the names it allows.
const MULTER_FILE_FIELD_NAMES = [
  "FrontAdhar", "BackAdhar", "PanCard", "ProfilePhoto",
  "OwnerPhoto", "OfficePhoto", "mou", "registration", "VisitOffice",
  "CancelledCheck",
];

const formFileKeyToMulterName = (key) => (key === "VistOffice" ? "VisitOffice" : key);

function getFileNameFromUrl(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const path = url.split("?")[0];
    const segment = path.split("/").filter(Boolean).pop() || "";
    return segment || url;
  } catch {
    return url;
  }
}

function getPreviewUrl(value) {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("blob:") || /^https?:\/\//i.test(value)) return value;
  return `${BACKEND_ASSET_BASE}/${value.replace(/^\/+/, "")}`;
}

/** RTK rejectWithValue often passes a string; error.message is usually the generic "Rejected". */
function getThunkRejectMessage(res, fallback) {
  const payload = res?.payload;
  if (typeof payload === "string" && payload.trim()) return payload.trim();
  if (payload && typeof payload === "object") {
    const m = payload.message ?? payload.error;
    if (typeof m === "string" && m.trim()) return m.trim();
  }
  const errMsg = res?.error?.message;
  if (typeof errMsg === "string" && errMsg.trim() && errMsg !== "Rejected") {
    return errMsg.trim();
  }
  return fallback;
}

const CreatePartner = ({ ele, handleClose, fetchData }) => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const uploadsRef = useRef({});

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
    FrontAdhar: getFileNameFromUrl(ele?.FrontAdhar || ele?.FrontAadhar || ""),
    BackAdhar: getFileNameFromUrl(ele?.BackAdhar || ele?.BackAadhar || ""),
    PanCard: getFileNameFromUrl(ele?.PanCard || ""),
    ProfilePhoto: getFileNameFromUrl(ele?.ProfilePhoto || ""),
    OwnerPhoto: getFileNameFromUrl(ele?.OwnerPhoto || ""),
    OfficePhoto: getFileNameFromUrl(ele?.OfficePhoto || ""),
    VistOffice: getFileNameFromUrl(ele?.VistOffice || ele?.VisitOffice || ""),
    CancelledCheck: getFileNameFromUrl(ele?.CancelledCheck || ""),
    mou: getFileNameFromUrl(ele?.mou || ele?.MOU || ""),
    registration: getFileNameFromUrl(ele?.registration || ele?.Registration || ""),
    IFSC: ele?.IFSC || "",
    bankName: ele?.bankName || "",
    bio: ele?.bio || "",
  };

  const [formValues, setFormValues] = useState(initial);

  const [uploads, setUploads] = useState({
    FrontAdhar: { progress: 0, preview: initial.FrontAdhar || null, file: null },
    BackAdhar: { progress: 0, preview: initial.BackAdhar || null, file: null },
    PanCard: { progress: 0, preview: initial.PanCard || null, file: null },
    ProfilePhoto: { progress: 0, preview: initial.ProfilePhoto || null, file: null },
    CounsellorCode: { progress: 0, preview: initial.CounsellorCode || null, file: null },
    OwnerPhoto: { progress: 0, preview: initial.OwnerPhoto || null, file: null },
    OfficePhoto: { progress: 0, preview: initial.OfficePhoto || null, file: null },
    mou: { progress: 0, preview: initial.mou || null, file: null },
    registration: { progress: 0, preview: initial.registration || null, file: null },
    VistOffice: { progress: 0, preview: initial.VistOffice || null, file: null },
    CancelledCheck: { progress: 0, preview: initial.CancelledCheck || null, file: null },
  });

  uploadsRef.current = uploads;

  useEffect(() => {
    if (!ele) return;
    setFormValues(prev => {
      const next = { ...prev, ...ele };
      FILE_FIELDS_LIST.forEach(f => {
        if (uploadsRef.current[f]?.file) {
          next[f] = uploadsRef.current[f].file.name;
        } else {
          const src = f === "VistOffice" ? (ele.VisitOffice || ele.VistOffice) : ele[f];
          next[f] = getFileNameFromUrl(src || "");
        }
      });
      return next;
    });
    // eslint-disable-next-line
  }, [ele]);

  // keep uploads previews in sync when ele changes (don't overwrite if user just selected a new file)
  useEffect(() => {
    if (!ele) return;
    setUploads(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (prev[k]?.file) return;
        const src = k === "VistOffice" ? (ele.VisitOffice || ele.VistOffice) : ele[k];
        if (src) next[k] = { ...next[k], preview: src };
      });
      return next;
    });
  }, [ele]);

  const anyUploading = () => false;

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
    setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], preview: previewURL, file, progress: 100 } }));
    setFormValues(prev => ({ ...prev, [fieldName]: file.name }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
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
    if (!formValues.zipCode === undefined || formValues.zipCode === "" || String(formValues.zipCode).trim() === "") newErrors.zipCode = REQUIRED_MSG;
    if (!formValues.address?.trim()) newErrors.address = REQUIRED_MSG;

    if (!ele?._id) {
      if (!formValues.password || formValues.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
    }

    const requiredFileFields = ["ProfilePhoto", "FrontAdhar", "BackAdhar", "PanCard", "OwnerPhoto", "OfficePhoto", "CancelledCheck", "mou", "registration"];
    requiredFileFields.forEach((f) => {
      const hasFile = uploads[f]?.file;
      const hasValue = formValues[f]?.trim?.();
      if (!hasFile && !hasValue) newErrors[f] = REQUIRED_MSG;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const [errors, setErrors] = useState({});

  const fileFields = [
    "ProfilePhoto", "FrontAdhar", "BackAdhar", "PanCard",
    "OwnerPhoto", "OfficePhoto", "mou", "registration", "VistOffice",
    "CancelledCheck",
  ];
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const formData = new FormData();
  
      // FILE FIELDS
      fileFields.forEach((formKey) => {
        const multerName = formFileKeyToMulterName(formKey);
  
        // backend multer allowed fields check
        if (!MULTER_FILE_FIELD_NAMES.includes(multerName)) return;
  
        // new file selected
        if (uploads[formKey]?.file) {
          formData.append(multerName, uploads[formKey].file);
        }
        // existing file URL
        else if (
          uploads[formKey]?.preview &&
          !String(uploads[formKey].preview).startsWith("blob:")
        ) {
          formData.append(multerName, uploads[formKey].preview);
        }
      });
  
      // TEXT FIELDS
      const name =
        (formValues.name && String(formValues.name).trim()) ||
        formValues.OwnerName ||
        "";
  
      const dateOfBirth = formValues.DateOfBirth
        ? new Date(formValues.DateOfBirth).toISOString()
        : "";
  
      const password =
        ele && ele._id && !formValues.password
          ? undefined
          : formValues.password;
  
      if (name) formData.append("name", name);
      if (formValues.email) formData.append("email", formValues.email);
      if (password !== undefined && password !== "")
        formData.append("password", password);
      if (formValues.role) formData.append("role", formValues.role);
      if (formValues.OwnerName)
        formData.append("OwnerName", formValues.OwnerName);
      if (formValues.OwnerFatherName)
        formData.append("OwnerFatherName", formValues.OwnerFatherName);
      if (formValues.InsitutionName)
        formData.append("InsitutionName", formValues.InsitutionName);
      if (formValues.ContactNumber)
        formData.append("ContactNumber", formValues.ContactNumber);
      if (formValues.WhatappNumber)
        formData.append("WhatappNumber", formValues.WhatappNumber);
      if (formValues.CenterCode)
        formData.append("CenterCode", formValues.CenterCode);
      if (dateOfBirth) formData.append("DateOfBirth", dateOfBirth);
      if (formValues.city) formData.append("city", formValues.city);
      if (formValues.state) formData.append("state", formValues.state);
      if (formValues.zipCode !== "" && formValues.zipCode !== undefined)
        formData.append("zipCode", formValues.zipCode);
      if (formValues.address) formData.append("address", formValues.address);
      if (formValues.IFSC) formData.append("IFSC", formValues.IFSC);
      if (formValues.bankName) formData.append("bankName", formValues.bankName);
      if (formValues.bio) formData.append("bio", formValues.bio);
  
      // UPDATE — toast must use the app-level ToastContainer; this modal unmounts on close.
      if (ele && ele._id) {
        const res = await dispatch(updatePartner({ id: ele._id, data: formData }));

        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Partner updated");
          fetchData?.();
          handleClose?.();
        } else {
          toast.error(getThunkRejectMessage(res, "Update failed"));
        }
      }

      // CREATE
      else {
        const res = await dispatch(createPartner(formData));
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Partner created");
          fetchData?.();
          handleClose?.();
        } else {
          toast.error(getThunkRejectMessage(res, "Creation failed"));
        }
      }
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message ??
        (typeof error?.response?.data === "string" ? error.response.data : null) ??
        error?.message ??
        "Unexpected error";
      toast.error(typeof msg === "string" ? msg : "Unexpected error");
    }
  };
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };
  // console.log(initial.mou,"???????????????????????????????????");
  return (
    <>
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
                      {(uploads[f]?.preview || formValues[f]) && (
                        <div className="mt-2">
                          {uploads[f]?.preview && (
                            <img src={getPreviewUrl(uploads[f].preview)} alt={f} style={{ maxWidth: 200, maxHeight: 120 }} />
                          )}
                          {formValues[f] && <div className="small text-muted">{formValues[f]}</div>}
                          <div>Progress: {Math.round(uploads[f]?.progress ?? 0)}%</div>
                        </div>
                      )}
                    </div>
                  ))}

                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                <button type="submit" className="btn btn-primary" 
                // disabled={anyUploading()}
                >
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
