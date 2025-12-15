import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateFile } from "../slice/CountrySlicr";
import { createNav, updateNav } from "../slice/nav";
import { createPromotional, updatePromotional } from "../slice/promotional";

const storage = getStorage(app);

const CreatePromotional = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();


    // canonical fields used by this form
    const initial = {
        title: ele?.title ?? "",
        imageURL: ele?.imageURL ?? "",
        altName: ele?.altName ?? "",
    };

    const [formValues, setFormValues] = useState(initial);

    // uploads state keyed by imageURL to track progress/preview/loading
    const [uploads, setUploads] = useState({
        imageURL: { progress: 0, preview: initial.imageURL || null, loading: false },
    });

    // keep form values and upload preview in sync when ele changes
    useEffect(() => {
        setFormValues({
            title: ele?.title ?? "",
            imageURL: ele?.imageURL ?? "",
            altName: ele?.altName ?? "",
        });
        setUploads(prev => {
            const next = { ...prev };
            next.imageURL = { ...next.imageURL, preview: ele?.imageURL ?? next.imageURL.preview };
            return next;
        });
    }, [ele]);

    const anyUploading = () => Object.values(uploads).some(u => u.loading === true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const fieldName = "imageURL";
        const file = e.target.files?.[0];
        if (!file) return;

        const previewURL = URL.createObjectURL(file);
        setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], loading: true, preview: previewURL, progress: 0 } }));

        const storageRef = ref(storage, `promotional/${fieldName}/${Date.now()}_${file.name}`);
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

    const [errors, setErrors] = useState({});

    const fileFields = [
        "imageURL",
    ];

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
                const res = await dispatch(createPromotional(payload));
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
                                        <label className="form-label">Title</label>
                                        <input name="title" value={formValues?.title || ""} onChange={handleInputChange} className="form-control" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Alt text</label>
                                        <input name="altName" value={formValues?.altName || ""} onChange={handleInputChange} className="form-control" />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="imageURL" className="form-label">Image</label>
                                        <input type="file" name="imageURL" id="imageURL" accept="image/*" onChange={handleFileChange} className="form-control" />
                                        {uploads?.imageURL?.preview && (
                                            <div className="mt-2">
                                                <img src={uploads.imageURL.preview} alt={formValues.altName || "preview"} style={{ maxWidth: 200, maxHeight: 120 }} />
                                                <div>Progress: {Math.round(uploads.imageURL.progress)}%</div>
                                            </div>
                                        )}
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

export default CreatePromotional;
