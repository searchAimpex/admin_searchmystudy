import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect } from "react";
import { fetchProfile, updateProfile } from "../slice/profileSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import logo from "../assets/SearchMyStudy.png"
import logo1 from "../assets/profile.png";

const ViewProfileLayer = () => {
  const [imagePreview, setImagePreview] = useState("assets/images/user-grid/user-grid-img13.png");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    name: "",
    passwordTracker:null,
    email: "",
    ContactNumber: "",
    role: "",
    password:"",
    bio: ""
  });
  const getProfile = async () => {
    try {
      const res = await dispatch(fetchProfile());
      setProfile(res?.payload);

      if (res?.payload) {
        setForm({
          name: res.payload.name || "",
          email: res.payload.email || "",
          ContactNumber: res.payload.ContactNumber || "",
          role: res.payload.role || "",
          bio: res.payload.bio || ""
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProfile();
  }, [dispatch]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: value
    }));
  };
  const handleUpdate = async () => {
    try {
      const res = await dispatch(updateProfile({ id: profile?._id, data: form }));
      console.log(res, ":::::::::::::::::::::::::::::::::");

      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Profile updated successfully!");
        getProfile()
      }
    } catch (error) {
      console.log(error);
    }
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const readURL = (input) => {
    if (input.target.files && input.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(input.target.files[0]);
    }
  };

  return (
    <div className='row gy-4'>
      <div className='col-lg-4'>
        <div className='user-grid-card position-relative border radius-16 overflow-hidden bg-base h-100'>
          <img
            src={logo}
            alt='WowDash React Vite'
            className='w-100 object-fit-cover'
          />
          <div className='pb-24 ms-16 mb-24 me-16  mt--100'>
            <div className='text-center border border-top-0 border-start-0 border-end-0'>
              <img
                src={imagePreview}
                alt='Profile'
                className='border br-white border-width-2-px w-200-px h-200-px rounded-circle object-fit-cover'
              />
              <h6 className='mb-0 mt-16'>{profile?.website || "www.searchmystudy.com"}</h6>
              <span className='text-secondary-light mb-16'>
                {profile?.email}
              </span>
            </div>
            <div className='mt-24'>
              <h6 className='text-xl mb-16'>Personal Info</h6>
              <ul>
                <li className='d-flex align-items-center gap-1 mb-12'>
                  <span className='w-30 text-md fw-semibold text-primary-light'>Full Name</span>
                  <span className='w-70 text-secondary-light fw-medium'>: {profile?.name}</span>
                </li>
                <li className='d-flex align-items-center gap-1 mb-12'>
                  <span className='w-30 text-md fw-semibold text-primary-light'>Email</span>
                  <span className='w-70 text-secondary-light fw-medium'>: {profile?.email}</span>
                </li>
                <li className='d-flex align-items-center gap-1 mb-12'>
                  <span className='w-30 text-md fw-semibold text-primary-light'>Phone Number</span>
                  <span className='w-70 text-secondary-light fw-medium'>: {profile?.ContactNumber}</span>
                </li>
                <li className='d-flex align-items-center gap-1 mb-12'>
                  <span className='w-30 text-md fw-semibold text-primary-light'>Designation</span>
                  <span className='w-70 text-secondary-light fw-medium'>: {profile?.role}</span>
                </li>
                {/* <li className='d-flex align-items-center gap-1 mb-12'>
                  <span className='w-30 text-md fw-semibold text-primary-light'>Languages</span>
                  <span className='w-70 text-secondary-light fw-medium'>: {profile?.languages || "English"}</span>
                </li> */}
                <li className='d-flex align-items-center gap-1'>
                  <span className='w-30 text-md fw-semibold text-primary-light'>Bio</span>
                  <span className='w-70 text-secondary-light fw-medium'>: {profile?.bio}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="card h-100">
          <div className="card-body p-24">
            <ul
              className="nav border-gradient-tab nav-pills mb-20 d-inline-flex"
              id="pills-tab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link d-flex align-items-center px-24 active"
                  id="pills-edit-profile-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-edit-profile"
                  type="button"
                  role="tab"
                  aria-controls="pills-edit-profile"
                  aria-selected="true"
                >
                  Edit Profile
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link d-flex align-items-center px-24"
                  id="pills-change-passwork-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-change-passwork"
                  type="button"
                  role="tab"
                  aria-controls="pills-change-passwork"
                  aria-selected="false"
                  tabIndex={-1}
                >
                  Change Password
                </button>
              </li>
            </ul>

            <div className="tab-content" id="pills-tabContent">
              {/* Edit Profile Tab */}
              <div
                className="tab-pane fade show active"
                id="pills-edit-profile"
                role="tabpanel"
                aria-labelledby="pills-edit-profile-tab"
                tabIndex={0}
              >
                <h6 className="text-md text-primary-light mb-16">Profile Image</h6>

                {/* Upload Image Start */}
                <div className="mb-24 mt-16">
                  <div className="avatar-upload">
                    <div className="avatar-edit position-absolute bottom-0 end-0 me-24 mt-16 z-1 cursor-pointer">
                      <input
                        type="file"
                        id="imageUpload"
                        // value={profile?.name}
                        accept=".png, .jpg, .jpeg"
                        hidden
                        onChange={readURL}
                      />
                      <label
                        htmlFor="imageUpload"
                        className="w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle"
                      >
                        <Icon icon="solar:camera-outline" className="icon" />
                      </label>
                    </div>

                    <div className="avatar-preview">
                      <div
                        id="imagePreview"
                        style={{
                          backgroundImage: `url(${profile?.Logo})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Upload Image End */}

                <form action="#">
                  <div className="row">
                    {/* Full Name */}
                    <div className="col-sm-6">
                      <div className="mb-20">
                        <label
                          htmlFor="name"
                          className="form-label fw-semibold text-primary-light text-sm mb-8"
                        >
                          Full Name <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control radius-8"
                          id="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Enter Full Name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-sm-6">
                      <div className="mb-20">
                        <label
                          htmlFor="email"
                          className="form-label fw-semibold text-primary-light text-sm mb-8"
                        >
                          Email <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control radius-8"
                          id="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="col-sm-6">
                      <div className="mb-20">
                        <label
                          htmlFor="number"
                          className="form-label fw-semibold text-primary-light text-sm mb-8"
                        >
                          Phone
                        </label>
                        <input
                          type="text"
                          className="form-control radius-8"
                          id="ContactNumber"
                          value={form.ContactNumber}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                        />

                      </div>
                    </div>

                    {/* Department */}
                    <div className="col-sm-6">
                      <div className="mb-20">
                        <label
                          htmlFor="desig"
                          className="form-label fw-semibold text-primary-light text-sm mb-8"
                        >
                          Designation <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control radius-8"
                          id="role"
                          value={form.role}
                          onChange={handleChange}
                          placeholder="Enter designation"
                        />
                      </div>
                    </div>




                    {/* Bio */}
                    <div className="col-sm-12">
                      <div className="mb-20">
                        <label
                          htmlFor="desc"
                          className="form-label fw-semibold text-primary-light text-sm mb-8"
                        >
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          className="form-control radius-8"
                          value={form.bio}
                          onChange={handleChange}
                          placeholder="Write description..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <button
                      type="button"
                      className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>

                  </div>
                </form>
              </div>

              {/* Change Password Tab */}
              <div
                className="tab-pane fade"
                id="pills-change-passwork"
                role="tabpanel"
                aria-labelledby="pills-change-passwork-tab"
                tabIndex={0}
              >
                <div className="mb-20">
                  <label
                    htmlFor="your-password"
                    className="form-label fw-semibold text-primary-light text-sm mb-8"
                  >
                    New Password <span className="text-danger-600">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      className="form-control radius-8"
                      id="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter New Password*"
                    />
                    <span
                      className={`toggle-password ${passwordVisible ? "ri-eye-off-line" : "ri-eye-line"
                        } cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                      onClick={togglePasswordVisibility}
                    ></span>
                  </div>
                </div>

                <div className="mb-20">
                  <label
                    htmlFor="confirm-password"
                    className="form-label fw-semibold text-primary-light text-sm mb-8"
                  >
                    Confirm Password <span className="text-danger-600">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      className="form-control radius-8"
                      id="confirmPassword"
                      value={form.passwordTracker}
                      onChange={handleChange}
                      placeholder="Confirm Password*"
                    />
                    <span
                      className={`toggle-password ${confirmPasswordVisible ? "ri-eye-off-line" : "ri-eye-line"
                        } cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                      onClick={toggleConfirmPasswordVisibility}
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ViewProfileLayer;