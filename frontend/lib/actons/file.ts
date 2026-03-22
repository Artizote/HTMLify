import { FileIDResponse } from "@/shared/types";
import { BACKEND_API_URL } from "../config";
import { apiFetch } from "@/lib/fetch";


export const getFileIDByPath = async (path: string): Promise<FileIDResponse | null> => {
    console.log("Backend API URL:", BACKEND_API_URL, "Path:", path);
    const response = await fetch(`${BACKEND_API_URL}/v1/files?path=${path}`);
    if (!response.ok) {
        return null;
    }
    const data: FileIDResponse = await response.json();
    return data;
};

export const getFileContentById = async (id: number): Promise<Response | null> => {
    const response = await fetch(`${BACKEND_API_URL}/v1/files/${id}/content`);
    if (!response.ok) {
        console.error(`Failed to fetch file content for id: ${id}`);
        return null
    }
    return response;
};

export const getFileContentByPath = async (path: string) => {
    const data = await getFileIDByPath(path);
    if (!data) return null;
    return getFileContentById(data.id);
};

export const uploadFile = async (formData: FormData): Promise<FileIDResponse> => {
    return apiFetch<FileIDResponse>(`${BACKEND_API_URL}/v1/files/upload`, {
        method: "POST",
        body: formData,
    });
};
