import { Building2, Mail, MapPin, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosClient from '../../api/axiosClient';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {
    extractApiError,
    validateAddress,
    validateEmail
} from '../../utils/validators';

export default function StoreForm({ initial, onSuccess, onCancel }) {
  const isEdit = Boolean(initial);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      name: initial?.name || '',
      email: initial?.email || '',
      address: initial?.address || '',
      ownerId: initial?.ownerId || '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    setSubmitting(true);
    try {
      if (isEdit) {
        await axiosClient.put(`/admin/stores/${initial.id}`, values);
      } else {
        await axiosClient.post('/admin/stores', values);
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
        label="Store name"
        icon={Building2}
        error={formState.errors.name?.message}
        {...register('name', {
          validate: (v) => (v && v.length >= 2 ? true : 'Store name is required'),
        })}
      />
      <Input
        label="Store email"
        type="email"
        icon={Mail}
        error={formState.errors.email?.message}
        {...register('email', { validate: validateEmail })}
      />
      <Input
        label="Store address"
        icon={MapPin}
        error={formState.errors.address?.message}
        {...register('address', { validate: validateAddress })}
      />
      <Input
        label="Owner ID (optional)"
        icon={User}
        placeholder="Assign an owner"
        error={formState.errors.ownerId?.message}
        {...register('ownerId')}
      />

      <div className="modal-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {isEdit ? 'Save Changes' : 'Create Store'}
        </Button>
      </div>
    </form>
  );
}