import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/products');
                if (!response.ok) {
                    throw new Error('Error fetching products: ' + response.statusText);
                }
                const productsData = await response.json();
                setProducts(productsData);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchData();
    }, []);

    const calculateTotalStockValue = () => {
        return products.reduce((total, product) => {
            return total + (product.price * product.quantity);
        }, 0).toFixed(2);
    };

    const barData = {
        labels: products.map(product => product.name),
        datasets: [
            {
                label: 'Quantity Available',
                data: products.map(product => product.quantity),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'Total Cost',
                data: products.map(product => product.price * product.quantity),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <section>
            <h2>Dashboard</h2>
            <h3>Total Stock Value: M{calculateTotalStockValue()}</h3>
            <Bar data={barData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
            <h3>Stock Inventory</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity Remaining</th>
                        <th>Price</th>
                        <th>Stock Level</th>
                       
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.quantity}</td>
                                <td>M{product.price.toFixed(2)}</td>
                                <td>{product.quantity < 5 ? "Low Stock" : "Available"}</td>
                                
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5}>No Products Available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </section>
    );
};

export default Dashboard;