import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createPartner, updatePartner } from "../slice/PartnerSlice";
import { createAssessment, statusAssesmment, updateAssessment } from "../slice/AssessmentSlice";
import { allCountry } from "../slice/AbroadSlice";
import { useSelector } from "react-redux";
import { updateTicketStatus } from "../slice/ticket";

const storage = getStorage(app);

const TicketStatus = ({ ele, handleClose, fetchData }) => {
    const dispatch = useDispatch();
    const { allCountries } = useSelector(state => state.abroadStudy);
    
    const fetchAllCountries = async () => {
        const res = await dispatch(allCountry())
        console.log(res);
    }
    // align keys with your Mongoose schema (accept common variants from older code)
    const initial = {   
        status:ele?.status || "",
        remark:ele?.remark || ""
    };
    
    const [formValues, setFormValues] = useState(initial);
    
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
            const payload = { ...formValues };

        try {
            console.log(payload,"|||||||||||||||||||||||||");
            
            const data = await dispatch(updateTicketStatus({ id: ele._id, data: payload }))
            console.log(data,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            if(data?.meta?.requestStatus === "fulfilled"){
                toast.success("Status Updated Successfully");
                handleClose();
                fetchData();
            }else{
                toast.error(data?.payload?.message || "Failed to update status");
            }
        } catch (error) {
            console.log(error)
        }
        
    };
    
    // console.log(formValues, "???????????????????????????????????");
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
                                <label className="form-label">Edit Status</label>
                                <select name="Country" 
                                // value={formValues.status} 
                                onChange={(e)=>{setFormValues({...formValues,status:e.target.value})}}
                                 className="form-control">
                                    <option value="" disabled>Status</option>
                                   <option value="open">Open</option>
                                   <option value="progress">In progress</option>
                                   <option value="resolved">Resolved</option>
                                   <option value="closed">Closed</option>
                                </select>
                            </div>
                               <div className="m-4">
                                <label className="form-label">Remark</label>
                           <input
                                type="text"
                                 className="form-control"
                                value={formValues.remark}
                                onChange={(e) => setFormValues({ ...formValues, remark: e.target.value })}
                                />
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

export default TicketStatus;
