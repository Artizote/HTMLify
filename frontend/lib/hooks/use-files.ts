import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getFileContentById,
  getFileInfoByPathOrID,
  gitCloneFile,
  updateFile,
  uploadFile,
} from "@/lib/modules/file/file.api";
import { GitCloneFormType } from "@/lib/modules/file/file.schema";
import { QUERY_KEYS } from "@/shared/query-keys";

export const useFileId = (path: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.files.id(path),
    queryFn: () => getFileInfoByPathOrID({ path }),
    enabled: !!path,
  });
};

export const useFileContent = (path: string) => {
  const { data: fileId } = useFileId(path);

  return useQuery({
    queryKey: QUERY_KEYS.files.content(path),
    queryFn: async () => {
      if (!fileId) throw new Error("File ID not found");
      const response = await getFileContentById(fileId.id);
      if (!response) throw new Error("Content not found");
      return response.text();
    },
    enabled: !!fileId,
  });
};

type FilePayload =
  | { formData: FormData; mode: "upload" }
  | { formData: FormData; mode: "update"; id?: number };

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FilePayload) =>
      data.mode === "upload" || data.id === undefined
        ? uploadFile(data.formData)
        : updateFile(data.id, data.formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files.all });
    },
  });
};

export const useGitClone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GitCloneFormType) => {
      return gitCloneFile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files.all });
    },
  });
};
