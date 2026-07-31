import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import { register, type RegisterParams } from '@/api/auth';
import { getErrorMessage } from '@/api/errors';
import { useAuth } from '@/auth/AuthContext';
import { cn } from '@/lib/utils';

interface FormValues extends RegisterParams {
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(values: FormValues): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!values.name) {
    errors.name = 'Name is required';
  } else if (values.name.length > 100) {
    errors.name = 'Name must be 100 characters or less';
  }
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (values.password.length > 128) {
    errors.password = 'Password must be 128 characters or less';
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setSession(data);
      navigate('/dashboard');
    },
  });

  function handleChange(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    const { confirmPassword: _, ...params } = values;
    mutation.mutate(params);
  }

  const inputClass = (hasError: boolean) =>
    cn(
      'flex h-10 w-full rounded-md border bg-background px-3 py-2 pl-10 text-sm ring-offset-background',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      hasError ? 'border-destructive' : 'border-input',
    );

  const buttonClass = cn(
    'flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
    'hover:bg-primary/90',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
  );

  const fields: {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    icon: React.ElementType;
    field: keyof FormValues;
  }[] = [
    {
      id: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'John Doe',
      icon: User,
      field: 'name',
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'john@example.com',
      icon: Mail,
      field: 'email',
    },
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'At least 8 characters',
      icon: Lock,
      field: 'password',
    },
    {
      id: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Re-enter your password',
      icon: Lock,
      field: 'confirmPassword',
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">JobTrack</h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mutation.isError && (
            <div
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              {getErrorMessage(mutation.error)}
            </div>
          )}

          {fields.map(({ id, label, type, placeholder, icon: Icon, field }) => (
            <div key={id} className="space-y-2">
              <label htmlFor={id} className="text-sm font-medium">
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  value={values[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  disabled={mutation.isPending}
                  className={inputClass(!!errors[field])}
                  aria-invalid={!!errors[field]}
                  aria-describedby={errors[field] ? `${id}-error` : undefined}
                />
              </div>
              {errors[field] && (
                <p id={`${id}-error`} className="text-xs text-destructive">
                  {errors[field]}
                </p>
              )}
            </div>
          ))}

          <button type="submit" disabled={mutation.isPending} className={buttonClass}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
