import { Lock, Mail, MapPin, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosClient from '../../api/axiosClient';
import { ApiEndpoints } from '../../api/endpoints';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { DBRoles, ROLES, ROLE_LABELS } from '../../utils/constants';
import {
  extractApiError,
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
} from '../../utils/validators';

export default function UserForm({ initial, onSuccess, onCancel }) {
  const isEdit = Boolean(initial);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      name: initial?.name || '',
      email: initial?.email || '',
      address: initial?.address || '',
      role: initial?.role || ROLES.USER,
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    setSubmitting(true);
    try {
      if (isEdit) {
        const payload = { ...values };
        if (!payload.password) delete payload.password;
        await axiosClient.put(`${ApiEndpoints.adminUsers}/${initial.id}`, payload);
      } else {
        await axiosClient.post(`${ApiEndpoints.adminUsers}`, values);
      }
      onSuccess?.();
    } catch (err) {
      setServerError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className="alert error">{serverError}</div>}

      <Input
        label="Name"
        icon={User}
        error={formState.errors.name?.message}
        {...register('name', { validate: validateName })}
      />
      <Input
        label="Email"
        type="email"
        icon={Mail}
        error={formState.errors.email?.message}
        {...register('email', { validate: validateEmail })}
      />
      <Input
        label="Address"
        icon={MapPin}
        error={formState.errors.address?.message}
        {...register('address', { validate: validateAddress })}
      />
      <div className="form-field">
        <label className="form-label">Role</label>
        <select className="form-input" {...register('role', { required: true })}>
          {Object.values(DBRoles).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>
      <Input
        label={isEdit ? 'Password (leave blank to keep)' : 'Password'}
        type="password"
        icon={Lock}
        error={formState.errors.password?.message}
        {...register('password', {
          validate: (v) => {
            if (isEdit && !v) return true;
            return validatePassword(v);
          },
        })}
      />

      <div className="modal-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {isEdit ? 'Save Changes' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}