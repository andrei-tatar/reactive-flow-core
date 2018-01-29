import { Observable } from 'rxjs/Observable';
import { Input } from './Input';
import { NodeBase } from './NodeBase';
import { Output } from './Output';

import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/map';

export class NodeTest extends NodeBase {
    @Input()
    a: Observable<number>;

    @Input()
    b: Observable<number>;

    @Output()
    sum = Observable.combineLatest(this.a, this.b).map(([a, b]) => a + b);
}
