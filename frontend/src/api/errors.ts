import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message: string | string[] }>;
  const message = axiosError.response?.data?.message;
  if (Array.isArray(message)) return message[0];
  return message ?? 'An unexpected error occurred';
}
