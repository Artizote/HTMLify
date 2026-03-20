type FileIDResponse = {
    id: number;
    user: string;
    title: string;
    path: string;
    views: number;
    blob_hash: string;
    mode: string;
    visibility: "public" | "private" | string;
    password: string | null;
    as_guest: boolean;
    modified: string;
    content: string | null;
};

export type { FileIDResponse };

// type File = Omit<FileApiResponse, "as_guest"> & { asGuest: boolean;
// };