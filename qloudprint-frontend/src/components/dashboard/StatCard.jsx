const StatCard = ({
    title,
    value
}) => {

    return (
        <div className="
            bg-white
            rounded-2xl
            p-6
            shadow-md
        ">

            <h3 className="
                text-gray-500
                text-sm
            ">
                {title}
            </h3>

            <h1 className="
                text-3xl
                font-bold
                mt-2
            ">
                {value}
            </h1>

        </div>
    );
};

export default StatCard;