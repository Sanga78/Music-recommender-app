import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/auth';
import { toast } from 'react-toastify';
import '../../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required'),
      password: Yup.string().required('Password is required')
    }),
    onSubmit: async (values) => {
      try {
        const response = await login(values.username, values.password);
        localStorage.setItem('token', response.token);
        toast.success('Login successful!');
        navigate('/');
      } catch (error) {
        toast.error(error.message || 'Login failed');
      }
    }
  });

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={formik.handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          onChange={formik.handleChange}
          value={formik.values.username}
        />
        {formik.errors.username && <div className="error">{formik.errors.username}</div>}
        
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={formik.handleChange}
          value={formik.values.password}
        />
        {formik.errors.password && <div className="error">{formik.errors.password}</div>}
        
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;