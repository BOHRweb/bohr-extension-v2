"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBlockTracker = void 0;
const safe_event_emitter_1 = __importDefault(require("@metamask/safe-event-emitter"));
const sec = 1000;
const calculateSum = (accumulator, currentValue) => accumulator + currentValue;
const blockTrackerEvents = ['sync', 'latest'];
class BaseBlockTracker extends safe_event_emitter_1.default {
    constructor(opts = {}) {
        super();
        // config
        this._blockResetDuration = opts.blockResetDuration || 20 * sec;
        // state
        this._currentBlock = null;
        this._isRunning = false;
        // bind functions for internal use
        this._onNewListener = this._onNewListener.bind(this);
        this._onRemoveListener = this._onRemoveListener.bind(this);
        this._resetCurrentBlock = this._resetCurrentBlock.bind(this);
        // listen for handler changes
        this._setupInternalEvents();
    }
    isRunning() {
        return this._isRunning;
    }
    getCurrentBlock() {
        return this._currentBlock;
    }
    async getLatestBlock() {
        // return if available
        if (this._currentBlock) {
            return this._currentBlock;
        }
        // wait for a new latest block
        const latestBlock = await new Promise((resolve) => this.once('latest', resolve));
        // return newly set current block
        return latestBlock;
    }
    // dont allow module consumer to remove our internal event listeners
    removeAllListeners(eventName) {
        // perform default behavior, preserve fn arity
        if (eventName) {
            super.removeAllListeners(eventName);
        }
        else {
            super.removeAllListeners();
        }
        // re-add internal events
        this._setupInternalEvents();
        // trigger stop check just in case
        this._onRemoveListener();
        return this;
    }
    /**
     * To be implemented in subclass.
     */
    _start() {
        // default behavior is noop
    }
    /**
     * To be implemented in subclass.
     */
    _end() {
        // default behavior is noop
    }
    _setupInternalEvents() {
        // first remove listeners for idempotence
        this.removeListener('newListener', this._onNewListener);
        this.removeListener('removeListener', this._onRemoveListener);
        // then add them
        this.on('newListener', this._onNewListener);
        this.on('removeListener', this._onRemoveListener);
    }
    _onNewListener(eventName) {
        // `newListener` is called *before* the listener is added
        if (blockTrackerEvents.includes(eventName)) {
            this._maybeStart();
        }
    }
    _onRemoveListener() {
        // `removeListener` is called *after* the listener is removed
        if (this._getBlockTrackerEventCount() > 0) {
            return;
        }
        this._maybeEnd();
    }
    _maybeStart() {
        if (this._isRunning) {
            return;
        }
        this._isRunning = true;
        // cancel setting latest block to stale
        this._cancelBlockResetTimeout();
        this._start();
    }
    _maybeEnd() {
        if (!this._isRunning) {
            return;
        }
        this._isRunning = false;
        this._setupBlockResetTimeout();
        this._end();
    }
    _getBlockTrackerEventCount() {
        return blockTrackerEvents
            .map((eventName) => this.listenerCount(eventName))
            .reduce(calculateSum);
    }
    _newPotentialLatest(newBlock) {
        const currentBlock = this._currentBlock;
        // only update if blok number is higher
        if (currentBlock && (hexToInt(newBlock) <= hexToInt(currentBlock))) {
            return;
        }
        this._setCurrentBlock(newBlock);
    }
    _setCurrentBlock(newBlock) {
        const oldBlock = this._currentBlock;
        this._currentBlock = newBlock;
        this.emit('latest', newBlock);
        this.emit('sync', { oldBlock, newBlock });
    }
    _setupBlockResetTimeout() {
        // clear any existing timeout
        this._cancelBlockResetTimeout();
        // clear latest block when stale
        this._blockResetTimeout = setTimeout(this._resetCurrentBlock, this._blockResetDuration);
        // nodejs - dont hold process open
        if (this._blockResetTimeout.unref) {
            this._blockResetTimeout.unref();
        }
    }
    _cancelBlockResetTimeout() {
        if (this._blockResetTimeout) {
            clearTimeout(this._blockResetTimeout);
        }
    }
    _resetCurrentBlock() {
        this._currentBlock = null;
    }
}
exports.BaseBlockTracker = BaseBlockTracker;
function hexToInt(hexInt) {
    return Number.parseInt(hexInt, 16);
}
//# sourceMappingURL=BaseBlockTracker.js.map