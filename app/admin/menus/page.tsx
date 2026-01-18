import { getMenus } from "@/app/actions/admin";
import { MenuManager } from "./MenuManager";

export default async function AdminMenuPage() {
    const menus = await getMenus();

    return (
        <div className="max-w-5xl mx-auto">
            <MenuManager initialMenus={menus} />
        </div>
    );
}
