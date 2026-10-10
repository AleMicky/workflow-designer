# Miky Flow

Editor visual de procesos construido con React 19, TypeScript y Zustand. El
canvas es independiente del catálogo BPMN: los elementos disponibles, sus
handles y sus propiedades provienen de un registro extensible.

## Desarrollo

```bash
bun install
bun run dev
```

Validación completa:

```bash
bun run build
bun run lint
bun run test
```

## Registro BPMN

Las definiciones estándar viven en `src/lib/flow/bpmn/definitions`. La paleta,
el renderizador de nodos y el panel de propiedades leen el mismo registro, por
lo que añadir un elemento no requiere agregar condiciones en `FlowCanvas`.

Una aplicación puede extender el catálogo antes de construir sus tipos de nodo:

```ts
import {
    createBpmnNodeTypes,
    createStandardBpmnRegistry,
} from './lib/flow';

const registry = createStandardBpmnRegistry();

registry.register({
    type: 'customTask',
    bpmnType: 'bpmn:task',
    category: 'activities',
    label: 'Tarea personalizada',
    description: 'Ejemplo de extensión definida por la aplicación.',
    icon: '◆',
    color: '#0f766e',
    handles: [
        { id: 'input', type: 'target', position: 'left' },
        { id: 'output', type: 'source', position: 'right' },
    ],
    properties: [
        { key: 'label', label: 'Nombre', control: 'text' },
    ],
    defaultData: { label: 'Tarea personalizada' },
});

const nodeTypes = createBpmnNodeTypes(registry);
```

Las decisiones de negocio y las etiquetas de las salidas se declaran en la
aplicación mediante `label`; el núcleo no interpreta identificadores como
`approved`, `rejected` o cualquier otro valor particular de un proceso.

## Documento interno y JSON

El documento versionado mantiene separados el modelo del proceso, su geometría
y el estado del editor:

```ts
const document = createBpmnDocumentFromFlow({
    process: { id: 'process-1', name: 'Mi proceso' },
    nodes,
    edges,
    viewport,
});

const json = serializeBpmnDocument(document);
const restoredDocument = parseBpmnDocument(json);
const snapshot = createFlowSnapshotFromBpmnDocument(restoredDocument);
```

`replaceFlow(snapshot)` permite cargar el resultado en el store sin mezclar la
serialización BPMN con los componentes visuales.

La barra superior permite crear un proceso, abrir un documento JSON y guardar
el estado actual. Los cambios pendientes se identifican en la interfaz y el
editor avisa antes de cerrar o reemplazar un proceso sin guardar.

El panel derecho muestra las propiedades generales del proceso cuando no hay
una selección. Al seleccionar un `sequenceFlow` permite configurar su nombre,
expresión condicional y si representa la ruta predeterminada del gateway.

## Validación extensible

```ts
const validator = createStandardBpmnValidator(registry);
const report = validator.validate(document);
```

Las reglas estándar comprueban identidad del proceso, tipos registrados,
propiedades obligatorias, eventos de inicio, referencias y handles de las
conexiones, geometría, alcanzabilidad y condiciones de compuertas exclusivas.
Se pueden registrar reglas adicionales mediante `validator.register(rule)`.
