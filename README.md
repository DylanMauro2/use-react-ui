# use-react-ui

Libreria de componentes UI para React, lista para usar. Sin configuracion extra, sin theming complejo — llega e importa.

Inspirada en Material UI pero sin la sobrecarga. Los componentes vienen con estilos y comportamiento incluidos, pensados para que puedas construir interfaces rapido sin tener que tomar decisiones de diseno desde cero.

## Instalacion

```bash
npm install use-react-ui
```

## Uso

```tsx
import { Button } from 'use-react-ui'

function App() {
  return <Button variant="primary">Guardar</Button>
}
```

## Componentes disponibles

| Componente | Descripcion |
|---|---|
| `Button` | Boton con variantes de estilo y estados |

> Mas componentes en desarrollo.

## Filosofia

- **Listo para usar**: cada componente trae sus estilos incorporados
- **Sin configuracion**: no necesitas un provider, un tema ni setup inicial
- **Pragmatico**: cubre los casos de uso comunes sin sobre-abstraer

## Desarrollo

```bash
npm install
npm run dev    # modo desarrollo
npm run build  # compilar la libreria
```

## Requisitos

- React >= 18
