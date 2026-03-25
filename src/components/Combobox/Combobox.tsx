import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '../Popover/Popover'
import { XIcon, ChevronDownIcon, CheckIcon } from '../../icons'
import './Combobox.css'

type ComboboxProps<Item> = {
  /** Lista de items para mostrar en el dropdown. */
  items?: Item[]
  /** Etiqueta visible encima del input. */
  label?: string
  /** Función que retorna un identificador único para cada item. */
  getItemId: (item: Item) => string | number
  /** Función que retorna el texto a mostrar dentro del dropdown para cada item. */
  renderItem: (item: Item) => string
  /**
   * Función que retorna el texto a mostrar en el input cuando el item está seleccionado.
   * Si no se provee, se usa `renderItem`.
   */
  renderSelectedItem?: (item: Item) => string
  /**
   * Función que retorna el texto por el que se filtra cada item al escribir.
   * Si no se provee, se filtra por `renderItem`.
   */
  searchTerm?: (item: Item) => string
  /** Texto cuando no hay resultados. Por defecto: "No se encontraron resultados...". */
  notFoundLabel?: string
  /** Nombre del campo para formularios. */
  name?: string
  /** Valor seleccionado (modo controlado). */
  value?: Item | null
  /** Callback al seleccionar o deseleccionar un item. */
  onValueChange?: (item: Item | null) => void
  /** Mensaje de error debajo del input. */
  error?: string
  /** Icono a la izquierda del input. */
  icon?: ReactNode
  /** Muestra botón para limpiar la selección. Por defecto: false. */
  showClear?: boolean
  /** Callback al limpiar la selección. */
  onClear?: () => void
}

export function ComboboxList({ children }: { children: ReactNode }) {
  return <ul className="combobox-list">{children}</ul>
}

type ComboboxItemProps = {
  children: ReactNode
  selected?: boolean
  onClick?: () => void
}

export function ComboboxItem({ children, selected, onClick }: ComboboxItemProps) {
  return (
    <li>
      <button
        type="button"
        className={`combobox-item${selected ? ' combobox-item--selected' : ''}`}
        onClick={onClick}
      >
        {children}
        {selected && <CheckIcon />}
      </button>
    </li>
  )
}

export function ComboboxClear({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <span role="button" className="combobox-clear" onClick={onClick}>
      <XIcon />
    </span>
  )
}

export function ComboboxNotFound({ children }: { children?: ReactNode }) {
  return <li className="combobox-not-found">{children ?? 'No se encontraron resultados...'}</li>
}

export function Combobox<Item>({
  items,
  getItemId,
  renderItem,
  error,
  label,
  name,
  notFoundLabel = 'No se encontraron resultados...',
  onValueChange,
  renderSelectedItem,
  searchTerm,
  value,
  icon,
  showClear = false,
  onClear,
}: ComboboxProps<Item>) {
  const isControlled = value !== undefined && onValueChange !== undefined
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [textValue, setTextValue] = useState('')
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isControlled && !searching) {
      setSelectedItem(value ?? null)
      if (value != null) {
        setTextValue(renderSelectedItem?.(value) ?? renderItem(value))
      } else {
        setTextValue('')
      }
    }
  }, [value, renderItem, renderSelectedItem, isControlled, searching])

  useEffect(() => {
    if (open) {
      setSearching(false)
      inputRef.current?.focus()
    }
  }, [open])

  const handleClickItem = (item: Item) => {
    const newItem = selectedItem && getItemId(item) === getItemId(selectedItem) ? null : item
    if (isControlled && onValueChange) {
      onValueChange(newItem)
    } else {
      setTextValue(newItem ? (renderSelectedItem?.(newItem) ?? renderItem(newItem)) : '')
      setSelectedItem(newItem)
    }
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedItem(null)
    setTextValue('')
    if (isControlled && onValueChange) onValueChange(null)
    onClear?.()
  }

  const filteredItems = items?.filter(i =>
    searchTerm
      ? searchTerm(i).toLowerCase().includes(textValue.toLowerCase())
      : renderItem(i).toLowerCase().includes(textValue.toLowerCase())
  ) ?? []

  const visibleItems = searching ? filteredItems : items

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="combobox-wrapper">
        {label && <label className="combobox-label">{label}</label>}
        <PopoverTrigger asChild>
          <button
            type="button"
            name={name}
            onClick={() => setOpen(true)}
            className={`combobox-trigger${open ? ' combobox-trigger--open' : ''}`}
          >
            {icon}
            <input
              ref={inputRef}
              type="text"
              value={textValue}
              autoCorrect="off"
              className="combobox-input"
              onChange={e => {
                e.stopPropagation()
                setSearching(true)
                setTextValue(e.currentTarget.value)
              }}
            />
            {showClear && selectedItem && <ComboboxClear onClick={handleClear} />}
            <ChevronDownIcon className={`combobox-chevron${open ? ' combobox-chevron--open' : ''}`} />
          </button>
        </PopoverTrigger>
        {error && (
          <span className="combobox-error">
            {Array.isArray(error) && error.length > 0 ? error[0] : error}
          </span>
        )}
      </div>
      <PopoverContent>
        <ComboboxList>
          {visibleItems?.length === 0 && (
            <ComboboxNotFound>{notFoundLabel}</ComboboxNotFound>
          )}
          {visibleItems?.map(item => (
            <ComboboxItem
              key={getItemId(item)}
              selected={!!(selectedItem && getItemId(item) === getItemId(selectedItem))}
              onClick={() => handleClickItem(item)}
            >
              {renderItem(item)}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </PopoverContent>
    </Popover>
  )
}
