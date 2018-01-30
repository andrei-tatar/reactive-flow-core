import { Observable } from 'rxjs/Observable';
import { Node } from './NodeBase';

import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/map';

export class NodeTest extends Node {
    @Node.Input()
    a: Observable<number>;

    @Node.Input()
    b: Observable<number>;

    @Node.Output()
    sum = Observable.combineLatest(this.a, this.b).map(([a, b]) => a + b);
}
