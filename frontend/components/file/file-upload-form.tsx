"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, File as FileIcon, Lock } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  ControllerRenderProps,
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { AlertDialog } from "@/components/alert-dialog";
import { DropzoneArea } from "@/components/file/dropzone-area";
import { FileListItem } from "@/components/file/file-list-item";
import { FilePreview } from "@/components/file/file-preview";
import { ModeSelect, VisibilitySelect } from "@/components/file/select-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
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
import { updateFile, uploadFile } from "@/lib/modules/file/file.api";
import { fileFormSchema, FileFormType } from "@/lib/modules/file/file.schema";
import { FileType } from "@/lib/modules/file/file.types";
import {
  getFileContentType,
  hasFileExtention,
} from "@/lib/modules/file/file.utils";
import { UserFullInfo } from "@/lib/modules/user/user.types";
import { zodToFormData } from "@/lib/utils";

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
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  const [currentFileType, setCurrentFileType] = useState<FileType>(
    initialData?.fileType || "other",
  );
  const [mediaUrl, setMediaUrl] = useState<string | null>(
    initialData?.mediaUrl || null,
  );

  const pathPrefix = `/${user.username}/`;

  const form = useForm<FileFormType>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      content: initialData?.content || "",
      title: initialData?.title || "",
      password: initialData?.password || "",
      file: undefined,
      path: initialData?.path
        ? initialData.path.replace(new RegExp(`^${pathPrefix}`), "")
        : "",
      mode: initialData?.mode || "source",
      visibility: initialData?.visibility || "public",
    },
  });

  const content = useWatch({ control: form.control, name: "content" });
  const path = useWatch({ control: form.control, name: "path" });
  function getFullPath(): string {
    return `${pathPrefix}${path}`;
  }

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

    const fullPath = getFullPath();
    data = { ...data, path: fullPath };

    if (!force && !hasFileExtention(fullPath)) {
      setAlertDialogOpen(true);
      return;
    }

    setIsPending(true);
    const formData = zodToFormData(data);
    const { error } =
      mode === "upload" || initialData?.id === undefined
        ? await uploadFile(formData)
        : await updateFile(initialData.id, formData);

    if (error) {
      toast.error(error);
    } else {
      toast.success(
        `File ${mode === "update" ? "updated" : "uploaded"} successfully`,
      );

      if (mode === "upload") {
        form.reset();
        setCurrentFileType("other");
        setMediaUrl(null);
      }
    }
    setIsPending(false);
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
        <div className="pb-4">
          <FilePreview
            mediaUrl={mediaUrl}
            fileType={currentFileType}
            path={initialData?.path || getFullPath()}
            code={content}
            onChange={(code) => form.setValue("content", code)}
          />
        </div>
        <AlertDialog
          title="No file extension"
          description="You are saving a file without any extension. The file may not open correctly without one."
          open={alertDialogOpen}
          setOpen={setAlertDialogOpen}
          onConfirm={() => onSubmit(form.getValues(), true)}
        />
        <form onSubmit={form.handleSubmit((value) => onSubmit(value, false))}>
          <FieldGroup>
            <div className="w-full grid gap-4 md:grid-cols-2 grid-cols-1">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Title</FieldLabel>
                    <InputGroup className="h-11">
                      <InputGroupAddon>
                        <FileIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        value={field.value as string}
                        placeholder="enter the title of ur file"
                      />
                    </InputGroup>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Password</FieldLabel>
                    <InputGroup className="h-11">
                      <InputGroupAddon>
                        <Lock />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        value={field.value}
                        type={showPassword ? "text" : "password"}
                        placeholder="password (optional)"
                      />
                      <InputGroupButton
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroup>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="path"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Path</FieldLabel>
                    <InputGroup className="h-11">
                      <InputGroupAddon>
                        <FileIcon />
                      </InputGroupAddon>
                      <InputGroupAddon className="text-muted-foreground/60 font-mono text-sm select-none">
                        {pathPrefix}
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        value={field.value}
                        type="text"
                        placeholder="myfile.html"
                      />
                    </InputGroup>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <VisibilitySelect control={form.control} name="visibility" />
              <ModeSelect control={form.control} name="mode" />
            </div>

            <Controller
              name="file"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>File</FieldLabel>
                  {field.value ? (
                    <FileListItem
                      name={field.value.name}
                      size={field.value.size}
                      progress={100}
                      onRemove={() => handleFileChange(null, field)}
                    />
                  ) : (
                    <DropzoneArea
                      maxFiles={1}
                      maxSize={env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB * 1024 * 1024}
                      onDrop={(files) =>
                        handleFileChange(files[0] ?? null, field)
                      }
                    />
                  )}
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
