import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionStatistics = ({ month }) => {
    const [statistics, setStatistics] = useState({ totalSales: 0, totalSold: 0, totalNotSold: 0 });

    useEffect(() => {
        fetchStatistics();
    }, [month]);

    const fetchStatistics = async () => {
        const response = await axios.get('/statistics', {
            params: { month },
        });
        setStatistics(response.data);
    };

    return (
        <div>
            <h2>Statistics for {month}</h2>
            <p>Total Sales: {statistics.totalSales}</p>
            <p>Total Sold Items: {statistics.totalSold}</p>
            <p>Total Not Sold Items: {statistics.totalNotSold}</p>
        </div>
    );
};

export default TransactionStatistics;
