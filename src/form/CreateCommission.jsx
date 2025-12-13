import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createPartner, updatePartner } from "../slice/PartnerSlice";
import { createAssessment, updateAssessment } from "../slice/AssessmentSlice";
import { allCountry } from "../slice/AbroadSlice";
import { useSelector } from "react-redux";
import { createFile, fetchCountry, updateFile } from "../slice/CountrySlicr";
import { createCommission } from "../slice/comission";

const storage = getStorage(app);

const CreateCommission = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();
    const  {country}  = useSelector(state => state?.country);
    
    const fetchAllCountries = async () => {
        const res = await dispatch(fetchCountry())
    }
    const initial = {
        // accept both object or id/name from different callers; default to empty strings to avoid uncontrolled inputs
        SecondCountry: ele?.SecondCountry?._id || ele?.SecondCountry?.name || ele?.SecondCountry || "",
        title: ele?.title ,
        fileURL: ele?.fileURL,
        target: ele?.target ,
    };

    const [formValues, setFormValues] = useState(initial);
    useEffect(() => {
        // merge ele over initial and normalize SecondCountry to an ID when possible
        const merged = { ...initial, ...(ele || {}) };
        let sc = merged.SecondCountry;
        // if it's an object, prefer its _id
        if (sc && typeof sc === 'object') sc = sc._id || sc.name || '';
        // if it's a name or id string and we have countries, try to find matching country and use its _id
        if (sc && Array.isArray(country) && country.length) {
            const found = country.find(c => c._id === sc || c.name === sc);
            if (found) sc = found._id;
        }
        merged.SecondCountry = sc || "";
        setFormValues(merged);
        fetchAllCountries();
    }, [ele, country]);

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

    const validateForm = () => {
        const newErrors = {};
        if (!formValues.SecondCountry || String(formValues.SecondCountry).trim() === "") newErrors.SecondCountry = "Country is required";
        if (!formValues.title || String(formValues.title).trim() === "") newErrors.title = "Title is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
            if (payload.SecondCountry) {
                // if already an _id present in countries, keep it
                if (Array.isArray(country) && country.find(c => c._id === payload.SecondCountry)) {
                    // OK
                } else if (Array.isArray(country)) {
                    // try to resolve by name
                    const found = country.find(c => c.name === payload.SecondCountry || c._id === payload.SecondCountry);
                    if (found) payload.SecondCountry = found._id;
                }
            }
            
            // coerce target to number if present
            if (payload.target !== undefined && payload.target !== "") payload.target = Number(payload.target);

            // Remove empty User field or fields that are empty strings
            if (!payload.User || payload.User.trim() === "") {
                delete payload.User;
            }
            
            // Remove empty dob if not set
            if (!payload.dob) {
                delete payload.dob;
            }
            
            if (payload.DateOfBirth) {
                payload.DateOfBirth = new Date(payload.DateOfBirth).toISOString();
            }
            
            // don't overwrite password with empty value on update
            if (ele && ele._id && !payload.password) delete payload.password;

            if (ele && ele._id) {
                const res = await dispatch(updateFile({ id: ele._id, data: payload }));
                // console.log(payload,"::::::::::::::::::::::::::::::::::::::::::::");
                // console.log(res);
                
                toast.success("File updated");
                if (res?.meta?.requestStatus === "fulfilled") {
                    fetchData?.();
                    // handleClose?.();
                } else {
                    const msg = res?.payload?.message || res?.error?.message || "Update failed";
                    toast.error(msg);
                }
            } else {
                // console.log(payload);
                
                console.log(payload,"|||||||||||||||||||||||||||||||");
                const res = await dispatch(createCommission(payload));
                
                if (res?.meta?.requestStatus === "fulfilled") {
                    toast.success("Commission created");
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
                                        <label className="form-label">Country</label>
                                        <select name="SecondCountry" value={formValues?.SecondCountry} onChange={handleInputChange} className="form-control">
                                            <option value="">Select Country</option>
                                            {country.map((c) => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Title</label>
                                        <input name="title" value={formValues?.title || ""} onChange={handleInputChange} className="form-control" />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="fileURL" className="form-label">File</label>
                                        <input type="file" name="fileURL" id="fileURL" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'fileURL')} className="form-control" />
                                        {uploads?.fileURL?.preview && (
                                            <div className="mt-2">
                                                {typeof uploads.fileURL.preview === 'string' && uploads.fileURL.preview.toLowerCase().includes('.pdf') ? (
                                                    <a href={uploads.fileURL.preview} target="_blank" rel="noreferrer">Open File (PDF)</a>
                                                ) : (
                                                    <img src={uploads.fileURL.preview} alt="file" style={{ maxWidth: 200, maxHeight: 120 }} />
                                                )}
                                                <div>Progress: {Math.round(uploads.fileURL.progress)}%</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Target</label>
                                        <input name="target" type="number" value={formValues?.target || ""} onChange={handleInputChange} className="form-control" />
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

export default CreateCommission;
