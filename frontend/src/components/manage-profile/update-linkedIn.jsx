import React from 'react';
import { Dialog } from '../dialog';

export function UpdateLinkedIn(props) {
    let isOpen = props.isOpen;
    let onClose = props.onClose;
    let onConfirm = props.onConfirm;
    let initialValue = props.initialValue || '';

    let [linkedinUrl, setLinkedinUrl] = React.useState(initialValue);

    React.useEffect(function() {
        setLinkedinUrl(initialValue);
    }, [initialValue]);

    if (!isOpen) {
        return null;
    }

    function handleInputChange(e) {
        setLinkedinUrl(e.target.value);
    }

    function handleConfirm() {
        if (linkedinUrl) {
            onConfirm(linkedinUrl);
        }
    }

    return (
        <Dialog
            title="Update LinkedIn Profile"
            description="Enter the URL of your LinkedIn profile to connect it to your account."
            input={
                <div className="mb-6">
                    <label className="mb-2 block text-xs font-medium text-secondary uppercase tracking-wider">
                        LinkedIn URL
                    </label>
                    <input
                        type="url"
                        value={linkedinUrl}
                        placeholder="https://www.linkedin.com/in/yourprofile"
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
