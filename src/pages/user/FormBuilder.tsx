import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

type FieldType =
  // Basic Elements
  | 'heading' | 'fullname' | 'email' | 'address' | 'phone' | 'datepicker'
  | 'appointment' | 'signature' | 'fillintheblank' | 'shorttext' | 'longtext'
  | 'text' | 'textarea' | 'number' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'file'
  | 'rating'
  // Payment Elements
  | 'square' | 'paypal' | 'authorizenet' | 'stripe' | 'stripecheckout'
  | 'braintree' | 'cashapppay' | 'afterpay' | 'clearpay' | 'applepay' | 'mollie' | 'cybersource'
  // Widget Elements
  | 'formcalculation' | 'configurablelist' | 'multipletextfields' | 'termsandconditions'
  | 'takephoto' | 'checklist' | 'dynamictextbox' | 'addoptions' | 'datagrid'
  | 'dynamicdropdowns' | 'pdfembedder';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  [key: string]: any;
}

interface LogicRule {
  id: string;
  sourceFieldId: string; // Field to watch
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
  action: 'show' | 'hide';
  targetFieldId: string; // Field to show/hide
}

const FormBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'build' | 'settings' | 'logic' | 'publish'>('build');
  const [sidebarTab, setSidebarTab] = useState<'basic' | 'payments' | 'widgets'>('basic');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [copied, setCopied] = useState(false);
  const [formPublishStatus, setFormPublishStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [draggedField, setDraggedField] = useState<FieldType | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [logicRules, setLogicRules] = useState<LogicRule[]>([]);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});

  // Autosave state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  // Undo/Redo state
  const [history, setHistory] = useState<FormField[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);

  // Sidebar state for collapsible categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    input: true,
    choice: false,
    layout: false,
    advanced: false,
    payments: false,
  });
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Form Settings State
  const [formStatus, setFormStatus] = useState<'enabled' | 'disabled'>('enabled');
  const [encryptData, setEncryptData] = useState(false);
  const [draftMode, setDraftMode] = useState(false);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('home');

  useEffect(() => {
    if (id) {
      fetchForm();
    } else {
      // Check if AI-generated form data is provided
      const locationState = location.state as any;
      if (locationState?.aiGenerated && locationState?.formTitle && locationState?.fields) {
        // Load AI-generated form
        setTitle(locationState.formTitle);

        // Map AI-generated fields to FormField format
        const mappedFields: FormField[] = locationState.fields.map((field: any) => ({
          id: field.id,
          type: mapAIFieldType(field.type),
          label: field.label,
          required: field.required || false,
          placeholder: field.placeholder || '',
          options: field.options || [],
        }));

        setFields(mappedFields);
      } else {
        // Check if template is provided
        const templateId = searchParams.get('template');
        if (templateId) {
          loadTemplate(templateId);
        }
      }
    }
  }, [id, searchParams, location.state]);

  // Helper function to map AI field types to FormBuilder field types
  const mapAIFieldType = (aiType: string): FieldType => {
    const typeMap: Record<string, FieldType> = {
      'text': 'shorttext',
      'email': 'email',
      'tel': 'phone',
      'number': 'number',
      'textarea': 'longtext',
      'select': 'dropdown',
      'file': 'file',
      'rating': 'rating',
    };
    return typeMap[aiType] || 'shorttext';
  };

  const fetchForm = async () => {
    try {
      const response = await api.get(`/forms/${id}`);
      const form = response.data.form;
      setTitle(form.title);
      setDescription(form.description);
      setFields(form.fields || []);
      setFormPublishStatus(form.status || 'DRAFT');
    } catch (error) {
      console.error('Error fetching form:', error);
    }
  };

  const loadTemplate = (templateId: string) => {
    // Template configurations with pre-filled fields
    const templates: Record<string, { title: string; description: string; fields: FormField[] }> = {
      // Registration Forms
      'reg-1': {
        title: 'New Customer Registration Form',
        description: 'Register new customers with their details',
        fields: [
          { id: '1', type: 'heading', label: 'Customer Registration', required: false },
          { id: '2', type: 'fullname', label: 'Full Name', required: true, placeholder: 'First Name, Last Name' },
          { id: '3', type: 'email', label: 'Email Address', required: true, placeholder: 'your@email.com' },
          { id: '4', type: 'phone', label: 'Phone Number', required: true, placeholder: '(xxx) xxx-xxxx' },
          { id: '5', type: 'address', label: 'Address', required: false, placeholder: 'Street, City, State, ZIP' },
        ]
      },
      // Order Forms
      'order-1': {
        title: 'Product Order Form',
        description: 'Complete order form with product selection',
        fields: [
          { id: '1', type: 'heading', label: 'Product Order', required: false },
          { id: '2', type: 'fullname', label: 'Customer Name', required: true, placeholder: 'First Name, Last Name' },
          { id: '3', type: 'email', label: 'Email', required: true, placeholder: 'your@email.com' },
          { id: '4', type: 'dropdown', label: 'Product Selection', required: true, options: ['Product 1', 'Product 2', 'Product 3'] },
          { id: '5', type: 'number', label: 'Quantity', required: true, placeholder: '1' },
          { id: '6', type: 'address', label: 'Shipping Address', required: true },
        ]
      },
      // Event Registration
      'event-1': {
        title: 'Appointment Request Form',
        description: 'Schedule appointments with ease',
        fields: [
          { id: '1', type: 'heading', label: 'Book Appointment', required: false },
          { id: '2', type: 'fullname', label: 'Your Name', required: true },
          { id: '3', type: 'email', label: 'Email Address', required: true },
          { id: '4', type: 'phone', label: 'Contact Number', required: true },
          { id: '5', type: 'datepicker', label: 'Preferred Date', required: true },
          { id: '6', type: 'textarea', label: 'Additional Notes', required: false, placeholder: 'Any special requirements?' },
        ]
      },
      // Survey Template
      'survey-1': {
        title: 'Customer Satisfaction Survey',
        description: 'Gather valuable customer feedback',
        fields: [
          { id: '1', type: 'heading', label: 'Customer Satisfaction Survey', required: false },
          { id: '2', type: 'radio', label: 'Overall Satisfaction', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
          { id: '3', type: 'checkbox', label: 'What did you like?', required: false, options: ['Product Quality', 'Customer Service', 'Pricing', 'Delivery Speed'] },
          { id: '4', type: 'textarea', label: 'Additional Comments', required: false, placeholder: 'Share your thoughts...' },
        ]
      },
      // Contact Form
      'contact-1': {
        title: 'Contact Form',
        description: 'Get in touch with us',
        fields: [
          { id: '1', type: 'heading', label: 'Contact Us', required: false },
          { id: '2', type: 'fullname', label: 'Name', required: true },
          { id: '3', type: 'email', label: 'Email', required: true },
          { id: '4', type: 'text', label: 'Subject', required: true, placeholder: 'How can we help?' },
          { id: '5', type: 'textarea', label: 'Message', required: true, placeholder: 'Your message here...', rows: 6 },
        ]
      },
    };

    // Get template or create generic template
    const template = templates[templateId] || {
      title: 'Form Template',
      description: 'Start building your form',
      fields: [
        { id: '1', type: 'fullname', label: 'Full Name', required: true },
        { id: '2', type: 'email', label: 'Email Address', required: true },
        { id: '3', type: 'textarea', label: 'Message', required: false, placeholder: 'Enter your message...' },
      ]
    };

    setTitle(template.title);
    setDescription(template.description);
    setFields(template.fields);
  };

  // Autosave function
  const performAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    setAutoSaveStatus('saving');
    try {
      const data = { title, description, fields, folder: selectedFolder };
      if (id) {
        await api.put(`/forms/${id}`, data);
        setAutoSaveStatus('saved');
        setLastSavedAt(new Date());
        setHasUnsavedChanges(false);
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      } else {
        const response = await api.post('/forms', data);
        navigate(`/dashboard/forms/builder/${response.data.form.id}`, { replace: true });
        setAutoSaveStatus('saved');
        setLastSavedAt(new Date());
        setHasUnsavedChanges(false);
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Autosave failed:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 5000);
    }
  }, [id, title, description, fields, selectedFolder, hasUnsavedChanges, navigate]);

  // Track changes for autosave
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
    }

    setHasUnsavedChanges(true);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, description, fields]);

  // Track field changes for undo/redo
  useEffect(() => {
    if (isUndoRedoRef.current) return;
    if (isInitialLoadRef.current) return;

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...fields]);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [fields]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoRef.current = true;
      setHistoryIndex(prev => prev - 1);
      setFields(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      setHistoryIndex(prev => prev + 1);
      setFields(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        performAutoSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedField) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          removeField(selectedField);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performAutoSave, handleUndo, handleRedo, selectedField]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { title, description, fields, folder: selectedFolder };
      if (id) {
        await api.put(`/forms/${id}`, data);
      } else {
        const response = await api.post('/forms', data);
        navigate(`/dashboard/forms/builder/${response.data.form.id}`, { replace: true });
      }
      setAutoSaveStatus('saved');
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id) {
      alert('Please save the form first');
      return;
    }
    try {
      await api.post(`/forms/${id}/publish`);
      // Reload form to get updated status
      await fetchForm();
      alert('Form published successfully! You can now share the link.');
    } catch (error) {
      console.error('Error publishing form:', error);
      alert('Failed to publish form');
    }
  };

  const addField = (type: FieldType) => {
    const fieldConfig: Record<FieldType, Partial<FormField>> = {
      // Basic Elements
      heading: { label: 'Form Heading', placeholder: 'Enter heading text' },
      fullname: { label: 'Full Name', placeholder: 'First Name, Last Name' },
      email: { label: 'Email Address', placeholder: 'Enter your email' },
      address: { label: 'Address', placeholder: 'Street, City, State, ZIP' },
      phone: { label: 'Phone Number', placeholder: '(xxx) xxx-xxxx' },
      datepicker: { label: 'Date', placeholder: 'Select date' },
      appointment: { label: 'Appointment', placeholder: 'Schedule appointment' },
      signature: { label: 'Signature', placeholder: 'Sign here' },
      fillintheblank: { label: 'Fill in the Blank', placeholder: 'Complete the sentence' },
      shorttext: { label: 'Short Text', placeholder: 'Enter text' },
      longtext: { label: 'Long Text', placeholder: 'Enter detailed text' },
      text: { label: 'Text Field', placeholder: 'Enter text' },
      textarea: { label: 'Text Area', placeholder: 'Enter multiple lines' },
      number: { label: 'Number', placeholder: 'Enter number' },
      dropdown: { label: 'Dropdown', placeholder: 'Select option', options: ['Option 1', 'Option 2', 'Option 3'] },
      checkbox: { label: 'Checkbox', options: ['Option 1', 'Option 2'] },
      radio: { label: 'Radio Button', options: ['Option 1', 'Option 2'] },
      date: { label: 'Date', placeholder: 'Select date' },
      file: { label: 'File Upload', placeholder: 'Choose file' },
      rating: { label: 'Rating', placeholder: 'Rate from 1 to 5' },

      // Payment Elements
      square: { label: 'Square Payment', placeholder: 'Pay with Square' },
      paypal: { label: 'PayPal', placeholder: 'Pay with PayPal' },
      authorizenet: { label: 'Authorize.Net', placeholder: 'Pay with Authorize.Net' },
      stripe: { label: 'Stripe', placeholder: 'Pay with Stripe' },
      stripecheckout: { label: 'Stripe Checkout', placeholder: 'Checkout with Stripe' },
      braintree: { label: 'Braintree', placeholder: 'Pay with Braintree' },
      cashapppay: { label: 'Cash App Pay', placeholder: 'Pay with Cash App' },
      afterpay: { label: 'Afterpay', placeholder: 'Pay with Afterpay' },
      clearpay: { label: 'Clearpay', placeholder: 'Pay with Clearpay' },
      applepay: { label: 'Apple Pay & Google Pay', placeholder: 'Pay with Apple/Google Pay' },
      mollie: { label: 'Mollie', placeholder: 'Pay with Mollie' },
      cybersource: { label: 'CyberSource', placeholder: 'Pay with CyberSource' },

      // Widget Elements
      formcalculation: { label: 'Form Calculation', placeholder: 'Calculate values' },
      configurablelist: { label: 'Configurable List', placeholder: 'List items' },
      multipletextfields: { label: 'Multiple Text Fields', placeholder: 'Multiple inputs' },
      termsandconditions: { label: 'Terms & Conditions', placeholder: 'I agree to terms' },
      takephoto: { label: 'Take Photo', placeholder: 'Capture photo' },
      checklist: { label: 'Checklist', options: ['Item 1', 'Item 2', 'Item 3'] },
      dynamictextbox: { label: 'Dynamic Textbox', placeholder: 'Dynamic input' },
      addoptions: { label: 'Add Options', placeholder: 'Add custom options' },
      datagrid: { label: 'Data Grid', placeholder: 'Table data' },
      dynamicdropdowns: { label: 'Dynamic Dropdowns', placeholder: 'Cascading dropdowns' },
      pdfembedder: { label: 'PDF Embedder', placeholder: 'Embed PDF document' },
    };

    const config = fieldConfig[type] || { label: type, placeholder: `Enter ${type}` };
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: config.label!,
      required: false,
      placeholder: config.placeholder,
      options: config.options,
    };
    setFields([...fields, newField]);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const handleCopyLink = () => {
    if (id) {
      const formUrl = `${window.location.origin}/forms/${id}`;
      navigator.clipboard.writeText(formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert('Please save the form first to get a shareable link');
    }
  };

  const handleOpenInNewTab = () => {
    if (id) {
      const formUrl = `${window.location.origin}/forms/${id}`;
      window.open(formUrl, '_blank');
    } else {
      alert('Please save the form first to open in a new tab');
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, GIF, etc.)');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoFile(reader.result as string);
        setLogoFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoFileName('');
  };

  // Drag and Drop Handlers
  const handleDragStart = (type: FieldType) => (e: React.DragEvent) => {
    setDraggedField(type);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('fieldType', type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedField) {
      addField(draggedField);
      setDraggedField(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedField(null);
  };

  // Handle element button click - works alongside drag
  const handleElementClick = (e: React.MouseEvent, type: FieldType) => {
    // Only add field on click, not on drag start
    if (!draggedField) {
      addField(type);
    }
  };

  const renderFieldPreview = (field: FormField) => {
    const isSelected = selectedField === field.id;
    const borderClass = isSelected ? 'border-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900/50 shadow-xl shadow-indigo-500/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg';
    const baseClasses = `border-2 ${borderClass} rounded-xl p-6 cursor-pointer bg-white dark:bg-gray-800 backdrop-blur-sm transition-all duration-200 transform hover:scale-[1.01]`;

    switch (field.type) {
      case 'heading':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="text-2xl font-bold w-full border-none focus:outline-none bg-transparent dark:text-white"
              placeholder="Enter heading"
            />
          </div>
        );

      case 'fullname':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="First Name" className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled />
              <input type="text" placeholder="Last Name" className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled />
            </div>
          </div>
        );

      case 'address':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <input type="text" placeholder="Street Address" className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 w-full mb-3 focus:border-indigo-500 dark:text-white" disabled />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="City" className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled />
              <input type="text" placeholder="State" className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled />
            </div>
            <input type="text" placeholder="ZIP Code" className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 w-full mt-3 focus:border-indigo-500 dark:text-white" disabled />
          </div>
        );

      case 'signature':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
              <span className="text-gray-400">Sign here</span>
            </div>
          </div>
        );

      case 'takephoto':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
              <span className="text-gray-400">Take Photo</span>
            </div>
          </div>
        );

      case 'checklist':
      case 'checkbox':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            {(field.options || ['Option 1', 'Option 2']).map((option, idx) => (
              <label key={idx} className="flex items-center gap-2 mb-2 dark:text-white">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            {(field.options || ['Option 1', 'Option 2']).map((option, idx) => (
              <label key={idx} className="flex items-center gap-2 mb-2 dark:text-white">
                <input type="radio" name={field.id} className="w-4 h-4 text-indigo-600" disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
      case 'dynamicdropdowns':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <select className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled>
              <option>Select...</option>
              {(field.options || []).map((option, idx) => (
                <option key={idx}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'textarea':
      case 'longtext':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <textarea
              placeholder={field.placeholder}
              className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white"
              rows={4}
              disabled
            />
          </div>
        );

      case 'datagrid':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <table className="w-full border-2 border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 dark:text-white">Column 1</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 dark:text-white">Column 2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2"><input type="text" className="w-full dark:bg-gray-700 dark:text-white" disabled /></td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2"><input type="text" className="w-full dark:bg-gray-700 dark:text-white" disabled /></td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'termsandconditions':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 max-h-32 overflow-y-auto mb-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">Terms and conditions text will appear here...</p>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" disabled />
              <span className="dark:text-white">I agree to the terms and conditions {field.required && <span className="text-red-500">*</span>}</span>
            </label>
          </div>
        );

      case 'pdfembedder':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label}</label>
            {field.pdfUrl ? (
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <iframe
                  src={`${field.pdfUrl}#toolbar=0`}
                  width="100%"
                  height={field.pdfHeight || 300}
                  title={field.label || 'PDF Document'}
                  className="border-0"
                  style={{ backgroundColor: '#f5f5f5' }}
                />
                {field.showDownload && (
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Download enabled</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50">
                <span className="text-4xl mb-2">📄</span>
                <span className="text-gray-400 dark:text-gray-500">No PDF URL configured</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Configure PDF URL in settings</span>
              </div>
            )}
          </div>
        );

      // Widget fields
      case 'multipletextfields':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="space-y-3">
              <input type="text" placeholder="Field 1" className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled />
              <input type="text" placeholder="Field 2" className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled />
              <input type="text" placeholder="Field 3" className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled />
            </div>
          </div>
        );

      case 'formcalculation':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label}</label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Value 1" className="flex-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white" disabled />
                <span className="dark:text-white">+</span>
                <input type="number" placeholder="Value 2" className="flex-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white" disabled />
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 py-3 border-2 border-indigo-200 dark:border-indigo-800">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Result: 0</span>
              </div>
            </div>
          </div>
        );

      case 'configurablelist':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label}</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="text" placeholder="List item" className="flex-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white" disabled />
                <button className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg">×</button>
              </div>
              <button className="w-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg font-semibold">+ Add Item</button>
            </div>
          </div>
        );

      case 'dynamictextbox':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label}</label>
            <div className="space-y-2">
              <input type="text" placeholder="Dynamic input field" className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white" disabled />
              <p className="text-xs text-gray-500 dark:text-gray-400">Field adapts based on previous answers</p>
            </div>
          </div>
        );

      case 'addoptions':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label}</label>
            <div className="space-y-2">
              <select className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white" disabled>
                <option>Select or add custom option...</option>
              </select>
              <input type="text" placeholder="Or type custom option" className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white" disabled />
            </div>
          </div>
        );

      // Payment fields
      case 'square':
      case 'paypal':
      case 'stripe':
      case 'stripecheckout':
      case 'authorizenet':
      case 'braintree':
      case 'cashapppay':
      case 'afterpay':
      case 'clearpay':
      case 'applepay':
      case 'mollie':
      case 'cybersource':
        return (
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 space-y-3">
              {/* Payment Provider Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                    {field.type === 'paypal' ? 'PayPal' :
                     field.type === 'stripe' || field.type === 'stripecheckout' ? 'Stripe' :
                     field.type === 'square' ? 'Square' :
                     field.type === 'applepay' ? 'Apple/Google Pay' :
                     field.label}
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Secure Payment</span>
              </div>

              {/* Card Details */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Card Number</label>
                <div className="relative">
                  <input type="text" placeholder="1234 5678 9012 3456" className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white text-sm" disabled />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-6 h-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded"></div>
                    <div className="w-6 h-4 bg-gradient-to-r from-orange-600 to-red-600 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white text-sm" disabled />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">CVV</label>
                  <input type="text" placeholder="123" className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white text-sm" disabled />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Cardholder Name</label>
                <input type="text" placeholder="John Doe" className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white text-sm" disabled />
              </div>

              {/* Amount Display */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border border-green-200 dark:border-green-800 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Amount</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">$0.00</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="flex gap-2">
              <select className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2.5 focus:border-indigo-500 dark:text-white" disabled>
                <option>+1</option>
              </select>
              <input type="tel" placeholder={field.placeholder || "(555) 555-5555"} className="flex-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled />
            </div>
          </div>
        );

      case 'datepicker':
      case 'date':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="relative">
              <input type="date" className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        );

      case 'appointment':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white" disabled />
                <input type="time" className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white" disabled />
              </div>
              <select className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white" disabled>
                <option>Select duration</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>
          </div>
        );

      case 'fillintheblank':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                The quick brown <input type="text" className="inline-block w-24 border-b-2 border-indigo-500 bg-transparent px-2 py-1 mx-1" placeholder="___" disabled /> jumps over the lazy <input type="text" className="inline-block w-24 border-b-2 border-indigo-500 bg-transparent px-2 py-1 mx-1" placeholder="___" disabled />.
              </p>
            </div>
          </div>
        );

      case 'file':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    console.log('File selected:', e.target.files[0].name);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-indigo-400 transition-all pointer-events-none">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Click to upload or drag and drop</p>
                <p className="text-gray-400 text-xs mt-1">PDF, DOC, JPG, PNG (Max 10MB)</p>
              </div>
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="text-3xl cursor-pointer transition-all hover:scale-110"
                  style={{ color: '#d1d5db' }}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Click stars to rate (1-5)</p>
          </div>
        );

      // Default case for other field types
      default:
        return (
          <div className={baseClasses} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <input
              type={field.type === 'shorttext' ? 'text' : field.type === 'number' ? 'number' : 'text'}
              placeholder={field.placeholder}
              className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white"
              disabled
            />
          </div>
        );
    }
  };

  // SVG Icon Components for professional look
  const IconHeading = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round"/>
    </svg>
  );
  const IconUser = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const IconMail = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
  const IconAddress = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
  const IconPhone = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
  const IconCalendar = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  );
  const IconSignature = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
    </svg>
  );
  const IconText = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 6.1H3M21 12.1H3M15.1 18H3"/>
    </svg>
  );
  const IconTextarea = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 12h10M7 17h6"/>
    </svg>
  );
  const IconNumber = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 17h6m-6-6h8m-8-4h12"/><path d="M17 3v18M14 8l3-3 3 3M14 16l3 3 3-3"/>
    </svg>
  );
  const IconDropdown = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m8 10 4 4 4-4"/>
    </svg>
  );
  const IconCheckbox = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
  const IconRadio = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="currentColor"/>
    </svg>
  );
  const IconFile = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/>
    </svg>
  );
  const IconCreditCard = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
    </svg>
  );
  const IconCalculator = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h2M8 18h2M14 14h2M14 18h2"/>
    </svg>
  );
  const IconList = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  );
  const IconCamera = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
  );
  const IconGrid = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
  const IconPdf = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15h6"/>
    </svg>
  );

  const basicElements = [
    { type: 'heading' as FieldType, icon: <IconHeading />, label: 'Heading', color: '#8b5cf6', bg: '#f3e8ff' },
    { type: 'fullname' as FieldType, icon: <IconUser />, label: 'Full Name', color: '#3b82f6', bg: '#dbeafe' },
    { type: 'email' as FieldType, icon: <IconMail />, label: 'Email', color: '#10b981', bg: '#d1fae5' },
    { type: 'address' as FieldType, icon: <IconAddress />, label: 'Address', color: '#ef4444', bg: '#fee2e2' },
    { type: 'phone' as FieldType, icon: <IconPhone />, label: 'Phone', color: '#6366f1', bg: '#e0e7ff' },
    { type: 'datepicker' as FieldType, icon: <IconCalendar />, label: 'Date Picker', color: '#06b6d4', bg: '#cffafe' },
    { type: 'appointment' as FieldType, icon: <IconCalendar />, label: 'Appointment', color: '#8b5cf6', bg: '#ede9fe' },
    { type: 'signature' as FieldType, icon: <IconSignature />, label: 'Signature', color: '#f59e0b', bg: '#fef3c7' },
    { type: 'fillintheblank' as FieldType, icon: <IconText />, label: 'Fill in the Blank', color: '#22c55e', bg: '#dcfce7' },
    { type: 'shorttext' as FieldType, icon: <IconText />, label: 'Short Text', color: '#0ea5e9', bg: '#e0f2fe' },
    { type: 'longtext' as FieldType, icon: <IconTextarea />, label: 'Long Text', color: '#3b82f6', bg: '#dbeafe' },
    { type: 'number' as FieldType, icon: <IconNumber />, label: 'Number', color: '#14b8a6', bg: '#ccfbf1' },
    { type: 'dropdown' as FieldType, icon: <IconDropdown />, label: 'Dropdown', color: '#d946ef', bg: '#fae8ff' },
    { type: 'checkbox' as FieldType, icon: <IconCheckbox />, label: 'Checkbox', color: '#84cc16', bg: '#ecfccb' },
    { type: 'radio' as FieldType, icon: <IconRadio />, label: 'Radio', color: '#f97316', bg: '#ffedd5' },
    { type: 'file' as FieldType, icon: <IconFile />, label: 'File Upload', color: '#ec4899', bg: '#fce7f3' },
  ];

  const paymentElements = [
    { type: 'square' as FieldType, icon: <IconCreditCard />, label: 'Square', color: '#1f2937', bg: '#f3f4f6' },
    { type: 'paypal' as FieldType, icon: <IconCreditCard />, label: 'PayPal', color: '#003087', bg: '#e0f2fe' },
    { type: 'authorizenet' as FieldType, icon: <IconCreditCard />, label: 'Authorize.Net', color: '#dc2626', bg: '#fee2e2' },
    { type: 'stripe' as FieldType, icon: <IconCreditCard />, label: 'Stripe', color: '#6366f1', bg: '#e0e7ff' },
    { type: 'stripecheckout' as FieldType, icon: <IconCreditCard />, label: 'Stripe Checkout', color: '#7c3aed', bg: '#ede9fe' },
    { type: 'braintree' as FieldType, icon: <IconCreditCard />, label: 'Braintree', color: '#4f46e5', bg: '#e0e7ff' },
    { type: 'cashapppay' as FieldType, icon: <IconCreditCard />, label: 'Cash App Pay', color: '#00d632', bg: '#dcfce7' },
    { type: 'afterpay' as FieldType, icon: <IconCreditCard />, label: 'Afterpay', color: '#b2fce4', bg: '#fef3c7' },
    { type: 'clearpay' as FieldType, icon: <IconCreditCard />, label: 'Clearpay', color: '#00d4ff', bg: '#cffafe' },
    { type: 'applepay' as FieldType, icon: <IconCreditCard />, label: 'Apple Pay & Google Pay', color: '#000000', bg: '#f3f4f6' },
    { type: 'mollie' as FieldType, icon: <IconCreditCard />, label: 'Mollie', color: '#0ea5e9', bg: '#e0f2fe' },
    { type: 'cybersource' as FieldType, icon: <IconCreditCard />, label: 'CyberSource', color: '#b91c1c', bg: '#fee2e2' },
  ];

  const widgetElements = [
    { type: 'formcalculation' as FieldType, icon: <IconCalculator />, label: 'Form Calculation', color: '#8b5cf6', bg: '#f3e8ff' },
    { type: 'configurablelist' as FieldType, icon: <IconList />, label: 'Configurable List', color: '#3b82f6', bg: '#dbeafe' },
    { type: 'multipletextfields' as FieldType, icon: <IconText />, label: 'Multiple Text Fields', color: '#10b981', bg: '#d1fae5' },
    { type: 'termsandconditions' as FieldType, icon: <IconFile />, label: 'Terms & Conditions', color: '#f59e0b', bg: '#fef3c7' },
    { type: 'takephoto' as FieldType, icon: <IconCamera />, label: 'Take Photo', color: '#ec4899', bg: '#fce7f3' },
    { type: 'checklist' as FieldType, icon: <IconCheckbox />, label: 'Checklist', color: '#22c55e', bg: '#dcfce7' },
    { type: 'dynamictextbox' as FieldType, icon: <IconText />, label: 'Dynamic Textbox', color: '#06b6d4', bg: '#cffafe' },
    { type: 'addoptions' as FieldType, icon: <IconDropdown />, label: 'Add Options', color: '#6366f1', bg: '#e0e7ff' },
    { type: 'datagrid' as FieldType, icon: <IconGrid />, label: 'Data Grid', color: '#0284c7', bg: '#e0f2fe' },
    { type: 'dynamicdropdowns' as FieldType, icon: <IconDropdown />, label: 'Dynamic Dropdowns', color: '#d946ef', bg: '#fae8ff' },
    { type: 'pdfembedder' as FieldType, icon: <IconPdf />, label: 'PDF Embedder', color: '#ef4444', bg: '#fee2e2' },
  ];

  // Organized element categories for cleaner sidebar
  const elementCategories = [
    {
      id: 'input',
      label: 'Input Fields',
      icon: '📝',
      elements: [
        { type: 'shorttext' as FieldType, icon: <IconText />, label: 'Short Text', color: '#0ea5e9' },
        { type: 'longtext' as FieldType, icon: <IconTextarea />, label: 'Long Text', color: '#3b82f6' },
        { type: 'email' as FieldType, icon: <IconMail />, label: 'Email', color: '#10b981' },
        { type: 'phone' as FieldType, icon: <IconPhone />, label: 'Phone', color: '#6366f1' },
        { type: 'number' as FieldType, icon: <IconNumber />, label: 'Number', color: '#14b8a6' },
        { type: 'fullname' as FieldType, icon: <IconUser />, label: 'Full Name', color: '#3b82f6' },
        { type: 'address' as FieldType, icon: <IconAddress />, label: 'Address', color: '#ef4444' },
      ]
    },
    {
      id: 'choice',
      label: 'Choice Fields',
      icon: '☑️',
      elements: [
        { type: 'dropdown' as FieldType, icon: <IconDropdown />, label: 'Dropdown', color: '#d946ef' },
        { type: 'checkbox' as FieldType, icon: <IconCheckbox />, label: 'Checkbox', color: '#84cc16' },
        { type: 'radio' as FieldType, icon: <IconRadio />, label: 'Radio', color: '#f97316' },
        { type: 'checklist' as FieldType, icon: <IconCheckbox />, label: 'Checklist', color: '#22c55e' },
      ]
    },
    {
      id: 'layout',
      label: 'Layout & Media',
      icon: '🎨',
      elements: [
        { type: 'heading' as FieldType, icon: <IconHeading />, label: 'Heading', color: '#8b5cf6' },
        { type: 'file' as FieldType, icon: <IconFile />, label: 'File Upload', color: '#ec4899' },
        { type: 'signature' as FieldType, icon: <IconSignature />, label: 'Signature', color: '#f59e0b' },
        { type: 'takephoto' as FieldType, icon: <IconCamera />, label: 'Take Photo', color: '#ec4899' },
        { type: 'pdfembedder' as FieldType, icon: <IconPdf />, label: 'PDF Embedder', color: '#ef4444' },
      ]
    },
    {
      id: 'advanced',
      label: 'Advanced',
      icon: '⚡',
      elements: [
        { type: 'datepicker' as FieldType, icon: <IconCalendar />, label: 'Date Picker', color: '#06b6d4' },
        { type: 'appointment' as FieldType, icon: <IconCalendar />, label: 'Appointment', color: '#8b5cf6' },
        { type: 'formcalculation' as FieldType, icon: <IconCalculator />, label: 'Calculation', color: '#8b5cf6' },
        { type: 'dynamicdropdowns' as FieldType, icon: <IconDropdown />, label: 'Dynamic Dropdowns', color: '#d946ef' },
        { type: 'configurablelist' as FieldType, icon: <IconList />, label: 'Configurable List', color: '#3b82f6' },
        { type: 'termsandconditions' as FieldType, icon: <IconFile />, label: 'Terms & Conditions', color: '#f59e0b' },
        { type: 'datagrid' as FieldType, icon: <IconGrid />, label: 'Data Grid', color: '#0284c7' },
        { type: 'fillintheblank' as FieldType, icon: <IconText />, label: 'Fill in the Blank', color: '#22c55e' },
        { type: 'multipletextfields' as FieldType, icon: <IconText />, label: 'Multiple Text', color: '#10b981' },
        { type: 'dynamictextbox' as FieldType, icon: <IconText />, label: 'Dynamic Textbox', color: '#06b6d4' },
        { type: 'addoptions' as FieldType, icon: <IconDropdown />, label: 'Add Options', color: '#6366f1' },
      ]
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: '💳',
      elements: [
        { type: 'stripe' as FieldType, icon: <IconCreditCard />, label: 'Stripe', color: '#6366f1' },
        { type: 'paypal' as FieldType, icon: <IconCreditCard />, label: 'PayPal', color: '#003087' },
        { type: 'square' as FieldType, icon: <IconCreditCard />, label: 'Square', color: '#1f2937' },
        { type: 'applepay' as FieldType, icon: <IconCreditCard />, label: 'Apple/Google Pay', color: '#000000' },
        { type: 'stripecheckout' as FieldType, icon: <IconCreditCard />, label: 'Stripe Checkout', color: '#7c3aed' },
        { type: 'braintree' as FieldType, icon: <IconCreditCard />, label: 'Braintree', color: '#4f46e5' },
        { type: 'cashapppay' as FieldType, icon: <IconCreditCard />, label: 'Cash App Pay', color: '#00d632' },
        { type: 'afterpay' as FieldType, icon: <IconCreditCard />, label: 'Afterpay', color: '#b2fce4' },
        { type: 'clearpay' as FieldType, icon: <IconCreditCard />, label: 'Clearpay', color: '#00d4ff' },
        { type: 'mollie' as FieldType, icon: <IconCreditCard />, label: 'Mollie', color: '#0ea5e9' },
        { type: 'authorizenet' as FieldType, icon: <IconCreditCard />, label: 'Authorize.Net', color: '#dc2626' },
        { type: 'cybersource' as FieldType, icon: <IconCreditCard />, label: 'CyberSource', color: '#b91c1c' },
      ]
    },
  ];

  // Filter elements based on search query
  const filteredCategories = elementCategories.map(category => ({
    ...category,
    elements: category.elements.filter(element =>
      element.label.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
    )
  })).filter(category => category.elements.length > 0);

  return (
    <div className={`h-screen flex flex-col bg-gray-50 dark:from-gray-900 dark:to-gray-800 ${isDarkMode ? 'dark' : ''}`}>
      {/* Clean Professional Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2.5 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          {/* Left Section - Back Button & Form Title */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/dashboard/forms')}
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-[#1a73e8] dark:hover:text-[#1a73e8] font-medium transition-colors text-sm px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>

            {/* Form Title Box */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5">
              <svg className="w-4 h-4 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm font-semibold border-none focus:outline-none focus:ring-0 bg-transparent dark:text-white text-gray-900 min-w-[150px]"
                placeholder="Enter form name..."
              />
            </div>

            {/* Autosave Status Indicator */}
            <div className="flex items-center gap-2">
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs animate-pulse">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </div>
              )}
              {autoSaveStatus === 'saved' && (
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Saved</span>
                </div>
              )}
              {autoSaveStatus === 'error' && (
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Failed</span>
                </div>
              )}
              {autoSaveStatus === 'idle' && hasUnsavedChanges && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span>Unsaved</span>
                </div>
              )}
              {autoSaveStatus === 'idle' && !hasUnsavedChanges && lastSavedAt && (
                <span className="text-gray-400 dark:text-gray-500 text-xs">
                  Saved {lastSavedAt.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('build')}
              className={`px-5 py-2 font-semibold rounded-md transition-all duration-200 text-sm ${activeTab === 'build' ? 'bg-[#1a73e8] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Build
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-5 py-2 font-semibold rounded-md transition-all duration-200 text-sm ${activeTab === 'settings' ? 'bg-[#1a73e8] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('logic')}
              className={`px-5 py-2 font-semibold rounded-md transition-all duration-200 text-sm flex items-center gap-1.5 ${activeTab === 'logic' ? 'bg-[#1a73e8] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logic
            </button>
            <button
              onClick={() => setActiveTab('publish')}
              className={`px-5 py-2 font-semibold rounded-md transition-all duration-200 text-sm ${activeTab === 'publish' ? 'bg-[#1a73e8] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Publish
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Undo/Redo Buttons */}
            <div className="flex items-center gap-0.5 mr-2 border-r border-gray-200 dark:border-gray-600 pr-3">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-[#1a73e8] dark:hover:text-[#1a73e8] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-[#1a73e8] dark:hover:text-[#1a73e8] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Redo (Ctrl+Shift+Z)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${
                showPreview
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* BUILD TAB */}
        {activeTab === 'build' && (
          <>
            {/* Cleaner Sidebar with Collapsible Categories */}
            {showSidebar && (
              <aside className="w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-full overflow-y-auto border-r border-gray-200 dark:border-gray-800">
                <div className="p-3">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Elements</h2>
                    <button onClick={() => setShowSidebar(false)} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Search */}
                  <div className="mb-3">
                    <div className="relative">
                      <svg className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search elements..."
                        value={sidebarSearchQuery}
                        onChange={(e) => setSidebarSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-[#1a73e8] transition-all"
                      />
                    </div>
                  </div>

                  {/* Collapsible Categories */}
                  <div className="space-y-1.5">
                    {filteredCategories.map((category) => (
                      <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                        {/* Category Header */}
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="w-full flex items-center justify-between px-2.5 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{category.icon}</span>
                            <span className="font-medium text-xs text-gray-700 dark:text-gray-200">{category.label}</span>
                            <span className="text-[10px] text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">{category.elements.length}</span>
                          </div>
                          <svg
                            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${expandedCategories[category.id] ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Category Elements */}
                        {expandedCategories[category.id] && (
                          <div className="p-1.5 space-y-0.5 bg-white dark:bg-gray-900">
                            {category.elements.map((element) => (
                              <button
                                key={element.type}
                                onClick={(e) => handleElementClick(e, element.type)}
                                draggable
                                onDragStart={handleDragStart(element.type)}
                                onDragEnd={handleDragEnd}
                                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-150 text-left group cursor-grab active:cursor-grabbing"
                              >
                                <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ color: element.color }}>
                                  {element.icon}
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-300 group-hover:text-[#1a73e8] dark:group-hover:text-[#1a73e8] transition-colors truncate">{element.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Keyboard Shortcuts Hint */}
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Shortcuts</p>
                    <div className="space-y-1 text-[10px] text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Save</span>
                        <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px]">Ctrl+S</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Undo</span>
                        <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px]">Ctrl+Z</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Redo</span>
                        <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px]">Ctrl+Y</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Delete</span>
                        <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px]">Del</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Form Canvas */}
            <main className="flex-1 p-6 overflow-y-auto relative bg-gray-100 dark:bg-gray-900">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="mb-4 px-4 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-all font-medium text-sm"
                >
                  Show Elements Panel
                </button>
              )}

              <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                {/* Logo Upload Area */}
                <div className="relative mb-8">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  {logoFile ? (
                    // Logo Preview with Remove Option
                    <div className="relative group">
                      <div className="text-center border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/50">
                        <img
                          src={logoFile}
                          alt="Form Logo"
                          className="max-h-32 mx-auto object-contain"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{logoFileName}</p>
                      </div>
                      {/* Remove and Change buttons */}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg transition-all flex items-center gap-1"
                          title="Change logo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Change
                        </button>
                        <button
                          onClick={handleLogoRemove}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg transition-all flex items-center gap-1"
                          title="Remove logo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Upload Prompt
                    <label
                      htmlFor="logo-upload"
                      className="block text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 transition-colors mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-semibold mb-1 transition-colors">
                          Add Your Logo
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </span>
                      </div>
                    </label>
                  )}
                </div>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-3xl font-bold w-full border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg mb-3 bg-transparent dark:text-white"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Form description..."
                  className="w-full text-gray-600 dark:text-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg resize-none mb-8 bg-transparent"
                  rows={2}
                />

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`min-h-[400px] rounded-2xl transition-all ${
                    draggedField ? 'ring-2 ring-indigo-500 ring-offset-4 dark:ring-offset-gray-800' : ''
                  }`}
                >
                  {fields.length === 0 ? (
                    <div
                      className={`border-2 border-dashed rounded-2xl py-24 text-center group transition-all ${
                        draggedField
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
                      }`}
                    >
                      <svg className="w-16 h-16 mx-auto text-gray-400 group-hover:text-indigo-500 transition-colors mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-lg font-medium transition-colors">
                        {draggedField ? 'Drop element here' : 'Drag your first question here from the left'}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {fields.map((field, index) => (
                        <div key={field.id} className="relative group">
                          {renderFieldPreview(field)}
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              onClick={() => removeField(field.id)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-lg w-10 h-10 flex items-center justify-center shadow-lg shadow-red-500/30 transition-all transform hover:scale-110 active:scale-95"
                              title="Delete field"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Drop Zone Indicator when dragging with existing fields */}
                      {draggedField && (
                        <div className="border-2 border-dashed border-indigo-500 dark:border-indigo-400 rounded-2xl py-12 text-center bg-indigo-50 dark:bg-indigo-900/20">
                          <svg className="w-12 h-12 mx-auto text-indigo-500 dark:text-indigo-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-indigo-600 dark:text-indigo-400 text-base font-medium">
                            Drop to add element
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                {fields.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-3.5 rounded-xl font-semibold shadow-lg shadow-green-500/30 transform hover:scale-105 transition-all">
                      Submit
                    </button>
                  </div>
                )}
              </div>
            </main>

            {/* Field Editor Sidebar - appears when field is selected */}
            {selectedField && fields.find(f => f.id === selectedField) && (
              <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-full overflow-y-auto p-6">
                {(() => {
                  const field = fields.find(f => f.id === selectedField)!;
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold dark:text-white">Field Settings</h3>
                        <button
                          onClick={() => setSelectedField(null)}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Label */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold dark:text-white mb-2">Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white"
                        />
                      </div>

                      {/* Placeholder - for applicable fields */}
                      {!['heading', 'checkbox', 'radio', 'dropdown', 'signature', 'takephoto', 'termsandconditions', 'pdfembedder', 'datagrid'].includes(field.type) && (
                        <div className="mb-4">
                          <label className="block text-sm font-semibold dark:text-white mb-2">Placeholder</label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white"
                          />
                        </div>
                      )}

                      {/* Required */}
                      <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm font-semibold dark:text-white">Required field</span>
                        </label>
                      </div>

                      {/* Number field specific settings */}
                      {field.type === 'number' && (
                        <div className="mb-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                          <h4 className="text-sm font-semibold dark:text-white mb-3">Number Settings</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Min Value</label>
                              <input
                                type="number"
                                placeholder="0"
                                className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Max Value</label>
                              <input
                                type="number"
                                placeholder="100"
                                className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Text/Textarea field specific settings */}
                      {['text', 'shorttext', 'textarea', 'longtext'].includes(field.type) && (
                        <div className="mb-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                          <h4 className="text-sm font-semibold dark:text-white mb-3">Text Settings</h4>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Max Characters</label>
                            <input
                              type="number"
                              placeholder="500"
                              className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* File upload specific settings */}
                      {field.type === 'file' && (
                        <div className="mb-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                          <h4 className="text-sm font-semibold dark:text-white mb-3">File Upload Settings</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Allowed File Types</label>
                              <input
                                type="text"
                                placeholder="PDF, DOC, JPG, PNG"
                                className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Max File Size (MB)</label>
                              <input
                                type="number"
                                placeholder="10"
                                className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PDF Embedder specific settings */}
                      {field.type === 'pdfembedder' && (
                        <div className="mb-4 p-4 border-2 border-red-200 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <h4 className="text-sm font-semibold dark:text-white mb-3">PDF Embedder Settings</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">PDF URL</label>
                              <input
                                type="url"
                                value={field.pdfUrl || ''}
                                onChange={(e) => updateField(field.id, { pdfUrl: e.target.value })}
                                placeholder="https://example.com/document.pdf"
                                className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white text-sm"
                              />
                              <p className="text-xs text-gray-500 mt-1">Enter the URL of the PDF you want to display</p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Height (px)</label>
                              <input
                                type="number"
                                value={field.pdfHeight || 500}
                                onChange={(e) => updateField(field.id, { pdfHeight: parseInt(e.target.value) || 500 })}
                                placeholder="500"
                                className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={field.showDownload || false}
                                onChange={(e) => updateField(field.id, { showDownload: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 rounded"
                              />
                              <span className="text-xs text-gray-600 dark:text-gray-400">Allow users to download PDF</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment field settings */}
                      {['square', 'paypal', 'stripe', 'stripecheckout', 'authorizenet', 'braintree', 'cashapppay', 'afterpay', 'clearpay', 'applepay', 'mollie', 'cybersource'].includes(field.type) && (
                        <div className="mb-4 p-4 border-2 border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <h4 className="text-sm font-semibold dark:text-white mb-3">Payment Settings</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Amount ($)</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Currency</label>
                              <select className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white text-sm">
                                <option>USD</option>
                                <option>EUR</option>
                                <option>GBP</option>
                                <option>INR</option>
                              </select>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Note:</span> Configure {field.label} API keys in Settings tab
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Options - for dropdown, checkbox, radio, checklist */}
                      {['dropdown', 'checkbox', 'radio', 'checklist', 'dynamicdropdowns'].includes(field.type) && (
                        <div className="mb-4">
                          <label className="block text-sm font-semibold dark:text-white mb-2">Options</label>
                          {(field.options || []).map((option, idx) => (
                            <div key={idx} className="flex items-center gap-2 mb-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(field.options || [])];
                                  newOptions[idx] = e.target.value;
                                  updateField(field.id, { options: newOptions });
                                }}
                                className="flex-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-indigo-500 dark:text-white text-sm"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = (field.options || []).filter((_, i) => i !== idx);
                                  updateField(field.id, { options: newOptions });
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                              updateField(field.id, { options: newOptions });
                            }}
                            className="w-full mt-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 font-semibold text-sm transition-colors"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}

                      {/* Delete Field Button */}
                      <button
                        onClick={() => {
                          removeField(field.id);
                          setSelectedField(null);
                        }}
                        className="w-full mt-6 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        Delete Field
                      </button>
                    </div>
                  );
                })()}
              </aside>
            )}
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-3">Settings</h3>
                <nav className="space-y-1">
                  {[
                    { icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ), label: 'Form Settings', active: true },
                    { icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ), label: 'Emails', active: false },
                    { icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    ), label: 'Conditions', active: false },
                    { icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ), label: 'Thank You Page', active: false },
                    { icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    ), label: 'Notifications', active: false },
                    { icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                      </svg>
                    ), label: 'Integrations', active: false },
                    { icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ), label: 'Workflows', active: false },
                  ].map((item) => (
                    <button key={item.label} className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-200 ${item.active ? 'bg-[#1a73e8] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                      <span className={item.active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}>{item.icon}</span>
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-[#e8f0fe] dark:bg-[#1a73e8]/20 text-[#1a73e8] p-2.5 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Form Settings</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customize form status and properties</p>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-6">
                  <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Enter a name for your form</p>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 dark:text-white transition-all"
                  />
                </div>

                {/* Folder Selection */}
                <div className="mb-6">
                  <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1.5">Folder</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Organize your form by selecting a folder</p>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 dark:text-white transition-all cursor-pointer"
                  >
                    <option value="home">Home</option>
                    <option value="registration">Registration Forms</option>
                    <option value="feedback">Feedback Forms</option>
                    <option value="surveys">Surveys</option>
                    <option value="contact">Contact Forms</option>
                  </select>
                </div>

                {/* Form Status */}
                <div className="mb-6">
                  <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1.5">Form Status</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Enable, disable, or conditionally enable your form</p>
                  <div className="border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center justify-between hover:border-green-300 dark:hover:border-green-600 cursor-pointer transition-all bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">ENABLED</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Your form is currently visible and able to receive submissions</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Encrypt Form Data */}
                <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-sm text-gray-900 dark:text-white block mb-0.5">Encrypt Form Data</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Encrypt your form responses to store sensitive data securely.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={encryptData}
                        onChange={(e) => setEncryptData(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#1a73e8]/30 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
                    </label>
                  </div>
                </div>

                {/* Draft Mode */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-sm text-gray-900 dark:text-white block mb-0.5">Draft Mode</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Edit form in draft mode and sync updates to the live form at any time.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftMode}
                        onChange={(e) => setDraftMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#1a73e8]/30 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}

        {/* LOGIC TAB */}
        {activeTab === 'logic' && (
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto p-6">
              {/* Header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#fff3e0] dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-2.5 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      Conditional Logic Builder
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create rules to show or hide fields based on user responses</p>
                  </div>
                </div>

                {/* How it works info */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-700/50">
                  <h3 className="font-medium text-xs mb-1.5 flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How it works
                  </h3>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 grid sm:grid-cols-2 gap-x-4 gap-y-0.5">
                    <li>• Choose a field to watch</li>
                    <li>• Set condition & value</li>
                    <li>• Select action (show/hide)</li>
                    <li>• Pick target field</li>
                  </ul>
                </div>
              </div>

              {/* Existing Logic Rules */}
              {logicRules.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="bg-[#1a73e8] text-white px-2 py-0.5 rounded text-xs font-medium">
                      {logicRules.length}
                    </span>
                    Active Rules
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {logicRules.map((rule) => {
                      const sourceField = fields.find(f => f.id === rule.sourceFieldId);
                      const targetField = fields.find(f => f.id === rule.targetFieldId);
                      return (
                        <div key={rule.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-medium text-[#1a73e8] bg-[#e8f0fe] dark:bg-[#1a73e8]/20 px-1.5 py-0.5 rounded uppercase">Rule</span>
                            <button
                              onClick={() => setLogicRules(logicRules.filter(r => r.id !== rule.id))}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-0.5 rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-gray-900 dark:text-white">
                              <span className="text-[#1a73e8] font-semibold">IF</span> "{sourceField?.label || 'Unknown'}"
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-3 border-l-2 border-gray-300 dark:border-gray-600">
                              {rule.condition.replace(/_/g, ' ')} <strong>"{rule.value}"</strong>
                            </p>
                            <p className="text-xs font-medium text-gray-900 dark:text-white">
                              <span className="text-green-600 dark:text-green-400 font-semibold">THEN</span> {rule.action.toUpperCase()} "{targetField?.label || 'Unknown'}"
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add New Rule Form */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium uppercase">New</span>
                  Add Logic Rule
                </h2>

                <div className="space-y-4">
                  {/* Source Field Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                      When this field...
                    </label>
                    <select
                      id="logic-source-field"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 focus:outline-none transition-colors"
                    >
                      <option value="">Select a field</option>
                      {fields.map(field => (
                        <option key={field.id} value={field.id}>{field.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                      Meets this condition...
                    </label>
                    <select
                      id="logic-condition"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 focus:outline-none transition-colors"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Does not equal</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater than</option>
                      <option value="less_than">Less than</option>
                    </select>
                  </div>

                  {/* Value Input */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                      With this value...
                    </label>
                    <input
                      id="logic-value"
                      type="text"
                      placeholder="Enter value to compare"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Action Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                      Then perform this action...
                    </label>
                    <select
                      id="logic-action"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 focus:outline-none transition-colors"
                    >
                      <option value="show">Show field</option>
                      <option value="hide">Hide field</option>
                    </select>
                  </div>

                  {/* Target Field Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                      On this field...
                    </label>
                    <select
                      id="logic-target-field"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 focus:outline-none transition-colors"
                    >
                      <option value="">Select a field</option>
                      {fields.map(field => (
                        <option key={field.id} value={field.id}>{field.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Add Rule Button */}
                  <button
                    onClick={() => {
                      const sourceField = (document.getElementById('logic-source-field') as HTMLSelectElement).value;
                      const condition = (document.getElementById('logic-condition') as HTMLSelectElement).value as LogicRule['condition'];
                      const value = (document.getElementById('logic-value') as HTMLInputElement).value;
                      const action = (document.getElementById('logic-action') as HTMLSelectElement).value as LogicRule['action'];
                      const targetField = (document.getElementById('logic-target-field') as HTMLSelectElement).value;

                      if (!sourceField || !value || !targetField) {
                        alert('Please fill in all fields');
                        return;
                      }

                      if (sourceField === targetField) {
                        alert('Source and target fields must be different');
                        return;
                      }

                      const newRule: LogicRule = {
                        id: `rule-${Date.now()}`,
                        sourceFieldId: sourceField,
                        condition,
                        value,
                        action,
                        targetFieldId: targetField
                      };

                      setLogicRules([...logicRules, newRule]);

                      // Clear form
                      (document.getElementById('logic-source-field') as HTMLSelectElement).value = '';
                      (document.getElementById('logic-condition') as HTMLSelectElement).value = 'equals';
                      (document.getElementById('logic-value') as HTMLInputElement).value = '';
                      (document.getElementById('logic-action') as HTMLSelectElement).value = 'show';
                      (document.getElementById('logic-target-field') as HTMLSelectElement).value = '';
                    }}
                    className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Logic Rule
                  </button>
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded text-xs font-medium uppercase">Preview</span>
                  Test Your Logic Rules
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Fill out the fields below to see how your logic rules work in real-time
                </p>

                <div className="space-y-3">
                  {fields.map(field => {
                    // Check if this field should be hidden based on logic rules
                    const shouldHide = logicRules.some(rule => {
                      if (rule.targetFieldId !== field.id) return false;
                      const sourceValue = previewValues[rule.sourceFieldId] || '';

                      let conditionMet = false;
                      switch (rule.condition) {
                        case 'equals':
                          conditionMet = sourceValue === rule.value;
                          break;
                        case 'not_equals':
                          conditionMet = sourceValue !== rule.value;
                          break;
                        case 'contains':
                          conditionMet = sourceValue.includes(rule.value);
                          break;
                        case 'greater_than':
                          conditionMet = parseFloat(sourceValue) > parseFloat(rule.value);
                          break;
                        case 'less_than':
                          conditionMet = parseFloat(sourceValue) < parseFloat(rule.value);
                          break;
                      }

                      return (rule.action === 'hide' && conditionMet) || (rule.action === 'show' && !conditionMet);
                    });

                    if (shouldHide) return null;

                    return (
                      <div key={field.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        {field.type === 'short-text' && (
                          <input
                            type="text"
                            value={previewValues[field.id] || ''}
                            onChange={(e) => setPreviewValues({...previewValues, [field.id]: e.target.value})}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        )}

                        {field.type === 'long-text' && (
                          <textarea
                            value={previewValues[field.id] || ''}
                            onChange={(e) => setPreviewValues({...previewValues, [field.id]: e.target.value})}
                            placeholder={field.placeholder}
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        )}

                        {field.type === 'number' && (
                          <input
                            type="number"
                            value={previewValues[field.id] || ''}
                            onChange={(e) => setPreviewValues({...previewValues, [field.id]: e.target.value})}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        )}

                        {(field.type === 'single-select' || field.type === 'dropdown') && (
                          <select
                            value={previewValues[field.id] || ''}
                            onChange={(e) => setPreviewValues({...previewValues, [field.id]: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option, idx) => (
                              <option key={idx} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>

                {fields.length === 0 && (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Add some fields in the Build tab first to test logic rules</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* PUBLISH TAB */}
        {activeTab === 'publish' && (
          <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="max-w-3xl mx-auto">
              {/* Publish Button Section */}
              {formPublishStatus !== 'PUBLISHED' ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-5 mb-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 dark:bg-amber-800/50 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-gray-900 dark:text-white">Form Not Published Yet</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Your form is in DRAFT mode. Publish it to start collecting responses.</p>
                      </div>
                    </div>
                    <button
                      onClick={handlePublish}
                      className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex-shrink-0"
                    >
                      Publish Form
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-5 mb-6 flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-800/50 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white">Form Published</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your form is live and ready to receive submissions</p>
                  </div>
                </div>
              )}

              {/* Share with Link */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#e8f0fe] dark:bg-[#1a73e8]/20 text-[#1a73e8] p-2.5 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Share with Link</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Share this link with anyone to collect responses</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <div className="flex items-center gap-2 flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <input
                      type="text"
                      value={id ? `${window.location.origin}/forms/${id}` : 'Save form to get link'}
                      readOnly
                      className="flex-1 border-none focus:outline-none bg-transparent text-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>

              {/* Invite by Email */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#fce4ec] dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 p-2.5 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Invite by Email</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Send direct invitations to collect responses</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Enter email addresses..."
                    className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 dark:text-white transition-all"
                  />
                  <button className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
                    Send
                  </button>
                </div>
              </div>

              {/* Share Form Social */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#e3f2fd] dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2.5 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Share on Social</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Share your form on social media platforms</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-[#0A66C2] hover:bg-[#095196] text-white rounded-lg flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-black hover:bg-gray-800 text-white rounded-lg flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Preview Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold dark:text-white">Form Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-8">
              {logoFile && (
                <div className="text-center mb-6">
                  <img src={logoFile} alt="Form Logo" className="max-h-24 mx-auto object-contain" />
                </div>
              )}

              <h1 className="text-3xl font-bold dark:text-white mb-3">{title || 'Untitled Form'}</h1>
              {description && (
                <p className="text-gray-600 dark:text-gray-400 mb-8">{description}</p>
              )}

              {fields.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No fields added yet. Add some fields to see them in preview.
                </div>
              ) : (
                <div className="space-y-6">
                  {fields.map((field) => renderFieldPreview(field))}
                </div>
              )}

              {fields.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-3.5 rounded-xl font-semibold shadow-lg shadow-green-500/30 transform hover:scale-105 transition-all">
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilderPage;
