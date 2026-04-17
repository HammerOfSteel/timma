'use server';

import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { createSession, deleteSession, getSession, updateSession } from '@/lib/session';
import {
  SignupSchema,
  LoginSchema,
  type SignupFormState,
  type LoginFormState,
} from '@/lib/validations';

export async function signup(state: SignupFormState, formData: FormData): Promise<SignupFormState> {
  const validatedFields = SignupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    householdName: formData.get('householdName'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password, householdName } = validatedFields.data;

  const existingCaregiver = await prisma.caregiver.findUnique({ where: { email } });
  if (existingCaregiver) {
    return { message: 'E-postadressen är redan registrerad.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const household = await prisma.household.create({
    data: {
      name: householdName,
      caregiver: {
        create: { email, passwordHash, name },
      },
      profiles: {
        create: {
          name,
          role: 'ADMIN',
          pin: '0000',
        },
      },
    },
    include: { caregiver: true },
  });

  await createSession(household.caregiver!.id, household.id);
  redirect('/profile-select');
}

export async function login(state: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  const caregiver = await prisma.caregiver.findUnique({
    where: { email },
    include: { household: true },
  });

  if (!caregiver) {
    return { message: 'Felaktiga inloggningsuppgifter.' };
  }

  const passwordMatch = await bcrypt.compare(password, caregiver.passwordHash);
  if (!passwordMatch) {
    return { message: 'Felaktiga inloggningsuppgifter.' };
  }

  await createSession(caregiver.id, caregiver.householdId);
  redirect('/profile-select');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

export async function switchProfile(profileId: string, pin: string) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const profile = await prisma.profile.findFirst({
    where: {
      id: profileId,
      householdId: session.householdId,
    },
  });

  if (!profile) {
    return { error: 'Profilen hittades inte.' };
  }

  if (profile.pin && profile.pin !== pin) {
    return { error: 'Felaktig PIN.' };
  }

  await updateSession({ activeProfileId: profile.id });
  redirect('/');
}

export async function createProfile(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');

  const name = formData.get('name') as string;
  const pin = (formData.get('pin') as string) || undefined;

  if (!name || name.trim().length === 0) {
    return { error: 'Ange ett namn.' };
  }

  if (pin && !/^\d{4}$/.test(pin)) {
    return { error: 'PIN måste vara 4 siffror.' };
  }

  await prisma.profile.create({
    data: {
      name: name.trim(),
      pin: pin || null,
      householdId: session.householdId,
      role: 'USER',
    },
  });

  redirect('/profile-select');
}

export async function deleteProfile(profileId: string) {
  const session = await getSession();
  if (!session) redirect('/login');

  const profile = await prisma.profile.findFirst({
    where: { id: profileId, householdId: session.householdId },
  });

  if (!profile) return { error: 'Profilen hittades inte.' };
  if (profile.role === 'ADMIN') return { error: 'Kan inte ta bort admin-profilen.' };

  await prisma.profile.delete({ where: { id: profileId } });

  if (session.activeProfileId === profileId) {
    await updateSession({ activeProfileId: undefined });
  }

  redirect('/profile-select');
}
