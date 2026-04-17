import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/query-keys";

import { createTmpFile } from "./tmp.api";
import { TmpFormType } from "./tmp.types";

export const useTmpFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TmpFormType) => {
      return createTmpFile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tmp.all });
    },
  });
};
