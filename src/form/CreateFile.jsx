import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import "react-toastify/dist/ReactToastify.css";
import { createPartner, updatePartner } from "../slice/PartnerSlice";
import { createAssessment, updateAssessment } from "../slice/AssessmentSlice";
import { allCountry } from "../slice/AbroadSlice";
import { useSelector } from "react-redux";
import { createFile, fetchCountry, updateFile } from "../slice/CountrySlicr";
import { fetchAllUni } from "../slice/AbroadUniversitySlice";
import { toast, ToastContainer } from "react-toastify";
import { fetchAllCountry } from "../slice/MbbsSlice";

const storage = getStorage(app);

const CreateFile = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();
    const [country, setCountry] = useState([]);
    // const  {country}  = useSelector(state => state?.country);
    const {AllUniversity}     = useSelector(state => state?.abroadUniversity)
    // console.log(country,"++++++++++++++++++++++++++++++");
    const fetchAllCountries = async () => {
        const res = await dispatch(fetchAllCountry())
        const res1 = await dispatch(fetchAllUni())
        setCountry(res.payload)
        // console.log(res.payload,"==================");
    }
    // align keys with your Mongoose schema (accept common variants from older code)
    const initial = {
            SecondCountry: ele?.SecondCountry?._id || ele?.SecondCountry || "",
        type: ele?.type || "",
        name: ele?.name || "",
        template: ele?.template || "",
        university:ele?.university || ""
    };

    const [formValues, setFormValues] = useState(initial);
    // console.log(formValues)
    useEffect(() => {
        setFormValues(prev => ({ ...prev, ...(ele || {}) }));
        // populate upload previews from ele if available
        // eslint-disable-next-line
        fetchAllCountries()
    }, [ele]);

    const [uploads, setUploads] = useState({
        // Only template is needed for this form — keep structure similar to other forms
        template: { progress: 0, preview: initial.template || null, loading: false },
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
        if (!formValues.Country?.trim()) newErrors.OwnerName = "country is required";
        if (!formValues.emailID?.trim()) newErrors.email = "Email is required";
        if (!formValues.ContactNumber?.trim()) newErrors.ContactNumber = "Contact number is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const [errors, setErrors] = useState({});

    const fileFields = [

        "resume",
        "englishTestScorecard",
        "acadmics",
        "englishTestDoc",
        "workExperienceDoc",
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
                // console.log(payload,"::::::::::::::::::::::::::::::::::::::::::::");
                const res = await dispatch(updateFile({ id: ele._id, data: payload }));
                // console.log(res);
                
                // toast.success("File updated");
                if (res?.meta?.requestStatus === "fulfilled") {
                    fetchData?.();
                    handleClose?.();
                    toast.success("File updated");
                } else {
                    const msg = res?.payload?.message || res?.error?.message || "Update failed";
                    toast.error(msg);
                }
            } else {
                console.log(payload);
                
                const res = await dispatch(createFile(payload));
                // console.log(res,"|||||||||||||||||||||||||||||||");
                
                if (res?.meta?.requestStatus === "fulfilled") {
                    toast.success("File created");
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
            {/* <ToastContainer /> */}
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
                                    {/* Personal / assessment fields */}
                                    <div className="col-md-4">
                                        <label className="form-label">Name</label>
                                        <input name="name" value={formValues.name} onChange={handleInputChange} className="form-control" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Type</label>
                                        <select name="type" value={formValues?.type} onChange={handleInputChange} className="form-control">
                                            <option value="">Select Type</option>
                                            <option value="TEMPLATE">TEMPLATE</option>
                                            <option value="BROUCHER">BROUCHER</option>

                                        </select>
                                    </div>
                                     <div className="col-md-4">
                                        <label className="form-label">University</label>
                                        <select name="university" value={formValues?.university?.name} onChange={handleInputChange} className="form-control">
                                            <option value="">Select University</option>
                                           {
                                            AllUniversity.map((e)=>(
                                                <option key={e._id} value={e._id}>{e.name}</option>
                                            ))
                                           }

                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Country</label>
                                        <select name="SecondCountry" value={formValues?.SecondCountry || ""} onChange={handleInputChange} className="form-control">
                                            <option value="">Select Country</option>
                                            {
                                                country.map((e) => (
                                                    <option key={e._id} value={e._id}>{e.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="template" className="form-label">Template</label>
                                        <input type="file" name="template" id="template" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'template')} className="form-control" />
                                        {uploads.template?.preview && (
                                            <div className="mt-2">
                                                {typeof uploads.template.preview === 'string' && uploads.template.preview.toLowerCase().includes('.pdf') ? (
                                                    <a href={uploads.template.preview} target="_blank" rel="noreferrer">Open Template (PDF)</a>
                                                ) : (
                                                    <img src={uploads.template.preview} alt="template" style={{ maxWidth: 200, maxHeight: 120 }} />
                                                )}
                                                <div>Progress: {Math.round(uploads.template.progress)}%</div>
                                            </div>
                                        )}
                                    </div>
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

export default CreateFile;
