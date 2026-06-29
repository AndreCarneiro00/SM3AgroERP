import type { FieldErrors, Resolver } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';

function buildFieldErrors(schemaError: {
  issues: Array<{
    code: string;
    message: string;
    path: PropertyKey[];
  }>;
}) {
  return schemaError.issues.reduce<FieldErrors>((errors, issue) => {
    const [path] = issue.path;

    if (typeof path !== 'string' || errors[path]) {
      return errors;
    }

    errors[path] = {
      type: issue.code,
      message: issue.message,
    };

    return errors;
  }, {});
}

export function zodResolver<TSchema extends ZodTypeAny>(
  schema: TSchema,
): Resolver<any> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    return {
      values: {},
      errors: buildFieldErrors(result.error),
    };
  };
}
