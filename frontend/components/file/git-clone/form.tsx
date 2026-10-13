"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Folder, Globe } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

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
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { gitCloneFile } from "@/lib/modules/file/file.api";
import {
  GitCloneFormType,
  gitCloneSchema,
} from "@/lib/modules/file/file.schema";
import { toUserRelativePath } from "@/lib/modules/file/file.utils";
import { UserFullInfo } from "@/lib/modules/user/user.types";

export const GitCloneForm = ({
  user,
  initialFolder,
}: {
  user: UserFullInfo;
  initialFolder?: string;
}) => {
  const [isPending, setIsPending] = useState(false);

  const pathPrefix = `/${user.username}/`;

  const form = useForm<GitCloneFormType>({
    resolver: zodResolver(gitCloneSchema),
    defaultValues: {
      repo_url: "",
      folder: toUserRelativePath(initialFolder, user.username),
      mode: "render",
      visibility: "public",
      overwrite: true,
    },
  });

  const onSubmit = async (data: GitCloneFormType) => {
    setIsPending(true);
    // Always clone under the user's own root, no matter what was typed.
    const sub = data.folder.replace(/^\/+/, "").replace(/\/+$/, "");
    const payload = { ...data, folder: `${pathPrefix}${sub}` };
    const { error } = await gitCloneFile(payload);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Repository cloned successfully");
    }
    setIsPending(false);
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Git Clone</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="w-full grid gap-4 md:grid-cols-2 grid-cols-1">
              <Controller
                name="repo_url"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Repository URL</FieldLabel>
                    <InputGroup className="h-11">
                      <InputGroupAddon>
                        <Globe />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        type="url"
                        placeholder="https://github.com/user/repo.git"
                      />
                    </InputGroup>
                    <FieldError errors={[fieldState.error]}></FieldError>
                  </Field>
                )}
              />

              <Controller
                name="folder"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Folder</FieldLabel>
                    <InputGroup className="h-11">
                      <InputGroupAddon>
                        <Folder />
                      </InputGroupAddon>
                      <InputGroupAddon className="text-muted-foreground/60 font-mono text-sm select-none">
                        {pathPrefix}
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        placeholder="subfolder (optional)"
                      />
                    </InputGroup>
                    <FieldError errors={[fieldState.error]}></FieldError>
                  </Field>
                )}
              />

              <VisibilitySelect control={form.control} name="visibility" />

              <ModeSelect control={form.control} name="mode" />
            </div>

            <Controller
              name="overwrite"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="overwrite"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="overwrite">Overwrite existing files</Label>
                </div>
              )}
            />
          </FieldGroup>

          <div className="flex items-center mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Cloning..." : "Clone Repository"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
