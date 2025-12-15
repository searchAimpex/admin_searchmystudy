import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateFile } from "../slice/CountrySlicr";
import { createNav, updateNav } from "../slice/nav";

const storage = getStorage(app);

const CreateNav = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();


    const initial = {
        name: ele?.name,
        url: ele?.url ,
    };

    const [formValues, setFormValues] = useState(initial);
  

    const [uploads, setUploads] = useState({
        // only fileURL preview is needed for this component
        fileURL: { progress: 0, preview: initial.fileURL || null, loading: false },
    });

    // keep uploads previews in sync when ele changes
    useEffect(() => {
        if (!ele) return;
        setUploads(prev => {
            const next = { ...prev };
            if (ele.fileURL) next.fileURL = { ...next.fileURL, preview: ele.fileURL };
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

    const [errors, setErrors] = useState({});

    const fileFields = [
        "fileURL",
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
                const res = await dispatch(updateNav({ id: ele._id, data: payload }));
                toast.success("Nav updated");
                if (res?.meta?.requestStatus === "fulfilled") {
                    fetchData?.();
                    handleClose?.();
                } else {
                    const msg = res?.payload?.message || res?.error?.message || "Update failed";
                    toast.error(msg);
                }
            } else {
                const res = await dispatch(createNav(payload));
                if (res?.meta?.requestStatus === "fulfilled") {
                    toast.success("Nav created");
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
                                        <label className="form-label">Name</label>
                                        <input name="name" value={formValues?.name || ""} onChange={handleInputChange} className="form-control" />
                                    </div>

                                  

                                    <div className="col-md-6">
                                        <label className="form-label">Link</label>
                                        <input name="url" value={formValues?.url} onChange={handleInputChange} className="form-control" />
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

export default CreateNav;
