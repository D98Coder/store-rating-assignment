  import { Lock, LogIn, Mail, Star } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { HOME_BY_ROLE } from '../utils/constants';
import { extractApiError, validateEmail } from '../utils/validators';

  export default function Login() {
    const { register: formRegister, handleSubmit, formState } = useForm({
      mode: 'onBlur',
      defaultValues: {
        "email": "admin@example.com",
        "password": "Admin@12345"
      }
    });
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState('');

    const onSubmit = async (values) => {
      setServerError('');
      try {
        const user = await login(values);
        const dest =
          location.state?.from?.pathname || HOME_BY_ROLE[user.role] || '/';
          
        navigate(dest, { replace: true });
      } catch (err) {
        setServerError(extractApiError(err));
      }
    };

    return (
      <div className="auth-layout">
        <div className="auth-aside">
          <div className="brand large">
            <div className="brand-mark big">
              <Star size={26} fill="currentColor" />
            </div>
            <div className="brand-text">
              <strong>StoreRate</strong>
              <span>Rating Platform</span>
            </div>
          </div>
          <h1>Rate, discover & manage stores — all in one place.</h1>
          <p>
            A modern platform connecting users, store owners, and administrators
            with transparent, real-time ratings.
          </p>
          <ul className="feature-list">
            <li>★ Verified user reviews</li>
            <li>★ Powerful admin controls</li>
            <li>★ Real-time store insights</li>
          </ul>
        </div>

        <div className="auth-panel">
          <div className="auth-card">
            <h2>Welcome back</h2>
            <p className="muted">Sign in to your account to continue</p>

            {serverError && <div className="alert error">{serverError}</div>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                autoComplete="email"
                error={formState.errors.email?.message}
                {...formRegister('email', {
                  validate: validateEmail,
                })}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                autoComplete="current-password"
                error={formState.errors.password?.message}
                {...formRegister('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={LogIn}
                className="w-full"
              >
                Sign In
              </Button>
            </form>

            <p className="auth-foot">
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }