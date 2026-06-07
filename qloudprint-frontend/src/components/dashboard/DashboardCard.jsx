const DashboardCard = ({
    children
}) => {

    return (
        <div className="
            bg-white
            rounded-2xl
            shadow-md
            p-6
            border
            border-gray-100
            hover:shadow-xl
            transition
        ">
            {children}
        </div>
    );
};

export default DashboardCard;