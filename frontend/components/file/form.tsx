"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, File as FileIcon, Folder, Lock } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { FileDropzone } from "@/components/file/file-dropzone";
import CodeEditor from "@/components/playgroud/code-editor";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadFile } from "@/lib/hooks/use-files";
import { getLanguageByPath } from "@/lib/modules/playgournd/editor.utils";
import { UserFullInfo } from "@/lib/modules/user/user.types";
import { zodToFormData } from "@/lib/utils";

const fileFormSchema = z
  .object({
    content: z.string().optional(),
    file: z.instanceof(File).optional(),
    title: z.string().min(1, "Title is required"),
    path: z.string().min(1, "Path is required"),
    password: z.string().optional(),
    mode: z
      .enum(["source", "render"], { required_error: "Mode is required" })
      .default("source"),
    visibility: z.string().optional().default("public"),
  })
  .superRefine((data, ctx) => {
    if (!data.content && !data.file) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either file or content is required",
        path: ["file"],
      });
    }
  });

interface InitialDataProps {
  id: number;
  title: string;
  path: string;
  password: string | null;
  mode: "source" | "render";
  visibility: string;
  content?: string | null;
}
type FileFormProps =
  | { mode: "update"; initialData: InitialDataProps; user: UserFullInfo }
  | { mode: "upload"; initialData?: never; user: UserFullInfo };

export const FileForm = ({
  user,
  initialData,
  mode = "upload",
}: FileFormProps) => {
  const { mutate: uploadFile, isPending } = useUploadFile();
  const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
  const form = useForm<z.infer<typeof fileFormSchema>>({
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

  const [showPassword, setShowPassword] = useState(false);
  const onSubmit = (data: z.infer<typeof fileFormSchema>) => {
    const formData = zodToFormData(data);

    uploadFile(
      mode === "update"
        ? {
            mode: "update",
            formData,
            id: initialData!.id,
          }
        : {
            mode: "upload",
            formData,
          },
      {
        onSuccess: () => {
          toast.success(
            `File ${mode === "update" ? "updated" : "uploaded"} successfully`,
          );
          if (mode === "upload") {
            form.reset();
          }
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to upload file",
          );
        },
      },
    );
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>{modeText} File</CardTitle>
      </CardHeader>
      <CardContent>
        {mode === "update" && (
          <CodeEditor
            code={form.getValues("content") || ""}
            onChange={(code) => {
              form.setValue("content", code);
            }}
            path={initialData?.path || ""}
            language={getLanguageByPath(initialData?.path || "")}
          />
        )}
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                        type="text"
                        placeholder="enter the title of ur file"
                      />
                    </InputGroup>
                    <FieldError errors={[fieldState.error]}></FieldError>
                  </Field>
                )}
              />

              <Controller
                name="path"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Path</FieldLabel>
                    <FieldDescription>
                      make sure the path starts with /{user.username}/
                    </FieldDescription>
                    <InputGroup className="h-11">
                      <InputGroupAddon>
                        <Folder />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        placeholder="enter the file path"
                      />
                    </InputGroup>
                    <FieldError errors={[fieldState.error]}></FieldError>
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
                        type={showPassword ? "text" : "password"}
                        placeholder="password (optional)"
                      />
                      <InputGroupButton
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroup>
                    <FieldError errors={[fieldState.error]}></FieldError>
                  </Field>
                )}
              />
              <Controller
                name="visibility"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Visibility</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="select a mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Visibility</SelectLabel>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="once">Once</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]}></FieldError>
                  </Field>
                )}
              />
              <Controller
                name="mode"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Mode</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="select a mode" />
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
            </div>
            <Controller
              name="file"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>File</FieldLabel>
                  <FileDropzone
                    maxSize={10 * 1024 * 1024}
                    maxFiles={1}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FieldError errors={[fieldState.error]}></FieldError>
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
