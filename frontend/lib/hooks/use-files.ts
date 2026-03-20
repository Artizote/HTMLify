import { useQuery } from "@tanstack/react-query";
import { getFileIDByPath, getFileContentById } from "../actons/file";
import { QUERY_KEYS } from "@/shared/query-keys";

export const useFileId = (path: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.files.id(path),
        queryFn: () => getFileIDByPath(path),
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
