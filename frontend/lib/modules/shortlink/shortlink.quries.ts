import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createShortLink } from "@/lib/modules/shortlink/shortlink.api";
import { ShortLinkFormType } from "@/lib/modules/shortlink/shortlink.types";
import { QUERY_KEYS } from "@/shared/query-keys";

export const useShortLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ShortLinkFormType) => {
      return createShortLink(data.herf, data.new);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shortlink.all });
    },
  });
};
