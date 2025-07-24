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

export default function Home() {
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState({ name: '', email: '', business_name: '' })

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*')
    setClients(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data, error } = await supabase
      .from('clients')
      .insert([form])
      .select()

      console.log(data)
      console.log(error)

    if (!error && data) {
      await axios.post('/api/send-email', {
        email: form.email,
        name: form.name,
      })
      setForm({ name: '', email: '', business_name: '' })
      fetchClients()
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Client Onboarding</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Business Name"
          className="w-full p-2 border rounded"
          value={form.business_name}
          onChange={(e) => setForm({ ...form, business_name: e.target.value })}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Client
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
