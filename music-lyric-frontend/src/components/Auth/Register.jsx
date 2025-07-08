import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/auth';
import { FaUser, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import '../../styles/Auth.css';

const Register = ({ setAuthToken }) => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, 'Must be at least 3 characters')
        .max(20, 'Must be 20 characters or less')
        .required('Required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Required'),
      password: Yup.string()
        .min(6, 'Must be at least 6 characters')
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required')
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const { username, email, password } = values;
        const response = await register(username, email, password);
        
        if (response.token) {
          localStorage.setItem('token', response.token);
          setAuthToken(response.token);
          navigate('/');
        } else {
          setErrors({ submit: 'Registration failed - please try again' });
        }
      } catch (error) {
        let errorMessage = 'Registration failed';
        if (error.response) {
          // Handle Django backend errors
          const data = error.response.data;
          if (data.username) errorMessage = data.username[0];
          if (data.email) errorMessage = data.email[0];
          if (data.password) errorMessage = data.password[0];
        }
        setErrors({ submit: errorMessage });
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="auth-form-container"
    >
      <div className="auth-form">
        <h2>Create Account</h2>
        
        {formik.errors.submit && (
          <div className="form-error">{formik.errors.submit}</div>
        )}

        <form onSubmit={formik.handleSubmit}>
          <div className={`form-group ${formik.touched.username && formik.errors.username ? 'error' : ''}`}>
            <div className="input-icon">
              <FaUser />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
            />
            {formik.touched.username && formik.errors.username ? (
              <div className="error-message">{formik.errors.username}</div>
            ) : null}
          </div>

          <div className={`form-group ${formik.touched.email && formik.errors.email ? 'error' : ''}`}>
            <div className="input-icon">
              <FaEnvelope />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="error-message">{formik.errors.email}</div>
            ) : null}
          </div>

          <div className={`form-group ${formik.touched.password && formik.errors.password ? 'error' : ''}`}>
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="error-message">{formik.errors.password}</div>
            ) : null}
          </div>

          <div className={`form-group ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''}`}>
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="error-message">{formik.errors.confirmPassword}</div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="submit-btn"
          >
            <FaSignInAlt /> {formik.isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <span onClick={() => navigate('/login')}>Sign In</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;