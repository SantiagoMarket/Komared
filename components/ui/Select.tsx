import { IconChevron } from './Icons'

export function Select({ value, onChange, children }: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-[#587546]/30 focus:border-[#587546] transition-colors"
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
        <IconChevron />
      </div>
    </div>
  )
}
