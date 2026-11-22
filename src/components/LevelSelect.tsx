interface LevelSelectProps {
  value: number
  onChange: (level: number) => void
  includeAll?: boolean
}

export function LevelSelect({ value, onChange, includeAll = false }: LevelSelectProps) {
  return (
    <label className="level-picker">
      <span className="sr-only">Chọn cấp HSK</span>
      <select value={value} onChange={(event) => onChange(Number(event.target.value))}>
        {includeAll && <option value={0}>Tất cả cấp</option>}
        {[1, 2, 3, 4, 5, 6].map((level) => <option key={level} value={level}>HSK {level}</option>)}
      </select>
    </label>
  )
}
