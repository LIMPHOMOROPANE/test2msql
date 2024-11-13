import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ProductManagement = () => {
    const location = useLocation();
    const existingProduct = location.state; // Grab existing product data

    const [formData, setFormData] = useState(existingProduct || {
        name: '',
        description: '',
        category: '',
        price: '',
        quantity: ''
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setMessage('');
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Product name is required";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.price || isNaN(formData.price) || formData.price <= 0) newErrors.price = "Valid price is required";
        if (!formData.quantity || isNaN(formData.quantity) || formData.quantity <= 0) newErrors.quantity = "Valid quantity is required";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const method = existingProduct ? 'PUT' : 'POST'; // Determine method
            const response = await fetch('http://localhost:8081/api/products', {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    price: parseFloat(formData.price),
                    quantity: parseInt(formData.quantity),
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setMessage(`Product ${existingProduct ? 'updated' : 'added'} successfully: ${data.name}`);
            setFormData({ name: '', description: '', category: '', price: '', quantity: '' });
        } catch (error) {
            console.error(error);
            setMessage(`Error ${existingProduct ? 'updating' : 'adding'} product: ${error.message}`);
        }
    };

    return (
        <section>
            <h2>{existingProduct ? 'Edit Product' : 'Product Management'}</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    name="name" 
                    placeholder="Product Name" 
                    required 
                    value={formData.name} 
                    onChange={handleChange} 
                />
                <span className="error-message">{errors.name}</span>
                
                <input 
                    type="text" 
                    name="description" 
                    placeholder="Product Description" 
                    required 
                    value={formData.description} 
                    onChange={handleChange} 
                />
                <span className="error-message">{errors.description}</span>
                
                <input 
                    type="text" 
                    name="category" 
                    placeholder="Product Category" 
                    required 
                    value={formData.category} 
                    onChange={handleChange} 
                />
                <span className="error-message">{errors.category}</span>

                <input 
                    type="number" 
                    name="price" 
                    placeholder="Product Price" 
                    required 
                    value={formData.price} 
                    onChange={handleChange} 
                />
                <span className="error-message">{errors.price}</span>
                
                <input 
                    type="number" 
                    name="quantity" 
                    placeholder="Product Quantity" 
                    required 
                    value={formData.quantity} 
                    onChange={handleChange} 
                />
                <span className="error-message">{errors.quantity}</span>

                <button type="submit">{existingProduct ? 'Update Product' : 'Add Product'}</button>
            </form>
            {message && <p className="message">{message}</p>}
            <Link to="/product-list">
                <button>View Products</button>
            </Link>
        </section>
    );
};

export default ProductManagement;