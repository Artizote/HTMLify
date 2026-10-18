import { DasshboardNavbar } from "@/components/dashboard/dashbaord-navbar";
import { GitCloneForm } from "@/components/file/git-clone/form";
import { getMe } from "@/lib/modules/user/user.actions";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) => {
  const user = await getMe();
  if (!user) {
    return "oh shit";
  }
  const { path } = await searchParams;
  return (
    <>
      <DasshboardNavbar title="Git Clone" />
      <div className="w-full max-w-7xl mx-auto pt-10 px-4">
        <GitCloneForm user={user} initialFolder={path} />
      </div>
    </>
  );
};

export default page;
