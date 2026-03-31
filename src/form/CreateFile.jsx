import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { createFile, updateFile } from "../slice/CountrySlicr";
import { fetchAllUni } from "../slice/AbroadUniversitySlice";
import toast from "react-hot-toast";
import { fetchAllCountry } from "../slice/MbbsSlice";

const BACKEND_ASSET_BASE = "https://backend.searchmystudy.com";

function getPreviewUrl(value) {
    if (value == null || value === "") return "";
    let s = typeof value === "string" ? value.trim() : String(value).trim();
    if (!s) return "";

    // Undo wrong concat: https://backend.../blob:https://... → blob:https://...
    const blobAt = s.toLowerCase().indexOf("blob:");
    if (blobAt > 0) {
        s = s.slice(blobAt);
    }

    if (/^blob:/i.test(s) || /^data:/i.test(s)) return s;
    if (/^https?:\/\//i.test(s)) return s;
    return `${BACKEND_ASSET_BASE}/${s.replace(/^\/+/, "")}`;
}

/** RTK `.unwrap()` throws an error whose `payload` is the rejectWithValue argument. */
function getUnwrapErrorMessage(err) {
    if (err == null) return "Request failed";
    const payload = err.payload !== undefined ? err.payload : err;
    if (typeof payload === "string" && payload.trim()) return payload.trim();
    if (payload && typeof payload === "object" && typeof payload.message === "string") {
        return payload.message;
    }
    if (typeof err.message === "string" && err.message !== "Rejected") return err.message;
    return "Request failed";
}

function showFileSaveSuccess(message) {
    toast.success(message, {
        id: "file-save-success",
        duration: 5000,
        style: {
            background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "15px",
            padding: "16px 22px",
            borderRadius: "12px",
            boxShadow: "0 12px 40px rgba(5, 150, 105, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
        },
    });
}

const CreateFile = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();
    const [country, setCountry] = useState([]);
    const [loading, setLoading] = useState(false);
    // const  {country}  = useSelector(state => state?.country);
    const { AllUniversity } = useSelector(state => state?.abroadUniversity)
    // console.log(country, "++++++++++++++++++++++++++++++");
    const fetchAllCountries = async () => {
        try {
            setLoading(true);  

            const res = await dispatch(fetchAllCountry());
            const res1 = await dispatch(fetchAllUni());  

            setCountry(res.payload);
            // setCountry(res.payload)  
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
        // console.log(res.payload,"==================");
    }
    // align keys with your Mongoose schema (accept common variants from older code)
    const initial = {
        SecondCountry: ele?.SecondCountry?._id || ele?.SecondCountry || "",
        type: ele?.type || "",
        name: ele?.name || "",
        template: ele?.template || "",
        university: ele?.university?._id || ele?.university || ""
    };

    const [formValues, setFormValues] = useState(initial);
    // console.log(formValues)
    useEffect(() => {
        setFormValues({
            SecondCountry: ele?.SecondCountry?._id || ele?.SecondCountry || "",
            type: ele?.type || "",
            name: ele?.name || "",
            template: ele?.template || "",
            university: ele?.university?._id || ele?.university || "",
        });
        // populate upload previews from ele if available
        // eslint-disable-next-line
        fetchAllCountries()
    }, [ele]);

    const [uploads, setUploads] = useState({
        template: { preview: initial.template || null, file: null },
    });

    useEffect(() => {
        if (!ele) return;
        setUploads(prev => {
            const next = { ...prev };
            if (ele.template && !prev.template?.file) next.template = { ...next.template, preview: ele.template };
            return next;
        });
    }, [ele]);

    const anyUploading = () => false;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewURL = URL.createObjectURL(file);
        setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], preview: previewURL, file } }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            if (uploads.template?.file) {
                formData.append("template", uploads.template.file);
            } else if (uploads.template?.preview && !String(uploads.template.preview).startsWith("blob:")) {
                formData.append("template", uploads.template.preview);
            }

            formData.append("name", formValues.name ?? "");
            formData.append("type", formValues.type ?? "");
            const countryId = typeof formValues.SecondCountry === "object" ? formValues.SecondCountry?._id : formValues.SecondCountry;
            formData.append("SecondCountry", countryId ?? "");
            const uniId = typeof formValues.university === "object" ? formValues.university?._id : formValues.university;
            formData.append("university", uniId ?? "");

            if (ele && ele._id) {
                await dispatch(updateFile({ id: ele._id, data: formData })).unwrap();
                showFileSaveSuccess("File updated successfully");
                handleClose?.();
                await fetchData?.();
            } else {
                await dispatch(createFile(formData)).unwrap();
                showFileSaveSuccess("File created successfully");
                handleClose?.();
                await fetchData?.();
            }
        } catch (err) {
            console.error(err);
            const fromApi =
                err?.response?.data?.message ??
                (typeof err?.response?.data === "string" ? err.response.data : null);
            const msg =
                fromApi ??
                getUnwrapErrorMessage(err) ??
                err?.message ??
                "Unexpected error";
            toast.error(typeof msg === "string" ? msg : "Unexpected error", {
                id: "file-save-error",
                duration: 6000,
                style: {
                    background: "#b91c1c",
                    color: "#fff",
                    fontWeight: 600,
                    padding: "14px 20px",
                    borderRadius: "12px",
                    maxWidth: 420,
                },
            });
        }
    };

    return (
        <>
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
                                        <select name="university" value={typeof formValues.university === "object" ? formValues.university?._id : formValues.university || ""} onChange={handleInputChange} className="form-control">
                                            <option value="">Select University</option>
                                            {
                                                AllUniversity.map((e) => (
                                                    <option key={e._id} value={e._id}>{e.name}</option>
                                                ))
                                            }

                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Country</label>
                                        <select
                                            name="SecondCountry"
                                            value={typeof formValues.SecondCountry === "object" ? formValues.SecondCountry?._id : formValues?.SecondCountry || ""}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        >
                                            <option value="">Select Country</option>

                                            {loading ? (
                                                <option disabled>Loading countries...</option>
                                            ) : (
                                                country?.map((e) => (
                                                    <option key={e._id} value={e._id}>
                                                        {e.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="template" className="form-label">Template/Broucher</label>
                                        <input type="file" name="template" id="template" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'template')} className="form-control" />
                                        {uploads.template?.preview && (
                                            <div className="mt-2">
                                                {(uploads.template.file?.type === "application/pdf" ||
                                                    uploads.template.file?.name?.toLowerCase().endsWith(".pdf") ||
                                                    (typeof uploads.template.preview === "string" && uploads.template.preview.split("?")[0].toLowerCase().includes(".pdf"))) ? (
                                                    <a href={getPreviewUrl(uploads.template.preview)} target="_blank" rel="noreferrer">Open Template (PDF)</a>
                                                ) : (
                                                    <img src={getPreviewUrl(uploads.template.preview)} alt="template" style={{ maxWidth: 200, maxHeight: 120, objectFit: "contain" }} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                                <button type="submit" className="btn btn-primary" disabled={anyUploading()}>
                                    {anyUploading() ? "Uploading..." : (ele && ele._id ? "Update File" : "Create File")}
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
