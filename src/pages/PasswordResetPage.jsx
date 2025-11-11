import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { Icon } from '@iconify/react/dist/iconify.js';
import png from '../assets/SearchMyStudy.png';
import bgImage from '../assets/bg.jpg';
import { loginUser, resetPwd } from '../slice/authSlice'; // Confirm correct path!

const Schema = yup.object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    // password: yup.string().min(8, 'Password must be at least 8 chars').required('Password is required'),
});
// import { useFormik } from "formik";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { resetPwd } from "../redux/actions/authActions"; // adjust import
// import { Schema } from "../validation/resetSchema"; // your Yup schema

const PasswordResetPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, loading, error } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await dispatch(resetPwd(values.email));

        // unwrap Redux Toolkit thunk response
        if (res.error) {
          toast.error(res.payload || "Password reset failed. Try again.");
          return;
        }
        toast.success("Password reset link sent to your email.");

      } catch (err) {
        console.error("Reset error:", err);
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { errors, touched, values, handleChange, handleSubmit, isSubmitting } =
    formik;

  // handle global redux state changes
  useEffect(() => {
    if (userInfo) {
      toast.success("Login Successful");
      // navigate("/dashboard");
    }
    if (error) {
      toast.error(error);
    }
  }, [userInfo, error, navigate]);

  return (
    <section className="d-flex flex-column justify-content-center align-items-center auth bg-base d-flex flex-wrap">
      <div
        style={{
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          padding: "1rem",
          borderRadius: "0.5rem",
          backgroundColor: "white",
        }}
        className="py-32 px-24 d-flex flex-column justify-content-center"
      >
        <div className="max-w-464-px mx-auto w-100">
          <div>
            <p className="mb-32 text-secondary-light text-lg">Enter Your Email</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mage:email" />
              </span>
              <input
                type="email"
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Email"
                name="email"
                onChange={handleChange}
                value={values.email}
              />
            </div>

            {errors.email && touched.email && (
              <div className="text-danger text-sm mb-2">{errors.email}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? "Sending..." : "Reset"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PasswordResetPage;
