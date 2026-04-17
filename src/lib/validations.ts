import * as z from 'zod';

export const SignupSchema = z.object({
  name: z.string().min(2, { message: 'Namnet måste vara minst 2 tecken.' }).trim(),
  email: z.string().email({ message: 'Ange en giltig e-postadress.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Lösenordet måste vara minst 8 tecken.' })
    .regex(/[a-zA-Z]/, { message: 'Måste innehålla minst en bokstav.' })
    .regex(/[0-9]/, { message: 'Måste innehålla minst en siffra.' })
    .trim(),
  householdName: z.string().min(1, { message: 'Ange ett hushållsnamn.' }).trim(),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Ange en giltig e-postadress.' }).trim(),
  password: z.string().min(1, { message: 'Ange ditt lösenord.' }),
});

export const ProfileSchema = z.object({
  name: z.string().min(1, { message: 'Ange ett namn.' }).trim(),
  pin: z
    .string()
    .regex(/^\d{4}$/, { message: 'PIN måste vara 4 siffror.' })
    .optional()
    .or(z.literal('')),
});

export const PinSchema = z.object({
  profileId: z.string().min(1),
  pin: z.string().regex(/^\d{4}$/, { message: 'PIN måste vara 4 siffror.' }),
});

export type SignupFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        householdName?: string[];
      };
      message?: string;
    }
  | undefined;

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
