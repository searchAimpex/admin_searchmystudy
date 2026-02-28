import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { Icon } from '@iconify/react/dist/iconify.js';
import png from '../assets/SearchMyStudy.png';
import { loginUser } from '../slice/authSlice';

const Schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(1, 'Password is required').required('Password is required'),
});

const SignInLayer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [userInfo, setUserInfo] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Schema,
    onSubmit: async (values) => {
      const res = await dispatch(loginUser(values));
      if (loginUser.rejected.match(res)) {
        toast.error(res.payload || 'Login failed');
        return;
      }
      if (res?.meta?.requestStatus === 'fulfilled') {
        setUserInfo(res.payload); // { email, name, role, _id }
        setLoginSuccess(true);
      }
    },
  });


  const { errors, touched, values, handleChange, handleSubmit } = formik;

  useEffect(() => {
    if (!loginSuccess || !userInfo?.role) return;

    const role = userInfo.role;
    if (role === 'admin') {
      toast.success('Login Successful');
      navigate('/dashboard'); // admin dashboard
    } else if (role === 'partner' || role === 'franchise') {
      toast.success('Login Successful');
      navigate('/frenchise-dashboard');
    } else {
      toast.error('You are not authorized to access this page!');
    }
  }, [loginSuccess, userInfo, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <section className='d-flex flex-column justify-content-center align-items-center auth bg-base d-flex flex-wrap' >
      {/* <div className='auth-left d-lg-block d-none'>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
          <img src={bgImage} alt='Auth Background' style={{ width: '100rem' }} />
        </div>
      </div> */}
      <div style={{
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',  // horizontal-offset vertical-offset blur-radius color
        padding: '1rem',
        borderRadius: '0.5rem',
        backgroundColor: 'white',
      }} className='py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <div>
            <Link to='/index' className='mb-40 max-w-290-px'>
              <img src={png} alt='SearchMyStudy' />
            </Link>
            <h4 className='mb-12'>Sign In to your Account</h4>
            <p className='mb-32 text-secondary-light text-lg'>Welcome back! please enter your details</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='mage:email' />
              </span>
              <input
                type='email'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Email'
                name='email'
                onChange={handleChange}
                value={values.email}
              />
              {errors.email && touched.email && <span className='text-red-500 pt-2 block'>{errors.email}</span>}
            </div>

            <div className='position-relative mb-20'>
              <div className='icon-field'>
                <span className='icon top-50 translate-middle-y'>
                  <Icon icon='solar:lock-password-outline' />
                </span>
                <input
                  type='password'
                  className='form-control h-56-px bg-neutral-50 radius-12'
                  name='password'
                  placeholder='Password'
                  onChange={handleChange}
                  value={values.password}
                />
                {errors.password && touched.password && (
                  <span className='text-red-500 pt-2 block'>{errors.password}</span>
                )}
              </div>
            </div>

            <div className='d-flex justify-content-between gap-2'>
              <div className='form-check style-check d-flex align-items-center'>
                <input className='form-check-input border border-neutral-300' type='checkbox' id='remember' />
                <label className='form-check-label' htmlFor='remember'>
                  Remember me
                </label>
              </div>
              <Link to='/password-reset' className='text-primary-600 fw-medium'>
                Forgot Password?
              </Link>
            </div>

            <button
              type='submit'
              className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;
