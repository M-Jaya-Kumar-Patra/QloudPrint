import Sidebar from "../components/layout/Sidebar";

import Topbar from "../components/layout/Topbar";
import { PublicFooter } from "../pages/public/PublicInfoPages";

const DashboardLayout = ({
    children
}) => {

    return (
        <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white lg:flex">

            <Sidebar />

            <div className="
    lg:ml-72
    lg:pt-0
    flex-1
    bg-slate-100
    dark:bg-slate-950
    min-h-screen
">

                <Topbar />

                <div className="p-5 lg:p-8">
                    {children}
                </div>

                <PublicFooter />

            </div>

        </div>
    );
};

export default DashboardLayout;
