import React, { useState, useEffect } from 'react';

const Auth = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        position: '',
        idNumber: '',
        phoneNumber: ''
    });
    const [users, setUsers] = useState([]);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true); // Start loading
            try {
                const response = await fetch('http://localhost:8081/api/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch users. Please check your server.');
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
                setMessage('Error fetching users. Please ensure your server is running and try again later.');
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = "Username is required";
        if (!formData.password) newErrors.password = "Password is required";
        if (isSignUp) {
            if (!formData.position) newErrors.position = "Position is required";
            if (!formData.idNumber) newErrors.idNumber = "ID Number is required";
            if (!formData.phoneNumber) newErrors.phoneNumber = "Phone Number is required";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (isSignUp) {
            if (users.find(user => user.idNumber === formData.idNumber)) {
                alert('User with this ID number already exists.');
                return;
            }

            try {
                const response = await fetch('http://localhost:8081/api/users', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    throw new Error('Failed to sign up. Please check your input and try again.');
                }

                const data = await response.json();
                console.log("Sign up successful", data);
                setMessage('Sign up successful! You can now log in.');
                localStorage.setItem('users', JSON.stringify([...users, data]));
                setIsSignUp(false);
            } catch (err) {
                console.error('Sign up error:', err);
                setMessage(err.message); // Display the error message from the server
            }
        } else {
            const usersFromLocalStorage = JSON.parse(localStorage.getItem("users")) || [];
            const user = [...usersFromLocalStorage, ...users].find(u => u.username === formData.username && u.password === formData.password);
            if (user) {
                onLogin();
            } else {
                alert('Invalid username or password');
            }
        }
    };

    return (
        <section>
            <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
            {loading ? ( // Show loading message
                <p>Loading users...</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <input type="text" name="username" placeholder="Username" required value={formData.username} onChange={handleChange} className={errors.username ? 'error' : ''} />
                    <span className="error-message">{errors.username}</span>
                    <input type="password" name="password" placeholder="Password" required value={formData.password} onChange={handleChange} className={errors.password ? 'error' : ''} />
                    <span className="error-message">{errors.password}</span>
                    {isSignUp && (
                        <>
                            <input type="text" name="position" placeholder="Position" required value={formData.position} onChange={handleChange} className={errors.position ? 'error' : ''} />
                            <span className="error-message">{errors.position}</span>
                            <input type="text" name="idNumber" placeholder="ID Number" required value={formData.idNumber} onChange={handleChange} className={errors.idNumber ? 'error' : ''} />
                            <span className="error-message">{errors.idNumber}</span>
                            <input type="text" name="phoneNumber" placeholder="Phone Number" required value={formData.phoneNumber} onChange={handleChange} className={errors.phoneNumber ? 'error' : ''} />
                            <span className="error-message">{errors.phoneNumber}</span>
                        </>
                    )}
                    <button type="submit">{isSignUp ? "Create Account" : "Login"}</button>
                    <p>
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <button type="button" onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? "Login" : "Sign Up"}</button>
                    </p>
                    {message && <p className="message">{message}</p>} {/* Display messages */}
                </form>
            )}
        </section>
    );
};

export default Auth;