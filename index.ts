import { NodeTest } from './NodeTest';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/interval'
import { setTimeout } from 'timers';

async function test() {
    let node = new NodeTest();

    node.setInput('a', Observable.interval(1000));
    node.setInput('b', Observable.from([5]));
    node.getOutput('sum').subscribe(result => console.log(result));

    await new Promise(resolve => setTimeout(resolve, 5000));

    await node.close();
}

test();