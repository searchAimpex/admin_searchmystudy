import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";
import { changePwd, verifyToken } from "../slice/authSlice";

const Schema = yup.object({
  oldPassword: yup.string().required("Password is required"),
  newPassword: yup
    .string()
    .min(8, "New Password must be at least 8 characters")
    .required("New Password is required"),
});

const ChangePassword = () => {
  const dispatch = useDispatch();
  const { token, email } = useParams();
  const { loading } = useSelector((state) => state.auth);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const res = await dispatch(verifyToken({ token }));
      if (res?.payload?.success) {
        setValidToken(true);
      }
    };
    checkToken();
  }, [dispatch, token]);

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
    },
    validationSchema: Schema,
    onSubmit: async (values) => {
      if (values.oldPassword !== values.newPassword) {
        toast.error("Password do not match!");
        return;
      }

      const res = await dispatch(
        changePwd({ password: values.newPassword, email })
      );

      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Password reset successful");
       setTimeout(() => {
         window.location.href = "https://coursefinder.co.in";
       }, 1000);
      }
    },
  });

  const { values, errors, touched, handleChange, handleSubmit } = formik;

  if (!validToken) {
    return (
      <div className="token-error">
        Page does not exist or token has expired
      </div>
    );
  }

  return (
    <>
      {/* ================= CSS INSIDE COMPONENT ================= */}
      <style>
        {`
          * {
            box-sizing: border-box;
            font-family: Arial, sans-serif;
          }

          .auth-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f4f6f8;
            padding: 16px;
          }

          .auth-card {
            background: #ffffff;
            width: 100%;
            max-width: 400px;
            padding: 32px;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          }

          .auth-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .auth-header h5 {
            margin-top: 12px;
            font-size: 18px;
            font-weight: 600;
            color: #101828;
          }

          .input-group {
            position: relative;
            margin-bottom: 24px;
          }

          .auth-input {
            width: 100%;
            height: 56px;
            padding: 0 44px 0 16px;
            border-radius: 12px;
            border: 1px solid #d0d5dd;
            background: #f9fafb;
            font-size: 14px;
          }

          .auth-input:focus {
            outline: none;
            border-color: #0d6efd;
            background: #ffffff;
          }

          .eye-icon {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #667085;
          }

          .error-text {
            color: #dc3545;
            font-size: 12px;
            margin-top: 6px;
          }

          .auth-btn {
            width: 100%;
            padding: 14px;
            border-radius: 12px;
            background: #0d6efd;
            color: #ffffff;
            font-size: 15px;
            font-weight: 500;
            border: none;
            cursor: pointer;
          }

          .auth-btn:disabled {
            background: #9ec5fe;
            cursor: not-allowed;
          }

          .token-error {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 500;
          }
        `}
      </style>

      {/* ================= UI ================= */}
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <Icon icon="mage:lock" width={48} height={48} color="#0d6efd" />
            <h5>Reset Your Password</h5>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Password */}
            <div className="input-group">
              <input
                type={showOldPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Password"
                name="oldPassword"
                value={values.oldPassword}
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                <Icon
                  icon={
                    showOldPassword
                      ? "mdi:eye-off-outline"
                      : "mdi:eye-outline"
                  }
                  width={22}
                />
              </span>
              {errors.oldPassword && touched.oldPassword && (
                <div className="error-text">{errors.oldPassword}</div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <input
                type={showNewPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Confirm Password"
                name="newPassword"
                value={values.newPassword}
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon
                  icon={
                    showNewPassword
                      ? "mdi:eye-off-outline"
                      : "mdi:eye-outline"
                  }
                  width={22}
                />
              </span>
              {errors.newPassword && touched.newPassword && (
                <div className="error-text">{errors.newPassword}</div>
              )}
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
