import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const storage = getStorage(app);

const FILE_FIELDS = [
  "FrontAdhar",
  "BackAdhar",
  "PanCard",
  "ProfilePhoto",
  "OwnerPhoto",
  "OfficePhoto",
  "mou",
  "registration",
  "VistOffice",
  "CancelledCheck",
  "Logo",
];

const FILE_LABELS = {
  FrontAdhar: "Front Adhar",
  BackAdhar: "Back Adhar",
  PanCard: "Pan Card",
  ProfilePhoto: "Profile Photo",
  OwnerPhoto: "Owner Photo",
  OfficePhoto: "Office Photo",
  mou: "MOU",
  registration: "Registration",
  VistOffice: "Visit Office",
  CancelledCheck: "Cancelled Check",
  Logo: "Logo",
};

const createInitialForm = (ele) => ({
  name: ele?.name || "",
  email: ele?.email || "",
  password: "",
  role: ele?.role || "counsellor",
  createdBy: ele?.createdBy?._id || ele?.createdBy || "",
  block: ele?.block || false,
  OwnerName: ele?.OwnerName || "",
  OwnerFatherName: ele?.OwnerFatherName || "",
  InsitutionName: ele?.InsitutionName || "",
  ContactNumber: ele?.ContactNumber || "",
  status: ele?.status || false,
  WhatappNumber: ele?.WhatappNumber || "",
  CenterCode: ele?.CenterCode || "",
  DateOfBirth: ele?.DateOfBirth ? ele.DateOfBirth.split("T")[0] : "",
  city: ele?.city || "",
  state: ele?.state || "",
  zipCode: ele?.zipCode || "",
  address: ele?.address || "",
  FrontAdhar: ele?.FrontAdhar || "",
  BackAdhar: ele?.BackAdhar || "",
  PanCard: ele?.PanCard || "",
  ProfilePhoto: ele?.ProfilePhoto || "",
  CounsellorCOde: ele?.CounsellorCOde || "",
  OwnerPhoto: ele?.OwnerPhoto || "",
  OfficePhoto: ele?.OfficePhoto || "",
  mou: ele?.mou || "",
  registration: ele?.registration || "",
  VistOffice: ele?.VistOffice || "",
  CancelledCheck: ele?.CancelledCheck || "",
  Logo: ele?.Logo || "",
  accountedDetails: ele?.accountedDetails || "",
  IFSC: ele?.IFSC || "",
  bankName: ele?.bankName || "",
  bio: ele?.bio || "",
});

