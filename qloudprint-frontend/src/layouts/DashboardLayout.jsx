import Sidebar from "../components/layout/Sidebar";

import Topbar from "../components/layout/Topbar";

const DashboardLayout = ({
    children
}) => {

    return (
        <div className="flex">

            <Sidebar />

            <div className="
                ml-64
                flex-1
                bg-gray-100
                min-h-screen
            ">

                <Topbar />

                <div className="p-8">
                    {children}
                </div>

            </div>

        </div>
    );
};

export default DashboardLayout;