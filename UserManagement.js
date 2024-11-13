import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const UserManagement = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        position: '',
        idNumber: '',
        phoneNumber: ''
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(''); // State for displaying messages

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setMessage(''); // Clear message when user types
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = "Username is required";
        if (!formData.password) newErrors.password = "Password is required";
        if (!formData.position) newErrors.position = "Position is required";
        if (!formData.idNumber) newErrors.idNumber = "ID Number is required";
        if (!formData.phoneNumber) newErrors.phoneNumber = "Phone Number is required";
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
            const response = await fetch('http://localhost:8081/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password, // Note: In a real application, hash passwords before storing!
                    position: formData.position,
                    idNumber: formData.idNumber,
                    phoneNumber: formData.phoneNumber
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setMessage(`User added successfully: ${data.username}`); // Display success message
            setFormData({ username: '', password: '', position: '', idNumber: '', phoneNumber: '' });
        } catch (error) {
            console.error(error);
            setMessage(`Error adding user: ${error.message}`); // Display error message
        }
    };

    return (
        <section>
            <h2>User Management</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    name="username" 
                    placeholder="Username" 
                    required 
                    value={formData.username} 
                    onChange={handleChange} 
                />
                <span className="error-message">{errors.username}</span>

                <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    required 
                    value={formData.password} 
                    onChange={handleChange} 
                />
                <span className="error-message">{errors.password}</span>

                <input 
                    type="text" 
                    name="position" 
                    placeholder="Position" 
                    required 
                    value={formData.position} 
                    onChange={handleChange} 
                />
                <span className="error-message">{errors.position}</span>

                <input 
                    type="text" 
                    name="idNumber" 
                    placeholder="ID Number" 
                    required 
                    value={formData.idNumber} 
                    onChange={handleChange} 
                />
                <span className="error-message">{errors.idNumber}</span>

                <input 
                    type="text" 
                    name="phoneNumber" 
                    placeholder="Phone Number" 
                    required 
                    value={formData.phoneNumber} 
                    onChange={handleChange} 
                />
                <span className="error-message">{errors.phoneNumber}</span>

                <button type="submit">Add User</button>
            </form>
            {message && <p className="message">{message}</p>} {/* Display message here */}
            {/* Use Link and remove unnecessary handleViewUsers */}
            <Link to="/user-list"> {/* Ensure route is correct */}
                <button>View Users</button>
            </Link>
        </section>
    );
};

export default UserManagement;