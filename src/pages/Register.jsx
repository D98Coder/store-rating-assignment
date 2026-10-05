import { Lock, Mail, MapPin, Star, User, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import {
    extractApiError,
    validateAddress,
    validateEmail,
    validateName,
    validatePassword,
} from '../utils/validators';

export default function Register() {
  const { register: formRegister, handleSubmit, formState, reset } = useForm({
    mode: 'onBlur',
  });
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (values) => {
    setServerError('');
    setSuccess('');
    try {
      await registerUser(values);
      setSuccess('Account created successfully! Redirecting to login…');
      reset();
      setTimeout(() => navigate('/login'), 1200);
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
        <h1>Join thousands of users rating their favorite stores.</h1>
        <p>Create your free account and start exploring today.</p>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h2>Create account</h2>
          <p className="muted">Sign up as a normal user</p>

          {serverError && <div className="alert error">{serverError}</div>}
          {success && <div className="alert success">{success}</div>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
              label="Full name"
              placeholder="John Doe"
              icon={User}
              autoComplete="name"
              error={formState.errors.name?.message}
              {...formRegister('name', { validate: validateName })}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              autoComplete="email"
              error={formState.errors.email?.message}
              {...formRegister('email', { validate: validateEmail })}
            />
            <Input
              label="Address"
              placeholder="Street, City, Country"
              icon={MapPin}
              autoComplete="street-address"
              error={formState.errors.address?.message}
              {...formRegister('address', { validate: validateAddress })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="8-16 chars, 1 uppercase, 1 special"
              icon={Lock}
              autoComplete="new-password"
              error={formState.errors.password?.message}
              {...formRegister('password', { validate: validatePassword })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={UserPlus}
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          <p className="auth-foot">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}