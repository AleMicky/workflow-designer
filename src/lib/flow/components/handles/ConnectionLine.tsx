import { useFlowStore } from '../../store/flow.store';

export function ConnectionLine() {
    const connection = useFlowStore(
        (state) => state.connection,
    );

    if (!connection) return null;

    const { start, end } = connection;

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    let path: string;

    if (dx >= 0) {
        const offset = Math.max(dx / 2, 40);
        path = `M ${start.x} ${start.y} C ${start.x + offset} ${start.y}, ${end.x - offset} ${end.y}, ${end.x} ${end.y}`;
    } else {
        const offset = Math.max(Math.min(Math.abs(dy) / 2, 80), 50);
        path = `M ${start.x} ${start.y} C ${start.x + offset} ${start.y}, ${end.x - offset} ${end.y}, ${end.x} ${end.y}`;
    }

    return (
        <path
            d={path}
            fill="none"
            stroke="#2563eb"
            strokeWidth={2}
            strokeDasharray="6 4"
            markerEnd="url(#flow-arrow-connecting)"
            pointerEvents="none"
        />
    );
}