import { Node } from './NodeBase';

export interface Dictionary<T> {
    [key: string]: T;
}

export interface FlowConfiguration {
    name: string;
    nodes: NodeConfiguration[];
    connections: ConnectionConfiguration[];
}

export interface ConnectionConfiguration {
    id: string;
    fromNodeId: string;
    fromOutput: string;
    toNodeId: string;
    toInput: string;
}

export interface NodeConfiguration {
    id: string;
    type: string;
    config?: any;
}

export interface NodeConstructor<TConfig = any> {
    new(id: string, config: TConfig): Node<TConfig>;
}
