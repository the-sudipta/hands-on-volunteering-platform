import {useEffect, useState} from 'react';
import axios from 'axios';
import qs from "qs"; // Importing qs for URL encoding

export const navigate = (router, page) => {
    router.push(page); // Navigate to the page using Next.js router
};


// Function to execute callback immediately or on dependency change
export const useEffectWithoutTimeout = (callback, dependencies = []) => {
    useEffect(() => {
        callback(); // Execute the passed callback immediately on mount or when dependencies change
    }, dependencies); // Re-run the effect when dependencies change
};

// Function to execute callback after a specified timeout
export const useEffectWithTimeout = (callback, timeout = 5000) => {
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            callback(); // Execute the passed callback after the timeout
        }, timeout);

        return () => clearTimeout(timeoutId); // Cleanup the timeout when the component unmounts
    }, [callback, timeout]); // Re-run the effect when the callback or timeout changes
};

// Function to trigger navigation after a delay
export const redirectAfterDelay = (router, page, delay = 5000) => {
    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate(router, page);
        }, delay);

        return () => clearTimeout(timeout);  // Cleanup timeout
    }, [router, page, delay]);
};



// Updated validation rules with multiple types like email, password, age, etc.
const validationRules = {
    email: (value) => /\S+@\S+\.\S+/.test(value), // Email format validation
    password: (value) => /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[0-9a-zA-Z!@#$%^&*()_+]{8,}$/.test(value), // Password format validation
    required: (value) => value && String(value).trim() !== '', // Convert value to string before trimming
    age: (value) => /^\d{1,3}$/.test(value) && value >= 18 && value <= 120, // Age must be a number between 18 and 120
    phone: (value) => /^[0-9]{10}$/.test(value), // Phone number validation (e.g., 10-digit phone number)
    money: (value) => /^[0-9]+(\.[0-9]{1,2})?$/.test(value), // Money format validation (e.g., 100, 100.50)
    zipCode: (value) => /^\d{5}$/.test(value), // ZIP code format (5 digits)
    date: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value), // Date format (YYYY-MM-DD)
    url: (value) => /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/.test(value), // URL validation
    otp: (value) => value && /^[0-9]{4,6}$/.test(String(value).trim()), // Convert to string, trim and validate PIN (4 to 6 digits)
    confirm_password: (value, fields) => value === fields.password, // Confirm password should match the password
};

// Generalized function to validate any field
// Generalized function to validate any field
export const validateFields = (fields) => {
    let errors = {};

    // Loop through each field to validate
    for (const [key, value] of Object.entries(fields)) {
        // Check if the field is required and is empty
        if (!validationRules.required(value)) {
            errors[key] = `${key} is required`;
        }
        // Check field type-specific validation (email, password, etc.)
        else if (validationRules[key] && !validationRules[key](value, fields)) {
            // Pass `fields` object to confirm password comparison
            errors[key] = `Invalid ${key} format`;
        }
    }

    return errors;  // Returns an object with key: error message pairs
};


// Custom hook to manage form validation and submission
export const useFormValidation = () => {
    const [errors, setErrors] = useState({});

    const validateAndSubmit = (formData) => {
        const validationErrors = validateFields(formData);
        setErrors(validationErrors);

        return { isValid: Object.keys(validationErrors).length === 0, validationErrors };
    };

    return { errors, validateAndSubmit };
};

// Generalized function to handle form submission
export const submitForm = async (endpoint, formData) => {
    console.log('Public ENDPOINT', process.env.NEXT_PUBLIC_API_ENDPOINT);
    console.log('Specific ENDPOINT', endpoint);
    console.log('FormData = ', formData);
    const token = '';
    if(document.cookie && document.cookie !== '') {
        const token = document.cookie.split('; ').find(row => row.startsWith('access_token=')).split('=')[1];
    }

    const response = await axios.post(
        process.env.NEXT_PUBLIC_API_ENDPOINT + endpoint,
        qs.stringify(formData),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${token}`,  // Add the JWT token here
            },
            withCredentials: true,
        }
    );
    return response; // Returning the response data to be used in the calling component
};


// Export functions as an object
export const Core_Functions = {
    navigate,
    redirectAfterDelay,
    useEffectWithoutTimeout,
    useEffectWithTimeout,
    useFormValidation,
    submitForm,
};
