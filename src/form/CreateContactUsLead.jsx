import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createContactUsLead, updateContactUsLead } from "../slice/contachUsLead";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateContactUsLead = ({ ele, handleClose, fetchData }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: ele?.name || "",
    phoneNo: ele?.phoneNo || "",
    email: ele?.email || "",
    occupation: ele?.occupation || "",
    comment: ele?.comment || "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    // phoneNo is not required, but you can add validation if needed
    // email is not required, but you can add validation if needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      if (ele && ele._id) {
        // Update existing lead
        const res = await dispatch(updateContactUsLead({ id: ele._id, data: form }));
        if (updateContactUsLead.fulfilled.match(res)) {
          toast.success("Lead updated successfully!");
          handleClose();
          fetchData && fetchData();
        } else {
          toast.error("Failed to update lead: " + (res.payload?.message || res.error?.message || "Unknown error"));
        }
      } else {
        // Create new lead
        const res = await dispatch(createContactUsLead(form));
        if (createContactUsLead.fulfilled.match(res)) {
          toast.success("Lead created successfully!");
          handleClose();
          fetchData && fetchData();
        } else {
          toast.error("Failed to create lead: " + (res.payload?.message || res.error?.message || "Unknown error"));
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
        <div className="modal-dialog" style={{ maxWidth: "500px" }}>
          <div className="p-20 modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{ele && ele._id ? "Update Lead" : "Add Lead"}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <div className="p-4">
              {/* Name */}
              <div className="col-12 mb-3">
                <label className="form-label">Name<span style={{color:"red"}}>*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  required
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              {/* Phone Number */}
              <div className="col-12 mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  value={form.phoneNo}
                  maxLength="10"
                  onChange={(e) => setForm((prev) => ({ ...prev, phoneNo: e.target.value }))}
                  className="form-control"
                />
              </div>

              {/* Email */}
              <div className="col-12 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="form-control"
                />
              </div>

              {/* Occupation */}
              <div className="col-12 mb-3">
                <label className="form-label">Occupation</label>
                <input
                  type="text"
                  value={form.occupation}
                  onChange={(e) => setForm((prev) => ({ ...prev, occupation: e.target.value }))}
                  className="form-control"
                />
              </div>

              {/* Comment */}
              <div className="col-12 mb-3">
                <label className="form-label">Comment</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                  className="form-control"
                  rows={3}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                {ele && ele._id ? "Update Lead" : "Create Lead"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateContactUsLead;