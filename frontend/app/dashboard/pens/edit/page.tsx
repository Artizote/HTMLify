import { DasshboardNavbar } from "@/components/dashboard/dashbaord-navbar";
import { PenEditor } from "@/components/pens/editors";
import { getPenById } from "@/lib/modules/pen/pen.api";
import { PenResponse } from "@/lib/modules/pen/pen.schema";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) => {
  const { id } = await searchParams;
  let penRes: PenResponse | null = null;
  if (id) {
    const { data, error } = await getPenById(id);
    if (error || !data) {
      console.error(error);
    }
    penRes = data;
  }
  return (
    <>
      <DasshboardNavbar title="Edit Pen" />
      <div className="w-full h-full">
        <PenEditor data={penRes} />
      </div>
    </>
  );
};

export default page;
