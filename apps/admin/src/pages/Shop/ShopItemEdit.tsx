import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { useShopItem, useUpdateShopItem } from '@/hooks/queries/useShop'
import { useSetPageMeta } from '@/contexts/PageMetaContext'

const categoryLabels: Record<string, string> = {
  avatar_pack: 'Avatar Pack',
  ui_theme: 'UI Theme',
  editor_theme: 'Editor Theme',
  teacher_reward: 'Teacher Reward',
}

export default function ShopItemEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: item, isLoading } = useShopItem(id!)
  const updateItem = useUpdateShopItem()

  useSetPageMeta({ entityLabel: item?.name })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 100,
    status: 'enabled' as 'enabled' | 'disabled',
    gradientFrom: '#6366f1',
    gradientTo: '#4f46e5',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        status: item.status,
        gradientFrom: item.gradientFrom || '#6366f1',
        gradientTo: item.gradientTo || '#4f46e5',
      })
    }
  }, [item])

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
      await updateItem.mutateAsync({ id: id!, ...formData })
      navigate('/admin/shop')
    } catch {
      setErrors({ submit: 'Failed to update item' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Item not found</p>
        <Link to="/admin/shop" className="text-accent-600 hover:underline mt-2 inline-block">
          Back to Shop
        </Link>
      </div>
    )
  }

  const showAppearance = item.category !== 'teacher_reward'

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

        {/* Category (read-only) */}
        <FormSection title="Category">
          <FormField label="Item Type">
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
              {categoryLabels[item.category]}
            </div>
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
          <Button type="submit" isLoading={updateItem.isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  )
}
