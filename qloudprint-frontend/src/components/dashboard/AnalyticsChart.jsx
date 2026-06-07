import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "#ef4444"
];

const AnalyticsChart = ({
    orders
}) => {

    const statusCounts = {};

    orders.forEach((order) => {

        statusCounts[order.status] =
            (statusCounts[order.status] || 0) + 1;
    });

    const data = Object.keys(statusCounts)
        .map((status) => ({
            name: status,
            value: statusCounts[status]
        }));

    return (
        <div className="
            bg-white
            p-6
            rounded-2xl
            shadow-md
            h-[400px]
        ">

            <h2 className="
                text-xl
                font-bold
                mb-6
            ">
                Order Analytics
            </h2>

            <ResponsiveContainer
                width="100%"
                height="90%"
            >

                <PieChart>

                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={120}
                        label
                    >

                        {data.map((entry, index) => (

                            <Cell
                                key={index}
                                fill={
                                    COLORS[
                                        index % COLORS.length
                                    ]
                                }
                            />

                        ))}

                    </Pie>

                    <Tooltip />

                    <Legend />

                </PieChart>

            </ResponsiveContainer>

        </div>
    );
};

export default AnalyticsChart;