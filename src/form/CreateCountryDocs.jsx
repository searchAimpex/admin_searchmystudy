import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createSecondCountry, updateSecondCountry } from "../slice/CountrySlicr";
import { useSelector } from "react-redux";
import { allCountry } from "../slice/AbroadSlice";

const storage = getStorage(app);

const CreateCountryDocs = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();
    const {allCountries} = useSelector(state=>state.abroadStudy)
    // console.log(allCountries,"||||||||||||||||||||||||||||");
    
    const fetchCountry  = async ()=>{
        const res  = await dispatch(allCountry());  
        console.log(res,"+++++++++++++++++++++++++++++");
        
    }
    
    useEffect(()=>{
        fetchCountry();
    },[])

    // align keys with your Mongoose schema (accept common variants from older code)
    const initial = {
        // fields matching secondCountry schema
        name: ele?.name || "",
        country:ele?.Country?.name || "",
        flagURL: ele?.flagURL || "",
        currency: ele?.currency || "",
        code: ele?.code || "",
        vfs: ele?.vfs || "",
        step: ele?.step || "",
        whyThisCountry: ele?.whyThisCountry || "",
        faq: ele?.faq || "",
        // optional relation to an existing country
        // countryId: ele?.countryId || ele?.parentCountry || "",   
    };

    const [formValues, setFormValues] = useState(initial);

    useEffect(() => {
        setFormValues(prev => ({ ...prev, ...(ele || {}) }));
        // populate upload previews from ele if available
        // eslint-disable-next-line
    }, [ele]);

    const [uploads, setUploads] = useState({
        flagURL: { progress: 0, preview: initial.flagURL || null, loading: false },
        vfs: { progress: 0, preview: initial.vfs || null, loading: false },
        step: { progress: 0, preview: initial.step || null, loading: false },
        whyThisCountry: { progress: 0, preview: initial.whyThisCountry || null, loading: false },
        faq: { progress: 0, preview: initial.faq || null, loading: false },
    });

    // keep uploads previews in sync when ele changes
    useEffect(() => {
        if (!ele) return;
        setUploads(prev => {
            const next = { ...prev };
            // only flagURL expected for preview
            if (ele.flagURL) next.flagURL.preview = ele.flagURL;
            if (ele.vfs) next.vfs.preview = ele.vfs;
            if (ele.step) next.step.preview = ele.step;
            if (ele.whyThisCountry) next.whyThisCountry.preview = ele.whyThisCountry;
            if (ele.faq) next.faq.preview = ele.faq;
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

        const storageRef = ref(storage, `secondcountry/${fieldName}/${Date.now()}_${file.name}`);
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
        if (!formValues.name?.trim()) newErrors.name = "Name is required";
        if (!formValues.code?.trim()) newErrors.code = "Code is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const [errors, setErrors] = useState({});

    const fileFields = [
        "flagURL",
        "vfs",
        "step",
        "whyThisCountry",
        "faq",
    ];

    const handleSubmit = async (e) => {

        e.preventDefault();
        console.log("asdfsdfadsasdafadssdf")
        if (anyUploading()) {
            toast.error("Please wait for file uploads to finish.");
            return;
        }

        // if (!validateForm()) {
        //     toast.error("Please fix validation errors.");
        //     return;
        // }

        try {
            const payload = { ...formValues };
            console.log(payload);
            
            // nothing special to normalize for secondCountry schema

            if (ele && ele._id) {
                const res = await dispatch(updateSecondCountry({ id: ele._id, data: payload }));
                if (res?.meta?.requestStatus === "fulfilled") {
                    toast.success("Country updated");
                    fetchData?.();
                    handleClose?.();
                } else {
                    const msg = res?.payload?.message || res?.error?.message || "Update failed";
                    toast.error(msg);
                }
            } else {
                const res = await dispatch(createSecondCountry(payload));
                console.log(res,"||||||||||||||||||||||||||||||")
                if (res?.meta?.requestStatus === "fulfilled") {
                    toast.success("Country created");
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
                            <h5 className="modal-title">{ele ? "Edit Country Docs" : "Create Country Docs"}</h5>
                            <button type="button" className="btn-close" onClick={handleClose}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row g-3">
                                   {/* <div className="col-md-6"> */}
    {/* <label className="form-label">Parent Country</label>
    <select
        name="name"                  // must match state key
        id="name"
        value={formValues.name}       // must match state key
        onChange={handleInputChange}
        className="form-control"
    >
        <option value="" disabled>-- Select country --</option>
        {(allCountries || []).map((country) => (
            <option key={country._id} value={country.name}>
                {country.name}
            </option>
        ))}
    </select>
</div> */}

                                     <div className="col-md-6">
                                        <label className="form-label">Parent Country</label>
                                        <select name="country" id="country" value={formValues.country} onChange={handleInputChange} className="form-control">
                                            <option value="" disabled>-- Select country --</option>
                                            {(allCountries || []).map((country) => (
                                                <option key={country._id} value={country._id}>{country.name}</option>
                                            ))}
                                        </select>
                                        {/* avoid mapping undefined by using (allCountries || []) */}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Code</label>
                                        <input name="code" value={formValues.code} onChange={handleInputChange} className={`form-control ${errors.code ? "is-invalid" : ""}`} />
                                        {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Currency</label>
                                        <input name="currency" value={formValues.currency} onChange={handleInputChange} className="form-control" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">VFS</label>
                                        <input name="vfs" value={formValues.vfs} onChange={handleInputChange} className="form-control" />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">Step (upload file)</label>
                                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'step')} className="form-control" />
                                        {uploads.step?.preview && (
                                            <div className="mt-2">
                                                {String(uploads.step.preview).toLowerCase().includes('.pdf') ? (
                                                    <a href={uploads.step.preview} target="_blank" rel="noreferrer">View file</a>
                                                ) : (
                                                    <img src={uploads.step.preview} alt="step" style={{ maxWidth: 200, maxHeight: 120 }} />
                                                )}
                                                <div>Progress: {Math.round(uploads.step.progress)}%</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-12 mt-2">
                                        <label className="form-label">Why This Country (upload file)</label>
                                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'whyThisCountry')} className="form-control" />
                                        {uploads.whyThisCountry?.preview && (
                                            <div className="mt-2">
                                                {String(uploads.whyThisCountry.preview).toLowerCase().includes('.pdf') ? (
                                                    <a href={uploads.whyThisCountry.preview} target="_blank" rel="noreferrer">View file</a>
                                                ) : (
                                                    <img src={uploads.whyThisCountry.preview} alt="whyThisCountry" style={{ maxWidth: 200, maxHeight: 120 }} />
                                                )}
                                                <div>Progress: {Math.round(uploads.whyThisCountry.progress)}%</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-12 mt-2">
                                        <label className="form-label">FAQ (upload file)</label>
                                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'faq')} className="form-control" />
                                        {uploads.faq?.preview && (
                                            <div className="mt-2">
                                                {String(uploads.faq.preview).toLowerCase().includes('.pdf') ? (
                                                    <a href={uploads.faq.preview} target="_blank" rel="noreferrer">View file</a>
                                                ) : (
                                                    <img src={uploads.faq.preview} alt="faq" style={{ maxWidth: 200, maxHeight: 120 }} />
                                                )}
                                                <div>Progress: {Math.round(uploads.faq.progress)}%</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-6 mt-3">
                                        <label className="form-label">Flag Image</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'flagURL')} className="form-control" />
                                        {uploads.flagURL?.preview && (
                                            <div className="mt-2">
                                                <img src={uploads.flagURL.preview} alt="flag" style={{ maxWidth: 200, maxHeight: 120 }} />
                                                <div>Progress: {Math.round(uploads.flagURL.progress)}%</div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                                <button type="submit" className="btn btn-primary" disabled={anyUploading()}>
                                    {anyUploading() ? "Uploading..." : (ele && ele._id ? "Update Country" : "Create Country")}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateCountryDocs;
