import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MockPaymentForm from '../components/MockPaymentForm';

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: any[];
  [key: string]: any;
}

interface FormData {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  status: string;
  settings?: {
    paymentEnabled?: boolean;
    paymentGateway?: string;
    paymentType?: string;
    currency?: string;
    items?: any[];
  };
}

const PublicFormViewWithPayment = () => {
  const { id } = useParams();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [filePreviews, setFilePreviews] = useState<Record<string, { url: string; type: string; name: string }>>({});

  useEffect(() => {
    fetchForm();
  }, [id]);

  // Cleanup file preview URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach(preview => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [filePreviews]);

  const fetchForm = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/forms/public/${id}`);
      setForm(response.data.form);

      // Initialize form values
      const initialValues: Record<string, any> = {};
      response.data.form.fields.forEach((field: FormField) => {
        if (field.type === 'checkbox' || field.type === 'checklist') {
          initialValues[field.id] = [];
        } else if (field.type === 'rating') {
          initialValues[field.id] = 0;
        } else if (field.type === 'fullname') {
          initialValues[field.id] = { firstName: '', lastName: '' };
        } else if (field.type === 'address') {
          initialValues[field.id] = { street: '', city: '', state: '', zip: '' };
        } else if (field.type === 'appointment') {
          initialValues[field.id] = { date: '', time: '' };
        } else if (field.type === 'termsandconditions') {
          initialValues[field.id] = false;
        } else if (field.type === 'pdfembedder') {
          initialValues[field.id] = null;
        } else {
          initialValues[field.id] = '';
        }
      });
      setFormValues(initialValues);
    } catch (error: any) {
      console.error('Error fetching form:', error);
      setError(error.response?.data?.message || 'Form not found or not published');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues({ ...formValues, [fieldId]: value });
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = formValues[fieldId] || [];
    if (checked) {
      setFormValues({ ...formValues, [fieldId]: [...currentValues, option] });
    } else {
      setFormValues({ ...formValues, [fieldId]: currentValues.filter((v: string) => v !== option) });
    }
  };

  const calculateTotalAmount = (): number => {
    if (!form?.settings?.items || form.settings.paymentType === 'donation') {
      return form?.settings?.items?.[0]?.price || 0;
    }
    return form.settings.items.reduce((total, item) => total + item.price, 0);
  };

  const handlePaymentSuccess = (payment: any) => {
    setPaymentCompleted(true);
    setPaymentData(payment);
  };

  const handlePaymentError = (errorMsg: string) => {
    alert(`Payment failed: ${errorMsg}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form ID:', id);
    console.log('Form Values:', formValues);
    console.log('Payment Completed:', paymentCompleted);
    console.log('Payment Data:', paymentData);

    // Validate required fields
    if (form) {
      for (const field of form.fields) {
        if (field.required && field.type !== 'payment') {
          const value = formValues[field.id];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            alert(`Please fill in the required field: ${field.label}`);
            return;
          }
          if (typeof value === 'object' && !Array.isArray(value)) {
            if (!value.firstName || !value.lastName) {
              alert(`Please fill in the required field: ${field.label}`);
              return;
            }
          }
        }
      }
    }

    // For payment forms, check if payment is completed
    const hasPaymentForm = form?.settings?.paymentEnabled && form?.fields.some(f => f.type === 'payment');
    if (hasPaymentForm && !paymentCompleted) {
      alert('Please complete the payment before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const submissionData = {
        ...formValues,
        ...(paymentData && { _payment: paymentData })
      };

      const response = await axios.post(`http://localhost:5000/api/submissions/${id}/submit`, submissionData);
      console.log('Submission successful:', response.data);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to submit form: ${error.response?.data?.error || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formValues[field.id];

    // Payment field
    if (field.type === 'payment' && form?.settings?.paymentEnabled) {
      const totalAmount = calculateTotalAmount();
      const currency = form.settings.currency || 'USD';

      return (
        <div key={field.id} className="mb-6">
          <MockPaymentForm
            amount={totalAmount}
            currency={currency}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      );
    }

    // Rating field
    if (field.type === 'rating' || field.label.toLowerCase().includes('satisfied') || field.label.toLowerCase().includes('rating')) {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleInputChange(field.id, star)}
                className="text-3xl focus:outline-none transition-all hover:scale-110"
                style={{
                  color: (value >= star) ? '#f59e0b' : '#d1d5db',
                  textShadow: (value >= star) ? '0 2px 4px rgba(245, 158, 11, 0.3)' : 'none'
                }}
              >
                ★
              </button>
            ))}
          </div>
          {value > 0 && (
            <p className="text-sm text-gray-600 mt-2">{value} out of 5 stars</p>
          )}
        </div>
      );
    }

    // Full Name field
    if (field.type === 'fullname') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First Name"
              value={value?.firstName || ''}
              onChange={(e) => handleInputChange(field.id, { ...value, firstName: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={value?.lastName || ''}
              onChange={(e) => handleInputChange(field.id, { ...value, lastName: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            />
          </div>
        </div>
      );
    }

    // Email field
    if (field.type === 'email') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="email"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder || 'Enter your email'}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        </div>
      );
    }

    // Text field
    if (field.type === 'text') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        </div>
      );
    }

    // Textarea field
    if (field.type === 'textarea') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={4}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        </div>
      );
    }

    // Checkbox field
    if (field.type === 'checkbox') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map((option: any) => (
              <label key={option.value || option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option.value || option)}
                  onChange={(e) => handleCheckboxChange(field.id, option.value || option, e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{option.label || option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // Default heading
    if (field.type === 'heading') {
      return (
        <div key={field.id} className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{field.label}</h2>
        </div>
      );
    }

    // Short text field
    if (field.type === 'shorttext') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        </div>
      );
    }

    // Long text field
    if (field.type === 'longtext') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={4}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        </div>
      );
    }

    // Dropdown field
    if (field.type === 'dropdown' || field.type === 'select') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          >
            <option value="">Select...</option>
            {(field.options || []).map((option: any, idx: number) => (
              <option key={idx} value={option.value || option}>{option.label || option}</option>
            ))}
          </select>
        </div>
      );
    }

    // Phone field
    if (field.type === 'phone') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="tel"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder || '(xxx) xxx-xxxx'}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        </div>
      );
    }

    // Number field
    if (field.type === 'number') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        </div>
      );
    }

    // Date field
    if (field.type === 'date' || field.type === 'datepicker') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        </div>
      );
    }

    // Radio field
    if (field.type === 'radio') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {(field.options || []).map((option: any, idx: number) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value || option}
                  checked={value === (option.value || option)}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                  required={field.required}
                />
                <span>{option.label || option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // File upload field with preview
    if (field.type === 'file') {
      const preview = filePreviews[field.id];
      const isImage = preview?.type?.startsWith('image/');
      const isPdf = preview?.type === 'application/pdf';

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          // Create preview URL
          const previewUrl = URL.createObjectURL(file);
          setFilePreviews(prev => ({
            ...prev,
            [field.id]: {
              url: previewUrl,
              type: file.type,
              name: file.name
            }
          }));
          handleInputChange(field.id, {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          });
        }
      };

      const removeFile = () => {
        if (preview?.url) {
          URL.revokeObjectURL(preview.url);
        }
        setFilePreviews(prev => {
          const updated = { ...prev };
          delete updated[field.id];
          return updated;
        });
        handleInputChange(field.id, '');
      };

      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>

          {!preview ? (
            // Upload area
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id={`file-upload-${field.id}`}
                required={field.required}
              />
              <label htmlFor={`file-upload-${field.id}`} className="cursor-pointer block">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-gray-600 font-medium">Click to upload file</p>
                <p className="text-sm text-gray-500 mt-1">Supports images, PDFs, and documents</p>
              </label>
            </div>
          ) : (
            // Preview area
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Image Preview */}
              {isImage && (
                <div className="relative bg-gray-100 p-4 flex items-center justify-center" style={{ maxHeight: '300px' }}>
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="max-w-full max-h-64 object-contain rounded"
                  />
                </div>
              )}

              {/* PDF Preview */}
              {isPdf && (
                <div className="bg-gray-100">
                  <iframe
                    src={preview.url}
                    width="100%"
                    height="300"
                    title={preview.name}
                    className="border-0"
                  />
                </div>
              )}

              {/* Other file types - show icon */}
              {!isImage && !isPdf && (
                <div className="bg-gray-100 p-8 flex flex-col items-center justify-center">
                  <div className="text-5xl mb-3">📄</div>
                  <p className="text-gray-700 font-medium">{preview.name}</p>
                  <p className="text-sm text-gray-500 mt-1">File uploaded successfully</p>
                </div>
              )}

              {/* File info and actions */}
              <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-lg">
                    {isImage ? '🖼️' : isPdf ? '📄' : '📁'}
                  </span>
                  <span className="text-sm text-gray-700 truncate max-w-xs">{preview.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* View button for images and PDFs */}
                  {(isImage || isPdf) && (
                    <a
                      href={preview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  )}
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Address field
    if (field.type === 'address') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            placeholder="Street Address"
            value={value?.street || ''}
            onChange={(e) => handleInputChange(field.id, { ...value, street: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="City"
              value={value?.city || ''}
              onChange={(e) => handleInputChange(field.id, { ...value, city: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="State"
              value={value?.state || ''}
              onChange={(e) => handleInputChange(field.id, { ...value, state: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="text"
            placeholder="ZIP Code"
            value={value?.zip || ''}
            onChange={(e) => handleInputChange(field.id, { ...value, zip: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    }

    // Terms and Conditions field - checkbox with terms text
    if (field.type === 'termsandconditions') {
      return (
        <div key={field.id} className="mb-6">
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-40 overflow-y-auto mb-3">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {field.termsText || 'By submitting this form, you agree to our Terms of Service and Privacy Policy. Your information will be processed in accordance with our data protection guidelines. You may withdraw your consent at any time by contacting us.'}
            </p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              required={field.required}
            />
            <span className="text-gray-700 font-medium">
              I agree to the Terms and Conditions {field.required && <span className="text-red-500">*</span>}
            </span>
          </label>
        </div>
      );
    }

    // Appointment field - date and time picker
    if (field.type === 'appointment') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Select Date</label>
              <input
                type="date"
                value={value?.date || ''}
                onChange={(e) => handleInputChange(field.id, { ...value, date: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={field.required}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Select Time</label>
              <input
                type="time"
                value={value?.time || ''}
                onChange={(e) => handleInputChange(field.id, { ...value, time: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={field.required}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Please select your preferred appointment date and time</p>
        </div>
      );
    }

    // PDF Embedder field - displays embedded PDF from URL configured by form creator
    if (field.type === 'pdfembedder') {
      const pdfUrl = field.pdfUrl;
      const pdfHeight = field.pdfHeight || 500;
      const showDownload = field.showDownload !== false;

      if (!pdfUrl) {
        return (
          <div key={field.id} className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">{field.label}</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-gray-500">No PDF document configured</p>
            </div>
          </div>
        );
      }

      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">{field.label}</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <iframe
              src={`${pdfUrl}#toolbar=${showDownload ? '1' : '0'}`}
              width="100%"
              height={pdfHeight}
              title={field.label || 'PDF Document'}
              className="border-0"
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </div>
          {showDownload && (
            <div className="mt-2 text-right">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </a>
            </div>
          )}
        </div>
      );
    }

    // Signature field
    if (field.type === 'signature') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder="Type your full name as signature"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 font-cursive text-xl"
              style={{ fontFamily: 'cursive' }}
              required={field.required}
            />
            <p className="text-sm text-gray-500 mt-2">By typing your name above, you agree this constitutes your electronic signature</p>
          </div>
        </div>
      );
    }

    // Checklist field
    if (field.type === 'checklist') {
      return (
        <div key={field.id} className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {(field.options || ['Item 1', 'Item 2', 'Item 3']).map((option: any, idx: number) => (
              <label key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option.value || option)}
                  onChange={(e) => handleCheckboxChange(field.id, option.value || option, e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label || option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // Default fallback - render as text input
    return (
      <div key={field.id} className="mb-6">
        <label className="block font-semibold text-gray-700 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          placeholder={field.placeholder || ''}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={field.required}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Form Not Found</h2>
          <p className="text-gray-600">{error || 'The form you are looking for does not exist or has been removed.'}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h2>
          <p className="text-lg text-gray-600 mb-4">Your form has been submitted successfully.</p>
          {paymentCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold text-green-800">✓ Payment Completed</p>
              <p className="text-xs text-green-600 mt-1">Transaction ID: {paymentData?.paymentMethodId}</p>
            </div>
          )}
          <div className="mt-6 text-sm text-gray-500">
            <p>Powered by <span className="font-semibold text-blue-600">Pabbly Form Builder</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <h1 className="text-4xl font-bold mb-3">{form.title}</h1>
            {form.description && (
              <p className="text-blue-100 text-lg">{form.description}</p>
            )}
            {form.settings?.paymentEnabled && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Payment Required</span>
              </div>
            )}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-8">
            {form.fields.map((field, index) => {
              // Only render the first payment field to avoid duplicates
              if (field.type === 'payment') {
                const firstPaymentIndex = form.fields.findIndex(f => f.type === 'payment');
                if (index !== firstPaymentIndex) {
                  return null; // Skip duplicate payment fields
                }
              }
              return renderField(field);
            })}

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Form'}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Powered by <span className="font-semibold text-blue-600">Pabbly Form Builder</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicFormViewWithPayment;
