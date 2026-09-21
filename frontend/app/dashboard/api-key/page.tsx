import { ApiKeyCard } from "@/components/dashboard/api-key-card";
import { DasshboardNavbar } from "@/components/dashboard/dashbaord-navbar";
import { getApiKey } from "@/lib/modules/user/user.api";

export default async function ApiKeyPage() {
  const { data, error } = await getApiKey();

  return (
    <>
      <DasshboardNavbar title="API Keys" />
      <div className="flex w-full justify-center px-6 py-16">
        {error || !data ? (
          <p className="text-sm text-muted-foreground">Failed to get API key</p>
        ) : (
          <ApiKeyCard apiKey={data.api_key} />
        )}
      </div>
    </>
  );
}
