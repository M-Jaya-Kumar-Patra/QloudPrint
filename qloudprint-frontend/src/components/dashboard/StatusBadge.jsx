const StatusBadge = ({
    status
}) => {

    const statusColors = {

        PENDING:
            "bg-yellow-100 text-yellow-700",

        QUEUED:
            "bg-blue-100 text-blue-700",

        PRINTING:
            "bg-purple-100 text-purple-700",

        READY:
            "bg-green-100 text-green-700",

        COMPLETED:
            "bg-gray-200 text-gray-700",
    };

    return (
        <span
            className={`
                px-4 py-1 rounded-full
                text-sm font-semibold
                ${statusColors[status]}
            `}
        >
            {status}
        </span>
    );
};

export default StatusBadge;