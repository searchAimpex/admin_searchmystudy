import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { Icon } from '@iconify/react/dist/iconify.js';
import { changePwd, resetPwd, verifyToken } from '../slice/authSlice';
import { fetchProfile, updateProfile } from '../slice/profileSlice';

const Schema = yup.object({
    oldPassword: yup.string().required('Password is required'),
    newPassword: yup.string().min(8, 'New Password must be at least 8 chars').required('New Password is required'),
});

const ChangePassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {token,email } = useParams();
    const { loading, error } = useSelector((state) => state.auth);
    const state = useSelector((state) => state?.profile?.profile);
    // console.log(token,email,"=========================");
    
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [invalidToken, setInvalidToken] = useState(false);

    // Check token validity
    useEffect(() => {
        const checkToken = async () => {
            try {
                //  navigate('https://coursefinder.co.in');
                // console.log(token,email)
                const res = await dispatch(verifyToken({token}));
                console.log(res.payload.success,":::::::::::::::::::::::::");
                

                if (res.payload.success) {
                    setInvalidToken(true);
                }
            } catch (err) {
                // setInvalidToken(true);
                console.log(err)
            }
        };
        checkToken();
    }, [dispatch, token]);

    const formik = useFormik({
        initialValues: { oldPassword: '', newPassword: '' },
        validationSchema: Schema,
        onSubmit: async (values) => {
            try {

                if (values.oldPassword === values.newPassword) {
                    // console.log({password:values.oldPassword,email:state.email})
                    // console.log(values);
                    
                    const res = await dispatch(changePwd( {password:values.newPassword,email:email} ));
                    console.log(res,"+++++++++++++++++++++++++++++++++");
                    
                    if (res.meta?.requestStatus === "fulfilled") {
                        toast.success('Password reset successful');
                        window.location.href = "https://coursefinder.co.in";
                    }
                } else {
                    toast.error("Password do not match!");

                }

            } catch (err) {
                setInvalidToken(true);
            }
        },
    });

    const { errors, touched, values, handleChange, handleSubmit } = formik;

    if (!invalidToken) {
        return (
            <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
                <h2>Page does not exist or token has expired</h2>
            </div>
        );
    }

    if(invalidToken){
 return (
        <section className='d-flex flex-column justify-content-center align-items-center auth bg-base' style={{ minHeight: "100vh" }}>
            <div style={{
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                padding: '2rem',
                borderRadius: '1rem',
                backgroundColor: 'white',
                minWidth: 350,
                maxWidth: 400,
                width: '100%',
            }}>
                <div className='mb-32 text-center'>
                    <Icon icon="mage:lock" width={48} height={48} className="mb-2 text-primary" />
                    <h5 className='mb-2'>Reset Your Password</h5>
                </div>
                <form onSubmit={handleSubmit}>
                    {/* Old Password */}
                    <div className='mb-24 position-relative'>
                        <input
                            type={showOldPassword ? 'text' : 'password'}
                            className={`form-control h-56-px bg-neutral-50 radius-12 ${errors.oldPassword && touched.oldPassword ? 'is-invalid' : ''}`}
                            placeholder='Password'
                            name='oldPassword'
                            id='oldPassword'
                            onChange={handleChange}
                            value={values.oldPassword}
                            autoComplete="current-password"
                        />
                        <span
                            className="position-absolute end-0 top-50 translate-middle-y me-16 cursor-pointer"
                            style={{ right: 12, top: '50%', transform: 'translateY(-50%)' }}
                            onClick={() => setShowOldPassword((prev) => !prev)}
                            tabIndex={0}
                            role="button"
                            aria-label={showOldPassword ? "Hide password" : "Show password"}
                        >
                            <Icon icon={showOldPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} width={24} />
                        </span>
                        {errors.oldPassword && touched.oldPassword && (
                            <div className="invalid-feedback d-block">{errors.oldPassword}</div>
                        )}
                    </div>

                    {/* New Password */}
                    <div className='mb-24 position-relative'>
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            className={`form-control h-56-px bg-neutral-50 radius-12 ${errors.newPassword && touched.newPassword ? 'is-invalid' : ''}`}
                            placeholder='Confirm Password'
                            name='newPassword'
                            id='newPassword'
                            onChange={handleChange}
                            value={values.newPassword}
                            autoComplete="new-password"
                        />
                        <span
                            className="position-absolute end-0 top-50 translate-middle-y me-16 cursor-pointer"
                            style={{ right: 12, top: '50%', transform: 'translateY(-50%)' }}
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            tabIndex={0}
                            role="button"
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                            <Icon icon={showNewPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} width={24} />
                        </span>
                        {errors.newPassword && touched.newPassword && (
                            <div className="invalid-feedback d-block">{errors.newPassword}</div>
                        )}
                    </div>

                    <button
                        type='submit'
                        className='btn btn-primary text-md w-100 radius-12 py-3'
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </section>
    );
    }
   
};

export default ChangePassword;
