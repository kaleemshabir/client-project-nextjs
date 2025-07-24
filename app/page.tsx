'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import axios from 'axios'
import { motion } from 'framer-motion'

type Client = {
  id: string
  name: string
  email: string
  business_name: string
  created_at: string
}

type FormErrors = {
  name?: string
  email?: string
  business_name?: string
}

export default function Home() {
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState({ name: '', email: '', business_name: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    setClients(data || [])
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}
    const regex = /^[a-zA-Z]+(?:[-'\s][a-zA-Z]+)*$/
   
    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    } else if(form.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    } else if(form.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters'
    } else if(!regex.test(form.name)) {
      newErrors.name = 'Name must contain only letters, spaces, and hyphens'
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!form.business_name.trim()) {
      newErrors.business_name = 'Business name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([form])
      .select()

    if (!error && data) {
      try {
        await axios.post('/api/send-email', {
          email: form.email,
          name: form.name,
        })
        setForm({ name: '', email: '', business_name: '' })
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        fetchClients()
      } catch (error) {
        console.error('Error sending email:', error)
      }
    } else {
      if(error?.code === '23505'){
        if(error?.message.includes('email')){
          setErrors({ ...errors, email: 'Email already exists' })
        }
        if(error?.message.includes('business_name')){
          setErrors({ ...errors, business_name: 'Business name already exists' })
        }
      }
      console.error('Error adding client:', error)
    }
    
    setIsSubmitting(false)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          Client Portal
        </h1>
        
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md"
          >
            Client added successfully! An email notification has been sent.
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z" />
                </svg>
                Add New Client
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className={`w-full p-3 border bg-gray-50 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value })
                      if (errors.name) setErrors({ ...errors, name: '' })
                    }}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className={`w-full p-3 border bg-gray-50 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value })
                      if (errors.email) setErrors({ ...errors, email: '' })
                    }}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="business" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Name
                  </label>
                  <input
                    id="business"
                    type="text"
                    placeholder="Acme Inc."
                    className={`w-full p-3 border bg-gray-50 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      errors.business_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    value={form.business_name}
                    onChange={(e) => {
                      setForm({ ...form, business_name: e.target.value })
                      if (errors.business_name) setErrors({ ...errors, business_name: '' })
                    }}
                  />
                  {errors.business_name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.business_name}
                    </p>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Client
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          {/* Client List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Client Directory
              </h2>
              
              {clients.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-lg font-medium">No clients yet</p>
                  <p className="mt-1">Add your first client using the form</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clients.map((client) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">{client.name}</h3>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {client.email}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814L12 14.086l-2.419 2.728A1 1 0 018 16V4z" clipRule="evenodd" />
                            </svg>
                            {client.business_name}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                          {client.created_at && formatDate(client.created_at)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
