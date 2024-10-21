import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const BarChart = ({ month }) => {
    const [data, setData] = useState({});

    useEffect(() => {
        fetchBarChartData();
    }, [month]);

    const fetchBarChartData = async () => {
        const response = await axios.get('/bar-chart', { params: { month } });
        const labels = response.data.map(item => item.priceRange);
        const counts = response.data.map(item => item.count);

        setData({
            labels,
            datasets: [
                {
                    label: 'Number of Items',
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
            ],
        });
    };

    return (
        <div>
            <h2>Price Range Distribution for {month}</h2>
            <Bar data={data} />
        </div>
    );
};

export default BarChart;
