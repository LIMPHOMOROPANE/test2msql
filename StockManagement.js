import React, { useEffect, useState } from 'react';

const StockManagement = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({ action: 'add', quantity: '' });
    const [errors, setErrors] = useState({});
    const [transactions, setTransactions] = useState([]); // Maintain transaction records
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts(); // Call fetchProducts at mount
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/products');
            if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError('Error fetching products: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!selectedProduct) newErrors.product = "Product is required";
        if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
            newErrors.quantity = "Valid quantity is required and must be greater than 0";
        }
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'product') {
            const product = products.find(p => p.name === value);
            if (product) {
                setSelectedProduct(product);
                setErrors(prev => ({ ...prev, product: '' })); // Clear error if product found
            } else {
                setSelectedProduct(null);
                setErrors(prev => ({ ...prev, product: "Selected product not found" }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        setMessage('');
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const quantityChange = parseInt(formData.quantity);
        let updatedQuantity;

        if (formData.action === 'add') {
            updatedQuantity = selectedProduct.quantity + quantityChange;
        } else if (formData.action === 'deduct') {
            if (selectedProduct.quantity < quantityChange) {
                setMessage("Not enough stock to deduct");
                return;
            }
            updatedQuantity = selectedProduct.quantity - quantityChange;
        }

        await updateStock(selectedProduct.name, updatedQuantity); // Update backend stock
        await logTransaction(formData.action, quantityChange); // Log the transaction
        setMessage(`${formData.action === 'add' ? 'Stock added' : 'Stock deducted'} successfully`);
        
        await fetchProducts(); // Refresh products after updating the stock
        setSelectedProduct(null); // Reset selection
        setFormData({ action: 'add', quantity: '' }); // Reset form
    };

    const updateStock = async (name, updatedQuantity) => {
        try {
            const response = await fetch(`http://localhost:8081/api/products/${name}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: updatedQuantity }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to update stock');
            }
    
            // Logic to update local state
            setProducts(prevProducts => 
              prevProducts.map(product => 
                product.name === name ? { ...product, quantity: updatedQuantity } : product
              )
            );
    
            // Optionally, you can fetch the updated product list again
            await fetchProducts(); // Ensuring the product list is current

            setMessage('Stock updated successfully');
    
        } catch (err) {
            console.error('Error updating stock:', err);
            setMessage('Failed to update stock. Please try again.');
        }
    };

    const logTransaction = async (action, quantity) => {
        const transaction = {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            action,
            quantity,
        };

        setTransactions(prevTransactions => [...prevTransactions, transaction]);

        // Optionally log the transaction to backend
        try {
            const response = await fetch('http://localhost:8081/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transaction),
            });

            if (!response.ok) {
                throw new Error('Failed to log transaction');
            }
            
        } catch (err) {
            console.error('Error logging transaction:', err);
            setMessage('Failed to log transaction. Please try again.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Product List</h2>
            <select name="product" onChange={handleChange} value={selectedProduct?.name || ""}>
                <option value="" disabled>Select Product</option>
                {products.map(product => (
                    <option key={product.id} value={product.name}>{product.name}</option>
                ))}
            </select>
            {errors.product && <span className="error-message">{errors.product}</span>}

            <form onSubmit={handleUpdateStock}>
                <select name="action" value={formData.action} onChange={handleChange}>
                    <option value="add">Add Stock</option>
                    <option value="deduct">Deduct Stock</option>
                </select>
                
                <input 
                    type="number" 
                    name="quantity" 
                    placeholder="Quantity" 
                    required 
                    value={formData.quantity} 
                    onChange={handleChange} 
                    className={errors.quantity ? 'error' : ''} 
                />
                {errors.quantity && <span className="error-message">{errors.quantity}</span>}
                
                <button type="submit">Update Stock</button>
            </form>

            {message && <p className="message">{message}</p>}

            <h3>Transactions</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Action</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length > 0 ? (
                        transactions.map((transaction, index) => (
                            <tr key={index}>
                                <td>{transaction.product_name}</td>
                                <td>{transaction.action}</td>
                                <td>{transaction.quantity}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No transactions found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StockManagement;