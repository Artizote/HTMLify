import { GitCloneForm } from "@/components/file/git-clone/form";
import { getMe } from "@/lib/modules/user/user.actions";

const page = async () => {
  const user = await getMe();
  if (!user) {
    return "oh shit";
  }
  return (
    <div className="w-full max-w-7xl mx-auto pt-10 px-4">
      <GitCloneForm user={user} />
    </div>
  );
};

export default page;
