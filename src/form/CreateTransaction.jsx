import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { app } from "../firebase";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {  createTransaction } from "../slice/transaction";

const storage = getStorage(app);

const CreateTransaction = ({ ele, handleClose, fetchData }) => {
  const dispatch = useDispatch();

  /* ================= INITIAL STATE ================= */
  const initial = {
    amount: ele?.amount || "",
    transactionDate: ele?.transactionDate || "",
    transactionID: ele?.transactionID || "",
    transactionMode: ele?.transactionMode || "",
    remarks: ele?.remarks || "",
    centerCode: ele?.centerCode || "",
    invoice: ele?.invoice || "",
    receipt: ele?.receipt || "",
    other: ele?.other || "",
  };

  const [formValues, setFormValues] = useState(initial);

  /* ================= FILE UPLOAD STATE ================= */
  const [uploads, setUploads] = useState({
    invoice: { progress: 0, preview: ele?.invoice || null, loading: false },
    receipt: { progress: 0, preview: ele?.receipt || null, loading: false },
    other: { progress: 0, preview: ele?.other || null, loading: false },
  });

  useEffect(() => {
    if (ele) {
      setFormValues({ ...initial });
    }
    // eslint-disable-next-line
  }, [ele]);

  const anyUploading = () =>
    Object.values(uploads).some((u) => u.loading);

  /* ================= INPUT HANDLER ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= FILE UPLOAD HANDLER ================= */
  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storageRef = ref(
      storage,
      `transactions/${field}/${Date.now()}_${file.name}`
    );

    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploads((prev) => ({
      ...prev,
      [field]: { ...prev[field], loading: true, progress: 0 },
    }));

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploads((prev) => ({
          ...prev,
          [field]: { ...prev[field], progress },
        }));
      },
      (error) => {
        console.error(error);
        toast.error(`Failed to upload ${field}`);
        setUploads((prev) => ({
          ...prev,
          [field]: { progress: 0, preview: null, loading: false },
        }));
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setFormValues((prev) => ({ ...prev, [field]: url }));
        setUploads((prev) => ({
          ...prev,
          [field]: { progress: 100, preview: url, loading: false },
        }));
        toast.success(`${field} uploaded`);
      }
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (anyUploading()) {
      toast.error("Please wait for uploads to finish");
      return;
    }

    try {
      let res;
      if (ele?._id) {
        res = await dispatch(
          // updateTransaction({ id: ele._id, data: formValues })
        );
      } else {
        console.log(formValues);
        
        res = await dispatch(createTransaction(formValues));

      }

      if (res?.meta?.requestStatus === "fulfilled") {
        toast.success(
          ele ? "Transaction updated" : "Transaction created"
        );
        fetchData?.();
        handleClose?.();
      } else {
        toast.error("Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <ToastContainer />

      <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">
                {ele ? "Edit Transaction" : "Create Transaction"}
              </h5>
              <button className="btn-close" onClick={handleClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                className="modal-body"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <div className="row g-3">

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={formValues.amount}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Transaction Date
                    </label>
                    <input
                      type="date"
                      name="transactionDate"
                      value={formValues.transactionDate}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      name="transactionID"
                      value={formValues.transactionID}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Transaction Mode
                    </label>
                    <select
                      name="transactionMode"
                      value={formValues.transactionMode}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="">Select Mode</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Center Code
                    </label>
                    <input
                      type="text"
                      name="centerCode"
                      value={formValues.centerCode}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Remarks</label>
                    <textarea
                      name="remarks"
                      value={formValues.remarks}
                      onChange={handleInputChange}
                      className="form-control"
                      rows={3}
                    />
                  </div>

                  {/* Upload Section */}
                  <div className="col-12 mt-3">
                    <h6 className="fw-bold border-bottom pb-2">
                      Upload Documents
                    </h6>
                  </div>

                  {["invoice", "receipt", "other"].map((f) => (
                    <div className="col-md-4" key={f}>
                      <label className="form-label fw-semibold">
                        {f.toUpperCase()}
                      </label>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        className="form-control"
                        onChange={(e) => handleFileChange(e, f)}
                      />
                      {uploads[f]?.preview && (
                        <a
                          href={uploads[f].preview}
                          target="_blank"
                          rel="noreferrer"
                          className="d-block mt-1 text-primary"
                        >
                          View {f}
                        </a>
                      )}
                    </div>
                  ))}

                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={anyUploading()}
                >
                  {anyUploading()
                    ? "Uploading..."
                    : ele
                    ? "Update Transaction"
                    : "Create Transaction"}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTransaction;
