import { Link } from 'react-router-dom'
import { Coins, ArrowRight } from 'lucide-react'
import { CURRENCY_NAME } from '@silveredge/shared'
import { Card } from '@/components/ui/Card'

interface CurrencyCardProps {
  balance: number
}

export function CurrencyCard({ balance }: CurrencyCardProps) {
  return (
    <Card className="relative overflow-hidden" padding="md">
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-coins-yellow/10 rounded-full" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-coins-yellow to-amber-500 rounded-xl flex items-center justify-center crystal-gem">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{CURRENCY_NAME}</p>
            <p className="text-2xl font-bold text-slate-800">{balance.toLocaleString()}</p>
          </div>
        </div>

        <Link
          to="/shop"
          className="flex items-center justify-between text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <span>Visit Shop</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Card>
  )
}
