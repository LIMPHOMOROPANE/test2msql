import React from 'react';
import { useEffect, useState } from 'react';

const StockList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
        setProducts(storedProducts);
    }, []);

    return (
        <section>
            <h2>List of Stock Transactions</h2>
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Stock Level</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.quantity}</td>
                            <td>{product.quantity < 5 ? "Low Stock" : "Available"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default StockList;