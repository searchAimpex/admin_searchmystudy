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
import { statusLoanLead } from "../slice/loanLead";

const storage = getStorage(app);

const CreateLoanLead = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();
    const initial = {
        firstName: ele?.firstName || "",
    };

    const [formValues, setFormValues] = useState(initial);


    const handleSubmit = async (e) => {
        e.preventDefault();
      try {
        const data = await dispatch(statusLoanLead(ele._id, formValues));
        console.log(data,'======================');
        
      } catch (error) {
        console.log(error)
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
                                    {/* Personal fields mapped to initial */}
                                    <div className="col-md-4">
                                        <label className="form-label">First Name</label>
                                        <select name="" id="">
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
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

export default CreateLoanLead;
