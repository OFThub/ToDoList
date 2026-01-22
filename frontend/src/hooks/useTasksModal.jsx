import { useState, useEffect } from "react";

export const useTasksModel = (initialData, isOpen, onSubmit, availableTasks) => {
    const defaultState = {
        task: "",
        description: "",
        status: "todo",
        priority: "Medium",
        dueDate: "",
        startDate: "",
        parentTask: null,
        tags: [],
        progress: 0
    };

    const [formData, setFormData] = useState(defaultState);
    const [tagInput, setTagInput] = useState("");

    // Modal açıldığında veya veri değiştiğinde formu senkronize et
    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                ...defaultState,
                ...initialData,
                dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : "",
                startDate: initialData.startDate ? initialData.startDate.split('T')[0] : "",
                tags: initialData.tags || [],
            });
        } else if (isOpen) {
            setFormData(defaultState);
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleanedData = {
            ...formData,
            parentTask: formData.parentTask || null,
            tags: formData.tags.length > 0 ? formData.tags : [],
            progress: parseInt(formData.progress) || 0
        };
        onSubmit(cleanedData);
    };

    // Döngüsel bağımlılığı önlemek için filtreleme
    const parentTaskOptions = availableTasks.filter(t => 
        t._id !== initialData?._id && 
        t.parentTask !== initialData?._id
    );

    return {
        formData,
        tagInput,
        setTagInput,
        parentTaskOptions,
        handleChange,
        handleAddTag,
        handleRemoveTag,
        handleSubmit
    };
};