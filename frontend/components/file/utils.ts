import { FileFormType } from "@/lib/modules/file/file.schema";

const getSubmitData = (
  data: FileFormType,
  mode: string,
  updateMode: string | null,
) => {
  if (mode !== "update") return data;

  return {
    ...data,
    file: updateMode === "file" ? data.file : undefined,
    content: updateMode === "content" ? data.content : undefined,
  };
};

export { getSubmitData };
