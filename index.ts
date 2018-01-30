import 'rxjs/add/observable/from';
import 'rxjs/add/observable/interval';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { setTimeout } from 'timers';
import { Input } from './Input';
import { NodeBase } from './NodeBase';
import { NodeTest } from './NodeTest';
import { Output } from './Output';
import { Runtime } from './Runtime';

class SingleValue extends NodeBase<{ value: number }> {
    @Output()
    value = new BehaviorSubject(this.config.value);
}

// tslint:disable-next-line:max-classes-per-file
class ConsoleNode extends NodeBase {
    @Input()
    value: Observable<any>;

    private subscription: Subscription;

    init() {
        this.subscription = this.value.subscribe(v => console.log(v));
    }

    async close() {
        await delay(1000);
        this.subscription.unsubscribe();
    }
}

async function delay(time: number) {
    await new Promise(resolve => setTimeout(resolve, time));
}

async function test() {

    const runtime = new Runtime();
    const flow = runtime.loadFlow({
        name: 'test flow 1',
        nodes: [
            {
                id: '1',
                type: 'sum',
            },
            {
                id: '2',
                type: 'value',
                config: { value: 1 },
            },
            {
                id: '3',
                type: 'value',
                config: { value: 2 },
            },
            {
                id: '4',
                type: 'console',
            },
        ],
        connections: [
            { id: 'con1', fromNodeId: '2', fromOutput: 'value', toNodeId: '1', toInput: 'a' },
            { id: 'con2', fromNodeId: '3', fromOutput: 'value', toNodeId: '1', toInput: 'b' },
            { id: 'con3', fromNodeId: '1', fromOutput: 'sum', toNodeId: '4', toInput: 'value' },
        ],
    });
    runtime.registerNode('console', ConsoleNode);
    runtime.registerNode('sum', NodeTest);
    runtime.registerNode('value', SingleValue);

    console.log('starting');
    await flow.start();
    console.log('started');

    await delay(500);

    console.log('stopping');
    await flow.stop();
    console.log('stopped');
}

test();
