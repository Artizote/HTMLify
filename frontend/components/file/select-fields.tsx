import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export function VisibilitySelect<T extends FieldValues>({
  control,
  name,
}: SelectFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Visibility</FieldLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Visibility</SelectLabel>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="once">Once</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]}></FieldError>
        </Field>
      )}
    />
  );
}

export function ModeSelect<T extends FieldValues>({
  control,
  name,
}: SelectFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Mode</FieldLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Mode</SelectLabel>
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="render">Render</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]}></FieldError>
        </Field>
      )}
    />
  );
}
