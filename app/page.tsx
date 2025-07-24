'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import axios from 'axios'

type Client = {
  id: string
  name: string
  email: string
  business_name: string
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

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*')
    setClients(data || [])
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}
    const regex = /^[a-zA-Z]+(?:[-'\s][a-zA-Z]+)*$/
   
    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    }else if(form.name.length < 3){
      newErrors.name = 'Name must be at least 3 characters'
    }else if(form.name.length > 100){
      newErrors.name = 'Name must be less than 100 characters'
    }else if(!regex.test(form.name)){
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
    console.log('New errors', newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    if (!validateForm()) {
      console.log('Form is not valid', errors)
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
        fetchClients()
      } catch (error) {
        console.error('Error sending email:', error)
      }
    } else {
      if(error?.code === '23505'){
        if(error?.message.includes('email')){
          setErrors({ ...errors, email: 'Email already exists' })
        }if(error?.message.includes('business_name')){
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

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Client Onboarding</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Name"
            className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : ''}`}
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value })
              if (errors.name) setErrors({ ...errors, name: '' })
            }}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <input
            type="email"
            placeholder="Email"
            className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value })
              if (errors.email) setErrors({ ...errors, email: '' })
            }}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <input
            type="text"
            placeholder="Business Name"
            className={`w-full p-2 border rounded ${errors.business_name ? 'border-red-500' : ''}`}
            value={form.business_name}
            onChange={(e) => {
              setForm({ ...form, business_name: e.target.value })
              if (errors.business_name) setErrors({ ...errors, business_name: '' })
            }}
          />
          {errors.business_name && <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>}
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Client'}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Client List</h2>
      <ul className="space-y-2">
        {clients.map((client) => (
          <li key={client.id} className="border p-2 rounded">
            <p><strong>{client.name}</strong> ({client.email})</p>
            <p className="text-sm text-gray-600">{client.business_name}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
