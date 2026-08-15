import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';

function RequestQuotation() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const onSubmit = async (data) => {
  setErrorMessage(null);
  try {
    const response = await api.post('/quotes', {
      customerId: 1, // temporary — will come from auth later
      name: data.name,
      phone: data.phone,
      email: data.email,
      power: data.power,
      backup: data.backup,
      phase: data.phase,
    });
    setSubmittedRequest(response.data);
    reset();
  } catch (error) {
    if (error.response?.status === 409) {
      setErrorMessage(error.response.data.error);
    } else {
      setErrorMessage('Something went wrong submitting your request. Please try again.');
    }
    console.error(error);
    }
  };

  if (submittedRequest) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-green-700 mb-2">Request Submitted!</h2>
        <p className="text-gray-600 mb-4">Save this code to track your request:</p>
        <div className="bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg py-4 px-6 text-2xl font-mono font-bold text-blue-700">
          {submittedRequest.uniqueCode}
        </div>
        <button
          onClick={() => setSubmittedRequest(null)}
          className="mt-6 text-blue-600 hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Request a Quotation</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            {...register('phone', {
              required: 'Phone number is required',
              pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit number' },
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Power Requirement (e.g. 3kVA)</label>
          <input
            {...register('power', { required: 'Power is required' })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.power && <p className="text-red-600 text-sm mt-1">{errors.power.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Backup Duration (e.g. 4 hours)</label>
          <input
            {...register('backup', { required: 'Backup duration is required' })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.backup && <p className="text-red-600 text-sm mt-1">{errors.backup.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phase</label>
          <select
            {...register('phase', { required: 'Phase is required' })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select phase</option>
            <option value="Single">Single</option>
            <option value="Three">Three</option>
          </select>
          {errors.phase && <p className="text-red-600 text-sm mt-1">{errors.phase.message}</p>}
        </div>

        {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}

export default RequestQuotation;