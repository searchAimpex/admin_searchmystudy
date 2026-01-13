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
  // console.log(ele,"-----------------------");

  const initial = {
    name: ele?.name || ele?.OwnerName || "demo",
    email: ele?.email || "",
    password: "",
    passwordTracker: ele?.passwordTracker || "",
    role: ele?.role || "partner",
    OwnerName: ele?.OwnerName || ele?.name || "",
    OwnerFatherName: ele?.OwnerFatherName || "",
    InsitutionName: ele?.InsitutionName || "",
    ContactNumber: ele?.ContactNumber || "",
    WhatappNumber: ele?.WhatappNumber || ele?.WhatsAppNumber || "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
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
        toast.success(`${fieldName} uploaded`);
      }
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.OwnerName?.trim()) newErrors.OwnerName = "Owner name is required";
    if (!formValues.email?.trim()) newErrors.email = "Email is required";
    if (!formValues.ContactNumber?.trim()) newErrors.ContactNumber = "Contact number is required";
    // zipCode must be numeric if provided
    if (formValues.zipCode !== undefined && String(formValues.zipCode).trim() !== "") {
      const zip = String(formValues.zipCode).trim();
      if (!/^\d+$/.test(zip)) {
        newErrors.zipCode = "Zip Code must be numeric";
      }
    }
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
        console.log(payload, "//////////------------/////////////////////");

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
                    <label className="form-label">Owner Name</label>
                    <input name="OwnerName" value={formValues.OwnerName} onChange={handleInputChange} className={`form-control ${errors.OwnerName ? "is-invalid" : ""}`} />
                    {errors.OwnerName && <div className="invalid-feedback">{errors.OwnerName}</div>}
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
                    <label className="form-label">Contact Number <span style={{ color: "red" }}>*</span></label>
                    <input name="ContactNumber" maxLength={10} value={formValues.ContactNumber} onChange={handleInputChange} className={`form-control ${errors.ContactNumber ? "is-invalid" : ""}`} />
                    {errors.ContactNumber && <div className="invalid-feedback">{errors.ContactNumber}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">WhatsApp Number <span style={{ color: "red" }}>*</span></label>
                    <input maxLength={10} name="WhatappNumber" value={formValues.WhatappNumber} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Center Code <span style={{ color: "red" }}>*</span></label>
                    <input name="CenterCode" value={formValues.CenterCode} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Date Of Birth <span style={{ color: "red" }}>*</span></label>
                    <input type="date" name="DateOfBirth" value={formValues.DateOfBirth} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Type</label>
                    <select name="role" value={formValues.role} onChange={handleInputChange} className="form-control">
                      <option value="partner" selected>Partner</option>
                      <option value="franchise" disabled>Franchise</option>
                      {/* <option value="admin">Admin</option> */}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email <span style={{ color: "red" }}>*</span></label>
                    <input name="email" value={formValues.email} onChange={handleInputChange} className={`form-control ${errors.email ? "is-invalid" : ""}`} />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Password <span style={{ color: "red" }}>*</span>
                    </label>

                    <input
                      type="password"
                      name="password"
                      className="form-control"
                       onChange={handleInputChange}
                      placeholder={ele ? ele?.passwordTracker : ""}
                      readOnly={!!ele}
                    />

                  </div>


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
                    <input name="zipCode" value={formValues.zipCode} onChange={handleInputChange} className={`form-control ${errors.zipCode ? "is-invalid" : ""}`} />
                    {errors.zipCode && <div className="invalid-feedback">{errors.zipCode}</div>}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <textarea name="address" value={formValues.address} onChange={handleInputChange} className="form-control" />
                  </div>

                  {fileFields.map((f) => (
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
