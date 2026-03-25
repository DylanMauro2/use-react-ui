import { useState } from 'react'
import { Button } from './components/Button'
import { Popover, PopoverTrigger, PopoverContent } from './components/Popover/Popover'
import { Combobox } from './components/Combobox/Combobox'
import { TimeClockPicker } from './components/TimeClock/TimeClock'

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    padding: '48px 32px',
    color: '#111827',
  },
  header: {
    marginBottom: '48px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    margin: 0,
    color: '#111827',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '6px',
  },
  section: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '28px',
    marginBottom: '24px',
    maxWidth: '800px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#6b7280',
    marginBottom: '20px',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    alignItems: 'center',
  },
  label: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '16px',
    marginBottom: '8px',
  },
}

const FRUITS = [
  { id: '1', name: 'Manzana' },
  { id: '2', name: 'Banana' },
  { id: '3', name: 'Naranja' },
  { id: '4', name: 'Uva' },
  { id: '5', name: 'Mango' },
  { id: '6', name: 'Sandía' },
]

export default function App() {
  const [selected, setSelected] = useState<typeof FRUITS[0] | null>(null)

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>use-react-ui</h1>
        <p style={styles.subtitle}>Component playground</p>
      </div>

      {/* Button */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Button</div>

        <p style={styles.label}>Variants</p>
        <div style={styles.row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
        </div>

        <p style={styles.label}>Sizes</p>
        <div style={styles.row}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>

        <p style={styles.label}>Disabled</p>
        <div style={styles.row}>
          <Button disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>Disabled</Button>
        </div>
      </div>

      {/* Popover */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Popover</div>

        <p style={styles.label}>Default trigger</p>
        <div style={styles.row}>
          <Popover>
            <PopoverTrigger>Open popover</PopoverTrigger>
            <PopoverContent>
              <p style={{ margin: 0, fontSize: '14px' }}>Hello from the popover!</p>
            </PopoverContent>
          </Popover>
        </div>

        <p style={styles.label}>asChild — using Button as trigger</p>
        <div style={styles.row}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">Open with Button</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '14px' }}>Options</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '4px 0' }}>Edit</button>
                <button style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#ef4444', padding: '4px 0' }}>Delete</button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Combobox */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Combobox</div>

        <p style={styles.label}>No controlado</p>
        <div style={{ maxWidth: '280px' }}>
          <Combobox
            items={FRUITS}
            getItemId={item => item.id}
            renderItem={item => item.name}
            label="Fruta"
            showClear
          />
        </div>

        <p style={styles.label}>Controlado</p>
        <div style={{ maxWidth: '280px' }}>
          <Combobox
            items={FRUITS}
            getItemId={item => item.id}
            renderItem={item => item.name}
            label="Fruta (controlado)"
            value={selected}
            onValueChange={setSelected}
            showClear
          />
          {selected && (
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
              Seleccionado: <strong>{selected.name}</strong>
            </p>
          )}
        </div>

        <p style={styles.label}>Con error</p>
        <div style={{ maxWidth: '280px' }}>
          <Combobox
            items={FRUITS}
            getItemId={item => item.id}
            renderItem={item => item.name}
            label="Fruta"
            error="Este campo es requerido"
          />
        </div>
      </div>

      {/* TimeClock */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>TimeClock</div>

        <p style={styles.label}>Sin valor</p>
        <div style={{ maxWidth: '220px' }}>
          <TimeClockPicker label="Hora" />
        </div>

        <p style={styles.label}>Con valor inicial</p>
        <div style={{ maxWidth: '220px' }}>
          <TimeClockPicker label="Hora" value="09:30 AM" onValueChange={() => {}} />
        </div>

        <p style={styles.label}>Con error</p>
        <div style={{ maxWidth: '220px' }}>
          <TimeClockPicker label="Hora" error="Este campo es requerido" />
        </div>

        <p style={styles.label}>Disabled</p>
        <div style={{ maxWidth: '220px' }}>
          <TimeClockPicker label="Hora" value="02:00 PM" disabled />
        </div>
      </div>
    </div>
  )
}
