import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function CreateJobForm({ onSubmit }) {
  return (
    <div className="glass p-8">
      <h2 className="text-2xl font-bold mb-6">Create Job</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input placeholder="Job title" required />
        <Textarea placeholder="Description" required />
        <Input placeholder="Freelancer address" required />
        <Button type="submit" className="w-full">Create Job</Button>
      </form>
    </div>
  )
}
