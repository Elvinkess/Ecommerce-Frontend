"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // ✅ Next.js router for redirect
import "../styles/login.css";
import { useAuth } from '../context/AuthContext';



const LoginPage = () => {
    const router = useRouter();
    const { setUser } = useAuth();


    // State to hold the form data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // State to handle loading and error messages
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    // Handle form submission with fetch API
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
                credentials: "include", // include cookies
            });

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Email or Password Incorrect");
            }

            const result = await response.json();
            setUser(result.user)
            console.log("Sign-in successful:", result.user);

            //  Redirect to home page
            router.push("/");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                    <Link href="/forgot-password">
                        <p className="forgot-password">Forgot password?</p>
                    </Link>
                </form>
                <div className="login-footer">
                    <p>
                        Don't have an account? <Link href="/register">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
