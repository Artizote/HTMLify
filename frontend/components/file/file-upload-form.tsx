"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, File as FileIcon, Folder, Lock } from "lucide-react";
import { ReactNode, useState } from "react";
import {
  Controller,
  ControllerRenderProps,
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { NoExtentionAlertDialog } from "@/components/file/alert-dialog";
import { FileDropzone } from "@/components/file/file-dropzone";
import { FilePreview } from "@/components/file/file-preview";
import { ModeSelect, VisibilitySelect } from "@/components/file/select-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { env } from "@/lib/env";
import { useUploadFile } from "@/lib/hooks/use-files";
import { fileFormSchema, FileFormType } from "@/lib/modules/file/file.schema";
import { FileType } from "@/lib/modules/file/file.types";
import {
  getFileContentType,
  hasFileExtention,
} from "@/lib/modules/file/file.utils";
import { UserFullInfo } from "@/lib/modules/user/user.types";
import { zodToFormData } from "@/lib/utils";

type InputFieldConfig = {
  name: keyof FileFormType;
  label: string;
  description?: string;
  placeholder: string;
  icon: ReactNode;
  type?: string;
};

interface InitialDataProps {
  id: number;
  title: string;
  path: string;
  password: string | null;
  mode: "source" | "render";
  visibility: string;
  content?: string | null;
  mediaUrl: string | null;
  fileType: FileType;
}

type FileFormProps =
  | {
      mode: "update";
      initialData: InitialDataProps;
      user: UserFullInfo;
    }
  | {
      mode: "upload";
      initialData?: never;
      user: UserFullInfo;
    };

export const FileForm = ({
  user,
  initialData,
  mode = "upload",
}: FileFormProps) => {
  const { mutate: uploadFile, isPending } = useUploadFile();
  const [showPassword, setShowPassword] = useState(false);
  const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  const [currentFileType, setCurrentFileType] = useState<FileType>(
    initialData?.fileType || "other",
  );
  const [mediaUrl, setMediaUrl] = useState<string | null>(
    initialData?.mediaUrl || null,
  );

  const form = useForm<FileFormType>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      content: initialData?.content || "",
      title: initialData?.title || "",
      password: initialData?.password || "",
      file: undefined,
      path: initialData?.path || `/${user.username}/`,
      mode: initialData?.mode || "source",
      visibility: initialData?.visibility || "public",
    },
  });

  const inputFields: InputFieldConfig[] = [
    {
      name: "title",
      label: "Title",
      placeholder: "enter the title of ur file",
      icon: <FileIcon />,
    },
    {
      name: "path",
      label: "Path",
      description: `make sure the path starts with /${user.username}/`,
      placeholder: "enter the file path",
      icon: <Folder />,
    },
    {
      name: "password",
      label: "Password",
      placeholder: "password (optional)",
      icon: <Lock />,
      type: "password",
    },
  ];

  const content = useWatch({ control: form.control, name: "content" });

  const onSubmit = async (
    data: z.infer<typeof fileFormSchema>,
    force = false,
  ) => {
    if (currentFileType === "other") {
      data = {
        ...data,
        file: undefined,
      };
    }

    if (!force && !hasFileExtention(data.path)) {
      setAlertDialogOpen(true);
      return;
    }
    const formData = zodToFormData(data);
    uploadFile(
      { mode, formData, id: initialData?.id },
      {
        onSuccess: () => {
          toast.success(
            `File ${mode === "update" ? "updated" : "uploaded"} successfully`,
          );
          if (mode === "upload") {
            form.reset();
            setCurrentFileType("other");
            setMediaUrl(null);
          }
        },
      },
    );
  };

  const handleFileChange = (
    value: File | File[] | null,
    field: ControllerRenderProps<FileFormType, "file">,
  ) => {
    if (!value) setCurrentFileType("other");
    field.onChange(value);
    const file = Array.isArray(value) ? value[0] : value;
    if (file instanceof File) {
      const type = getFileContentType(file.name, file.type);
      setCurrentFileType(type);
      if (type === "other") {
        setMediaUrl("");
        const reader = new FileReader();
        reader.onload = (e) => {
          form.setValue("content", e.target?.result as string);
        };
        reader.readAsText(file);
        return;
      }
      form.setValue("content", "");
      setMediaUrl(URL.createObjectURL(file));
    }
  };
  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>{modeText} File</CardTitle>
      </CardHeader>
      <CardContent>
        <FilePreview
          mediaUrl={mediaUrl}
          fileType={currentFileType}
          path={initialData?.path || ""}
          code={content}
          onChange={(code) => form.setValue("content", code)}
        />
        <NoExtentionAlertDialog
          open={alertDialogOpen}
          setOpen={setAlertDialogOpen}
          onConfirm={() => onSubmit(form.getValues(), true)}
        />
        <form onSubmit={form.handleSubmit((value) => onSubmit(value, false))}>
          <FieldGroup>
            <div className="w-full grid gap-4 md:grid-cols-2 grid-cols-1">
              {inputFields.map(
                ({ name, label, description, placeholder, icon, type }) => (
                  <Controller
                    key={name}
                    name={name}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>{label}</FieldLabel>
                        {description && (
                          <FieldDescription>{description}</FieldDescription>
                        )}
                        <InputGroup className="h-11">
                          <InputGroupAddon>{icon}</InputGroupAddon>
                          <InputGroupInput
                            {...field}
                            value={field.value as string}
                            type={
                              name === "password"
                                ? showPassword
                                  ? "text"
                                  : "password"
                                : (type ?? "text")
                            }
                            placeholder={placeholder}
                          />
                          {name === "password" && (
                            <InputGroupButton
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? <EyeOff /> : <Eye />}
                            </InputGroupButton>
                          )}
                        </InputGroup>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                ),
              )}
              <VisibilitySelect control={form.control} name="visibility" />
              <ModeSelect control={form.control} name="mode" />
            </div>

            <Controller
              name="file"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>File</FieldLabel>
                  <FileDropzone
                    maxSize={env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB * 1024 * 1024}
                    maxFiles={1}
                    value={field.value}
                    onChange={(value) => handleFileChange(value, field)}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex items-center justify-center mt-2 gap-4 w-fit">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submiting..." : "Submit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
