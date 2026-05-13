import { EventEmitter } from 'events';

const notifier = new EventEmitter();
notifier.setMaxListeners(0);

export { notifier };
