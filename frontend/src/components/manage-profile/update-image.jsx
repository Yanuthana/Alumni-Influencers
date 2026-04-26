import React from 'react';
import { Dialog } from '../dialog';

export const UpdateImage = ({ isOpen, onClose, onConfirm }) => {
    const [file, setFile] = React.useState(null);

    if (!isOpen) {
        return null;
    }

    const handleInputChange = (e) => {
        setFile(e.target.value);
    };

    const handleConfirm = () => {
        if (file) {
            onConfirm(file);
            setFile('');
        }
    };

    return (
        <Dialog
            title="Update Profile Image"
            description="Enter the URL of your new profile image."
            input={
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                    />
                </div>
            }
            onClose={onClose}
            onConfirm={handleConfirm}
        />
    );
};