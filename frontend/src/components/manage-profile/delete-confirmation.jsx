import React from 'react';
import { Dialog } from '../dialog';

export function DeleteConfirmation(props) {
    let isOpen = props.isOpen;
    let onClose = props.onClose;
    let onConfirm = props.onConfirm;
    let itemName = props.itemName;
    let itemType = props.itemType;

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog
            title="Delete Confirmation"
            description={`Are you sure you want to delete this ${itemType}: "${itemName}"? This action cannot be undone.`}
            onClose={onClose}
            onConfirm={onConfirm}
            input={
                <div className="mb-6 flex items-center justify-center">
                    <div className="p-4 rounded-full bg-error/10 text-error animate-pulse">
                        <span className="material-symbols-outlined text-4xl">warning</span>
                    </div>
                </div>
            }
        />
    );
}
