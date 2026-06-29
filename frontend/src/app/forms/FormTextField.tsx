import { TextField, type TextFieldProps } from '@mui/material';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type FormTextFieldProps<TFieldValues extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'error'
> & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
};

export function FormTextField<TFieldValues extends FieldValues>({
  control,
  name,
  helperText,
  ...props
}: FormTextFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <TextField
      {...props}
      name={field.name}
      value={field.value ?? ''}
      onChange={(event) => field.onChange(event.target.value)}
      onBlur={field.onBlur}
      inputRef={field.ref}
      error={!!fieldState.error}
      helperText={fieldState.error?.message ?? helperText}
    />
  );
}
