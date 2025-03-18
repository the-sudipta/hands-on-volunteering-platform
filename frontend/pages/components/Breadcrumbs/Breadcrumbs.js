import { useRouter } from "next/router";
import { FaHome, FaChevronRight } from "react-icons/fa";
import { Core_Functions } from "@/pages/utils/core_functions";
import routes from "@/route/routes";

const breadcrumbMap = {
    [routes.user_dashboard]: { label: "Home", icon: <FaHome /> },
    [routes.help_request]: { label: "Help Requests" },
    [routes.create_help_request]: { label: "Post Help Request" },
};

const Breadcrumbs = () => {
    const router = useRouter();
    const pathSegments = router.pathname.split("/").filter(Boolean); // Split and remove empty segments

    return (
        <nav className="mb-6 text-gray-400 flex items-center gap-2 text-sm">
            {Object.entries(breadcrumbMap).map(([route, { label, icon }], index) => {
                const isActive = router.pathname === route;

                return (
                    <div key={route} className="flex items-center gap-2">
                        {index > 0 && <FaChevronRight />} {/* Separator only between items */}
                        <button
                            onClick={() => Core_Functions.navigate(router, route)}
                            className={`inline-flex items-center gap-1 transition cursor-pointer ${
                                isActive ? "text-blue-500 font-bold" : "hover:text-blue-400"
                            }`}
                        >
                            {icon && <span className={isActive ? "text-blue-500" : "text-blue-400"}>{icon}</span>}
                            {label}
                        </button>
                    </div>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
