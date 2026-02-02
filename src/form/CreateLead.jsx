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
  // align keys with Mongoose schema
  const initial = {
    trackingId: ele?.trackingId || "",
    firstName: ele?.firstName || "",
    middleName: ele?.middleName || "",
    lastName: ele?.lastName || "",
    city: ele?.city || "",
    gender: ele?.gender || "",
    adhaar: ele?.adhaar || "",
    passportNumber: ele?.passportNumber || "",
    dob: ele?.dob || "",
    address: ele?.address || "",
    pincode: ele?.pincode || "",
    mobileNumber: ele?.mobileNumber || "",
    emailID: ele?.emailID || "",
    courselevel: ele?.courselevel || "",
    grade: ele?.grade || "",
    qualifiedTestName: ele?.qualifiedTestName || "",
    qualifiedTestYear: ele?.qualifiedTestYear || "",
    qualifiedTestResultType: ele?.qualifiedTestResultType || "",
    qualifiedTestImage: ele?.qualifiedTestImage || "",
    qualifiedTestGrade: ele?.qualifiedTestGrade || "",
    lastEdu: ele?.lastEdu || "",
    lastQualificationCourseName: ele?.lastQualificationCourseName || "",
    lastQualificationSpecialization: ele?.lastQualificationSpecialization || "",
    category: ele?.category || "",
    lastQualificationResultType: ele?.lastQualificationResultType || "",
    englishtestimage: ele?.englishtestimage || "",
    yearOfPassing: ele?.yearOfPassing || "",
    gradesInLastYear: ele?.gradesInLastYear || "",
    english12Grade: ele?.english12Grade || "",
    english12ResultType: ele?.english12ResultType || "",
    englishTest: ele?.englishTest || "",
    englishTestYear: ele?.englishTestYear || "",
    remarks: ele?.remarks || "",
    Country: ele?.Country || "",
    Course: ele?.Course || "",
    specialization: ele?.specialization || "",
    resume: ele?.resume || "",
    englishTestScorecard: ele?.englishTestScorecard || "",
    acadmics: ele?.acadmics || "",
    englishTestDoc: ele?.englishTestDoc || "",
    workExperienceDoc: ele?.workExperienceDoc || "",
    workExperience: ele?.workExperience ?? false,
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
    qualifiedTestImage: { progress: 0, preview: initial.qualifiedTestImage || null, loading: false },
    englishtestimage: { progress: 0, preview: initial.englishtestimage || null, loading: false },
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
    const { name, value, type, checked } = e.target;
    setFormValues(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
    if (!formValues.Country?.trim()) newErrors.Country = "Country is required";
    if (!formValues.emailID?.trim()) newErrors.emailID = "Email is required";
    if (!formValues.mobileNumber?.trim()) newErrors.mobileNumber = "Mobile number is required";
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
    "qualifiedTestImage",
    "englishtestimage",
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

      // Remove empty User field (User is ObjectId ref, not string)
      if (payload.User == null || (typeof payload.User === "string" && payload.User.trim() === "")) {
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
          toast.success("Lead updated");
          fetchData?.();
          handleClose?.();
        } else {
          const msg = res?.payload?.message || res?.error?.message || "Update failed";
          toast.error(msg);
        }
      } else {

        const res = await dispatch(createAssessment(payload));
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Lead created");
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
        <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
          <div className="modal-content p-20">
            <div className="modal-header">
              
              <h5 className="modal-title">{ele ? "Edit Lead" : "Create Lead"}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label text-muted">Tracking ID {ele?.trackingId && "(read-only)"}</label>
                    <input name="trackingId" value={formValues.trackingId} onChange={handleInputChange} readOnly={!!ele?.trackingId} className={`form-control form-control-sm ${ele?.trackingId ? 'bg-light' : ''}`} placeholder={ele?.trackingId ? '' : 'Optional'} />
                  </div>

                  {/* ——— Personal Details ——— */}
                  <div className="col-12">
                    <h6 className="mb-3" style={{ fontWeight: 600, borderBottom: '2px solid #0d9488', paddingBottom: 8 }}>
                      Personal Details
                    </h6>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">First Name</label>
                    <input name="firstName" value={formValues.firstName} onChange={handleInputChange} className="form-control" placeholder="Candidate First Name" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Middle Name</label>
                    <input name="middleName" value={formValues.middleName} onChange={handleInputChange} className="form-control" placeholder="Candidate Middle Name" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Last Name</label>
                    <input name="lastName" value={formValues.lastName} onChange={handleInputChange} className="form-control" placeholder="Candidate Last Name" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Gender</label>
                    <select name="gender" value={formValues.gender} onChange={handleInputChange} className="form-control">
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Aadhar Number</label>
                    <input name="adhaar" value={formValues.adhaar} onChange={handleInputChange} className="form-control" placeholder="Aadhar Number" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Passport Number</label>
                    <input name="passportNumber" value={formValues.passportNumber} onChange={handleInputChange} className="form-control" placeholder="Passport Number" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Mobile Number</label>
                    <input name="mobileNumber" value={formValues.mobileNumber} onChange={handleInputChange} className="form-control" placeholder="Mobile Number" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Email Address</label>
                    <input name="emailID" value={formValues.emailID} onChange={handleInputChange} type="email" className="form-control" placeholder="Email Address" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">City</label>
                    <input name="city" value={formValues.city} onChange={handleInputChange} className="form-control" placeholder="City" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Address</label>
                    <input name="address" value={formValues.address} onChange={handleInputChange} className="form-control" placeholder="Address" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Pincode</label>
                    <input name="pincode" value={formValues.pincode} onChange={handleInputChange} className="form-control" placeholder="Pincode" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" name="dob" value={formValues.dob} onChange={handleInputChange} className="form-control" placeholder="mm/dd/yyyy" />
                  </div>

                  {/* ——— Applied For Course ——— */}
                  <div className="col-12 mt-4">
                    <h6 className="mb-3" style={{ fontWeight: 600, borderBottom: '2px solid #0d9488', paddingBottom: 8 }}>
                      Applied For Course
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Course Name</label>
                    <input name="Course" value={formValues.Course} onChange={handleInputChange} className="form-control" placeholder="Course Name" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Specialization Name</label>
                    <input name="specialization" value={formValues.specialization} onChange={handleInputChange} className="form-control" placeholder="Specialization Name" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Country</label>
                    <select name="Country" value={formValues.Country} onChange={handleInputChange} className="form-control">
                      <option value="">Select Country</option>
                      {(allCountries || []).map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Course Level</label>
                    <input name="courselevel" value={formValues.courselevel} onChange={handleInputChange} className="form-control" placeholder="Course Level" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Grade</label>
                    <input name="grade" value={formValues.grade} onChange={handleInputChange} className="form-control" placeholder="Grade" />
                  </div>

                  {/* ——— Latest Qualification ——— */}
                  <div className="col-12 mt-4">
                    <h6 className="mb-3" style={{ fontWeight: 600, borderBottom: '2px solid #2563eb', paddingBottom: 8 }}>
                      Latest Qualification
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Enter Course Name</label>
                    <input name="lastQualificationCourseName" value={formValues.lastQualificationCourseName} onChange={handleInputChange} className="form-control" placeholder="Course Name" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Specialization Name</label>
                    <input name="lastQualificationSpecialization" value={formValues.lastQualificationSpecialization} onChange={handleInputChange} className="form-control" placeholder="Specialization Name" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Enter Course Level (Category)</label>
                    <select name="category" value={formValues.category} onChange={handleInputChange} className="form-control">
                      <option value="">Select Category</option>
                      <option value="10th">10th</option>
                      <option value="12th">12th</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Year of Passing</label>
                    <input name="yearOfPassing" value={formValues.yearOfPassing} onChange={handleInputChange} className="form-control" placeholder="Passing Year" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Result Type</label>
                    <select name="lastQualificationResultType" value={formValues.lastQualificationResultType} onChange={handleInputChange} className="form-control">
                      <option value="">Select</option>
                      <option value="grade">Grade</option>
                      <option value="score">Score</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Select Last Qualification</label>
                    <select name="lastEdu" value={formValues.lastEdu} onChange={handleInputChange} className="form-control">
                      <option value="">Select Last Qualification</option>
                      <option value="10th">10th</option>
                      <option value="12th">12th</option>
                      <option value="DIPLOMA 10+3">Diploma 10+3</option>
                      <option value="BACHELOR DEGREE">Bachelor Degree</option>
                      <option value="BACHELOR IN TECHNOLOGY">Bachelor in Technology</option>
                      <option value="MASTER DEGREE">Master Degree</option>
                      <option value="MASTER IN TECHNOLOGY">Master in Technology</option>
                      <option value="POST GRADUATE">Post Graduate</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Grades in Last Year</label>
                    <input name="gradesInLastYear" value={formValues.gradesInLastYear} onChange={handleInputChange} className="form-control" placeholder="Grades" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">English 12 Grade</label>
                    <input name="english12Grade" value={formValues.english12Grade} onChange={handleInputChange} className="form-control" placeholder="Grade" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">English 12 Result Type</label>
                    <select name="english12ResultType" value={formValues.english12ResultType} onChange={handleInputChange} className="form-control">
                      <option value="">Select</option>
                      <option value="grade">Grade</option>
                      <option value="cgpa">CGPA</option>
                    </select>
                  </div>

                  {/* ——— Qualified Test ——— */}
                  <div className="col-12 mt-4">
                    <h6 className="mb-3" style={{ fontWeight: 600, borderBottom: '2px solid #2563eb', paddingBottom: 8 }}>
                      Qualified Test
                    </h6>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Test Name</label>
                    <input name="qualifiedTestName" value={formValues.qualifiedTestName} onChange={handleInputChange} className="form-control" placeholder="Test Name" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Year Of Passing</label>
                    <input name="qualifiedTestYear" value={formValues.qualifiedTestYear} onChange={handleInputChange} className="form-control" placeholder="Year Of Passing" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Result Type</label>
                    <select name="qualifiedTestResultType" value={formValues.qualifiedTestResultType} onChange={handleInputChange} className="form-control">
                      <option value="">Select</option>
                      <option value="grade">Grade</option>
                      <option value="score">Score</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Qualified Test Grade / Score</label>
                    <input name="qualifiedTestGrade" value={formValues.qualifiedTestGrade} onChange={handleInputChange} className="form-control" placeholder="Grade or Score" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Upload Test Result</label>
                    <div className="border border-2 border-primary border-dashed rounded p-3" style={{ borderStyle: 'dashed' }}>
                      <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'qualifiedTestImage')} className="form-control" id="qualifiedTestImage" />
                      {uploads.qualifiedTestImage?.preview && (
                        <small className="d-block mt-2">
                          <a href={uploads.qualifiedTestImage.preview} target="_blank" rel="noreferrer">View file</a>
                        </small>
                      )}
                    </div>
                  </div>

                  {/* ——— Language Test ——— */}
                  <div className="col-12 mt-4">
                    <h6 className="mb-3" style={{ fontWeight: 600, borderBottom: '2px solid #2563eb', paddingBottom: 8 }}>
                      Language Test
                    </h6>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">English Test</label>
                    <select name="englishTest" value={formValues.englishTest} onChange={handleInputChange} className="form-control">
                      <option value="">Select</option>
                      <option value="WITH IELTS">WITH IELTS</option>
                      <option value="WITHOUT IELTS">WITHOUT IELTS</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Year Of Passing</label>
                    <input name="englishTestYear" value={formValues.englishTestYear} onChange={handleInputChange} className="form-control" placeholder="Year Of Passing" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">English 12 Result Type</label>
                    <select name="english12ResultType" value={formValues.english12ResultType} onChange={handleInputChange} className="form-control">
                      <option value="">Select</option>
                      <option value="grade">Grade</option>
                      <option value="cgpa">CGPA</option>
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">English Test Scorecard</label>
                    <div className="border border-2 border-primary rounded p-3" style={{ borderStyle: 'dashed' }}>
                      <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'englishTestScorecard')} className="form-control" />
                      {uploads.englishTestScorecard?.preview && (
                        <small className="d-block mt-2">
                          <a href={uploads.englishTestScorecard.preview} target="_blank" rel="noreferrer">View file</a>
                        </small>
                      )}
                    </div>
                  </div>

                  {/* ——— Documents Upload ——— */}
                  <div className="col-12 mt-4">
                    <h6 className="mb-3" style={{ fontWeight: 600, borderBottom: '2px solid #2563eb', paddingBottom: 8 }}>
                      Documents Upload
                    </h6>
                  </div>
                  {[
                    { key: 'acadmics', label: 'Add Last Qualification', accept: 'image/*,application/pdf' },
                    { key: 'englishTestScorecard', label: 'English Test Scorecard', accept: 'application/pdf' },
                    { key: 'qualifiedTestImage', label: 'Add Any Qualified Test', accept: 'image/*,application/pdf' },
                    { key: 'englishtestimage', label: 'English Test Image', accept: 'image/*,application/pdf' },
                    { key: 'englishTestDoc', label: 'Any Other Test', accept: 'application/pdf' },
                    { key: 'workExperienceDoc', label: 'Add If Any Experience', accept: 'application/pdf' },
                    { key: 'resume', label: 'Add Resume', accept: 'application/pdf' },
                  ].map(({ key, label, accept }) => (
                    <div className="col-md-6" key={key}>
                      <label className="form-label">{label}</label>
                      <div className="border border-2 border-primary rounded p-3" style={{ borderStyle: 'dashed' }}>
                        <input type="file" accept={accept} onChange={(e) => handleFileChange(e, key)} className="form-control" />
                        {uploads[key]?.preview && (
                          <small className="d-block mt-2">
                            <a href={uploads[key].preview} target="_blank" rel="noreferrer">View file</a>
                          </small>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="col-12 mt-3">
                    <label className="d-flex align-items-center gap-2">
                      <input type="checkbox" name="workExperience" checked={formValues.workExperience} onChange={handleInputChange} />
                      Work Experience
                    </label>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Remarks</label>
                    <textarea name="remarks" value={formValues.remarks} onChange={handleInputChange} className="form-control" rows={2} placeholder="Remarks" />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                <button type="submit" className="btn btn-primary" disabled={anyUploading()}>
                  {anyUploading() ? "Uploading..." : (ele && ele._id ? "Update Lead" : "Create Lead")}
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
