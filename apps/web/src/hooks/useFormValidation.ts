import { useState, useCallback } from "react";
import { z } from "zod";

export interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = useCallback(
    (data: unknown): data is z.infer<T> => {
      const result = schema.safeParse(data);
      if (result.success) {
        setErrors({});
        return true;
      }
      const newErrors: ValidationErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        newErrors[path] = issue.message;
      }
      setErrors(newErrors);
      return false;
    },
    [schema],
  );

  const validateField = useCallback(
    (fieldName: string, value: unknown) => {
      const partialData = { [fieldName]: value };
      const partialSchema = z.object({ [fieldName]: schema.shape[fieldName] });
      const result = partialSchema.safeParse(partialData);
      if (result.success) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: result.error.issues[0]?.message || "Invalid value",
        }));
      }
    },
    [schema],
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
  };
}
