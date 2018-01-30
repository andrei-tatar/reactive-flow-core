import { Flow } from './Flow';
import { NodeBase } from './NodeBase';
import { Dictionary, FlowConfiguration, NodeConstructor } from './Types';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import 'rxjs/add/operator/first';

export class Runtime {
    private readonly _registeredNodes = new ReplaySubject<{ type: string, ctor: NodeConstructor }>();

    registerNode(type: string, ctor: NodeConstructor) {
        this._registeredNodes.next({ type, ctor });
    }

    loadFlow(flow: FlowConfiguration) {
        return new Flow(this, flow);
    }

    getInstance(nodeType: string, id: string, config: any): Observable<NodeBase> {
        return this._registeredNodes
            .first(r => r.type === nodeType)
            .map(r => new r.ctor(id, config));
    }
}
