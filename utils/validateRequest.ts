import { z } from "zod";

type ValidationResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; status: number } };

type ValidateRequestType = <T>(
  req: Request,
  schema: z.ZodSchema<T>
) => Promise<ValidationResponse<T>>;

export const validateRequest: ValidateRequestType = async (req, schema) => {
  try {
    const body = await req.json();
    const res = schema.safeParse(body);

    if (!res.success) {
      return {
        data: null,
        error: { message: res.error?.errors[0].message, status: 400 },
      };
    }

    return { data: res.data, error: null };
  } catch {
    return {
      data: null,
      error: { message: "Invalid request body", status: 400 },
    };
  }
};
