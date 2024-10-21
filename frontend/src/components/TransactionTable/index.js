import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionTable = ({ month }) => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchTransactions();
    }, [month, search, page]);

    const fetchTransactions = async () => {
        const response = await axios.get('/transactions', {
            params: {
                month,
                search,
                page,
                per_page: 10,
            },
        });
        setTransactions(response.data);
        setTotalPages(Math.ceil(response.headers['x-total-count'] / 10)); 
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Date of Sale</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{transaction.title}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.price}</td>
                            <td>{transaction.category}</td>
                            <td>{transaction.dateOfSale}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button onClick={() => setPage(page > 1 ? page - 1 : page)}>Previous</button>
                <button onClick={() => setPage(page < totalPages ? page + 1 : page)}>Next</button>
            </div>
        </div>
    );
};

export default TransactionTable;
