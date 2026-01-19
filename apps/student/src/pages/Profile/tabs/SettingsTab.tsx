import { LogOut, Palette, Bell, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface SettingsTabProps {
  onLogout: () => void
}

export function SettingsTab({ onLogout }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Preferences */}
      <div>
        <h3 className="font-display font-semibold text-slate-800 text-lg mb-4">
          Preferences
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Palette className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Theme</p>
                <p className="text-sm text-slate-500">Choose your preferred theme</p>
              </div>
            </div>
            <Badge variant="default">Default</Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Notifications</p>
                <p className="text-sm text-slate-500">Manage notification settings</p>
              </div>
            </div>
            <Badge variant="success">On</Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Sound Effects</p>
                <p className="text-sm text-slate-500">Enable or disable sounds</p>
              </div>
            </div>
            <Badge variant="default">Off</Badge>
          </div>
        </div>
      </div>

      {/* Account */}
      <div>
        <h3 className="font-display font-semibold text-slate-800 text-lg mb-4">
          Account
        </h3>
        <div className="space-y-3">
          <Button
            variant="danger"
            className="w-full justify-center"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
}
