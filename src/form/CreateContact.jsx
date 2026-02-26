import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateFile } from "../slice/CountrySlicr";
import { createNav, updateNav } from "../slice/nav";
import { createPromotional, updatePromotional } from "../slice/promotional";
import { createContact } from "../slice/contact";

const storage = getStorage(app);

const CreateContact = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();


    // canonical fields used by this form
    const initial = {
        profileImg: ele?.profileImg ?? "",
        description: ele?.description ?? "",
        designation: ele?.designation ?? "",
        name: ele?.name ?? "",
        email: ele?.email ?? "",
        phone: ele?.phone ?? "",
    };

    const [formValues, setFormValues] = useState(initial);

    // uploads state for profileImg
    const [uploads, setUploads] = useState({
        profileImg: { progress: 0, preview: initial.profileImg || null, loading: false },
    });

    // keep form values and upload preview in sync when ele changes
    useEffect(() => {
        setFormValues({
            name: ele?.name ?? "",
            phone: ele?.phone ?? "",
            email: ele?.email ?? "",
            profileImg: ele?.profileImg ?? "",
            description: ele?.description ?? "",
            designation: ele?.designation ?? "",
        });
        setUploads(prev => {
            const next = { ...prev };
            next.profileImg = { ...next.profileImg, preview: ele?.profileImg ?? next.profileImg.preview };
            return next;
        });
    }, [ele]);

    const anyUploading = () => Object.values(uploads).some(u => u.loading === true);

    const handleFileChange = (e) => {
        const fieldName = "profileImg";
        const file = e.target.files?.[0];
        if (!file) return;

        const previewURL = URL.createObjectURL(file);
        setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], loading: true, preview: previewURL, progress: 0 } }));

        const storageRef = ref(storage, `contacts/${fieldName}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], progress } }));
            },
            (error) => {
                console.error("Upload error:", error);
                toast.error("Failed to upload profile image");
                setUploads(prev => ({ ...prev, [fieldName]: { progress: 0, preview: null, loading: false } }));
            },
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                setFormValues(prev => ({ ...prev, [fieldName]: url }));
                setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], loading: false, progress: 100, preview: url } }));
                toast.success("Profile image uploaded");
            }
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (anyUploading()) {
        //   toast.error("Please wait for file uploads to finish.");
        //   return;
        // }

        // if (!validateForm()) {
        //   toast.error("Please fix validation errors.");
        //   return;
        // }

        try {
            const payload = { ...formValues };
            // normalize SecondCountry to an _id before sending


            if (ele && ele._id) {
                const res = await dispatch(updatePromotional({ id: ele._id, data: payload }));
                toast.success("Nav updated");
                if (res?.meta?.requestStatus === "fulfilled") {
                    fetchData?.();
                    handleClose?.();
                } else {
                    const msg = res?.payload?.message || res?.error?.message || "Update failed";
                    toast.error(msg);
                }
            } else {
                console.log(payload,"-----------------------");
                
                const res = await dispatch(createContact(payload));
                if (res?.meta?.requestStatus === "fulfilled") {
                    toast.success("Banner created");
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
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="row g-3">


                                    <div className="col-md-6">
                                        <label className="form-label">Profile Image</label>
                                        <input type="file" name="profileImg" id="profileImg" accept="image/*" onChange={handleFileChange} className="form-control" />
                                        {uploads?.profileImg?.preview && (
                                            <div className="mt-2">
                                                <img src={uploads.profileImg.preview} alt={formValues.name || "profile"} style={{ maxWidth: 160, maxHeight: 120 }} />
                                                <div>Progress: {Math.round(uploads.profileImg.progress)}%</div>
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
                                            value={formValues?.phone || ""}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="+1 555 555 5555"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                                <button type="submit" className="btn btn-primary" disabled={anyUploading()}>
                                    {anyUploading() ? "Uploading..." : (ele && ele._id ? "Update" : "Create")}
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
