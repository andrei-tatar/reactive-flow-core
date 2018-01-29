import 'rxjs/add/observable/from';
import 'rxjs/add/observable/interval';
import { Observable } from 'rxjs/Observable';
import { setTimeout } from 'timers';
import { NodeTest } from './NodeTest';

async function test() {
    const node = new NodeTest();

    await node.init();

    node.setInput('a', Observable.interval(1000));
    node.setInput('b', Observable.from([5]));
    node.getOutput('sum').subscribe(result => console.log(result));
    node.inputs.subscribe(console.log.bind(console, 'input: '));
    node.outputs.subscribe(console.log.bind(console, 'output: '));

    await new Promise(resolve => setTimeout(resolve, 5000));

    await node.close();
}

test();
