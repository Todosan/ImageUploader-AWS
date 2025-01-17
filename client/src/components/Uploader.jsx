import { useState } from 'react';

export const Uploader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const upload = async (e) => {
        const files = e.target.files;
        if (files.length === 0) {
            setError('No files selected.');
            return;
        }
    
        try {
            setIsLoading(true);
            setError(null);
            setSuccessMessage('');
    
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append('file', file); // Ensure this matches the backend handler's expectations
            });
    
            const response = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData, // Send as multipart/form-data
            });
    
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }
    
            const data = await response.json();
            setSuccessMessage('Files uploaded successfully!');
            console.log('Upload successful:', data);
        } catch (err) {
            console.error('Error during upload:', err);
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            e.target.value = ''; // Reset the file input.
        }
    };
    
    return (
        <div>
            <p>Upload files</p>
            <input
                type="file"
                multiple
                onChange={upload}
                disabled={isLoading}
                aria-label="Upload files"
            />
            {isLoading && <p>Uploading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>
    );
};
