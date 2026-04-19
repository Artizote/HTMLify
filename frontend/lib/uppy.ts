import type { Meta, UppyFile } from "@uppy/core";

import { getMe } from "@/lib/modules/user/user.actions";

export const checkUserSession = () => {
  getMe().catch((error) => {
    console.error("Uppy Session Check Error:", error);
  });
};

export const assignMetaToFiles = (
  files: Record<string, UppyFile<Meta, Record<string, never>>>,
  metaCallback: (
    file: UppyFile<Meta, Record<string, never>>,
  ) => Record<string, string | number | boolean | null | undefined>,
) => {
  const updatedFiles = { ...files };
  Object.keys(updatedFiles).forEach((fileId) => {
    const file = updatedFiles[fileId];
    updatedFiles[fileId] = {
      ...file,
      meta: {
        ...file.meta,
        ...metaCallback(file),
      },
    };
  });
  return updatedFiles;
};
