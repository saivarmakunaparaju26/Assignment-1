import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionTable from './components/TransactionTable';
import TransactionStatistics from './components/TransactionStatistics';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';

const App = () => {
    const [month, setMonth] = useState('March');
    
    useEffect(() => {
        
        fetchData();
    }, [month]);

    const fetchData = async () => {
        
    };

    return (
        <div>
            <h1>Product Transactions</h1>
            <label>
                Select Month: 
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </label>
            <TransactionStatistics month={month} />
            <TransactionTable month={month} />
            <BarChart month={month} />
            <PieChart month={month} />
        </div>
    );
};

export default App;