const CreateCounsellorCoursefinder = ({
  ele,
  handleClose,
  fetchData,
  loadCounsellors,
}) => {
  const [form, setForm] = useState(() => createInitialForm(ele));
  const [errors, setErrors] = useState({});
  const [uploads, setUploads] = useState(() =>
    FILE_FIELDS.reduce((acc, field) => {
      acc[field] = {
        progress: 0,
        preview: ele?.[field] || null,
        loading: false,
      };
      return acc;
    }, {})
  );

  const refreshList = fetchData || loadCounsellors;

  useEffect(() => {
    setForm(createInitialForm(ele));
    setUploads(
      FILE_FIELDS.reduce((acc, field) => {
        acc[field] = {
          progress: 0,
          preview: ele?.[field] || null,
          loading: false,
        };
        return acc;
      }, {})
    );
  }, [ele]);

  const anyUploading = useMemo(
    () => Object.values(uploads).some((item) => item.loading),
    [uploads]
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setUploads((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        preview: previewURL,
        progress: 0,
        loading: true,
      },
    }));

    const storageRef = ref(
      storage,
      `counsellors/${fieldName}/${Date.now()}_${file.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploads((prev) => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], progress },
        }));
      },
      (error) => {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${FILE_LABELS[fieldName]}`);
        setUploads((prev) => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            progress: 0,
            loading: false,
          },
        }));
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setForm((prev) => ({ ...prev, [fieldName]: url }));
        setUploads((prev) => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            preview: url,
            progress: 100,
            loading: false,
          },
        }));
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
        toast.success(`${FILE_LABELS[fieldName]} uploaded`);
      }
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.role.trim()) newErrors.role = "Role is required";
    if (!form.WhatappNumber.trim()) {
      newErrors.WhatappNumber = "WhatsApp number is required";
    }

    if (!ele?._id && (!form.password || form.password.length < 8)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (form.zipCode && Number.isNaN(Number(form.zipCode))) {
      newErrors.zipCode = "Zip code must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (anyUploading) {
      toast.error("Please wait for file uploads to finish.");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the form errors.");
      return;
    }

    try {
      const payload = { ...form };

      if (payload.password) {
        payload.passwordTracker = payload.password;
      } else {
        delete payload.password;
      }

      if (!payload.createdBy) delete payload.createdBy;
      if (!payload.DateOfBirth) {
        delete payload.DateOfBirth;
      } else {
        payload.DateOfBirth = new Date(payload.DateOfBirth).toISOString();
      }

      if (payload.zipCode === "" || payload.zipCode === null) {
        delete payload.zipCode;
      } else {
        payload.zipCode = Number(payload.zipCode);
      }

      Object.keys(payload).forEach((key) => {
        if (payload[key] === "") delete payload[key];
      });

      let response;
      if (ele?._id) {
        if (!form.password) delete payload.passwordTracker;
        response = await axios.put(
          `https://searchmystudy.com/api/users/updateUser/${ele._id}`,
          payload
        );
        toast.success(response?.data?.message || "Counsellor updated successfully");
      } else {
        delete payload.CounsellorCOde;
        response = await axios.post(
          "https://searchmystudy.com/api/admin/extrauser",
          payload
        );
        toast.success(response?.data?.message || "Counsellor created successfully");
      }

      refreshList?.();
      handleClose?.();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Something went wrong";
      toast.error(String(message));
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-scrollable" style={{ maxWidth: "1100px" }}>
          <div className="modal-content p-4">
            <div className="modal-header">
              <h5 className="modal-title">
                {ele?._id ? "Update Counselor" : "Add Counselor"}
              </h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <h6 className="border-bottom pb-2 mb-0">Basic Details</h6>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Password {ele?._id ? "" : "*"}
                    </label>
                    <input
                      type="text"
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      placeholder={ele?._id ? "Leave blank to keep existing password" : ""}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Role *</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleInputChange}
                      className={`form-select ${errors.role ? "is-invalid" : ""}`}
                    >
                      <option value="counsellor">Counsellor</option>
                      <option value="partner">Partner</option>
                      <option value="franchise">Franchise</option>
                      <option value="admin">Admin</option>
                    </select>
                    {errors.role && <div className="invalid-feedback">{errors.role}</div>}
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Counsellor Code</label>
                    <input
                      type="text"
                      name="CounsellorCOde"
                      value={form.CounsellorCOde}
                      onChange={handleInputChange}
                      className="form-control"
                      disabled={!ele?._id}
                      placeholder={ele?._id ? "" : "Auto generated"}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Created By</label>
                    <input
                      type="text"
                      name="createdBy"
                      value={form.createdBy}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="User ID of parent account"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">WhatsApp Number *</label>
                    <input
                      type="text"
                      name="WhatappNumber"
                      value={form.WhatappNumber}
                      onChange={handleInputChange}
                      className={`form-control ${errors.WhatappNumber ? "is-invalid" : ""}`}
                    />
                    {errors.WhatappNumber && (
                      <div className="invalid-feedback">{errors.WhatappNumber}</div>
                    )}
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Contact Number</label>
                    <input
                      type="text"
                      name="ContactNumber"
                      value={form.ContactNumber}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>

                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" type="button" onClick={handleClose}>
                  Close
                </button>
                <button className="btn btn-primary" type="submit" disabled={anyUploading}>
                  {ele?._id ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCounsellorCoursefinder;
