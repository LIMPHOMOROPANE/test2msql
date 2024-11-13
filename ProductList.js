import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loadingDeleteName, setLoadingDeleteName] = useState(null);
    const [message, setMessage] = useState('');
    const [sellQuantity, setSellQuantity] = useState({});
    const [transactionLog, setTransactionLog] = useState({}); // Holds transaction history for products
    const navigate = useNavigate();

    // Function to fetch products
    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await fetch('http://localhost:8081/api/products');
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            setError('Error fetching products: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(); // Fetch products when component mounts
    }, []);

    // Function to handle deleting a product
    const handleDelete = async (name) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this product?');

        if (confirmDelete) {
            setLoadingDeleteName(name);
            setMessage('');
            try {
                const response = await fetch(`http://localhost:8081/api/products?name=${encodeURIComponent(name)}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                setProducts((prevProducts) => prevProducts.filter((product) => product.name !== name));
                setMessage('Product "' + name + '" deleted successfully');
            } catch (error) {
                setError('Error deleting product: ' + error.message);
            } finally {
                setLoadingDeleteName(null);
            }
        }
    };

    // Function to handle selling a product
    const handleSell = async (name) => {
        const quantityToSell = parseInt(sellQuantity[name], 10);
        
        if (quantityToSell <= 0 || isNaN(quantityToSell)) {
            alert("Quantity must be a positive number!");
            return;
        }

        const confirmSell = window.confirm(`Are you sure you want to sell ${quantityToSell} of ${name}?`);

        if (confirmSell) {
            try {
                const response = await fetch('http://localhost:8081/api/sell', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        quantity: quantityToSell,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Error selling product: ' + response.statusText);
                }

                setMessage(`Successfully sold ${quantityToSell} of ${name}`);

                // Update transaction log for this product
                setTransactionLog((prev) => ({
                    ...prev,
                    [name]: [...(prev[name] || []), { action: 'deduct', quantity: quantityToSell }],
                }));

                setSellQuantity((prev) => ({ ...prev, [name]: '' })); // Reset the sold quantity input
                fetchProducts(); // Refresh product list
            } catch (error) {
                setError('Error selling product: ' + error.message);
            }
        }
    };

    const handleEdit = (product) => {
        navigate('/product-management', { state: product });
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <section>
            <h2>Product List</h2>
            {message && <p>{message}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <tr key={product.name}>
                                <td>{product.name}</td>
                                <td>{product.description}</td>
                                <td>{product.category}</td>
                                <td>M{product.price.toFixed(2)}</td>
                                <td>{product.quantity}</td>
                                <td>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={sellQuantity[product.name] || ''} 
                                        onChange={(e) => setSellQuantity({ ...sellQuantity, [product.name]: e.target.value })} 
                                        placeholder="Quantity to Sell"
                                    />
                                    <button onClick={() => handleSell(product.name)}>Sell</button>
                                    <button onClick={() => handleEdit(product)}>Edit</button>
                                    <button 
                                        onClick={() => handleDelete(product.name)} 
                                        disabled={loadingDeleteName === product.name}
                                    >
                                        {loadingDeleteName === product.name ? 'Deleting...' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6}>No products available</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <h3>Transaction Log</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Action</th>
                        <th>Quantity Changed</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(transactionLog).length > 0 ? (
                        Object.keys(transactionLog).flatMap(productName => 
                            transactionLog[productName].map((transaction, index) => (
                                <tr key={`${productName}-${index}`}>
                                    <td>{productName}</td>
                                    <td>{transaction.action === 'deduct' ? 'Sold' : 'Added'}</td>
                                    <td>{transaction.quantity}</td>
                                </tr>
                            ))
                        )
                    ) : (
                        <tr>
                            <td colSpan={3}>No transactions recorded</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </section>
    );
};

export default ProductList;