import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  [key: string]: any;
}

interface FormData {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  status: string;
}

const PublicFormView = () => {
  const { id } = useParams();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      // Fetch form without authentication (public endpoint)
      const response = await axios.get(`http://localhost:5000/api/forms/public/${id}`);
      setForm(response.data.form);

      // Initialize form values
      const initialValues: Record<string, any> = {};
      response.data.form.fields.forEach((field: FormField) => {
        if (field.type === 'checkbox' || field.type === 'checklist') {
          initialValues[field.id] = [];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (form) {
      for (const field of form.fields) {
        if (field.required) {
          const value = formValues[field.id];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            alert(`Please fill in the required field: ${field.label}`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/api/submissions/${id}/submit`, {
        formData: formValues
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formValues[field.id];

    switch (field.type) {
      case 'heading':
        return (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{field.label}</h2>
          </div>
        );

      case 'fullname':
        return (
          <div className="mb-6">
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

      case 'address':
        return (
          <div className="mb-6">
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

      case 'email':
        return (
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              placeholder={field.placeholder || 'your@email.com'}
              value={value || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            />
          </div>
        );

      case 'phone':
        return (
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="tel"
              placeholder={field.placeholder || '(xxx) xxx-xxxx'}
              value={value || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            />
          </div>
        );

      case 'checkbox':
      case 'checklist':
        return (
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {(field.options || []).map((option, idx) => (
              <label key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {(field.options || []).map((option, idx) => (
              <label key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  required={field.required}
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
      case 'dynamicdropdowns':
        return (
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            >
              <option value="">Select...</option>
              {(field.options || []).map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'textarea':
      case 'longtext':
        return (
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder || 'Enter your response...'}
              value={value || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={field.rows || 4}
              required={field.required}
            />
          </div>
        );

      case 'date':
      case 'datepicker':
        return (
          <div className="mb-6">
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

      case 'file':
        return (
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleInputChange(field.id, file.name);
                }
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            />
          </div>
        );

      case 'number':
        return (
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              placeholder={field.placeholder || 'Enter number'}
              value={value || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            />
          </div>
        );

      case 'termsandconditions':
        return (
          <div className="mb-6">
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-48 overflow-y-auto mb-3">
              <p className="text-sm text-gray-700">
                By submitting this form, you agree to the terms and conditions...
              </p>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleInputChange(field.id, e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                required={field.required}
              />
              <span className="text-gray-700">
                I agree to the terms and conditions {field.required && <span className="text-red-500">*</span>}
              </span>
            </label>
          </div>
        );

      // Default case for text, shorttext, and other simple inputs
      default:
        return (
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || 'Enter your response...'}
              value={value || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600">{error || 'This form does not exist or is not available.'}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your response has been submitted successfully.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            {form.fields.map((field) => (
              <div key={field.id}>
                {renderField(field)}
              </div>
            ))}

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>

          {/* Branding */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Powered by <span className="font-semibold text-blue-600">Pabbly Form Builder</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicFormView;
