import { FileForm } from "@/components/file/form";
import { getMe } from "@/lib/modules/user/user.actions";
export default async function NewFileCreatePage() {
  const user = await getMe();
  if (!user) {
    return "oh shit";
  }
  return (
    <div className="container mx-auto pt-10 px-4">
      <FileForm mode="upload" user={user} />
    </div>
  );
}
