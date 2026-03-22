import { FileForm } from "@/components/file/form";
import { getMe } from "@/lib/actons/user";

export default async function NewFileCreatePage() {
    const user = await getMe()
    if (!user) {
        return "oh shit 2"
    }
    return (
        <div className="container mx-auto pt-10 px-4">
            <FileForm user={user} initialData={{ name: "demo", password: "", path: "/biisal", mode: "render", visibility: "public" }} />
        </div>
    )
}

