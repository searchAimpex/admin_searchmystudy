import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { createFile, updateFile } from "../slice/CountrySlicr";
import { fetchAllUni } from "../slice/AbroadUniversitySlice";
import { toast } from "react-toastify";
import { fetchAllCountry } from "../slice/MbbsSlice";

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
                const res = await dispatch(updateFile({ id: ele._id, data: formData }));
                if (res?.meta?.requestStatus === "fulfilled") {
                    fetchData?.();
                    handleClose?.();
                    toast.success("File updated");
                } else {
                    const msg = res?.payload?.message || res?.error?.message || "Update failed";
                    toast.error(msg);
                }
            } else {
                const res = await dispatch(createFile(formData));
                console.log(res, "++++++++++++++++++++++++++++++");
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
                                                {(uploads.template.file?.name?.toLowerCase().endsWith(".pdf") || (typeof uploads.template.preview === "string" && uploads.template.preview.toLowerCase().includes(".pdf"))) ? (
                                                    <a href={uploads.template.preview} target="_blank" rel="noreferrer">Open Template (PDF)</a>
                                                ) : (
                                                    <img src={`https://backend.searchmystudy.com/${uploads.template.preview}`} alt="template" style={{ maxWidth: 200, maxHeight: 120 }} />
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
