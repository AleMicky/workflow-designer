import {
    useMemo,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
} from 'react';

import {
    createBpmnDocumentFromFlow,
    createFlowSnapshotFromBpmnDocument,
} from '../../bpmn/model/bpmn-document.adapter';
import type { BpmnElementRegistry } from '../../bpmn/registry/BpmnElementRegistry';
import {
    parseBpmnDocument,
    serializeBpmnDocument,
} from '../../bpmn/serialization/bpmn-json';
import { createStandardBpmnValidator } from '../../bpmn/validation';
import { useFlowStore } from '../../store/flow.store';

interface BpmnDocumentActionsProps {
    registry: BpmnElementRegistry;
}

interface ActionNotice {
    tone: 'success' | 'error';
    message: string;
}

function createFileName(processId: string): string {
    const safeId = processId
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${safeId || 'bpmn-process'}.miky-flow.json`;
}

export function BpmnDocumentActions({ registry }: BpmnDocumentActionsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [notice, setNotice] = useState<ActionNotice | null>(null);
    const isDirty = useFlowStore((state) => state.isDirty);
    const validator = useMemo(
        () => createStandardBpmnValidator(registry),
        [registry],
    );

    useEffect(() => {
        if (!isDirty) return;

        const warnAboutUnsavedChanges = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };

        window.addEventListener('beforeunload', warnAboutUnsavedChanges);
        return () => window.removeEventListener('beforeunload', warnAboutUnsavedChanges);
    }, [isDirty]);

    const createCurrentDocument = () => {
        const { process, nodes, edges, viewport } = useFlowStore.getState();

        return createBpmnDocumentFromFlow({
            process,
            nodes,
            edges,
            viewport,
        });
    };

    const handleSave = () => {
        const document = createCurrentDocument();
        const report = validator.validate(document);

        if (
            !report.valid
            && !window.confirm(
                `El proceso tiene ${report.errors.length} errores. ¿Deseas guardar el JSON de todos modos?`,
            )
        ) {
            return;
        }

        const blob = new Blob(
            [serializeBpmnDocument(document)],
            { type: 'application/json' },
        );
        const url = URL.createObjectURL(blob);
        const anchor = window.document.createElement('a');

        anchor.href = url;
        anchor.download = createFileName(document.process.id);
        anchor.click();
        URL.revokeObjectURL(url);

        useFlowStore.getState().markSaved();

        setNotice({ tone: 'success', message: 'Proceso guardado.' });
    };

    const handleOpen = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        try {
            const document = parseBpmnDocument(await file.text());
            const snapshot = createFlowSnapshotFromBpmnDocument(document);
            const report = validator.validate(document);

            useFlowStore.getState().replaceFlow(snapshot);
            useFlowStore.getState().markSaved();

            setNotice({
                tone: report.valid ? 'success' : 'error',
                message: report.valid
                    ? `Se abrió “${document.process.name}”.`
                    : `Proceso abierto con ${report.errors.length} errores.`,
            });
        } catch (error) {
            setNotice({
                tone: 'error',
                message: error instanceof Error
                    ? error.message
                    : 'No se pudo abrir el archivo.',
            });
        }
    };

    const handleNew = () => {
        const state = useFlowStore.getState();

        if (
            (state.nodes.length > 0 || state.edges.length > 0)
            && !window.confirm('Se reemplazará el proceso actual. ¿Deseas continuar?')
        ) {
            return;
        }

        const suffix = globalThis.crypto?.randomUUID?.().slice(0, 8)
            ?? Date.now().toString(36);
        const startNode = registry.createNode('startEvent', {
            id: `start-${suffix}`,
            position: { x: 360, y: 200 },
        });

        state.replaceFlow({
            process: {
                id: `process-${suffix}`,
                name: 'Proceso sin título',
                targetNamespace: 'urn:miky-flow:process',
                version: '1.0',
                executable: true,
            },
            nodes: [startNode],
            edges: [],
            viewport: { x: 0, y: 0, zoom: 1 },
        });

        setNotice({ tone: 'success', message: 'Nuevo proceso creado.' });
    };

    const handleRequestOpen = () => {
        if (
            isDirty
            && !window.confirm(
                'Hay cambios sin guardar. ¿Deseas abrir otro proceso y descartarlos?',
            )
        ) {
            return;
        }

        fileInputRef.current?.click();
    };

    return (
        <div className="bpmn-document-actions">
            <div className="bpmn-document-actions__buttons">
                <button type="button" onClick={handleNew}>
                    Nuevo
                </button>
                <button
                    type="button"
                    onClick={handleRequestOpen}
                >
                    Abrir JSON
                </button>
                {isDirty && (
                    <span className="bpmn-document-actions__dirty">
                        Cambios sin guardar
                    </span>
                )}
                <button
                    type="button"
                    className="bpmn-document-actions__primary"
                    onClick={handleSave}
                >
                    Guardar JSON
                </button>
            </div>

            <input
                ref={fileInputRef}
                className="bpmn-document-actions__file"
                type="file"
                accept=".json,.miky-flow.json,application/json"
                onChange={handleOpen}
            />

            {notice && (
                <button
                    type="button"
                    className={`bpmn-document-actions__notice bpmn-document-actions__notice--${notice.tone}`}
                    onClick={() => setNotice(null)}
                    aria-label="Cerrar notificación"
                >
                    {notice.message}
                </button>
            )}
        </div>
    );
}
