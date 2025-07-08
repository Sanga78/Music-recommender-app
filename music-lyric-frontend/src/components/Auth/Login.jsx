import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Add this import
import { login } from '../../services/auth';
import { FaSignInAlt } from 'react-icons/fa';
import '../../styles/Auth.css';
import { toast } from 'react-toastify';

// After successful login/register
toast.success('Logged in successfully!', {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
});
const Login = ({ setAuthToken }) => {
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
        setAuthToken(response.token);
        navigate('/');
        } catch (error) {
        alert(error.message);
        }
    }
    });
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="auth-form"
        >
        <h2>Login</h2>
        <form onSubmit={formik.handleSubmit}>
            <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={formik.handleChange}
            value={formik.values.email}
            />
            {formik.errors.email && <div className="error">{formik.errors.email}</div>}

            <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={formik.handleChange}
            value={formik.values.password}
            />
            {formik.errors.password && <div className="error">{formik.errors.password}</div>}

            <button type="submit">Login</button>
        </form>
        </motion.div>
    );
};
export default Login;