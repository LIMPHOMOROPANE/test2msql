import React, { useState, useEffect } from 'react';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', idNumber: '', phoneNumber: '', position: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/users');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = async (username) => {
        console.log(`Deleting user with ID number: ${username}`);
        try {
            const response = await fetch(`http://localhost:8081/api/users/${username}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const updatedUsers = users.filter(user => user.username !== username);
            setUsers(updatedUsers);
            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEdit = (user) => {
        console.log(`Editing user:`, user);
        setEditingUser(user);
        setFormData({ 
            username: user.username, 
            idNumber: user.idNumber,
            phoneNumber: user.phoneNumber,
            position: user.position 
        });
    };

    const handleChange = (event) => {
        const { username, value } = event.target;
        setFormData(prev => ({ ...prev, [username]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log('Submitting edit for user:', formData);
        try {
            const response = await fetch(`http://localhost:8081/api/users/${editingUser.name}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const updatedUser = await response.json();
            const updatedUsers = users.map(user =>
                user.username === editingUser.v ? updatedUser : user
            );
            setUsers(updatedUsers);
            setEditingUser(null);
            alert('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    return (
        <section>
            <h2>List of Users</h2>
            {editingUser ? (
                <form onSubmit={handleSubmit}>
                    <h3>Edit User</h3>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
                    <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="ID Number" required disabled />
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" required />
                    <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="Position" required />
                    <button type="submit">Save</button>
                    <button type="button" onClick={handleCancelEdit}>Cancel</button>
                </form>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>ID Number</th>
                            <th>Phone Number</th>
                            <th>Position</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.idNumber}>
                                <td>{user.username}</td>
                                <td>{user.idNumber}</td>
                                <td>{user.phoneNumber}</td>
                                <td>{user.position}</td>
                                <td>
                                    <button onClick={() => handleEdit(user)}>Edit</button>
                                    <button onClick={() => handleDelete(user.username)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
};

export default UserList;