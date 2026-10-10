import type {
    FlowPosition,
    FlowViewport,
    FlowHandleType,
} from '../../types/flow.types';

/**
 * Obtiene el canvas al que pertenece un elemento.
 */
export function getCanvas(
    element: Element,
): HTMLElement | null {
    return element.closest<HTMLElement>('.flow-canvas');
}

/**
 * Convierte coordenadas de pantalla a coordenadas
 * internas del editor.
 *
 * Tiene en cuenta:
 * - Posición del canvas
 * - Desplazamiento (pan)
 * - Escala (zoom)
 */
export function screenToFlowPosition(
    clientX: number,
    clientY: number,
    canvas: HTMLElement,
    viewport: FlowViewport,
): FlowPosition {
    const bounds = canvas.getBoundingClientRect();

    return {
        x: (clientX - bounds.left - viewport.x) / viewport.zoom,
        y: (clientY - bounds.top - viewport.y) / viewport.zoom,
    };
}

/**
 * Convierte coordenadas internas del editor
 * a coordenadas de pantalla.
 */
export function flowToScreenPosition(
    position: FlowPosition,
    canvas: HTMLElement,
    viewport: FlowViewport,
): FlowPosition {
    const bounds = canvas.getBoundingClientRect();

    return {
        x: bounds.left + viewport.x + position.x * viewport.zoom,
        y: bounds.top + viewport.y + position.y * viewport.zoom,
    };
}

/**
 * Busca un handle específico dentro del canvas.
 */
export function findHandle(
    canvas: HTMLElement,
    nodeId: string,
    handleId: string,
    type: FlowHandleType,
): HTMLElement | null {
    const handles = canvas.querySelectorAll<HTMLElement>(
        '[data-flow-handle]',
    );

    for (const handle of handles) {
        if (
            handle.dataset.nodeId === nodeId &&
            handle.dataset.handleId === handleId &&
            handle.dataset.flowHandle === type
        ) {
            return handle;
        }
    }

    return null;
}

/**
 * Obtiene la posición del centro de un handle
 * en coordenadas internas del editor.
 */
export function getHandlePosition(
    nodeId: string,
    handleId: string,
    type: FlowHandleType,
    canvas: HTMLElement,
    viewport: FlowViewport,
): FlowPosition | null {
    const handle = findHandle(
        canvas,
        nodeId,
        handleId,
        type,
    );

    if (!handle) return null;

    const rect = handle.getBoundingClientRect();

    return screenToFlowPosition(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        canvas,
        viewport,
    );
}

/**
 * Busca un handle de destino debajo del cursor.
 *
 * También permite conectar soltando el cursor
 * directamente sobre el nodo de destino.
 */
export function findTargetHandle(
    clientX: number,
    clientY: number,
    canvas: HTMLElement,
): HTMLElement | null {
    const element = document.elementFromPoint(
        clientX,
        clientY,
    );

    if (!element) {
        return null;
    }

    // Buscar directamente un handle de entrada.
    const directHandle = element.closest<HTMLElement>(
        '[data-flow-handle="target"]',
    );

    if (directHandle && canvas.contains(directHandle)) {
        return directHandle;
    }

    // Si soltamos sobre un nodo, buscar su entrada.
    const targetNode = element.closest<HTMLElement>(
        '.flow-node',
    );

    if (!targetNode || !canvas.contains(targetNode)) {
        return null;
    }

    return targetNode.querySelector<HTMLElement>(
        '[data-flow-handle="target"]',
    );
}