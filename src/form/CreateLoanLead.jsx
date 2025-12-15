import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { statusLoanLead } from "../slice/loanLead";

const storage = getStorage(app);

const CreateLoanLead = ({ ele, handleClose, fetchData }) => {

    const dispatch = useDispatch();
    const initial = {
        status: ele?.status || "",
    };

    const [formValues, setFormValues] = useState(initial);

    // keep formValues in sync when editing element changes
    useEffect(() => {
      setFormValues({ status: ele?.status || "" });
    }, [ele]);
    
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
      try {
        // console.log(ele?._id, formValues,'======================');
        if (!ele?._id) {
          toast.error("No record selected");
          return;
        }
        
        // send a single object - createAsyncThunk receives one payload argument
        const result = await dispatch(statusLoanLead({ id: ele._id, data: formValues }));
        console.log(result, 'dispatch result');
          handleClose();
      fetchLoanLead();
        
      } catch (error) {
        console.log(error)
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
                                    {/* Personal fields mapped to initial */}
                                    <div className="col-md-4">
                                        <label className="form-label">Status</label>
                                        <select
                                          name="status"
                                          id="status"
                                          value={formValues?.status || ""}
                                          onChange={handleInputChange}
                                          className="form-control"
                                        >
                                            <option value="">Select Status</option>
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
                                <button type="submit" className="btn btn-primary">
                                    Create Partner
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
