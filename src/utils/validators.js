export const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,59}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const ADDRESS_REGEX = /^.{1,400}$/;
export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]).{8,16}$/;

export const validateName = (value) => {
  if (!value) return 'Name is required';
  if (value.length < 3 || value.length > 60)
    return 'Name must be 3-60 characters';
  if (!NAME_REGEX.test(value)) return 'Please enter a valid name';
  return true;
};

export const validateEmail = (value) => {
  if (!value) return 'Email is required';
  if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email';
  return true;
};

export const validateAddress = (value) => {
  if (!value) return 'Address is required';
  if (!ADDRESS_REGEX.test(value)) return 'Address must be under 400 characters';
  return true;
};

export const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 8 || value.length > 16)
    return 'Password must be 8-16 characters';
  if (!PASSWORD_REGEX.test(value))
    return 'Must include 1 uppercase and 1 special character';
  return true;
};

export const extractApiError = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || 'Something went wrong';
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (Array.isArray(data.errors) && data.errors.length) {
    return data.errors.map((e) => e.message || e.msg || e).join(', ');
  }
  if (typeof data === 'object') {
    const first = Object.values(data)[0];
    if (typeof first === 'string') return first;
  }
  return 'Something went wrong';
};