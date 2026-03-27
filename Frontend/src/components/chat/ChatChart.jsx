import React from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, Legend
} from "recharts";

/**
 * Recharts component for sentiment comparison inside chat messages.
 */
const ChatChart = ({ data, title }) => {
    return (
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 my-4 h-75 w-full min-w-75 shadow-inner backdrop-blur-sm">
            {title && <h4 className="text-white text-sm font-semibold mb-4 text-center">{title}</h4>}
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            color: "#fff"
                        }}
                        itemStyle={{ color: "#3b82f6" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChatChart;
