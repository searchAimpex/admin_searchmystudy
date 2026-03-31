import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { fetchCountry, updateFile } from "../slice/CountrySlicr";
import { createCommission, updateCommission } from "../slice/comission";

const BACKEND_ASSET_BASE = "https://backend.searchmystudy.com";

function getPreviewUrl(value) {
    if (value == null || value === "") return "";
    let s = typeof value === "string" ? value.trim() : String(value).trim();
    if (!s) return "";
    const blobAt = s.toLowerCase().indexOf("blob:");
    if (blobAt > 0) s = s.slice(blobAt);
    if (/^blob:/i.test(s) || /^data:/i.test(s)) return s;
    if (/^https?:\/\//i.test(s)) return s;
    return `${BACKEND_ASSET_BASE}/${s.replace(/^\/+/, "")}`;
}

function isPdfPreview(preview, file) {
    if (file?.type === "application/pdf") return true;
    if (!preview || typeof preview !== "string") return false;
    const path = preview.split("?")[0].toLowerCase();
    return path.endsWith(".pdf") || /\.pdf($|[?#])/i.test(path);
}

const CreateCommission = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();
    // const  country  = useSelector(state => state);
    const [country, setCountry] = useState([]);
    console.log(country,"++++++++++++++++");
    const fetchAllCountries = async () => {
        const res = await dispatch(fetchCountry())
        setCountry(res.payload);
    }
    const initial = {
        SecondCountry: ele?.SecondCountry?.name || "",
        title: ele?.title ?? "",
        fileURL: ele?.fileURL,
        target: ele?.target ?? "",
    };
    
    const [formValues, setFormValues] = useState(initial);
    // initialize form values when the editing element changes (don't depend on country)
    useEffect(() => {
        const merged = { ...initial, ...(ele || {}) };
        // ensure title/target are strings (avoid NaN or unexpected types)
        merged.title = merged.title ?? "";
        merged.target = merged.target == null ? "" : String(merged.target);
        let sc = merged.SecondCountry;
        if (sc && typeof sc === 'object') sc = sc._id || sc.name || '';
        if (sc && Array.isArray(country) && country.length) {
            const found = country.find(c => c._id === sc || c.name === sc);
            if (found) sc = found._id;
        }
        merged.SecondCountry = sc || "";
        setFormValues(merged);
    }, [ele]);
    
    // fetch countries once on mount
    useEffect(() => {
        fetchAllCountries();
    }, [dispatch]);

    const [uploads, setUploads] = useState({
        fileURL: { preview: initial.fileURL || null, file: null },
    });

    // keep uploads previews in sync when ele changes
    useEffect(() => {
        if (!ele) return;
        setUploads(prev => {
            const next = { ...prev };
            if (ele.fileURL && !prev.fileURL?.file) next.fileURL = { ...next.fileURL, preview: ele.fileURL };
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
            const secondCountryId = (() => {
                const sc = formValues.SecondCountry;
                if (!sc) return "";
                if (Array.isArray(country) && country.find(c => c._id === sc)) return sc;
                const found = country?.find(c => c.name === sc || c._id === sc);
                return found ? found._id : sc;
            })();

            if (ele && ele._id) {
                const payload = { ...formValues, SecondCountry: secondCountryId };
                if (payload.target == null) payload.target = "";
                const res = await dispatch(updateCommission({ id: ele._id, data: payload }));
                console.log(res,"++++++++++++++++");
                toast.success("Commission updated");
                if (res?.meta?.requestStatus === "fulfilled") {
                    fetchData?.();
                } else {
                    const msg = res?.payload?.message || res?.error?.message || "Update failed";
                    toast.error(msg);
                }
            } else {
                const formData = new FormData();
                if (uploads.fileURL?.file) {
                    formData.append("fileURL", uploads.fileURL.file);
                } else if (uploads.fileURL?.preview && !String(uploads.fileURL.preview).startsWith("blob:")) {
                    formData.append("fileURL", uploads.fileURL.preview);
                }
                formData.append("SecondCountry", secondCountryId);
                formData.append("title", formValues.title || "");
                formData.append("target", formValues.target ?? "");
                const res = await dispatch(createCommission(formData));
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
                                            {(country || []).map((c) => (
                                                <option key={c._id} value={c._id}>{c?.country?.name}</option>
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
                                                {isPdfPreview(uploads.fileURL.preview, uploads.fileURL.file) ? (
                                                    <a href={getPreviewUrl(uploads.fileURL.preview)} target="_blank" rel="noreferrer">Open File (PDF)</a>
                                                ) : (
                                                    <img
                                                        src={getPreviewUrl(uploads.fileURL.preview)}
                                                        alt="Commission file"
                                                        style={{ maxWidth: 200, maxHeight: 120, objectFit: "contain" }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Target</label>
                                        <select name="target" id="target" value={formValues?.target || ""} onChange={handleInputChange} className="form-control">
                                            <option value="">Select Target</option>
                                            <option value="franchise">Franchise</option>
                                            <option value="partner">Partner</option>
                                        </select>
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
