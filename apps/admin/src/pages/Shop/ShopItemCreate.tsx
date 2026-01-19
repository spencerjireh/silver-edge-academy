import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { useCreateShopItem } from '@/hooks/queries/useShop'
import type { ShopItemCategory } from '@/services/api/shop'

const categoryOptions: { value: ShopItemCategory; label: string }[] = [
  { value: 'avatar_pack', label: 'Avatar Pack' },
  { value: 'ui_theme', label: 'UI Theme' },
  { value: 'editor_theme', label: 'Editor Theme' },
  { value: 'teacher_reward', label: 'Teacher Reward' },
]

export default function ShopItemCreate() {
  const navigate = useNavigate()
  const createItem = useCreateShopItem()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'avatar_pack' as ShopItemCategory,
    price: 100,
    status: 'enabled' as 'enabled' | 'disabled',
    gradientFrom: '#6366f1',
    gradientTo: '#4f46e5',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (formData.price < 0) newErrors.price = 'Price must be 0 or greater'
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    try {
      await createItem.mutateAsync(formData)
      navigate('/admin/shop')
    } catch {
      setErrors({ submit: 'Failed to create item' })
    }
  }

  const showAppearance = formData.category !== 'teacher_reward'

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <FormSection title="Item Information">
          <FormField label="Name" required error={errors.name}>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Ocean Theme"
              error={!!errors.name}
            />
          </FormField>
          <FormField label="Description">
            <Input
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="A brief description of the item"
            />
          </FormField>
        </FormSection>

        {/* Category */}
        <FormSection title="Category">
          <FormField label="Item Type">
            <Select value={formData.category} onChange={(e) => handleChange('category', e.target.value)}>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </FormField>
        </FormSection>

        {/* Appearance */}
        {showAppearance && (
          <FormSection title="Appearance" description="Set the gradient colors for this item.">
            <FormField label="Gradient Start">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.gradientFrom}
                  onChange={(e) => handleChange('gradientFrom', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={formData.gradientFrom}
                  onChange={(e) => handleChange('gradientFrom', e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </FormField>
            <FormField label="Gradient End">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.gradientTo}
                  onChange={(e) => handleChange('gradientTo', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={formData.gradientTo}
                  onChange={(e) => handleChange('gradientTo', e.target.value)}
                  placeholder="#4f46e5"
                  className="flex-1"
                />
              </div>
            </FormField>
            <div className="mt-2">
              <p className="text-sm text-slate-500 mb-2">Preview</p>
              <div
                className="h-16 rounded-lg"
                style={{ background: `linear-gradient(135deg, ${formData.gradientFrom}, ${formData.gradientTo})` }}
              />
            </div>
          </FormSection>
        )}

        {/* Pricing */}
        <FormSection title="Pricing">
          <FormField label="Price (coins)" required error={errors.price}>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
              min={0}
              error={!!errors.price}
            />
          </FormField>
        </FormSection>

        {/* Availability */}
        <FormSection title="Availability">
          <div className="flex items-center gap-4">
            {(['enabled', 'disabled'] as const).map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-4 h-4 text-accent-600 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-700 capitalize">{status}</span>
              </label>
            ))}
          </div>
        </FormSection>

        {/* Actions */}
        {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/admin/shop">
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" isLoading={createItem.isPending}>Create Item</Button>
        </div>
      </form>
    </div>
  )
}
