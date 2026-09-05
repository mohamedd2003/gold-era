export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      validatedQuery?: unknown;
    }
  }
}

export {};
