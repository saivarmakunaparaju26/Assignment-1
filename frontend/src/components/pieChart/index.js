import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';

const PieChart = ({ month }) => {
    const [data, setData] = useState({});

    useEffect(() => {
        fetchPieChartData();
    }, [month]);

    const fetchPieChartData = async () => {
        const response = await axios.get('/pie-chart', { params: { month } });
        const labels = response.data.map(item => item.category);
        const counts = response.data.map(item => item.count);

        setData({
            labels,
            datasets: [
                {
                    data: counts,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0'],
                },
            ],
        });
    };

    return (
        <div>
            <h2>Category Distribution for {month}</h2>
            <Pie data={data} />
        </div>
    );
};

export default PieChart;
