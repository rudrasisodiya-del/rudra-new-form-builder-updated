import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

type FieldType =
  // Basic Elements
  | 'heading' | 'fullname' | 'email' | 'address' | 'phone' | 'datepicker'
  | 'appointment' | 'signature' | 'fillintheblank' | 'shorttext' | 'longtext'
  | 'text' | 'textarea' | 'number' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'file'
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
      'rating': 'radio', // Map rating to radio for now
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
      alert('Form saved successfully!');
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
    const borderClass = isSelected ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-gray-200 dark:border-gray-700';

    switch (field.type) {
      case 'heading':
        return (
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="First Name" className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled />
              <input type="text" placeholder="Last Name" className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 dark:text-white" disabled />
            </div>
          </div>
        );

      case 'address':
        return (
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
              <span className="text-gray-400">Sign here</span>
            </div>
          </div>
        );

      case 'takephoto':
        return (
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
              <span className="text-gray-400">Take Photo</span>
            </div>
          </div>
        );

      case 'checklist':
      case 'checkbox':
        return (
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label}</label>
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
              <span className="text-gray-400">PDF Document</span>
            </div>
          </div>
        );

      // Widget fields
      case 'multipletextfields':
        return (
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
            <label className="font-semibold block mb-3 dark:text-white">{field.label}</label>
            <div className="space-y-2">
              <input type="text" placeholder="Dynamic input field" className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2.5 dark:text-white" disabled />
              <p className="text-xs text-gray-500 dark:text-gray-400">Field adapts based on previous answers</p>
            </div>
          </div>
        );

      case 'addoptions':
        return (
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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

      // Default case for other field types
      default:
        return (
          <div className={`border-2 ${borderClass} rounded-xl p-6 cursor-pointer hover:border-indigo-400 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200`} onClick={() => setSelectedField(field.id)}>
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

  const basicElements = [
    { type: 'heading' as FieldType, icon: '📝', label: 'Heading', gradient: 'from-purple-500 to-pink-500' },
    { type: 'fullname' as FieldType, icon: '👤', label: 'Full Name', gradient: 'from-blue-500 to-cyan-500' },
    { type: 'email' as FieldType, icon: '📧', label: 'Email', gradient: 'from-green-500 to-teal-500' },
    { type: 'address' as FieldType, icon: '📍', label: 'Address', gradient: 'from-red-500 to-orange-500' },
    { type: 'phone' as FieldType, icon: '📞', label: 'Phone', gradient: 'from-indigo-500 to-purple-500' },
    { type: 'datepicker' as FieldType, icon: '📅', label: 'Date Picker', gradient: 'from-cyan-500 to-blue-500' },
    { type: 'appointment' as FieldType, icon: '🗓️', label: 'Appointment', gradient: 'from-violet-500 to-purple-500' },
    { type: 'signature' as FieldType, icon: '✍️', label: 'Signature', gradient: 'from-amber-500 to-orange-500' },
    { type: 'fillintheblank' as FieldType, icon: '📝', label: 'Fill in the Blank', gradient: 'from-emerald-500 to-green-500' },
    { type: 'shorttext' as FieldType, icon: '📄', label: 'Short Text', gradient: 'from-sky-500 to-cyan-500' },
    { type: 'longtext' as FieldType, icon: '📑', label: 'Long Text', gradient: 'from-blue-500 to-indigo-500' },
    { type: 'number' as FieldType, icon: '🔢', label: 'Number', gradient: 'from-teal-500 to-cyan-500' },
    { type: 'dropdown' as FieldType, icon: '⬇️', label: 'Dropdown', gradient: 'from-fuchsia-500 to-pink-500' },
    { type: 'checkbox' as FieldType, icon: '☑️', label: 'Checkbox', gradient: 'from-lime-500 to-green-500' },
    { type: 'radio' as FieldType, icon: '⚪', label: 'Radio', gradient: 'from-orange-500 to-red-500' },
    { type: 'file' as FieldType, icon: '📎', label: 'File Upload', gradient: 'from-rose-500 to-pink-500' },
  ];

  const paymentElements = [
    { type: 'square' as FieldType, icon: '⬛', label: 'Square', gradient: 'from-gray-700 to-gray-900' },
    { type: 'paypal' as FieldType, icon: '💙', label: 'PayPal', gradient: 'from-blue-600 to-blue-800' },
    { type: 'authorizenet' as FieldType, icon: '🅰️', label: 'Authorize.Net', gradient: 'from-red-600 to-red-800' },
    { type: 'stripe' as FieldType, icon: '💜', label: 'Stripe', gradient: 'from-purple-600 to-purple-800' },
    { type: 'stripecheckout' as FieldType, icon: '💜', label: 'Stripe Checkout', gradient: 'from-purple-700 to-purple-900' },
    { type: 'braintree' as FieldType, icon: '🧠', label: 'Braintree', gradient: 'from-indigo-600 to-indigo-800' },
    { type: 'cashapppay' as FieldType, icon: '💚', label: 'Cash App Pay', gradient: 'from-green-600 to-green-800' },
    { type: 'afterpay' as FieldType, icon: '🔶', label: 'Afterpay', gradient: 'from-orange-600 to-orange-800' },
    { type: 'clearpay' as FieldType, icon: '🔷', label: 'Clearpay', gradient: 'from-cyan-600 to-cyan-800' },
    { type: 'applepay' as FieldType, icon: '🍎', label: 'Apple Pay & Google Pay', gradient: 'from-gray-800 to-black' },
    { type: 'mollie' as FieldType, icon: 'Ⓜ️', label: 'Mollie', gradient: 'from-blue-500 to-cyan-600' },
    { type: 'cybersource' as FieldType, icon: '🔐', label: 'CyberSource', gradient: 'from-red-700 to-red-900' },
  ];

  const widgetElements = [
    { type: 'formcalculation' as FieldType, icon: '🧮', label: 'Form Calculation', gradient: 'from-violet-500 to-purple-600' },
    { type: 'configurablelist' as FieldType, icon: '📋', label: 'Configurable List', gradient: 'from-blue-500 to-indigo-600' },
    { type: 'multipletextfields' as FieldType, icon: '📝', label: 'Multiple Text Fields', gradient: 'from-green-500 to-emerald-600' },
    { type: 'termsandconditions' as FieldType, icon: '📜', label: 'Terms & Conditions', gradient: 'from-amber-500 to-orange-600' },
    { type: 'takephoto' as FieldType, icon: '📷', label: 'Take Photo', gradient: 'from-pink-500 to-rose-600' },
    { type: 'checklist' as FieldType, icon: '✅', label: 'Checklist', gradient: 'from-lime-500 to-green-600' },
    { type: 'dynamictextbox' as FieldType, icon: '📦', label: 'Dynamic Textbox', gradient: 'from-cyan-500 to-teal-600' },
    { type: 'addoptions' as FieldType, icon: '➕', label: 'Add Options', gradient: 'from-indigo-500 to-purple-600' },
    { type: 'datagrid' as FieldType, icon: '📊', label: 'Data Grid', gradient: 'from-blue-600 to-cyan-700' },
    { type: 'dynamicdropdowns' as FieldType, icon: '⬇️', label: 'Dynamic Dropdowns', gradient: 'from-fuchsia-500 to-pink-600' },
    { type: 'pdfembedder' as FieldType, icon: '📄', label: 'PDF Embedder', gradient: 'from-red-500 to-rose-600' },
  ];

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 ${isDarkMode ? 'dark' : ''}`}>
      {/* Modern Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/forms')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-3 py-1 bg-transparent dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                showPreview
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
              }`}
            >
              {showPreview ? 'Exit Preview' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-cyan-600 font-semibold disabled:opacity-50 shadow-lg shadow-indigo-500/30 transition-all duration-200 transform hover:scale-105"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Top Tabs */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setActiveTab('build')}
            className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'build' ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            Build
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'settings' ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('logic')}
            className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === 'logic' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <span>⚡</span> Logic
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'publish' ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            Publish
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* BUILD TAB */}
        {activeTab === 'build' && (
          <>
            {/* Modern Sidebar with Elements */}
            {showSidebar && (
              <aside className="w-80 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white h-full overflow-y-auto shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">Form Elements</h2>
                    <button onClick={() => setShowSidebar(false)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Horizontal Category Tabs */}
                  <div className="flex gap-1 mb-4 bg-gray-200 dark:bg-gray-800/50 p-1 rounded-xl">
                    <button
                      onClick={() => setSidebarTab('basic')}
                      className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${sidebarTab === 'basic' ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      Basic
                    </button>
                    <button
                      onClick={() => setSidebarTab('payments')}
                      className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${sidebarTab === 'payments' ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      Payments
                    </button>
                    <button
                      onClick={() => setSidebarTab('widgets')}
                      className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${sidebarTab === 'widgets' ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      Widgets
                    </button>
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder={`Search ${sidebarTab}...`}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Elements List with Gradient Icons */}
                  <div className="space-y-2">
                    {sidebarTab === 'basic' && basicElements.map((element) => (
                      <button
                        key={element.type}
                        onClick={(e) => handleElementClick(e, element.type)}
                        draggable
                        onDragStart={handleDragStart(element.type)}
                        onDragEnd={handleDragEnd}
                        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 text-left group transform hover:scale-105 border border-gray-200 dark:border-transparent cursor-pointer active:cursor-grabbing"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${element.gradient} flex items-center justify-center text-lg shadow-lg group-hover:shadow-xl transition-shadow`}>
                          {element.icon}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{element.label}</span>
                      </button>
                    ))}

                    {sidebarTab === 'payments' && paymentElements.map((element) => (
                      <button
                        key={element.type}
                        onClick={(e) => handleElementClick(e, element.type)}
                        draggable
                        onDragStart={handleDragStart(element.type)}
                        onDragEnd={handleDragEnd}
                        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 text-left group transform hover:scale-105 border border-gray-200 dark:border-transparent cursor-pointer active:cursor-grabbing"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${element.gradient} flex items-center justify-center text-lg shadow-lg group-hover:shadow-xl transition-shadow`}>
                          {element.icon}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{element.label}</span>
                      </button>
                    ))}

                    {sidebarTab === 'widgets' && widgetElements.map((element) => (
                      <button
                        key={element.type}
                        onClick={(e) => handleElementClick(e, element.type)}
                        draggable
                        onDragStart={handleDragStart(element.type)}
                        onDragEnd={handleDragEnd}
                        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 text-left group transform hover:scale-105 border border-gray-200 dark:border-transparent cursor-pointer active:cursor-grabbing"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${element.gradient} flex items-center justify-center text-lg shadow-lg group-hover:shadow-xl transition-shadow`}>
                          {element.icon}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{element.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            )}

            {/* Form Canvas */}
            <main className="flex-1 p-8 overflow-y-auto relative">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="mb-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl hover:from-indigo-700 hover:to-cyan-600 shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-all"
                >
                  Show Elements Panel
                </button>
              )}

              <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
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
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => removeField(field.id)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-lg w-9 h-9 flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
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
            <aside className="w-72 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white h-full overflow-y-auto p-6">
              <h3 className="font-bold text-xl mb-6 bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">Settings</h3>
              <div className="space-y-2">
                {[
                  { icon: '⚙️', label: 'Form Settings', active: true },
                  { icon: '✉️', label: 'Emails', active: false },
                  { icon: '🔀', label: 'Conditions', active: false },
                  { icon: '✅', label: 'Thank You Page', active: false },
                  { icon: '🔔', label: 'Notifications', active: false },
                  { icon: '🔌', label: 'Integrations', active: false },
                  { icon: '🔄', label: 'Workflows', active: false },
                ].map((item) => (
                  <button key={item.label} className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-200 ${item.active ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg' : 'hover:bg-gray-200 dark:hover:bg-gray-800/50'}`}>
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-white p-4 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold dark:text-white">Form Settings</h2>
                    <p className="text-gray-600 dark:text-gray-400">Customize form status and properties</p>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-8">
                  <label className="block font-semibold mb-2 dark:text-white">Title</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Enter a name for your form</p>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white transition-all"
                  />
                </div>

                {/* Folder Selection */}
                <div className="mb-8">
                  <label className="block font-semibold mb-2 dark:text-white">Folder</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Organize your form by selecting a folder</p>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white transition-all cursor-pointer"
                  >
                    <option value="home">📁 Home</option>
                    <option value="registration">📋 Registration Forms</option>
                    <option value="feedback">💬 Feedback Forms</option>
                    <option value="surveys">📊 Surveys</option>
                    <option value="contact">📧 Contact Forms</option>
                  </select>
                </div>

                {/* Form Status */}
                <div className="mb-8">
                  <label className="block font-semibold mb-2 dark:text-white">Form Status</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enable, disable, or conditionally enable your form</p>
                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6 flex items-center justify-between hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-all bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 dark:bg-green-800 p-3 rounded-xl">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-lg dark:text-white">ENABLED</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Your form is currently visible and able to receive submissions</p>
                      </div>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Encrypt Form Data */}
                <div className="mb-8 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-semibold dark:text-white block mb-1">Encrypt Form Data</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Encrypt your form responses to store sensitive data securely.</p>
                      <a href="#" className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline">Learn more</a>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={encryptData}
                        onChange={(e) => setEncryptData(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-cyan-500"></div>
                    </label>
                  </div>
                </div>

                {/* Draft Mode */}
                <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-semibold dark:text-white block mb-1">Draft Mode</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Edit form in draft mode and sync updates to the live form at any time.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftMode}
                        onChange={(e) => setDraftMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-cyan-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}

        {/* LOGIC TAB */}
        {activeTab === 'logic' && (
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-2.5 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
                      Conditional Logic Builder
                    </h1>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Create rules to show or hide fields based on user responses</p>
                  </div>
                </div>

                {/* How it works info */}
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                  <h3 className="font-semibold text-xs mb-1.5 flex items-center gap-1.5 text-purple-900 dark:text-purple-200">
                    <span>💡</span> How it works
                  </h3>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 grid sm:grid-cols-2 gap-x-4 gap-y-0.5">
                    <li>• Choose a field to watch</li>
                    <li>• Set condition & value</li>
                    <li>• Select action (show/hide)</li>
                    <li>• Pick target field</li>
                  </ul>
                </div>
              </div>

              {/* Existing Logic Rules */}
              {logicRules.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded text-xs">
                      {logicRules.length}
                    </span>
                    Active Rules
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {logicRules.map((rule) => {
                      const sourceField = fields.find(f => f.id === rule.sourceFieldId);
                      const targetField = fields.find(f => f.id === rule.targetFieldId);
                      return (
                        <div key={rule.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded uppercase">Rule</span>
                            <button
                              onClick={() => setLogicRules(logicRules.filter(r => r.id !== rule.id))}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-0.5 rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-gray-900 dark:text-white">
                              <span className="text-purple-600 dark:text-purple-400 font-semibold">IF</span> "{sourceField?.label || 'Unknown'}"
                            </p>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 pl-3 border-l-2 border-gray-300 dark:border-gray-600">
                              {rule.condition.replace(/_/g, ' ')} <strong>"{rule.value}"</strong>
                            </p>
                            <p className="text-xs font-medium text-gray-900 dark:text-white">
                              <span className="text-pink-600 dark:text-pink-400 font-semibold">THEN</span> {rule.action.toUpperCase()} "{targetField?.label || 'Unknown'}"
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add New Rule Form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded text-xs uppercase">New</span>
                  Add Logic Rule
                </h2>

                <div className="space-y-3">
                  {/* Source Field Selection */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      When this field...
                    </label>
                    <select
                      id="logic-source-field"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select a field</option>
                      {fields.map(field => (
                        <option key={field.id} value={field.id}>{field.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Selection */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Meets this condition...
                    </label>
                    <select
                      id="logic-condition"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors"
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
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      With this value...
                    </label>
                    <input
                      id="logic-value"
                      type="text"
                      placeholder="Enter value to compare"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Action Selection */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Then perform this action...
                    </label>
                    <select
                      id="logic-action"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors"
                    >
                      <option value="show">Show field</option>
                      <option value="hide">Hide field</option>
                    </select>
                  </div>

                  {/* Target Field Selection */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      On this field...
                    </label>
                    <select
                      id="logic-target-field"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors"
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
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <span className="text-base">⚡</span>
                    Add Logic Rule
                  </button>
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-0.5 rounded text-xs uppercase">Preview</span>
                  Test Your Logic Rules
                </h2>

                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4">
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
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Publish Button Section */}
              {formPublishStatus !== 'PUBLISHED' ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl p-8 mb-8 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-2xl text-yellow-900 dark:text-yellow-200 mb-3">Form Not Published Yet</h3>
                      <p className="text-yellow-800 dark:text-yellow-300">Your form is currently in DRAFT mode. Click the button below to publish it and make it available for submissions.</p>
                    </div>
                    <button
                      onClick={handlePublish}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 transform hover:scale-105 transition-all"
                    >
                      Publish Form
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 mb-8 flex items-center gap-4 shadow-lg">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-green-900 dark:text-green-200">Form Published Successfully!</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">Your form is live and ready to receive submissions</p>
                  </div>
                </div>
              )}

              {/* Share with Link */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-white p-4 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold dark:text-white">Share with Link</h3>
                    <p className="text-gray-600 dark:text-gray-400">Share this link with anyone to collect responses</p>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <div className="flex items-center gap-3 flex-1 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <input
                      type="text"
                      value={id ? `${window.location.origin}/forms/${id}` : 'Save form to get link'}
                      readOnly
                      className="flex-1 border-none focus:outline-none bg-transparent dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopyLink}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-green-500/30 transform hover:scale-105 transition-all"
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-all"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>

              {/* Invite by Email */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 dark:text-white">Invite by Email</h3>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    placeholder="Enter email addresses to send invitation with permissions."
                    className="flex-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white transition-all"
                  />
                </div>
              </div>

              {/* Share Form Social */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-2 dark:text-white">Share Form</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Share your form link in various social posts and through email.</p>

                <div className="flex items-center gap-4">
                  {[
                    { color: 'bg-green-500 hover:bg-green-600', icon: '💬' },
                    { color: 'bg-blue-600 hover:bg-blue-700', icon: 'f' },
                    { color: 'bg-blue-700 hover:bg-blue-800', icon: 'in' },
                    { color: 'bg-gray-800 hover:bg-gray-900', icon: '𝕏' },
                  ].map((social, index) => (
                    <button key={index} className={`w-12 h-12 ${social.color} text-white rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all`}>
                      {social.icon}
                    </button>
                  ))}
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
