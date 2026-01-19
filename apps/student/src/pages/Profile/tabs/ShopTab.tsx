import { useState } from 'react'
import { ShoppingBag, Coins, Check } from 'lucide-react'
import { CURRENCY_NAME } from '@silveredge/shared'
import { useShopItems, usePurchaseItem } from '@/hooks/queries/useShop'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { CoinDisplay } from '@/components/ui/CoinDisplay'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import type { StudentShopItem } from '@/types/student'

type Category = 'avatar_pack' | 'ui_theme' | 'editor_theme' | 'teacher_reward'

const categories: { value: Category; label: string }[] = [
  { value: 'avatar_pack', label: 'Avatars' },
  { value: 'ui_theme', label: 'UI Themes' },
  { value: 'editor_theme', label: 'Editor' },
  { value: 'teacher_reward', label: 'Rewards' },
]

interface ShopTabProps {
  balance: number
}

export function ShopTab({ balance }: ShopTabProps) {
  const { data: items, isLoading } = useShopItems()
  const purchaseMutation = usePurchaseItem()
  const { addToast } = useToast()

  const [selectedItem, setSelectedItem] = useState<StudentShopItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('avatar_pack')

  const handlePurchase = async () => {
    if (!selectedItem) return

    try {
      await purchaseMutation.mutateAsync(selectedItem.id)
      addToast({ type: 'success', message: `Purchased ${selectedItem.name}!` })
      setSelectedItem(null)
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Purchase failed',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const filteredItems = items?.filter((item) => item.category === activeCategory) || []

  return (
    <div className="space-y-4">
      {/* Balance display */}
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-100">
        <span className="font-medium text-slate-700">Your {CURRENCY_NAME}</span>
        <CoinDisplay amount={balance} size="lg" />
      </div>

      {/* Category tabs */}
      <Tabs defaultValue="avatar_pack" onChange={(v) => setActiveCategory(v as Category)}>
        <TabsList className="mb-4">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.value} value={cat.value}>
            {filteredItems.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No items available in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <ShopItemCard
                    key={item.id}
                    item={item}
                    balance={balance}
                    onSelect={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Purchase modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Purchase Item"
        size="sm"
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Item preview */}
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{
                  background: selectedItem.previewData
                    ? `linear-gradient(135deg, ${selectedItem.previewData.gradientFrom}, ${selectedItem.previewData.gradientTo})`
                    : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                }}
              >
                <ShoppingBag className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">{selectedItem.name}</h3>
              {selectedItem.description && (
                <p className="text-sm text-slate-500 mt-1">{selectedItem.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-700">Price</span>
              <CoinDisplay amount={selectedItem.price} size="lg" />
            </div>

            {/* Balance check */}
            {balance < selectedItem.price && (
              <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
                You need {selectedItem.price - balance} more {CURRENCY_NAME.toLowerCase()} to purchase this item.
              </div>
            )}

            {selectedItem.isOwned && (
              <div className="p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
                <Check className="w-4 h-4" />
                You already own this item!
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setSelectedItem(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handlePurchase}
                isLoading={purchaseMutation.isPending}
                disabled={balance < selectedItem.price || selectedItem.isOwned}
                className="flex-1"
              >
                <Coins className="w-4 h-4 mr-1" />
                Buy
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

interface ShopItemCardProps {
  item: StudentShopItem
  balance: number
  onSelect: () => void
}

function ShopItemCard({ item, balance, onSelect }: ShopItemCardProps) {
  const canAfford = balance >= item.price

  return (
    <div
      onClick={onSelect}
      className={cn(
        'rounded-2xl crystal-glass p-4 cursor-pointer',
        'transition-all duration-200 crystal-refract',
        item.isOwned && 'opacity-60'
      )}
    >
      {/* Item preview */}
      <div
        className="w-full aspect-square rounded-xl mb-3 flex items-center justify-center"
        style={{
          background: item.previewData
            ? `linear-gradient(135deg, ${item.previewData.gradientFrom}, ${item.previewData.gradientTo})`
            : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        }}
      >
        {item.isOwned && (
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-emerald-500" />
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="font-semibold text-slate-800 truncate text-sm">{item.name}</h3>

      <div className="flex items-center justify-between mt-2">
        <CoinDisplay amount={item.price} size="sm" />
        {!canAfford && !item.isOwned && (
          <Badge variant="warning" size="sm">Need more</Badge>
        )}
        {item.isOwned && (
          <Badge variant="success" size="sm">Owned</Badge>
        )}
      </div>
    </div>
  )
}
