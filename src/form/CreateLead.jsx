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

const CreateLead = ({ ele, handleClose, fetchData }) => {
  const dispatch = useDispatch();
  const { allCountries } = useSelector(state => state.abroadStudy);
  console.log(ele,"???????????????????????????????????");

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
    workExperienceDoc: ele?.workExperienceDoc || ""
  };

  const [formValues, setFormValues] = useState(initial);

  useEffect(() => {
    setFormValues(prev => ({ ...prev, ...(ele || {}) }));
    // populate upload previews from ele if available
    // eslint-disable-next-line
    fetchAllCountries()
  }, [ele]);

  const [uploads, setUploads] = useState({

    resume: { progress: 0, preview: initial.resume || null, loading: false },
    englishTestScorecard: { progress: 0, preview: initial.englishTestScorecard || null, loading: false },
    acadmics: { progress: 0, preview: initial.acadmics || null, loading: false },
    englishTestDoc: { progress: 0, preview: initial.englishTestDoc || null, loading: false },
    workExperienceDoc: { progress: 0, preview: initial.workExperienceDoc || null, loading: false },
  });

  // keep uploads previews in sync when ele changes
  useEffect(() => {
    if (!ele) return;
    setUploads(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (ele[k]) next[k].preview = ele[k];
      });
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

    const storageRef = ref(storage, `partners/${fieldName}/${Date.now()}_${file.name}`);
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
    if (!formValues.Country?.trim()) newErrors.OwnerName = "country is required";
    if (!formValues.emailID?.trim()) newErrors.email = "Email is required";
    if (!formValues.ContactNumber?.trim()) newErrors.ContactNumber = "Contact number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const [errors, setErrors] = useState({});

  const fileFields = [

    "resume",
    "englishTestScorecard",
    "acadmics",
    "englishTestDoc",
    "workExperienceDoc",
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
      const payload = { ...formValues };

      // Remove empty User field or fields that are empty strings
      if (!payload.User || payload.User.trim() === "") {
        delete payload.User;
      }

      // Remove empty dob if not set
      if (!payload.dob) {
        delete payload.dob;
      }

      if (payload.DateOfBirth) {
        payload.DateOfBirth = new Date(payload.DateOfBirth).toISOString();
      }

      // don't overwrite password with empty value on update
      if (ele && ele._id && !payload.password) delete payload.password;

      if (ele && ele._id) {
        const res = await dispatch(updateAssessment({ id: ele._id, data: payload }));
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Partner updated");
          fetchData?.();
          handleClose?.();
        } else {
          const msg = res?.payload?.message || res?.error?.message || "Update failed";
          toast.error(msg);
        }
      } else {

        const res = await dispatch(createAssessment(payload));
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Partner created");
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
              <h5 className="modal-title">{ele ? "Edit Lead" : "Create Lead"}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="row g-3">
                  {/* Personal / assessment fields */}
                  <div className="col-md-4">
                    <label className="form-label">First Name</label>
                    <input name="firstName" value={formValues.firstName} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Middle Name</label>
                    <input name="middleName" value={formValues.middleName} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Last Name</label>
                    <input name="lastName" value={formValues.lastName} onChange={handleInputChange} className="form-control" />
                  </div>

                  {/* User field is managed by backend/auth - don't include in form */}

                  <div className="col-md-4">
                    <label className="form-label">Passport Number</label>
                    <input name="passportNumber" value={formValues.passportNumber} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Date Of Birth</label>
                    <input type="date" name="dob" value={formValues.dob} onChange={handleInputChange} className="form-control" />
                  </div>





                  <div className="col-md-6">
                    <label className="form-label">Mobile Number</label>
                    <input name="mobileNumber" value={formValues.mobileNumber} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email ID</label>
                    <input name="emailID" value={formValues.emailID} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Country</label>
                    <select name="Country" value={formValues.Country} onChange={handleInputChange} className="form-control">
                      <option value="">Select Country</option>
                      {
                        allCountries.map((e) => (
                          <option key={e._id} value={e._id}>{e.name}</option>
                        ))
                      }
                    </select>
                  </div>    

                  <div className="col-md-6">
                    <label className="form-label">Course</label>
                    <input name="Course" value={formValues.Course} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Last Education</label>
                    <select name="lastEdu" value={formValues.lastEdu} onChange={handleInputChange} className="form-control">
                      <option value="">Select Education Level</option>
                      <option value="10th">10th Standard</option>
                      <option value="12th">12th Standard</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Bachelor">Bachelor's Degree</option>
                      <option value="Master">Master's Degree</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Year Of Passing</label>
                    <input name="yearOfPassing" value={formValues.yearOfPassing} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Grades In Last Year</label>
                    <input name="gradesInLastYear" value={formValues.gradesInLastYear} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">English (12) Grade</label>
                    <input name="english12Grade" value={formValues.english12Grade} onChange={handleInputChange} className="form-control" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">English Test</label>
                    <select name="englishTest" value={formValues.englishTest} onChange={handleInputChange} className="form-control">
                      <option value="">Select Test Type</option>
                      <option value="WITH IELTS">WITH IELTS</option>
                      <option value="WITHOUT IELTS">WITHOUT IELTS</option>
                      {/* <option value="PTE">PTE</option>
                      <option value="CAE">CAE</option>
                      <option value="FCE">FCE</option>
                      <option value="Duolingo">Duolingo</option> */}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Remarks</label>
                    <textarea name="remarks" value={formValues.remarks} onChange={handleInputChange} className="form-control" />
                  </div>

                  {/* Documents Section */}
                  <div className="col-12">
                    <h6 className="mb-3 mt-3" style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                      Upload Documents
                    </h6>
                  </div>

                  {/* Render file inputs with per-field labels/accept and proper preview handling */}
                  {fileFields.map((f) => {
                    const meta = {
                      resume: { label: 'Resume', accept: 'application/pdf' },
                      englishTestScorecard: { label: 'English Test Scorecard', accept: 'application/pdf' },
                      acadmics: { label: 'Academics (marksheet)', accept: 'image/*,application/pdf' },
                      englishTestDoc: { label: 'English Test Document', accept: 'application/pdf' },        
                      workExperienceDoc: { label: 'Work Experience Document', accept: 'application/pdf' },
                    }[f] || { label: f, accept: 'image/*,application/pdf' };

                    const preview = uploads[f]?.preview;
                    const isPdf = typeof preview === 'string' && preview.toLowerCase().includes('.pdf');

                    return (
                      <div className="col-md-6" key={f}>
                        <label className="form-label">{meta.label}</label>
                        <input type="file" accept={meta.accept} onChange={(e) => handleFileChange(e, f)} className="form-control" />

                        {preview && (
                          <div className="mt-2">
                            {isPdf ? (
                              <a href={preview} style={{color:"red"}} target="_blank" rel="noreferrer">Open PDF</a>
                            ) : (
                              <img src={preview} alt={f} style={{ maxWidth: 200, maxHeight: 120 }} />
                            )}
                            <div>
                              {isPdf ? `Progress: ${Math.round(uploads[f].progress)}%` : ""}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

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

export default CreateLead;
