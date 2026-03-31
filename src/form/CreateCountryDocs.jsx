import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createSecondCountry, updateSecondCountry } from "../slice/CountrySlicr";
import { useSelector } from "react-redux";
import { allCountry } from "../slice/AbroadSlice";

const BACKEND_ASSET_BASE = "https://backend.searchmystudy.com";

/** Use as-is for blob: and http(s); only prefix relative server paths. */
function getPreviewUrl(value) {
    if (!value || typeof value !== "string") return "";
    if (value.startsWith("blob:") || /^https?:\/\//i.test(value)) return value;
    return `${BACKEND_ASSET_BASE}/${value.replace(/^\/+/, "")}`;
}

function isPdfPreview(preview, selectedFile) {
    if (selectedFile?.type === "application/pdf") return true;
    if (!preview || typeof preview !== "string") return false;
    const path = preview.split("?")[0].toLowerCase();
    return path.endsWith(".pdf") || /\.pdf($|[?#])/i.test(path);
}

/** List API populates `country` as { _id, name }; FormData must send the ObjectId string only. */
function parentCountryIdFromValue(country) {
    if (country == null || country === "") return "";
    if (typeof country === "object" && country._id) return String(country._id);
    return String(country);
}

function getThunkRejectMessage(res, fallback) {
    const payload = res?.payload;
    if (typeof payload === "string" && payload.trim()) return payload.trim();
    if (payload && typeof payload === "object") {
        const m = payload.message ?? payload.error;
        if (typeof m === "string" && m.trim()) return m.trim();
    }
    const errMsg = res?.error?.message;
    if (typeof errMsg === "string" && errMsg.trim() && errMsg !== "Rejected") return errMsg.trim();
    return fallback;
}

const CreateCountryDocs = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();
    const {allCountries} = useSelector(state=>state.abroadStudy)
    // console.log(allCountries,"||||||||||||||||||||||||||||");
    
    const fetchCountry  = async ()=>{
        const res  = await dispatch(allCountry());  
        // console.log(res,"+++++++++++++++++++++++++++++");
        
    }
    
    useEffect(()=>{
        fetchCountry();
    },[])

    // align keys with your Mongoose schema (accept common variants from older code)
    const initial = {
        // fields matching secondCountry schema
        name: ele?.name || "",
        country: parentCountryIdFromValue(ele?.country),
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
        if (!ele) return;
        setFormValues((prev) => ({
            ...prev,
            ...ele,
            country: parentCountryIdFromValue(ele.country),
        }));
        // eslint-disable-next-line
    }, [ele]);

    const [uploads, setUploads] = useState({
        flagURL: { progress: 0, preview: initial.flagURL || null, loading: false },
        vfs: { progress: 0, preview: initial.vfs || null, loading: false },
        step: { progress: 0, preview: initial.step || null, loading: false },
        whyThisCountry: { progress: 0, preview: initial.whyThisCountry || null, loading: false },
        faq: { progress: 0, preview: initial.faq || null, loading: false },
    });
    const [selectedFiles, setSelectedFiles] = useState({
        flagURL: null,
        vfs: null,
        step: null,
        whyThisCountry: null,
        faq: null,
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
        setSelectedFiles(prev => ({ ...prev, [fieldName]: file }));
        setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], loading: false, preview: previewURL, progress: 100 } }));
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
        if (anyUploading()) {
            toast.error("Please wait for file uploads to finish.");
            return;
        }

        // if (!validateForm()) {
        //     toast.error("Please fix validation errors.");
        //     return;
        // }

        try {
            const payload = new FormData();
            Object.entries(formValues).forEach(([key, value]) => {
                if (fileFields.includes(key)) return;
                if (value === undefined || value === null) return;
                if (key === "country") {
                    const id = parentCountryIdFromValue(value);
                    if (id) payload.append(key, id);
                    return;
                }
                if (typeof value === "object") return;
                payload.append(key, value);
            });
            fileFields.forEach((field) => {
                if (selectedFiles[field]) {
                    payload.append(field, selectedFiles[field]);
                } else if (formValues[field]) {
                    payload.append(field, formValues[field]);
                }
            });
            
            // nothing special to normalize for secondCountry schema

            if (ele && ele._id) {
                const res = await dispatch(updateSecondCountry({ id: ele._id, data: payload }));
                console.log(res,"res+++++++++++++++++++++++++++++")
                if (res?.meta?.requestStatus === "fulfilled") {
                    toast.success("Country updated");
                    fetchData?.();
                    handleClose?.();
                } else {
                    toast.error(getThunkRejectMessage(res, "Update failed"));
                }
            } else {
                const res = await dispatch(createSecondCountry(payload));
                if (res?.meta?.requestStatus === "fulfilled") {
                    toast.success("Country created");
                    fetchData?.();
                    handleClose?.();
                } else {
                    toast.error(getThunkRejectMessage(res, "Creation failed"));
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

                                    <div className="col-12">
                                        <label className="form-label">VFS (upload file)</label>
                                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'vfs')} className="form-control" />
                                        {uploads.vfs?.preview && (
                                            <div className="mt-2">
                                                {isPdfPreview(uploads.vfs.preview, selectedFiles.vfs) ? (
                                                    <a href={getPreviewUrl(uploads.vfs.preview)} target="_blank" rel="noreferrer">View PDF</a>
                                                ) : (
                                                    <img src={getPreviewUrl(uploads.vfs.preview)} alt="vfs" style={{ maxWidth: 200, maxHeight: 120, objectFit: "contain" }} />
                                                )}
                                                <div>Progress: {Math.round(uploads.vfs.progress)}%</div>
                                            </div>
                                        )}
                                    </div>

                                        <div className="col-12">
                                            <label className="form-label">Step (upload file)</label>
                                            <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'step')} className="form-control" />
                                            {uploads.step?.preview && (
                                                <div className="mt-2">
                                                    {isPdfPreview(uploads.step.preview, selectedFiles.step) ? (
                                                        <a href={getPreviewUrl(uploads.step.preview)} target="_blank" rel="noreferrer">View PDF</a>
                                                    ) : (
                                                        <img src={getPreviewUrl(uploads.step.preview)} alt="step" style={{ maxWidth: 200, maxHeight: 120, objectFit: "contain" }} />
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
                                                {isPdfPreview(uploads.whyThisCountry.preview, selectedFiles.whyThisCountry) ? (
                                                    <a href={getPreviewUrl(uploads.whyThisCountry.preview)} target="_blank" rel="noreferrer">View PDF</a>
                                                ) : (
                                                    <img src={getPreviewUrl(uploads.whyThisCountry.preview)} alt="Why this country" style={{ maxWidth: 200, maxHeight: 120, objectFit: "contain" }} />
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
                                                {isPdfPreview(uploads.faq.preview, selectedFiles.faq) ? (
                                                    <a href={getPreviewUrl(uploads.faq.preview)} target="_blank" rel="noreferrer">View PDF</a>
                                                ) : (
                                                    <img src={getPreviewUrl(uploads.faq.preview)} alt="faq" style={{ maxWidth: 200, maxHeight: 120, objectFit: "contain" }} />
                                                )}
                                                <div>Progress: {Math.round(uploads.faq.progress)}%</div>
                                            </div>
                                        )}
                                    </div>
{/* 
                                    <div className="col-md-6 mt-3">
                                        <label className="form-label">Flag Image</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'flagURL')} className="form-control" />
                                        {uploads.flagURL?.preview && (
                                            <div className="mt-2">
                                                <img src={getPreviewUrl(uploads.flagURL.preview)} alt="flag" style={{ maxWidth: 200, maxHeight: 120, objectFit: "contain" }} />
                                                <div>Progress: {Math.round(uploads.flagURL.progress)}%</div>
                                            </div>
                                        )}
                                    </div> */}

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
