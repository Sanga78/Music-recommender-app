import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../services/auth';
import { toast } from 'react-toastify';
import '../../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      username: Yup.string().min(3).required('Required'),
      email: Yup.string().email().required('Required'),
      password: Yup.string().min(6).required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required')
    }),
    onSubmit: async (values) => {
      try {
        await register(values.username, values.email, values.password);
        toast.success('Registration successful! Please login');
        navigate('/login');
      } catch (error) {
        toast.error(error.message || 'Registration failed');
      }
    }
  });

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={formik.handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          onChange={formik.handleChange}
          value={formik.values.username}
        />
        {formik.errors.username && <div className="error">{formik.errors.username}</div>}
        
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={formik.handleChange}
          value={formik.values.email}
        />
        {formik.errors.email && <div className="error">{formik.errors.email}</div>}
        
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={formik.handleChange}
          value={formik.values.password}
        />
        {formik.errors.password && <div className="error">{formik.errors.password}</div>}
        
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          onChange={formik.handleChange}
          value={formik.values.confirmPassword}
        />
        {formik.errors.confirmPassword && (
          <div className="error">{formik.errors.confirmPassword}</div>
        )}
        
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;