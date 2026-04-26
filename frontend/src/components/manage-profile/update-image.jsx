import React from 'react';
import { Dialog } from '../dialog';

export function UpdateImage(props) {
    let isOpen = props.isOpen;
    let onClose = props.onClose;
    let onConfirm = props.onConfirm;

    let [file, setFile] = React.useState(null);

    if (!isOpen) {
        return null;
    }

    function handleInputChange(e) {
        setFile(e.target.value);
    }

    function handleConfirm() {
        if (file) {
            onConfirm(file);
            setFile('');
        }
    }

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
}