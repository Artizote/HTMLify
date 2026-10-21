"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, File as FileIcon, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
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
  toUserRelativePath,
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
      initialPath?: string;
    }
  | {
      mode: "upload";
      initialData?: never;
      user: UserFullInfo;
      initialPath?: string;
    };

export const FileForm = ({
  user,
  initialData,
  initialPath,
  mode = "upload",
}: FileFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const modeText = mode === "upload" ? "Create" : "Update";
  const submitLabel = mode === "update" ? "Update" : "Save";
  const pendingLabel = mode === "update" ? "Updating..." : "Saving...";
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const router = useRouter();

  const [currentFileType, setCurrentFileType] = useState<FileType>(
    initialData?.fileType || "other",
  );
  const [mediaUrl, setMediaUrl] = useState<string | null>(
    initialData?.mediaUrl || null,
  );

  const pathPrefix = `/${user.username}/`;
  // Parent folder passed from the files page (absolute, e.g. /user/docs/api)
  const initialRelativeDir = toUserRelativePath(initialPath, user.username);

  const form = useForm<FileFormType>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      content: initialData?.content || "",
      title: initialData?.title || "",
      password: initialData?.password || "",
      file: undefined,
      path: initialData?.path
        ? initialData.path.replace(new RegExp(`^${pathPrefix}`), "")
        : initialRelativeDir
          ? `${initialRelativeDir}/`
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
    if (currentFileType !== "other" && !data.file) {
      // Media without a new file: keep the existing blob untouched.
      data = {
        ...data,
        content: undefined,
      };
    }

    if (mode === "upload" && !data.content && !data.file) {
      toast.error("Either file or content is required");
      return;
    }

    const fullPath = getFullPath();
    data = { ...data, path: fullPath };

    if (!force && !hasFileExtention(fullPath)) {
      setAlertDialogOpen(true);
      return;
    }

    setIsPending(true);
    const formData = zodToFormData(data);
    const isUpdate = mode === "update" && initialData?.id !== undefined;
    const result = isUpdate
      ? await updateFile(initialData.id, formData)
      : await uploadFile(formData);

    if (result.error) {
      toast.error(result.error);
      setIsPending(false);
      return;
    }

    if (isUpdate) {
      toast.success("File updated successfully");
      setIsPending(false);
      return;
    }

    toast.success("File created successfully");
    // Clear the form before leaving so that returning to the "New File" page
    // doesn't restore the content of the file we just created.
    form.reset();
    setCurrentFileType("other");
    setMediaUrl(null);
    const createdId = result.data?.id;
    if (createdId !== undefined) {
      router.push(`/dashboard/file/edit/${createdId}`);
      return;
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
      if (!form.getValues("title")) {
        form.setValue("title", file.name);
      }
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
        <form
          autoComplete="off"
          data-form-type="other"
          onSubmit={form.handleSubmit((value) => onSubmit(value, false))}
        >
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
                        name="file-title"
                        autoComplete="off"
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
                        autoComplete={showPassword ? "off" : "new-password"}
                        data-1p-ignore
                        data-lpignore="true"
                        data-bwignore
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
                        name="file-path"
                        autoComplete="off"
                        value={field.value}
                        type="text"
                        placeholder="myfile.html"
                      />
                    </InputGroup>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <div className="w-full grid gap-4 md:grid-cols-2 grid-cols-1">
                <VisibilitySelect control={form.control} name="visibility" />
                <ModeSelect control={form.control} name="mode" />
              </div>
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
                      onReject={(rejections) => {
                        const code = rejections[0]?.errors[0]?.code;
                        if (code === "file-too-large") {
                          toast.error(
                            `File is too large (max ${env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB} MB)`,
                          );
                        } else if (code === "file-invalid-type") {
                          toast.error("File type not allowed");
                        } else {
                          toast.error(
                            rejections[0]?.errors[0]?.message ??
                              "Could not add file",
                          );
                        }
                      }}
                    />
                  )}
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex items-center justify-center mt-2 gap-4 w-fit">
            <Button type="submit" disabled={isPending}>
              {isPending ? pendingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
