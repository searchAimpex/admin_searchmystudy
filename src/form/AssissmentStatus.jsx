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

const storage = getStorage(app);

const AssissmentStatus = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();
    const { allCountries } = useSelector(state => state.abroadStudy);
    console.log(ele, "???????????????????????????????????");

    const fetchAllCountries = async () => {
        const res = await dispatch(allCountry())
        console.log(res);
    }
    // align keys with your Mongoose schema (accept common variants from older code)
    const initial = {
        // User: ele?.User || "", // Don't include User - it should be set by backend/auth
        firstName: ele?.firstName || "",
        middleName: ele?.middleName || "",
        lastName: ele?.lastName || "",
        passportNumber: ele?.passportNumber || "",
        dob: ele?.dob || "",
        lastEdu: ele?.lastEdu || "",
        yearOfPassing: ele?.yearOfPassing || "",
        gradesInLastYear: ele?.gradesInLastYear || "",
        english12Grade: ele?.english12Grade || "",
        englishTest: ele?.englishTest || "",
        remarks: ele?.remarks || "",
        mobileNumber: ele?.mobileNumber || "",
        emailID: ele?.emailID || "",
        Country: ele?.Country || "",
        Course: ele?.Course || "",
        // document fields (files)
        resume: ele?.resume || "",
        englishTestScorecard: ele?.englishTestScorecard || "",
        acadmics: ele?.acadmics || "",
        englishTestDoc: ele?.englishTestDoc || "",
        status:ele?.status || "",
        workExperienceDoc: ele?.workExperienceDoc || ""
    };

    const [formValues, setFormValues] = useState(initial);



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await dispatch(updateAssessment())
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
                            <h5 className="modal-title"> Status Management</h5>
                            <button type="button" className="btn-close" onClick={handleClose}></button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="m-4">
                                <label className="form-label">Status</label>
                                <select name="Country" value={formValues.status} 
                                // onChange={handleInputChange}
                                 className="form-control">
                                    <option value="">Status</option>
                                   <option value="pending">Pending</option>
                                   <option value="shared">Shared</option>
                                   <option value="eligible">Eligible</option>
                                   <option value="ineligible">Ineligible</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                                <button type="submit" className="btn btn-primary" >
                                    Save
                                </button>
                            </div>
                        </form>




                    </div>
                </div>
            </div>
        </>
    );
};

export default AssissmentStatus;
