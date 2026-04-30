import React from 'react';
import { Dialog } from '../dialog';
import { toast } from 'react-hot-toast';

export const ProfileSectionForm = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    addService,
    updateService,
    userId,
    title, 
    description, 
    fields, 
    initialData = [],
    sectionKey
}) => {
    const [data, setData] = React.useState([]);
    const [errors, setErrors] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const isAddMode = !initialData || initialData.length === 0;

    React.useEffect(() => {
        if (initialData && initialData.length > 0) {
            setData(initialData.map(item => {
                const newItem = {};
                fields.forEach(field => {
                    newItem[field.key] = item[field.key] || item[field.altKey] || '';
                });
                return newItem;
            }));
        } else {
            const emptyItem = {};
            fields.forEach(field => {
                emptyItem[field.key] = '';
            });
            setData([emptyItem]);
        }
    }, [initialData, isOpen, fields]);

    if (!isOpen) return null;

    const handleAdd = () => {
        const emptyItem = {};
        fields.forEach(field => {
            emptyItem[field.key] = '';
        });
        setData([...data, emptyItem]);
    };

    const handleRemove = (index) => {
        if (data.length > 1) {
            const newData = data.filter((_, i) => i !== index);
            setData(newData);
        }
    };

    const handleChange = (index, fieldKey, value) => {
        const newData = [...data];
        newData[index][fieldKey] = value;
        setData(newData);
        
        // Clear error when user starts typing
        if (errors[`${index}-${fieldKey}`]) {
            const newErrors = { ...errors };
            delete newErrors[`${index}-${fieldKey}`];
            setErrors(newErrors);
        }
    };

    const validate = () => {
        const newErrors = {};
        let isValid = true;

        data.forEach((item, index) => {
            fields.forEach(field => {
                const value = item[field.key]?.toString().trim();
                
                if (!value) {
                    newErrors[`${index}-${field.key}`] = `${field.label} is required`;
                    isValid = false;
                }
                // Note: Strict regex validation for 'year' and 'employmentYears' has been removed 
                // to provide more flexibility as requested.
            });
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleConfirm = async () => {
        if (!validate()) return;
        
        setIsSubmitting(true);
        try {
            if (isAddMode && addService) {
                // Sequential calls for multiple entries in ADD mode
                for (const item of data) {
                    await addService(userId, item);
                }
                toast.success('Records added successfully');
            } else if (!isAddMode && updateService) {
                await updateService(userId, data);
                toast.success('Records updated successfully');
            } else if (onConfirm) {
                // Fallback to legacy onConfirm
                await onConfirm(data);
            }
            onClose();
        } catch (error) {
            console.error('Submission error:', error);
            toast.error(error?.message || 'Failed to save changes');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            title={isAddMode ? `Add ${title.replace('Update ', '')}` : title}
            description={description}
            onClose={onClose}
            onConfirm={handleConfirm}
            input={
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
                    {data.map((item, index) => (
                        <div key={index} className="relative p-5 rounded-[24px] border border-outline-variant/20 bg-surface-container-low/40 backdrop-blur-sm transition-all hover:border-primary/30">
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                        {index + 1}
                                    </div>
                                    <span className="text-[11px] font-label uppercase tracking-[0.2em] text-on-surface/50">Entry Detail</span>
                                </div>
                                {data.length > 1 && (
                                    <button 
                                        onClick={() => handleRemove(index)}
                                        className="p-2 rounded-xl hover:bg-error/10 text-error transition-all hover:scale-110"
                                        title="Remove Entry"
                                    >
                                        <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                )}
                            </div>
                            
                            <div className="grid gap-5">
                                {fields.map(field => (
                                    <div key={field.key} className="space-y-1.5">
                                        <label className="text-[10px] font-label uppercase tracking-widest text-secondary/70 ml-1">{field.label}</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder={field.placeholder}
                                                value={item[field.key]}
                                                onChange={(e) => handleChange(index, field.key, e.target.value)}
                                                disabled={isSubmitting}
                                                className={`w-full rounded-2xl border ${errors[`${index}-${field.key}`] ? 'border-error/50 bg-error/5' : 'border-outline-variant/20 bg-black/10'} px-5 py-3.5 text-sm text-on-surface outline-none focus:border-primary/50 focus:bg-primary/5 transition-all placeholder:text-on-surface/30`}
                                            />
                                            {errors[`${index}-${field.key}`] && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-error">
                                                    <span className="material-symbols-outlined text-sm">error</span>
                                                </div>
                                            )}
                                        </div>
                                        {errors[`${index}-${field.key}`] && (
                                            <p className="mt-1 text-[10px] text-error font-medium px-2 flex items-center gap-1">
                                                {errors[`${index}-${field.key}`]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    <button
                        onClick={handleAdd}
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-[24px] border-2 border-dashed border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5 text-primary/70 hover:text-primary transition-all flex items-center justify-center gap-3 group"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">add</span>
                        </div>
                        <span className="font-headline text-sm font-semibold tracking-tight">Add Another Entry</span>
                    </button>

                    {isSubmitting && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-surface/60 backdrop-blur-[2px]">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    )}
                </div>
            }
        />
    );
};
