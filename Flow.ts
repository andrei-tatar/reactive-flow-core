import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/race';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NodeBase } from './NodeBase';
import { Runtime } from './Runtime';
import { ConnectionConfiguration, Dictionary, FlowConfiguration, NodeConfiguration } from './Types';

export class Flow {
    private readonly _nodes = new Subject<NodeConfiguration>();
    private readonly _connections = new Subject<ConnectionConfiguration>();
    private readonly _instances: Dictionary<{ instance: Promise<NodeBase>, stop: Subject<any> }> = {};
    private _stop: Subject<any>;

    constructor(
        private readonly _runtime: Runtime,
        private readonly _configuration: FlowConfiguration,
    ) {
    }

    getConfiguration(): FlowConfiguration {
        return null;
    }

    async stopNode(id: string) {
        const node = this._instances[id];
        node.stop.next();
        node.stop.complete();

        const instance = await node.instance;
        if (instance) {
            await instance.closeInternal();
        }
        delete this._instances[id];
    }

    async stop() {
        if (!this._stop) { return; }

        const wait = this._stop
            .mergeMap(() =>
                Observable
                    .from(Object.getOwnPropertyNames(this._instances))
                    .mergeMap(id => this.stopNode(id)))
            .toPromise();

        this._stop.next();
        this._stop.complete();
        await wait;
        this._stop = null;
    }

    async start() {
        if (this._stop) { throw new Error('Flow already running'); }
        this._stop = new Subject();

        Observable
            .concat(Observable.from(this._configuration.nodes), this._nodes)
            .map(node => {
                const stop = new Subject();
                const result = {
                    id: node.id,
                    stop,
                    instance: this._runtime
                        .getInstance(node.type, node.id, node.config)
                        .takeUntil(Observable.race(stop, this._stop))
                        .mergeMap(async instance => {
                            await instance.initInternal();
                            return instance;
                        })
                        .toPromise(),
                };
                return result;
            })
            .takeUntil(this._stop)
            .subscribe(v => {
                this._instances[v.id] = { instance: v.instance, stop: v.stop };
            });

        Observable.concat(Observable.from(this._configuration.connections), this._connections)
            .mergeMap(async connection => {
                const [from, to] = await Promise.all([
                    this._instances[connection.fromNodeId].instance,
                    this._instances[connection.toNodeId].instance,
                ]);
                return { connection, from, to };
            })
            .takeUntil(this._stop)
            .map(({ connection, from, to }) => {
                if (!from || !to) {
                    // TODO: node was stopped before it was fully started
                    return null;
                }
                const output = from.getOutput(connection.fromOutput);
                to.setInput(connection.toInput, output);
                return connection.id;
            })
            .subscribe();
    }
}
