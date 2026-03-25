import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createContact, updateContact } from "../slice/contact";

const buildContactFormData = (formValues, profileImgFile) => {
    const formData = new FormData();
    formData.append("name", formValues.name ?? "");
    formData.append("email", formValues.email ?? "");
    formData.append("phone", formValues.phone != null ? String(formValues.phone) : "");
    formData.append("description", formValues.description ?? "");
    formData.append("designation", formValues.designation ?? "");
    if (profileImgFile) {
        formData.append("profileImg", profileImgFile);
    } else if (formValues.profileImg) {
        formData.append("profileImg", formValues.profileImg);
    }
    return formData;
};

const CreateContact = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();

    const initial = {
        profileImg: ele?.profileImg ?? "",
        description: ele?.description ?? "",
        designation: ele?.designation ?? "",
        name: ele?.name ?? "",
        email: ele?.email ?? "",
        phone: ele?.phone ?? "",
    };

    const [formValues, setFormValues] = useState(initial);
    const [profileImgFile, setProfileImgFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState(initial.profileImg || "");
    const previewBlobRef = useRef(null);

    const revokeBlobPreview = () => {
        if (previewBlobRef.current) {
            URL.revokeObjectURL(previewBlobRef.current);
            previewBlobRef.current = null;
        }
    };

    useEffect(() => {
        revokeBlobPreview();
        setFormValues({
            name: ele?.name ?? "",
            phone: ele?.phone ?? "",
            email: ele?.email ?? "",
            profileImg: ele?.profileImg ?? "",
            description: ele?.description ?? "",
            designation: ele?.designation ?? "",
        });
        setProfileImgFile(null);
        setProfilePreview(ele?.profileImg ?? "");
    }, [ele]);

    useEffect(() => () => revokeBlobPreview(), []);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        revokeBlobPreview();
        const objectUrl = URL.createObjectURL(file);
        previewBlobRef.current = objectUrl;
        setProfilePreview(objectUrl);
        setProfileImgFile(file);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const isEdit = Boolean(ele && ele._id);

            if (!isEdit && !profileImgFile && !formValues.profileImg) {
                toast.error("Please choose a profile image.");
                return;
            }

            const formData = buildContactFormData(formValues, profileImgFile);

            if (isEdit) {
                const res = await dispatch(updateContact({ id: ele._id, data: formData }));
                if (res?.meta?.requestStatus === "fulfilled") {
                    toast.success("Contact updated");
                    fetchData?.();
                    handleClose?.();
                } else {
                    const msg = res?.payload?.message || res?.error?.message || "Update failed";
                    toast.error(msg);
                }
            } else {
                const res = await dispatch(createContact(formData));
                if (res?.meta?.requestStatus === "fulfilled") {
                    toast.success("Contact created");
                    fetchData?.();
                    handleClose?.();
                } else {
                    const msg = res?.payload?.message || res?.error?.message || "Creation failed";
                    toast.error(msg);
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
                            <h5 className="modal-title">{ele ? "Edit File" : "Create File"}</h5>
                            <button type="button" className="btn-close" onClick={handleClose}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Profile Image</label>
                                        <input
                                            type="file"
                                            name="profileImg"
                                            id="profileImg"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="form-control"
                                        />
                                        {profilePreview && (
                                            <div className="mt-2">
                                                <img
                                                    src={profilePreview}
                                                    alt={formValues.name || "profile"}
                                                    style={{ maxWidth: 160, maxHeight: 120, objectFit: "cover" }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            name="description"
                                            value={formValues?.description || ""}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            rows={3}
                                            placeholder="Short description or bio"
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">designation</label>
                                        <input
                                            name="designation"
                                            value={formValues?.designation || ""}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="designation"
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Name</label>
                                        <input
                                            name="name"
                                            value={formValues?.name || ""}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Contact name"
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formValues?.email || ""}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="example@domain.com"
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Phone</label>
                                        <input
                                            name="phone"
                                            type="number"
                                            // max={10}
                                            value={formValues?.phone || ""}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="+1 555 555 5555"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                    Close
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {ele && ele._id ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateContact;
