(() => {
  'use strict';
  let e,
    t,
    a,
    s,
    r,
    n = {
      googleAnalytics: 'googleAnalytics',
      precache: 'precache-v2',
      prefix: 'serwist',
      runtime: 'runtime',
      suffix: 'u' > typeof registration ? registration.scope : '',
    },
    i = (e) => [n.prefix, e, n.suffix].filter((e) => e && e.length > 0).join('-'),
    c = (e) => e || i(n.precache),
    o = (e) => e || i(n.runtime);
  class h extends Error {
    details;
    constructor(e, t) {
      (super(
        ((e, ...t) => {
          let a = e;
          return (t.length > 0 && (a += ` :: ${JSON.stringify(t)}`), a);
        })(e, t),
      ),
        (this.name = e),
        (this.details = t));
    }
  }
  function l(e) {
    return new Promise((t) => setTimeout(t, e));
  }
  let u = new Set();
  function d(e, t) {
    let a = new URL(e);
    for (let e of t) a.searchParams.delete(e);
    return a.href;
  }
  async function m(e, t, a, s) {
    let r = d(t.url, a);
    if (t.url === r) return e.match(t, s);
    let n = { ...s, ignoreSearch: !0 };
    for (let i of await e.keys(t, n)) if (r === d(i.url, a)) return e.match(i, s);
  }
  class g {
    promise;
    resolve;
    reject;
    constructor() {
      this.promise = new Promise((e, t) => {
        ((this.resolve = e), (this.reject = t));
      });
    }
  }
  let f = async () => {
      for (let e of u) await e();
    },
    p = '-precache-',
    w = async (e, t = p) => {
      let a = (await self.caches.keys()).filter(
        (a) => a.includes(t) && a.includes(self.registration.scope) && a !== e,
      );
      return (await Promise.all(a.map((e) => self.caches.delete(e))), a);
    },
    y = (e, t) => {
      let a = t();
      return (e.waitUntil(a), a);
    },
    _ = (e, t) => t.some((t) => e instanceof t),
    x = new WeakMap(),
    b = new WeakMap(),
    E = new WeakMap(),
    R = {
      get(e, t, a) {
        if (e instanceof IDBTransaction) {
          if ('done' === t) return x.get(e);
          if ('store' === t)
            return a.objectStoreNames[1] ? void 0 : a.objectStore(a.objectStoreNames[0]);
        }
        return v(e[t]);
      },
      set: (e, t, a) => ((e[t] = a), !0),
      has: (e, t) => (e instanceof IDBTransaction && ('done' === t || 'store' === t)) || t in e,
    };
  function v(e) {
    if (e instanceof IDBRequest) {
      let t;
      return (
        (t = new Promise((t, a) => {
          let s = () => {
              (e.removeEventListener('success', r), e.removeEventListener('error', n));
            },
            r = () => {
              (t(v(e.result)), s());
            },
            n = () => {
              (a(e.error), s());
            };
          (e.addEventListener('success', r), e.addEventListener('error', n));
        })),
        E.set(t, e),
        t
      );
    }
    if (b.has(e)) return b.get(e);
    let t = (function (e) {
      if ('function' == typeof e)
        return (
          r ||
          (r = [
            IDBCursor.prototype.advance,
            IDBCursor.prototype.continue,
            IDBCursor.prototype.continuePrimaryKey,
          ])
        ).includes(e)
          ? function (...t) {
              return (e.apply(q(this), t), v(this.request));
            }
          : function (...t) {
              return v(e.apply(q(this), t));
            };
      return (e instanceof IDBTransaction &&
        (function (e) {
          if (x.has(e)) return;
          let t = new Promise((t, a) => {
            let s = () => {
                (e.removeEventListener('complete', r),
                  e.removeEventListener('error', n),
                  e.removeEventListener('abort', n));
              },
              r = () => {
                (t(), s());
              },
              n = () => {
                (a(e.error || new DOMException('AbortError', 'AbortError')), s());
              };
            (e.addEventListener('complete', r),
              e.addEventListener('error', n),
              e.addEventListener('abort', n));
          });
          x.set(e, t);
        })(e),
      _(e, s || (s = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])))
        ? new Proxy(e, R)
        : e;
    })(e);
    return (t !== e && (b.set(e, t), E.set(t, e)), t);
  }
  let q = (e) => E.get(e);
  function S(e, t, { blocked: a, upgrade: s, blocking: r, terminated: n } = {}) {
    let i = indexedDB.open(e, t),
      c = v(i);
    return (
      s &&
        i.addEventListener('upgradeneeded', (e) => {
          s(v(i.result), e.oldVersion, e.newVersion, v(i.transaction), e);
        }),
      a && i.addEventListener('blocked', (e) => a(e.oldVersion, e.newVersion, e)),
      c
        .then((e) => {
          (n && e.addEventListener('close', () => n()),
            r && e.addEventListener('versionchange', (e) => r(e.oldVersion, e.newVersion, e)));
        })
        .catch(() => {}),
      c
    );
  }
  let D = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'],
    N = ['put', 'add', 'delete', 'clear'],
    C = new Map();
  function T(e, t) {
    if (!(e instanceof IDBDatabase && !(t in e) && 'string' == typeof t)) return;
    if (C.get(t)) return C.get(t);
    let a = t.replace(/FromIndex$/, ''),
      s = t !== a,
      r = N.includes(a);
    if (!(a in (s ? IDBIndex : IDBObjectStore).prototype) || !(r || D.includes(a))) return;
    let n = async function (e, ...t) {
      let n = this.transaction(e, r ? 'readwrite' : 'readonly'),
        i = n.store;
      return (s && (i = i.index(t.shift())), (await Promise.all([i[a](...t), r && n.done]))[0]);
    };
    return (C.set(t, n), n);
  }
  R = {
    ...(e = R),
    get: (t, a, s) => T(t, a) || e.get(t, a, s),
    has: (t, a) => !!T(t, a) || e.has(t, a),
  };
  let A = ['continue', 'continuePrimaryKey', 'advance'],
    P = {},
    k = new WeakMap(),
    I = new WeakMap(),
    U = {
      get(e, t) {
        if (!A.includes(t)) return e[t];
        let a = P[t];
        return (
          a ||
            (a = P[t] =
              function (...e) {
                k.set(this, I.get(this)[t](...e));
              }),
          a
        );
      },
    };
  async function* L(...e) {
    let t = this;
    if ((t instanceof IDBCursor || (t = await t.openCursor(...e)), !t)) return;
    let a = new Proxy(t, U);
    for (I.set(a, t), E.set(a, q(t)); t; )
      (yield a, (t = await (k.get(a) || t.continue())), k.delete(a));
  }
  function F(e, t) {
    return (
      (t === Symbol.asyncIterator && _(e, [IDBIndex, IDBObjectStore, IDBCursor])) ||
      ('iterate' === t && _(e, [IDBIndex, IDBObjectStore]))
    );
  }
  R = {
    ...(t = R),
    get: (e, a, s) => (F(e, a) ? L : t.get(e, a, s)),
    has: (e, a) => F(e, a) || t.has(e, a),
  };
  let M = async (e, t) => {
      let s = null;
      if ((e.url && (s = new URL(e.url).origin), s !== self.location.origin))
        throw new h('cross-origin-copy-response', { origin: s });
      let r = e.clone(),
        n = { headers: new Headers(r.headers), status: r.status, statusText: r.statusText },
        i = t ? t(n) : n,
        c = !(function () {
          if (void 0 === a) {
            let e = new Response('');
            if ('body' in e)
              try {
                (new Response(e.body), (a = !0));
              } catch {
                a = !1;
              }
            a = !1;
          }
          return a;
        })()
          ? await r.blob()
          : r.body;
      return new Response(c, i);
    },
    O = 'requests',
    W = 'queueName';
  class B {
    _db = null;
    async addEntry(e) {
      let t = (await this.getDb()).transaction(O, 'readwrite', { durability: 'relaxed' });
      (await t.store.add(e), await t.done);
    }
    async getFirstEntryId() {
      let e = await this.getDb(),
        t = await e.transaction(O).store.openCursor();
      return t?.value.id;
    }
    async getAllEntriesByQueueName(e) {
      let t = await this.getDb();
      return (await t.getAllFromIndex(O, W, IDBKeyRange.only(e))) || [];
    }
    async getEntryCountByQueueName(e) {
      return (await this.getDb()).countFromIndex(O, W, IDBKeyRange.only(e));
    }
    async deleteEntry(e) {
      let t = await this.getDb();
      await t.delete(O, e);
    }
    async getFirstEntryByQueueName(e) {
      return await this.getEndEntryFromIndex(IDBKeyRange.only(e), 'next');
    }
    async getLastEntryByQueueName(e) {
      return await this.getEndEntryFromIndex(IDBKeyRange.only(e), 'prev');
    }
    async getEndEntryFromIndex(e, t) {
      let a = await this.getDb(),
        s = await a.transaction(O).store.index(W).openCursor(e, t);
      return s?.value;
    }
    async getDb() {
      return (
        this._db ||
          (this._db = await S('serwist-background-sync', 3, { upgrade: this._upgradeDb })),
        this._db
      );
    }
    _upgradeDb(e, t) {
      (t > 0 && t < 3 && e.objectStoreNames.contains(O) && e.deleteObjectStore(O),
        e
          .createObjectStore(O, { autoIncrement: !0, keyPath: 'id' })
          .createIndex(W, W, { unique: !1 }));
    }
  }
  class K {
    _queueName;
    _queueDb;
    constructor(e) {
      ((this._queueName = e), (this._queueDb = new B()));
    }
    async pushEntry(e) {
      (delete e.id, (e.queueName = this._queueName), await this._queueDb.addEntry(e));
    }
    async unshiftEntry(e) {
      let t = await this._queueDb.getFirstEntryId();
      (t ? (e.id = t - 1) : delete e.id,
        (e.queueName = this._queueName),
        await this._queueDb.addEntry(e));
    }
    async popEntry() {
      return this._removeEntry(await this._queueDb.getLastEntryByQueueName(this._queueName));
    }
    async shiftEntry() {
      return this._removeEntry(await this._queueDb.getFirstEntryByQueueName(this._queueName));
    }
    async getAll() {
      return await this._queueDb.getAllEntriesByQueueName(this._queueName);
    }
    async size() {
      return await this._queueDb.getEntryCountByQueueName(this._queueName);
    }
    async deleteEntry(e) {
      await this._queueDb.deleteEntry(e);
    }
    async _removeEntry(e) {
      return (e && (await this.deleteEntry(e.id)), e);
    }
  }
  let j = [
    'method',
    'referrer',
    'referrerPolicy',
    'mode',
    'credentials',
    'cache',
    'redirect',
    'integrity',
    'keepalive',
  ];
  class $ {
    _requestData;
    static async fromRequest(e) {
      let t = { url: e.url, headers: {} };
      for (let a of ('GET' !== e.method && (t.body = await e.clone().arrayBuffer()),
      e.headers.forEach((e, a) => {
        t.headers[a] = e;
      }),
      j))
        void 0 !== e[a] && (t[a] = e[a]);
      return new $(t);
    }
    constructor(e) {
      ('navigate' === e.mode && (e.mode = 'same-origin'), (this._requestData = e));
    }
    toObject() {
      let e = Object.assign({}, this._requestData);
      return (
        (e.headers = Object.assign({}, this._requestData.headers)),
        e.body && (e.body = e.body.slice(0)),
        e
      );
    }
    toRequest() {
      return new Request(this._requestData.url, this._requestData);
    }
    clone() {
      return new $(this.toObject());
    }
  }
  let H = 'serwist-background-sync',
    G = new Set(),
    Q = (e) => {
      let t = { request: new $(e.requestData).toRequest(), timestamp: e.timestamp };
      return (e.metadata && (t.metadata = e.metadata), t);
    };
  class V {
    _name;
    _onSync;
    _maxRetentionTime;
    _queueStore;
    _forceSyncFallback;
    _syncInProgress = !1;
    _requestsAddedDuringSync = !1;
    constructor(e, { forceSyncFallback: t, onSync: a, maxRetentionTime: s } = {}) {
      if (G.has(e)) throw new h('duplicate-queue-name', { name: e });
      (G.add(e),
        (this._name = e),
        (this._onSync = a || this.replayRequests),
        (this._maxRetentionTime = s || 10080),
        (this._forceSyncFallback = !!t),
        (this._queueStore = new K(this._name)),
        this._addSyncListener());
    }
    get name() {
      return this._name;
    }
    async pushRequest(e) {
      await this._addRequest(e, 'push');
    }
    async unshiftRequest(e) {
      await this._addRequest(e, 'unshift');
    }
    async popRequest() {
      return this._removeRequest('pop');
    }
    async shiftRequest() {
      return this._removeRequest('shift');
    }
    async getAll() {
      let e = await this._queueStore.getAll(),
        t = Date.now(),
        a = [];
      for (let s of e) {
        let e = 60 * this._maxRetentionTime * 1e3;
        t - s.timestamp > e ? await this._queueStore.deleteEntry(s.id) : a.push(Q(s));
      }
      return a;
    }
    async size() {
      return await this._queueStore.size();
    }
    async _addRequest({ request: e, metadata: t, timestamp: a = Date.now() }, s) {
      let r = { requestData: (await $.fromRequest(e.clone())).toObject(), timestamp: a };
      switch ((t && (r.metadata = t), s)) {
        case 'push':
          await this._queueStore.pushEntry(r);
          break;
        case 'unshift':
          await this._queueStore.unshiftEntry(r);
      }
      this._syncInProgress ? (this._requestsAddedDuringSync = !0) : await this.registerSync();
    }
    async _removeRequest(e) {
      let t,
        a = Date.now();
      switch (e) {
        case 'pop':
          t = await this._queueStore.popEntry();
          break;
        case 'shift':
          t = await this._queueStore.shiftEntry();
      }
      if (t) {
        let s = 60 * this._maxRetentionTime * 1e3;
        return a - t.timestamp > s ? this._removeRequest(e) : Q(t);
      }
    }
    async replayRequests() {
      let e;
      for (; (e = await this.shiftRequest()); )
        try {
          await fetch(e.request.clone());
        } catch {
          throw (await this.unshiftRequest(e), new h('queue-replay-failed', { name: this._name }));
        }
    }
    async registerSync() {
      if ('sync' in self.registration && !this._forceSyncFallback)
        try {
          await self.registration.sync.register(`${H}:${this._name}`);
        } catch (e) {}
    }
    _addSyncListener() {
      'sync' in self.registration && !this._forceSyncFallback
        ? self.addEventListener('sync', (e) => {
            if (e.tag === `${H}:${this._name}`) {
              let t = async () => {
                let t;
                this._syncInProgress = !0;
                try {
                  await this._onSync({ queue: this });
                } catch (e) {
                  if (e instanceof Error) throw e;
                } finally {
                  (this._requestsAddedDuringSync &&
                    !(t && !e.lastChance) &&
                    (await this.registerSync()),
                    (this._syncInProgress = !1),
                    (this._requestsAddedDuringSync = !1));
                }
              };
              e.waitUntil(t());
            }
          })
        : this._onSync({ queue: this });
    }
    static get _queueNames() {
      return G;
    }
  }
  class z {
    _queue;
    constructor(e, t) {
      this._queue = new V(e, t);
    }
    async fetchDidFail({ request: e }) {
      await this._queue.pushRequest({ request: e });
    }
  }
  let J = {
    cacheWillUpdate: async ({ response: e }) => (200 === e.status || 0 === e.status ? e : null),
  };
  function X(e) {
    return 'string' == typeof e ? new Request(e) : e;
  }
  class Y {
    event;
    request;
    url;
    params;
    _cacheKeys = {};
    _strategy;
    _handlerDeferred;
    _extendLifetimePromises;
    _plugins;
    _pluginStateMap;
    constructor(e, t) {
      for (const a of ((this.event = t.event),
      (this.request = t.request),
      t.url && ((this.url = t.url), (this.params = t.params)),
      (this._strategy = e),
      (this._handlerDeferred = new g()),
      (this._extendLifetimePromises = []),
      (this._plugins = [...e.plugins]),
      (this._pluginStateMap = new Map()),
      this._plugins))
        this._pluginStateMap.set(a, {});
      this.event.waitUntil(this._handlerDeferred.promise);
    }
    async fetch(e) {
      let { event: t } = this,
        a = X(e),
        s = await this.getPreloadResponse();
      if (s) return s;
      let r = this.hasCallback('fetchDidFail') ? a.clone() : null;
      try {
        for (let e of this.iterateCallbacks('requestWillFetch'))
          a = await e({ request: a.clone(), event: t });
      } catch (e) {
        if (e instanceof Error)
          throw new h('plugin-error-request-will-fetch', { thrownErrorMessage: e.message });
      }
      let n = a.clone();
      try {
        let e;
        for (let s of ((e = await fetch(
          a,
          'navigate' === a.mode ? void 0 : this._strategy.fetchOptions,
        )),
        this.iterateCallbacks('fetchDidSucceed')))
          e = await s({ event: t, request: n, response: e });
        return e;
      } catch (e) {
        throw (
          r &&
            (await this.runCallbacks('fetchDidFail', {
              error: e,
              event: t,
              originalRequest: r.clone(),
              request: n.clone(),
            })),
          e
        );
      }
    }
    async fetchAndCachePut(e) {
      let t = await this.fetch(e),
        a = t.clone();
      return (this.waitUntil(this.cachePut(e, a)), t);
    }
    async cacheMatch(e) {
      let t,
        a = X(e),
        { cacheName: s, matchOptions: r } = this._strategy,
        n = await this.getCacheKey(a, 'read'),
        i = { ...r, cacheName: s };
      for (let e of ((t = await caches.match(n, i)),
      this.iterateCallbacks('cachedResponseWillBeUsed')))
        t =
          (await e({
            cacheName: s,
            matchOptions: r,
            cachedResponse: t,
            request: n,
            event: this.event,
          })) || void 0;
      return t;
    }
    async cachePut(e, t) {
      let a = X(e);
      await l(0);
      let s = await this.getCacheKey(a, 'write');
      if (!t)
        throw new h('cache-put-with-no-response', {
          url: new URL(String(s.url), location.href).href.replace(
            RegExp(`^${location.origin}`),
            '',
          ),
        });
      let r = await this._ensureResponseSafeToCache(t);
      if (!r) return !1;
      let { cacheName: n, matchOptions: i } = this._strategy,
        c = await self.caches.open(n),
        o = this.hasCallback('cacheDidUpdate'),
        u = o ? await m(c, s.clone(), ['__WB_REVISION__'], i) : null;
      try {
        await c.put(s, o ? r.clone() : r);
      } catch (e) {
        if (e instanceof Error) throw ('QuotaExceededError' === e.name && (await f()), e);
      }
      for (let e of this.iterateCallbacks('cacheDidUpdate'))
        await e({
          cacheName: n,
          oldResponse: u,
          newResponse: r.clone(),
          request: s,
          event: this.event,
        });
      return !0;
    }
    async getCacheKey(e, t) {
      let a = `${e.url} | ${t}`;
      if (!this._cacheKeys[a]) {
        let s = e;
        for (let e of this.iterateCallbacks('cacheKeyWillBeUsed'))
          s = X(await e({ mode: t, request: s, event: this.event, params: this.params }));
        this._cacheKeys[a] = s;
      }
      return this._cacheKeys[a];
    }
    hasCallback(e) {
      for (let t of this._strategy.plugins) if (e in t) return !0;
      return !1;
    }
    async runCallbacks(e, t) {
      for (let a of this.iterateCallbacks(e)) await a(t);
    }
    *iterateCallbacks(e) {
      for (let t of this._strategy.plugins)
        if ('function' == typeof t[e]) {
          let a = this._pluginStateMap.get(t),
            s = (s) => {
              let r = { ...s, state: a };
              return t[e](r);
            };
          yield s;
        }
    }
    waitUntil(e) {
      return (this._extendLifetimePromises.push(e), e);
    }
    async doneWaiting() {
      let e;
      for (; (e = this._extendLifetimePromises.shift()); ) await e;
    }
    destroy() {
      this._handlerDeferred.resolve(null);
    }
    async getPreloadResponse() {
      if (
        this.event instanceof FetchEvent &&
        'navigate' === this.event.request.mode &&
        'preloadResponse' in this.event
      )
        try {
          let e = await this.event.preloadResponse;
          if (e) return e;
        } catch (e) {}
    }
    async _ensureResponseSafeToCache(e) {
      let t = e,
        a = !1;
      for (let e of this.iterateCallbacks('cacheWillUpdate'))
        if (
          ((t = (await e({ request: this.request, response: t, event: this.event })) || void 0),
          (a = !0),
          !t)
        )
          break;
      return (!a && t && 200 !== t.status && (t = void 0), t);
    }
  }
  class Z {
    cacheName;
    plugins;
    fetchOptions;
    matchOptions;
    constructor(e = {}) {
      ((this.cacheName = o(e.cacheName)),
        (this.plugins = e.plugins || []),
        (this.fetchOptions = e.fetchOptions),
        (this.matchOptions = e.matchOptions));
    }
    handle(e) {
      let [t] = this.handleAll(e);
      return t;
    }
    handleAll(e) {
      e instanceof FetchEvent && (e = { event: e, request: e.request });
      let t = e.event,
        a = 'string' == typeof e.request ? new Request(e.request) : e.request,
        s = new Y(
          this,
          e.url ? { event: t, request: a, url: e.url, params: e.params } : { event: t, request: a },
        ),
        r = this._getResponse(s, a, t),
        n = this._awaitComplete(r, s, a, t);
      return [r, n];
    }
    async _getResponse(e, t, a) {
      let s;
      await e.runCallbacks('handlerWillStart', { event: a, request: t });
      try {
        if (((s = await this._handle(t, e)), void 0 === s || 'error' === s.type))
          throw new h('no-response', { url: t.url });
      } catch (r) {
        if (r instanceof Error) {
          for (let n of e.iterateCallbacks('handlerDidError'))
            if (void 0 !== (s = await n({ error: r, event: a, request: t }))) break;
        }
        if (!s) throw r;
      }
      for (let r of e.iterateCallbacks('handlerWillRespond'))
        s = await r({ event: a, request: t, response: s });
      return s;
    }
    async _awaitComplete(e, t, a, s) {
      let r, n;
      try {
        r = await e;
      } catch {}
      try {
        (await t.runCallbacks('handlerDidRespond', { event: s, request: a, response: r }),
          await t.doneWaiting());
      } catch (e) {
        e instanceof Error && (n = e);
      }
      if (
        (await t.runCallbacks('handlerDidComplete', {
          event: s,
          request: a,
          response: r,
          error: n,
        }),
        t.destroy(),
        n)
      )
        throw n;
    }
  }
  class ee extends Z {
    _networkTimeoutSeconds;
    constructor(e = {}) {
      (super(e),
        this.plugins.some((e) => 'cacheWillUpdate' in e) || this.plugins.unshift(J),
        (this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0));
    }
    async _handle(e, t) {
      let a,
        s = [],
        r = [];
      if (this._networkTimeoutSeconds) {
        let { id: n, promise: i } = this._getTimeoutPromise({ request: e, logs: s, handler: t });
        ((a = n), r.push(i));
      }
      let n = this._getNetworkPromise({ timeoutId: a, request: e, logs: s, handler: t });
      r.push(n);
      let i = await t.waitUntil((async () => (await t.waitUntil(Promise.race(r))) || (await n))());
      if (!i) throw new h('no-response', { url: e.url });
      return i;
    }
    _getTimeoutPromise({ request: e, logs: t, handler: a }) {
      let s;
      return {
        promise: new Promise((t) => {
          s = setTimeout(async () => {
            t(await a.cacheMatch(e));
          }, 1e3 * this._networkTimeoutSeconds);
        }),
        id: s,
      };
    }
    async _getNetworkPromise({ timeoutId: e, request: t, logs: a, handler: s }) {
      let r, n;
      try {
        n = await s.fetchAndCachePut(t);
      } catch (e) {
        e instanceof Error && (r = e);
      }
      return (e && clearTimeout(e), (r || !n) && (n = await s.cacheMatch(t)), n);
    }
  }
  class et extends Z {
    _networkTimeoutSeconds;
    constructor(e = {}) {
      (super(e), (this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0));
    }
    async _handle(e, t) {
      let a, s;
      try {
        let a = [t.fetch(e)];
        if (this._networkTimeoutSeconds) {
          let e = l(1e3 * this._networkTimeoutSeconds);
          a.push(e);
        }
        if (!(s = await Promise.race(a)))
          throw Error(
            `Timed out the network response after ${this._networkTimeoutSeconds} seconds.`,
          );
      } catch (e) {
        e instanceof Error && (a = e);
      }
      if (!s) throw new h('no-response', { url: e.url, error: a });
      return s;
    }
  }
  let ea = (e) => (e && 'object' == typeof e ? e : { handle: e });
  class es {
    handler;
    match;
    method;
    catchHandler;
    constructor(e, t, a = 'GET') {
      ((this.handler = ea(t)), (this.match = e), (this.method = a));
    }
    setCatchHandler(e) {
      this.catchHandler = ea(e);
    }
  }
  class er extends Z {
    _fallbackToNetwork;
    static defaultPrecacheCacheabilityPlugin = {
      cacheWillUpdate: async ({ response: e }) => (!e || e.status >= 400 ? null : e),
    };
    static copyRedirectedCacheableResponsesPlugin = {
      cacheWillUpdate: async ({ response: e }) => (e.redirected ? await M(e) : e),
    };
    constructor(e = {}) {
      ((e.cacheName = c(e.cacheName)),
        super(e),
        (this._fallbackToNetwork = !1 !== e.fallbackToNetwork),
        this.plugins.push(er.copyRedirectedCacheableResponsesPlugin));
    }
    async _handle(e, t) {
      let a = await t.getPreloadResponse();
      if (a) return a;
      let s = await t.cacheMatch(e);
      return (
        s ||
        (t.event && 'install' === t.event.type
          ? await this._handleInstall(e, t)
          : await this._handleFetch(e, t))
      );
    }
    async _handleFetch(e, t) {
      let a,
        s = t.params || {};
      if (this._fallbackToNetwork) {
        let r = s.integrity,
          n = e.integrity,
          i = !n || n === r;
        ((a = await t.fetch(new Request(e, { integrity: 'no-cors' !== e.mode ? n || r : void 0 }))),
          r &&
            i &&
            'no-cors' !== e.mode &&
            (this._useDefaultCacheabilityPluginIfNeeded(), await t.cachePut(e, a.clone())));
      } else throw new h('missing-precache-entry', { cacheName: this.cacheName, url: e.url });
      return a;
    }
    async _handleInstall(e, t) {
      this._useDefaultCacheabilityPluginIfNeeded();
      let a = await t.fetch(e);
      if (!(await t.cachePut(e, a.clone())))
        throw new h('bad-precaching-response', { url: e.url, status: a.status });
      return a;
    }
    _useDefaultCacheabilityPluginIfNeeded() {
      let e = null,
        t = 0;
      for (let [a, s] of this.plugins.entries())
        s !== er.copyRedirectedCacheableResponsesPlugin &&
          (s === er.defaultPrecacheCacheabilityPlugin && (e = a), s.cacheWillUpdate && t++);
      0 === t
        ? this.plugins.push(er.defaultPrecacheCacheabilityPlugin)
        : t > 1 && null !== e && this.plugins.splice(e, 1);
    }
  }
  class en extends es {
    _allowlist;
    _denylist;
    constructor(e, { allowlist: t = [/./], denylist: a = [] } = {}) {
      (super((e) => this._match(e), e), (this._allowlist = t), (this._denylist = a));
    }
    _match({ url: e, request: t }) {
      if (t && 'navigate' !== t.mode) return !1;
      let a = e.pathname + e.search;
      for (let e of this._denylist) if (e.test(a)) return !1;
      return !!this._allowlist.some((e) => e.test(a));
    }
  }
  class ei extends es {
    constructor(e, t, a) {
      super(
        ({ url: t }) => {
          let a = e.exec(t.href);
          if (a) return t.origin !== location.origin && 0 !== a.index ? void 0 : a.slice(1);
        },
        t,
        a,
      );
    }
  }
  let ec = (e) => {
    if (!e) throw new h('add-to-cache-list-unexpected-type', { entry: e });
    if ('string' == typeof e) {
      let t = new URL(e, location.href);
      return { cacheKey: t.href, url: t.href };
    }
    let { revision: t, url: a } = e;
    if (!a) throw new h('add-to-cache-list-unexpected-type', { entry: e });
    if (!t) {
      let e = new URL(a, location.href);
      return { cacheKey: e.href, url: e.href };
    }
    let s = new URL(a, location.href),
      r = new URL(a, location.href);
    return (s.searchParams.set('__WB_REVISION__', t), { cacheKey: s.href, url: r.href });
  };
  class eo {
    updatedURLs = [];
    notUpdatedURLs = [];
    handlerWillStart = async ({ request: e, state: t }) => {
      t && (t.originalRequest = e);
    };
    cachedResponseWillBeUsed = async ({ event: e, state: t, cachedResponse: a }) => {
      if ('install' === e.type && t?.originalRequest && t.originalRequest instanceof Request) {
        let e = t.originalRequest.url;
        a ? this.notUpdatedURLs.push(e) : this.updatedURLs.push(e);
      }
      return a;
    };
  }
  let eh = async (e, t, a) => {
    let s = t.map((e, t) => ({ index: t, item: e })),
      r = async (e) => {
        let t = [];
        for (;;) {
          let r = s.pop();
          if (!r) return e(t);
          let n = await a(r.item);
          t.push({ result: n, index: r.index });
        }
      },
      n = Array.from({ length: e }, () => new Promise(r));
    return (await Promise.all(n))
      .flat()
      .sort((e, t) => (e.index < t.index ? -1 : 1))
      .map((e) => e.result);
  };
  'u' > typeof navigator && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  let el = 'cache-entries',
    eu = (e) => {
      let t = new URL(e, location.href);
      return ((t.hash = ''), t.href);
    };
  class ed {
    _cacheName;
    _db = null;
    constructor(e) {
      this._cacheName = e;
    }
    _getId(e) {
      return `${this._cacheName}|${eu(e)}`;
    }
    _upgradeDb(e) {
      let t = e.createObjectStore(el, { keyPath: 'id' });
      (t.createIndex('cacheName', 'cacheName', { unique: !1 }),
        t.createIndex('timestamp', 'timestamp', { unique: !1 }));
    }
    _upgradeDbAndDeleteOldDbs(e) {
      (this._upgradeDb(e),
        this._cacheName &&
          (function (e, { blocked: t } = {}) {
            let a = indexedDB.deleteDatabase(e);
            (t && a.addEventListener('blocked', (e) => t(e.oldVersion, e)),
              v(a).then(() => void 0));
          })(this._cacheName));
    }
    async setTimestamp(e, t) {
      e = eu(e);
      let a = { id: this._getId(e), cacheName: this._cacheName, url: e, timestamp: t },
        s = (await this.getDb()).transaction(el, 'readwrite', { durability: 'relaxed' });
      (await s.store.put(a), await s.done);
    }
    async getTimestamp(e) {
      let t = await this.getDb(),
        a = await t.get(el, this._getId(e));
      return a?.timestamp;
    }
    async expireEntries(e, t) {
      let a = await this.getDb(),
        s = await a.transaction(el, 'readwrite').store.index('timestamp').openCursor(null, 'prev'),
        r = [],
        n = 0;
      for (; s; ) {
        let a = s.value;
        (a.cacheName === this._cacheName &&
          ((e && a.timestamp < e) || (t && n >= t) ? (s.delete(), r.push(a.url)) : n++),
          (s = await s.continue()));
      }
      return r;
    }
    async getDb() {
      return (
        this._db ||
          (this._db = await S('serwist-expiration', 1, {
            upgrade: this._upgradeDbAndDeleteOldDbs.bind(this),
          })),
        this._db
      );
    }
  }
  class em {
    _isRunning = !1;
    _rerunRequested = !1;
    _maxEntries;
    _maxAgeSeconds;
    _matchOptions;
    _cacheName;
    _timestampModel;
    constructor(e, t = {}) {
      ((this._maxEntries = t.maxEntries),
        (this._maxAgeSeconds = t.maxAgeSeconds),
        (this._matchOptions = t.matchOptions),
        (this._cacheName = e),
        (this._timestampModel = new ed(e)));
    }
    async expireEntries() {
      if (this._isRunning) {
        this._rerunRequested = !0;
        return;
      }
      this._isRunning = !0;
      let e = this._maxAgeSeconds ? Date.now() - 1e3 * this._maxAgeSeconds : 0,
        t = await this._timestampModel.expireEntries(e, this._maxEntries),
        a = await self.caches.open(this._cacheName);
      for (let e of t) await a.delete(e, this._matchOptions);
      ((this._isRunning = !1),
        this._rerunRequested && ((this._rerunRequested = !1), this.expireEntries()));
    }
    async updateTimestamp(e) {
      await this._timestampModel.setTimestamp(e, Date.now());
    }
    async isURLExpired(e) {
      if (!this._maxAgeSeconds) return !1;
      let t = await this._timestampModel.getTimestamp(e),
        a = Date.now() - 1e3 * this._maxAgeSeconds;
      return void 0 === t || t < a;
    }
    async delete() {
      ((this._rerunRequested = !1), await this._timestampModel.expireEntries(1 / 0));
    }
  }
  class eg {
    _config;
    _cacheExpirations;
    constructor(e = {}) {
      ((this._config = e),
        (this._cacheExpirations = new Map()),
        this._config.maxAgeFrom || (this._config.maxAgeFrom = 'last-fetched'),
        this._config.purgeOnQuotaError &&
          ((e) => {
            u.add(e);
          })(() => this.deleteCacheAndMetadata()));
    }
    _getCacheExpiration(e) {
      if (e === o()) throw new h('expire-custom-caches-only');
      let t = this._cacheExpirations.get(e);
      return (t || ((t = new em(e, this._config)), this._cacheExpirations.set(e, t)), t);
    }
    cachedResponseWillBeUsed({ event: e, cacheName: t, request: a, cachedResponse: s }) {
      if (!s) return null;
      let r = this._isResponseDateFresh(s),
        n = this._getCacheExpiration(t),
        i = 'last-used' === this._config.maxAgeFrom,
        c = (async () => {
          (i && (await n.updateTimestamp(a.url)), await n.expireEntries());
        })();
      try {
        e.waitUntil(c);
      } catch {}
      return r ? s : null;
    }
    _isResponseDateFresh(e) {
      if ('last-used' === this._config.maxAgeFrom) return !0;
      let t = Date.now();
      if (!this._config.maxAgeSeconds) return !0;
      let a = this._getDateHeaderTimestamp(e);
      return null === a || a >= t - 1e3 * this._config.maxAgeSeconds;
    }
    _getDateHeaderTimestamp(e) {
      if (!e.headers.has('date')) return null;
      let t = new Date(e.headers.get('date')).getTime();
      return Number.isNaN(t) ? null : t;
    }
    async cacheDidUpdate({ cacheName: e, request: t }) {
      let a = this._getCacheExpiration(e);
      (await a.updateTimestamp(t.url), await a.expireEntries());
    }
    async deleteCacheAndMetadata() {
      for (let [e, t] of this._cacheExpirations) (await self.caches.delete(e), await t.delete());
      this._cacheExpirations = new Map();
    }
  }
  let ef = 'www.google-analytics.com',
    ep = 'www.googletagmanager.com',
    ew = /^\/(\w+\/)?collect/,
    ey = ({ serwist: e, cacheName: t, ...a }) => {
      let s,
        r,
        c = t || i(n.googleAnalytics),
        o = new z('serwist-google-analytics', {
          maxRetentionTime: 2880,
          onSync: async ({ queue: e }) => {
            let t;
            for (; (t = await e.shiftRequest()); ) {
              let { request: s, timestamp: r } = t,
                n = new URL(s.url);
              try {
                let e =
                    'POST' === s.method
                      ? new URLSearchParams(await s.clone().text())
                      : n.searchParams,
                  t = r - (Number(e.get('qt')) || 0),
                  i = Date.now() - t;
                if ((e.set('qt', String(i)), a.parameterOverrides))
                  for (let t of Object.keys(a.parameterOverrides)) {
                    let s = a.parameterOverrides[t];
                    e.set(t, s);
                  }
                ('function' == typeof a.hitFilter && a.hitFilter.call(null, e),
                  await fetch(
                    new Request(n.origin + n.pathname, {
                      body: e.toString(),
                      method: 'POST',
                      mode: 'cors',
                      credentials: 'omit',
                      headers: { 'Content-Type': 'text/plain' },
                    }),
                  ));
              } catch (a) {
                throw (await e.unshiftRequest(t), a);
              }
            }
          },
        });
      for (let t of [
        new es(
          ({ url: e }) => e.hostname === ep && '/gtm.js' === e.pathname,
          new ee({ cacheName: c }),
          'GET',
        ),
        new es(
          ({ url: e }) => e.hostname === ef && '/analytics.js' === e.pathname,
          new ee({ cacheName: c }),
          'GET',
        ),
        new es(
          ({ url: e }) => e.hostname === ep && '/gtag/js' === e.pathname,
          new ee({ cacheName: c }),
          'GET',
        ),
        new es(
          (s = ({ url: e }) => e.hostname === ef && ew.test(e.pathname)),
          (r = new et({ plugins: [o] })),
          'GET',
        ),
        new es(s, r, 'POST'),
      ])
        e.registerRoute(t);
    };
  class e_ {
    _fallbackUrls;
    _serwist;
    constructor({ fallbackUrls: e, serwist: t }) {
      ((this._fallbackUrls = e), (this._serwist = t));
    }
    async handlerDidError(e) {
      for (let t of this._fallbackUrls)
        if ('string' == typeof t) {
          let e = await this._serwist.matchPrecache(t);
          if (void 0 !== e) return e;
        } else if (t.matcher(e)) {
          let e = await this._serwist.matchPrecache(t.url);
          if (void 0 !== e) return e;
        }
    }
  }
  let ex = async (e, t) => {
    try {
      if (206 === t.status) return t;
      let a = e.headers.get('range');
      if (!a) throw new h('no-range-header');
      let s = ((e) => {
          let t = e.trim().toLowerCase();
          if (!t.startsWith('bytes='))
            throw new h('unit-must-be-bytes', { normalizedRangeHeader: t });
          if (t.includes(',')) throw new h('single-range-only', { normalizedRangeHeader: t });
          let a = /(\d*)-(\d*)/.exec(t);
          if (!a || !(a[1] || a[2]))
            throw new h('invalid-range-values', { normalizedRangeHeader: t });
          return {
            start: '' === a[1] ? void 0 : Number(a[1]),
            end: '' === a[2] ? void 0 : Number(a[2]),
          };
        })(a),
        r = await t.blob(),
        n = ((e, t, a) => {
          let s,
            r,
            n = e.size;
          if ((a && a > n) || (t && t < 0))
            throw new h('range-not-satisfiable', { size: n, end: a, start: t });
          return (
            void 0 !== t && void 0 !== a
              ? ((s = t), (r = a + 1))
              : void 0 !== t && void 0 === a
                ? ((s = t), (r = n))
                : void 0 !== a && void 0 === t && ((s = n - a), (r = n)),
            { start: s, end: r }
          );
        })(r, s.start, s.end),
        i = r.slice(n.start, n.end),
        c = i.size,
        o = new Response(i, { status: 206, statusText: 'Partial Content', headers: t.headers });
      return (
        o.headers.set('Content-Length', String(c)),
        o.headers.set('Content-Range', `bytes ${n.start}-${n.end - 1}/${r.size}`),
        o
      );
    } catch (e) {
      return new Response('', { status: 416, statusText: 'Range Not Satisfiable' });
    }
  };
  class eb {
    cachedResponseWillBeUsed = async ({ request: e, cachedResponse: t }) =>
      t && e.headers.has('range') ? await ex(e, t) : t;
  }
  class eE extends Z {
    async _handle(e, t) {
      let a,
        s = await t.cacheMatch(e);
      if (!s)
        try {
          s = await t.fetchAndCachePut(e);
        } catch (e) {
          e instanceof Error && (a = e);
        }
      if (!s) throw new h('no-response', { url: e.url, error: a });
      return s;
    }
  }
  class eR extends Z {
    constructor(e = {}) {
      (super(e), this.plugins.some((e) => 'cacheWillUpdate' in e) || this.plugins.unshift(J));
    }
    async _handle(e, t) {
      let a,
        s = t.fetchAndCachePut(e).catch(() => {});
      t.waitUntil(s);
      let r = await t.cacheMatch(e);
      if (r);
      else
        try {
          r = await s;
        } catch (e) {
          e instanceof Error && (a = e);
        }
      if (!r) throw new h('no-response', { url: e.url, error: a });
      return r;
    }
  }
  class ev extends es {
    constructor(e, t) {
      super(({ request: a }) => {
        let s = e.getUrlsToPrecacheKeys();
        for (let r of (function* (
          e,
          {
            directoryIndex: t = 'index.html',
            ignoreURLParametersMatching: a = [/^utm_/, /^fbclid$/],
            cleanURLs: s = !0,
            urlManipulation: r,
          } = {},
        ) {
          let n = new URL(e, location.href);
          ((n.hash = ''), yield n.href);
          let i = ((e, t = []) => {
            for (let a of [...e.searchParams.keys()])
              t.some((e) => e.test(a)) && e.searchParams.delete(a);
            return e;
          })(n, a);
          if ((yield i.href, t && i.pathname.endsWith('/'))) {
            let e = new URL(i.href);
            ((e.pathname += t), yield e.href);
          }
          if (s) {
            let e = new URL(i.href);
            ((e.pathname += '.html'), yield e.href);
          }
          if (r) for (let e of r({ url: n })) yield e.href;
        })(a.url, t)) {
          let t = s.get(r);
          if (t) {
            let a = e.getIntegrityForPrecacheKey(t);
            return { cacheKey: t, integrity: a };
          }
        }
      }, e.precacheStrategy);
    }
  }
  class eq {
    _precacheController;
    constructor({ precacheController: e }) {
      this._precacheController = e;
    }
    cacheKeyWillBeUsed = async ({ request: e, params: t }) => {
      let a = t?.cacheKey || this._precacheController.getPrecacheKeyForUrl(e.url);
      return a ? new Request(a, { headers: e.headers }) : e;
    };
  }
  class eS {
    _urlsToCacheKeys = new Map();
    _urlsToCacheModes = new Map();
    _cacheKeysToIntegrities = new Map();
    _concurrentPrecaching;
    _precacheStrategy;
    _routes;
    _defaultHandlerMap;
    _catchHandler;
    _requestRules;
    constructor({
      precacheEntries: e,
      precacheOptions: t,
      skipWaiting: a = !1,
      importScripts: s,
      navigationPreload: r = !1,
      cacheId: i,
      clientsClaim: o = !1,
      runtimeCaching: h,
      offlineAnalyticsConfig: l,
      disableDevLogs: u = !1,
      fallbacks: d,
      requestRules: m,
    } = {}) {
      const {
        precacheStrategyOptions: g,
        precacheRouteOptions: f,
        precacheMiscOptions: p,
      } = ((e, t = {}) => {
        let {
          cacheName: a,
          plugins: s = [],
          fetchOptions: r,
          matchOptions: n,
          fallbackToNetwork: i,
          directoryIndex: o,
          ignoreURLParametersMatching: h,
          cleanURLs: l,
          urlManipulation: u,
          cleanupOutdatedCaches: d,
          concurrency: m = 10,
          navigateFallback: g,
          navigateFallbackAllowlist: f,
          navigateFallbackDenylist: p,
        } = t ?? {};
        return {
          precacheStrategyOptions: {
            cacheName: c(a),
            plugins: [...s, new eq({ precacheController: e })],
            fetchOptions: r,
            matchOptions: n,
            fallbackToNetwork: i,
          },
          precacheRouteOptions: {
            directoryIndex: o,
            ignoreURLParametersMatching: h,
            cleanURLs: l,
            urlManipulation: u,
          },
          precacheMiscOptions: {
            cleanupOutdatedCaches: d,
            concurrency: m,
            navigateFallback: g,
            navigateFallbackAllowlist: f,
            navigateFallbackDenylist: p,
          },
        };
      })(this, t);
      if (
        ((this._concurrentPrecaching = p.concurrency),
        (this._precacheStrategy = new er(g)),
        (this._routes = new Map()),
        (this._defaultHandlerMap = new Map()),
        (this._requestRules = m),
        (this.handleInstall = this.handleInstall.bind(this)),
        (this.handleActivate = this.handleActivate.bind(this)),
        (this.handleFetch = this.handleFetch.bind(this)),
        (this.handleCache = this.handleCache.bind(this)),
        s && s.length > 0 && self.importScripts(...s),
        r &&
          self.registration?.navigationPreload &&
          self.addEventListener('activate', (e) => {
            e.waitUntil(self.registration.navigationPreload.enable().then(() => {}));
          }),
        void 0 !== i &&
          ((e) => {
            var t = e;
            for (let e of Object.keys(n))
              ((e) => {
                let a = t[e];
                'string' == typeof a && (n[e] = a);
              })(e);
          })({ prefix: i }),
        a
          ? self.skipWaiting()
          : self.addEventListener('message', (e) => {
              e.data && 'SKIP_WAITING' === e.data.type && self.skipWaiting();
            }),
        o && self.addEventListener('activate', () => self.clients.claim()),
        e && e.length > 0 && this.addToPrecacheList(e),
        p.cleanupOutdatedCaches &&
          ((e) => {
            self.addEventListener('activate', (t) => {
              t.waitUntil(w(c(e)).then((e) => {}));
            });
          })(g.cacheName),
        this.registerRoute(new ev(this, f)),
        p.navigateFallback &&
          this.registerRoute(
            new en(this.createHandlerBoundToUrl(p.navigateFallback), {
              allowlist: p.navigateFallbackAllowlist,
              denylist: p.navigateFallbackDenylist,
            }),
          ),
        void 0 !== l &&
          ('boolean' == typeof l ? l && ey({ serwist: this }) : ey({ ...l, serwist: this })),
        void 0 !== h)
      ) {
        if (void 0 !== d) {
          const e = new e_({ fallbackUrls: d.entries, serwist: this });
          h.forEach((t) => {
            t.handler instanceof Z &&
              !t.handler.plugins.some((e) => 'handlerDidError' in e) &&
              t.handler.plugins.push(e);
          });
        }
        for (const e of h) this.registerCapture(e.matcher, e.handler, e.method);
      }
      u && (self.__WB_DISABLE_DEV_LOGS = !0);
    }
    get precacheStrategy() {
      return this._precacheStrategy;
    }
    get routes() {
      return this._routes;
    }
    addEventListeners() {
      (self.addEventListener('install', this.handleInstall),
        self.addEventListener('activate', this.handleActivate),
        self.addEventListener('fetch', this.handleFetch),
        self.addEventListener('message', this.handleCache));
    }
    addToPrecacheList(e) {
      let t = [];
      for (let a of e) {
        'string' == typeof a
          ? t.push(a)
          : a && !a.integrity && void 0 === a.revision && t.push(a.url);
        let { cacheKey: e, url: s } = ec(a),
          r = 'string' != typeof a && a.revision ? 'reload' : 'default';
        if (this._urlsToCacheKeys.has(s) && this._urlsToCacheKeys.get(s) !== e)
          throw new h('add-to-cache-list-conflicting-entries', {
            firstEntry: this._urlsToCacheKeys.get(s),
            secondEntry: e,
          });
        if ('string' != typeof a && a.integrity) {
          if (
            this._cacheKeysToIntegrities.has(e) &&
            this._cacheKeysToIntegrities.get(e) !== a.integrity
          )
            throw new h('add-to-cache-list-conflicting-integrities', { url: s });
          this._cacheKeysToIntegrities.set(e, a.integrity);
        }
        (this._urlsToCacheKeys.set(s, e), this._urlsToCacheModes.set(s, r));
      }
      t.length > 0 &&
        console.warn(`Serwist is precaching URLs without revision info: ${t.join(', ')}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`);
    }
    handleInstall(e) {
      return (
        this.registerRequestRules(e),
        y(e, async () => {
          let t = new eo();
          (this.precacheStrategy.plugins.push(t),
            await eh(
              this._concurrentPrecaching,
              Array.from(this._urlsToCacheKeys.entries()),
              async ([t, a]) => {
                let s = this._cacheKeysToIntegrities.get(a),
                  r = this._urlsToCacheModes.get(t),
                  n = new Request(t, { integrity: s, cache: r, credentials: 'same-origin' });
                await Promise.all(
                  this.precacheStrategy.handleAll({
                    event: e,
                    request: n,
                    url: new URL(n.url),
                    params: { cacheKey: a },
                  }),
                );
              },
            ));
          let { updatedURLs: a, notUpdatedURLs: s } = t;
          return { updatedURLs: a, notUpdatedURLs: s };
        })
      );
    }
    async registerRequestRules(e) {
      if (this._requestRules && e?.addRoutes)
        try {
          (await e.addRoutes(this._requestRules), (this._requestRules = void 0));
        } catch (e) {
          throw e;
        }
    }
    handleActivate(e) {
      return y(e, async () => {
        let e = await self.caches.open(this.precacheStrategy.cacheName),
          t = await e.keys(),
          a = new Set(this._urlsToCacheKeys.values()),
          s = [];
        for (let r of t) a.has(r.url) || (await e.delete(r), s.push(r.url));
        return { deletedCacheRequests: s };
      });
    }
    handleFetch(e) {
      let { request: t } = e,
        a = this.handleRequest({ request: t, event: e });
      a && e.respondWith(a);
    }
    handleCache(e) {
      if (e.data && 'CACHE_URLS' === e.data.type) {
        let { payload: t } = e.data,
          a = Promise.all(
            t.urlsToCache.map((t) => {
              let a;
              return (
                (a = 'string' == typeof t ? new Request(t) : new Request(...t)),
                this.handleRequest({ request: a, event: e })
              );
            }),
          );
        (e.waitUntil(a), e.ports?.[0] && a.then(() => e.ports[0].postMessage(!0)));
      }
    }
    setDefaultHandler(e, t = 'GET') {
      this._defaultHandlerMap.set(t, ea(e));
    }
    setCatchHandler(e) {
      this._catchHandler = ea(e);
    }
    registerCapture(e, t, a) {
      let s = ((e, t, a) => {
        if ('string' == typeof e) {
          let s = new URL(e, location.href);
          return new es(({ url: e }) => e.href === s.href, t, a);
        }
        if (e instanceof RegExp) return new ei(e, t, a);
        if ('function' == typeof e) return new es(e, t, a);
        if (e instanceof es) return e;
        throw new h('unsupported-route-type', {
          moduleName: 'serwist',
          funcName: 'parseRoute',
          paramName: 'capture',
        });
      })(e, t, a);
      return (this.registerRoute(s), s);
    }
    registerRoute(e) {
      (this._routes.has(e.method) || this._routes.set(e.method, []),
        this._routes.get(e.method).push(e));
    }
    unregisterRoute(e) {
      if (!this._routes.has(e.method))
        throw new h('unregister-route-but-not-found-with-method', { method: e.method });
      let t = this._routes.get(e.method).indexOf(e);
      if (t > -1) this._routes.get(e.method).splice(t, 1);
      else throw new h('unregister-route-route-not-registered');
    }
    getUrlsToPrecacheKeys() {
      return this._urlsToCacheKeys;
    }
    getPrecachedUrls() {
      return [...this._urlsToCacheKeys.keys()];
    }
    getPrecacheKeyForUrl(e) {
      let t = new URL(e, location.href);
      return this._urlsToCacheKeys.get(t.href);
    }
    getIntegrityForPrecacheKey(e) {
      return this._cacheKeysToIntegrities.get(e);
    }
    async matchPrecache(e) {
      let t = e instanceof Request ? e.url : e,
        a = this.getPrecacheKeyForUrl(t);
      if (a) return (await self.caches.open(this.precacheStrategy.cacheName)).match(a);
    }
    createHandlerBoundToUrl(e) {
      let t = this.getPrecacheKeyForUrl(e);
      if (!t) throw new h('non-precached-url', { url: e });
      return (a) => (
        (a.request = new Request(e)),
        (a.params = { cacheKey: t, ...a.params }),
        this.precacheStrategy.handle(a)
      );
    }
    handleRequest({ request: e, event: t }) {
      let a,
        s = new URL(e.url, location.href);
      if (!s.protocol.startsWith('http')) return;
      let r = s.origin === location.origin,
        { params: n, route: i } = this.findMatchingRoute({
          event: t,
          request: e,
          sameOrigin: r,
          url: s,
        }),
        c = i?.handler,
        o = e.method;
      if ((!c && this._defaultHandlerMap.has(o) && (c = this._defaultHandlerMap.get(o)), !c))
        return;
      try {
        a = c.handle({ url: s, request: e, event: t, params: n });
      } catch (e) {
        a = Promise.reject(e);
      }
      let h = i?.catchHandler;
      return (
        a instanceof Promise &&
          (this._catchHandler || h) &&
          (a = a.catch(async (a) => {
            if (h)
              try {
                return await h.handle({ url: s, request: e, event: t, params: n });
              } catch (e) {
                e instanceof Error && (a = e);
              }
            if (this._catchHandler)
              return this._catchHandler.handle({ url: s, request: e, event: t });
            throw a;
          })),
        a
      );
    }
    findMatchingRoute({ url: e, sameOrigin: t, request: a, event: s }) {
      for (let r of this._routes.get(a.method) || []) {
        let n,
          i = r.match({ url: e, sameOrigin: t, request: a, event: s });
        if (i)
          return (
            (Array.isArray((n = i)) && 0 === n.length) ||
            (i.constructor === Object && 0 === Object.keys(i).length)
              ? (n = void 0)
              : 'boolean' == typeof i && (n = void 0),
            { route: r, params: n }
          );
      }
      return {};
    }
  }
  let eD = [
      {
        matcher: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: new eE({
          cacheName: 'google-fonts-webfonts',
          plugins: [new eg({ maxEntries: 4, maxAgeSeconds: 31536e3, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: new eR({
          cacheName: 'google-fonts-stylesheets',
          plugins: [new eg({ maxEntries: 4, maxAgeSeconds: 604800, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: new eR({
          cacheName: 'static-font-assets',
          plugins: [new eg({ maxEntries: 4, maxAgeSeconds: 604800, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: new eR({
          cacheName: 'static-image-assets',
          plugins: [new eg({ maxEntries: 64, maxAgeSeconds: 2592e3, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\/_next\/static.+\.js$/i,
        handler: new eE({
          cacheName: 'next-static-js-assets',
          plugins: [new eg({ maxEntries: 64, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\/_next\/image\?url=.+$/i,
        handler: new eR({
          cacheName: 'next-image',
          plugins: [new eg({ maxEntries: 64, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:mp3|wav|ogg)$/i,
        handler: new eE({
          cacheName: 'static-audio-assets',
          plugins: [
            new eg({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' }),
            new eb(),
          ],
        }),
      },
      {
        matcher: /\.(?:mp4|webm)$/i,
        handler: new eE({
          cacheName: 'static-video-assets',
          plugins: [
            new eg({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' }),
            new eb(),
          ],
        }),
      },
      {
        matcher: /\.(?:js)$/i,
        handler: new eR({
          cacheName: 'static-js-assets',
          plugins: [new eg({ maxEntries: 48, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:css|less)$/i,
        handler: new eR({
          cacheName: 'static-style-assets',
          plugins: [new eg({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\/_next\/data\/.+\/.+\.json$/i,
        handler: new ee({
          cacheName: 'next-data',
          plugins: [new eg({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:json|xml|csv)$/i,
        handler: new ee({
          cacheName: 'static-data-assets',
          plugins: [new eg({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      { matcher: /\/api\/auth\/.*/, handler: new et({ networkTimeoutSeconds: 10 }) },
      {
        matcher: ({ sameOrigin: e, url: { pathname: t } }) => e && t.startsWith('/api/'),
        method: 'GET',
        handler: new ee({
          cacheName: 'apis',
          plugins: [new eg({ maxEntries: 16, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
          networkTimeoutSeconds: 10,
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          '1' === e.headers.get('RSC') &&
          '1' === e.headers.get('Next-Router-Prefetch') &&
          a &&
          !t.startsWith('/api/'),
        handler: new ee({
          cacheName: 'pages-rsc-prefetch',
          plugins: [new eg({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          '1' === e.headers.get('RSC') && a && !t.startsWith('/api/'),
        handler: new ee({
          cacheName: 'pages-rsc',
          plugins: [new eg({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          e.headers.get('Content-Type')?.includes('text/html') && a && !t.startsWith('/api/'),
        handler: new ee({
          cacheName: 'pages',
          plugins: [new eg({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ url: { pathname: e }, sameOrigin: t }) => t && !e.startsWith('/api/'),
        handler: new ee({
          cacheName: 'others',
          plugins: [new eg({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ sameOrigin: e }) => !e,
        handler: new ee({
          cacheName: 'cross-origin',
          plugins: [new eg({ maxEntries: 32, maxAgeSeconds: 3600 })],
          networkTimeoutSeconds: 10,
        }),
      },
      { matcher: /.*/i, method: 'GET', handler: new et() },
    ],
    eN = new eS({
      precacheEntries: [
        {
          revision: '93e13a148bf5e6190f312a8effa30e40',
          url: '/_next/static/TFOGJI8QfkA341tWekLcL/_buildManifest.js',
        },
        {
          revision: 'b6652df95db52feb4daf4eca35380933',
          url: '/_next/static/TFOGJI8QfkA341tWekLcL/_ssgManifest.js',
        },
        { revision: null, url: '/_next/static/chunks/350-2077f0fcebe989f2.js' },
        { revision: null, url: '/_next/static/chunks/4bd1b696-215e5051988c3dde.js' },
        { revision: null, url: '/_next/static/chunks/511-49961ea3eec20a0a.js' },
        { revision: null, url: '/_next/static/chunks/app/(auth)/layout-00908480b3fa03b3.js' },
        { revision: null, url: '/_next/static/chunks/app/(auth)/login/page-9bedc23467ac8117.js' },
        {
          revision: null,
          url: '/_next/static/chunks/app/(auth)/profile-select/page-ac9a2144acbd9e25.js',
        },
        { revision: null, url: '/_next/static/chunks/app/(auth)/signup/page-7ea6255601e3c052.js' },
        { revision: null, url: '/_next/static/chunks/app/_global-error/page-ab9972e81605dfab.js' },
        { revision: null, url: '/_next/static/chunks/app/_not-found/page-9a9cfe1efa208813.js' },
        {
          revision: null,
          url: '/_next/static/chunks/app/api/calendar/export/route-ab9972e81605dfab.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/app/api/calendar/feed/route-ab9972e81605dfab.js',
        },
        { revision: null, url: '/_next/static/chunks/app/api/symbols/route-ab9972e81605dfab.js' },
        { revision: null, url: '/_next/static/chunks/app/layout-753ba6becd3a4ba2.js' },
        { revision: null, url: '/_next/static/chunks/app/page-41fd1559feedf65d.js' },
        { revision: null, url: '/_next/static/chunks/framework-93cda6578f6c76ec.js' },
        { revision: null, url: '/_next/static/chunks/main-app-ee835abc931bce1e.js' },
        { revision: null, url: '/_next/static/chunks/main-e6c28e97220a61f9.js' },
        {
          revision: null,
          url: '/_next/static/chunks/next/dist/client/components/builtin/app-error-ab9972e81605dfab.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/next/dist/client/components/builtin/forbidden-ab9972e81605dfab.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/next/dist/client/components/builtin/global-error-36d990776ee622ba.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/next/dist/client/components/builtin/not-found-ab9972e81605dfab.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/next/dist/client/components/builtin/unauthorized-ab9972e81605dfab.js',
        },
        {
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
        },
        { revision: null, url: '/_next/static/chunks/webpack-c4e984e704471c9f.js' },
        { revision: null, url: '/_next/static/css/d7ae4dea66d60c71.css' },
        {
          revision: '18bae71b1e1b2bb25321090a3b563103',
          url: '/_next/static/media/4cf2300e9c8272f7-s.p.woff2',
        },
        {
          revision: 'a0761690ccf4441ace5cec893b82d4ab',
          url: '/_next/static/media/747892c23ea88013-s.woff2',
        },
        {
          revision: 'cc728f6c0adb04da0dfcb0fc436a8ae5',
          url: '/_next/static/media/8d697b304b401681-s.woff2',
        },
        {
          revision: 'da83d5f06d825c5ae65b7cca706cb312',
          url: '/_next/static/media/93f479601ee12b01-s.p.woff2',
        },
        {
          revision: '7b7c0ef93df188a852344fc272fc096b',
          url: '/_next/static/media/9610d9e46709d722-s.woff2',
        },
        {
          revision: '8ea4f719af3312a055caf09f34c89a77',
          url: '/_next/static/media/ba015fad6dcf6784-s.woff2',
        },
        { revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71', url: '/file.svg' },
        { revision: '2aaafa6a49b6563925fe440891e32717', url: '/globe.svg' },
        { revision: '2d2d271cf489a9320b4f27939650280d', url: '/icons/apple-touch-icon.svg' },
        { revision: 'b2661c3c637a879a77284d866d61d98d', url: '/icons/favicon.svg' },
        { revision: '6fae7b6d4708a2339b34c33b5edcfede', url: '/icons/icon-128x128.svg' },
        { revision: '7bcad66160f246d80e390eaf95c3ea42', url: '/icons/icon-144x144.svg' },
        { revision: 'bfa6906158f4c5b25949cd94e77771c4', url: '/icons/icon-152x152.svg' },
        { revision: '14d6200abaf8a1d2e0ca510398ad4110', url: '/icons/icon-192x192.svg' },
        { revision: '825a7662abbaab8f31a32e5326d1167e', url: '/icons/icon-384x384.svg' },
        { revision: 'a5db6c985204c101604e927908432423', url: '/icons/icon-512x512.svg' },
        { revision: '2c21f81ba2b7372816e67e781f848290', url: '/icons/icon-72x72.svg' },
        { revision: 'ce815ec2ef8ce82b2a9e1fc650affba4', url: '/icons/icon-96x96.svg' },
        { revision: 'cf9388f8ca56213b954b21891087c88c', url: '/icons/icon-maskable-512x512.svg' },
        { revision: '3d3b4509f4beaaf5eac0e5a7eb147f9b', url: '/images/bg1.jpg' },
        { revision: 'baf5cd04a5a4352221d86d735bc3dbf3', url: '/images/bg10.jpg' },
        { revision: '30535dcd632c555465b31e3c2a26eee8', url: '/images/bg2.jpg' },
        { revision: '4d778d50817205fa6d05778ba2117460', url: '/images/bg3.jpg' },
        { revision: 'f30de1717cc88205aa5d8471a7af8772', url: '/images/bg4.jpg' },
        { revision: '23df83b203beade8d6222d008a0c0a23', url: '/images/bg5.jpg' },
        { revision: '2afa3eb63644fe3b7789cc08207a52de', url: '/images/bg6.jpg' },
        { revision: 'ae0c65a60c49b59dc129f1a04e5dd02d', url: '/images/bg7.jpg' },
        { revision: '8e2022ec6c6e415f35072ff90d735c6a', url: '/images/bg8.jpg' },
        { revision: 'f3111ea7585e2472830ed1b1611e0025', url: '/images/bg9.jpg' },
        { revision: 'e50e03d8712a50fdcf63639161c1cf43', url: '/manifest.json' },
        { revision: '8e061864f388b47f33a1c3780831193e', url: '/next.svg' },
        { revision: '357a0b672e314b76d389aefb14482c43', url: '/symbols/mulberry-index.json' },
        { revision: '8a864bbc45e0266873a55772d1b66b02', url: '/symbols/mulberry/A.svg' },
        { revision: 'c1e010f36460678a23bff4d1c3512769', url: '/symbols/mulberry/Advent.svg' },
        {
          revision: '23ef6c47f031d9cd5fd052421b06c7b7',
          url: '/symbols/mulberry/Advent_calendar.svg',
        },
        {
          revision: '57314402c214a3a2722aaffeede9486e',
          url: '/symbols/mulberry/Ash_Wednesday.svg',
        },
        { revision: 'c40f28cdc66755935d1bbe6ff674a8e7', url: '/symbols/mulberry/B.svg' },
        {
          revision: '62a99f168472476b41b4f61dbfc46f14',
          url: '/symbols/mulberry/Bonfire_Night.svg',
        },
        { revision: '477f56da8f0e8a7d943190b6e8d8160e', url: '/symbols/mulberry/Boxing_Day.svg' },
        { revision: '74836de51642e37f3c2c44df6391f559', url: '/symbols/mulberry/C.svg' },
        {
          revision: '7b9bff343120ed2ed01e66eefbb5eedc',
          url: '/symbols/mulberry/CD_player_personal.svg',
        },
        { revision: 'd952aab3ebd3b22edc96d22d97477719', url: '/symbols/mulberry/Christian.svg' },
        { revision: '058671ae2c1489fa67afa2c38f867b12', url: '/symbols/mulberry/Christmas.svg' },
        {
          revision: 'a1ef21731d235ef25b995a82be6a5150',
          url: '/symbols/mulberry/Christmas_Day.svg',
        },
        {
          revision: 'd449852dfbb8b5dad6ea5a3d9dfae5c5',
          url: '/symbols/mulberry/Christmas_Eve.svg',
        },
        {
          revision: 'b55c9fcad0c19166de56f398c0c51da7',
          url: '/symbols/mulberry/Christmas_bauble.svg',
        },
        {
          revision: '00ed10ec88d8c4cce4fbc4567de6531d',
          url: '/symbols/mulberry/Christmas_bell.svg',
        },
        {
          revision: '03aee0728abc3328bda2d0ee0a8990d4',
          url: '/symbols/mulberry/Christmas_cake.svg',
        },
        {
          revision: '28d3ce84e078167b1d5fe1bd81f6ce0d',
          url: '/symbols/mulberry/Christmas_decorations.svg',
        },
        {
          revision: 'b5e79316752c953c95c6c4cdf0495926',
          url: '/symbols/mulberry/Christmas_lights.svg',
        },
        {
          revision: '9bb14f40f0653a0d2eab13a77482c432',
          url: '/symbols/mulberry/Christmas_pudding.svg',
        },
        {
          revision: '701b1bd593c0226b6075c7a32db7a13f',
          url: '/symbols/mulberry/Christmas_sock.svg',
        },
        {
          revision: '97d8aa4cfb15749718096c2d09349dbd',
          url: '/symbols/mulberry/Christmas_tree.svg',
        },
        {
          revision: '1314273ded15c0b4aa8a89dd0c2f2a1c',
          url: '/symbols/mulberry/Christmas_wreath.svg',
        },
        { revision: '751c48ecc041b447edad5c372d630942', url: '/symbols/mulberry/Crucifixion.svg' },
        { revision: 'f885182aa1404f2957d31c3e5778f26f', url: '/symbols/mulberry/D.svg' },
        { revision: '18f6a0bf7927d150a67b38c7f566d881', url: '/symbols/mulberry/DVD_player.svg' },
        {
          revision: 'e433009bbd5e86bb472f68db17e59360',
          url: '/symbols/mulberry/DVD_player_portable.svg',
        },
        { revision: '3ab8de06523f1841cf99bde13cdaf83a', url: '/symbols/mulberry/E.svg' },
        { revision: '7a3d9d04f493b6b93d37ce02dd0a47e7', url: '/symbols/mulberry/Earth.svg' },
        { revision: '7d9d92b8d37062622fb6330eaae63751', url: '/symbols/mulberry/Earth_crust.svg' },
        {
          revision: '7482de42cf47814f3fde5dd644b0f7cc',
          url: '/symbols/mulberry/Earth_inner_core.svg',
        },
        { revision: '32e533cbee6855945dddb01d31b65940', url: '/symbols/mulberry/Earth_mantle.svg' },
        {
          revision: '53723f7c1e235b0563b8a2381873e53b',
          url: '/symbols/mulberry/Earth_outer_core.svg',
        },
        {
          revision: '8f0d0dfa4a53c4447729e06c2acf81d6',
          url: '/symbols/mulberry/Earths_atmosphere.svg',
        },
        { revision: '4e3a8201437af685a9d038a9d4c99472', url: '/symbols/mulberry/Easter_egg.svg' },
        {
          revision: '35fc30f832002b745bc02e3cc5a74ddf',
          url: '/symbols/mulberry/Easter_egg_hunt.svg',
        },
        { revision: '24a0461acd936b8f4e379a21666f9ed7', url: '/symbols/mulberry/F.svg' },
        {
          revision: '2c033f0cac78dc771bce678b82a770a3',
          url: '/symbols/mulberry/Father_Christmas.svg',
        },
        {
          revision: 'e6ed296102902b2930d16d7c290746a7',
          url: '/symbols/mulberry/Father_Christmas_sack.svg',
        },
        { revision: '70957274233a2a9caf94eb95e94e116c', url: '/symbols/mulberry/G.svg' },
        { revision: 'b6cd20b0229340f5e785e9512000d9cf', url: '/symbols/mulberry/Guy_Fawkes.svg' },
        { revision: '92eefee1cf890da1c14917a3001b0fbc', url: '/symbols/mulberry/H.svg' },
        { revision: '0f4a5159ca9b06835357086b1eb1920b', url: '/symbols/mulberry/Halloween.svg' },
        {
          revision: 'bad8f006c41776a3cebfe15049439249',
          url: '/symbols/mulberry/Harvest_Festival.svg',
        },
        {
          revision: '1971ab52d2c0eb024d4b8fb95b4d83dd',
          url: '/symbols/mulberry/Houses_of_Parliament.svg',
        },
        { revision: 'b6fbcbdf0ba898d4a2514d9a8b4e1e72', url: '/symbols/mulberry/I.svg' },
        {
          revision: '7eb21bab7c8a5122b07fbdf44979c6ce',
          url: '/symbols/mulberry/IT_assistant_1a.svg',
        },
        {
          revision: '27bdc0a374acabe299e9d94d815ae4d0',
          url: '/symbols/mulberry/IT_assistant_1b.svg',
        },
        {
          revision: 'd207f3d50ddd8b76fd5044660c1b657b',
          url: '/symbols/mulberry/IT_assistant_2a.svg',
        },
        {
          revision: 'a360e2e741487544cbfbe2dabc11915f',
          url: '/symbols/mulberry/IT_assistant_2b.svg',
        },
        { revision: '9813ece594dee465ea8a150f208d0897', url: '/symbols/mulberry/IT_class.svg' },
        { revision: '3be3aeb4f59651fd8ce8ab3f5c1735f9', url: '/symbols/mulberry/IT_room.svg' },
        { revision: 'c8c20f958020763b4dd159237f63320d', url: '/symbols/mulberry/J.svg' },
        { revision: 'f2e3b8e0b96bd63caab2fdbadaa505a5', url: '/symbols/mulberry/Jesus.svg' },
        { revision: 'b9d0061b1e6000af139ff7958bc852a2', url: '/symbols/mulberry/Joseph.svg' },
        { revision: 'e6822be1baf6b631f881e31cd61f5b7f', url: '/symbols/mulberry/Judas.svg' },
        { revision: '249bd2ca6e81bb0bc51ae4dc5d7edb24', url: '/symbols/mulberry/Jupiter.svg' },
        { revision: '00761aef2c64ea5bda3f2265007e0798', url: '/symbols/mulberry/K.svg' },
        { revision: '6c2cc40dd879330ceb53be884b41c2e1', url: '/symbols/mulberry/L.svg' },
        { revision: '5ad6be02a53c948c6e46b6fe725f352a', url: '/symbols/mulberry/Last_Supper.svg' },
        { revision: '7cde89370c69afb6c016e329305a45d7', url: '/symbols/mulberry/Lent.svg' },
        { revision: '1d5ca40781ecdc64b73e106d012c8b50', url: '/symbols/mulberry/M.svg' },
        { revision: '58a964d7925e19798dd0cbc64ebc62d7', url: '/symbols/mulberry/Mars.svg' },
        { revision: 'fdbf6a082941196f448bb7f6d8069c67', url: '/symbols/mulberry/Mary.svg' },
        { revision: 'c49286cc2620b60300782a78fc924fe7', url: '/symbols/mulberry/Mercury.svg' },
        { revision: '601094e6efa43367cd0017e0dfeb123a', url: '/symbols/mulberry/Milky_Way.svg' },
        { revision: '8d0a8bdaf3f2fe9234de8b53e6f5d112', url: '/symbols/mulberry/Moon.svg' },
        { revision: '71c5a72b9a6db688d148de9f39b21634', url: '/symbols/mulberry/N.svg' },
        { revision: 'ecac39c540cf3e2d6880cc96275bfca6', url: '/symbols/mulberry/Nativity.svg' },
        { revision: 'ba4cefee70187592193f0b8b0ff56707', url: '/symbols/mulberry/Neptune.svg' },
        { revision: '6a6be84a7143f1ed08970fc16a505748', url: '/symbols/mulberry/O.svg' },
        { revision: 'cafedfdcbf1b876257874d67379d06e1', url: '/symbols/mulberry/P.svg' },
        { revision: 'b5926042fe767d81a3954378a98a0112', url: '/symbols/mulberry/PE.svg' },
        { revision: 'd894c084319b6fe4256936552659144c', url: '/symbols/mulberry/PE_class.svg' },
        { revision: 'a4dd25cd37d69036205ecbeb7f4439fd', url: '/symbols/mulberry/Palm_Sunday.svg' },
        { revision: 'b47e17add593c62135ead090524a44e3', url: '/symbols/mulberry/Pluto.svg' },
        { revision: '0d6a8d82f055e0cdaf87cb4582ee0c5f', url: '/symbols/mulberry/Puritans.svg' },
        { revision: 'c387230c03e8af17abab97882d7c75c3', url: '/symbols/mulberry/Q.svg' },
        { revision: '6ef6b8a294a11f4a8048c7d8434fe33a', url: '/symbols/mulberry/R.svg' },
        { revision: '74331c3d1cd1a55c9b7159e3f5c842cc', url: '/symbols/mulberry/Rudolph.svg' },
        { revision: '0d14f3f6428a07b8a7fa52dee3c8cbbc', url: '/symbols/mulberry/S.svg' },
        { revision: '31e194cef6833e38d65fc2449e67b331', url: '/symbols/mulberry/Saturn.svg' },
        {
          revision: 'bc5a7497c0eff3a5595c55129fce957c',
          url: '/symbols/mulberry/Shrove_Tuesday_1.svg',
        },
        { revision: '02aae9a5e9890c2b7d449fe8a5c814a0', url: '/symbols/mulberry/T.svg' },
        { revision: 'fe2b273f346e6eed8b6bf51724d24b88', url: '/symbols/mulberry/U.svg' },
        { revision: 'ee846182768b1df400cf9086424b21e2', url: '/symbols/mulberry/Uranus.svg' },
        { revision: 'eab7e4e9a742837898aea0934b2a55aa', url: '/symbols/mulberry/V.svg' },
        { revision: '34e4db2b61bc6c5e51c6d3a1699e27ec', url: '/symbols/mulberry/Venus.svg' },
        { revision: 'ab21ded5bcb49e45076c7b0d8151de40', url: '/symbols/mulberry/W.svg' },
        { revision: 'e056c511cbce3f2811f5572922bb7fe1', url: '/symbols/mulberry/Wii.svg' },
        { revision: '79cd34ecf843ffaaaacb6a0e7490a318', url: '/symbols/mulberry/Wii_Fit.svg' },
        { revision: 'ea465daffdbd52410b03d3ce2ac57d9b', url: '/symbols/mulberry/X.svg' },
        { revision: '714611333d1885efcd202ae3e64b80df', url: '/symbols/mulberry/Y.svg' },
        { revision: '513402876969eac1f506305a5b5fc77b', url: '/symbols/mulberry/Z.svg' },
        { revision: 'eb02114ce4872200f02ca3e72d7b00b8', url: '/symbols/mulberry/Zero.svg' },
        {
          revision: '908fdd7d556b9cd0fc7ed56aab14be60',
          url: '/symbols/mulberry/a_-_lower_case.svg',
        },
        { revision: '772f394b5f87cc96e197e6f81766fe63', url: '/symbols/mulberry/above.svg' },
        { revision: '9f0becfe2e565ad0d3b0cba214d8b0fa', url: '/symbols/mulberry/absent.svg' },
        { revision: '15c27614489978d0389ae3bbff701a3a', url: '/symbols/mulberry/acne_spots.svg' },
        { revision: '09cbc9224b3470c11313f02c40215540', url: '/symbols/mulberry/acorn.svg' },
        { revision: '671feaf4d684fb74c6ecdfc6185c8fe7', url: '/symbols/mulberry/across.svg' },
        {
          revision: 'b561eaca380fa9f2937a40f6546cdbb0',
          url: '/symbols/mulberry/activity_centre.svg',
        },
        { revision: '14957a9a09d785c238f30be7faa54d7f', url: '/symbols/mulberry/add.svg' },
        {
          revision: 'd11eb0c009f1fb17ca6cb3257446e00f',
          url: '/symbols/mulberry/aerial_indoor.svg',
        },
        {
          revision: 'e75ccc82fccee17b8f8b12c1a0232542',
          url: '/symbols/mulberry/aerobics_dance.svg',
        },
        { revision: '08f7a4999448e00d56032c30462be905', url: '/symbols/mulberry/aeroplane.svg' },
        { revision: '5d6756bf1cd4636f4e8fd54009070564', url: '/symbols/mulberry/afraid_lady.svg' },
        { revision: '6e88d90f8ad3ca981b760d78567917f5', url: '/symbols/mulberry/afraid_man.svg' },
        { revision: '5d8c9b4c7a12df26c15f97e0d92621e5', url: '/symbols/mulberry/after.svg' },
        { revision: '4f58351441e81623b04170d0e7e6733e', url: '/symbols/mulberry/afternoon.svg' },
        { revision: 'deb50c7871d3d672f0dbf94c33c0275f', url: '/symbols/mulberry/aftershave.svg' },
        { revision: '2645e437959d71ebc1d146d5a91fba26', url: '/symbols/mulberry/aftershave_1.svg' },
        { revision: '0524a8947c0380df2ec3a0456125242f', url: '/symbols/mulberry/against.svg' },
        { revision: '38decac27513ef8249b8ff5a354008e3', url: '/symbols/mulberry/ahead.svg' },
        {
          revision: '436d3dac11229a3f396660f5c2978e40',
          url: '/symbols/mulberry/air_person_1a.svg',
        },
        {
          revision: '88d954397f1b634929e3c374567c8b5f',
          url: '/symbols/mulberry/air_person_1b.svg',
        },
        {
          revision: 'ecd8db813a2c291e099944b3ec5966a7',
          url: '/symbols/mulberry/air_person_2a.svg',
        },
        {
          revision: '2b58e53f64ee93062fe7b49d73a89dba',
          url: '/symbols/mulberry/air_person_2b.svg',
        },
        {
          revision: '9ab04bac12051eecb2b79c1ded40df78',
          url: '/symbols/mulberry/air_steward_1a.svg',
        },
        {
          revision: '590f044e1bc71061dde8cacd158ec080',
          url: '/symbols/mulberry/air_steward_1b.svg',
        },
        {
          revision: '437cf7a153d07d46e485cfe86acd0b77',
          url: '/symbols/mulberry/air_steward_2a.svg',
        },
        {
          revision: '5e4cefe14b536233097d2a05515340b2',
          url: '/symbols/mulberry/air_steward_2b.svg',
        },
        { revision: '184a77d47cc12f1cb27b3dcbb5e582ed', url: '/symbols/mulberry/airways.svg' },
        {
          revision: '22bf43866478e69c3962e4681ba6c415',
          url: '/symbols/mulberry/algebra_class.svg',
        },
        {
          revision: 'c7f3c223bf84c17088e6c541798bec44',
          url: '/symbols/mulberry/algebra_formula.svg',
        },
        { revision: '641fdc9c476ae7657116983e78cddff5', url: '/symbols/mulberry/almond.svg' },
        { revision: '6bcefa6b5d1442e49af7d4fac442f033', url: '/symbols/mulberry/ambulance.svg' },
        { revision: '5e97b77efafc49d48c5a3811ff6d378d', url: '/symbols/mulberry/angel.svg' },
        { revision: '3c021064ec9dc7ba7f81cb239fa405ae', url: '/symbols/mulberry/angry_lady.svg' },
        { revision: '35c29946a305ca6733a2f6f1edcbd365', url: '/symbols/mulberry/angry_man.svg' },
        { revision: '1793359d58cc5bdaddac612ff6a900fc', url: '/symbols/mulberry/ankle.svg' },
        { revision: '898faf674eeb460bf001e4718db5d8a9', url: '/symbols/mulberry/answer.svg' },
        { revision: 'cf41cf53b4d434e8c877fde6a392a07c', url: '/symbols/mulberry/ant.svg' },
        { revision: 'fd35d393065d671391b3560f8fc06f25', url: '/symbols/mulberry/ant_eater.svg' },
        { revision: '8635a9cf548df94e3e6a05920c13a76b', url: '/symbols/mulberry/antelope.svg' },
        { revision: '2e5454c091810024553cbf21c303ff7b', url: '/symbols/mulberry/apple.svg' },
        { revision: 'ea807f3a316daa2f0cf630ac76cb7b10', url: '/symbols/mulberry/apple_juice.svg' },
        { revision: '5fbc3f63d7a2889e85c524e702865342', url: '/symbols/mulberry/apricot.svg' },
        { revision: '1dc2864ad3024a8a509e2b2d6d120544', url: '/symbols/mulberry/apron.svg' },
        { revision: '835c5566fdb6f268ed1b6a5d2c1da903', url: '/symbols/mulberry/aquarium.svg' },
        {
          revision: '45b066637ef19de0e60086f133a08b96',
          url: '/symbols/mulberry/arch_lever_file.svg',
        },
        { revision: 'd513900b42b36af3c10203d9f054f102', url: '/symbols/mulberry/archery.svg' },
        {
          revision: '4a210550cdebb8023402432c74aad301',
          url: '/symbols/mulberry/archery_target.svg',
        },
        { revision: 'b2759bcdfd3139d4092bad72b253d2ad', url: '/symbols/mulberry/arm.svg' },
        { revision: '51a2c04f002c2cda4b1eac5d1987b3f6', url: '/symbols/mulberry/arm_chair.svg' },
        { revision: '43d60fcdb5f2d4c257343618d9bdebd3', url: '/symbols/mulberry/arms.svg' },
        {
          revision: 'acbedaabbc10de54b38cb06334c6dcc6',
          url: '/symbols/mulberry/armwrestle_,_to.svg',
        },
        { revision: 'd13fde70908501f5646c61adbb5fb257', url: '/symbols/mulberry/army_tank.svg' },
        { revision: '614daf8d561af6e2096ca30a2ad671e0', url: '/symbols/mulberry/around.svg' },
        { revision: 'd677d31d7553302ec7b3e0b4418cb09b', url: '/symbols/mulberry/arrest_,_to.svg' },
        { revision: 'd2a256db1aea810190ddb7cd9a7da575', url: '/symbols/mulberry/arrow_keys.svg' },
        { revision: '8e55d9977bc4f370c828557293b9cb8e', url: '/symbols/mulberry/art.svg' },
        { revision: 'f37f51e35cb591abf7db8389620fffa9', url: '/symbols/mulberry/art_class.svg' },
        { revision: 'e29f9f63781bcacef67a7eed5cd903d1', url: '/symbols/mulberry/art_room.svg' },
        { revision: 'f343fa43e1895f3fed0452f18620b9c9', url: '/symbols/mulberry/artichoke.svg' },
        {
          revision: '7c5199d0dde07da1eb45a707d1905099',
          url: '/symbols/mulberry/artist_palette.svg',
        },
        { revision: '4832a68af11b4776ec033b403a3b45a7', url: '/symbols/mulberry/ask_,_to.svg' },
        { revision: '1becd6824ce0d1b803cb12b9c67bfc25', url: '/symbols/mulberry/asparagus.svg' },
        { revision: 'f7dabd5e4ef2a71914310f835b7ceed3', url: '/symbols/mulberry/assembly.svg' },
        { revision: '7beb4631d85dad32cfb73fec7f46dbbe', url: '/symbols/mulberry/at_key.svg' },
        { revision: 'a6206e4a77ca8d10ace7576f49ae1514', url: '/symbols/mulberry/atom.svg' },
        { revision: '1ef4f9639d2418d0f58a158525be507a', url: '/symbols/mulberry/attract_,_to.svg' },
        { revision: 'c3438ec2067fcab75dc40be51d11b4b8', url: '/symbols/mulberry/aubergine.svg' },
        {
          revision: '93e141c175014bfc9376775d6b4ce69e',
          url: '/symbols/mulberry/aunt_maternal.svg',
        },
        {
          revision: '33ffe88bb2785fddbcd8c05468dcaa05',
          url: '/symbols/mulberry/aunt_paternal.svg',
        },
        { revision: '7598b13c566c0bf552932c6bdc2db2ab', url: '/symbols/mulberry/auroscope.svg' },
        { revision: 'e111441f120b7542fbb501afe72a3d70', url: '/symbols/mulberry/autumn.svg' },
        { revision: 'ba23b18a554184cfb24b0a3ab8d1fc81', url: '/symbols/mulberry/avocado.svg' },
        { revision: '9949e2f36a7f1a628095360052cb712d', url: '/symbols/mulberry/awake.svg' },
        { revision: 'aa0c30ceb7a7d01a9558ed5ae97e298b', url: '/symbols/mulberry/away.svg' },
        {
          revision: 'f1df8310fe7b490342e80b56a1ebff42',
          url: '/symbols/mulberry/b_-_lower_case.svg',
        },
        { revision: 'b9d8ee5d8c8783382402d3e4198707ad', url: '/symbols/mulberry/baby.svg' },
        { revision: '20d2f9466f79d395dc93192774a74064', url: '/symbols/mulberry/baby_oil.svg' },
        { revision: '2163193fbb52dea971bdf7041db62ffc', url: '/symbols/mulberry/baby_powder.svg' },
        { revision: '3b44379b18c675ba1e73a46c3f8418e5', url: '/symbols/mulberry/back.svg' },
        { revision: 'd9246ccaec9eac7379f81b6c75fc4206', url: '/symbols/mulberry/back_1.svg' },
        { revision: '1d532b8db9489251604323cbaf82bd3c', url: '/symbols/mulberry/back_ache.svg' },
        { revision: 'd5e9aa9e86630df94956bf7f258a2066', url: '/symbols/mulberry/back_garden.svg' },
        { revision: '27453a75e3a19b07b715364dd13add71', url: '/symbols/mulberry/backstop.svg' },
        { revision: 'bfc137c911a454b24bbb97470d44bb00', url: '/symbols/mulberry/backwards.svg' },
        { revision: '7cfe4f0d7ec6f16714e224c0fee6565a', url: '/symbols/mulberry/bacon.svg' },
        { revision: '3a8e4a16df84389b1b7a0e41070a2554', url: '/symbols/mulberry/bad.svg' },
        { revision: '2738a8c77393c86e04dfaffb7082fad7', url: '/symbols/mulberry/badger.svg' },
        { revision: '426008d3773f64b11f622495abd8ee0c', url: '/symbols/mulberry/badger_2.svg' },
        { revision: 'bc4c16d08a06d5e14b59ef4e87e15902', url: '/symbols/mulberry/badminton.svg' },
        {
          revision: '3a01e4b2e03479d1228c4ccadec0416a',
          url: '/symbols/mulberry/badminton_racket.svg',
        },
        { revision: 'b10dbf5a16830116762a3c23fc119e7e', url: '/symbols/mulberry/bagel.svg' },
        { revision: 'beec1e59f6d6a054b3094cbdc956b28d', url: '/symbols/mulberry/bagel_2.svg' },
        { revision: '7e1dde719ed7f26dd7559703f40c6d09', url: '/symbols/mulberry/bake_,_to.svg' },
        { revision: 'f9ed41eb19a13219992edab53e927629', url: '/symbols/mulberry/baked_beans.svg' },
        {
          revision: '060287078794976660271af599548347',
          url: '/symbols/mulberry/baked_beans_2.svg',
        },
        { revision: '3a0f18d579809cc7af27785bb8721062', url: '/symbols/mulberry/baker_1a.svg' },
        { revision: '8485818aa5d62cc2fbe98a3914722042', url: '/symbols/mulberry/baker_1b.svg' },
        { revision: '4ccd4ac5dc3b0d2469d93afc7ffe9ab3', url: '/symbols/mulberry/baker_2a.svg' },
        { revision: 'bc1c79c3f664112a9cd77b3cbf1de8c6', url: '/symbols/mulberry/baker_2b.svg' },
        {
          revision: '15604c64e437112bac5d743f8868606c',
          url: '/symbols/mulberry/baking_powder.svg',
        },
        { revision: '318ac9b935c6f5e814e968c0e869865e', url: '/symbols/mulberry/baking_tray.svg' },
        { revision: '1a829567d15655b2488bcc61f64fb0b5', url: '/symbols/mulberry/ball.svg' },
        { revision: 'aca8298f4a75474ef0bc2ec8cfaa63ad', url: '/symbols/mulberry/ball_beach.svg' },
        { revision: '532f5b08e8740ef1a4cb505e7d621ae7', url: '/symbols/mulberry/ball_pool.svg' },
        { revision: '2a35f59f1af0122bce2e788fd37fd50c', url: '/symbols/mulberry/balloon.svg' },
        { revision: '0c207f8b37e6aa3a311ca030ef4f8ba7', url: '/symbols/mulberry/banana.svg' },
        { revision: '11c705815e89799eee1bb85e4b24cae1', url: '/symbols/mulberry/banana_bunch.svg' },
        { revision: 'f518dd10f5e64bafd604182f632dc3b0', url: '/symbols/mulberry/bank.svg' },
        { revision: 'c80aca7bc1f56474a52fc4351706ce5a', url: '/symbols/mulberry/bank_card.svg' },
        {
          revision: '2ddb236ef653fb16574514e4e18bef2b',
          url: '/symbols/mulberry/banquet_buffet.svg',
        },
        { revision: '76c43c50a2730a50da35f93db0217fb5', url: '/symbols/mulberry/bap.svg' },
        { revision: '92dacef8bce98eb6b63044490cf9365b', url: '/symbols/mulberry/barbeque.svg' },
        {
          revision: 'c75468e737eaa1ba606c73be0ac8436d',
          url: '/symbols/mulberry/barbeque_,_to.svg',
        },
        { revision: '12f17900c18f2412f1c8b21032e3554d', url: '/symbols/mulberry/base_rock.svg' },
        {
          revision: '1677b89a2ce5f663a8c9fc2c82eb4a26',
          url: '/symbols/mulberry/baseball_base.svg',
        },
        { revision: 'b6bcf63385c21bec94f0756653348bac', url: '/symbols/mulberry/baseball_bat.svg' },
        {
          revision: 'd4493871b18036d38d4a38f1418e05da',
          url: '/symbols/mulberry/baseball_game.svg',
        },
        {
          revision: 'd58fce90ede01e0e13e752939b61a097',
          url: '/symbols/mulberry/baseball_glove.svg',
        },
        {
          revision: '43d54b9fa27a3986b544a59377613975',
          url: '/symbols/mulberry/baseball_player.svg',
        },
        { revision: 'bd6f7ae1a10eb1a56350b4848296649d', url: '/symbols/mulberry/basket.svg' },
        { revision: 'edc4299a24b4a061363652ad7231a66c', url: '/symbols/mulberry/basket_2.svg' },
        { revision: '12556dd9343988800d93de3bf4e3dde8', url: '/symbols/mulberry/basketball.svg' },
        {
          revision: 'd7e9b8b960511b5bfe1b2a2bb44f5a35',
          url: '/symbols/mulberry/basketball_ball.svg',
        },
        {
          revision: 'b422af1302410359b1c8a707633cc169',
          url: '/symbols/mulberry/basketball_game.svg',
        },
        { revision: '8816c5459137f0f7a4fbec5d160f6dea', url: '/symbols/mulberry/bat.svg' },
        { revision: 'ba02510dc2f714b1e0ef6c01c31dfd19', url: '/symbols/mulberry/bath.svg' },
        {
          revision: '24b0b9223743ebc861c845859ffa9041',
          url: '/symbols/mulberry/bath_animal_,_to.svg',
        },
        { revision: '6d7ff842a7c1a9c1d4a469e70bc332d0', url: '/symbols/mulberry/bath_mat.svg' },
        { revision: 'a50053ed3ef85eded54e7f3bf3dd1fd8', url: '/symbols/mulberry/bathe_,_to.svg' },
        { revision: 'd1564aeb5c8ffcb65389bf44aa4abc46', url: '/symbols/mulberry/battery_1.svg' },
        { revision: '3b5af5db1d174c14cb685fc18f2856fa', url: '/symbols/mulberry/battery_1a.svg' },
        { revision: '2881c606af798a9f5c9d7f378923ffb4', url: '/symbols/mulberry/battery_2.svg' },
        { revision: '36b029e9e371c2d4143cfbac27e03130', url: '/symbols/mulberry/battery_2a.svg' },
        { revision: '42d2fc6ae3d42ff4681331497f559457', url: '/symbols/mulberry/beach.svg' },
        { revision: 'b81d15ce44b5ec8cf3d976627aba8197', url: '/symbols/mulberry/beach_bag.svg' },
        { revision: 'be230da8bd613d73390aa729a530896c', url: '/symbols/mulberry/beach_towel.svg' },
        { revision: 'fd80e4c26b2bdad811b60ed63cdfd372', url: '/symbols/mulberry/beads.svg' },
        { revision: '7a2cc24996c26f19af69a49185fbf7da', url: '/symbols/mulberry/beak.svg' },
        { revision: 'b93810f60174f3ee48551d10621ebc68', url: '/symbols/mulberry/beaker_1.svg' },
        { revision: 'd9ea971e9a79e70c7d8d5ab3a3c351a2', url: '/symbols/mulberry/beaker_2.svg' },
        { revision: '1018d04bcb39dc390cdb8f95c1597698', url: '/symbols/mulberry/beanbag.svg' },
        {
          revision: '0e8c99c4a9d9c4c5d05938d44476ec8b',
          url: '/symbols/mulberry/beans_on_toast.svg',
        },
        { revision: '668841a009e08e7578bda1dd89a5a801', url: '/symbols/mulberry/beansprouts.svg' },
        { revision: '8521ab79899338d6d9c8e749e9562cbe', url: '/symbols/mulberry/bear.svg' },
        {
          revision: 'b4a44ef9cf30850ec759f1546d66215c',
          url: '/symbols/mulberry/bed_four_poster.svg',
        },
        { revision: 'c4924956a13e1777f8b211daae706428', url: '/symbols/mulberry/bed_time.svg' },
        { revision: '36d5f3c28f2dacc37e959f885d271f6d', url: '/symbols/mulberry/bee_bumble.svg' },
        { revision: '5989d566e88a73ed2d3d73cf188918c2', url: '/symbols/mulberry/bee_honey.svg' },
        { revision: '6bb53b80820faacc23055c06881f7b84', url: '/symbols/mulberry/beef.svg' },
        { revision: '842fd5e16769dd717c479944fd628f5d', url: '/symbols/mulberry/beehive.svg' },
        { revision: '0aecfcfb7a1363224b2809a13529cd6e', url: '/symbols/mulberry/beer.svg' },
        { revision: '2545585e7da5ffa94b9d4665396f9dd5', url: '/symbols/mulberry/bees_nest.svg' },
        { revision: 'ff453067e512111771f5e7e0f3eaa932', url: '/symbols/mulberry/beetle.svg' },
        { revision: '1b2b3e13d9fbe225ecd9bf8087f3ed4e', url: '/symbols/mulberry/beetroot.svg' },
        { revision: '298d747e4e97f72332ca604dc25e795e', url: '/symbols/mulberry/before.svg' },
        { revision: 'bdf48739f9de5ab772093a04107538eb', url: '/symbols/mulberry/begin_start.svg' },
        { revision: '15fccd89b7f408789373718506c821dc', url: '/symbols/mulberry/behind.svg' },
        { revision: 'f2885212955b629a23a25ed30204cdae', url: '/symbols/mulberry/bell.svg' },
        { revision: 'b6b6e9e2fd5ea6cce1a427b0dbd0c70b', url: '/symbols/mulberry/below.svg' },
        { revision: 'adf05d4c4a1eee8211756ac401d0f156', url: '/symbols/mulberry/belt.svg' },
        { revision: '42fa39a0b2c952953bd3b8538cf2e842', url: '/symbols/mulberry/bench.svg' },
        { revision: '0e0671baba0f243491a5f0d83e801517', url: '/symbols/mulberry/bend_,_to.svg' },
        { revision: '3c8ee1891558ef7b000be8974a4804cd', url: '/symbols/mulberry/bend_2_,_to.svg' },
        { revision: '9ddb604c39602112b46225fae2d33414', url: '/symbols/mulberry/bendy.svg' },
        { revision: 'eb12b67fe323054478178bde09f44c4d', url: '/symbols/mulberry/bendy_1.svg' },
        { revision: '837c42d81fc1b68414d91a1df268b01d', url: '/symbols/mulberry/berry.svg' },
        {
          revision: '16e1cc37b685872167740478499e6bd9',
          url: '/symbols/mulberry/beside_next_to.svg',
        },
        { revision: '48315674a0779af47c989bb1c74c44bc', url: '/symbols/mulberry/between.svg' },
        { revision: 'e7dd7cbe54878613bb93535dd1f46e62', url: '/symbols/mulberry/bib.svg' },
        { revision: '88391bce8a96a67ac0b5a6266bcedb6e', url: '/symbols/mulberry/bicycle.svg' },
        {
          revision: '111cea8af35c1b2326dae08045738b0c',
          url: '/symbols/mulberry/big_mac_switch.svg',
        },
        { revision: 'c84c2960cb3f863c28015c93140c750b', url: '/symbols/mulberry/big_wheel.svg' },
        { revision: 'e13a3487ff0a8d51e240fcc90376063d', url: '/symbols/mulberry/bikini.svg' },
        { revision: '1931a3d438ed9a5b7ca2619dc1e443ae', url: '/symbols/mulberry/bin_bag.svg' },
        { revision: 'c03ef7d3abb343af785da8638eafe76b', url: '/symbols/mulberry/bin_bags.svg' },
        { revision: '2366b720c6b21b829b57cd5fe0a7893d', url: '/symbols/mulberry/bingo.svg' },
        { revision: '4675ca118410b38f9fab2d5eee16795e', url: '/symbols/mulberry/bingo_marker.svg' },
        { revision: '2cb66ce8fa5b1a6c28d8ea00cd95cdd5', url: '/symbols/mulberry/bird.svg' },
        { revision: '24a58fb3033df6c24b4196548875875f', url: '/symbols/mulberry/bird_bath.svg' },
        { revision: 'fd568627680bec661d384ed37ed51bf4', url: '/symbols/mulberry/bird_cage.svg' },
        { revision: 'bc2f4bfeaf66d37ef3ca011568838942', url: '/symbols/mulberry/bird_feeder.svg' },
        { revision: 'a4be7fb62ff80e1167fd2def99526c66', url: '/symbols/mulberry/bird_seed.svg' },
        {
          revision: '29b9dd8a3eaff6fc558a6629212c182a',
          url: '/symbols/mulberry/birthday_cake.svg',
        },
        {
          revision: '68ce0cff7ea86119d022b3db85893b9b',
          url: '/symbols/mulberry/birthday_card.svg',
        },
        {
          revision: 'd5ebcc8e5fcafc9327d1be63f1db3af6',
          url: '/symbols/mulberry/biscuit_chocolate_chip.svg',
        },
        { revision: '7882c1559bfa2ef098af46fd0b500b47', url: '/symbols/mulberry/biscuits.svg' },
        { revision: 'ba471422c64a1c2ac6ae1c8f552fd822', url: '/symbols/mulberry/bite_,_to.svg' },
        { revision: '8fc1bb394987c067471f2c8bd2dc9251', url: '/symbols/mulberry/black.svg' },
        { revision: 'ec69699f8eab8ae7dee632a4965d3099', url: '/symbols/mulberry/blackberry.svg' },
        { revision: '7986f3664b4a5afe2fa62622b14c1f44', url: '/symbols/mulberry/blackboard.svg' },
        {
          revision: '79d916162f8ef472df48e20be554b0fc',
          url: '/symbols/mulberry/blackcurrant_juice.svg',
        },
        {
          revision: '99e14204cf417e3905d782cb11d527de',
          url: '/symbols/mulberry/blackcurrants.svg',
        },
        { revision: 'b799dbf93bc7bd9a06cbc9f87396bfa2', url: '/symbols/mulberry/bladder.svg' },
        {
          revision: 'eb0cd22d5420e4b7d0dfadc475699342',
          url: '/symbols/mulberry/bladder_kidneys.svg',
        },
        { revision: '0c38aed8691eff21bedfda270fda9b19', url: '/symbols/mulberry/blanket.svg' },
        {
          revision: '644f348a1f06776604a279e4897b5313',
          url: '/symbols/mulberry/blanket_chest.svg',
        },
        {
          revision: '8885c3a706631372db32b9b755b9f972',
          url: '/symbols/mulberry/blender_drinks.svg',
        },
        { revision: '011de4314b67979d65318dacdc0157cf', url: '/symbols/mulberry/bless_,_to.svg' },
        { revision: 'cfd532d563b57f11cbdd33a801ff42b5', url: '/symbols/mulberry/blind.svg' },
        { revision: '0269491da95b640af5a72b18db271940', url: '/symbols/mulberry/blind_2.svg' },
        { revision: 'abb337966d1336b8bb31182d6206220a', url: '/symbols/mulberry/blinds.svg' },
        { revision: '4a45a400433739361957dab6129561f3', url: '/symbols/mulberry/blink_,_to.svg' },
        {
          revision: '8e85ba07f7a915633a4c8227e3bd9549',
          url: '/symbols/mulberry/blood_pressure.svg',
        },
        { revision: '1a29281360d708dada3c0af68c86716b', url: '/symbols/mulberry/blouse.svg' },
        { revision: '4eb3c7cf865c207d45ede8e7519dba2f', url: '/symbols/mulberry/blow_,_to.svg' },
        {
          revision: '82a775c5416bcbc04e4cd37b674bb836',
          url: '/symbols/mulberry/blow_kiss_,_to.svg',
        },
        { revision: '52915361fad591bab4a4167412f29439', url: '/symbols/mulberry/blue.svg' },
        { revision: 'fe0c5aaa010aae778e747f241f8bcaef', url: '/symbols/mulberry/blue_dark.svg' },
        { revision: '80d10e22a16e49406935c81f1502b36c', url: '/symbols/mulberry/blue_light.svg' },
        { revision: 'aa0493d50a21944aad81eeb8b74d768c', url: '/symbols/mulberry/blusher.svg' },
        { revision: '2daac156d0ee674f34646ec2a5a92cc7', url: '/symbols/mulberry/boat.svg' },
        { revision: 'b4874f2df77b413b12b97a5f5498c739', url: '/symbols/mulberry/bobble_hat.svg' },
        { revision: '9799190bb4e590938f6fdfc74dfb954c', url: '/symbols/mulberry/boccia.svg' },
        { revision: 'f8e54e01ad7d5c7af1a5e96d6928754b', url: '/symbols/mulberry/boccia_chute.svg' },
        { revision: '22da61ce4591f80f2d900a32284ac6ce', url: '/symbols/mulberry/body_outline.svg' },
        { revision: 'dce704c8251cc9583927f9b538f16a8f', url: '/symbols/mulberry/bolt.svg' },
        { revision: 'e02a42b64bd769c09607b3e0d46bb0b9', url: '/symbols/mulberry/bone.svg' },
        { revision: 'ce96e8938569a2a1798e7b8907c27e50', url: '/symbols/mulberry/bone_2.svg' },
        { revision: '8085b3c76071da16747c9dad4eac8971', url: '/symbols/mulberry/bonfire.svg' },
        { revision: '44f115e70ccbdbf18e7078dd62189521', url: '/symbols/mulberry/book_end.svg' },
        { revision: '7446d4f47f764802be7ad40aa080fac0', url: '/symbols/mulberry/book_ends.svg' },
        { revision: '49cdd4d69458273c40d484311b0329ea', url: '/symbols/mulberry/book_shelf.svg' },
        { revision: 'e41c8283f3944be4e418e42e8c87914c', url: '/symbols/mulberry/bookcase.svg' },
        { revision: '8777f98f274f212fee574f3b2353764b', url: '/symbols/mulberry/bootees.svg' },
        { revision: '0b8f2c09014ec30fe70bab9956abbf28', url: '/symbols/mulberry/boots.svg' },
        { revision: '419c5ccf8c7cea00c1a3ee56b34f9cce', url: '/symbols/mulberry/both.svg' },
        { revision: '3d9dd87ef730c0fcad7b1d945339b593', url: '/symbols/mulberry/bottom.svg' },
        { revision: '178c6c40326da1eeee9db6ac3853d3dc', url: '/symbols/mulberry/bottom_2.svg' },
        { revision: '133152a43c5a788aed9aeb4ba52b2a49', url: '/symbols/mulberry/bottom_3.svg' },
        { revision: 'f8de77310ecd10346943614211024bdd', url: '/symbols/mulberry/bounce_,_to.svg' },
        {
          revision: '00eece9022fee15ad9b95b1f09a5e538',
          url: '/symbols/mulberry/bounce_ball_,_to.svg',
        },
        { revision: '4348a5294331f15568950d303cd5ccd0', url: '/symbols/mulberry/bow.svg' },
        {
          revision: '96c872734d5f7f4b3bb5e83e7b096354',
          url: '/symbols/mulberry/bow_and_arrow.svg',
        },
        { revision: '18488d54255367da477f6cac7bc160e1', url: '/symbols/mulberry/bow_tie.svg' },
        { revision: '19d2f146b4379daee9c7d4f548ac264d', url: '/symbols/mulberry/bowl.svg' },
        { revision: '70f7d1e407a8d38dcfde6b41fb268a21', url: '/symbols/mulberry/bowler_1.svg' },
        { revision: '81f15bf58de978e4c61ea6bd16d4e7e4', url: '/symbols/mulberry/bowling.svg' },
        { revision: '5cc4c0e8c0970b751768b17fab56c2e9', url: '/symbols/mulberry/bowling_ball.svg' },
        {
          revision: 'f1bf70054186ebe743475b3d1a30fd76',
          url: '/symbols/mulberry/bowling_gutter.svg',
        },
        { revision: '524b1b2f7e3ccfd85952ca1139f2cf3a', url: '/symbols/mulberry/bowling_pins.svg' },
        {
          revision: 'b3030ad3fdcf2d4250339d2ae01bdb38',
          url: '/symbols/mulberry/bowling_spare.svg',
        },
        {
          revision: 'a9cadcf3179251355d019cfb0fedcf8c',
          url: '/symbols/mulberry/bowling_strike.svg',
        },
        { revision: 'a2af5483da4d5fbc69e9d3dbb5a04235', url: '/symbols/mulberry/box_,_to.svg' },
        { revision: '46e50516e7656e35d7a2bd73822dcccf', url: '/symbols/mulberry/boxer_shorts.svg' },
        { revision: '7f2f1d77fa5c4912f1fb2408b6e9068c', url: '/symbols/mulberry/bra.svg' },
        { revision: 'f900884fb97f75948c6d85a6732971f9', url: '/symbols/mulberry/bracelet_1.svg' },
        { revision: '1b06d81c0b5038f3715885206956bbb3', url: '/symbols/mulberry/bracelet_2.svg' },
        { revision: 'a2356ec41779600cc87ca3202268124e', url: '/symbols/mulberry/brain.svg' },
        { revision: 'b31b5ef33de43abc02853e1dcc20bbbb', url: '/symbols/mulberry/branch.svg' },
        { revision: 'd5949b9e432b4b352b6b435f3d32f4f2', url: '/symbols/mulberry/brazil_nut.svg' },
        { revision: 'fd01e376238498f114d53102a551cf4c', url: '/symbols/mulberry/bread.svg' },
        { revision: 'a3ad4f242df7252477b2be123a153b63', url: '/symbols/mulberry/bread_crumbs.svg' },
        { revision: '167c5bf9fd4701cd29d46f4de8ec650b', url: '/symbols/mulberry/bread_roll.svg' },
        { revision: '770abebbcdabacea206533a678be8090', url: '/symbols/mulberry/bread_roll_2.svg' },
        { revision: '1dc6c0c7f62dba6d49fb96dc74d9a544', url: '/symbols/mulberry/bread_roll_3.svg' },
        {
          revision: '5d838e5015c7637d6b1da092bc5a2610',
          url: '/symbols/mulberry/bread_roll_filled.svg',
        },
        {
          revision: 'd10cf7f7c14eb19e3e967ecb75292e22',
          url: '/symbols/mulberry/bread_roll_granary.svg',
        },
        { revision: '99160ba3d443f8d5c96238d198488066', url: '/symbols/mulberry/bread_slice.svg' },
        { revision: '9472352d780c39ca91dfc2fadbea5fe2', url: '/symbols/mulberry/bread_sliced.svg' },
        {
          revision: 'c368beca635e548ce89f4d6efe46ef74',
          url: '/symbols/mulberry/breafkfast_continental_1.svg',
        },
        {
          revision: '79002dfdb8445a62bdc6725fb3582c79',
          url: '/symbols/mulberry/breafkfast_continental_2.svg',
        },
        {
          revision: '36cd7dbc181595f561d83b006557b2f3',
          url: '/symbols/mulberry/breafkfast_fried.svg',
        },
        { revision: '89ec22b2773d89dca3ba06f72163dd80', url: '/symbols/mulberry/break_,_to.svg' },
        { revision: '8b1de92c8dccb884cf4a9c994c83c0e5', url: '/symbols/mulberry/break_2.svg' },
        {
          revision: '6f247a44c7e61edd0b04234b02abd08e',
          url: '/symbols/mulberry/break_egg_,_to.svg',
        },
        { revision: '1e3220495b202a21423ba47141e1c87f', url: '/symbols/mulberry/break_time_1.svg' },
        { revision: 'e669770cdeb7a4231975bf15fc52a0ad', url: '/symbols/mulberry/break_time_2.svg' },
        { revision: '751287a69e43e676a9c1e3593288f41d', url: '/symbols/mulberry/breakfast_1.svg' },
        { revision: '7cf61ba1e3fb1739b24ea59e5d268314', url: '/symbols/mulberry/breakfast_2.svg' },
        { revision: '2e6c6c70b72f99bca1f60a8061af51a0', url: '/symbols/mulberry/breakfast_3.svg' },
        { revision: '2f40f0d5d7954252575b11060cb9b507', url: '/symbols/mulberry/breakfast_4.svg' },
        { revision: '5973f278b6f8ac0325e7fbf03ce6681c', url: '/symbols/mulberry/breakfast_5.svg' },
        { revision: '056a999eb52199976ec470194fa75edd', url: '/symbols/mulberry/breakfast_6.svg' },
        {
          revision: '200ded0543109213984d6e1a8a403d63',
          url: '/symbols/mulberry/breakfast_time.svg',
        },
        {
          revision: 'baecd86abb48d83cf723cab60c55673c',
          url: '/symbols/mulberry/breakfast_time_1.svg',
        },
        { revision: 'a191fbbc8184acbf8e48ada047141b3a', url: '/symbols/mulberry/bricks.svg' },
        { revision: 'be3e40bcd818c947368ab55a28c7207c', url: '/symbols/mulberry/bridle.svg' },
        { revision: '8a5d55691ffca2e3b0b7d02a9473d08d', url: '/symbols/mulberry/briefcase_1.svg' },
        { revision: '7dffb55387380bf6ee6e07e02de057fb', url: '/symbols/mulberry/briefcase_2.svg' },
        { revision: '2fe192c64f95fb3ba0f6fbe6c932ff75', url: '/symbols/mulberry/bright.svg' },
        { revision: 'af0ea8d0ce8c005bbeb1f114e38d6410', url: '/symbols/mulberry/bright_room.svg' },
        { revision: '35f5b3513617a41c96972e8031fa6237', url: '/symbols/mulberry/bring_,_to.svg' },
        { revision: '1d981098b00e0618208700e8f3348a07', url: '/symbols/mulberry/broad_beans.svg' },
        { revision: 'ecafee3e88f17c8fbd5e64f50f603437', url: '/symbols/mulberry/broccoli.svg' },
        { revision: 'c3fedcddde7ed189c74951ab410ba3ea', url: '/symbols/mulberry/broken.svg' },
        { revision: '3a3645c4d7fe447c51da44c8c8ad108e', url: '/symbols/mulberry/broken_bone.svg' },
        { revision: 'de95e6d2891902db46a746fc24b4763b', url: '/symbols/mulberry/brooch.svg' },
        { revision: '961b96f4323962cb5242dd5d68313d3f', url: '/symbols/mulberry/broom.svg' },
        { revision: '57be4417b9b6b7d15ac6e7be598db4d2', url: '/symbols/mulberry/broomstick.svg' },
        { revision: 'bd015e872f63911686041c8d2ff74478', url: '/symbols/mulberry/brother.svg' },
        { revision: '12ff911434cde203d81b5fbec629f46c', url: '/symbols/mulberry/brown.svg' },
        {
          revision: 'b427b135a5a45f2d89e5f10336a1cbdf',
          url: '/symbols/mulberry/brush_animal_,_to.svg',
        },
        {
          revision: 'f43ca824366117af744981fda515e712',
          url: '/symbols/mulberry/brush_hair_,_to.svg',
        },
        {
          revision: 'c6ec1ecc2303e24056cc3bd552403406',
          url: '/symbols/mulberry/brush_teeth_,_to.svg',
        },
        {
          revision: 'a553ad11a72d5864609d413fa6c8debf',
          url: '/symbols/mulberry/brussel_sprouts.svg',
        },
        { revision: 'c55ed637d11714c2bc89f93f7f3b12d8', url: '/symbols/mulberry/bubble_bath.svg' },
        {
          revision: '8711260f682719b2182c720ad0d35784',
          url: '/symbols/mulberry/bubble_gum_-_blow.svg',
        },
        {
          revision: 'cb6aa034763cf7fe6704184e7b4f37de',
          url: '/symbols/mulberry/bubble_mixture.svg',
        },
        { revision: '4ac2fc1c9c617d8dc10efdd7088266a4', url: '/symbols/mulberry/bubble_wand.svg' },
        { revision: '25fc0f3b7b07f2e22c9cb8f195a76282', url: '/symbols/mulberry/bubble_wrap.svg' },
        { revision: 'f1bcccb6aa10817c7bcff1093ebf0417', url: '/symbols/mulberry/bubbles.svg' },
        { revision: 'c1fc7b6fb4b8f22b78925c03495a774b', url: '/symbols/mulberry/bubbles_blow.svg' },
        { revision: 'a76e2c242467696de5a055cd475e7e0f', url: '/symbols/mulberry/bucket.svg' },
        { revision: '35482cb172edefc15e466e2633c29804', url: '/symbols/mulberry/buckle.svg' },
        { revision: '19cc951d4a385d024b18421846f67571', url: '/symbols/mulberry/bud.svg' },
        { revision: 'd2ae6d6fd450d31bb235d9b506a6a9aa', url: '/symbols/mulberry/budgie.svg' },
        { revision: '487985877f532ec287a048116a59b564', url: '/symbols/mulberry/buffalo.svg' },
        { revision: 'e80e390861c0c15810b29bd1b236bae3', url: '/symbols/mulberry/build_,_to.svg' },
        { revision: '023668973b1bc3474c924a895ab9828c', url: '/symbols/mulberry/bulb_holder.svg' },
        {
          revision: '7488ae036f6d8f5423fe18f7eae9eb82',
          url: '/symbols/mulberry/bulb_holder_2.svg',
        },
        { revision: '4f57a386a555f0535f5b6846a0b0d4dc', url: '/symbols/mulberry/bumpy.svg' },
        {
          revision: 'a36be0c75bea18a9c68771642ca31585',
          url: '/symbols/mulberry/bun_-_hot_cross.svg',
        },
        { revision: 'a7f0d81fa8e6717e6857c9247b63369c', url: '/symbols/mulberry/bun_currant.svg' },
        { revision: 'c829aa15369a25451a492ac6f9e52435', url: '/symbols/mulberry/bunk_beds.svg' },
        { revision: '66b5a41ad71284d1829212ceb5d8040e', url: '/symbols/mulberry/burn.svg' },
        { revision: '128606d3511f1960b9c1b02b72c1d9ee', url: '/symbols/mulberry/burn_2_,_to.svg' },
        { revision: 'c7dc4dd9238677a91e8e067e078a20ef', url: '/symbols/mulberry/bus.svg' },
        {
          revision: '4330f1a402a5e9007bae7927d01e58d6',
          url: '/symbols/mulberry/bus_double_decker.svg',
        },
        {
          revision: '2f669aee6df16c6c44b6adeabc9b20c2',
          url: '/symbols/mulberry/bus_single_decker.svg',
        },
        { revision: '50dc5d243f38fe9dce49252bc43b3baf', url: '/symbols/mulberry/bush.svg' },
        { revision: 'b94ffaca7c8634d011539a8ddadf388c', url: '/symbols/mulberry/busy.svg' },
        { revision: '538ca34c893e2aeb9b0438ba9831318c', url: '/symbols/mulberry/butter.svg' },
        { revision: '703c342fd15bec67eaaa3de160786478', url: '/symbols/mulberry/butterfly.svg' },
        {
          revision: '991ecb284bd5eba666e314a251557d94',
          url: '/symbols/mulberry/butternut_squash.svg',
        },
        { revision: 'dec0ea13e76674c37dd990ae96497300', url: '/symbols/mulberry/button.svg' },
        {
          revision: '17e0177c32fb207bf87b057a220b83f9',
          url: '/symbols/mulberry/c_-_lower_case.svg',
        },
        { revision: '0eeca9c8c7384150fb4da30e173f35e2', url: '/symbols/mulberry/cabbage.svg' },
        { revision: '31023e494ef6e48c2fed59de8176f0c4', url: '/symbols/mulberry/cable_tv.svg' },
        { revision: 'b9152c14960fd734855801e188c383ef', url: '/symbols/mulberry/cactus.svg' },
        { revision: 'dcb90a979a9012e1d9afc42cb6e9df26', url: '/symbols/mulberry/cafe.svg' },
        { revision: '56b2dc313399296932c6a96483e7c31b', url: '/symbols/mulberry/cafe_2.svg' },
        { revision: '15d929477e0092beb72539a7a17cf1ea', url: '/symbols/mulberry/cage.svg' },
        { revision: '33e11279a6b65fed8772a0f927d23bb0', url: '/symbols/mulberry/cake.svg' },
        { revision: '9ab000cfe4d81a0a660752a6a911126a', url: '/symbols/mulberry/cake_bar.svg' },
        { revision: 'c67934abcb2a90421909191740016255', url: '/symbols/mulberry/cake_case.svg' },
        {
          revision: '02ab09dac6a3056bf7cd8ad279512c9a',
          url: '/symbols/mulberry/cake_cup_cake.svg',
        },
        { revision: 'a918f7ebc211507595103f5cdc6be9db', url: '/symbols/mulberry/cake_mix.svg' },
        { revision: '31b8cc79571b646122322282e833b842', url: '/symbols/mulberry/cake_slice.svg' },
        { revision: '704544eecfa3f372ec28e919065094cb', url: '/symbols/mulberry/cake_slice_2.svg' },
        { revision: '22c56ca919e2695c34c1b7860ac2d9c1', url: '/symbols/mulberry/cake_sponge.svg' },
        { revision: '11c0d4c4e9825d9ff061725fcf2a95be', url: '/symbols/mulberry/cake_tin.svg' },
        { revision: '7457bb876561a9f9d4f1fdfddde8ddf9', url: '/symbols/mulberry/calculator.svg' },
        { revision: '4542c01460b5dd75338bf767bf93ba54', url: '/symbols/mulberry/calendar.svg' },
        {
          revision: '255be6dfc293427f51785749c6904904',
          url: '/symbols/mulberry/calendar_month.svg',
        },
        { revision: '96e26576e15976c1a68b70c4997b5a44', url: '/symbols/mulberry/calf.svg' },
        {
          revision: 'e372be1a2eadd24fa6a8c4b5771af20c',
          url: '/symbols/mulberry/call_out_,_to.svg',
        },
        { revision: 'eefd5122f0097228ed207644f239af7c', url: '/symbols/mulberry/camel.svg' },
        { revision: '2da5fd5b6f891c06dee05d4dfbf82368', url: '/symbols/mulberry/camera.svg' },
        { revision: 'fce6e52acfb5ea2d0a4c2efa0d133fcc', url: '/symbols/mulberry/camera_SLR.svg' },
        {
          revision: '77e7d86a7defde33a300d84c23fc2dcb',
          url: '/symbols/mulberry/camera_compact.svg',
        },
        { revision: '4b33b0a3499a240a10685738ac5c3575', url: '/symbols/mulberry/camp_,_to.svg' },
        { revision: '9e78d9b11bdd1cc1669800cd5e679f22', url: '/symbols/mulberry/can_opener.svg' },
        {
          revision: 'c2178ec38787cd3cf5ec7f41f0fe7f55',
          url: '/symbols/mulberry/can_opener_electric.svg',
        },
        { revision: 'd303b610ab3a72aaa3f5d8ca5e46e2ce', url: '/symbols/mulberry/candle_2.svg' },
        { revision: '4635db6cb39c0c031395f659e538a01e', url: '/symbols/mulberry/candy_cane.svg' },
        { revision: 'e7c528385728cd819a8e4adff9f84377', url: '/symbols/mulberry/candy_floss.svg' },
        { revision: 'deee0eb2af9d8a4edc14a7709f4b676f', url: '/symbols/mulberry/candy_hearts.svg' },
        { revision: '2e802de8984c68b33c0527df23b2adc1', url: '/symbols/mulberry/canoe.svg' },
        { revision: '57b4bbf279c206407b98105b22e26663', url: '/symbols/mulberry/cap.svg' },
        { revision: '07a75de669d6790bc0c5e837270f99fa', url: '/symbols/mulberry/car.svg' },
        { revision: '3d6f230f14bc258917194b62ae8d344f', url: '/symbols/mulberry/car_2.svg' },
        { revision: '84db3ed0eb37f6299a5b3ebc450c1f11', url: '/symbols/mulberry/car_boot.svg' },
        { revision: 'd8746e1926f9fbc70ab48a8e60b9ea94', url: '/symbols/mulberry/car_bumper.svg' },
        {
          revision: '41fb0f4582b1b3c557c09def7fe828f4',
          url: '/symbols/mulberry/car_mechanic_1a.svg',
        },
        {
          revision: 'a092e57b03710be378cee8316a78ceea',
          url: '/symbols/mulberry/car_mechanic_1b.svg',
        },
        {
          revision: '70b96d2e345597bd1c4c6ce57deb89d4',
          url: '/symbols/mulberry/car_mechanic_2a.svg',
        },
        {
          revision: 'cfa706131d8530d82a21c8ca34b82f33',
          url: '/symbols/mulberry/car_mechanic_2b.svg',
        },
        { revision: '988ae2756d83d7b38d847cf860d32f50', url: '/symbols/mulberry/car_toy.svg' },
        {
          revision: '930014a38d1c4624129a85c5b3172002',
          url: '/symbols/mulberry/car_transporter.svg',
        },
        { revision: 'd53af7cb4348925080a8c0b80d719882', url: '/symbols/mulberry/caravan.svg' },
        {
          revision: 'defb21a9fe476bf9c8a69ba24dc8c356',
          url: '/symbols/mulberry/carbohydrates.svg',
        },
        { revision: '03e61436903f4402bf60e2ad3dc5dc28', url: '/symbols/mulberry/card.svg' },
        { revision: '6a097d773bb44e451be956b75af6e619', url: '/symbols/mulberry/cardboard.svg' },
        {
          revision: '5ab3aad099e96bcba30fb75ce68be08e',
          url: '/symbols/mulberry/care_assistant_1a.svg',
        },
        {
          revision: '035872d992931c0ff99cad206169b58a',
          url: '/symbols/mulberry/care_assistant_1b.svg',
        },
        {
          revision: '559c51dee65cc39272b69c9cf78e4f63',
          url: '/symbols/mulberry/care_assistant_2a.svg',
        },
        {
          revision: '515bcebfbacf654afe773dda3933d94e',
          url: '/symbols/mulberry/care_assistant_2b.svg',
        },
        {
          revision: '164245cfbe2cb9dc92c4353209f92605',
          url: '/symbols/mulberry/care_assistant_3a.svg',
        },
        {
          revision: '0b77cc60c6fab538875f40b8b108dd02',
          url: '/symbols/mulberry/care_assistant_3b.svg',
        },
        {
          revision: '7b8c8bb977594b6ec65d09a7139390bc',
          url: '/symbols/mulberry/care_assistant_4a.svg',
        },
        {
          revision: 'e61c2f58aa1b41d06704f036065ec976',
          url: '/symbols/mulberry/care_assistant_4b.svg',
        },
        {
          revision: 'b62652fddbbfc0c198010373f3331e28',
          url: '/symbols/mulberry/care_assistant_5a.svg',
        },
        {
          revision: 'd3f22376bb09171bab8ae0656d26821c',
          url: '/symbols/mulberry/care_assistant_5b.svg',
        },
        {
          revision: 'd25f8b9645a0a6295db0ac4a9e266a2b',
          url: '/symbols/mulberry/care_assistant_6a.svg',
        },
        {
          revision: '0b8accc0d17f7b211576b8cb42364bca',
          url: '/symbols/mulberry/care_assistant_6b.svg',
        },
        { revision: 'c8450e5b7953268b9fba130cd6331190', url: '/symbols/mulberry/caretaker_1a.svg' },
        { revision: '832850c6295de50089a8c8b65915d053', url: '/symbols/mulberry/caretaker_1b.svg' },
        { revision: '347f135396b05c515c22a6a87783861c', url: '/symbols/mulberry/caretaker_2a.svg' },
        { revision: 'bcbd5b872c7ad08468d579b76754ac96', url: '/symbols/mulberry/caretaker_2b.svg' },
        { revision: '924a94151c3fd9ea5ee93f6b141ac14d', url: '/symbols/mulberry/carol_singer.svg' },
        { revision: 'bcf7c367ee7d7e08e3ae2c57809ee941', url: '/symbols/mulberry/carpenter_1a.svg' },
        { revision: 'e41ca5d1e9396f73e1bd6872b5e3715b', url: '/symbols/mulberry/carpenter_1b.svg' },
        { revision: 'e21fc879d1a0798ff2682aeacc7701c3', url: '/symbols/mulberry/carpenter_2a.svg' },
        { revision: '77e848690a4d5195257c988d9472b2d5', url: '/symbols/mulberry/carpenter_2b.svg' },
        { revision: '43bc17ea821ee927c9a07600d08a9f4b', url: '/symbols/mulberry/carrot.svg' },
        { revision: '53b2deaf83cc326f2d77da182f06f69a', url: '/symbols/mulberry/carry_,_to.svg' },
        {
          revision: '844b594c638606cbebf4d9031009e1a1',
          url: '/symbols/mulberry/carry_books_,_to.svg',
        },
        { revision: '26ce5add85df7d321bfa096205dc8cf8', url: '/symbols/mulberry/cart.svg' },
        { revision: '6e5cf4ca26ea62e893fd2902dd155ac5', url: '/symbols/mulberry/carton_1.svg' },
        { revision: 'a785dc23451913c7f1e965d25a7b650a', url: '/symbols/mulberry/carton_2.svg' },
        {
          revision: '27f15bdb357c2a4b4c889708c800e7a0',
          url: '/symbols/mulberry/carve_meat_,_to.svg',
        },
        {
          revision: 'acff7117c61ca62aa0a757c3f65a3c64',
          url: '/symbols/mulberry/carve_wood_,_to.svg',
        },
        { revision: '6964eaa98619aac632db7e439f62a18c', url: '/symbols/mulberry/cash_point.svg' },
        { revision: 'f61896863acff2a19bd9e87b7b1e73f2', url: '/symbols/mulberry/cashew.svg' },
        { revision: '3fffddab2173047e32eab34ea95a9a4b', url: '/symbols/mulberry/casserole.svg' },
        { revision: '9f9e611fb66c721d0e30d4e2aa74d28a', url: '/symbols/mulberry/casserole_1.svg' },
        { revision: '276fe471e233032896fa752b99e66ea1', url: '/symbols/mulberry/casserole_2.svg' },
        {
          revision: 'fc96afc6242b838cadd9d15d09e8ed73',
          url: '/symbols/mulberry/cassette_tape.svg',
        },
        { revision: 'c06b7607d5bc4e40b293f3bb1a4313ff', url: '/symbols/mulberry/castle.svg' },
        { revision: 'cd605a4eac7973b1523b9681ffa93c4e', url: '/symbols/mulberry/castor_sugar.svg' },
        { revision: 'd3c8495ad3c3b61e09adf07ef69bd95e', url: '/symbols/mulberry/cat.svg' },
        { revision: '8151f2a31246e65cd9f5f8a87912efbe', url: '/symbols/mulberry/cat_bed.svg' },
        { revision: '792f907898d11dc85ee0136b6dbffcc0', url: '/symbols/mulberry/cat_biscuits.svg' },
        { revision: 'ac2f1ee361c88d52a47d6f2d3ef34ce3', url: '/symbols/mulberry/cat_food.svg' },
        { revision: '73effa2bdd4355300c60ea5d9f70d655', url: '/symbols/mulberry/catch_,_to.svg' },
        { revision: '27a4a90b5932626c1c7bcff924e4ede1', url: '/symbols/mulberry/catch_2_,_to.svg' },
        { revision: '7a05e32d837771fc7779edfad92fd71e', url: '/symbols/mulberry/caterpillar.svg' },
        {
          revision: '0ce78a041313e224584157ab149fc877',
          url: '/symbols/mulberry/catherine_wheel.svg',
        },
        { revision: 'a4ccf078ffcae8e8b93c2d901d21c4d6', url: '/symbols/mulberry/cauliflower.svg' },
        { revision: 'c9d2f18de2a1c5a9058f9deda7302a6a', url: '/symbols/mulberry/cctv.svg' },
        { revision: '2440563e4a1467e82d7790dc7324dea4', url: '/symbols/mulberry/ceiling.svg' },
        {
          revision: 'c786881f26050626f27d7eca9ba9f6c4',
          url: '/symbols/mulberry/ceiling_light.svg',
        },
        {
          revision: '442be995b5fd7d013dd75630041106ed',
          url: '/symbols/mulberry/celebrate_1_,_to.svg',
        },
        {
          revision: '6adb1e3205834435ed19a4e5a7923661',
          url: '/symbols/mulberry/celebrate_2_,_to.svg',
        },
        {
          revision: 'f2926c40c14da7a300445f498adfa610',
          url: '/symbols/mulberry/celebrate_3_,_to.svg',
        },
        {
          revision: '7f3fa65d2a6e2b41b9d10b0b6efe4342',
          url: '/symbols/mulberry/celebrate_birthday.svg',
        },
        { revision: '37969579800ffaf6fcbfb2c51d2d0656', url: '/symbols/mulberry/celebration.svg' },
        { revision: 'd4dc15faa0f7ac492f1d86073f3ee16f', url: '/symbols/mulberry/celeriac.svg' },
        { revision: 'd81568bffe3913cfe2b701207e25926e', url: '/symbols/mulberry/celery.svg' },
        { revision: 'c10f9b64e98b64fb0d74ae3f7d9f2436', url: '/symbols/mulberry/cement_mixer.svg' },
        { revision: '2ca66217f0c4fbe0fd9c0d0b05ba41d1', url: '/symbols/mulberry/centipede.svg' },
        { revision: '121e12b2a5208bbf44229f808d7277fb', url: '/symbols/mulberry/cereal.svg' },
        { revision: '0cebb2f0702cc13a741e8ef748ba93f0', url: '/symbols/mulberry/cereal_bowl.svg' },
        {
          revision: '801ff6da6cb350e06d91c695f19d3dc5',
          url: '/symbols/mulberry/cereal_box_bran.svg',
        },
        {
          revision: 'c4754b42df02fcfc5005f5d7f61ce23f',
          url: '/symbols/mulberry/cereal_box_museli.svg',
        },
        { revision: '30f94cd6aa4cc4ca110dcde0086299bb', url: '/symbols/mulberry/cereal_bran.svg' },
        {
          revision: '04e8563083398254822308953e108bcb',
          url: '/symbols/mulberry/cereal_museli.svg',
        },
        { revision: 'ac522d818e2825af77346adb7e705585', url: '/symbols/mulberry/certificate.svg' },
        { revision: 'c981e92e6007c62255a9d1cf9ce706a4', url: '/symbols/mulberry/chair.svg' },
        {
          revision: '99857e452ba051ee2a7774c6f027d32c',
          url: '/symbols/mulberry/chair_computer.svg',
        },
        { revision: 'f5f8efe4df25d8bd29199ee0f91fa478', url: '/symbols/mulberry/chair_dining.svg' },
        {
          revision: 'a1ce928c2034f06f2a5675baf33b4ba7',
          url: '/symbols/mulberry/chair_wing_back.svg',
        },
        {
          revision: '6f16aa35fc55b97611baa09bd9fa28ea',
          url: '/symbols/mulberry/chaise_lounge.svg',
        },
        { revision: '89eae366105fdcd7e87a4cf060b28919', url: '/symbols/mulberry/chalk.svg' },
        { revision: 'a32824698903e91bed65961449e02792', url: '/symbols/mulberry/chameleon.svg' },
        { revision: '735673128573842f4d4adf7b8f3b85b5', url: '/symbols/mulberry/champagne.svg' },
        { revision: '51c99201ff7fb4493f85b0936f299ea0', url: '/symbols/mulberry/chandelier.svg' },
        { revision: '112313d448bb51ef9fcc629d5edd9b94', url: '/symbols/mulberry/change_,_to.svg' },
        {
          revision: 'c71dd9482ca08034e7a087933b0639b0',
          url: '/symbols/mulberry/change_clothes_,_to.svg',
        },
        {
          revision: '00ea9cd75cbe4acb97b13f86e8d4b3fa',
          url: '/symbols/mulberry/change_mind_,_to.svg',
        },
        {
          revision: 'ff87d2a7425dfd77bffeec3e743bfc08',
          url: '/symbols/mulberry/change_nappy_,_to.svg',
        },
        {
          revision: 'dc1b24a9428511b97566308e1cb9402b',
          url: '/symbols/mulberry/change_tv_channel_,_to.svg',
        },
        {
          revision: 'accf75bee825947dd8c7daf434fddd90',
          url: '/symbols/mulberry/change_weather_,_to.svg',
        },
        {
          revision: 'd2417f7cf2faa4f3046b170ad271ca9d',
          url: '/symbols/mulberry/channel_bbc_1.svg',
        },
        { revision: '79347481bc4a827f51dbf5a8e6f78e3b', url: '/symbols/mulberry/chapatti.svg' },
        { revision: '57024008a82858b7f0a7f5ce121ba222', url: '/symbols/mulberry/charge.svg' },
        {
          revision: '6d5d116a3cedbc369a6ff8f2b7756474',
          url: '/symbols/mulberry/charger_electric.svg',
        },
        { revision: 'ec58bed198e87a6b18bf1bc52229e2bd', url: '/symbols/mulberry/chase_,_to.svg' },
        { revision: '2f2f0323964cc9af05fa4f359143051e', url: '/symbols/mulberry/cheat_,_to.svg' },
        { revision: 'dd4438eea413dc1f0adb8d31af3bf825', url: '/symbols/mulberry/cheek.svg' },
        { revision: '53d01d89e8820dcd767174c7a555ccf8', url: '/symbols/mulberry/cheese.svg' },
        { revision: 'ca417e527b63e79797c9d2c3d0996267', url: '/symbols/mulberry/cheese_brie.svg' },
        {
          revision: '75e002040f8f882ee8498682421ffb9c',
          url: '/symbols/mulberry/cheese_burger.svg',
        },
        {
          revision: '4997059f4f26953366f977f9fce5d090',
          url: '/symbols/mulberry/cheese_grated.svg',
        },
        {
          revision: '2f758fb9bd15a084ead582c7a47a102b',
          url: '/symbols/mulberry/cheese_on_toast_,_melted.svg',
        },
        {
          revision: 'd928f07c7bb58d7e6c523eb56c371756',
          url: '/symbols/mulberry/cheese_slices.svg',
        },
        {
          revision: 'd7797c185692da957bdfd5b6772cbe0f',
          url: '/symbols/mulberry/cheese_stilton.svg',
        },
        { revision: 'd96461761232a82e3e36e56c44147d29', url: '/symbols/mulberry/cheetah.svg' },
        { revision: '017a04c9bc23828344d194b04e232b06', url: '/symbols/mulberry/cheque_book.svg' },
        { revision: 'c51a504200f1d6037ba89295d7a708c2', url: '/symbols/mulberry/cherry.svg' },
        { revision: '7d53a2a8c0f98aed57469e6690898e1c', url: '/symbols/mulberry/chest_female.svg' },
        { revision: 'e042e357ed35739ebd36939020256955', url: '/symbols/mulberry/chest_male.svg' },
        {
          revision: 'dd346e28d580b40a2da1bb29a71bd129',
          url: '/symbols/mulberry/chest_of_drawers.svg',
        },
        { revision: 'd2ee0231d04b178ad22268d98a6ec27f', url: '/symbols/mulberry/chestnuts.svg' },
        { revision: 'fab19967da63317fe94c3718f62176cd', url: '/symbols/mulberry/chew_,_to.svg' },
        { revision: 'c774da1d5e06b65f1041075f2fdfa0e3', url: '/symbols/mulberry/chewing_gum.svg' },
        { revision: '1dcce6ffd80b1ca31092e2af27d8154f', url: '/symbols/mulberry/chewy_tube.svg' },
        { revision: 'a489c43fdf1dd095beeaff8a3d5009d1', url: '/symbols/mulberry/chick.svg' },
        { revision: 'edcbac9bb96a1a54279bfca82f4da5b8', url: '/symbols/mulberry/chicken.svg' },
        {
          revision: '6b4792ee9f601f0b03552b00033a31c5',
          url: '/symbols/mulberry/chicken_breast.svg',
        },
        {
          revision: 'ebd77c1aa52d2b0cb658d0c65219167d',
          url: '/symbols/mulberry/chicken_deep_fried.svg',
        },
        {
          revision: '6096a7136ecbabde87cb2ebc133ada86',
          url: '/symbols/mulberry/chicken_house.svg',
        },
        { revision: 'ba74ee460e0955901e9983c0f57433b1', url: '/symbols/mulberry/chicken_leg.svg' },
        { revision: 'aa2a2f94658b8552914a9dc48d34a86d', url: '/symbols/mulberry/chicken_live.svg' },
        {
          revision: '6c154b99f5e489a3920d97fe24e39d16',
          url: '/symbols/mulberry/chicken_nuggets.svg',
        },
        {
          revision: '323e75ca9aafae47665445b70ffcfc0a',
          url: '/symbols/mulberry/chicken_pieces.svg',
        },
        { revision: '1653a4e09a0ce15025ac2cea36246c49', url: '/symbols/mulberry/chicken_run.svg' },
        { revision: '48fd10c3d92d4495e6db456fd7a1f998', url: '/symbols/mulberry/childrens_tv.svg' },
        {
          revision: 'ee8bacb964b7473efdf744264ba0b667',
          url: '/symbols/mulberry/chilli_pepper.svg',
        },
        { revision: 'b62b63ceb7edbf0b737e622310309e85', url: '/symbols/mulberry/chimney.svg' },
        { revision: 'a4c2becdb867d052e1fe6dd1f7976998', url: '/symbols/mulberry/chimpanzee.svg' },
        { revision: 'e2e06e8c85f461e23dfa20f0d82a9b7d', url: '/symbols/mulberry/chin.svg' },
        {
          revision: '535f77bc466feb34cdd0220c5f06382b',
          url: '/symbols/mulberry/chinese_cabbage.svg',
        },
        { revision: 'b4ece67286b9175ef5bdea347af5c246', url: '/symbols/mulberry/chinese_food.svg' },
        {
          revision: '07e885e01c167ead43f22ec8c25f3e14',
          url: '/symbols/mulberry/chip_and_pin_device.svg',
        },
        { revision: '1d0ca0054f6e51ab40a232126eb9fdb0', url: '/symbols/mulberry/chipmunk.svg' },
        { revision: 'e2c33b38f48bcb64d12b10eb35c25705', url: '/symbols/mulberry/chipmunk_2.svg' },
        { revision: '70a9cd214f0da3ee677281af2faec82a', url: '/symbols/mulberry/chipmunk_3.svg' },
        { revision: 'e8836a03e8029ee3ed2ba0f97f000a89', url: '/symbols/mulberry/chips.svg' },
        { revision: '3355bcba32601adfbb8afa907e1693d6', url: '/symbols/mulberry/chips_packet.svg' },
        { revision: '1568f93b605fe464f9a46a3b5e2231c3', url: '/symbols/mulberry/chisel.svg' },
        { revision: 'cc4276d360781ebf2e6702349bfc84d7', url: '/symbols/mulberry/chocolate.svg' },
        {
          revision: '3130d8938c93554fe966845e377de66a',
          url: '/symbols/mulberry/chocolate_bar.svg',
        },
        {
          revision: '8287402a1ccf90f22424d5e5e65259f4',
          url: '/symbols/mulberry/chocolate_box.svg',
        },
        {
          revision: 'aec292a85809cb3d5f6c6b8c75d5ed41',
          url: '/symbols/mulberry/chocolate_chips.svg',
        },
        {
          revision: 'fc3a4c532dcaac218dcbc4dd9e4f2380',
          url: '/symbols/mulberry/chocolate_egg.svg',
        },
        {
          revision: 'a146189ca1a0e59034d435600e9cfb68',
          url: '/symbols/mulberry/chocolate_log.svg',
        },
        { revision: '4a87d3c2c719388c6363730b16c98165', url: '/symbols/mulberry/choke_,_to.svg' },
        { revision: '95088f04e032889ca2944f681817dd78', url: '/symbols/mulberry/chop_,_to.svg' },
        {
          revision: 'f897a07c5809312b6fb2117d9a4868ae',
          url: '/symbols/mulberry/chop_wood_,_to.svg',
        },
        {
          revision: '59a53885a107f74a5b2194b264298ccd',
          url: '/symbols/mulberry/chopping_board.svg',
        },
        { revision: '5d0b10dd2bbaf05e0d9d378ad3e80afd', url: '/symbols/mulberry/church.svg' },
        { revision: 'e65da6043afcf84c5d61a33a482acbd0', url: '/symbols/mulberry/cigarette.svg' },
        { revision: '8c5f838d2f9726a88a6363a46ff63f82', url: '/symbols/mulberry/circle.svg' },
        { revision: 'f3fc52d0e00d544396116c750e48fb20', url: '/symbols/mulberry/circle_time.svg' },
        { revision: '67d58e4a99d33ab9483a856cae236fcd', url: '/symbols/mulberry/circuit.svg' },
        { revision: 'f22ee4ade9d12dfafa4dc5b74fe2f77b', url: '/symbols/mulberry/clamp.svg' },
        {
          revision: '697a73f601cd31b2f8413cc02300568b',
          url: '/symbols/mulberry/clap_hands_,_to.svg',
        },
        { revision: '11b2e3e600777e8958141f990629b89d', url: '/symbols/mulberry/class_room.svg' },
        { revision: 'd28d8a4bbb3f8ed7b47030062d1101b2', url: '/symbols/mulberry/claw.svg' },
        { revision: 'a09ca6a17bd0242cd2a8c508cfe4513d', url: '/symbols/mulberry/clay.svg' },
        { revision: '0d646244defa437f6e5dc0bf90526c74', url: '/symbols/mulberry/clean_dishes.svg' },
        { revision: '191ed5ef9e1389b381f3d92bc2475b2b', url: '/symbols/mulberry/clean_hands.svg' },
        { revision: '1ff5cdd685cd27786bfb6632563c438a', url: '/symbols/mulberry/clean_room.svg' },
        {
          revision: '5e6d1b9a3909f4b8fe2677a711321a14',
          url: '/symbols/mulberry/clean_shoes_,_to.svg',
        },
        {
          revision: '2fb153e093a8fe920258d90734830c0c',
          url: '/symbols/mulberry/clean_window_,_to.svg',
        },
        { revision: '7d047fb23bef69de79df4fa19f9aa430', url: '/symbols/mulberry/cleaner_1a.svg' },
        { revision: 'a2d4c366d5313e8e41c5780268086884', url: '/symbols/mulberry/cleaner_1b.svg' },
        { revision: '297d425a6560435c5c7153575370d0a9', url: '/symbols/mulberry/cleaner_2a.svg' },
        { revision: '71db5b5ac89ba4fd6cf1ac15e1da5cad', url: '/symbols/mulberry/cleaner_2b.svg' },
        {
          revision: 'ddce3dc22b847040500ec861ed688ac9',
          url: '/symbols/mulberry/cleaner_spray.svg',
        },
        { revision: '785eda6eda8e0fdfd34912dddae8500a', url: '/symbols/mulberry/cleaning_box.svg' },
        {
          revision: '0a5a0861bfa5dead2577d5ade253450b',
          url: '/symbols/mulberry/climb_down_,_to.svg',
        },
        {
          revision: 'fad4659b97c07cc1e09bd30224f3b782',
          url: '/symbols/mulberry/climb_tree_,_to.svg',
        },
        {
          revision: '3224013a26d4098ef151c064abbbe222',
          url: '/symbols/mulberry/climb_up_,_to.svg',
        },
        {
          revision: '2461d9c0aeaf5ea99c3e8a0ed98a0ca2',
          url: '/symbols/mulberry/climbing_rock.svg',
        },
        {
          revision: '18f679ed744f539f0a80b15e979b2053',
          url: '/symbols/mulberry/climbing_wall.svg',
        },
        { revision: 'fe94a466af828063e8b1eed9736f0f11', url: '/symbols/mulberry/clingfilm.svg' },
        {
          revision: 'ddc1710d9e5ce4f082af41fae2abb99c',
          url: '/symbols/mulberry/clip_nails_,_to.svg',
        },
        { revision: 'ddc33f4c42b91a7d6fff72829ea003cc', url: '/symbols/mulberry/clipboard.svg' },
        { revision: '9d890c4a7c0f59d3e3534b3f45fe7f6a', url: '/symbols/mulberry/clock.svg' },
        { revision: 'c78fd450530f29c19ca9e173ad5ba8b7', url: '/symbols/mulberry/clock_radio.svg' },
        { revision: '2aaccc76eebb1fac25962cba8fdb02cf', url: '/symbols/mulberry/close_,_to.svg' },
        {
          revision: '176f3697dc0f76c3927a81af58e3024f',
          url: '/symbols/mulberry/close_door_,_to.svg',
        },
        { revision: '91b955fa87475a2766f0e89c898313bf', url: '/symbols/mulberry/close_to.svg' },
        { revision: 'da0bf9bbce9f56c5aadfc888836af4f6', url: '/symbols/mulberry/closed.svg' },
        { revision: '14c778c5c1179c8cf6965da0282da017', url: '/symbols/mulberry/closed_shop.svg' },
        {
          revision: 'cea9c2485ffa02bf7dd4a0aca30d20d9',
          url: '/symbols/mulberry/clothes_extra_large.svg',
        },
        {
          revision: '58c792cf8c1818031cf438b032ced311',
          url: '/symbols/mulberry/clothes_female.svg',
        },
        {
          revision: '78462f081ae1a7c47644fbf64d1a9520',
          url: '/symbols/mulberry/clothes_generic.svg',
        },
        {
          revision: 'bd72c7405f4458dc4a897a181273029f',
          url: '/symbols/mulberry/clothes_hanger.svg',
        },
        {
          revision: 'f5ecd97334938540b5bcc8a9c63502a5',
          url: '/symbols/mulberry/clothes_large.svg',
        },
        { revision: '49f87d40c7e2de3fb58c67346815404d', url: '/symbols/mulberry/clothes_male.svg' },
        {
          revision: '69301e43c73cb02b422538ad8dd30f9c',
          url: '/symbols/mulberry/clothes_medium.svg',
        },
        { revision: '5149b37cb44883891082f74ffe115b48', url: '/symbols/mulberry/clothes_neat.svg' },
        { revision: '40dc48d79a508d1f51da5fbabab4d37a', url: '/symbols/mulberry/clothes_peg.svg' },
        {
          revision: '7864aabbb30105876a60c0f1247e89b3',
          url: '/symbols/mulberry/clothes_small.svg',
        },
        { revision: '06b3f59d3262f536d4a939db11baa6a4', url: '/symbols/mulberry/cloudy.svg' },
        { revision: '1e7d5bc0e5ceac554b2495b5657016b5', url: '/symbols/mulberry/clover.svg' },
        { revision: '46cfeac087ff61a7eafcdb9ee07bbcc1', url: '/symbols/mulberry/coach.svg' },
        { revision: '638d469b6e1718b12585a1f17a622bdd', url: '/symbols/mulberry/coat.svg' },
        { revision: '1086e4337d224e4c252b1a4c59d321ef', url: '/symbols/mulberry/coated_spoon.svg' },
        { revision: 'ebdf95d0d08b8cea2e9d90a842c0ea07', url: '/symbols/mulberry/cockatiel.svg' },
        { revision: 'de3462ba4372c27e631d44ba28d05c02', url: '/symbols/mulberry/cockerel.svg' },
        { revision: '39829bf8592d4ccfa2c2272cf64c8214', url: '/symbols/mulberry/coconut.svg' },
        { revision: '304063f1bcbc1045d691420efdc672de', url: '/symbols/mulberry/coffee.svg' },
        {
          revision: 'cab2cbba3c5a14c0f603bb31a909c70d',
          url: '/symbols/mulberry/coffee_instant.svg',
        },
        { revision: '0f1c52cc5265e53fdaf942d1611c0f31', url: '/symbols/mulberry/coffee_maker.svg' },
        { revision: 'bc64c915fee8009e4ff9aca348218820', url: '/symbols/mulberry/coffee_table.svg' },
        { revision: '35eabb36a9e21a78a43117d990305a93', url: '/symbols/mulberry/colander.svg' },
        { revision: '1111b5573e81de4a018a0f81b0821cd3', url: '/symbols/mulberry/collar_1.svg' },
        { revision: '95ff04909c4fb5233b13d684d27539e9', url: '/symbols/mulberry/collar_pet.svg' },
        { revision: '43151a1f48e72eb65906c63e88054689', url: '/symbols/mulberry/collect_,_to.svg' },
        { revision: 'bab539a8d5d2f8eca57807c5e768e3c6', url: '/symbols/mulberry/colour.svg' },
        {
          revision: '323e92126ae990c94d8b0fe48a5c8ff4',
          url: '/symbols/mulberry/coloured_paper.svg',
        },
        {
          revision: '73e088268c09ea25e3867d523de6c962',
          url: '/symbols/mulberry/colouring_book.svg',
        },
        { revision: 'd7b6120219d1ae9c7395feae513508a8', url: '/symbols/mulberry/comb.svg' },
        {
          revision: '87ac00ebb88db91cb14edade4b7e162c',
          url: '/symbols/mulberry/comb_animal_,_to.svg',
        },
        { revision: 'dd826ffb6388985c81a1fc9c49e3549d', url: '/symbols/mulberry/come_,_to.svg' },
        { revision: '27b0714c7587329003eb9950e04fa0e5', url: '/symbols/mulberry/comedy_tv.svg' },
        { revision: 'b275b1f90f21e8ae7f0fad9f0e117b77', url: '/symbols/mulberry/comet.svg' },
        {
          revision: '9d9e9ed4dfa40b96b28b9725a4c4a49c',
          url: '/symbols/mulberry/communicate_,_to.svg',
        },
        {
          revision: '269178bed83ea31260db019cb116eb2c',
          url: '/symbols/mulberry/communication_aid.svg',
        },
        {
          revision: 'acb1b5cd886dd80da682c5d1cbc7bfb5',
          url: '/symbols/mulberry/communication_aid_2.svg',
        },
        {
          revision: '72c8e82f86f89d9127b462dc35046c75',
          url: '/symbols/mulberry/communication_aid_chat_2.svg',
        },
        {
          revision: '3bf06f94848032a3a0cf760fd6d4f979',
          url: '/symbols/mulberry/communication_aid_gotalk_9p.svg',
        },
        {
          revision: '0ad3edb1beafa7c769dc5490240f7faf',
          url: '/symbols/mulberry/communication_aid_listen_to_me.svg',
        },
        {
          revision: 'a5e3af136635c1831479358f124cd667',
          url: '/symbols/mulberry/communication_aid_scan4.svg',
        },
        {
          revision: '6a2bb21216ec06b63504db0ed90d3db2',
          url: '/symbols/mulberry/communication_aid_techspeak_32.svg',
        },
        {
          revision: 'd1b9c2dcc0afda41b04747fa98879eb2',
          url: '/symbols/mulberry/communication_board.svg',
        },
        {
          revision: '80bcbad827c66efe5ca4733d4ac2ad06',
          url: '/symbols/mulberry/communication_book.svg',
        },
        {
          revision: 'a07c106fe524f8aeb6df3e7fef11a096',
          url: '/symbols/mulberry/communication_book_portable.svg',
        },
        {
          revision: '122b2a4ca0bdb0c1f9f74bd76041a203',
          url: '/symbols/mulberry/communication_device.svg',
        },
        { revision: 'e20c264b7635b97dbd47bf80801ab882', url: '/symbols/mulberry/computer_1.svg' },
        { revision: '796d7e4456e107e04c0933693e799e25', url: '/symbols/mulberry/computer_2.svg' },
        { revision: '2cf10c4ddd0485e704a57ca9754258a7', url: '/symbols/mulberry/computer_art.svg' },
        {
          revision: '37a756435439a61abba9b9c641ad6e1d',
          url: '/symbols/mulberry/computer_cable.svg',
        },
        {
          revision: 'f5f785f8d362b694d6444335a59b8102',
          url: '/symbols/mulberry/computer_folder.svg',
        },
        {
          revision: 'f83af069b7883495a9dceb7721957549',
          url: '/symbols/mulberry/computer_folder_open.svg',
        },
        {
          revision: '4bd4f387697054df81fbfebfd7f53662',
          url: '/symbols/mulberry/computer_folder_open_,_to.svg',
        },
        {
          revision: 'fe79d45fd8de6ead4c34d62ccfd93f43',
          url: '/symbols/mulberry/computer_game.svg',
        },
        {
          revision: '5be02e2c19ab317c42e63a4ea25dd715',
          url: '/symbols/mulberry/computer_game_2.svg',
        },
        {
          revision: '62258cd334ddd5c03032dfb08e7ccadd',
          url: '/symbols/mulberry/computer_keyboard.svg',
        },
        {
          revision: '03b0c230527da1cd402095afa40eef20',
          url: '/symbols/mulberry/computer_monitor.svg',
        },
        {
          revision: 'ea6aecfcc0629030348bf8d7d1d46c53',
          url: '/symbols/mulberry/computer_mouse_1.svg',
        },
        {
          revision: '13becd44ffa39dbb3921d0eb291b0872',
          url: '/symbols/mulberry/computer_mouse_2.svg',
        },
        {
          revision: 'f501622094baafce7f63806462907796',
          url: '/symbols/mulberry/computer_programme.svg',
        },
        {
          revision: '37514f394e39da79b31eefcaec0c68f9',
          url: '/symbols/mulberry/computer_speaker.svg',
        },
        {
          revision: '4fe73f3e96f4c4b15400040dce284a07',
          url: '/symbols/mulberry/concentrating_lady.svg',
        },
        {
          revision: '847e1594819ff9e3be219618e06cbeee',
          url: '/symbols/mulberry/concentrating_man.svg',
        },
        {
          revision: 'f2f726fcf725d28f164b47970dabd181',
          url: '/symbols/mulberry/confused_lady.svg',
        },
        { revision: '6309524b61fba71e91c02df691563844', url: '/symbols/mulberry/confused_man.svg' },
        {
          revision: 'b9cf5b776bdc67cfbb44e58b3d2f4a03',
          url: '/symbols/mulberry/conical_flask.svg',
        },
        { revision: 'ba390880fa02697754fdff3935f1df50', url: '/symbols/mulberry/connection.svg' },
        { revision: 'b939e78cc2a04ae9f3c360ca7a365a83', url: '/symbols/mulberry/cook_,_to.svg' },
        { revision: '35f14bbcdd42e1db27727db2938d179a', url: '/symbols/mulberry/cook_chef_1a.svg' },
        { revision: '77e6504e3098479e1565ed026dc16766', url: '/symbols/mulberry/cook_chef_1b.svg' },
        { revision: '294d46dbd05ceefd94e6c53ed54bfa03', url: '/symbols/mulberry/cook_chef_2a.svg' },
        { revision: 'e43e2664cd4e17dca0362d7bed239299', url: '/symbols/mulberry/cook_chef_2b.svg' },
        {
          revision: 'f59732ccea0ac3799fe80b1c9cab4279',
          url: '/symbols/mulberry/cook_school_1a.svg',
        },
        {
          revision: '0195b1a9ac2f14176d526fe3ea459167',
          url: '/symbols/mulberry/cook_school_1b.svg',
        },
        { revision: '883ceccd3555dc875093b7c3486dec88', url: '/symbols/mulberry/cooker.svg' },
        { revision: 'c1b30a8f84fb5efe0e22d16cdde20eaa', url: '/symbols/mulberry/cooking_oil.svg' },
        { revision: '18bafcf7c368e59d3e959a23804ae3f8', url: '/symbols/mulberry/copy.svg' },
        { revision: 'dda0742580f9745e9680278352e1ab1b', url: '/symbols/mulberry/copy_,_to.svg' },
        { revision: 'cc6859968819efca63070cd02de05e71', url: '/symbols/mulberry/corned_beef.svg' },
        {
          revision: '3270bffe57716f77dc8703df92398205',
          url: '/symbols/mulberry/corner_cabinet.svg',
        },
        {
          revision: 'fd6b6ed6c92b4871a2b89d2b6eb1df3c',
          url: '/symbols/mulberry/corner_cabinet_2.svg',
        },
        { revision: '215907b712c53b043fd71c1359e3525c', url: '/symbols/mulberry/cornet.svg' },
        { revision: 'd62b3465a97db6d205ae351381c52fdf', url: '/symbols/mulberry/cornflakes.svg' },
        { revision: 'ce9f1451066e24973a7b202f5fde1be7', url: '/symbols/mulberry/correct.svg' },
        {
          revision: '786fc1fcb15c43f0542b0e60df93879d',
          url: '/symbols/mulberry/correct_thought.svg',
        },
        { revision: 'e859081d0b3f0f99d2b5a0cd07876b8f', url: '/symbols/mulberry/cot.svg' },
        {
          revision: 'd592aeff9e9994a47a715690d2e9e4d4',
          url: '/symbols/mulberry/cottage_cheese.svg',
        },
        { revision: '6ddbc6a359fbeff756f235f4d1c51272', url: '/symbols/mulberry/cotton_bud.svg' },
        { revision: '733024f49776f380971b2d1b318f66da', url: '/symbols/mulberry/count_,_to.svg' },
        { revision: 'b4d56900efbafd85ec0292da2ed28109', url: '/symbols/mulberry/count_2_,_to.svg' },
        { revision: '3668350271dc479734f98a424f23b457', url: '/symbols/mulberry/counters.svg' },
        {
          revision: '38bf9050c328748dc17d7fd05c0b34b3',
          url: '/symbols/mulberry/country_Afghanistan.svg',
        },
        {
          revision: '10a48dbc842ce1278558ee599110fc9e',
          url: '/symbols/mulberry/country_Alaska.svg',
        },
        {
          revision: '00afb1a8c42e864a1e4e38daa22be7b2',
          url: '/symbols/mulberry/country_Albania.svg',
        },
        {
          revision: '4b60221ef19d652f8a56b65acaf9feda',
          url: '/symbols/mulberry/country_Alderney.svg',
        },
        {
          revision: 'e6cfbcde3a45bf12309e485bc02fea16',
          url: '/symbols/mulberry/country_Algeria.svg',
        },
        {
          revision: '27e29bbaf96ff15d014a59a4dc77c0fc',
          url: '/symbols/mulberry/country_American_Samoa.svg',
        },
        {
          revision: '4892e5c6b09f05cdb8669747f53640e5',
          url: '/symbols/mulberry/country_Andorra.svg',
        },
        {
          revision: 'a86081224f1121862048fbfe5c0df7ad',
          url: '/symbols/mulberry/country_Angola.svg',
        },
        {
          revision: '9432474ab34344cdc0b138b2c6c919e2',
          url: '/symbols/mulberry/country_Anguilla.svg',
        },
        {
          revision: '3c38f53d8b7c4c4df2cda7c5b804c798',
          url: '/symbols/mulberry/country_Antartica.svg',
        },
        {
          revision: '1601fcc7bc9710130e45d03b820a4de1',
          url: '/symbols/mulberry/country_Antigua_Barbuda.svg',
        },
        {
          revision: '2d833d6a8147359406cdf4ec5905b995',
          url: '/symbols/mulberry/country_Argentina.svg',
        },
        {
          revision: 'd853b66226b1e53225ef4308a16c9db6',
          url: '/symbols/mulberry/country_Armenia.svg',
        },
        {
          revision: '19d3fdc237e91c836192a114f185032e',
          url: '/symbols/mulberry/country_Aruba.svg',
        },
        {
          revision: '3185101e8988ea63e1d051ebaf24ccef',
          url: '/symbols/mulberry/country_Austria.svg',
        },
        {
          revision: 'dc2693baf7fb2dc1f4aa9944d65cba58',
          url: '/symbols/mulberry/country_Azerbaijan.svg',
        },
        {
          revision: '60a0804ec835c49d1a35605c7f03e69c',
          url: '/symbols/mulberry/country_Bahrain.svg',
        },
        {
          revision: 'b99d6b9851c0f29b6f830afd8f40a66f',
          url: '/symbols/mulberry/country_Bangladesh.svg',
        },
        {
          revision: '72b693442ecd90784d5c4323fbe4caa3',
          url: '/symbols/mulberry/country_Barbados.svg',
        },
        {
          revision: 'fb4500d029b3a450b98ad4afc2c5fd48',
          url: '/symbols/mulberry/country_Belarus.svg',
        },
        {
          revision: '20b4418bc2816a0b349a98d4d035ddc0',
          url: '/symbols/mulberry/country_Belgium.svg',
        },
        {
          revision: '528b01d738338a5425c24584c90fbbae',
          url: '/symbols/mulberry/country_Belize.svg',
        },
        {
          revision: '48c454e8132ede3b2935982c0a0e4ec8',
          url: '/symbols/mulberry/country_Benin.svg',
        },
        {
          revision: '08feb1d54d0a14ab0ad37595a4299ec5',
          url: '/symbols/mulberry/country_Bermuda.svg',
        },
        {
          revision: '2a59b9c389f55acfc58d7256562779f3',
          url: '/symbols/mulberry/country_Bhutan.svg',
        },
        {
          revision: '97536606c0861f1b59763a1edf9705b8',
          url: '/symbols/mulberry/country_Bonaire.svg',
        },
        {
          revision: '8f83dfe894691b8cd6424f75ff1574f8',
          url: '/symbols/mulberry/country_Bosnia_Herzegovina.svg',
        },
        {
          revision: '53254a9ba8f32b51d7d472b5b3173b12',
          url: '/symbols/mulberry/country_Botswana.svg',
        },
        {
          revision: '87fbc00c950a109ba8ed69b0384828f3',
          url: '/symbols/mulberry/country_Bulgaria.svg',
        },
        {
          revision: 'a8ed3b12d9cadec69418c3133b55b463',
          url: '/symbols/mulberry/country_Burkina_Faso.svg',
        },
        {
          revision: '77c0b0641a843699f9cc6d87f6099670',
          url: '/symbols/mulberry/country_Burundi.svg',
        },
        {
          revision: 'd774a0e915542a62675ee635e4bbc648',
          url: '/symbols/mulberry/country_Cambodia.svg',
        },
        {
          revision: '9f79b0629bf6160e8740e652d78b79d3',
          url: '/symbols/mulberry/country_Cameroon.svg',
        },
        {
          revision: 'e3f5e94004a3acf09723ade0e75ce894',
          url: '/symbols/mulberry/country_Canada.svg',
        },
        {
          revision: '37d0782797c114ce61cc225dfe7cd041',
          url: '/symbols/mulberry/country_Canary_Islands.svg',
        },
        {
          revision: 'e6c0c401211dfc1a8b58f8081a725fa1',
          url: '/symbols/mulberry/country_Cape_Verde.svg',
        },
        {
          revision: '816d60855aa72ca67b05648623d4dbb7',
          url: '/symbols/mulberry/country_Cayman_Islands.svg',
        },
        { revision: 'cc11ac972cfa3c7a05621b7fe2b382a8', url: '/symbols/mulberry/country_Chad.svg' },
        {
          revision: '85dc50fbba333e6ee1f6276802c6b12a',
          url: '/symbols/mulberry/country_Chile.svg',
        },
        {
          revision: '134012dc5be7de28dddbca667c807776',
          url: '/symbols/mulberry/country_China.svg',
        },
        {
          revision: '5c8b739b4333671721e1416b95247377',
          url: '/symbols/mulberry/country_Colombia.svg',
        },
        {
          revision: '13316c42e9213a61b89caf086665176e',
          url: '/symbols/mulberry/country_Comoros.svg',
        },
        {
          revision: 'c0e935db87b0e72d2e35b25a7f82637c',
          url: '/symbols/mulberry/country_Congo_Brazzaville.svg',
        },
        {
          revision: '19e43d5ac3e7dae49f05fa6bbedd49cf',
          url: '/symbols/mulberry/country_Congo_Kinshasa.svg',
        },
        {
          revision: 'f945886a1bc07f3f953df489f510cde7',
          url: '/symbols/mulberry/country_Costa_Rica.svg',
        },
        {
          revision: '14e14a2cfbfda8ec0be664b2fbd446d9',
          url: '/symbols/mulberry/country_Croatia.svg',
        },
        { revision: '3e165df41a7e61af3b3809272954b186', url: '/symbols/mulberry/country_Cuba.svg' },
        {
          revision: 'd303df7f6aae4c73284b21689852d7ff',
          url: '/symbols/mulberry/country_Cyprus.svg',
        },
        {
          revision: '1999ccebf01e08cc04d020f21e7d9cf8',
          url: '/symbols/mulberry/country_Denmark.svg',
        },
        {
          revision: '40aedae6d6cca62a18be06b043e96fcc',
          url: '/symbols/mulberry/country_Djbouti.svg',
        },
        {
          revision: '3c390853af261ef03cf7465f9033c32a',
          url: '/symbols/mulberry/country_Dominican_Republic.svg',
        },
        {
          revision: '050ff42a5b22c962150a7a9054217cf7',
          url: '/symbols/mulberry/country_Ecuador.svg',
        },
        {
          revision: '535a772372af3040844c7202c7946cf3',
          url: '/symbols/mulberry/country_England.svg',
        },
        {
          revision: '757d27a0f0045da2d04792f8d365cc80',
          url: '/symbols/mulberry/country_Eritrea.svg',
        },
        {
          revision: '2eb40024fbd4e276ae5efcc1d398008c',
          url: '/symbols/mulberry/country_Estonia.svg',
        },
        {
          revision: '4a01a48d530a9e30d7a9eca51b731fcd',
          url: '/symbols/mulberry/country_Ethiopia.svg',
        },
        {
          revision: '9ff8581d43c9d43e0e46a017750fe974',
          url: '/symbols/mulberry/country_Falkland_Islands.svg',
        },
        {
          revision: '60fbb1b8e1123614a3ee08448cd9ca9d',
          url: '/symbols/mulberry/country_Finland.svg',
        },
        {
          revision: 'dc2e9e2480f9ff4de4bd9b8ee604d14f',
          url: '/symbols/mulberry/country_France.svg',
        },
        {
          revision: '057f774377c53faccb0ff29ecb57f261',
          url: '/symbols/mulberry/country_Gabon.svg',
        },
        {
          revision: 'e9aefea590eb6eccf2c7286d0429fba9',
          url: '/symbols/mulberry/country_Georgia.svg',
        },
        {
          revision: '2a118639fef970d1b4fe58b2990c255b',
          url: '/symbols/mulberry/country_Germany.svg',
        },
        {
          revision: '70241e6ab00a00aa2bfbfcf907df0d92',
          url: '/symbols/mulberry/country_Ghana.svg',
        },
        {
          revision: '3d338e2a67e52f54e1b574323ae2466c',
          url: '/symbols/mulberry/country_Gibraltar.svg',
        },
        {
          revision: '9a4b68ab4d231646c0be841a222545f7',
          url: '/symbols/mulberry/country_Greece.svg',
        },
        {
          revision: '32a2d546860b0786e4558074d9065c32',
          url: '/symbols/mulberry/country_Greenland.svg',
        },
        {
          revision: 'e15d8d5ec80c64cc1afea3cb7d8e7160',
          url: '/symbols/mulberry/country_Grenada.svg',
        },
        {
          revision: '0c9a4b7d44aac02e59920f7aa3022e56',
          url: '/symbols/mulberry/country_Guernsey.svg',
        },
        {
          revision: '663933769e28814f0af5ff4acd5150d3',
          url: '/symbols/mulberry/country_Guinea.svg',
        },
        {
          revision: 'f43093a951bf6f8a25bae13bd14c43d3',
          url: '/symbols/mulberry/country_Guinea_Bissau.svg',
        },
        {
          revision: '7db6ef9607ca8a641c7667953368c390',
          url: '/symbols/mulberry/country_Guyana.svg',
        },
        {
          revision: '2d50a9550d53d16e8c57e6f7d86a43c6',
          url: '/symbols/mulberry/country_Haiti.svg',
        },
        {
          revision: 'dcae58f91df52aaa8f7a62c4c0d88a77',
          url: '/symbols/mulberry/country_Hawaii.svg',
        },
        {
          revision: 'a51548bbb66b3bb12b1b3ac5e613ccec',
          url: '/symbols/mulberry/country_Honduras.svg',
        },
        {
          revision: '807bc5b3f044ad584245ecfc51f509b0',
          url: '/symbols/mulberry/country_Hong_Kong.svg',
        },
        {
          revision: '2c148b28aa033f06b8ce3968a9f23dcc',
          url: '/symbols/mulberry/country_Hungary.svg',
        },
        {
          revision: 'd84115930c7193a6744918577360f26c',
          url: '/symbols/mulberry/country_Iceland.svg',
        },
        {
          revision: '7707dbc9a0b653ca1954e8eda879f5e4',
          url: '/symbols/mulberry/country_India.svg',
        },
        {
          revision: 'a9fc6170d5cb256fd63a80fc0a6202b2',
          url: '/symbols/mulberry/country_Indonesia.svg',
        },
        { revision: 'e290ebf3daef7e738e8541911302d6ae', url: '/symbols/mulberry/country_Iran.svg' },
        { revision: '54181d6b1566b9debb23c331207557cc', url: '/symbols/mulberry/country_Iraq.svg' },
        {
          revision: '1edc88faa8578ca79e1acee1bc03a952',
          url: '/symbols/mulberry/country_Ireland.svg',
        },
        {
          revision: '0e1a56dfb79ecb63a7ff374ed04b03cc',
          url: '/symbols/mulberry/country_Isle_of_Man.svg',
        },
        {
          revision: '1349e5dcda467d795c27cdef9f1a93f0',
          url: '/symbols/mulberry/country_Israel.svg',
        },
        {
          revision: '24f23c86260d5b869eb949fc82cfd200',
          url: '/symbols/mulberry/country_Italy.svg',
        },
        {
          revision: '64c9f261e1703562ae1712fbb878c19c',
          url: '/symbols/mulberry/country_Ivory_Coast.svg',
        },
        {
          revision: 'bd00349a83b5e824883a5a2a0f7495ac',
          url: '/symbols/mulberry/country_Jamaica.svg',
        },
        {
          revision: '9876bf1a33fa26e7c739892975eabcfb',
          url: '/symbols/mulberry/country_Japan.svg',
        },
        {
          revision: '79c3ac6fb6dfa0ef97fc6a7d04f2f211',
          url: '/symbols/mulberry/country_Jersey.svg',
        },
        {
          revision: '9600fc56f6152509b24182180e174b1f',
          url: '/symbols/mulberry/country_Jordan.svg',
        },
        {
          revision: '709d214d00fe3220d4b95ba76c477b67',
          url: '/symbols/mulberry/country_Kazakhstan.svg',
        },
        {
          revision: 'fa937da87692fcd34d68a5b9bf2e008e',
          url: '/symbols/mulberry/country_Kenya.svg',
        },
        {
          revision: '822e955f8628c186f0c9172058f124a0',
          url: '/symbols/mulberry/country_Kosovo.svg',
        },
        {
          revision: '7f2ef1ce7ecb821e4ee8436feeb1a829',
          url: '/symbols/mulberry/country_Kuwait.svg',
        },
        {
          revision: 'eabe197b3f0d34852510817fd0c02ea5',
          url: '/symbols/mulberry/country_Kyrgyzstan.svg',
        },
        { revision: 'c1068788a1ef701f99f7e68ea5cc3cf7', url: '/symbols/mulberry/country_Laos.svg' },
        {
          revision: '1ed71114d46831d35345f4ea198490ac',
          url: '/symbols/mulberry/country_Latvia.svg',
        },
        {
          revision: '4ce9b4637bddbcd671caf331b75ca742',
          url: '/symbols/mulberry/country_Lebanon.svg',
        },
        {
          revision: '5fe661937454a52b1b56cc83fc45fe57',
          url: '/symbols/mulberry/country_Lesotho.svg',
        },
        {
          revision: '67a8f7cfe886765e152ac50d9e7e3b9e',
          url: '/symbols/mulberry/country_Liberia.svg',
        },
        {
          revision: '2f8c70796eedde6fb51ddd07e80fbed8',
          url: '/symbols/mulberry/country_Libya.svg',
        },
        {
          revision: '00c1804a21e0da0b00011c6e9ec86068',
          url: '/symbols/mulberry/country_Liechtenstein.svg',
        },
        {
          revision: 'e55ea125c2e079cef5fe770f7661d940',
          url: '/symbols/mulberry/country_Lithuania.svg',
        },
        {
          revision: '7b435b6de2e682af61d41094dc019827',
          url: '/symbols/mulberry/country_Luxembourg.svg',
        },
        {
          revision: 'b3b267e96bd9f4c0942628c6c201abb5',
          url: '/symbols/mulberry/country_Macedonia.svg',
        },
        {
          revision: '37b4bc11d51936a7119aad183ec8513d',
          url: '/symbols/mulberry/country_Madagascar.svg',
        },
        {
          revision: '17d390d4cc125d8a04e28b37087f6d5f',
          url: '/symbols/mulberry/country_Malaysia.svg',
        },
        {
          revision: '09cb7bed09050204facb2eed7e7ad1d9',
          url: '/symbols/mulberry/country_Maldives.svg',
        },
        { revision: 'fdeec780d09bb631d7d95189bd412ac9', url: '/symbols/mulberry/country_Mali.svg' },
        {
          revision: '37bcf30da9ed176407a7e241c0ba3df2',
          url: '/symbols/mulberry/country_Marshall_Islands.svg',
        },
        {
          revision: 'ce595dd7a838223f69b9cc7aaf676819',
          url: '/symbols/mulberry/country_Mauritania.svg',
        },
        {
          revision: 'f932ccc15c5c4d82f5d556ab84e09bd0',
          url: '/symbols/mulberry/country_Mauritius.svg',
        },
        {
          revision: 'c4d9f71164d5377909b73b56a1431f6b',
          url: '/symbols/mulberry/country_Moldova.svg',
        },
        {
          revision: '0c4350bfd5197f426bd4326ca85ad85f',
          url: '/symbols/mulberry/country_Monaco.svg',
        },
        {
          revision: 'cf89a7a2fc1a8b1e1331899c7985e676',
          url: '/symbols/mulberry/country_Mongolia.svg',
        },
        {
          revision: '6503a88ab2a8fbbb03e222cf01a8b8f7',
          url: '/symbols/mulberry/country_Morocco.svg',
        },
        {
          revision: '905027600d28fa1e4cb6504e85193e2b',
          url: '/symbols/mulberry/country_Namibia.svg',
        },
        {
          revision: '94171bdcad0b718a73f36b9f43b96d22',
          url: '/symbols/mulberry/country_Nauru.svg',
        },
        {
          revision: 'cbd8349ff2b068c1ccef14065217c341',
          url: '/symbols/mulberry/country_Nepal.svg',
        },
        {
          revision: 'cf2e30416d77d8f57e57bf1507419c5f',
          url: '/symbols/mulberry/country_New_Caledonia.svg',
        },
        {
          revision: '1fa410cc7526f2590106c9f0b9a3729a',
          url: '/symbols/mulberry/country_New_Zealand.svg',
        },
        {
          revision: 'c383fd81b4888433fc88c746849be234',
          url: '/symbols/mulberry/country_Niger.svg',
        },
        {
          revision: '2de70b8e71e171ac50b72dda1b04dac9',
          url: '/symbols/mulberry/country_Nigeria.svg',
        },
        { revision: '0c95b5fac9d4721dfb1b4846efa2a2bf', url: '/symbols/mulberry/country_Niue.svg' },
        {
          revision: '2ec6a4574d6f6bc93443d5c263b90c2e',
          url: '/symbols/mulberry/country_North_Korea.svg',
        },
        {
          revision: 'ce6d873cb75494b3d098bddafd210c48',
          url: '/symbols/mulberry/country_Northern_Cyprus.svg',
        },
        {
          revision: 'b422e347cdd5e1f08fec20d7bdb365c8',
          url: '/symbols/mulberry/country_Norway.svg',
        },
        { revision: '960fcb899bef0f8ea3f040f570833cbf', url: '/symbols/mulberry/country_Oman.svg' },
        {
          revision: 'fad56d0b1f77f708a5ab8bd0f9721308',
          url: '/symbols/mulberry/country_Pakistan.svg',
        },
        {
          revision: 'daa5336f2b2a01cd9de55d6cc3331da8',
          url: '/symbols/mulberry/country_Palau.svg',
        },
        {
          revision: 'b1e638fe7ac65425e1d608d242bf1d2a',
          url: '/symbols/mulberry/country_Palestine.svg',
        },
        {
          revision: '85d02f82f96a1cf1138528e89817a66c',
          url: '/symbols/mulberry/country_Panama.svg',
        },
        {
          revision: '9ffd767be53aac97cabc90cf50351dc6',
          url: '/symbols/mulberry/country_Papua_New_Guinea.svg',
        },
        {
          revision: '37da8ddec6c90136dcaca786c135eb67',
          url: '/symbols/mulberry/country_Paraguay.svg',
        },
        {
          revision: '50691f319c8f5568c8abf6355a2aaac2',
          url: '/symbols/mulberry/country_Pitcairn_Islands.svg',
        },
        {
          revision: '3bb10ca59cdb665d4d89df52d9914da4',
          url: '/symbols/mulberry/country_Qatar.svg',
        },
        {
          revision: '0706140b9e3aa50623dd4d3d7cbbf1cd',
          url: '/symbols/mulberry/country_Romania.svg',
        },
        {
          revision: '3b16591d8cb84f02801d69c4e6d50bbc',
          url: '/symbols/mulberry/country_Russian_Federation.svg',
        },
        {
          revision: 'ec706cbc0bee15c1cd43c69017670b60',
          url: '/symbols/mulberry/country_Rwanda.svg',
        },
        {
          revision: 'd91f00726f0de30c30126895e9f43d7d',
          url: '/symbols/mulberry/country_Samoa.svg',
        },
        {
          revision: 'a77aef96043f8fdaedb7e7c819cb9e46',
          url: '/symbols/mulberry/country_Sao_Tome_Principe.svg',
        },
        {
          revision: 'dbe57379f55cb78b013ec66df0a9d77c',
          url: '/symbols/mulberry/country_Saudi_Arabia.svg',
        },
        {
          revision: 'f48d35805c3581c2b7e1ed2eeb0f3148',
          url: '/symbols/mulberry/country_Scotland.svg',
        },
        {
          revision: 'f3ad9f66669222b8bc9b1cfff55a86d3',
          url: '/symbols/mulberry/country_Senegal.svg',
        },
        {
          revision: '52c4f8000a4209e8a8e6ad24918fc13e',
          url: '/symbols/mulberry/country_Seychelles.svg',
        },
        {
          revision: '0835b43f5a7fefba2b7f2b3e2d5ed640',
          url: '/symbols/mulberry/country_Sierra_Leone.svg',
        },
        {
          revision: '656f987e49f1d953f621cac229b32a24',
          url: '/symbols/mulberry/country_Singapore.svg',
        },
        {
          revision: 'a7fbd17480ffd08e8feff2509094abab',
          url: '/symbols/mulberry/country_Slovenia.svg',
        },
        {
          revision: 'df09c250dc35e6631bce270e92fedede',
          url: '/symbols/mulberry/country_Solomon_Islands.svg',
        },
        {
          revision: 'f79e7f3de3a23e6196d1b18a12e5d88d',
          url: '/symbols/mulberry/country_Somalia.svg',
        },
        {
          revision: '1ff90f3bd141c66a5ba3ff03b28d98f4',
          url: '/symbols/mulberry/country_Somaliland.svg',
        },
        {
          revision: '377ded69d80d8ba863c38e7519be1106',
          url: '/symbols/mulberry/country_South_Africa.svg',
        },
        {
          revision: 'c3307c3017ae3e718c593e9536eb0a3d',
          url: '/symbols/mulberry/country_South_Korea.svg',
        },
        {
          revision: '70a30152287722280df8c18c4f2ebb9c',
          url: '/symbols/mulberry/country_Sri_Lanka.svg',
        },
        {
          revision: '1802ea8d6a9b6259c9d306421f777291',
          url: '/symbols/mulberry/country_St._Kitts_and_Nevis.svg',
        },
        {
          revision: '20ebe763c8b88dc80e57451250d51fbe',
          url: '/symbols/mulberry/country_St_Vincent_Grenadines.svg',
        },
        {
          revision: 'a4d4614a630b441c3132b0a316624c2c',
          url: '/symbols/mulberry/country_Suriname.svg',
        },
        {
          revision: '6a10eac0deb88877eb02bcb724bb5732',
          url: '/symbols/mulberry/country_Sweden.svg',
        },
        {
          revision: '172f439beaa0772fcf72cf9db8db0827',
          url: '/symbols/mulberry/country_Switzerland.svg',
        },
        {
          revision: 'cfdad54b6c7db45205042f454aa58fb3',
          url: '/symbols/mulberry/country_Syria.svg',
        },
        {
          revision: '616fce89e250b075fe60c12bb7c93668',
          url: '/symbols/mulberry/country_Taiwan.svg',
        },
        {
          revision: '4f25c2ad51e3763651df149aaaf89249',
          url: '/symbols/mulberry/country_Tanzania.svg',
        },
        {
          revision: 'b0f2b480d94857a3e05518b3d91d1881',
          url: '/symbols/mulberry/country_Thailand.svg',
        },
        {
          revision: '1e48d73ddeb524a16e15e66a890e783e',
          url: '/symbols/mulberry/country_The_Azores.svg',
        },
        {
          revision: '24c7e0de01c87d303f36be4333e73926',
          url: '/symbols/mulberry/country_The_Bahamas.svg',
        },
        {
          revision: 'be515aa422577e82259fd97b2afeb7c5',
          url: '/symbols/mulberry/country_The_Czech_Republic.svg',
        },
        {
          revision: '6fe9d0805eb5e8d10d57423eabd3c5d7',
          url: '/symbols/mulberry/country_The_Faroe_Islands.svg',
        },
        {
          revision: '9e0daec7bd87ce835ad7f800a7207df9',
          url: '/symbols/mulberry/country_The_Gambia.svg',
        },
        {
          revision: 'e481aa5c1cd5205395eb3a751f30ce3b',
          url: '/symbols/mulberry/country_The_Netherlands.svg',
        },
        {
          revision: '58611730f0bf2a306cbc7a6ce2042057',
          url: '/symbols/mulberry/country_The_Sudan.svg',
        },
        { revision: '24b84884eb89c9e10553ed2b1f296da6', url: '/symbols/mulberry/country_Togo.svg' },
        {
          revision: 'e0422a63e4dd55784b6eb7f9cbfbf465',
          url: '/symbols/mulberry/country_Trinidad_and_Tobago.svg',
        },
        {
          revision: 'e2667ed0671c18dd3a90972a394f9493',
          url: '/symbols/mulberry/country_Tunisia.svg',
        },
        {
          revision: '1e665dc8869a81ef1ba9eec8da089c5e',
          url: '/symbols/mulberry/country_Turkey.svg',
        },
        {
          revision: 'a23b2d76a6ec3cd421a47dc70667a7e5',
          url: '/symbols/mulberry/country_Ukraine.svg',
        },
        {
          revision: '0e447e4c8cd4b76484df03f5f3ac5407',
          url: '/symbols/mulberry/country_United_Arab_Emirates.svg',
        },
        {
          revision: 'c8bb736c8ef5254108aa5b9219654d21',
          url: '/symbols/mulberry/country_United_Kingdom.svg',
        },
        {
          revision: 'e16af45f8f917f5f33823078e9f4e266',
          url: '/symbols/mulberry/country_United_States.svg',
        },
        {
          revision: '0985e98a3239b622f86b2fe057f91f69',
          url: '/symbols/mulberry/country_Uzbekistan.svg',
        },
        {
          revision: '3f0b18bc4316c20002043a38e259ca25',
          url: '/symbols/mulberry/country_Vanuatu.svg',
        },
        {
          revision: '40341c0a9e62c5da87e8a9db791ff9c5',
          url: '/symbols/mulberry/country_Venezuela.svg',
        },
        {
          revision: '2963fd6cc50026ab435903f12ebf7aa5',
          url: '/symbols/mulberry/country_Viet_Nam.svg',
        },
        {
          revision: '818fa20227abdb2f4687b13577497c8b',
          url: '/symbols/mulberry/country_Wakes_Island.svg',
        },
        {
          revision: '3f56a6daa6427c4532f316cf02149669',
          url: '/symbols/mulberry/country_Wales.svg',
        },
        {
          revision: '4d295f196388300aa204e990fe606e82',
          url: '/symbols/mulberry/country_Western_Sahara.svg',
        },
        {
          revision: '69b445f122532fcb6803e424021d5798',
          url: '/symbols/mulberry/country_Yemen.svg',
        },
        {
          revision: '61e37d41421f8805455a480083d333f0',
          url: '/symbols/mulberry/country_Zambia.svg',
        },
        {
          revision: '6e52a38439e83abf6d77130d7d9f1416',
          url: '/symbols/mulberry/country_blank.svg',
        },
        { revision: 'e6c0d3f385cd46b426a37e542590bd11', url: '/symbols/mulberry/courgette.svg' },
        {
          revision: 'b32c7fd8f3425e35ba623a1cb9faa5db',
          url: '/symbols/mulberry/cover_food_,_to.svg',
        },
        { revision: '6ab9df800f0447e5892e682950fccefa', url: '/symbols/mulberry/cow.svg' },
        { revision: '55ad0353a0dccfb614b66725150a5fbd', url: '/symbols/mulberry/cow_shed.svg' },
        { revision: 'bdb597c5d00e8ab9d9199fed4f42cb86', url: '/symbols/mulberry/crab.svg' },
        { revision: 'e1e560736c0489b1aecfc54369f586cf', url: '/symbols/mulberry/cracker.svg' },
        { revision: 'ac3f5efff5149339780d9fa0ce7db7c8', url: '/symbols/mulberry/craft_table.svg' },
        { revision: '2ef0c7930594e41d0b95f71b2bfba6d0', url: '/symbols/mulberry/cranberries.svg' },
        {
          revision: '8df389d731aa65290823047694b7926d',
          url: '/symbols/mulberry/cranberry_juice.svg',
        },
        { revision: '0e16c9301f3bd5589cbc3281f41b843e', url: '/symbols/mulberry/crane.svg' },
        { revision: 'f3a2cf192deac43fe5d70db6fa76fd41', url: '/symbols/mulberry/crane_fly.svg' },
        { revision: 'a897f6ec50bfe1f5684e5d836b6b4fb2', url: '/symbols/mulberry/crawl_,_to.svg' },
        { revision: 'd8372f9e822533bef778bf9bf53f95d4', url: '/symbols/mulberry/crayon.svg' },
        { revision: 'dfced189f3d418473b46ed2f5b503567', url: '/symbols/mulberry/cream.svg' },
        { revision: '003b0b2ac5fca7fcb753d0386bc4f529', url: '/symbols/mulberry/cream_2.svg' },
        {
          revision: '876a0775aa0c4a354d3237425c5ecfac',
          url: '/symbols/mulberry/cream_ointment.svg',
        },
        {
          revision: 'bde643ceda8918ea88f48c6cd05198f3',
          url: '/symbols/mulberry/creme_fraiche.svg',
        },
        { revision: '14277dd767866533aba59a0defdda062', url: '/symbols/mulberry/cricket.svg' },
        { revision: '6aa6efd15a3f28b486dfdab866ea6651', url: '/symbols/mulberry/cricket_2.svg' },
        { revision: '109e82a792dd275e644eb7878eb9fb1a', url: '/symbols/mulberry/cricket_ball.svg' },
        {
          revision: '66b38b4d8142b329eb97b673532bd32b',
          url: '/symbols/mulberry/cricket_bowler.svg',
        },
        { revision: 'ed97ac5e7cd88a0540461e81ba647a51', url: '/symbols/mulberry/crisp_bread.svg' },
        { revision: 'e7eb74cd3e515e558e6a76960ada8830', url: '/symbols/mulberry/crisps.svg' },
        {
          revision: 'a7c1df99a0d69b5f156ed7409f6daa0e',
          url: '/symbols/mulberry/crisps_cheese_puffs.svg',
        },
        { revision: '03a2baab7e580d45a7cef59bc8b0016f', url: '/symbols/mulberry/crocodile.svg' },
        { revision: '1dbc394fbecc3a10b83c9fed637ef3e7', url: '/symbols/mulberry/crocodile_2.svg' },
        { revision: 'ec629ba0e7082632a0f2049e8604a163', url: '/symbols/mulberry/croissant.svg' },
        { revision: 'd27db823a6ee591cd7cf6698c9ee7ab5', url: '/symbols/mulberry/crooked.svg' },
        { revision: '236784766284d47f2f49542447bdb9c4', url: '/symbols/mulberry/cross.svg' },
        {
          revision: '3166a34cccd9246660b51db75db0c1f4',
          url: '/symbols/mulberry/cross_fingers_,_to.svg',
        },
        { revision: '272201e768336026e66d9c05b4b34a7a', url: '/symbols/mulberry/cross_palm.svg' },
        { revision: '1a532ec67ab568c2f04818dc94f4d7e2', url: '/symbols/mulberry/crouch_,_to.svg' },
        { revision: '67733fe932ea00d8dc2ba32d966ceb20', url: '/symbols/mulberry/crown.svg' },
        {
          revision: '880406cd9718a586fdbdf8b1e4976d98',
          url: '/symbols/mulberry/crown_of_thorns.svg',
        },
        { revision: '239f16a558f9a66b94bf96b38c059615', url: '/symbols/mulberry/cruiser.svg' },
        {
          revision: '62afa423b5620cf88417bd5aff49c62d',
          url: '/symbols/mulberry/crumple_paper_,_to.svg',
        },
        { revision: '5474ba60add3f4e703fe5143261b2837', url: '/symbols/mulberry/crunchy.svg' },
        { revision: '27edb2846fd0e8d7bfc73d3a1903e500', url: '/symbols/mulberry/crush_,_to.svg' },
        {
          revision: 'e152a054961c1cb5719bf4c3a9c18be4',
          url: '/symbols/mulberry/crush_garlic_,_to.svg',
        },
        { revision: 'c4e8b8687228a7e369e29b8c7555d359', url: '/symbols/mulberry/crutches.svg' },
        { revision: '83539d65f7ea1e9c69dfe8abdceb73fd', url: '/symbols/mulberry/crutches_1.svg' },
        { revision: 'abadb8bd66aa8603e0877d68b8ad94a7', url: '/symbols/mulberry/cucumber.svg' },
        {
          revision: 'da1a4dd0b4ac01e2234ab41fd965e220',
          url: '/symbols/mulberry/cup_non_spill.svg',
        },
        { revision: 'cf0e739c1e001879801b3cf46033b87f', url: '/symbols/mulberry/cupboard.svg' },
        { revision: 'f9e7202cc4e8922c95f441bf382364f6', url: '/symbols/mulberry/curly.svg' },
        { revision: '07c62435fee17d6aba25ecc0e02b4eb2', url: '/symbols/mulberry/curly_hair.svg' },
        { revision: 'cce423e3f1f90e9c84f48ae87e854fd4', url: '/symbols/mulberry/currants.svg' },
        { revision: 'fb717de5a25916e5b5badcae2b7d632b', url: '/symbols/mulberry/curry.svg' },
        { revision: '8fe3438f3e62b3d2250f60b0cc330161', url: '/symbols/mulberry/curtains.svg' },
        { revision: '14a606dcaec0a23c41ea866685fa5ba2', url: '/symbols/mulberry/cushion_2.svg' },
        { revision: '383f3e510f78d0854e084d73200bfb95', url: '/symbols/mulberry/cut.svg' },
        { revision: '07f98c9e5730d549760097a226d6c262', url: '/symbols/mulberry/cut_,_to.svg' },
        {
          revision: '0ce9eecbc4701ca4ce0bf1c3ae6804d1',
          url: '/symbols/mulberry/cut_and_paste.svg',
        },
        {
          revision: 'b28549fd380267807e1f4d9a0a2f8abe',
          url: '/symbols/mulberry/cut_with_scissors_,_to.svg',
        },
        { revision: '6ff075f5d92e2e0e1096d3ca57c4e9e2', url: '/symbols/mulberry/cycle_,_to.svg' },
        { revision: 'af7d012fd453947e30b458e3f07b4528', url: '/symbols/mulberry/cycle_helmet.svg' },
        { revision: 'd053c9fd3335d7967641919c21621210', url: '/symbols/mulberry/cymbals_hand.svg' },
        {
          revision: 'e601f8f3df99ad8e47cb07d9364d5516',
          url: '/symbols/mulberry/d_-_lower_case.svg',
        },
        { revision: '6b78278f504df650596c105a1c78674e', url: '/symbols/mulberry/dad_parent.svg' },
        { revision: '953c28353c7334062b68405bcae50889', url: '/symbols/mulberry/daffodil.svg' },
        {
          revision: '8ff430c94653ade6559735f27925389f',
          url: '/symbols/mulberry/dairy_products.svg',
        },
        { revision: 'e3e1b16fbcd0f045e3a0a4181f33ab11', url: '/symbols/mulberry/daisy.svg' },
        { revision: '272de12b7e7f5749e9d186565c8900b3', url: '/symbols/mulberry/dance_,_to.svg' },
        { revision: 'c1cb9a85fd8b3f1eb63f9c715858e1cd', url: '/symbols/mulberry/dance_2_,_to.svg' },
        { revision: '421ceed268a057ec8fdb431e0b416ddd', url: '/symbols/mulberry/dance_3_,_to.svg' },
        {
          revision: 'fdcf1b10334a713e20f30d73a66a97c3',
          url: '/symbols/mulberry/danish_pastry.svg',
        },
        { revision: 'b56f2d8300aea570b79873d8c45e5f84', url: '/symbols/mulberry/darts.svg' },
        { revision: '1cc12dd5f4487a0f1d5a597c7790e41e', url: '/symbols/mulberry/date.svg' },
        { revision: '8c09562171d19b39762706aa037c836c', url: '/symbols/mulberry/dates.svg' },
        { revision: '27bd98c7b90afddcb377b698c0726fb6', url: '/symbols/mulberry/daughter.svg' },
        { revision: 'b3482904468fef1d72479033019cfca9', url: '/symbols/mulberry/day.svg' },
        {
          revision: '147a03a5dc481de9ad39ab1397a0c696',
          url: '/symbols/mulberry/daydream_,_to.svg',
        },
        { revision: '33ae642424b706888e85460ed39849b9', url: '/symbols/mulberry/dead.svg' },
        { revision: '7f4915b01b306a5e7e0aee22f632dbee', url: '/symbols/mulberry/dead_plant.svg' },
        {
          revision: 'ef299777e7e2b73fdfb26f1638a4a82f',
          url: '/symbols/mulberry/decorate_,_to.svg',
        },
        {
          revision: '8f71ee4d2f7bfc55e182aa452ba886ff',
          url: '/symbols/mulberry/decorate_cake_,_to.svg',
        },
        {
          revision: '47d3b0f88d94e5f258e3ba25885ab4fe',
          url: '/symbols/mulberry/decorate_tree_,_to.svg',
        },
        { revision: '57dbf7da2e117ac88b158724a71943c3', url: '/symbols/mulberry/deep.svg' },
        {
          revision: 'c4f974804794a8278cd1e3391a4c97f6',
          url: '/symbols/mulberry/deep_fat_fryer.svg',
        },
        { revision: '15bec7040a7003fc3bc2bd5872879543', url: '/symbols/mulberry/deer.svg' },
        {
          revision: 'dfe51021b8dd36fa0730c83e60a622a0',
          url: '/symbols/mulberry/delicious_drink.svg',
        },
        {
          revision: '1c27dfcf71fe062577c84be79669e4f3',
          url: '/symbols/mulberry/delicious_food.svg',
        },
        { revision: '309d08b16b4019903b1e2878497cfeaf', url: '/symbols/mulberry/deliver_,_to.svg' },
        {
          revision: 'b320a4c69bdb3022a1753e9fcab1ab27',
          url: '/symbols/mulberry/deliver_2_,_to.svg',
        },
        {
          revision: '6d9ee7aa36b203e46b4fa566fd99e028',
          url: '/symbols/mulberry/delivery_person_1a.svg',
        },
        {
          revision: '0c3c74b61cfaa3a17d1d1a47f258771f',
          url: '/symbols/mulberry/delivery_person_1b.svg',
        },
        {
          revision: 'da5dec86c30336d73c064d4e97ccc531',
          url: '/symbols/mulberry/delivery_person_2a.svg',
        },
        {
          revision: '565aa02f98ee22bb2dfb23c30367640c',
          url: '/symbols/mulberry/delivery_person_2b.svg',
        },
        {
          revision: '97b0e61566fde92021a5826796fbdc7d',
          url: '/symbols/mulberry/delivery_trolley.svg',
        },
        { revision: '514a25f3e862d5665b70b75e95467bbd', url: '/symbols/mulberry/dental_floss.svg' },
        { revision: '523bb4f417a61eb97e3cd64f82535a52', url: '/symbols/mulberry/dentist_1a.svg' },
        { revision: '5e568f22cd91d4f6bcd4268304a4641e', url: '/symbols/mulberry/dentist_1b.svg' },
        { revision: '09a92b57f44b1d465f3ef6d31bbe0583', url: '/symbols/mulberry/dentist_2a.svg' },
        { revision: '3cfe06bd4d999ae8d21f38dc9810623e', url: '/symbols/mulberry/dentist_2b.svg' },
        { revision: '3378381f55ae352cc35f71fab39e5fc8', url: '/symbols/mulberry/deodorant.svg' },
        {
          revision: '4c48dd7c624833ceb270f71540c25855',
          url: '/symbols/mulberry/deodorant_spray.svg',
        },
        {
          revision: '59ec805cd3d20901f806b6dfcaaa72f9',
          url: '/symbols/mulberry/desiring_lady.svg',
        },
        { revision: '114355117ef63f0fb6f886ed497034f6', url: '/symbols/mulberry/desiring_man.svg' },
        { revision: '917e62ad47f2d6dd402b2d7e4af9e282', url: '/symbols/mulberry/desk.svg' },
        { revision: '056f3493aee8b55de93f694c236bfa82', url: '/symbols/mulberry/dessert.svg' },
        { revision: 'f8549b8d1ea787929753b1c50ae52898', url: '/symbols/mulberry/dessert_menu.svg' },
        { revision: '95db7a54b245494864ee6bc7a1a07f8e', url: '/symbols/mulberry/dial_,_to.svg' },
        { revision: '230f8ce11e2b329b7d54b1923348d1bb', url: '/symbols/mulberry/diamond.svg' },
        { revision: '8749ee9453df02f402bcef43e22fc719', url: '/symbols/mulberry/dice_,_to.svg' },
        { revision: '11020260e2ebe7e57d0ea7a945f88237', url: '/symbols/mulberry/dictionary.svg' },
        { revision: '4e49a04c1ceebb3d1cd9c3387740774b', url: '/symbols/mulberry/die_,_to.svg' },
        { revision: '6da436943ea381637851bdc76e2f264e', url: '/symbols/mulberry/dig_,_to.svg' },
        { revision: '3dcb191585c8796ab6be4833d69f0e4e', url: '/symbols/mulberry/dig_2_,_to.svg' },
        { revision: '4121e9205696805e24e9ca0191a2ca91', url: '/symbols/mulberry/dining_table.svg' },
        { revision: '494a7e1121a8233ef0fbda76571c19a5', url: '/symbols/mulberry/dinner.svg' },
        {
          revision: '468b0fd786063229048bb77245a6e23c',
          url: '/symbols/mulberry/dinner_2_people.svg',
        },
        {
          revision: 'dc339289b6510eafb1221bab4903db5e',
          url: '/symbols/mulberry/dinner_3_people.svg',
        },
        { revision: 'f22850e17b65eee3d0e5e9930498fd34', url: '/symbols/mulberry/dinner_cold.svg' },
        { revision: '654dd8f7d99965bd90ff08c109b52b67', url: '/symbols/mulberry/dinner_hot.svg' },
        {
          revision: 'fbc4d5fbc998836fcc7f9a970a424b66',
          url: '/symbols/mulberry/dinner_lady_1a.svg',
        },
        {
          revision: '128d00f178a42614151e66f559ca5888',
          url: '/symbols/mulberry/dinner_lady_1b.svg',
        },
        { revision: '4dd6ed2821fd89b31b7c53ad658f668d', url: '/symbols/mulberry/dinner_time.svg' },
        {
          revision: 'bb7daec8a47b26592a2efdc7a531cffa',
          url: '/symbols/mulberry/dinner_time_1.svg',
        },
        { revision: 'b4504095f38857f9c7326ee9e1d277ee', url: '/symbols/mulberry/dinosaur.svg' },
        {
          revision: 'c74c25d0e4c2f5c20a9161fcb94c45b8',
          url: '/symbols/mulberry/dip_food_,_to.svg',
        },
        { revision: '45abc75cf8b7ef1f71e761b7f7663c4b', url: '/symbols/mulberry/dirty.svg' },
        { revision: '3197adef9308cf8764208b39f5cd6988', url: '/symbols/mulberry/dirty_dishes.svg' },
        {
          revision: '0ba31a66ed6ef8a61d2b717f4e1ccab7',
          url: '/symbols/mulberry/disabled_sign.svg',
        },
        {
          revision: 'c67ef677c471dc50e4e28eff43bc88a5',
          url: '/symbols/mulberry/disabled_toilet.svg',
        },
        {
          revision: '3a2c78944205ea5746d93dfab5c547fb',
          url: '/symbols/mulberry/disgusted_lady.svg',
        },
        {
          revision: 'df6b0a78d0b413c8562fc8ab3dc014c7',
          url: '/symbols/mulberry/disgusted_man.svg',
        },
        { revision: 'e5648561b7808a26a10774c7ade39f72', url: '/symbols/mulberry/dish.svg' },
        { revision: '909e8fb9f6595ef5b5eee542d17df9c8', url: '/symbols/mulberry/dish_cloth.svg' },
        {
          revision: '250d46b7682107f3eff26f5e6b05c465',
          url: '/symbols/mulberry/dish_partitioned.svg',
        },
        { revision: 'ffca483792e53a421964b0b245c12ff5', url: '/symbols/mulberry/dishes.svg' },
        { revision: 'c2c1e33417c7850c8bccd36d27956442', url: '/symbols/mulberry/dishwasher.svg' },
        {
          revision: '1595aa8d8883b6e34ef1ef45065584c4',
          url: '/symbols/mulberry/dishwasher_powder.svg',
        },
        { revision: 'f9320685183fc979de07b5ee48c6b2e0', url: '/symbols/mulberry/dive_,_to.svg' },
        { revision: '9800f50bccc7fd5f2af91a9c87b0fbf7', url: '/symbols/mulberry/dive_2_,_to.svg' },
        { revision: '2dada5c78e7ba566f98b055c6567d968', url: '/symbols/mulberry/divide.svg' },
        { revision: '265732280c661d890bb8e00bf16535ec', url: '/symbols/mulberry/doctor_1a.svg' },
        { revision: 'd7c2f8acd10d92e84f13569a68b0c0d3', url: '/symbols/mulberry/doctor_1b.svg' },
        { revision: '48b314246eb4091eed9f63b15094618c', url: '/symbols/mulberry/doctor_2a.svg' },
        { revision: '79c9b5f4eeb4f633ed10ef3e9b573297', url: '/symbols/mulberry/doctor_2b.svg' },
        { revision: '7652c3127a08880e163553cf0b069716', url: '/symbols/mulberry/dog.svg' },
        { revision: '46024e7b5e6f86cfb6f0bc0af8a83367', url: '/symbols/mulberry/dog_basket.svg' },
        { revision: 'eef93bd9a47ea955e402dd72a314079d', url: '/symbols/mulberry/dog_bed.svg' },
        { revision: 'a61308f5262969b206ba3bebf650fffc', url: '/symbols/mulberry/dog_biscuits.svg' },
        { revision: '669b2eae70239249c5feb25bf4ba4958', url: '/symbols/mulberry/dog_chew.svg' },
        { revision: 'fd7a519e0a46336e92f61c7ca8718b0a', url: '/symbols/mulberry/dog_coat.svg' },
        { revision: '38af699ee87d552cce9122418cafac49', url: '/symbols/mulberry/dog_food.svg' },
        { revision: 'c5cd243ab5ffe02c4e867cd6c42c570c', url: '/symbols/mulberry/dog_kennel.svg' },
        { revision: '7348ac5356dea0ad35081190d6dcfdb0', url: '/symbols/mulberry/doidy_cup.svg' },
        { revision: '2442f39b101722a4de7b09f5e1fdaf70', url: '/symbols/mulberry/doll.svg' },
        { revision: 'd8b4f67f98dc819fe9ed3ce1bae93658', url: '/symbols/mulberry/dolphin.svg' },
        { revision: 'ff0c02c6dd88175a222763c84bd33654', url: '/symbols/mulberry/donkey.svg' },
        { revision: '4465be7a4847da838cd23aaa88c0af45', url: '/symbols/mulberry/door.svg' },
        { revision: 'c357037568055bd54e50eb5c64ec307e', url: '/symbols/mulberry/door_2.svg' },
        { revision: '1a2e1d9ff78265afb51c30a828851818', url: '/symbols/mulberry/double_bed.svg' },
        { revision: '50c1e3b72729737bc28602b355b6745a', url: '/symbols/mulberry/doughnut.svg' },
        { revision: '3e8bf25d88b14b5a4f3d5d5076638b0a', url: '/symbols/mulberry/dove.svg' },
        { revision: '1ae11ebaa3d053e57c72b3dc06e2540f', url: '/symbols/mulberry/down.svg' },
        { revision: '5d96d1d0017c33c23ca957c4556bc3b3', url: '/symbols/mulberry/download.svg' },
        {
          revision: '12dee31b1590450df9ae39bbaaf1e07b',
          url: '/symbols/mulberry/download_,_to.svg',
        },
        { revision: '877ba5fb41af0c768c80406bafbde2dc', url: '/symbols/mulberry/dragonfly.svg' },
        {
          revision: '05e66774f2ebb22950c29492e6d0a273',
          url: '/symbols/mulberry/draining_board.svg',
        },
        { revision: 'b9cae689c00fa3ca029bf7deacb147fb', url: '/symbols/mulberry/drama.svg' },
        { revision: '1b03dfda69d30231f60b31391a77bbb6', url: '/symbols/mulberry/drama_class.svg' },
        { revision: '37394dcf6f50e48410630a5c0458fb39', url: '/symbols/mulberry/draw_,_to.svg' },
        { revision: '47abe47fd5a3d500c6dae397a4009a97', url: '/symbols/mulberry/drawer.svg' },
        { revision: '8f6642e232993bbada3e5a8c1bc8202c', url: '/symbols/mulberry/drawing_pin.svg' },
        { revision: 'bdcd13d87cc5be48892ace835cabbb3d', url: '/symbols/mulberry/dream_,_to.svg' },
        { revision: '7bd565dcb2bc92b39aba0bddbf8e8ae2', url: '/symbols/mulberry/dress.svg' },
        { revision: '99792329660d8ded0be653451b400714', url: '/symbols/mulberry/dresser.svg' },
        {
          revision: 'a010b2ed32c89d05cd6d6273982f221c',
          url: '/symbols/mulberry/dressing_gown.svg',
        },
        {
          revision: '15b91fc96fdf9e20e39051696a205e11',
          url: '/symbols/mulberry/dressing_table.svg',
        },
        {
          revision: 'c75d459be684e2c796872290973ced5a',
          url: '/symbols/mulberry/dribble_football_,_to.svg',
        },
        { revision: '8e656c427ef5b986635f3e29465df2e3', url: '/symbols/mulberry/drill_bit.svg' },
        {
          revision: '1555fcc07b56f6c98613267214c2f5ac',
          url: '/symbols/mulberry/drill_electric.svg',
        },
        { revision: 'a9ca402deb55fd655f456507c717dffd', url: '/symbols/mulberry/drink.svg' },
        { revision: '2ce80bbadd24e35dbf219672fc561398', url: '/symbols/mulberry/drink_,_to.svg' },
        { revision: '93b36c77baf6637f638bdeb17dd40bb9', url: '/symbols/mulberry/drink_2_,_to.svg' },
        { revision: 'ad934b95b32b767a1d27a844a68d3553', url: '/symbols/mulberry/drink_3_,_to.svg' },
        { revision: 'cd701e52d934d99e93797ceb2cbd6a08', url: '/symbols/mulberry/drink_cold.svg' },
        { revision: '4a50bbaaf5c3f421d0c1a604c846c525', url: '/symbols/mulberry/drink_cold_2.svg' },
        {
          revision: 'c9104c69916d590c9a8935c69197fb3e',
          url: '/symbols/mulberry/drink_consistency_firm_spoon.svg',
        },
        {
          revision: 'bcdc0591327157f2e4cc721270071b9d',
          url: '/symbols/mulberry/drink_consistency_honey_cup.svg',
        },
        {
          revision: 'f74837e86754c39632e3cc0c47b54bff',
          url: '/symbols/mulberry/drink_consistency_juice_straw.svg',
        },
        { revision: 'eba1485fc24c9967a30cadcfb581d6bf', url: '/symbols/mulberry/drink_hot.svg' },
        { revision: 'c030daeabe1686e42662d992d3d94536', url: '/symbols/mulberry/drink_hot_2.svg' },
        { revision: 'ce211d3caa4fcd39c0c57ca17cf29cd6', url: '/symbols/mulberry/drink_large.svg' },
        { revision: '25e99f45a4d1d20673fb52420c7ddafe', url: '/symbols/mulberry/drink_medium.svg' },
        { revision: 'ed901b80a4a90d3f7bcf384129de09e0', url: '/symbols/mulberry/drink_small.svg' },
        { revision: 'ce79ee4a2f3b412487f07bae37e14209', url: '/symbols/mulberry/drinks.svg' },
        { revision: 'd3835b0be1408728a6a10d51c7626606', url: '/symbols/mulberry/drip_,_to.svg' },
        { revision: 'b94203cc032f9e07b08969deec84960f', url: '/symbols/mulberry/drive_,_to.svg' },
        {
          revision: '570bfd32ea7f6c48c7027479289ac33b',
          url: '/symbols/mulberry/dropper_pipette.svg',
        },
        { revision: '7e8871d23a4549cf03754a05b746aa7e', url: '/symbols/mulberry/drown_,_to.svg' },
        { revision: 'ef698c4d5c83a8f6cf743ef0b419a2b4', url: '/symbols/mulberry/drum.svg' },
        { revision: '19474c27000f95164b53d6d093d729bd', url: '/symbols/mulberry/drumsticks.svg' },
        { revision: 'a68a1b65f4ccc3c8d7a201731bc25979', url: '/symbols/mulberry/dry.svg' },
        {
          revision: 'a38e76ebb7e9bdfc9c13605a1eff84d3',
          url: '/symbols/mulberry/dry_face_,_to.svg',
        },
        {
          revision: '042c1b388abcce22f269a7e0f2f5f57a',
          url: '/symbols/mulberry/dry_hair_,_to.svg',
        },
        {
          revision: 'c920c1f79110761d44519d8923387832',
          url: '/symbols/mulberry/dry_hair_2_,_to.svg',
        },
        {
          revision: 'a8336063481fb68fc54b1c5343fbc14b',
          url: '/symbols/mulberry/dry_hands_,_to.svg',
        },
        {
          revision: '5f204bd5f59ce5cc29be8be04d5f8fb3',
          url: '/symbols/mulberry/dry_hands_2_,_to.svg',
        },
        { revision: 'a54747263212e71f76cdf46032fb1e61', url: '/symbols/mulberry/duck.svg' },
        { revision: '60c847843a79505c74b50e73df49e72e', url: '/symbols/mulberry/dumper_truck.svg' },
        { revision: 'c117d95f3a2b408166393141395886df', url: '/symbols/mulberry/dust_,_to.svg' },
        {
          revision: 'cc8c179fe3fb80cfcfa9b1edb80a357a',
          url: '/symbols/mulberry/dysphagia_cup.svg',
        },
        {
          revision: '47dcf275aeed9069d656fc8fa2811e99',
          url: '/symbols/mulberry/dysphagia_cup_2.svg',
        },
        {
          revision: 'f7db940a85b609da82cf4e2e8bc007d3',
          url: '/symbols/mulberry/dysphagia_cup_3.svg',
        },
        {
          revision: 'b125657ac7669ad4fb5807ece21f7b6d',
          url: '/symbols/mulberry/e_-_lower_case.svg',
        },
        { revision: '27d3ef065303d9f2158f75e7f0a74595', url: '/symbols/mulberry/ear.svg' },
        { revision: '71c7b263009e31f3419304b28609d78c', url: '/symbols/mulberry/ear_muffs.svg' },
        { revision: 'cdc6b1a240628487673d95d787134d9e', url: '/symbols/mulberry/earrings.svg' },
        { revision: 'a61919b264af1b7dac233025a3ed2352', url: '/symbols/mulberry/earthworm.svg' },
        { revision: '33ab983f631b7a95c0b7ffc8506b284b', url: '/symbols/mulberry/earwig.svg' },
        { revision: '6545551760e55c3268fef45534f4e72b', url: '/symbols/mulberry/east.svg' },
        { revision: 'c90bb2b81071abb91960e28c3c4ea5a4', url: '/symbols/mulberry/eat_,_to.svg' },
        { revision: 'a55409bc89162ce0cb85827821703693', url: '/symbols/mulberry/eat_1_,_to.svg' },
        { revision: '1e4c08b9f82c853c91a77cfb7c06748e', url: '/symbols/mulberry/eat_2_,_to.svg' },
        { revision: '15cdb3d854bf88ed621fabb3c9a824a8', url: '/symbols/mulberry/egg.svg' },
        { revision: '79fb69234dedafe98dbe859c4f783215', url: '/symbols/mulberry/egg_boiled.svg' },
        { revision: 'f15b22c642d0503a29cad0e52923bb6e', url: '/symbols/mulberry/egg_cup.svg' },
        { revision: 'fa5af520640fba4402d7204898c8e79a', url: '/symbols/mulberry/egg_fried.svg' },
        { revision: '5d7467b46c54a23f0e33761994089901', url: '/symbols/mulberry/egg_on_toast.svg' },
        { revision: '055bad46368a3268271458208609c430', url: '/symbols/mulberry/egg_white.svg' },
        { revision: '48e35ac4f08ce0b62fb9446a5baf3459', url: '/symbols/mulberry/egg_yolk.svg' },
        { revision: '3149dd55953cd3050ece3e87687a2853', url: '/symbols/mulberry/eggs.svg' },
        {
          revision: 'e22b77fdf108c0530874508fee35dbaa',
          url: '/symbols/mulberry/eggs_scrambled.svg',
        },
        { revision: '31f10f9a72ac687236e384c0309b70ce', url: '/symbols/mulberry/eight.svg' },
        { revision: '69d49ba747371c1c60f9edded2bbde8a', url: '/symbols/mulberry/eight_dots.svg' },
        { revision: 'f3c2a6eba14593cbf3ed445b1f8e7a03', url: '/symbols/mulberry/eighteen.svg' },
        { revision: '3f7417fe3788790567b357dff042eb70', url: '/symbols/mulberry/eighth.svg' },
        { revision: '78d98dbe72a583cb684672ac32988fa0', url: '/symbols/mulberry/eighty.svg' },
        { revision: 'f4d524a8cf2f90659fd34b6735d6eeff', url: '/symbols/mulberry/either.svg' },
        { revision: 'da55b170f1f146a1fad98732e4733518', url: '/symbols/mulberry/elbow.svg' },
        { revision: '0b1440dc706ca639eb0ed3286e1f0bde', url: '/symbols/mulberry/elearning.svg' },
        { revision: 'd18a752e87454cd5e6822ff7e4e9f271', url: '/symbols/mulberry/elephant.svg' },
        { revision: '2e6adc3a2e8558d73fe4ac56003e3332', url: '/symbols/mulberry/eleven.svg' },
        { revision: 'e14bd6f4b02b53fd22adc965a502efcb', url: '/symbols/mulberry/elf.svg' },
        { revision: '504d7bf7211fe39e654495ecfd3fe446', url: '/symbols/mulberry/emagazine.svg' },
        { revision: 'fdd4c68cdabd78e6b90b12e9532c5230', url: '/symbols/mulberry/email.svg' },
        {
          revision: '24a1caa21b30b9f9740feadd6f30c064',
          url: '/symbols/mulberry/email_attachment.svg',
        },
        {
          revision: 'd076d549f380189f0990f4a749cff1a4',
          url: '/symbols/mulberry/email_send_,_to.svg',
        },
        { revision: '95ff1832f11d76b7a4b7792a10e57eea', url: '/symbols/mulberry/emery_board.svg' },
        { revision: 'b873885ea0ce7affb999ca5b7f8e17f9', url: '/symbols/mulberry/empty.svg' },
        {
          revision: '14bd3928dcdf534b21e97ace5b8a2e4a',
          url: '/symbols/mulberry/energy_monitor.svg',
        },
        { revision: '68725ca5b51cb67dd5e0ce854aea87e3', url: '/symbols/mulberry/engine.svg' },
        { revision: 'b7d99f8f70da52c90ebe5dd8c58c8e55', url: '/symbols/mulberry/english.svg' },
        {
          revision: '53959361ce57319dfac15a4f5dc3e709',
          url: '/symbols/mulberry/english_class.svg',
        },
        { revision: '965ee8aea3b87f084cd4e949a06b910a', url: '/symbols/mulberry/enough.svg' },
        { revision: '85b88895db9432f4bf34479eb13bafa4', url: '/symbols/mulberry/enter_,_to.svg' },
        {
          revision: '5c18218b24ba67e1fe71291f08e974c3',
          url: '/symbols/mulberry/enter_door_,_to.svg',
        },
        { revision: '86030920b745fae8c378cda089ccba31', url: '/symbols/mulberry/envelope.svg' },
        { revision: '8f30e15eb39ecbf228a1dae3c0bbd4d7', url: '/symbols/mulberry/escalator.svg' },
        { revision: '825ae55aeb0b60bad11bdc14e826f9b4', url: '/symbols/mulberry/escape_,_to.svg' },
        { revision: '1d968c75ef267708c02e046a8607b912', url: '/symbols/mulberry/even.svg' },
        { revision: '9ecb785f16280dff1d6b4dcdcaf5ed7e', url: '/symbols/mulberry/every.svg' },
        { revision: 'a9145da076d9bba012dae07cb0896441', url: '/symbols/mulberry/excited_lady.svg' },
        { revision: '85a143fc462c6aa728d995208e0b6dca', url: '/symbols/mulberry/excited_man.svg' },
        {
          revision: '7d3394be8f76bc90e5e55044e04537fe',
          url: '/symbols/mulberry/exercise_,_to.svg',
        },
        { revision: 'bdb082ccefa48003897d199c8e99adb3', url: '/symbols/mulberry/exit_,_to.svg' },
        {
          revision: 'c7ec704ac55c5fe93fde92c6c7f1cf64',
          url: '/symbols/mulberry/exit_door_,_to.svg',
        },
        {
          revision: '078f2e9f2855c2fd9d24398b9adf413d',
          url: '/symbols/mulberry/extension_lead.svg',
        },
        { revision: 'f83ab3d7019d116144722660f185e673', url: '/symbols/mulberry/extra.svg' },
        { revision: '308836a509ba012052758c0271c7e6a2', url: '/symbols/mulberry/extra_2.svg' },
        { revision: 'eff547d5c1683561ec51875839b307e0', url: '/symbols/mulberry/extra_large.svg' },
        { revision: '253a66238cdff28a9eec99853836f3f3', url: '/symbols/mulberry/eye.svg' },
        { revision: 'e6779f4bb5aa7be751f3d31fe7478e91', url: '/symbols/mulberry/eye_drops.svg' },
        { revision: 'bdb401ad43a52006252176923867dd79', url: '/symbols/mulberry/eye_shadow.svg' },
        { revision: 'bd88838d0af03835187e5f09e29afa95', url: '/symbols/mulberry/eyebrow.svg' },
        {
          revision: '3b90993dbb57b4cdfd336809139a1d51',
          url: '/symbols/mulberry/eyebrow_bushy.svg',
        },
        {
          revision: '7bdd17c7455b5beb197bd8bd45db60e2',
          url: '/symbols/mulberry/eyebrow_pencil.svg',
        },
        { revision: '31425aeb207c54e0116b634dea1f07f1', url: '/symbols/mulberry/eyelash.svg' },
        {
          revision: '2d312ed6be5539f54964e6f020fd85a6',
          url: '/symbols/mulberry/eyelash_curler.svg',
        },
        { revision: '59b375b8dcfc3f01f5c9971b9179f78a', url: '/symbols/mulberry/eyes.svg' },
        { revision: '8754edb9068d6c5cd3ba3c963b027a37', url: '/symbols/mulberry/eyes_blue.svg' },
        { revision: '799e8f15c9eee63af8ae1fba319eeb84', url: '/symbols/mulberry/eyes_brown.svg' },
        { revision: 'ce6aac84dcb61fc7aa638a02359bb14a', url: '/symbols/mulberry/eyes_closed.svg' },
        { revision: 'a7720fbb4c652711ae4833c60af594db', url: '/symbols/mulberry/eyes_green.svg' },
        {
          revision: '65137d57e81d842b47fccf5da4ca4d0f',
          url: '/symbols/mulberry/f_-_lower_case.svg',
        },
        { revision: '7e93e8a430d782cd0eb2aed9ec135d98', url: '/symbols/mulberry/fabric.svg' },
        {
          revision: 'd5d32e1b5e574fd30ee23e73b3b7f0d9',
          url: '/symbols/mulberry/face_neutral_3.svg',
        },
        { revision: '14cbe423dd2a1d90699c895e15b0c8c4', url: '/symbols/mulberry/fairy.svg' },
        {
          revision: '7c438acd04aa29714c521de6bd4c6bb2',
          url: '/symbols/mulberry/fall_off_,_to.svg',
        },
        {
          revision: 'b78738d890fed099c85437077ee1373a',
          url: '/symbols/mulberry/fall_over_,_to.svg',
        },
        { revision: '2b94165b3b233265949edd1081754c78', url: '/symbols/mulberry/family.svg' },
        { revision: 'e85ba3d98c788bdb980a7577a23e9a19', url: '/symbols/mulberry/family_2.svg' },
        { revision: 'fe763c8983609b99defdf64020fc11a9', url: '/symbols/mulberry/fancy.svg' },
        { revision: '5f127cae8f8304101e324ff426647f44', url: '/symbols/mulberry/fangs.svg' },
        { revision: '3a5f1b4da3efdbe27817fd5407a47a30', url: '/symbols/mulberry/farmer_1a.svg' },
        { revision: 'e41b2696fbcc5967f5e064f80878afb7', url: '/symbols/mulberry/farmer_1b.svg' },
        { revision: '9ef2b96a1e6701ac16d420bbe9d35f5f', url: '/symbols/mulberry/farmer_2a.svg' },
        { revision: 'ef66d42b48cf3b33d5fa6ba754a2009c', url: '/symbols/mulberry/farmer_2b.svg' },
        { revision: '56df97c9b700a8c7efac338525f9af37', url: '/symbols/mulberry/fast_2.svg' },
        { revision: '31033d81c738e83283cfca7edd642a6d', url: '/symbols/mulberry/fasten_,_to.svg' },
        { revision: '0bf209539172bfe3b99def53414d8793', url: '/symbols/mulberry/fat.svg' },
        { revision: 'a5a9b21bde3b3a2d8b4efcc74a99fa9e', url: '/symbols/mulberry/fats.svg' },
        { revision: '0edbbbab6ca275de8a35d94b08626efc', url: '/symbols/mulberry/fats_high.svg' },
        { revision: 'a2a55aa84aa766a062f74a47489c66aa', url: '/symbols/mulberry/fats_low.svg' },
        { revision: '68dec78f0f936a1afdb241df810f2279', url: '/symbols/mulberry/favourite.svg' },
        { revision: 'd1c383f0f07ad92b3829a2913eef1f33', url: '/symbols/mulberry/fax_machine.svg' },
        { revision: 'd7f05ca559c18a7f1b6bf582ea6764a9', url: '/symbols/mulberry/feather.svg' },
        {
          revision: 'e7782f62c8a77473639c5c8aa1b86543',
          url: '/symbols/mulberry/features_facial.svg',
        },
        {
          revision: '8853c1bc6217c58892761c12428c6113',
          url: '/symbols/mulberry/feed_cat_,_to.svg',
        },
        {
          revision: 'd8e4104ac8aa4df5156efc8af57a3eed',
          url: '/symbols/mulberry/feed_dog_,_to.svg',
        },
        {
          revision: 'b0aa3dd1198a07aa79840964d71260e4',
          url: '/symbols/mulberry/feed_someone_,_to.svg',
        },
        {
          revision: '38852e3473e4c88e9862df02b1bb8991',
          url: '/symbols/mulberry/feed_someone_2_,_to.svg',
        },
        { revision: '68d7544e562a262eb307b7166397a9b5', url: '/symbols/mulberry/feet.svg' },
        { revision: '6550c9a95a7f115eff1823170ff0ef31', url: '/symbols/mulberry/felt_tips.svg' },
        { revision: 'a17eefd7ac162d771cf35272c17628fc', url: '/symbols/mulberry/female_body.svg' },
        { revision: 'f77b9b49fb7459ac811ba0bf2b1da77a', url: '/symbols/mulberry/female_side.svg' },
        { revision: 'c67d7bd98620c04658ad48a7b16e0949', url: '/symbols/mulberry/fennel.svg' },
        { revision: '9373951d7fe5e791f4bee6364c54cd1c', url: '/symbols/mulberry/ferret.svg' },
        { revision: 'f31391cc8f727f1b69f060a78ddc906a', url: '/symbols/mulberry/ferry.svg' },
        {
          revision: 'bcc0ad5e0891fa96c6e3810a637572f8',
          url: '/symbols/mulberry/fibre_optic_lamp.svg',
        },
        { revision: 'f07bf4817d18246e860e3252e860b928', url: '/symbols/mulberry/field.svg' },
        { revision: '5f0f7753287fc03348cb25f23c60b73c', url: '/symbols/mulberry/fifteen.svg' },
        { revision: '96a04d32cc9b6fcb613ee62b63cfd190', url: '/symbols/mulberry/fifty.svg' },
        {
          revision: 'efe14c15342a3c8d17cb6769cbd7db18',
          url: '/symbols/mulberry/fifty_percent.svg',
        },
        { revision: '30ae53179443a38a1378ac870f817fa8', url: '/symbols/mulberry/fig.svg' },
        { revision: '92b24da604da21a2b0d63ad2161ac034', url: '/symbols/mulberry/fight_,_to.svg' },
        { revision: 'd8d151b1d9a6f0a90e9e88099619a299', url: '/symbols/mulberry/file.svg' },
        {
          revision: 'db6f53dce13af6ff30e0448d8ecfff7b',
          url: '/symbols/mulberry/file_metal_,_to.svg',
        },
        {
          revision: '7bdad3073ddb1020cae720d32dc58ea3',
          url: '/symbols/mulberry/file_nails_,_to.svg',
        },
        {
          revision: 'f3d073a28bcc327149af78d2921b10d9',
          url: '/symbols/mulberry/file_wood_,_to.svg',
        },
        {
          revision: '280c16fccec9fda71edd54fbf4d81b9c',
          url: '/symbols/mulberry/filing_cabinet.svg',
        },
        { revision: 'b87c91c30a5344f29472fbd8e9181f80', url: '/symbols/mulberry/fill_2_,_to.svg' },
        { revision: '6eadbeffe28dde5131c7f1e5733d66b1', url: '/symbols/mulberry/filter_paper.svg' },
        { revision: 'a4ead735fbb013625d2b75fabfca7f57', url: '/symbols/mulberry/fin.svg' },
        { revision: '304139c305cc4856a3ad87a085fb74ca', url: '/symbols/mulberry/find_,_to.svg' },
        { revision: '72ce18ca5f69c2e0171237c1507e49dd', url: '/symbols/mulberry/finger.svg' },
        {
          revision: '2ea467d21d120b1b3eb8ba878542cd13',
          url: '/symbols/mulberry/finger_painting.svg',
        },
        {
          revision: 'e7c5971b3c6767f7bb1cc2723ea07d91',
          url: '/symbols/mulberry/finger_puppet.svg',
        },
        { revision: '9d2c709ef9a3108429286d30c9a284a1', url: '/symbols/mulberry/fingernail.svg' },
        { revision: '7832d00894e6057acb41282397db39d6', url: '/symbols/mulberry/fingernails.svg' },
        { revision: '798bec31be4be0a349bcadfde4c76631', url: '/symbols/mulberry/fingers.svg' },
        { revision: 'e89b8c8b9a3efbf6a62b6ef87848db9d', url: '/symbols/mulberry/finish.svg' },
        { revision: '478ecfbfbb319d39bc6799497d738dd9', url: '/symbols/mulberry/fir_tree.svg' },
        { revision: '05c5edbeaff163c359de6dc9616727cc', url: '/symbols/mulberry/fire.svg' },
        { revision: 'f475de7305cc82d8ab1c39187c3f21aa', url: '/symbols/mulberry/fire_engine.svg' },
        { revision: 'edcc4db9a92ef539f3909c5252ace0dc', url: '/symbols/mulberry/fire_helmet.svg' },
        { revision: '4d00bb7ccd3a6c1415c2712d1b2be130', url: '/symbols/mulberry/fire_hose.svg' },
        { revision: 'f61db7981079eb3873aeddb1b6c4ad8b', url: '/symbols/mulberry/fireplace.svg' },
        { revision: '47f653b1fd55132c86e0f1a13c42a27d', url: '/symbols/mulberry/fireworks.svg' },
        { revision: '8fd5065b224c1854802ec5a1abc1eaf7', url: '/symbols/mulberry/fireworks_2.svg' },
        { revision: '2168641b3c5aa4afbd4d2cf665ee60e7', url: '/symbols/mulberry/first.svg' },
        { revision: 'ec7431a8d25e78c401e0b2d7e53b457c', url: '/symbols/mulberry/first_2.svg' },
        {
          revision: '1bf6b35c2b7c310fc3d9ab58e97c622d',
          url: '/symbols/mulberry/first_aid_box.svg',
        },
        { revision: 'b6287fd1bfb3fe212b2c81a5c998d08d', url: '/symbols/mulberry/first_base.svg' },
        { revision: 'f2e9be3ad43e91f9b3f3396ea166b7dc', url: '/symbols/mulberry/fish.svg' },
        { revision: 'cb8c3bf62dac610683f480052f475e20', url: '/symbols/mulberry/fish_,_to.svg' },
        {
          revision: '4b928dee1d66a52ac399871aed601fbe',
          url: '/symbols/mulberry/fish_and_chips.svg',
        },
        {
          revision: '193a3806bc230cbe9f6ede32f33cdcf8',
          url: '/symbols/mulberry/fish_battered.svg',
        },
        { revision: '970149a82600eb5c298a4e52cda2a7bf', url: '/symbols/mulberry/fish_burger.svg' },
        {
          revision: '9e2cf86957d3b74dc2ae98f1930ce41a',
          url: '/symbols/mulberry/fish_deep_fried.svg',
        },
        { revision: '9058eb049b60dff0ff8eba5d2a0617ee', url: '/symbols/mulberry/fish_food.svg' },
        {
          revision: 'fc026609675dad8da7830b75a9e1e95e',
          url: '/symbols/mulberry/fish_koi_carp.svg',
        },
        { revision: '73b7d6b3675cae0e6dd969d95b038edb', url: '/symbols/mulberry/fish_tank.svg' },
        {
          revision: 'e365f9e60c31bb76769add3170b21efc',
          url: '/symbols/mulberry/fish_tropical.svg',
        },
        { revision: 'b7edba2f38fe4ead780f9a48c848d4d2', url: '/symbols/mulberry/fist.svg' },
        { revision: '4d4d651e1195fadd0a7f857cf54e1981', url: '/symbols/mulberry/five.svg' },
        { revision: 'feb9029923e84640675b3f0cfda52d15', url: '/symbols/mulberry/five_dots.svg' },
        {
          revision: '022c6f9a4c74c183fdcc52caa9349d47',
          url: '/symbols/mulberry/flag_Aboriginal_Peoples.svg',
        },
        {
          revision: 'b616317f7bf971bab731740d6b085e85',
          url: '/symbols/mulberry/flag_Abu_Dhabi_-_UAE.svg',
        },
        {
          revision: '0f3274bc50600e012e0d45cfaa90d521',
          url: '/symbols/mulberry/flag_Afghanistan.svg',
        },
        {
          revision: 'b0b9d7e036219dc465fded4885d1635b',
          url: '/symbols/mulberry/flag_African_Union.svg',
        },
        {
          revision: 'e86f94edc52d08499298eed16ac4b47f',
          url: '/symbols/mulberry/flag_Ajman_Dubia_-_UAE.svg',
        },
        {
          revision: 'e6d8fd571d060e61cab712a4450fe021',
          url: '/symbols/mulberry/flag_Aland_Islands_-_Finland.svg',
        },
        { revision: 'f4f35d8fd4113d973347e42231e7f9c4', url: '/symbols/mulberry/flag_Alaska.svg' },
        { revision: '04e545d6cd6ca156304f090841714ab2', url: '/symbols/mulberry/flag_Albania.svg' },
        {
          revision: 'e9747599a81478d20998f040ec81de02',
          url: '/symbols/mulberry/flag_Alderney.svg',
        },
        { revision: 'eba2c40c8cfe6add02ccc99e0aec0421', url: '/symbols/mulberry/flag_Algeria.svg' },
        {
          revision: 'bdc509f7ab007adbedf10e23ed005de3',
          url: '/symbols/mulberry/flag_American_Samoa.svg',
        },
        { revision: 'cff56454312a71eb67f8a8cde4158237', url: '/symbols/mulberry/flag_Andorra.svg' },
        { revision: 'a0bebfd01aa5dd233fd96af36919b787', url: '/symbols/mulberry/flag_Angola.svg' },
        {
          revision: '9a9874616d193005b057242bbf46b303',
          url: '/symbols/mulberry/flag_Anguilla.svg',
        },
        {
          revision: '800222f620bf183748c158bda3429b06',
          url: '/symbols/mulberry/flag_Antartica.svg',
        },
        {
          revision: '547158f259b1b00fb8d01648f70c6aa1',
          url: '/symbols/mulberry/flag_Antigua_Barbuda.svg',
        },
        {
          revision: '2dcfcd7be894d1ae5a95e65c20639b23',
          url: '/symbols/mulberry/flag_Argentina.svg',
        },
        { revision: '8d154d8ffcc562d64767eebe599b14ed', url: '/symbols/mulberry/flag_Armenia.svg' },
        { revision: '191387bc985c5d76722985ab91ff0dda', url: '/symbols/mulberry/flag_Aruba.svg' },
        { revision: '914c0e31c2e56f64aa83c0ccacffb239', url: '/symbols/mulberry/flag_Asean.svg' },
        { revision: 'b27c4b28788b773e07318b45c643ac41', url: '/symbols/mulberry/flag_Austria.svg' },
        {
          revision: 'ec050e9a1d0d56e9a3fc0898e47845ab',
          url: '/symbols/mulberry/flag_Azerbaijan.svg',
        },
        { revision: '5622ef8999d8f4ce31241d97bb2027fe', url: '/symbols/mulberry/flag_Bahrain.svg' },
        {
          revision: '25c925cc15651f40bff3b6ccd00d60e7',
          url: '/symbols/mulberry/flag_Bangladesh.svg',
        },
        {
          revision: 'c65ce6bd168c4af24e5c0d5dcfc405a3',
          url: '/symbols/mulberry/flag_Barbados.svg',
        },
        { revision: '55426aa8a2ac977eb7f8c3365f4cf50b', url: '/symbols/mulberry/flag_Belarus.svg' },
        { revision: '8bd9cf3239b5012461c384fce6a75442', url: '/symbols/mulberry/flag_Belgium.svg' },
        { revision: '43a4fc44a91696d73f0ba51e201b64a2', url: '/symbols/mulberry/flag_Belize.svg' },
        { revision: 'af4fc45e6772b54e54d93ed0410e52c7', url: '/symbols/mulberry/flag_Benin.svg' },
        { revision: 'a233e039c232958ba286e0c405b46404', url: '/symbols/mulberry/flag_Bermuda.svg' },
        { revision: '98cf2c85b9ee41210508f3ded54bcea9', url: '/symbols/mulberry/flag_Bhutan.svg' },
        { revision: 'cd377fc13d5a00fca88ef6f76c276303', url: '/symbols/mulberry/flag_Bolivia.svg' },
        {
          revision: 'c48049a073ace0285cfea1057f01276a',
          url: '/symbols/mulberry/flag_Bonaire_Dutch_Antillies.svg',
        },
        {
          revision: '1e0a2b9317ff1043560195eba05c17dc',
          url: '/symbols/mulberry/flag_Bosnia_Herzegovina.svg',
        },
        {
          revision: 'a83a47a050af746d10cc365d76ff6e99',
          url: '/symbols/mulberry/flag_Botswana.svg',
        },
        { revision: '1bcee3a27bb1b79c272883e22fe67cb7', url: '/symbols/mulberry/flag_Brazil.svg' },
        { revision: '0ffbdb3feda00b0b29b38c9fd56d313b', url: '/symbols/mulberry/flag_Brunei.svg' },
        {
          revision: 'fddf76c577d99bf89796d9088449c2b9',
          url: '/symbols/mulberry/flag_Bulgaria.svg',
        },
        {
          revision: '09b67ec609a68ab3de0213bdd77dfe81',
          url: '/symbols/mulberry/flag_Burkina_Faso.svg',
        },
        { revision: 'd04c4eebeb2535c94c895b9f0d6129f0', url: '/symbols/mulberry/flag_Burundi.svg' },
        {
          revision: '87739db524f8d14dae931ced2a70fd1a',
          url: '/symbols/mulberry/flag_Cambodia.svg',
        },
        {
          revision: '2e96724735513681d551868e2843323f',
          url: '/symbols/mulberry/flag_Cameroon.svg',
        },
        { revision: '6abd3246775b01b7faaae222b9ee7e98', url: '/symbols/mulberry/flag_Canada.svg' },
        {
          revision: '4fd181cdb13bdfcd5245d8b15272ac82',
          url: '/symbols/mulberry/flag_Canary_Islands.svg',
        },
        {
          revision: '9ac273ca7172940a5d45d8487fc821d5',
          url: '/symbols/mulberry/flag_Cape_Verde.svg',
        },
        { revision: 'e27693c55710e5476268aa2000599aa9', url: '/symbols/mulberry/flag_Caricom.svg' },
        {
          revision: '5ef04feaff83f087b39857ec86a8c54d',
          url: '/symbols/mulberry/flag_Cayman_Islands.svg',
        },
        {
          revision: '4f14504fb449af2995700449e02f274f',
          url: '/symbols/mulberry/flag_Central_African_Republic.svg',
        },
        { revision: '69ab5eaee906ff9ff8bf2362eae47b44', url: '/symbols/mulberry/flag_Chad.svg' },
        { revision: 'fdb0590ce19ea92008055a0c2c372931', url: '/symbols/mulberry/flag_Chile.svg' },
        { revision: 'b404b46c2c936b7d31b89fad159780f6', url: '/symbols/mulberry/flag_China.svg' },
        {
          revision: '323324e8a474bb3a36888a4e0c141937',
          url: '/symbols/mulberry/flag_Colombia.svg',
        },
        { revision: 'a0d524e5e0da1aa20811e04270d803c6', url: '/symbols/mulberry/flag_Comoros.svg' },
        {
          revision: '69239a850278b8ecb1ed875aa5eeea1a',
          url: '/symbols/mulberry/flag_Congo_Brazzaville.svg',
        },
        {
          revision: 'fe8647973a38776d70e55ab464ca3100',
          url: '/symbols/mulberry/flag_Congo_Kinshasa.svg',
        },
        {
          revision: '9503f5522b8a308eb1bafd338e809544',
          url: '/symbols/mulberry/flag_Cook_Islands.svg',
        },
        {
          revision: 'd6c9a1e1fd0dac6ac2e67421404effd0',
          url: '/symbols/mulberry/flag_Costa_Rica.svg',
        },
        { revision: '42f8f77b8c46ce453e810bb2334169a7', url: '/symbols/mulberry/flag_Croatia.svg' },
        { revision: 'd0144f6ebe7105e1f7c5d96ff6da9716', url: '/symbols/mulberry/flag_Cuba.svg' },
        { revision: '3f47175275d97db139f85cd38988a85b', url: '/symbols/mulberry/flag_Cyprus.svg' },
        { revision: 'ce8314bfa6c258c01bd4356ad4256953', url: '/symbols/mulberry/flag_Denmark.svg' },
        {
          revision: 'b3118da90fcc094e97f57778e206d98b',
          url: '/symbols/mulberry/flag_Djibouti.svg',
        },
        {
          revision: 'd06c8fea40596d81c586507cda3d2698',
          url: '/symbols/mulberry/flag_Dominica.svg',
        },
        {
          revision: '707d913dec44145ce852c85abeb91f10',
          url: '/symbols/mulberry/flag_Dominican_Republic.svg',
        },
        { revision: '7aee6384d582ea2370a5339b1fdb981f', url: '/symbols/mulberry/flag_Ecuador.svg' },
        { revision: 'de810825ffcf431c6afca800a4cd106b', url: '/symbols/mulberry/flag_Egypt.svg' },
        {
          revision: 'c26f7f63ae75231cc03c00281fb854c7',
          url: '/symbols/mulberry/flag_El_Salvador.svg',
        },
        { revision: '3008576d1364a8e09bd59c77f87bd556', url: '/symbols/mulberry/flag_England.svg' },
        {
          revision: 'be253a56b13cfa450d36986c23f77468',
          url: '/symbols/mulberry/flag_Equatorial_Guinea.svg',
        },
        { revision: 'c75fed6d465539b7e203758c8ef503b7', url: '/symbols/mulberry/flag_Eritrea.svg' },
        { revision: 'eefbb5e5132d1d97d7ef32079d8170e8', url: '/symbols/mulberry/flag_Estonia.svg' },
        {
          revision: 'e1942c20c84a19db7a15ce0d48a3ac3f',
          url: '/symbols/mulberry/flag_Ethiopia.svg',
        },
        {
          revision: '62ca5581bf09cfff9578f6c6391cb9a9',
          url: '/symbols/mulberry/flag_European_Union.svg',
        },
        {
          revision: '87b83c5e484730100b6a0c8fb4294c89',
          url: '/symbols/mulberry/flag_Falkland_Islands.svg',
        },
        { revision: 'b27c2ff4ee34a49be29a841531ce2b60', url: '/symbols/mulberry/flag_Fiji.svg' },
        { revision: '451774b38999fbaa2b03e8240c1da89e', url: '/symbols/mulberry/flag_Finland.svg' },
        { revision: '23a51c57b415443b1713c15b5eef4a7e', url: '/symbols/mulberry/flag_France.svg' },
        {
          revision: '4f8e514efc9525b0edd3f8a9c0acf352',
          url: '/symbols/mulberry/flag_Fujairah_-_UAE.svg',
        },
        { revision: 'f73ff123c4e4f14c4df1c3f59d347691', url: '/symbols/mulberry/flag_Gabon.svg' },
        { revision: '94759ef39214376a5ef753390dd4f665', url: '/symbols/mulberry/flag_Georgia.svg' },
        { revision: '5c238db3a2f38404d8f1597229e6eb12', url: '/symbols/mulberry/flag_Germany.svg' },
        { revision: 'b04417bfd37bd83ac54376ddb448ab98', url: '/symbols/mulberry/flag_Ghana.svg' },
        {
          revision: '249438eec7961693ae008a12abe717b6',
          url: '/symbols/mulberry/flag_Gibraltar.svg',
        },
        { revision: '7e13c93361e5bc6f1c1cff5ebbc2e849', url: '/symbols/mulberry/flag_Greece.svg' },
        {
          revision: '3ae6fab4a68d57bf2a71ef561e586861',
          url: '/symbols/mulberry/flag_Greenland.svg',
        },
        { revision: 'fca995ca5b585ec84016b8516c4b818b', url: '/symbols/mulberry/flag_Grenada.svg' },
        { revision: '86039770a4b39d51bda7a09b9253109d', url: '/symbols/mulberry/flag_Guam.svg' },
        {
          revision: '67a7e2d949905a1f18fcc5f54b7d689d',
          url: '/symbols/mulberry/flag_Guernsey.svg',
        },
        { revision: '74e41f00b885137f96262ba94f2b3e20', url: '/symbols/mulberry/flag_Guinea.svg' },
        {
          revision: '03fd216aa6f1817261289f17eecdfd85',
          url: '/symbols/mulberry/flag_Guinea_Bissau.svg',
        },
        { revision: 'cc57959ed808c08ea7915b203c16a7a4', url: '/symbols/mulberry/flag_Guyana.svg' },
        { revision: 'b6f458a495c5361cb535406b0b577f05', url: '/symbols/mulberry/flag_Haiti.svg' },
        { revision: '4143c587f2ac01a6996253e625b0a809', url: '/symbols/mulberry/flag_Hawaii.svg' },
        {
          revision: 'db2ed7c5a9761a95b37e5b2ea75a88bb',
          url: '/symbols/mulberry/flag_Honduras.svg',
        },
        {
          revision: '886bda5045d49116475920c6da58f547',
          url: '/symbols/mulberry/flag_Hong_Kong_-_China.svg',
        },
        { revision: '80c8f779241017ee0baaf391bdda1237', url: '/symbols/mulberry/flag_Hungary.svg' },
        { revision: 'e63e4e63cf153b2b2456ee88c89452db', url: '/symbols/mulberry/flag_Iceland.svg' },
        { revision: '722df34c7a8eba59f2234c433ec7366f', url: '/symbols/mulberry/flag_India.svg' },
        {
          revision: '611d42a6d099d053948e02b2993ad58a',
          url: '/symbols/mulberry/flag_Indonesia.svg',
        },
        { revision: '63f56e3e07b713f6a7e0027505909233', url: '/symbols/mulberry/flag_Iran.svg' },
        { revision: '6d25f8a512ea98740ad9a53aad8c8a92', url: '/symbols/mulberry/flag_Iraq.svg' },
        { revision: 'f542496ecf9924376fd48530020dabea', url: '/symbols/mulberry/flag_Ireland.svg' },
        {
          revision: '852d42542662f5d64cdbd268cb304273',
          url: '/symbols/mulberry/flag_Isle_of_Man.svg',
        },
        { revision: '642c9ab3f38dcb89686abc2ff92e6326', url: '/symbols/mulberry/flag_Israel.svg' },
        { revision: '91263c748733a78f37e363db6fec418e', url: '/symbols/mulberry/flag_Italy.svg' },
        {
          revision: 'e9ab928b2d8e747b69f064f23b97f744',
          url: '/symbols/mulberry/flag_Ivory_Coast.svg',
        },
        { revision: '5ebce4e6a6f6361995a7e3bac7968b39', url: '/symbols/mulberry/flag_Jamaica.svg' },
        { revision: '9f57492720bf8d8dd03045b263b64c29', url: '/symbols/mulberry/flag_Japan.svg' },
        { revision: '1fb276915e02376856190d66c6fd8402', url: '/symbols/mulberry/flag_Jersey.svg' },
        { revision: 'f8aad48bbbb99e42a28e54c3993223dd', url: '/symbols/mulberry/flag_Jordan.svg' },
        {
          revision: '906ee36243dc2d98ed89af9db518c7bf',
          url: '/symbols/mulberry/flag_Kazakhstan.svg',
        },
        { revision: '73bf5849a0de17c6c774b9d45fdf83f5', url: '/symbols/mulberry/flag_Kenya.svg' },
        {
          revision: 'd14254791336418d8bdcc70edf9b638a',
          url: '/symbols/mulberry/flag_Kiribati.svg',
        },
        { revision: '13908660c706fa5d79891131b67974df', url: '/symbols/mulberry/flag_Kosovo.svg' },
        { revision: 'b09d9fc8fe0cf3833bd6056d10f448b3', url: '/symbols/mulberry/flag_Kuwait.svg' },
        {
          revision: '50713723cc187f4ce231d10ed81b6030',
          url: '/symbols/mulberry/flag_Kyrgyzstan.svg',
        },
        { revision: '0245b6d402cba84a754bf537246a57b7', url: '/symbols/mulberry/flag_Laos.svg' },
        { revision: 'c08b88dd486e22ab6c35403f0f504d0d', url: '/symbols/mulberry/flag_Latvia.svg' },
        { revision: '4c6472add329a943ce74309d2de5c99d', url: '/symbols/mulberry/flag_Lebanon.svg' },
        { revision: '3bc7a4e8b5ef66a73041df4b7dd0b769', url: '/symbols/mulberry/flag_Lesotho.svg' },
        { revision: '4040f7de77bbf1050ca5cb3e685c2f1f', url: '/symbols/mulberry/flag_Liberia.svg' },
        { revision: 'd14168079b9b54bb444272e8b5fa79c2', url: '/symbols/mulberry/flag_Libya.svg' },
        {
          revision: '222683ccdf21173613facebcf41ee338',
          url: '/symbols/mulberry/flag_Liechtenstein.svg',
        },
        {
          revision: '30e3eafa677c8758b6892b5e3b2e6d02',
          url: '/symbols/mulberry/flag_Lithuania.svg',
        },
        {
          revision: '48994e38cce4cb7b13a8a0b42d8261ef',
          url: '/symbols/mulberry/flag_Luxembourg.svg',
        },
        {
          revision: '28e12de268f68141a5b94379ca8e7024',
          url: '/symbols/mulberry/flag_Macedonia.svg',
        },
        {
          revision: '2fa1f377425fd6322f71a517f008ff3c',
          url: '/symbols/mulberry/flag_Madagascar.svg',
        },
        { revision: 'f61be8f23508cf58d68e35f4b9f031de', url: '/symbols/mulberry/flag_Malawi.svg' },
        {
          revision: '1d128cecaac13b13143dc230983c500a',
          url: '/symbols/mulberry/flag_Malaysia.svg',
        },
        {
          revision: '295282b6774862e3d96fc8e6edd21b02',
          url: '/symbols/mulberry/flag_Maldives.svg',
        },
        { revision: '1d6a55a5db5f9beb3e71f0a26d59141b', url: '/symbols/mulberry/flag_Mali.svg' },
        { revision: 'a15ba9cda1dacd248125cc1508b7d6f1', url: '/symbols/mulberry/flag_Malta.svg' },
        {
          revision: '318e1b9d889824d7c62ecf9359ba988d',
          url: '/symbols/mulberry/flag_Marshall_Islands.svg',
        },
        {
          revision: '3ee4268e429386e06a7cd3de6f687345',
          url: '/symbols/mulberry/flag_Mauritania.svg',
        },
        {
          revision: '6f622771e793d8648da0dfde43f57406',
          url: '/symbols/mulberry/flag_Mauritius.svg',
        },
        { revision: 'c89aea7f77266dd28f623be8e90194c3', url: '/symbols/mulberry/flag_Mexico.svg' },
        {
          revision: 'fd27b567961da483526067319bee6445',
          url: '/symbols/mulberry/flag_Micronesia.svg',
        },
        {
          revision: '59a05e8cbdc96956036895b88286440b',
          url: '/symbols/mulberry/flag_Midway_Islands.svg',
        },
        { revision: '0387af869a70c9f5f52dfade203d6d48', url: '/symbols/mulberry/flag_Moldova.svg' },
        { revision: '611d42a6d099d053948e02b2993ad58a', url: '/symbols/mulberry/flag_Monaco.svg' },
        {
          revision: 'fb03e329ac282a151f71a4a83c8e0fe9',
          url: '/symbols/mulberry/flag_Mongolia.svg',
        },
        {
          revision: 'f39769af346fc24dd51fbbd8a6369a0e',
          url: '/symbols/mulberry/flag_Montenegro.svg',
        },
        { revision: 'f8e01d829ac920d4db3e3b6b6e96df46', url: '/symbols/mulberry/flag_Morocco.svg' },
        {
          revision: '3c8f9f8068ef494847e98606c379ef60',
          url: '/symbols/mulberry/flag_Mozambique.svg',
        },
        { revision: '7b53f9b639b5130ab295a5c56197e01e', url: '/symbols/mulberry/flag_Myanmar.svg' },
        { revision: '785ad05b7593d5bdad187c587b077147', url: '/symbols/mulberry/flag_NATO.svg' },
        { revision: 'fcb1af41b465efee64a0c1bee214cd7a', url: '/symbols/mulberry/flag_Namibia.svg' },
        { revision: '8e284c53945b8545c3a26fa27ba38191', url: '/symbols/mulberry/flag_Nauru.svg' },
        { revision: 'a735417d531a776c2f2f7fc3e89f5ed1', url: '/symbols/mulberry/flag_Nepal.svg' },
        {
          revision: '57e237688203c9579a807c2a2ba2bdf0',
          url: '/symbols/mulberry/flag_New_Caledonia.svg',
        },
        {
          revision: '01d4a8dacb0b11028e43c1ccda8ea113',
          url: '/symbols/mulberry/flag_New_Zealand.svg',
        },
        {
          revision: '8d9792bf03a9f74f102fc552d9c5e827',
          url: '/symbols/mulberry/flag_Nicaragua.svg',
        },
        { revision: 'b3a1db829546c02227de3b5d5f0c36d2', url: '/symbols/mulberry/flag_Niger.svg' },
        { revision: '0d5a0dd0d3ace19585a799d0bf80af69', url: '/symbols/mulberry/flag_Nigeria.svg' },
        { revision: 'dde5f1ce273eb2414a4a7f59e33ec016', url: '/symbols/mulberry/flag_Niue.svg' },
        {
          revision: '9d3cbbda4bba8678637e5369b8c97081',
          url: '/symbols/mulberry/flag_North_Korea.svg',
        },
        {
          revision: '1fa2d9e3ef09285e795bb679aa160e92',
          url: '/symbols/mulberry/flag_Northern_Cyprus.svg',
        },
        {
          revision: '03603640123483c70f65617b4f9fdf9c',
          url: '/symbols/mulberry/flag_Northern_Marianas.svg',
        },
        { revision: '64b47f8e01e52b21a9baa18d3e3dc98b', url: '/symbols/mulberry/flag_Norway.svg' },
        {
          revision: '2d1ad07da53d1a6731fd07b19f8ebe35',
          url: '/symbols/mulberry/flag_Olympic_Movement.svg',
        },
        { revision: '3f10f2f9a60a6deb3b7316008c11ccdf', url: '/symbols/mulberry/flag_Oman.svg' },
        {
          revision: '3d1cee85f2e6522f4665a886933f448b',
          url: '/symbols/mulberry/flag_Pakistan.svg',
        },
        { revision: '1741095089335de0496165136b173459', url: '/symbols/mulberry/flag_Palau.svg' },
        {
          revision: '54886e4e437f645496d7d03c7a493ace',
          url: '/symbols/mulberry/flag_Palestine.svg',
        },
        { revision: '4b3378539db6ef86468399e34c0461cb', url: '/symbols/mulberry/flag_Panama.svg' },
        {
          revision: '25b7f2e50f298f34a9bab122adbe55ce',
          url: '/symbols/mulberry/flag_Papua_New_Guinea.svg',
        },
        {
          revision: '167b75c6b4c0dfdae1c3e21c685a9a6b',
          url: '/symbols/mulberry/flag_Paraguay.svg',
        },
        { revision: '83f78e97b417b9479a8fb319e849fcaa', url: '/symbols/mulberry/flag_Peru.svg' },
        {
          revision: '22f25c98711ea924335cb31984b0886b',
          url: '/symbols/mulberry/flag_Philippines.svg',
        },
        {
          revision: '2fb1b3b0cec4f72f86075d3801975688',
          url: '/symbols/mulberry/flag_Pitcairn_Islands.svg',
        },
        { revision: 'fb1cfbf0aa87cd23d7d3c1e7b8737e47', url: '/symbols/mulberry/flag_Poland.svg' },
        {
          revision: 'd181192ce94e7e12606775dfd8c41f07',
          url: '/symbols/mulberry/flag_Portugal.svg',
        },
        {
          revision: 'fe2e1bd15063040c61d9689444c58803',
          url: '/symbols/mulberry/flag_Puerto_Rico.svg',
        },
        { revision: '0aaf7bd1ca47d7625b196f1facf2a9c4', url: '/symbols/mulberry/flag_Qatar.svg' },
        {
          revision: 'e2b3f17393bb6784d0b5d68aa02ad1dd',
          url: '/symbols/mulberry/flag_Rass_al_Khaimah_Sharjah.svg',
        },
        {
          revision: 'f6165c60d5b13f98c68d4a90a40699f9',
          url: '/symbols/mulberry/flag_Red_Cross.svg',
        },
        { revision: 'cb964b2732d677609abd33cf9a2a1bd6', url: '/symbols/mulberry/flag_Romania.svg' },
        {
          revision: '7f9e111955345f9552552dd9b1369175',
          url: '/symbols/mulberry/flag_Russian_Federation.svg',
        },
        { revision: '1436ab9fec7cbcd437eeceed66d20e54', url: '/symbols/mulberry/flag_Rwanda.svg' },
        {
          revision: '4ece0622b0f7c0a49abf4431863c5033',
          url: '/symbols/mulberry/flag_S_Georgia_Sandwich_Isles.svg',
        },
        { revision: 'a8ea2fc11345e069db9ba89a4f5e6315', url: '/symbols/mulberry/flag_Sami.svg' },
        { revision: '96bc883a57d9dec1659d7cfb0c093e10', url: '/symbols/mulberry/flag_Samoa.svg' },
        {
          revision: '92e0eae57afeadc1137bce8579d3e5bf',
          url: '/symbols/mulberry/flag_San_Marino.svg',
        },
        {
          revision: '41954c55519bad16eb0fbb6a3314fbce',
          url: '/symbols/mulberry/flag_Sao_Tome_Principe.svg',
        },
        { revision: 'bdb9fd971ef0d39776f3d94831034f40', url: '/symbols/mulberry/flag_Sark.svg' },
        {
          revision: 'd125823556ef3f7f79e94a1cf5a7a1d8',
          url: '/symbols/mulberry/flag_Saudi_Arabia.svg',
        },
        {
          revision: 'e0cdb7dd5c348c590ac24d0646f32773',
          url: '/symbols/mulberry/flag_Scotland.svg',
        },
        { revision: 'c3b6d02de8d3af44da8635fb56360641', url: '/symbols/mulberry/flag_Seborga.svg' },
        { revision: '62f10ad150bec173229263b516ab5006', url: '/symbols/mulberry/flag_Senegal.svg' },
        { revision: '564036cd8b2ffc00f49811f927e6acd1', url: '/symbols/mulberry/flag_Serbia.svg' },
        {
          revision: '97f0eccbc9fc25d1617b03c3c880077a',
          url: '/symbols/mulberry/flag_Seychelles.svg',
        },
        {
          revision: '04a88193f8145e0096b408e69994c83a',
          url: '/symbols/mulberry/flag_Sierra_Leone.svg',
        },
        {
          revision: 'e5ba99614cf96cc628057d3cde3424e4',
          url: '/symbols/mulberry/flag_Singapore.svg',
        },
        {
          revision: '4ffc9b28a817fcb6b0e8df3da6277a9a',
          url: '/symbols/mulberry/flag_Slovakia.svg',
        },
        {
          revision: '2013927dd8a2d3b16ae61c9dc95dbce7',
          url: '/symbols/mulberry/flag_Slovenia.svg',
        },
        {
          revision: 'e0aae2cd59fb0a32df89dd526c232cad',
          url: '/symbols/mulberry/flag_Solomon_Islands.svg',
        },
        { revision: 'b6ac9fa8c19c0ec1b9af59c86fb50975', url: '/symbols/mulberry/flag_Somalia.svg' },
        {
          revision: '44e27c3412f6ed11b0a68c7b8384a514',
          url: '/symbols/mulberry/flag_Somaliland.svg',
        },
        {
          revision: '10ddbe0b4c684fc5c6e0b675145bfa72',
          url: '/symbols/mulberry/flag_South_Africa.svg',
        },
        {
          revision: 'cdb3d3451d5dd8e707910fd1730680a1',
          url: '/symbols/mulberry/flag_South_Korea.svg',
        },
        { revision: '0e417b2a0800add15f8dd8b8f59296bb', url: '/symbols/mulberry/flag_Spain.svg' },
        {
          revision: 'd6a3fec325043d040e424a479134cac0',
          url: '/symbols/mulberry/flag_Sri_Lanka.svg',
        },
        {
          revision: 'e8bda2b48c06c70b499fda31caaca163',
          url: '/symbols/mulberry/flag_St._Kitts_and_Nevis.svg',
        },
        {
          revision: '62c08269f4bd5acdbdbeb2d6bac92d55',
          url: '/symbols/mulberry/flag_St_Helena.svg',
        },
        {
          revision: '11dd5a99d8371169bd10ab766adc82da',
          url: '/symbols/mulberry/flag_St_Vincent_Grenadines.svg',
        },
        {
          revision: 'b821d9f296a5d67637ee95220ecb209a',
          url: '/symbols/mulberry/flag_Suriname.svg',
        },
        {
          revision: 'b7f65ae7cba838d09e475bd3c606ee34',
          url: '/symbols/mulberry/flag_Swaziland.svg',
        },
        { revision: 'f70133cdb7aa8191edbdc47c684e57cd', url: '/symbols/mulberry/flag_Sweden.svg' },
        {
          revision: '08770692d4ce163bed7a0535c6ac5da7',
          url: '/symbols/mulberry/flag_Switzerland.svg',
        },
        { revision: '28470090157942d87219846cb3ad387a', url: '/symbols/mulberry/flag_Syria.svg' },
        { revision: 'aad5db42f627bdb975dd16305d4fe6fc', url: '/symbols/mulberry/flag_Taiwan.svg' },
        {
          revision: 'f88da9268d925239337e1e631d9603c9',
          url: '/symbols/mulberry/flag_Tajikistan.svg',
        },
        {
          revision: '58fde85a3378e13dff2cefef850c506a',
          url: '/symbols/mulberry/flag_Tanzania.svg',
        },
        {
          revision: '1c6ed0d2a8425af63c64cd8375878062',
          url: '/symbols/mulberry/flag_Thailand.svg',
        },
        {
          revision: 'fe31196e1b6e850ec79f3e341ab267fe',
          url: '/symbols/mulberry/flag_The_Azores.svg',
        },
        {
          revision: '29000a8ccc3253eccd7e48cb4908a39f',
          url: '/symbols/mulberry/flag_The_Bahamas.svg',
        },
        {
          revision: 'dc2d7b61dfd5aa4496f3fca4f0584488',
          url: '/symbols/mulberry/flag_The_Czech_Republic.svg',
        },
        {
          revision: 'a377e74dc70690c3d21fe97528100379',
          url: '/symbols/mulberry/flag_The_Faroe_Islands.svg',
        },
        {
          revision: '9b2146c6dd7fe433752ac4aba0239eee',
          url: '/symbols/mulberry/flag_The_Gambia.svg',
        },
        {
          revision: 'a4f6731d88c8d673b0384a43f94b0628',
          url: '/symbols/mulberry/flag_The_Netherlands.svg',
        },
        {
          revision: 'f92e266cec466397730bd9aa09a40bf1',
          url: '/symbols/mulberry/flag_The_Sudan.svg',
        },
        { revision: '31667103e51a135544644f74e94b1fa0', url: '/symbols/mulberry/flag_Tibet.svg' },
        {
          revision: '0f38590533a74c11207e6c831b2674cd',
          url: '/symbols/mulberry/flag_Timor_Leste.svg',
        },
        { revision: 'ea9975fc3be3deacd00350882e981154', url: '/symbols/mulberry/flag_Togo.svg' },
        { revision: '2eeb057ddbd349914d4f04c4f3a055ac', url: '/symbols/mulberry/flag_Tokelau.svg' },
        { revision: '6e498efc0f0c18b2ebd0dc8796c6da10', url: '/symbols/mulberry/flag_Tonga.svg' },
        {
          revision: 'f4706a20f6c02ac10a81d846d9eb611c',
          url: '/symbols/mulberry/flag_Trinidad_and_Tobago.svg',
        },
        {
          revision: 'bfafeb7c5df8a9543261732a66cb2656',
          url: '/symbols/mulberry/flag_Tristan_de_Cunha.svg',
        },
        { revision: '92fadcfb37ae7863f09a7d2289b66a91', url: '/symbols/mulberry/flag_Tunisia.svg' },
        { revision: 'd1d78d8cb88377ff65cd261ce29185bc', url: '/symbols/mulberry/flag_Turkey.svg' },
        {
          revision: '1833c926446c84b49f5dc8821c434f86',
          url: '/symbols/mulberry/flag_Turkmenistan.svg',
        },
        {
          revision: 'dac1566f317a391dc0f34fe37ab4730f',
          url: '/symbols/mulberry/flag_Turks_Caicos_Isles.svg',
        },
        { revision: 'd14f887f3b087998fde56f90c1d98815', url: '/symbols/mulberry/flag_Tuvalu.svg' },
        { revision: '5dee3ca013ca4aec928addfe41af339e', url: '/symbols/mulberry/flag_Uganda.svg' },
        { revision: '7dddb5379014c1b8dc4ec197cd0b6c43', url: '/symbols/mulberry/flag_Ukraine.svg' },
        {
          revision: 'caab318728a4b6833d8d775d6cce893d',
          url: '/symbols/mulberry/flag_Umm_al_Qaiwan_-_UAE.svg',
        },
        {
          revision: 'fbd126caa913ad0b3d3688eeffac8b5e',
          url: '/symbols/mulberry/flag_United_Arab_Emirates.svg',
        },
        {
          revision: '19c8bcca81570355a9b4b77db499949a',
          url: '/symbols/mulberry/flag_United_Kingdom.svg',
        },
        {
          revision: 'bea45cac255d8c9b2fd5eb3bd8411ac8',
          url: '/symbols/mulberry/flag_United_Nations.svg',
        },
        {
          revision: '130fa626109a9dd03318cae9419b6b5e',
          url: '/symbols/mulberry/flag_United_States_of_America.svg',
        },
        { revision: '3fff9a7568b6ed079a39bda8b9ab3f1e', url: '/symbols/mulberry/flag_Uruguay.svg' },
        {
          revision: '36d88c0aa1463ef28fb519ed8a33ea9d',
          url: '/symbols/mulberry/flag_Uzbekistan.svg',
        },
        { revision: '4df27b5a05153c6e2e2e48caf9788414', url: '/symbols/mulberry/flag_Vanuatu.svg' },
        {
          revision: 'e9e348a5d348e773dcd985dbc4bb4d3e',
          url: '/symbols/mulberry/flag_Vatican_City.svg',
        },
        {
          revision: 'b62535618d15f97835ec2c303a332eb4',
          url: '/symbols/mulberry/flag_Venezuela.svg',
        },
        {
          revision: '35d9f663b3b79368ab18bcb812da4c67',
          url: '/symbols/mulberry/flag_Viet_Nam.svg',
        },
        {
          revision: 'a7a6352493956c3ad3dd3bedadb25163',
          url: '/symbols/mulberry/flag_Virgin_Islands.svg',
        },
        {
          revision: '33bf77aef8762d15c067f2eee5002e28',
          url: '/symbols/mulberry/flag_Wakes_Island.svg',
        },
        { revision: '203e11c75ba3c8adf9a36288a4fe627a', url: '/symbols/mulberry/flag_Wales.svg' },
        {
          revision: 'bae137565a749a32fed3bdd0f3322730',
          url: '/symbols/mulberry/flag_Western_Sahara.svg',
        },
        { revision: '1beef46acd3ff3a1f1b0f6533eef2366', url: '/symbols/mulberry/flag_Yemen.svg' },
        { revision: '878bc33aec703648d411ce53b5ee01e4', url: '/symbols/mulberry/flag_Zambia.svg' },
        {
          revision: '649731f1cbd193f6d7b7746bb6f01307',
          url: '/symbols/mulberry/flag_Zimbabwe.svg',
        },
        { revision: '40f426352d918277284192fda7e11c71', url: '/symbols/mulberry/flag_blank.svg' },
        { revision: 'a6627d0a2560e63123ca2742c77f9d14', url: '/symbols/mulberry/flame.svg' },
        { revision: '82d770cf7d30d5730d6fd0eabe698e30', url: '/symbols/mulberry/flamingo.svg' },
        { revision: 'ace1d89ccf92949b2f93564abd5db922', url: '/symbols/mulberry/flannel.svg' },
        { revision: 'a184167af308084ad6c2238062b36985', url: '/symbols/mulberry/flat.svg' },
        { revision: '5bcfca73dd88d4764b931899d0982082', url: '/symbols/mulberry/flat_tyre.svg' },
        {
          revision: '43657e4b23a08090816dca7a2eea573c',
          url: '/symbols/mulberry/flatscreen_tv.svg',
        },
        { revision: '162600325365f8e535b91aa84a0ccc29', url: '/symbols/mulberry/flip_,_to.svg' },
        {
          revision: '41ea346767cbdf9d9844531cd99e390b',
          url: '/symbols/mulberry/flip_coin_,_to.svg',
        },
        { revision: '08bef1534012fabb461d48ddb7b90db5', url: '/symbols/mulberry/flipper.svg' },
        { revision: 'f600f5f64f8898868d9cf6fb9d23ebe4', url: '/symbols/mulberry/float.svg' },
        { revision: 'c04ba24b080285bf0a7b98741e757235', url: '/symbols/mulberry/floor.svg' },
        { revision: '91201efccfaff01f9efdd62888287a41', url: '/symbols/mulberry/florist_1a.svg' },
        { revision: '56dfcaac06b8797212f88c882f89166c', url: '/symbols/mulberry/florist_1b.svg' },
        { revision: '795934602a770f35426dabbd06b01819', url: '/symbols/mulberry/florist_2a.svg' },
        { revision: '373d089670fb19aa6e8dad5382ee193f', url: '/symbols/mulberry/florist_2b.svg' },
        { revision: '39a189fd78164ee777885a49c6ddfa53', url: '/symbols/mulberry/flour_plain.svg' },
        {
          revision: 'a3a7d6bcb264bb32d2399e9d925cbadb',
          url: '/symbols/mulberry/flour_self_raising.svg',
        },
        { revision: '2fdf9f10ff6e7a929554057813d8ee32', url: '/symbols/mulberry/flower.svg' },
        {
          revision: 'a06c8d4541d92e6d604ab41ac918607f',
          url: '/symbols/mulberry/flush_toilet_,_to.svg',
        },
        { revision: '286386f56e465d6d5b9fe51caa6b79a2', url: '/symbols/mulberry/flute.svg' },
        { revision: '6a26b105bda75299be58411c909a8181', url: '/symbols/mulberry/fly.svg' },
        {
          revision: 'b7c67203d4a13caa53769fcc5323fd03',
          url: '/symbols/mulberry/fold_clothes_,_to.svg',
        },
        { revision: '39840b7bf87b6e67f28d32887f5b39d0', url: '/symbols/mulberry/food.svg' },
        { revision: 'af44e2c66a62637e7fea79768bcd9d4d', url: '/symbols/mulberry/food_blender.svg' },
        {
          revision: '8a8d00c41b227c1bbf43de05d818282f',
          url: '/symbols/mulberry/food_bowl_dog.svg',
        },
        {
          revision: 'e342ab9641a236eeafe574ac1e7a6950',
          url: '/symbols/mulberry/food_bowl_horse.svg',
        },
        { revision: '85343f4d253afae93a8e5aa0408c9b0d', url: '/symbols/mulberry/food_cold.svg' },
        { revision: 'dcbfb2ccaddfa720edfedb5598834134', url: '/symbols/mulberry/food_hot.svg' },
        { revision: 'f1732dbc9b475bd962a150265f6d16ea', url: '/symbols/mulberry/foot.svg' },
        { revision: '4447c7f99d44d40a4d0eb4c860c54145', url: '/symbols/mulberry/football.svg' },
        {
          revision: '3c08787b5c5cd411e2e18f8e3d345ba6',
          url: '/symbols/mulberry/football_kit_Arsenal.svg',
        },
        {
          revision: '2da2966232e8851cad8bc39017b6c7c6',
          url: '/symbols/mulberry/football_kit_Aston_Villa.svg',
        },
        {
          revision: '8bb8bc253fdfa24e3431a0371060dbc9',
          url: '/symbols/mulberry/football_kit_Barnsley.svg',
        },
        {
          revision: '430a53f0305f7ce7dcaf8ad34c5495b6',
          url: '/symbols/mulberry/football_kit_Birmingham.svg',
        },
        {
          revision: 'e0f7cd34b3bd4f48f096f382c3ac8429',
          url: '/symbols/mulberry/football_kit_Blackburn_Rovers.svg',
        },
        {
          revision: '7559e9432af734154410578ae78b4971',
          url: '/symbols/mulberry/football_kit_Blackpool.svg',
        },
        {
          revision: 'a4a03bc19d7a1cf73320edd9f3d4c79d',
          url: '/symbols/mulberry/football_kit_Bolton_Wanderers.svg',
        },
        {
          revision: 'b8c9b8a11f8310dbad4991ec1f51f122',
          url: '/symbols/mulberry/football_kit_Bristol_City.svg',
        },
        {
          revision: '25c4e17b26f7615606b77385eb176be0',
          url: '/symbols/mulberry/football_kit_Burnley.svg',
        },
        {
          revision: '3f174fd49a7ef505c85f9c5d5088da6d',
          url: '/symbols/mulberry/football_kit_Cardiff.svg',
        },
        {
          revision: '8debfcd7c45a8b232cf31917ec476742',
          url: '/symbols/mulberry/football_kit_Chelsea.svg',
        },
        {
          revision: 'e8978e18909b34c17a7a84510ceaff5a',
          url: '/symbols/mulberry/football_kit_Coventry.svg',
        },
        {
          revision: '86b6724694c8caf20df7f89af27f3508',
          url: '/symbols/mulberry/football_kit_Crystal_Palace.svg',
        },
        {
          revision: '2cb437058729562c739f6874b56c2d4b',
          url: '/symbols/mulberry/football_kit_Derby.svg',
        },
        {
          revision: 'ce28e7bbd3ebbccf26c8d5619d238cb2',
          url: '/symbols/mulberry/football_kit_Doncaster.svg',
        },
        {
          revision: '1baf0b30652c904a8278f8b496f098cd',
          url: '/symbols/mulberry/football_kit_Everton.svg',
        },
        {
          revision: 'e83023268704597b17fa0e1728d00968',
          url: '/symbols/mulberry/football_kit_Fulham.svg',
        },
        {
          revision: '4a6df729948e1cca059ceb687aa6e236',
          url: '/symbols/mulberry/football_kit_Hull_City.svg',
        },
        {
          revision: '7db4d027f889648f13de213b8af90b42',
          url: '/symbols/mulberry/football_kit_Ipswich.svg',
        },
        {
          revision: '75c535404addb33db26dd8a8ac697157',
          url: '/symbols/mulberry/football_kit_Leicester.svg',
        },
        {
          revision: '7162499f89c259879cf407a936604ba7',
          url: '/symbols/mulberry/football_kit_Liverpool.svg',
        },
        {
          revision: '37e120bb71a51796995b558f2f9e243f',
          url: '/symbols/mulberry/football_kit_Manchester_City.svg',
        },
        {
          revision: '132f1c5bd27a05e14ad5cb8e3828361e',
          url: '/symbols/mulberry/football_kit_Manchester_United.svg',
        },
        {
          revision: '28a2b558eb53e3af5d431ab16fbb030e',
          url: '/symbols/mulberry/football_kit_Middlesbrough.svg',
        },
        {
          revision: '1609470f0c371f2a2f8394a469f99b93',
          url: '/symbols/mulberry/football_kit_Newcastle_United.svg',
        },
        {
          revision: '232c63280988836619034c4614f74996',
          url: '/symbols/mulberry/football_kit_Nottingham_Forest.svg',
        },
        {
          revision: 'd764d4c870b81b6d4f9346a1d0345c8b',
          url: '/symbols/mulberry/football_kit_Peterborough.svg',
        },
        {
          revision: '625fbd331f40267fdd38c8d5a13b2907',
          url: '/symbols/mulberry/football_kit_Plymouth_Argyle.svg',
        },
        {
          revision: '45392f934f66450ab56f96f8a6267a8c',
          url: '/symbols/mulberry/football_kit_Portsmouth.svg',
        },
        {
          revision: '77bbd093c84179192c6837b7f9413e52',
          url: '/symbols/mulberry/football_kit_Preston.svg',
        },
        {
          revision: '9b9667be12f5d68035b993e5eefe247d',
          url: '/symbols/mulberry/football_kit_QPR.svg',
        },
        {
          revision: 'ee2fc76e2b4a7db3088e34c9c1224173',
          url: '/symbols/mulberry/football_kit_Reading.svg',
        },
        {
          revision: 'dc6b74e0dd95e61d8468a18946eaf164',
          url: '/symbols/mulberry/football_kit_Scunthorpe.svg',
        },
        {
          revision: 'feeb80b4443a5c874b58fc0651dc5a65',
          url: '/symbols/mulberry/football_kit_Sheffield_United.svg',
        },
        {
          revision: '60a451e557501d38d0585cd37b857386',
          url: '/symbols/mulberry/football_kit_Sheffield_Weds.svg',
        },
        {
          revision: '4a078f079c22c8c6773991bf4a659d35',
          url: '/symbols/mulberry/football_kit_Spurs.svg',
        },
        {
          revision: '4fe7218baa37097b1eeb819ca079893b',
          url: '/symbols/mulberry/football_kit_Stoke_City.svg',
        },
        {
          revision: 'cee7c136acad9d0583577cb2c198dc86',
          url: '/symbols/mulberry/football_kit_Sunderland.svg',
        },
        {
          revision: 'b1510030c97e8331bfff56c16895ff1f',
          url: '/symbols/mulberry/football_kit_Swansea.svg',
        },
        {
          revision: '83488b1960db53b85a4137ad67de2fca',
          url: '/symbols/mulberry/football_kit_Watford.svg',
        },
        {
          revision: 'e765d6800457e1f762a87fe6a9866c44',
          url: '/symbols/mulberry/football_kit_West_Bromwich.svg',
        },
        {
          revision: '7a65541dfc33dbcdeafb50f0fa97e9ca',
          url: '/symbols/mulberry/football_kit_West_Ham_United.svg',
        },
        {
          revision: '2f6fa72f2f84a518d64be30792026906',
          url: '/symbols/mulberry/football_kit_Wigan_Athletic.svg',
        },
        {
          revision: '4343d3a3a4e1fa4083cf39633cbce065',
          url: '/symbols/mulberry/football_kit_Wolves.svg',
        },
        {
          revision: '7606ea3efa2be4eaedf5a26939ee9e4a',
          url: '/symbols/mulberry/football_kit_blank.svg',
        },
        { revision: '8583b3b86513059ad6d2888a2c96acf6', url: '/symbols/mulberry/forearm.svg' },
        { revision: 'fa2373c5f0982b7c1345f4a5c04cee09', url: '/symbols/mulberry/fork.svg' },
        { revision: '217cd2f3287695cf8a966660b82fbe37', url: '/symbols/mulberry/fork_adapted.svg' },
        {
          revision: '2c74309af114cb8f27f6d26b46443de6',
          url: '/symbols/mulberry/fork_lift_truck.svg',
        },
        { revision: '77917bbbadfe4bd2952b9dacd0de329a', url: '/symbols/mulberry/forty.svg' },
        { revision: '259093089eff8224382c39cc801ea843', url: '/symbols/mulberry/forward.svg' },
        { revision: '453e491c70a7b576b7f8c2a503d89e5e', url: '/symbols/mulberry/forward_wind.svg' },
        { revision: '64b8a95842fa36364aba47afb9fe9470', url: '/symbols/mulberry/forwards.svg' },
        { revision: '6e7e9ef4544c554420adb6c600b8f516', url: '/symbols/mulberry/four.svg' },
        { revision: '4dac8cdbc42e3b33e898737799b0f94b', url: '/symbols/mulberry/four_dots.svg' },
        { revision: '03e423445dcc090dfd0d5d23f1e2568f', url: '/symbols/mulberry/fourteen.svg' },
        { revision: 'fc3aefe852b68d0a1f02365cc50f7182', url: '/symbols/mulberry/fox.svg' },
        { revision: '29f76536a5029b22e7b1d9727ddb676b', url: '/symbols/mulberry/frankincense.svg' },
        { revision: '3613c68eed777f2c3ad7750d60f6838a', url: '/symbols/mulberry/freckles.svg' },
        { revision: 'fa4bc08b3d62fe46a4db18db7b12a39f', url: '/symbols/mulberry/freezer.svg' },
        { revision: '756edc61449b4f85caaba1c6c0ef567c', url: '/symbols/mulberry/french_stick.svg' },
        { revision: 'fb15ef380ee77b5759e22923faeeba94', url: '/symbols/mulberry/friction.svg' },
        { revision: 'ca010e7e31800409b363762d2af3c98a', url: '/symbols/mulberry/fridge.svg' },
        {
          revision: '36cd7dbc181595f561d83b006557b2f3',
          url: '/symbols/mulberry/fried_breakfast.svg',
        },
        { revision: '9cedd79eab3249023a4f3991b385fb85', url: '/symbols/mulberry/frog.svg' },
        {
          revision: '4bb70c2e5d68d1c1a8845fc5d618a6c2',
          url: '/symbols/mulberry/fromage_frais.svg',
        },
        { revision: '42c2641b36f76adc9b4ee418716697fb', url: '/symbols/mulberry/front.svg' },
        { revision: '95cf1b0c9673f482ac20e6b73f05709f', url: '/symbols/mulberry/front_door.svg' },
        { revision: '4a95854e0f91205bce405c86d6c9283c', url: '/symbols/mulberry/frozen_chips.svg' },
        {
          revision: '83bbe309b870ee1b592e13cde910cbd4',
          url: '/symbols/mulberry/frozen_fish_fingers.svg',
        },
        {
          revision: '6e80a8488380ea92f08a90c1917c01af',
          url: '/symbols/mulberry/frozen_food_box.svg',
        },
        { revision: 'aee58d4547642d3c1a8e83fb264b4813', url: '/symbols/mulberry/frozen_pizza.svg' },
        { revision: '6568b1f3504569b610cf8fa5794f944a', url: '/symbols/mulberry/fruit.svg' },
        { revision: '8465d0ce13fa2fa3e2446a473a8f752f', url: '/symbols/mulberry/fruit_tree.svg' },
        { revision: '6e62a8d048960b49a78e4ba1598eaa88', url: '/symbols/mulberry/fry_,_to.svg' },
        { revision: '227f0ee620dd0967c2d7e2f7206515db', url: '/symbols/mulberry/frying_pan.svg' },
        { revision: '1be172558f68d4bafd3a99ba05dd90fa', url: '/symbols/mulberry/full.svg' },
        { revision: 'ce433fe19a84fdcf81c055c70a84f8e1', url: '/symbols/mulberry/funnel.svg' },
        { revision: 'cd7d34764d5cd7da8a31e3aa39eb7a15', url: '/symbols/mulberry/funny_laugh.svg' },
        { revision: '6989ad7a01741f0c9159ba5ba8177aab', url: '/symbols/mulberry/furniture.svg' },
        { revision: '55e1cc6270f8f2eb8ca0a50c9d3204ca', url: '/symbols/mulberry/future.svg' },
        { revision: '31908996fd879848fcba9e62937d8900', url: '/symbols/mulberry/fuzzy.svg' },
        {
          revision: '3015ce1b63a0014a12cffcfbc500bfba',
          url: '/symbols/mulberry/g_-_lower_case.svg',
        },
        { revision: '613d26a4d97ad37407543ca5bfc2411a', url: '/symbols/mulberry/garage.svg' },
        {
          revision: '54b16568a95cd6f6c30fa29be1599c35',
          url: '/symbols/mulberry/garden_chair_folding.svg',
        },
        {
          revision: 'd8d63573bfd23357672222251536b163',
          url: '/symbols/mulberry/garden_clippers.svg',
        },
        { revision: 'e3d330cad1da534326e8e437aa7e0508', url: '/symbols/mulberry/gardener_1a.svg' },
        { revision: '0a015cdf2c8428532d34148eadbbce66', url: '/symbols/mulberry/gardener_1b.svg' },
        { revision: 'b4f9b6ffdb5348ff582914ef0a920fda', url: '/symbols/mulberry/gardener_2a.svg' },
        { revision: '28bb5d9d434e08a1847b120ccf02bc5a', url: '/symbols/mulberry/gardener_2b.svg' },
        { revision: 'b07a32ff939638c9e4b91734605d563f', url: '/symbols/mulberry/garlic.svg' },
        { revision: '0bc4035de0ff6afc58828bf104253608', url: '/symbols/mulberry/garlic_bread.svg' },
        {
          revision: '0b8ecd18ebc20ca48ee92ee0336d4219',
          url: '/symbols/mulberry/garlic_crusher.svg',
        },
        { revision: 'e0c7af388b7378acc35d63dd814752fa', url: '/symbols/mulberry/geography.svg' },
        {
          revision: 'c564ad592040c3001fe1f5fdbfa5e4cd',
          url: '/symbols/mulberry/geography_class.svg',
        },
        { revision: '6e40bdd2b9b56886b2ffe0d3d8e729b8', url: '/symbols/mulberry/get_,_to.svg' },
        {
          revision: 'e5a9f5ac260ffeb24ed18ab116e5d2b6',
          url: '/symbols/mulberry/get_dressed_,_to.svg',
        },
        {
          revision: '524a88b24a4b1c59ba6e05ed5d6016b2',
          url: '/symbols/mulberry/get_off_bus_,_to.svg',
        },
        {
          revision: '0009e2dcbac3dc68b337bf7434ed2c49',
          url: '/symbols/mulberry/get_on_bus_,_to.svg',
        },
        {
          revision: '46bb33b9c7925219a8a7bb983119b273',
          url: '/symbols/mulberry/get_out_of_chair_,_to.svg',
        },
        { revision: 'bf84d60761042e75c2d3f93e4188d257', url: '/symbols/mulberry/get_up_,_to.svg' },
        {
          revision: '4fc82a10013419a567019473a2f34ab9',
          url: '/symbols/mulberry/get_up_2_,_to.svg',
        },
        { revision: '56743de2ff440671d8871ad3de25749f', url: '/symbols/mulberry/ghost.svg' },
        { revision: '9bd6ddb530efa8d17fc2372b204d228e', url: '/symbols/mulberry/giraffe.svg' },
        { revision: '09a0c21c2e9bd4847606b533c14f9574', url: '/symbols/mulberry/give_,_to.svg' },
        {
          revision: '7afd31fcee072986fef0dee67ea3438a',
          url: '/symbols/mulberry/give_up_cake_,_to.svg',
        },
        {
          revision: '7c07be6f67ff61f700a0e130efd827fe',
          url: '/symbols/mulberry/give_up_foods_,_to.svg',
        },
        { revision: '933ebc64d7f84dadc34d8a46f6069373', url: '/symbols/mulberry/glass.svg' },
        {
          revision: '4ad60223b85648167e3f737424f149f4',
          url: '/symbols/mulberry/glass_,_drinking.svg',
        },
        { revision: '5ea10320c19d637f6900e3187808ad46', url: '/symbols/mulberry/glasses.svg' },
        { revision: '99c53a289a71d4425ab553c2fd5dd12d', url: '/symbols/mulberry/glitter.svg' },
        { revision: '9252d3da56aeaba48271527c50f13f52', url: '/symbols/mulberry/globe.svg' },
        { revision: '7f4768216c6c5ec69d7096ee5e61da87', url: '/symbols/mulberry/gloves.svg' },
        { revision: '4070221fd36da16c2e3361d9ab756328', url: '/symbols/mulberry/glue.svg' },
        { revision: '9ea8bee299876c62071534095de0e1cf', url: '/symbols/mulberry/glue_stick.svg' },
        { revision: 'b87b79e619a7e2986d2d92ac004fc3bf', url: '/symbols/mulberry/gnat.svg' },
        { revision: 'daa939289eda456843d3f01f797cb4a6', url: '/symbols/mulberry/go_,_to.svg' },
        { revision: '58fe984ff05d53b244188e39dbb07ede', url: '/symbols/mulberry/go_in_,_to.svg' },
        {
          revision: '0d5aa2b64c381c55a2f9ea4733f81596',
          url: '/symbols/mulberry/go_out_2_,_to.svg',
        },
        {
          revision: '0ae8b2a36ffc71ff981bd0d0ee1e728a',
          url: '/symbols/mulberry/go_outside_,_to.svg',
        },
        {
          revision: '8550280de5e76b0f6294277d6fc1ae6e',
          url: '/symbols/mulberry/go_through_door_,_to.svg',
        },
        { revision: 'fe59d4ea5cc0cbb617a6ec27a0aa5427', url: '/symbols/mulberry/goal.svg' },
        { revision: '3a1c2f01d183227ec3a77a4c193225b2', url: '/symbols/mulberry/gold_bar.svg' },
        { revision: 'a34e1663c524bf7dbd69a8e2c244f7cc', url: '/symbols/mulberry/goldfish.svg' },
        {
          revision: 'b0d3e81bc7bbd5266f787b65b37e2ca2',
          url: '/symbols/mulberry/goldfish_bowl.svg',
        },
        { revision: 'a12495a521e4c9dfb5aa9bd6d9d7bf95', url: '/symbols/mulberry/golf.svg' },
        { revision: 'c28a24bfbc7e8926e79ad26156a04a96', url: '/symbols/mulberry/golf_club.svg' },
        { revision: '1bed44e3e70e7316139215088d24b475', url: '/symbols/mulberry/good.svg' },
        { revision: '26fa1bb679b907f369b87d12fc4ccbb9', url: '/symbols/mulberry/good_person.svg' },
        {
          revision: '0c5270ead3e954b363a574ac62096bd1',
          url: '/symbols/mulberry/good_to_drink.svg',
        },
        { revision: '1394846ca4a2c57cdaa15983e181d853', url: '/symbols/mulberry/good_to_eat.svg' },
        {
          revision: '9a96203c02b4c524a7deffcd93cf15f9',
          url: '/symbols/mulberry/good_to_eat_2.svg',
        },
        { revision: '86127ced8737cd35abdc2557dd73db3b', url: '/symbols/mulberry/goose.svg' },
        { revision: 'b0f5d8f718c5608d14b1facf3d84dde6', url: '/symbols/mulberry/goose_roast.svg' },
        { revision: '8b018d58fac081c3bdfeb7328adf0fc8', url: '/symbols/mulberry/gooseberry.svg' },
        { revision: 'ba72e61ed768f550682ebffa763924d8', url: '/symbols/mulberry/gorilla.svg' },
        { revision: '78fba2d9c9daa14a5cb05d79d528c407', url: '/symbols/mulberry/grab_,_to.svg' },
        { revision: '32ef2a4eaa5511f79a7a49753d703370', url: '/symbols/mulberry/grab_1_,_to.svg' },
        { revision: '78a5950cdc8432608994521b630a3cbb', url: '/symbols/mulberry/grains.svg' },
        { revision: '26b73bf912d7b54cbb338b728dc67789', url: '/symbols/mulberry/grandfather.svg' },
        { revision: '9dafc615436ad09b995750536770d4e1', url: '/symbols/mulberry/grandmother.svg' },
        { revision: 'a8594cbec9a5be13d3d6ca4ed198e983', url: '/symbols/mulberry/grandparents.svg' },
        { revision: '81d87d272dc91c5f9d5f3512bbd27abb', url: '/symbols/mulberry/grape_juice.svg' },
        { revision: 'd6c7f36a163b0f4cb6e9f3c8f1d625d0', url: '/symbols/mulberry/grapefruit.svg' },
        {
          revision: 'fb6f49037e363740c691aa9560ab4d2b',
          url: '/symbols/mulberry/grapefruit_juice.svg',
        },
        { revision: '7c1aaf11978c95bce387a3b26389c2f7', url: '/symbols/mulberry/grapes.svg' },
        { revision: 'cf43cc673e44cde2c32c1deab4a822fc', url: '/symbols/mulberry/graph_column.svg' },
        { revision: '3dd3ef8a4e41e01932e0ed5ec9a54c85', url: '/symbols/mulberry/grass.svg' },
        { revision: 'b6fcbd00eba4b83ec50f7595d6261a5d', url: '/symbols/mulberry/grate_,_to.svg' },
        { revision: '7ca0746f1be1482b7143f0673b7aea53', url: '/symbols/mulberry/grater.svg' },
        { revision: 'f4a017e3a60ed370a0c910177760891b', url: '/symbols/mulberry/gravity.svg' },
        { revision: '87a8b9579bd0f671cad25c1f704eb009', url: '/symbols/mulberry/gravy_boat.svg' },
        {
          revision: '62f637233703e1e14cdac04bf1c943a2',
          url: '/symbols/mulberry/gravy_pour_,_to.svg',
        },
        { revision: '24529920344dd1ee5e8cb8326157cf48', url: '/symbols/mulberry/great.svg' },
        { revision: '244f46828564afcc0343e1feebfa5e8c', url: '/symbols/mulberry/green.svg' },
        { revision: 'e4f1a9b3a8d65f3efbd1f8b93797da47', url: '/symbols/mulberry/green_beans.svg' },
        { revision: 'e859722ee16462bb492e84ba23120fb0', url: '/symbols/mulberry/green_dark.svg' },
        { revision: '888a333ef97925582e785110121b7c7f', url: '/symbols/mulberry/green_light.svg' },
        {
          revision: 'dc6bb125e97f08a512646ffd3d192080',
          url: '/symbols/mulberry/greengrocer_1a.svg',
        },
        {
          revision: '9b0f6a08b7ce5cc60a591681ed5973e5',
          url: '/symbols/mulberry/greengrocer_1b.svg',
        },
        {
          revision: '38912f7cc1098ce28940d9909e9b8a12',
          url: '/symbols/mulberry/greengrocer_2a.svg',
        },
        {
          revision: '7986c2b01d24d814210ffd8255c1939a',
          url: '/symbols/mulberry/greengrocer_2b.svg',
        },
        { revision: '59f2ced73bcf0df542abb03de10ec4e3', url: '/symbols/mulberry/grey_dark.svg' },
        { revision: 'e98aaa36e83d7035f100e1785f3f825f', url: '/symbols/mulberry/grey_light.svg' },
        { revision: 'eb99cb9379684c1db27e4c041cd5f0ea', url: '/symbols/mulberry/grill_,_to.svg' },
        { revision: '440c8007080368b30270722525385232', url: '/symbols/mulberry/grill_pan.svg' },
        { revision: 'ff31a773b8417170b4452bcdd0aab84d', url: '/symbols/mulberry/ground.svg' },
        { revision: '93d1658ce9788e016be450ec5c23a50d', url: '/symbols/mulberry/group_work.svg' },
        { revision: '72936c6a001674aaa06cc260f88a52ce', url: '/symbols/mulberry/grow_,_to.svg' },
        { revision: '0f5b596b2926935bcc8aa9623c77597d', url: '/symbols/mulberry/grow_2_,_to.svg' },
        {
          revision: 'cda11efd0d4135364aade05d6f6f7207',
          url: '/symbols/mulberry/grow_hair_,_to.svg',
        },
        {
          revision: '150d84c5c93e5671f80a183cda86aa82',
          url: '/symbols/mulberry/grow_hair_2_,_to.svg',
        },
        { revision: '2f4b8ebecb62a6b6b09240d7328f3606', url: '/symbols/mulberry/guess_,_to.svg' },
        { revision: '4411e679a0d61d8e0a9a912bba7cdffc', url: '/symbols/mulberry/guinea_pig.svg' },
        { revision: '6e36edee982095dda6f201a5c06ab096', url: '/symbols/mulberry/guitar.svg' },
        { revision: '5c9326663de2c4c3b4f9f07e94893ef6', url: '/symbols/mulberry/gum.svg' },
        { revision: 'b93fa6e143d06a4f94ff02a99b46b9e2', url: '/symbols/mulberry/guy.svg' },
        { revision: '2435c167a45e350ef5dbd5921ee641cc', url: '/symbols/mulberry/gym_1.svg' },
        {
          revision: 'f1f6bc4e0dcfe6958021f7d389629311',
          url: '/symbols/mulberry/h_-_lower_case.svg',
        },
        { revision: 'e71df501b015d49f73298941237a0528', url: '/symbols/mulberry/hair_bunches.svg' },
        {
          revision: '5cbc7027ab2798ece19a95ce40c40635',
          url: '/symbols/mulberry/hair_conditioner.svg',
        },
        { revision: '3fb38c9229b3e2adb41aa737f3e86f78', url: '/symbols/mulberry/hair_curler.svg' },
        {
          revision: 'e56ef9edc343320c258c8cd40d49a845',
          url: '/symbols/mulberry/hair_curlers_electric.svg',
        },
        {
          revision: '5ded7594a9b71f9a1f02a98560825847',
          url: '/symbols/mulberry/hair_curling_tongs.svg',
        },
        { revision: '248ce1291eb418f9d0b66745fac9cbe5', url: '/symbols/mulberry/hair_dye.svg' },
        { revision: 'e134e2fe9c2683db6fe676bc1284beec', url: '/symbols/mulberry/hair_dye_1.svg' },
        { revision: '827598f6d37f4f62cb28cb0303dccb16', url: '/symbols/mulberry/hair_plaits.svg' },
        {
          revision: '098d61660c9b20d491f7c9a69b3da969',
          url: '/symbols/mulberry/hair_ponytail.svg',
        },
        { revision: '5b6b96ff81cee623e80a855705461fe5', url: '/symbols/mulberry/hairbrush.svg' },
        { revision: 'e0580a120ec35e19e56652e649b7edd3', url: '/symbols/mulberry/haircut.svg' },
        { revision: 'a972bb13731d6578c4569827953017b9', url: '/symbols/mulberry/hairdryer.svg' },
        { revision: 'be522a3d6e535729f53691dcacd04f2d', url: '/symbols/mulberry/hairspray.svg' },
        { revision: '2f3de1e7a4697a7c6fa37e67dcf8cea9', url: '/symbols/mulberry/half.svg' },
        { revision: '07d4e7f4a1d5835fcccb863682833a27', url: '/symbols/mulberry/ham.svg' },
        { revision: 'fea32968bbcdd691efaef4eaf5578e4d', url: '/symbols/mulberry/ham_packet.svg' },
        { revision: '43339d9a90d8d433b84916e9cda8997a', url: '/symbols/mulberry/hamburger.svg' },
        {
          revision: '9443bd7c1bfa13805d6a3999924844d8',
          url: '/symbols/mulberry/hamburger_carton.svg',
        },
        { revision: '758827d192b603341d610b8ef48f0884', url: '/symbols/mulberry/hammer.svg' },
        { revision: '3e615c6fff34162a080ba296a61d7ad6', url: '/symbols/mulberry/hamster.svg' },
        { revision: '85fb5c446f5fb96a9e3fdbb8cec09163', url: '/symbols/mulberry/hamster_food.svg' },
        { revision: '0704000db33287db8477e3f50d03dce7', url: '/symbols/mulberry/hamster_maze.svg' },
        { revision: 'af6aa2528cf331c91681bdd87ec8be1d', url: '/symbols/mulberry/hand_bag.svg' },
        { revision: '0f64bdb1e212f387fb2010f38d2eea80', url: '/symbols/mulberry/hand_cream.svg' },
        { revision: '82fd44da640c60e0146fe613c0782bc6', url: '/symbols/mulberry/hand_mixer.svg' },
        { revision: '45ff12a45eb3dcccf321906847ecbcf3', url: '/symbols/mulberry/hand_punch.svg' },
        { revision: '6a1bf66d6fe3686a6045f928bce2bd76', url: '/symbols/mulberry/handcuffs.svg' },
        { revision: '7baf3af369178cfa508b81bcae76167a', url: '/symbols/mulberry/handle_bars.svg' },
        { revision: '63c66fef059e2d8c056dc4855931e5ce', url: '/symbols/mulberry/handsome.svg' },
        { revision: '78e4d816e79ddf940e677310ac90a468', url: '/symbols/mulberry/hang_,_to.svg' },
        {
          revision: '2352983fa9554fd6de2054674208af9c',
          url: '/symbols/mulberry/hang_coat_,_to.svg',
        },
        { revision: 'a791c723b3199824e02ed8a46b6af435', url: '/symbols/mulberry/hangar.svg' },
        { revision: '524de7ce09dfc035656c369eb55f0094', url: '/symbols/mulberry/hankerchief.svg' },
        { revision: 'e999086b5ec8369c17682b40f2ce9be8', url: '/symbols/mulberry/happy_lady.svg' },
        { revision: '26faf22ee12f8f93ea3f14f9fed0b92f', url: '/symbols/mulberry/happy_man.svg' },
        { revision: 'ab95fdf4724db8d80c5f3347e5592334', url: '/symbols/mulberry/hard.svg' },
        { revision: '3137ca8100a29ea2a97ad86e59de4a2d', url: '/symbols/mulberry/hard_hat.svg' },
        { revision: '176a92a9922c27d5dc55c9ca6deb6c42', url: '/symbols/mulberry/hare.svg' },
        { revision: 'd9a2f70908e2c4199875bd28947d64e0', url: '/symbols/mulberry/harvest.svg' },
        { revision: '293978352d36c7ae6b84f842a704e1c6', url: '/symbols/mulberry/hat_-_ladies.svg' },
        { revision: '97211c37fdf8df3ae07ab689284f7eb7', url: '/symbols/mulberry/hat_-_mans.svg' },
        {
          revision: 'c572d0597dc66e949305fd54e1abd8a3',
          url: '/symbols/mulberry/hat_Christmas.svg',
        },
        { revision: 'e95d22d2e58f9f848c73703d97b89310', url: '/symbols/mulberry/hat_too_big.svg' },
        { revision: 'b27cbb6d9c5e001a0d8310514e6f65bf', url: '/symbols/mulberry/hatch_,_to.svg' },
        {
          revision: '4fccdbcf49a4ed9c565d8be13e41bd34',
          url: '/symbols/mulberry/haunted_house.svg',
        },
        { revision: 'b64e78197dcd364711e534df1432e81f', url: '/symbols/mulberry/hazelnut.svg' },
        { revision: 'b94c505745dbbfdf8a93164308771cdb', url: '/symbols/mulberry/head.svg' },
        {
          revision: 'f6c37bb027bc5644cbb61050f68869f5',
          url: '/symbols/mulberry/head_teacher_1a.svg',
        },
        {
          revision: 'c5ddfccfbce0948f45f33ce890b03223',
          url: '/symbols/mulberry/head_teacher_1b.svg',
        },
        {
          revision: '9e2ec2e966e3053de32722e33ddcce38',
          url: '/symbols/mulberry/head_teacher_2a.svg',
        },
        {
          revision: '9784bd0a3b688afc2e240b06f5c9061e',
          url: '/symbols/mulberry/head_teacher_2b.svg',
        },
        { revision: 'dac6bdb4a03e0381530ff0e8dd2de9a3', url: '/symbols/mulberry/headache.svg' },
        { revision: '55f32457d14e16c9bd8824fb98630694', url: '/symbols/mulberry/headband.svg' },
        { revision: '6cac061b8b98cb5c435a47890ef83158', url: '/symbols/mulberry/headboard.svg' },
        { revision: 'f3201f2e1e458ba3900b062dd29e54db', url: '/symbols/mulberry/headlamp.svg' },
        { revision: '3818a402201c072e330c80a0f5a9b4d5', url: '/symbols/mulberry/headmouse.svg' },
        { revision: '9eb211feab65e0a58e032caaee7e5b81', url: '/symbols/mulberry/headphones.svg' },
        {
          revision: 'f54802e060e46479f54666f309049350',
          url: '/symbols/mulberry/headpointer_2.svg',
        },
        { revision: '35096910a63e8917e99ca68d8d4d24fe', url: '/symbols/mulberry/healthy.svg' },
        { revision: '21ac6c63b1db09618cd1c35ed226c1e7', url: '/symbols/mulberry/hear_,_to.svg' },
        {
          revision: 'e3825f5052a1408cfa03a2baff1343ca',
          url: '/symbols/mulberry/hearing_aid_1.svg',
        },
        {
          revision: '1255f7360412d01749da5ae0fcc04aea',
          url: '/symbols/mulberry/hearing_aid_2.svg',
        },
        { revision: '2b90e1960a2024818d56340da789264f', url: '/symbols/mulberry/heart.svg' },
        { revision: '32ce23761390e78c9e017d86bb7814e2', url: '/symbols/mulberry/heart_shape.svg' },
        { revision: '89e68d21990976f4119c651889779d89', url: '/symbols/mulberry/heat_,_to.svg' },
        { revision: '238b88b947f496aa6f7f9167c7edc51f', url: '/symbols/mulberry/heavy.svg' },
        { revision: '4fc7024f6b77b8a7a61815c01ea71b30', url: '/symbols/mulberry/hedge.svg' },
        {
          revision: 'fee9697548181a84b4d44e8a966d08d7',
          url: '/symbols/mulberry/hedge_cutters.svg',
        },
        { revision: 'ff5f128e07a69f9a8745573e7c54c7aa', url: '/symbols/mulberry/hedgehog.svg' },
        { revision: 'eae87f3cfd56e0fed40c4f4c7dedb25a', url: '/symbols/mulberry/heel.svg' },
        { revision: 'd501cbf547f6dfdc11932bf61249c0e7', url: '/symbols/mulberry/heel_of_shoe.svg' },
        { revision: 'a6890b4cbded353f939c2d9175a89ad3', url: '/symbols/mulberry/helicopter.svg' },
        { revision: '6d3c73061e3e5860035aaede37817b38', url: '/symbols/mulberry/hello.svg' },
        { revision: 'cb3b21b74c14c870ba777f573ac96526', url: '/symbols/mulberry/helmet.svg' },
        { revision: 'dae15ef95bd15f22679c6be6c2dab309', url: '/symbols/mulberry/helmet_pilot.svg' },
        { revision: 'b2014dd2673e0ea6b14c91342e0c0a7d', url: '/symbols/mulberry/help_,_to.svg' },
        { revision: '0b94d33bbf0288e4927c19c4ffecba2a', url: '/symbols/mulberry/heptagon.svg' },
        { revision: 'be50f1d8097842667bdfeb1a82a8b04c', url: '/symbols/mulberry/heron.svg' },
        { revision: 'fae804d31f6d1227d050a1f7685c2269', url: '/symbols/mulberry/hexagon.svg' },
        { revision: 'a546f6b3c83a4ee2dc0b4c03de71b864', url: '/symbols/mulberry/high.svg' },
        { revision: 'f1105ea573ae32e71ab46ae29e3c5f5b', url: '/symbols/mulberry/high_chair.svg' },
        { revision: 'a8093fab91fbc8124defa79c8f5efe97', url: '/symbols/mulberry/highest.svg' },
        { revision: 'af1d97e9dd0dab7b973c7f9b3247e2c4', url: '/symbols/mulberry/hike_,_to.svg' },
        { revision: 'c7a67589bb7f59a17052ec474fd5777b', url: '/symbols/mulberry/hike_2_,_to.svg' },
        { revision: 'd0616d22d20d0593d8397f673fbea040', url: '/symbols/mulberry/hip.svg' },
        { revision: '4b7b99bb6d0edc5ffc6eead11c437f00', url: '/symbols/mulberry/hippopotamus.svg' },
        { revision: 'be49362f910576104210e461b4c79c99', url: '/symbols/mulberry/hips.svg' },
        { revision: '49b3846308cf55538771df885c7e3777', url: '/symbols/mulberry/history.svg' },
        {
          revision: 'de598e61d303a27184eb9a84ee6e502d',
          url: '/symbols/mulberry/history_class.svg',
        },
        { revision: '1fd5daff07233dc2c0199060e476d85f', url: '/symbols/mulberry/hit_,_to.svg' },
        {
          revision: '8a1492295461d8afa5527d9b3e990901',
          url: '/symbols/mulberry/hit_something_,_to.svg',
        },
        { revision: '59f26c802a316894da90f3a1b46afefd', url: '/symbols/mulberry/hoe.svg' },
        { revision: '72e8eded2eea7b5277c295bfb9abf2fc', url: '/symbols/mulberry/hoist.svg' },
        { revision: '61ca82378f28574c3590c07862e20f47', url: '/symbols/mulberry/hold_,_to.svg' },
        {
          revision: '71a9be5042fd7c2d2f5300d34aa3e083',
          url: '/symbols/mulberry/hold_hands_,_to.svg',
        },
        {
          revision: '5f5ae2b479edaafa6e06aad0e5b1ab76',
          url: '/symbols/mulberry/hold_sledge_hammer_,_to.svg',
        },
        { revision: 'd0dfa9796deb5ea8a8fe3569c9a9b991', url: '/symbols/mulberry/holdall.svg' },
        { revision: '129ca0c03a2db8635dd9d32f2c3a55f7', url: '/symbols/mulberry/hole_punch.svg' },
        { revision: '5abd35ac53b89494ff4cd86331ace475', url: '/symbols/mulberry/hole_punch_2.svg' },
        { revision: '4c49a4206fec78c0dec6b231bd6cbbd4', url: '/symbols/mulberry/hollow.svg' },
        { revision: 'f496bdc5e2f85f697a38c52bab939bc7', url: '/symbols/mulberry/holly.svg' },
        { revision: 'e33a5863fb57cb0961aae1f10e2ac216', url: '/symbols/mulberry/homepage.svg' },
        { revision: 'ccad9cb6307d4fcfa4d4cb9966902fee', url: '/symbols/mulberry/honey.svg' },
        { revision: '58cca5026782152fbbe1aca3cd9e5712', url: '/symbols/mulberry/hood_hoodie.svg' },
        { revision: '8933d6c10fb7b1334b34d093c964dd41', url: '/symbols/mulberry/hooded_top.svg' },
        { revision: '1bc3e42e84211bab3387bd4461d80095', url: '/symbols/mulberry/hoof.svg' },
        { revision: '8c2510bad800154bdb7014df5e03775e', url: '/symbols/mulberry/hoover_,_to.svg' },
        { revision: 'a451b28331de5f0c75d4c1861e22edc5', url: '/symbols/mulberry/hop_,_to.svg' },
        { revision: '925bec55cd62ab5477ebc97647cde97b', url: '/symbols/mulberry/hop_2_,_to.svg' },
        { revision: 'e6494655421dd966ed3e39d273a7f162', url: '/symbols/mulberry/horns.svg' },
        { revision: '3451552e091dcf654c0e5f305cff3265', url: '/symbols/mulberry/horse.svg' },
        { revision: 'bd412090ad28669183a96d0fd62a7627', url: '/symbols/mulberry/hose.svg' },
        { revision: '8e83d5487f79832faeacba3ec60e5145', url: '/symbols/mulberry/hot.svg' },
        {
          revision: '9a4d4ae60eacbd1eba60edf363206e79',
          url: '/symbols/mulberry/hot_air_balloon.svg',
        },
        { revision: '2b5fbc8cfd0cde1d3ee7211d40ab17e9', url: '/symbols/mulberry/hot_brush.svg' },
        {
          revision: '0f8aa8926ce649fbfb262c530f136bb9',
          url: '/symbols/mulberry/hot_chocolate.svg',
        },
        { revision: 'ed7e4306de8b9f8094bb0090b85d59e8', url: '/symbols/mulberry/hot_dog.svg' },
        { revision: 'b521f35f8ea1a4b3038d37c976a485fe', url: '/symbols/mulberry/hot_person.svg' },
        { revision: '411bdc69f4ad4327dcc6fe0625594683', url: '/symbols/mulberry/house.svg' },
        { revision: 'f8e769885132d69f4637bd667bb2a1e4', url: '/symbols/mulberry/how.svg' },
        { revision: '6496a1ab6c0a884c2ccb27ea4d7ebeb3', url: '/symbols/mulberry/how_many.svg' },
        { revision: 'ad9bd1bac84ba6e8c8cf0373e34bfd38', url: '/symbols/mulberry/hug_,_to.svg' },
        { revision: '29eb70b34b70b4012526a1077aff7985', url: '/symbols/mulberry/hundred.svg' },
        { revision: '7424a55aa25187f9eafbdf894ee39b7d', url: '/symbols/mulberry/hungry.svg' },
        { revision: '2ba818731163d152659ee4fd62ead539', url: '/symbols/mulberry/hunt_,_to.svg' },
        { revision: '59a959d69d00f749c4e11b84232d125e', url: '/symbols/mulberry/husband.svg' },
        { revision: '9a21be3e8acb31c6f91af7fe22c4deea', url: '/symbols/mulberry/iPhone.svg' },
        { revision: '58980f4bb27fa0d39f256d1144ce64c4', url: '/symbols/mulberry/iPod.svg' },
        {
          revision: '4e3feb4b793e73a8d3cc6c5cf2a34d0e',
          url: '/symbols/mulberry/i_-_lower_case.svg',
        },
        { revision: 'aacdb1092973586a80a9339a9929bdd9', url: '/symbols/mulberry/ice_cream.svg' },
        { revision: '6a61dcc120685a0e7e81eb9656081763', url: '/symbols/mulberry/ice_cream_2.svg' },
        {
          revision: '1888087aad29e254413fb95888978ee2',
          url: '/symbols/mulberry/ice_cream_tub.svg',
        },
        { revision: '99a1fc1fbda04d33112a5d757a81e370', url: '/symbols/mulberry/ice_lolly.svg' },
        { revision: '60f2d73b2b44ebe05757febbf1857f23', url: '/symbols/mulberry/in.svg' },
        { revision: '07b105fc56fae2a59767aac24272a651', url: '/symbols/mulberry/in_front.svg' },
        { revision: '817b1a0662299a74cf3702b8904f58f1', url: '/symbols/mulberry/inbox.svg' },
        { revision: '2bf43c4b3d026d6895b9369071c27aa3', url: '/symbols/mulberry/index_cards.svg' },
        { revision: '1f2b0cecd0af3ee53384b2d8b9e0d739', url: '/symbols/mulberry/ingredients.svg' },
        { revision: '62d240ec5a8a5276414cbad2fca06a4f', url: '/symbols/mulberry/inhaler.svg' },
        { revision: 'a7c5651ee40a4fa55321ff695200e464', url: '/symbols/mulberry/insert_,_to.svg' },
        { revision: '601164533157e13619783677292f627b', url: '/symbols/mulberry/inside_out.svg' },
        { revision: '4c01b35cab9cbbde9403b7f2ccd4b5ff', url: '/symbols/mulberry/inside_room.svg' },
        {
          revision: '0a1e8dcc3a5e7f16e797b57a18eeeed4',
          url: '/symbols/mulberry/install_software.svg',
        },
        { revision: '0e53f34af3159e9734bebdfde17a0f26', url: '/symbols/mulberry/intellikeys.svg' },
        { revision: '31a84c86a6f1df26b90e355cfa984789', url: '/symbols/mulberry/internet.svg' },
        { revision: '1c2508fa6d8d6c2a16f75f8c5f6093ed', url: '/symbols/mulberry/intestine.svg' },
        { revision: '6a58641d7ed63e498bb8993bba9cb3e9', url: '/symbols/mulberry/iron.svg' },
        { revision: '7bee822a44b8d201fef24056432368b7', url: '/symbols/mulberry/iron_,_to.svg' },
        {
          revision: '9b6e28a2494696ee1ccf04d6972196e8',
          url: '/symbols/mulberry/ironing_board.svg',
        },
        {
          revision: '0f8aaab9cb95d831d7b3108ac2f45fc1',
          url: '/symbols/mulberry/is_this_enough.svg',
        },
        { revision: 'fb151bcfccedd26cd062575a6aa724fa', url: '/symbols/mulberry/itch.svg' },
        { revision: '6856dc901d52f4dd385072a5a685e79c', url: '/symbols/mulberry/ivy.svg' },
        { revision: '20666d9e75a8242dc9f031df6eb394e6', url: '/symbols/mulberry/ivy_2.svg' },
        {
          revision: '98209aecfe4dc45f8db365d4d72cb21d',
          url: '/symbols/mulberry/j_-_lower_case.svg',
        },
        { revision: '531b6251a4a42d6128dd86402514bfc5', url: '/symbols/mulberry/jack_in_box.svg' },
        { revision: 'b96fcf1feb4a46e5e68f99876cfeac4f', url: '/symbols/mulberry/jacket.svg' },
        {
          revision: 'a19f8728adbba99ec48fa87da34517ae',
          url: '/symbols/mulberry/jacket_-_mans.svg',
        },
        { revision: '4db056e3e2b33ec218440f1d8dda71eb', url: '/symbols/mulberry/jacket_2.svg' },
        {
          revision: 'd7cf7929ce6192cdf8bbf4265e7c98b6',
          url: '/symbols/mulberry/jacket_potato_1.svg',
        },
        { revision: '147b6ecc71eae7f22a1ff42a081e2058', url: '/symbols/mulberry/jam.svg' },
        { revision: 'a0a26332d9e1bfe9d666c78c1e98931b', url: '/symbols/mulberry/jam_tart.svg' },
        { revision: '138bc7b80863b2d9ec7c5678604cde91', url: '/symbols/mulberry/jar.svg' },
        { revision: '21ccaacc04b12e45189b85a0005a7bed', url: '/symbols/mulberry/jealous_lady.svg' },
        { revision: '555907495c91ad5a16bd0f2632a80c84', url: '/symbols/mulberry/jealous_man.svg' },
        { revision: 'ed9a12cd894dd26cf1d1182068e5f20c', url: '/symbols/mulberry/jeans.svg' },
        { revision: 'a2a06e9fbb8bd2f3db97092e1ce59b4e', url: '/symbols/mulberry/jeep.svg' },
        { revision: 'f68d3e0b22b5e4bf3af82cd915df49fc', url: '/symbols/mulberry/jelly.svg' },
        { revision: 'c7eaf58cfea45333c44a564f90710302', url: '/symbols/mulberry/jelly_beans.svg' },
        { revision: 'a24eab59044f6168fcba16ab3770d345', url: '/symbols/mulberry/jellyfish.svg' },
        { revision: 'd6e7227a5cb6705c7a599b6926ce110a', url: '/symbols/mulberry/jet_plane.svg' },
        { revision: '6044ea6d07662d67de174dbfa0476daf', url: '/symbols/mulberry/jewellery.svg' },
        {
          revision: '042a4700718418c02ff0ab8a5b30eacd',
          url: '/symbols/mulberry/jigsaw_puzzle.svg',
        },
        {
          revision: 'f82e1f56e681d29e87441907b79b89cd',
          url: '/symbols/mulberry/jigsaw_puzzle_piece.svg',
        },
        { revision: '4c30cd5e30a889e8e5010203fd66a449', url: '/symbols/mulberry/jog_,_to.svg' },
        { revision: '2d7be45437d033a5f7b93a1b04541987', url: '/symbols/mulberry/join_,_to.svg' },
        { revision: '21c5a091d917e5db6865c80fb2b354f0', url: '/symbols/mulberry/join_2_,_to.svg' },
        { revision: 'c818e85613a18872fe97de959b94f526', url: '/symbols/mulberry/join_3.svg' },
        {
          revision: '5fd1e5430fd27db7ef1f8fd86c658c2b',
          url: '/symbols/mulberry/joystick_PennyGiles.svg',
        },
        { revision: '2098f27f658cc4fe7838f0652fc35205', url: '/symbols/mulberry/judo.svg' },
        { revision: '997b12b51c97c5c28cb43ab1fb804280', url: '/symbols/mulberry/judo_belt.svg' },
        { revision: '4b09e53233b724d109f5e71b4c1b12ce', url: '/symbols/mulberry/jump_,_to.svg' },
        { revision: 'c714a6dc23c4dd453388919a3efe7ee6', url: '/symbols/mulberry/jump_2_,_to.svg' },
        { revision: 'ca77ee29476263587433c8a667d0c3ec', url: '/symbols/mulberry/jumper.svg' },
        { revision: 'fe4f5f0f2a20a39ebc23f073d0da1952', url: '/symbols/mulberry/jungle_gym.svg' },
        {
          revision: '4dd9c7d60b86e87b31260f0cc67aa517',
          url: '/symbols/mulberry/k_-_lower_case.svg',
        },
        { revision: '90a00bc2f35d5f3ffdd41f5f3e07e54e', url: '/symbols/mulberry/kangaroo.svg' },
        { revision: 'e3a955bc00047d2245e544d2bf161af8', url: '/symbols/mulberry/kebab.svg' },
        { revision: '7a982debc54caae730d65f9eff6089d8', url: '/symbols/mulberry/keep_,_to.svg' },
        { revision: '190a03d226a5f9674d165fd9755909e1', url: '/symbols/mulberry/kennel.svg' },
        { revision: '690095cc1cf855e679227217dc8e3adf', url: '/symbols/mulberry/kettle.svg' },
        { revision: '88ec6df7c8cde8343ffa076ea29baaab', url: '/symbols/mulberry/key_1.svg' },
        { revision: '53c63303002ae629d8af0ba66c7bc5b3', url: '/symbols/mulberry/key_2.svg' },
        {
          revision: 'a2cb3d3f2098ab5af9454835fbedf1ad',
          url: '/symbols/mulberry/keyboard_electric.svg',
        },
        {
          revision: '77a62fd6970c4406f8d9a6d2cecf0a94',
          url: '/symbols/mulberry/kick_ball_,_to.svg',
        },
        {
          revision: 'a8d3a2eae82b252b3d3902d3d0978ef1',
          url: '/symbols/mulberry/kick_ball_1_,_to.svg',
        },
        {
          revision: 'd7d28bb3dce1587179904862b92f91c1',
          url: '/symbols/mulberry/kick_ball_2_,_to.svg',
        },
        {
          revision: 'b9cda1d5231cf76f70f6e04634488344',
          url: '/symbols/mulberry/kick_person_,_to.svg',
        },
        {
          revision: '48c624c48605701aacee89a59537cced',
          url: '/symbols/mulberry/kick_swimming_,_to.svg',
        },
        { revision: '116eefc48ea533e705b405e3428818a4', url: '/symbols/mulberry/kidneys.svg' },
        { revision: '3a2f57fc07900b1bfef1dfa73d018569', url: '/symbols/mulberry/kill_,_to.svg' },
        { revision: '8e0e737500036a3328ca2858b4c50512', url: '/symbols/mulberry/killer_whale.svg' },
        { revision: 'e8fa7861162d77ad81881c9ca59afa99', url: '/symbols/mulberry/kite.svg' },
        { revision: '97adc538309da0551dbc2060756bd380', url: '/symbols/mulberry/kiwi.svg' },
        { revision: 'f108679013cbd9551d2552f628c8a772', url: '/symbols/mulberry/knee.svg' },
        { revision: '1135b2914c35807e63cd6fa401f78867', url: '/symbols/mulberry/knickers.svg' },
        { revision: '57cead53b6fefd85004c394fdc2703dc', url: '/symbols/mulberry/knife.svg' },
        {
          revision: 'b156bd48c41cc409f789ddb693f9c89e',
          url: '/symbols/mulberry/knife_adapted.svg',
        },
        {
          revision: '50a2c2e5d34f7c3f94338d969f0fca3e',
          url: '/symbols/mulberry/knife_adapted_2.svg',
        },
        { revision: 'b3558a68a96c6e5dc629668fca5ce402', url: '/symbols/mulberry/knit_,_to.svg' },
        { revision: '06e8315a6a5e3003993777f705e9e526', url: '/symbols/mulberry/knock_,_to.svg' },
        {
          revision: 'f0093131ca23bda00378ab5f02ea92bb',
          url: '/symbols/mulberry/knock_down_,_to.svg',
        },
        { revision: '7c4ffde46a7cb6c53a00ec19e6636784', url: '/symbols/mulberry/koala.svg' },
        { revision: 'fbe99102fc00359d38684ed1d9456ecb', url: '/symbols/mulberry/koosh_ball.svg' },
        {
          revision: 'eaf3edb579261bd67a9ba5137e68968a',
          url: '/symbols/mulberry/l_-_lower_case.svg',
        },
        { revision: '6c79ea3ed525fc7ba5075390fbcff41c', url: '/symbols/mulberry/labels.svg' },
        {
          revision: 'd115691ae3f5a4f8905a724c87544280',
          url: '/symbols/mulberry/ladies_toilet.svg',
        },
        { revision: 'dd6674cb7f669106cadfc84efe6eaf64', url: '/symbols/mulberry/ladle.svg' },
        { revision: 'a9fb619c2ec15f9dc6102e84c569b7ff', url: '/symbols/mulberry/lady_-_face.svg' },
        { revision: '95d788c3f884282641c968eed8041695', url: '/symbols/mulberry/lager.svg' },
        { revision: 'e8fa0a99b24538a5f8834c30d302deb8', url: '/symbols/mulberry/lamb.svg' },
        { revision: 'e232843eee4471ccf6d25f64ff5d439f', url: '/symbols/mulberry/lamb_2.svg' },
        { revision: '0d0776e7067fff0fadb5f720227d3d86', url: '/symbols/mulberry/lamp.svg' },
        { revision: '21718f2d25bb5d3072b3b2fb3ab34ec1', url: '/symbols/mulberry/lampshade.svg' },
        { revision: 'd1246c419d43d58956dbb5a2ca438370', url: '/symbols/mulberry/lampshade_2.svg' },
        { revision: 'f66067bad3b53d6b48302e064bc1ee31', url: '/symbols/mulberry/lantern.svg' },
        { revision: 'd184b7c50f40b52e8ce1b7dcfe4a8fe4', url: '/symbols/mulberry/lantern_2.svg' },
        { revision: '4b56e4c44b35857d917812d9573c3ba9', url: '/symbols/mulberry/laptop.svg' },
        { revision: '88706797a5d3417e6a633ff049f9075e', url: '/symbols/mulberry/large.svg' },
        { revision: '86541e416c041b16dec6dc829340bd38', url: '/symbols/mulberry/lasagne.svg' },
        { revision: '69046e8cdfe50edba5c92d98b04b345f', url: '/symbols/mulberry/last.svg' },
        { revision: 'ca51a0479abfc7d9138baccb65b0502d', url: '/symbols/mulberry/last_2.svg' },
        { revision: 'a78f2d0a15bc64b04a3fa1fb5ced069a', url: '/symbols/mulberry/last_month.svg' },
        {
          revision: 'c9bf63f194c5efdb90e4dd8a0e3a838d',
          url: '/symbols/mulberry/laughing_lady.svg',
        },
        { revision: '4dcc33565d293acbe73c7c23c428b54b', url: '/symbols/mulberry/laughing_man.svg' },
        {
          revision: 'e135cb90704bfa74dd5066b849000701',
          url: '/symbols/mulberry/laundry_basket.svg',
        },
        { revision: '0ba2ac3aecfcdbe9282aa90e6915d164', url: '/symbols/mulberry/lava_lamp.svg' },
        { revision: 'eb2e34a0ac22f318479770214d675459', url: '/symbols/mulberry/lawnmower.svg' },
        { revision: '3fbc1fd3566cb8cf4afc042c7a5a6b63', url: '/symbols/mulberry/lead.svg' },
        { revision: '9a0fe3fca48a103922f17e976adf8e47', url: '/symbols/mulberry/leaf.svg' },
        { revision: '4106028443b3df75a76f96bb7a87dbfd', url: '/symbols/mulberry/leaves.svg' },
        { revision: 'cd26ad3e1bd145549db3dc53cb874b93', url: '/symbols/mulberry/leek.svg' },
        { revision: 'd8a2305d0201ad8aeace850dbf64c7c2', url: '/symbols/mulberry/left.svg' },
        { revision: '3283bed67f6c03b650487adfa767cd79', url: '/symbols/mulberry/left_click.svg' },
        { revision: 'c830104df177e09013db73318311b423', url: '/symbols/mulberry/left_hand.svg' },
        { revision: '17544f3a6f4d853819dd97660cfccbfb', url: '/symbols/mulberry/leg.svg' },
        { revision: '46fd0eca14911e294cdc77c95c8a6e57', url: '/symbols/mulberry/leg_warmers.svg' },
        { revision: 'efbba88c7f5d0a359520409b985bbbf8', url: '/symbols/mulberry/lego.svg' },
        { revision: '38b4024673ef256f9ce1304171faf096', url: '/symbols/mulberry/legs.svg' },
        { revision: 'd1d2df4e47599025e58700ab08381a26', url: '/symbols/mulberry/lemon.svg' },
        { revision: '8296d288255d3a6d9de762d29b768f68', url: '/symbols/mulberry/lemon_squash.svg' },
        { revision: '7e178116c0a2cf0814f030d0eea477f7', url: '/symbols/mulberry/lemonade.svg' },
        { revision: 'f82c5bf132d91629d7c676e6f630a8ef', url: '/symbols/mulberry/lemonade_2.svg' },
        { revision: '5fa72c946398a38bd7d7a64679c9e28d', url: '/symbols/mulberry/lens.svg' },
        { revision: 'b33997ca21594f11f9b2f26d36fd1f12', url: '/symbols/mulberry/lentils.svg' },
        { revision: '4f79ae7fd20a1833ab5456616ed2acac', url: '/symbols/mulberry/leopard.svg' },
        { revision: '03f08c43dcf2baf67bbfe041ef3d4db6', url: '/symbols/mulberry/letter.svg' },
        { revision: '41cad493ffd4017a293aa33af70fc9c8', url: '/symbols/mulberry/lettuce.svg' },
        { revision: 'c2ec3eab918a070fc9d67fef07a9a9a4', url: '/symbols/mulberry/lid.svg' },
        { revision: '8430bfbac20c568e4336ee774560214a', url: '/symbols/mulberry/lid_2.svg' },
        {
          revision: '9359908ee17495735fa4d980361768a4',
          url: '/symbols/mulberry/lie_on_back_,_to.svg',
        },
        { revision: 'fe8eb84bb666502c2e3598c0fc6a34b9', url: '/symbols/mulberry/lift.svg' },
        { revision: '42cae701a9043a9f251c85b6c0555e88', url: '/symbols/mulberry/light.svg' },
        { revision: '4c6246eb13c26f4f89d6ba75f82009b7', url: '/symbols/mulberry/lightbulb.svg' },
        { revision: '2924994035738017dd6981f50fe11e0f', url: '/symbols/mulberry/lily.svg' },
        { revision: '4e9bde14090061be19f69419e55a78e7', url: '/symbols/mulberry/lime.svg' },
        {
          revision: 'ad4f283f6ae1531685d0bbc833b0a3b3',
          url: '/symbols/mulberry/line_diagonal.svg',
        },
        {
          revision: 'ae03d964f0dc581eec22da4eafa7ce64',
          url: '/symbols/mulberry/line_horizontal.svg',
        },
        {
          revision: '9ea7375a6805a1a5eea062b0baf386fc',
          url: '/symbols/mulberry/line_parallel.svg',
        },
        {
          revision: '6da09aa490a6f8d66e7f4ce841ebad7a',
          url: '/symbols/mulberry/line_vertical.svg',
        },
        { revision: 'f795a9feb983b363597073f3e492172f', url: '/symbols/mulberry/lion.svg' },
        { revision: '31f27d90151784009a16b5e05538ec8e', url: '/symbols/mulberry/lip_balm.svg' },
        { revision: 'fed97c0bcd0390e5695d316da901221c', url: '/symbols/mulberry/lip_bottom.svg' },
        { revision: 'ba84c3d582a2aac140958e320b03e623', url: '/symbols/mulberry/lip_top.svg' },
        { revision: '815af369b0738aab801de3845d9dccfa', url: '/symbols/mulberry/lips_1.svg' },
        { revision: 'c4c592fee60c8a981adef16019ffc983', url: '/symbols/mulberry/lipstick.svg' },
        { revision: '7a6201e2d16d1e3ebf555a4cc7c24399', url: '/symbols/mulberry/liquid_soap.svg' },
        { revision: '2af8410df61c57c5007d4b68fa3a8a44', url: '/symbols/mulberry/little.svg' },
        {
          revision: 'c5de193b2563cbde019f49f4b32b9ce3',
          url: '/symbols/mulberry/little_mac_switch.svg',
        },
        { revision: '115fe959643609a466570c74e12a7b03', url: '/symbols/mulberry/lizard.svg' },
        { revision: 'e12ee51836a31fb968da4c1f69e7f8e1', url: '/symbols/mulberry/locker.svg' },
        { revision: '86141508c5b1388917f844beef58fbd4', url: '/symbols/mulberry/log.svg' },
        { revision: 'b7e14c300d5ad795ebdb3259b271b083', url: '/symbols/mulberry/lollipop.svg' },
        { revision: 'eaef2a1824a53f913b16cfb2e8eef4da', url: '/symbols/mulberry/long.svg' },
        { revision: '65d4a24260e51842fed09de266a80433', url: '/symbols/mulberry/long_hair.svg' },
        { revision: '35a97063b6ea6c5a154022dcd6082397', url: '/symbols/mulberry/long_johns.svg' },
        { revision: 'e5e76b90d381422eae32c0b7e7a63f99', url: '/symbols/mulberry/look_,_to.svg' },
        {
          revision: '7e6a4abfb339133b7675a72a7d4c9b6d',
          url: '/symbols/mulberry/look_in_mirror_,_to.svg',
        },
        { revision: '7a31bca3606d463419e3380a473a8587', url: '/symbols/mulberry/lorry.svg' },
        { revision: '64b31bffea7d404b3e61e06c416a0f96', url: '/symbols/mulberry/lorry_2.svg' },
        { revision: '04340e2a18f939911f11aae3e8399fd9', url: '/symbols/mulberry/lost.svg' },
        { revision: '6c3cc00e3d2f38cedc13be10fe1c182d', url: '/symbols/mulberry/lotion.svg' },
        { revision: '53b5c83e8f1ca5723f1416da286b4788', url: '/symbols/mulberry/lots_more.svg' },
        { revision: 'd70a44c1530288fd3c43a945785ce077', url: '/symbols/mulberry/loud.svg' },
        { revision: '6b57a649036fd5e997b0a22bcbb0a218', url: '/symbols/mulberry/low_fat_2.svg' },
        { revision: 'f3697648c6e39fa47b8f4cf9ecf99c5f', url: '/symbols/mulberry/lowest.svg' },
        { revision: '21006556a96c2a6499e6ac05c8270c3c', url: '/symbols/mulberry/lucky.svg' },
        { revision: 'e0ddb33265d5626c7719590215384332', url: '/symbols/mulberry/lump.svg' },
        { revision: 'cd994efe6a963df304eabf6cdf72d25d', url: '/symbols/mulberry/lunch_1.svg' },
        { revision: 'a0c2e365c9dd8590eb79d593ff6ebd7e', url: '/symbols/mulberry/lunch_2.svg' },
        { revision: 'd1cb99d22162becc41778739de815c93', url: '/symbols/mulberry/lunch_box.svg' },
        { revision: '947716c61a465b5b8a7dd11cc94909ea', url: '/symbols/mulberry/lunch_box_1.svg' },
        { revision: 'f3559a7ff4c42ddadf13f0845760c87a', url: '/symbols/mulberry/lunch_time.svg' },
        { revision: 'c5f1653f8216e7c46e84c9fd8b3f218c', url: '/symbols/mulberry/lungs.svg' },
        {
          revision: '915a10b4e44b1127d962cea893dfac33',
          url: '/symbols/mulberry/m_-_lower_case.svg',
        },
        { revision: '18b16d2336a86a3241e2fb12a1843e9b', url: '/symbols/mulberry/macadamias.svg' },
        { revision: 'b6cc7fca485b16e98185b12f3f6e75f7', url: '/symbols/mulberry/macaroni.svg' },
        {
          revision: 'bdfb626727451339b1158c6a100c0ce0',
          url: '/symbols/mulberry/macaroni_cheese.svg',
        },
        { revision: 'c3cf0fe0b50dedab4e2bd53fe859f4b9', url: '/symbols/mulberry/magnet.svg' },
        { revision: 'f63dcf032da7aec52ea99a8aebb25fdd', url: '/symbols/mulberry/magnetic.svg' },
        { revision: '6d59749d607aa647b84613e1de465dc1', url: '/symbols/mulberry/main_course.svg' },
        { revision: '599235fa8ab930840712ae292823c72d', url: '/symbols/mulberry/mains_socket.svg' },
        { revision: 'a81f55c207d857ce6bd8b42852fae472', url: '/symbols/mulberry/make_,_to.svg' },
        {
          revision: '3178465b475ad44888b75ecd3d64ed53',
          url: '/symbols/mulberry/make_the_bed_,_to.svg',
        },
        { revision: '1def1e2595b1af98a4f1c071873cfe58', url: '/symbols/mulberry/make_up.svg' },
        { revision: '5cc0d837f5071303ff96e616e15940aa', url: '/symbols/mulberry/male_body.svg' },
        { revision: 'ce83cfa0d63eaaf325e9ec1ba6c912ae', url: '/symbols/mulberry/man_-_face.svg' },
        { revision: '4fa9201bdaa688be2eb8ee2932489cea', url: '/symbols/mulberry/mange_tout.svg' },
        { revision: 'da46b8407676351f1479f1687c40cb43', url: '/symbols/mulberry/manger.svg' },
        { revision: '29001adb079228e76f2fe88197a371e3', url: '/symbols/mulberry/mango.svg' },
        { revision: 'b62faa22f9d23f3fa3e6a3c04fddfb77', url: '/symbols/mulberry/marbles.svg' },
        { revision: '5218ce697c6cd9f0eb39d962285be50e', url: '/symbols/mulberry/margarine.svg' },
        { revision: '99490c1fe8b43472f0ba754ddafcb5d6', url: '/symbols/mulberry/marmite.svg' },
        { revision: 'c6f8fa8ddee73871f47d1f715b0cd025', url: '/symbols/mulberry/married.svg' },
        { revision: '70b6cfefc9e77d5eed4a3843afc731ca', url: '/symbols/mulberry/marrow.svg' },
        { revision: 'd5fc715e806358697f67edac9feb09d1', url: '/symbols/mulberry/marshmallows.svg' },
        { revision: 'a2b55b1cf55b4f7d495d7df6c68cee3d', url: '/symbols/mulberry/mascara.svg' },
        { revision: '57c2f848c37df224243c65b161d1c250', url: '/symbols/mulberry/mash_,_to.svg' },
        {
          revision: '6e5c6a7a64ea2d849d33e16f9ef96f66',
          url: '/symbols/mulberry/mash_potato_,_to.svg',
        },
        {
          revision: 'c80a8127a63df65dbfa4c38fd71bf284',
          url: '/symbols/mulberry/mash_potato_1.svg',
        },
        {
          revision: 'f40f4d6ba8b25b577b082723a5a7061a',
          url: '/symbols/mulberry/mash_potato_2.svg',
        },
        { revision: 'fcd89478f5ff375ccbc746840228c14d', url: '/symbols/mulberry/masher.svg' },
        {
          revision: 'e4762a5e3ad293fff724b26424f85b47',
          url: '/symbols/mulberry/mask_dustmask.svg',
        },
        { revision: '2b7a30cc942ac126d3e2f8a75ecfea70', url: '/symbols/mulberry/masking_tape.svg' },
        { revision: '1248bebd6b11a6f889e639e870c21f5e', url: '/symbols/mulberry/maths.svg' },
        { revision: '7b68aa8f9726efa3f1c894c2f94e4f71', url: '/symbols/mulberry/maths_class.svg' },
        { revision: '6c7e7fe6ec2a9fe5c39d639a6d331c1d', url: '/symbols/mulberry/mauve.svg' },
        { revision: '1e00c0aa71427fc1a0f11cdc0ae66791', url: '/symbols/mulberry/mauve_dark.svg' },
        { revision: '8c3a8def0d9f6dd6a2e55736812f80cf', url: '/symbols/mulberry/mauve_light.svg' },
        { revision: 'ff792da362f8ee7f8be1838c90180c21', url: '/symbols/mulberry/mayonnaise.svg' },
        {
          revision: '78886d9691580012f815afc1296ed1b8',
          url: '/symbols/mulberry/measuring_cups.svg',
        },
        {
          revision: '615765574c86cdff4a037409b7483d52',
          url: '/symbols/mulberry/measuring_jug.svg',
        },
        {
          revision: 'db76fe8ca0aba106156f9feaf60fcc22',
          url: '/symbols/mulberry/measuring_spoons.svg',
        },
        { revision: 'b222dcab9f333973c70645d97e204b74', url: '/symbols/mulberry/meat.svg' },
        {
          revision: 'bcea1802c423775c2d8e19736dfe28fb',
          url: '/symbols/mulberry/meatballs_and_spaghetti.svg',
        },
        { revision: '847cc17f0faf456472ba60bcc5eb5b17', url: '/symbols/mulberry/medal.svg' },
        { revision: '17b2e547e8e80b9df0e0a08a29a3f54c', url: '/symbols/mulberry/medicine.svg' },
        {
          revision: 'cd4004149970f1839cba9ef2e32f73dc',
          url: '/symbols/mulberry/medicine_cabinet.svg',
        },
        { revision: 'bcfe87fd7a9fc73f334bab64dc591519', url: '/symbols/mulberry/meet_,_to.svg' },
        { revision: 'e7437576ddefa429b1cfd755770e136f', url: '/symbols/mulberry/melon.svg' },
        { revision: '5fcd34f14f40601cf84db0c5c5c1219d', url: '/symbols/mulberry/melt_,_to.svg' },
        { revision: 'ef1bee4c3d1da8c0aba5c863a6eba838', url: '/symbols/mulberry/memory_card.svg' },
        {
          revision: '2b83933cc76afca018eb4654abdaf6ed',
          url: '/symbols/mulberry/memory_card_2.svg',
        },
        { revision: '338bdde9ab52ab7c85d93f16b84b0a0e', url: '/symbols/mulberry/mend.svg' },
        { revision: '3228c79d33ec09886080c8cf14a9d931', url: '/symbols/mulberry/mens_toilet.svg' },
        { revision: '5b1e3558f71cbea4b943bc33f6cfdf10', url: '/symbols/mulberry/menu.svg' },
        { revision: '0f9d669ae60ffa60b537b3c0a24ef41f', url: '/symbols/mulberry/meringues.svg' },
        {
          revision: '89a84b6a584691a13456acf0bfbc4ac9',
          url: '/symbols/mulberry/merry_go_round.svg',
        },
        {
          revision: '27f5147fa79a672c497d4e0b0f7d7b05',
          url: '/symbols/mulberry/messy_clothes.svg',
        },
        { revision: '12776dd340c7d6db6aae8e82fd1fe4bf', url: '/symbols/mulberry/messy_room.svg' },
        { revision: '0ad7f1edab6fedb6af9625245e2b5407', url: '/symbols/mulberry/microphone.svg' },
        { revision: '1b801554c0f9f60790af1b10c37c90a6', url: '/symbols/mulberry/microscope.svg' },
        { revision: '56d9cd5d2bfee2136877138c789e9822', url: '/symbols/mulberry/microwave.svg' },
        { revision: 'a3dbc75013a0b52c48131252016cb038', url: '/symbols/mulberry/middle.svg' },
        { revision: '2dbae13ff44b79c9f8c49ffcaed43870', url: '/symbols/mulberry/milk.svg' },
        { revision: '69ca212a2007e162db3c51d715b4343c', url: '/symbols/mulberry/milk_2_litre.svg' },
        { revision: 'e5a04055bc5a4f04b96e5a7134906781', url: '/symbols/mulberry/milk_bottle.svg' },
        { revision: '663ad7f191784bcd11761e0c5b93906e', url: '/symbols/mulberry/milk_carton.svg' },
        {
          revision: '7a30b5a4aaa45ad10ae36650516a83f7',
          url: '/symbols/mulberry/milk_person_1a.svg',
        },
        {
          revision: 'e014f44bad2e10d5932aa0fdae01edd2',
          url: '/symbols/mulberry/milk_person_1b.svg',
        },
        {
          revision: '642addd4d06e71249718a2b129798291',
          url: '/symbols/mulberry/milk_person_2a.svg',
        },
        {
          revision: '135d5ee059f83d5f62d20799cf79e939',
          url: '/symbols/mulberry/milk_person_2b.svg',
        },
        { revision: 'eba251e2bd5812f12962772ea6d3f674', url: '/symbols/mulberry/milkshake.svg' },
        {
          revision: '2979763601f33bc012d26c9da1edfe47',
          url: '/symbols/mulberry/milkshake_banana.svg',
        },
        {
          revision: '676c365590a13843b5fb1052abd959a0',
          url: '/symbols/mulberry/milkshake_chocolate.svg',
        },
        {
          revision: '0f2b29adf23709d0c960c790024a7d5b',
          url: '/symbols/mulberry/milkshake_strawberry.svg',
        },
        { revision: '90a846bd5c78490e2132e40c3777f984', url: '/symbols/mulberry/mince_pie.svg' },
        { revision: '4766f41b57816236987671eed38e0a64', url: '/symbols/mulberry/minced_meat.svg' },
        { revision: '7cb76dee6dad989891a5b1b0bc54e568', url: '/symbols/mulberry/mini_bus.svg' },
        { revision: 'de5aee766ce33f4e8c8b1a59bf68bd2a', url: '/symbols/mulberry/mints.svg' },
        { revision: 'd773c3122fe4d87a16ea479c8a806a66', url: '/symbols/mulberry/minute.svg' },
        { revision: 'd5e9256a9c19578cd58ed28051fdbec9', url: '/symbols/mulberry/mirror.svg' },
        { revision: 'e089a1fdfcc6ab8d466d0de3b84c538b', url: '/symbols/mulberry/mirror_1.svg' },
        { revision: '2a78ee7b488e1a051158ab328bb6e523', url: '/symbols/mulberry/mirror_2.svg' },
        { revision: '289561d80e34121e54c065ed221c8f62', url: '/symbols/mulberry/mirror_ball.svg' },
        {
          revision: 'be66c6131c2d22068377cffbefeb2ef9',
          url: '/symbols/mulberry/miss_bus_,_to.svg',
        },
        {
          revision: '21c2f77b15cb419bbe2c71e5d8efae42',
          url: '/symbols/mulberry/mistake_no_wrong.svg',
        },
        { revision: '0241128a352a705b020b81d1016c8941', url: '/symbols/mulberry/mistletoe.svg' },
        { revision: 'f3cc5aea7b30df052ed47a6258a127b3', url: '/symbols/mulberry/mittens.svg' },
        { revision: 'e93e8d1b5ac19eee55e1d8be2df48e7d', url: '/symbols/mulberry/mixer.svg' },
        { revision: '74ff9a46951498ec89daa37fdba79607', url: '/symbols/mulberry/mobile_phone.svg' },
        {
          revision: '5f57edabb0d957b73e1573ba939d990e',
          url: '/symbols/mulberry/mobile_phone_camera.svg',
        },
        {
          revision: '5254f2b2222aa000affd727668085073',
          url: '/symbols/mulberry/mobile_phone_case.svg',
        },
        {
          revision: '830711406ad1477b30127f92553067ba',
          url: '/symbols/mulberry/mobile_phone_cover.svg',
        },
        {
          revision: '59993ee4e491230a0ae2dc43f9d2bc03',
          url: '/symbols/mulberry/mobile_phone_no.svg',
        },
        {
          revision: 'c10a9fdcabf35526b2b4a9daa0922989',
          url: '/symbols/mulberry/mobile_phone_number.svg',
        },
        {
          revision: '0b7fbb6d5a889283d2289a73ca44062e',
          url: '/symbols/mulberry/mobile_phone_ring_tone.svg',
        },
        {
          revision: '399541f58c471b5a0bdcf095c18595ad',
          url: '/symbols/mulberry/mobile_phone_silent.svg',
        },
        {
          revision: '43dae0726405449a961f1cfc33a5d91c',
          url: '/symbols/mulberry/mobile_phone_text_message.svg',
        },
        {
          revision: '2fa443657eb8b7ef9580e8dda351f516',
          url: '/symbols/mulberry/mobile_phone_video.svg',
        },
        { revision: '54d81bb82be43b5ee742539a3719e64a', url: '/symbols/mulberry/mole.svg' },
        { revision: '91849b4ce9396d9fa8738ad266ef0c22', url: '/symbols/mulberry/money.svg' },
        { revision: 'ddf8b95e4187443d8f3d2c42b30baea7', url: '/symbols/mulberry/monster.svg' },
        { revision: 'de761f33cc26d5bacd263049fba5a5d9', url: '/symbols/mulberry/mop.svg' },
        { revision: '20d2fd60d7c20105d6d177cc70ca13e0', url: '/symbols/mulberry/moped.svg' },
        { revision: '501867159376d3b1ff8f536773d7663c', url: '/symbols/mulberry/more.svg' },
        { revision: '4d9d2ddbdf6eda1f57cf8f506fd9221f', url: '/symbols/mulberry/morning.svg' },
        { revision: '193aeb1f651afa00a31278ce98cd33ef', url: '/symbols/mulberry/most.svg' },
        { revision: '77e7ac68ace1b16c68c3c63ca9aedb0f', url: '/symbols/mulberry/moth.svg' },
        { revision: '30d336196ff01451f88f6fd6c5151590', url: '/symbols/mulberry/motor_home.svg' },
        { revision: 'cacacef50084273d9b331667b824ed65', url: '/symbols/mulberry/motorcycle.svg' },
        { revision: 'f1977adb4934ad31e3bceb71684242c2', url: '/symbols/mulberry/mountains.svg' },
        { revision: '191f48c816f9f2956a32f7499e1f6bc9', url: '/symbols/mulberry/mouse.svg' },
        { revision: '42d0b439136d19a4ecd3ef1ca34b5478', url: '/symbols/mulberry/mouse_mat.svg' },
        { revision: '3b0261180b4ea55feff55ec37affd7d2', url: '/symbols/mulberry/mouth.svg' },
        { revision: 'b0395bfc95f87d528139391444afa43d', url: '/symbols/mulberry/mouthwash.svg' },
        { revision: '2cd66a45b42e64375c161fa3203487c1', url: '/symbols/mulberry/mouthwash_1.svg' },
        { revision: '0a1408d8a695b3bc5382a3135ade7cb2', url: '/symbols/mulberry/move_,_to.svg' },
        { revision: '5df8e7089e9a1a2894f63735c0239814', url: '/symbols/mulberry/muesli.svg' },
        { revision: '0aa5236a400516729be558986ae35f9f', url: '/symbols/mulberry/mug_2.svg' },
        { revision: '0c8cd3ffd8795b563af9b59941d2b7b4', url: '/symbols/mulberry/multi_media.svg' },
        { revision: '37f74cdf2c72828dac82feaf6daf83f5', url: '/symbols/mulberry/multiply.svg' },
        { revision: '505af791ae9921246ce87886f4216238', url: '/symbols/mulberry/mum_parent.svg' },
        { revision: '42535624a69c4c4c0492c4bd349e6c32', url: '/symbols/mulberry/muscles.svg' },
        { revision: '99a511568b6124fca93b0c593daf17a4', url: '/symbols/mulberry/mushroom.svg' },
        { revision: 'bc17a992625d9ea130568c9fd783bdbd', url: '/symbols/mulberry/music.svg' },
        { revision: '1868bdd8c86f2e75a6b1048a1cf16dd2', url: '/symbols/mulberry/music_class.svg' },
        { revision: '9b621a565aed8814dcd42e703f687083', url: '/symbols/mulberry/music_room.svg' },
        {
          revision: 'fd2adfc2a56c659e2ab0718f716d6303',
          url: '/symbols/mulberry/musical_instruments.svg',
        },
        { revision: 'fa7416aaf2990a98b8d221956608facf', url: '/symbols/mulberry/musician_1a.svg' },
        { revision: 'fb312bbe9bfcb8dc1d0b7e8586217cdc', url: '/symbols/mulberry/musician_1b.svg' },
        { revision: '99b70e80e5a6db87a77f95ec9b9525a0', url: '/symbols/mulberry/musician_2a.svg' },
        { revision: '76ea270072fb349ed2dc5d2a2affd094', url: '/symbols/mulberry/musician_2b.svg' },
        { revision: '3aa716e13833171c3a9200c11c05b038', url: '/symbols/mulberry/mussel.svg' },
        {
          revision: '6d3ec22a3bcf8d7ca71c6a8354f90531',
          url: '/symbols/mulberry/my_computer_icon.svg',
        },
        {
          revision: 'b916fd1a2fff28c9955b8c1d974093b5',
          url: '/symbols/mulberry/n_-_lower_case.svg',
        },
        { revision: '6563acb82541082aa8691af36d5ae41b', url: '/symbols/mulberry/nail.svg' },
        { revision: '93f90b42aea7492607bf6632477ae688', url: '/symbols/mulberry/nail_care.svg' },
        {
          revision: '9be8c97f98ae29f257cc5e219d46e868',
          url: '/symbols/mulberry/nail_clippers.svg',
        },
        { revision: 'f6236a36c604286e015cdf2666a63093', url: '/symbols/mulberry/nail_file.svg' },
        { revision: '5f6902ea9df9c3fc778ed4c74253de0c', url: '/symbols/mulberry/nail_polish.svg' },
        {
          revision: 'b491e26e7ba44f1fbe823b077f1edbb5',
          url: '/symbols/mulberry/nail_polish_remover.svg',
        },
        { revision: '0e640636a0adf90fd0e027eb90ac27fa', url: '/symbols/mulberry/nappy.svg' },
        { revision: '4f24e6c677d9728a746efda6610f81bc', url: '/symbols/mulberry/near.svg' },
        { revision: '434aa1939999d6d200bae81a617f6271', url: '/symbols/mulberry/neck.svg' },
        { revision: '7a3034bd52b6126c40ed32c39fb7dcda', url: '/symbols/mulberry/necklace.svg' },
        { revision: '1f0bac971720c403e821ef6a08eacf98', url: '/symbols/mulberry/necklace_2.svg' },
        { revision: 'f98e4d0412d847f386bc0c17cf686241', url: '/symbols/mulberry/need_toilet.svg' },
        { revision: 'de714755baf908bff25947cccbdce7b6', url: '/symbols/mulberry/neither.svg' },
        { revision: '980cbb46b58cbae4c5615875e00e9be0', url: '/symbols/mulberry/nest.svg' },
        {
          revision: '65bebe1f0ff157193e6159b482bbb392',
          url: '/symbols/mulberry/nest_of_tables.svg',
        },
        {
          revision: '3d7d750bdf0d55e098913d4ac450a10e',
          url: '/symbols/mulberry/networked_computers.svg',
        },
        { revision: '6fe9cd891ded5f93d9dfb68e4ce02804', url: '/symbols/mulberry/new_document.svg' },
        { revision: 'b58727d923290ebf4de13786514449e1', url: '/symbols/mulberry/newspaper.svg' },
        {
          revision: 'eb05b7652315c40ca2a658ee05aa4738',
          url: '/symbols/mulberry/newspaper_person_1a.svg',
        },
        {
          revision: '03fb96c56ce2aab7479a82bda6221937',
          url: '/symbols/mulberry/newspaper_person_1b.svg',
        },
        {
          revision: '7aa84139846295eb9490b25c37b5b466',
          url: '/symbols/mulberry/newspaper_person_2a.svg',
        },
        {
          revision: '136eece85a6d69ee3695825d7b02d470',
          url: '/symbols/mulberry/newspaper_person_2b.svg',
        },
        { revision: 'ad3324ed92da0330899290a0d1974184', url: '/symbols/mulberry/next.svg' },
        { revision: '5c2c58b67b253ab63163c94205bfac13', url: '/symbols/mulberry/next_month.svg' },
        { revision: 'd86ae6c4c6a5bd4ca2335378ac911657', url: '/symbols/mulberry/next_week.svg' },
        { revision: '4fcd06ca98f249bc76d83b77a665aa39', url: '/symbols/mulberry/night.svg' },
        { revision: '5692032f2e9471fb68756c7cab32b121', url: '/symbols/mulberry/nightgown.svg' },
        { revision: '5eef577a282ae1dc80fdb8fe07087ed0', url: '/symbols/mulberry/nine.svg' },
        { revision: '2a050ea18eec2341b263ae7fb60f642c', url: '/symbols/mulberry/nine_dots.svg' },
        { revision: 'e0a1ff9b0bc26a9168fd62fbb7e6149c', url: '/symbols/mulberry/nineteen.svg' },
        { revision: '58da3ef9758cc97d4588dd7748be5882', url: '/symbols/mulberry/ninety.svg' },
        { revision: '886b7ebcafffda2a5b0c120dfcc984b6', url: '/symbols/mulberry/no_class.svg' },
        {
          revision: 'bf4aad2635ad22f0f90f52b420045120',
          url: '/symbols/mulberry/no_smoking_sign.svg',
        },
        { revision: 'a7e1c4307009c187914ecb4254c77a2b', url: '/symbols/mulberry/nod_,_to.svg' },
        { revision: 'b13832e74f9ceb48e83ff0fd453c027c', url: '/symbols/mulberry/noisy.svg' },
        {
          revision: '387314da970e76bb5447ff51b083dfd9',
          url: '/symbols/mulberry/non-permeable.svg',
        },
        { revision: '55e745525c430de41fcb4126621abc17', url: '/symbols/mulberry/non_speaking.svg' },
        { revision: '4a48f57679a09489defbddeb57282f92', url: '/symbols/mulberry/noodles.svg' },
        { revision: 'a9a7080b0342db770846853026444b8b', url: '/symbols/mulberry/north.svg' },
        { revision: '008010974a622179185c24e5b562fa63', url: '/symbols/mulberry/north_east.svg' },
        { revision: '39094a18ade48f8eca7c894d90b89cb4', url: '/symbols/mulberry/north_west.svg' },
        { revision: 'e4e8bc70d784be8f16ab5bc53b758489', url: '/symbols/mulberry/nosey_cup.svg' },
        { revision: '92b5d0957d9c9dc2e4d5976a8b75d507', url: '/symbols/mulberry/nostril.svg' },
        { revision: '1f7127d001aa6891f5a9b5a57739d883', url: '/symbols/mulberry/notebook.svg' },
        { revision: '0dcc9d13e2c9991abf56c8ab64ccfde4', url: '/symbols/mulberry/notepad.svg' },
        { revision: 'f5e5d7dc5b2bca9296030eb71e92da06', url: '/symbols/mulberry/now.svg' },
        { revision: '06754f8039943841f8b88ebced9ca9fe', url: '/symbols/mulberry/nurse_1a.svg' },
        { revision: '459cedfe94a05c073215175a276109eb', url: '/symbols/mulberry/nurse_1b.svg' },
        { revision: '622ee13cf2ca0f3a1f92547fd7633713', url: '/symbols/mulberry/nurse_2a.svg' },
        { revision: '721d74fa0bd33a3378da7e7ccc80ce3c', url: '/symbols/mulberry/nurse_2b.svg' },
        { revision: '62e5bf8516fb6bf44e7db2d1296708b5', url: '/symbols/mulberry/nuts.svg' },
        {
          revision: 'e720ca180b12d50c54aaa06f734ea286',
          url: '/symbols/mulberry/o_-_lower_case.svg',
        },
        { revision: 'feff2d8723637cba3c6d72fc23ea65f6', url: '/symbols/mulberry/oak_leaf.svg' },
        {
          revision: '4e94068b676eaf02cec48a3bedccdc23',
          url: '/symbols/mulberry/occupational_therapist_1a.svg',
        },
        {
          revision: '473cf0ea6fdaef3d79e99278db1a789c',
          url: '/symbols/mulberry/occupational_therapist_1b.svg',
        },
        {
          revision: 'a7e38a1385c61764bf12a4c591f7cacf',
          url: '/symbols/mulberry/occupational_therapist_2a.svg',
        },
        {
          revision: '6591a6dc40a4f31ba98d0d25ff9eee53',
          url: '/symbols/mulberry/occupational_therapist_2b.svg',
        },
        { revision: '889697e89ae1516ae1d77eac9cbf6d94', url: '/symbols/mulberry/octagon.svg' },
        { revision: 'e7a4b128b48610c30f8130e9bd825426', url: '/symbols/mulberry/off.svg' },
        { revision: '3d40a5b384c490033e55cc8994c31021', url: '/symbols/mulberry/office_block.svg' },
        { revision: '531e6bddf5e96d594b194423681d7013', url: '/symbols/mulberry/old_object.svg' },
        { revision: '1853800266e6fae45d5a48995c79701c', url: '/symbols/mulberry/old_person_1.svg' },
        { revision: 'ea0aac509d182a7ee660162886bd722c', url: '/symbols/mulberry/old_person_2.svg' },
        { revision: '101e2414fbf23382ea6ab01edd212309', url: '/symbols/mulberry/old_person_3.svg' },
        { revision: '4756777c2eaaf164d768dcbe7e1515b8', url: '/symbols/mulberry/olive_oil.svg' },
        { revision: '7b040dc63672424781a0842dddf44f1f', url: '/symbols/mulberry/olives.svg' },
        {
          revision: 'c719b73e2cc5340ca0f7ed83963609bc',
          url: '/symbols/mulberry/olympic_games.svg',
        },
        {
          revision: '38a6a02d0fa9ca21cf21319a60f2da0e',
          url: '/symbols/mulberry/olympic_rings.svg',
        },
        {
          revision: 'eca03b816029ee8772e1568895f86ebb',
          url: '/symbols/mulberry/olympic_torch.svg',
        },
        {
          revision: '97d7d8e608dd99024a7ad4ddc406b1cb',
          url: '/symbols/mulberry/olympic_torch_2.svg',
        },
        { revision: '0f94d1425f7712c68fb70b81303c111c', url: '/symbols/mulberry/omelette.svg' },
        { revision: '20c153d074db1fe85b94bd494ea4045b', url: '/symbols/mulberry/on.svg' },
        { revision: 'c235feb2f21d6adad553f3bcdcff47b3', url: '/symbols/mulberry/one.svg' },
        { revision: 'f18ac4acced56d49ee7f038eb97d7770', url: '/symbols/mulberry/one_dot.svg' },
        { revision: 'cb52053ab7d9044c6b984d5dbc590fc6', url: '/symbols/mulberry/one_hour.svg' },
        { revision: '8ada202202670a84e196843afe57b46b', url: '/symbols/mulberry/one_third.svg' },
        { revision: '99fd134dfaf99ea6b3894f8197099520', url: '/symbols/mulberry/onion.svg' },
        { revision: 'e27819a0553bbf12c9142ebb06ad4817', url: '/symbols/mulberry/onion_rings.svg' },
        { revision: '07b10484629b8752a67713f8a0e0ff33', url: '/symbols/mulberry/opaque.svg' },
        { revision: '6f47b99f0ebdb6053c9895e1c155fcd4', url: '/symbols/mulberry/open.svg' },
        { revision: 'de46ee4cc5de7a031fe0a2c42bfba809', url: '/symbols/mulberry/open_,_to.svg' },
        { revision: '111a333111622e731a291eb4bc6e33c3', url: '/symbols/mulberry/open_2.svg' },
        { revision: '16a41f9fc004646ac3cc7556772893a5', url: '/symbols/mulberry/open_2_,_to.svg' },
        {
          revision: 'e589e586a1273c52a30f220e7672ea9e',
          url: '/symbols/mulberry/open_door_,_to.svg',
        },
        {
          revision: '4bd6fc97e76f871e87e7cfafd1688efe',
          url: '/symbols/mulberry/open_door_1_,_to.svg',
        },
        {
          revision: '0d7dff5b2a3d60cfa16b720e0237a968',
          url: '/symbols/mulberry/open_door_2_,_to.svg',
        },
        { revision: '67816e423fafc34f8fc90d4d9ec40dcd', url: '/symbols/mulberry/open_shop.svg' },
        {
          revision: '8843b15082812bf39b9d2c09a90bd182',
          url: '/symbols/mulberry/open_tin_,_to.svg',
        },
        {
          revision: '085e64928775bc96fc633e957243c340',
          url: '/symbols/mulberry/operating_theatre.svg',
        },
        { revision: '7a8292c474cb356126c02025c3914a59', url: '/symbols/mulberry/operation.svg' },
        { revision: 'f6175456c2731f1763a5deac5a5642f6', url: '/symbols/mulberry/opposite.svg' },
        { revision: 'c79406c3d54af10c11d42aae07f32540', url: '/symbols/mulberry/orange.svg' },
        { revision: 'f478e5bd1ff2242b1355731a2f2eec05', url: '/symbols/mulberry/orange_2.svg' },
        {
          revision: 'ae186df45fe515c690e0352d3eeea834',
          url: '/symbols/mulberry/orange_fizzy_drink.svg',
        },
        { revision: '3c7127442acd2976679192a8a92b3089', url: '/symbols/mulberry/orange_juice.svg' },
        {
          revision: '448381a1cff047bfa8991462adf5443a',
          url: '/symbols/mulberry/orange_squash.svg',
        },
        { revision: 'f4e637cded84971b404c6607ef6b816c', url: '/symbols/mulberry/order_1_,_to.svg' },
        { revision: '1cf9dd570774943cd4d720597e07cd1c', url: '/symbols/mulberry/order_2_,_to.svg' },
        { revision: '297ab1d9bba920acd398d0f7b4eeda39', url: '/symbols/mulberry/ostrich.svg' },
        { revision: 'c86bcd334ee8097791e6796bd0c50d30', url: '/symbols/mulberry/out.svg' },
        { revision: '2cc2a10101b3f3e9ba1969d4c64175cb', url: '/symbols/mulberry/outbox.svg' },
        { revision: 'a25160073cf70b6c79bd8763a60908f2', url: '/symbols/mulberry/outside.svg' },
        { revision: '06e633946a4bc377d5b17a03f7077753', url: '/symbols/mulberry/oval.svg' },
        { revision: '6aa78d2227440035032498803463b78e', url: '/symbols/mulberry/over.svg' },
        { revision: 'ba723511162f7108b4e717371776603d', url: '/symbols/mulberry/owl.svg' },
        { revision: '3cc227f8986b5effe26344df6fc6c353', url: '/symbols/mulberry/oxygen_mask.svg' },
        { revision: '4f65bbdde89f8d7628fd0b8c6ba56376', url: '/symbols/mulberry/oyster.svg' },
        { revision: '02c46c5671d105ad48f1481feb2b89c7', url: '/symbols/mulberry/oyster_2.svg' },
        { revision: '369664eebda02a89b0c1b2e4c10d3460', url: '/symbols/mulberry/ozone_layer.svg' },
        {
          revision: '55f730197196eec8fd87d6d101c2bbc3',
          url: '/symbols/mulberry/p_-_lower_case.svg',
        },
        {
          revision: 'eb3965cc56aaa1232560742e8a7f636f',
          url: '/symbols/mulberry/pack_suitcase_,_to.svg',
        },
        { revision: '57e22814d7d57501ebfd6baae01e052c', url: '/symbols/mulberry/packed_lunch.svg' },
        {
          revision: '1d55d1afd6e5ba389e5d4844717752bd',
          url: '/symbols/mulberry/packed_lunch_2.svg',
        },
        { revision: 'b331d94fa2c01b6f210f0ba1d47dfe1e', url: '/symbols/mulberry/paddles.svg' },
        { revision: '18910096ef51450e996b2a7336ff9863', url: '/symbols/mulberry/paint.svg' },
        { revision: '99f90f2e55cb626ee7d91cb8ed6e0a4d', url: '/symbols/mulberry/paint_,_to.svg' },
        { revision: 'ed9349075796352aee60593760ff4d05', url: '/symbols/mulberry/paint_1_,_to.svg' },
        { revision: '7531558bd364cf3434ce2bf5e39da94b', url: '/symbols/mulberry/paint_2_,_to.svg' },
        { revision: '2bcae08ee6ad4aac8736ca63398775b7', url: '/symbols/mulberry/paint_box.svg' },
        { revision: '871a15273db75075912eaab7af4ab37c', url: '/symbols/mulberry/paint_brush.svg' },
        {
          revision: 'd5deddc2c098b78a8ebe217bfe729547',
          url: '/symbols/mulberry/paint_brush_2.svg',
        },
        { revision: '920cd15642d2f8217f4dd86578c4f377', url: '/symbols/mulberry/paint_childs.svg' },
        { revision: 'da54ebef98729170077af21f6fe3ff1e', url: '/symbols/mulberry/palm.svg' },
        { revision: '2f37fbfea5c54515a2274ff3c2b78c13', url: '/symbols/mulberry/palm_tree.svg' },
        { revision: 'ae73d9922ad2b8864864bd5eaf270369', url: '/symbols/mulberry/pancake_2.svg' },
        { revision: '6e4d7e6f406437726bd573d2e554f473', url: '/symbols/mulberry/pancakes.svg' },
        { revision: '638c3dd92f2083bfd39b5b37fc3d6e74', url: '/symbols/mulberry/panda.svg' },
        { revision: '80994bab3ab25f26abf954bcd0ddd311', url: '/symbols/mulberry/pants.svg' },
        { revision: 'aa4755e0a64f8b3852a16ef674d7ab55', url: '/symbols/mulberry/paper.svg' },
        { revision: '15c60ad0bc5f59b18a71f23452657e04', url: '/symbols/mulberry/paper_towel.svg' },
        { revision: '6fdcaafe8c756b31fb1856ede712e1c5', url: '/symbols/mulberry/paper_towels.svg' },
        { revision: '356f6b043a250c34b5cd82775a1a7596', url: '/symbols/mulberry/paperclip.svg' },
        {
          revision: 'a68940242bdd339bbb6d63300badaa7f',
          url: '/symbols/mulberry/para_olympic_games.svg',
        },
        { revision: '17f433a46cf05c6d45aed655cd718fed', url: '/symbols/mulberry/parachute.svg' },
        { revision: 'b560247463314ed5ad424cf22e715065', url: '/symbols/mulberry/parade_1.svg' },
        { revision: '02e4b8e0dd913344f461fd55fa2937f6', url: '/symbols/mulberry/parade_2.svg' },
        {
          revision: '81d03f0e19244ce4439f68ed76a10c97',
          url: '/symbols/mulberry/parallelogram.svg',
        },
        { revision: 'f34c9a5addcfce51ad97153978f53c4d', url: '/symbols/mulberry/paramedic_1a.svg' },
        { revision: '9e73a6caa04ef5584027099a7472cb13', url: '/symbols/mulberry/paramedic_1b.svg' },
        { revision: '2b59e95a082f2e96047a102065fe6119', url: '/symbols/mulberry/paramedic_2a.svg' },
        { revision: '0b875157243c4e93ad8f3a22ceb8703d', url: '/symbols/mulberry/paramedic_2b.svg' },
        { revision: 'cd5dbea332fc86cdcc59fd2e5e5ab6d4', url: '/symbols/mulberry/parents.svg' },
        { revision: '9b6ce2bfe2d8041efc9078ddcd40ea98', url: '/symbols/mulberry/park_,_to.svg' },
        { revision: '139051e8446fb45a7eb7a63ee881ca1b', url: '/symbols/mulberry/parrot.svg' },
        { revision: '7ffa1134e36c3f240355e90c9340784d', url: '/symbols/mulberry/parsnip.svg' },
        { revision: '24510cc0190d313075185d5e165b33e8', url: '/symbols/mulberry/part.svg' },
        { revision: 'a6dfe720fec1b283a859e46a07be2d56', url: '/symbols/mulberry/partner.svg' },
        {
          revision: 'd0632f53dfb0123d71326f961cc3632e',
          url: '/symbols/mulberry/party_celebration.svg',
        },
        { revision: '548a7c4fc3d07657885347cae924d1dd', url: '/symbols/mulberry/party_popper.svg' },
        {
          revision: 'b10418bbdf00129558029ecd4d7520ac',
          url: '/symbols/mulberry/passion_flower.svg',
        },
        {
          revision: '7884153e299e9ceadb12aed1eeb10f19',
          url: '/symbols/mulberry/passion_fruit.svg',
        },
        { revision: '08fd49a5a30a49e47dab3c64688ad767', url: '/symbols/mulberry/passport.svg' },
        { revision: '920e8c75b91fa9b93a327cc4681051ff', url: '/symbols/mulberry/past.svg' },
        { revision: '114b927459ac0e13201c6ef6fbff55d1', url: '/symbols/mulberry/pasta.svg' },
        { revision: '6974a5a7abc8c4053343c4b438f4f5eb', url: '/symbols/mulberry/pasta_sauce.svg' },
        { revision: '3c3a811bdb10e361c4358e518855b083', url: '/symbols/mulberry/paste.svg' },
        { revision: 'b97710018b6b1f49783502e9cd8b6750', url: '/symbols/mulberry/pastie.svg' },
        { revision: '0e600e655974bbb9126199a11d0677ec', url: '/symbols/mulberry/pastry.svg' },
        { revision: '423b626ade0e8bddc3635d4050c6b789', url: '/symbols/mulberry/pat_dog_,_to.svg' },
        {
          revision: '30e2719951e8b86362137b7bc0ace001',
          url: '/symbols/mulberry/patch_on_clothes.svg',
        },
        { revision: 'e627553ad245f9da2fc08de0727b3c47', url: '/symbols/mulberry/pate.svg' },
        { revision: 'bc3481b3644e3ad8a551d139f95596c6', url: '/symbols/mulberry/paw.svg' },
        { revision: '8eea90d29b531686eaa4653b46eed200', url: '/symbols/mulberry/paw_1.svg' },
        { revision: '90fb530dfddf2529ae396a3547e21562', url: '/symbols/mulberry/pea.svg' },
        { revision: '3ce97b541b8629b4b15c3dfb91101917', url: '/symbols/mulberry/peach.svg' },
        { revision: '2c6f53aa43dafa106f4653ed9bbc084c', url: '/symbols/mulberry/peacock.svg' },
        { revision: '4bb11b26888be825dc008f5adee71d70', url: '/symbols/mulberry/peanut.svg' },
        { revision: '5b3a5bfa6abed3f571240e6ad3aa2009', url: '/symbols/mulberry/peanut_2.svg' },
        {
          revision: 'db81ab3adb953d20df3ce15d5ee10452',
          url: '/symbols/mulberry/peanut_butter.svg',
        },
        { revision: '1916403f6aab12ae0f6f4841c0933724', url: '/symbols/mulberry/pear.svg' },
        { revision: '0f950aef426b894cb16a83267743d99b', url: '/symbols/mulberry/peas.svg' },
        { revision: 'acfc893270006a0b9b2ec110511f47c4', url: '/symbols/mulberry/pecan.svg' },
        { revision: '9bdfa153630c52a4f7c43976ddf644fc', url: '/symbols/mulberry/peel_,_to.svg' },
        {
          revision: 'd410cdd6390f7b7dffa39198e4b6e3d7',
          url: '/symbols/mulberry/peel_orange_,_to.svg',
        },
        { revision: 'a032771af5412decfacc7700d82569bf', url: '/symbols/mulberry/peeler.svg' },
        { revision: '284e174a32a1a98e5ca63b083ff0a6d9', url: '/symbols/mulberry/pelican.svg' },
        { revision: '81bdafa845e5e6453e3882ff73f34096', url: '/symbols/mulberry/pen.svg' },
        {
          revision: 'd276250c3462f20928fbe1ef6b567936',
          url: '/symbols/mulberry/pen_and_paper.svg',
        },
        {
          revision: '35d042afba9177dd34d7f82303372d02',
          url: '/symbols/mulberry/pen_and_paper_2.svg',
        },
        { revision: 'ecfec13db044e23d6077d686bf35e135', url: '/symbols/mulberry/pencil.svg' },
        {
          revision: '97ff127e03ec0f6f62d3ff9f5e05ec87',
          url: '/symbols/mulberry/pencil_and_paper.svg',
        },
        {
          revision: '063e61ec468d34ad08714164ec36f351',
          url: '/symbols/mulberry/pencil_and_paper_2.svg',
        },
        { revision: '723ae42cea11829e609bf4fe1deaaadf', url: '/symbols/mulberry/pencil_box.svg' },
        { revision: '4f5db245b2aff25d6e0b3e90026bf5c9', url: '/symbols/mulberry/pencil_case.svg' },
        {
          revision: 'dd04aec8ed5821809b3c6e6ee38d117f',
          url: '/symbols/mulberry/pencil_sharpener.svg',
        },
        {
          revision: 'b58abefe31ee60b14989027e60c89370',
          url: '/symbols/mulberry/pencil_sharpener_2.svg',
        },
        { revision: '04896f46bd197a278d5561b35234cd7d', url: '/symbols/mulberry/penguin.svg' },
        { revision: 'c5023931728791dba5ce50edfb18da63', url: '/symbols/mulberry/penis.svg' },
        { revision: '6f5514b064709f30a02145221e8fb2c7', url: '/symbols/mulberry/pentagon.svg' },
        { revision: 'b37b3ac118f38902a7ee3db92d30a510', url: '/symbols/mulberry/pepper.svg' },
        { revision: '62e1b13ebaa8ea78aba68b8b7eabc7d6', url: '/symbols/mulberry/pepper_mill.svg' },
        { revision: '30570e3187595db473fe6de9a15ab59c', url: '/symbols/mulberry/percent.svg' },
        { revision: '096cbabff062522dbf2ce22c73e7b242', url: '/symbols/mulberry/perfume.svg' },
        { revision: 'ef1b763a1b2228931dcfcb6672083acd', url: '/symbols/mulberry/perm_,_to.svg' },
        { revision: 'e4cdf8d1e35fcb2c28e21b766076a8f3', url: '/symbols/mulberry/permeable.svg' },
        {
          revision: 'ae4da3a5eca76515fafb68d4e54e7d9f',
          url: '/symbols/mulberry/personal_passport.svg',
        },
        {
          revision: '44f8c1873430cf486adf1bbb1a6fbce4',
          url: '/symbols/mulberry/pestle_and_mortar.svg',
        },
        { revision: '4b22394e5274c5c2959e301b8af95c67', url: '/symbols/mulberry/pet_blanket.svg' },
        { revision: '4e2913e9331de2303529ebc7a935a7d0', url: '/symbols/mulberry/pet_brush.svg' },
        { revision: 'fae5099f5afd12e4a62c5f5efc7bc0be', url: '/symbols/mulberry/pet_carrier.svg' },
        {
          revision: '8ab04712ee5efedc8e85efba0457c7b6',
          url: '/symbols/mulberry/pet_carrying_basket.svg',
        },
        { revision: '6b3ba56e84ab0d482588eadd4f86fe9c', url: '/symbols/mulberry/pet_comb.svg' },
        { revision: 'd0d4bb6b7bcc97627d7ca7fe11c42a89', url: '/symbols/mulberry/petal.svg' },
        {
          revision: '9e7db59a8f75a64824bb8c64b9f54206',
          url: '/symbols/mulberry/petrol_tanker.svg',
        },
        { revision: '148e41fcbd8bd1b403dee37f3c36ccad', url: '/symbols/mulberry/petticoat.svg' },
        {
          revision: '59095e8e15889495d124c482b2502aa8',
          url: '/symbols/mulberry/phone_picture_video.svg',
        },
        { revision: 'b8409d225ee84c4f8f2dde8e39033768', url: '/symbols/mulberry/photocopier.svg' },
        { revision: '6aab5fac1276ea489b57846375e647ab', url: '/symbols/mulberry/photographs.svg' },
        {
          revision: '6d2117604ccec665fcdb4d7e6b03288e',
          url: '/symbols/mulberry/physio_therapist_1a.svg',
        },
        {
          revision: '0d1fc5ee830eba979189ad37873e5cff',
          url: '/symbols/mulberry/physio_therapist_1b.svg',
        },
        {
          revision: '7918df5d29288387391d96fd471a207e',
          url: '/symbols/mulberry/physio_therapist_2a.svg',
        },
        {
          revision: '41044fcdcc463b7e89bc71ce11ce8c9c',
          url: '/symbols/mulberry/physio_therapist_2b.svg',
        },
        { revision: '720dc6c3c458c9665b85740fd06f7e4f', url: '/symbols/mulberry/piano.svg' },
        { revision: '59e694edefe9141ca440f9499bf7174c', url: '/symbols/mulberry/pick_,_to.svg' },
        { revision: 'fbb70688f6999e75a4281e49a5cf9d00', url: '/symbols/mulberry/pick_and_mix.svg' },
        { revision: '8f48b82e5cfc3a6f953d2edae10ea25d', url: '/symbols/mulberry/pick_up_,_to.svg' },
        { revision: '933a28dbf90aca92dc252f6604ef5276', url: '/symbols/mulberry/picnic.svg' },
        { revision: '60d3995791947c1ee5a361c25b1806d4', url: '/symbols/mulberry/picture.svg' },
        {
          revision: '071e0d51a90495ae5ef403faa1c61e12',
          url: '/symbols/mulberry/picture_frame.svg',
        },
        { revision: '1a5d7aef427cda80ca9484c73cc8b8c5', url: '/symbols/mulberry/pie.svg' },
        { revision: 'e0714b75899deca973eca6e478d51e6b', url: '/symbols/mulberry/pie_apple.svg' },
        { revision: '21e80a051d0383aa0d54989642c086d3', url: '/symbols/mulberry/pie_chart.svg' },
        { revision: '0b211f131ffb2f007f563bd1b6b8d0e5', url: '/symbols/mulberry/pie_cherry.svg' },
        { revision: '364e651bbabcb03bc0f0caf853c3b4f9', url: '/symbols/mulberry/pie_meat.svg' },
        { revision: '800472c39f4fb8648f080b39f3f5f4e3', url: '/symbols/mulberry/piglet.svg' },
        { revision: '8918d6bed461b3f9e85ec66528a40ce1', url: '/symbols/mulberry/pilot_1a.svg' },
        { revision: '520d362d6453acaffdc840883da20c4b', url: '/symbols/mulberry/pilot_1b.svg' },
        { revision: '254c738e375dd17e628cadbe34422ad4', url: '/symbols/mulberry/pilot_2a.svg' },
        { revision: 'c7096c6f98875a844bd0465b08f27f1e', url: '/symbols/mulberry/pilot_2b.svg' },
        { revision: 'dae02f56c39777675601414c021bbce5', url: '/symbols/mulberry/pine_cone.svg' },
        { revision: '458781c6efa55073badb5fd710a97996', url: '/symbols/mulberry/pine_nut.svg' },
        { revision: 'b1948ef39f67b5c3d67808e658537331', url: '/symbols/mulberry/pineapple.svg' },
        {
          revision: 'bc31319d60fc6e4fc7350f5cbc6adae9',
          url: '/symbols/mulberry/pineapple_juice.svg',
        },
        { revision: '0408054d54fe10c38a194f28ecb94968', url: '/symbols/mulberry/pink.svg' },
        { revision: 'dabe838e0bb79dda60b667455e0e4138', url: '/symbols/mulberry/pink_bright.svg' },
        { revision: '1cdcfe88ad0ccbf4c26476c70cdc4224', url: '/symbols/mulberry/pink_pale.svg' },
        { revision: 'c5cb0f9ef483ffddca585db94fe32582', url: '/symbols/mulberry/pint.svg' },
        { revision: '9aff0601ebff4000462e41f7184cfca5', url: '/symbols/mulberry/pint_half.svg' },
        { revision: 'e25fc8a4eb5f0aed7e67a48668d20167', url: '/symbols/mulberry/pistachios.svg' },
        { revision: 'c14809855d4974e2c3fdc5a35027a33f', url: '/symbols/mulberry/pizza.svg' },
        { revision: 'd59f92542b688dbe007c71d5ad58a91c', url: '/symbols/mulberry/pizza_2.svg' },
        { revision: '90fb1ec0585553656ad7499825c90b68', url: '/symbols/mulberry/pizza_cutter.svg' },
        { revision: 'b36ffd41014fa7e05fa149e86ffffd56', url: '/symbols/mulberry/place_mat.svg' },
        {
          revision: '645939033794b5e2357a6343ca73a381',
          url: '/symbols/mulberry/place_setting.svg',
        },
        { revision: 'eb08ab6bb814ca0b8de3e3e4401c08e0', url: '/symbols/mulberry/plane.svg' },
        {
          revision: 'ff1b79e693a6c1172088fde8182535d8',
          url: '/symbols/mulberry/plane_landing.svg',
        },
        {
          revision: '438de8926dd9502ffa7469d7fcf8ad5c',
          url: '/symbols/mulberry/plane_take_off.svg',
        },
        { revision: '0bd54db7ab34ff5e659a7708f160661d', url: '/symbols/mulberry/planets.svg' },
        { revision: '1acdfaaded057632192f1afb66678184', url: '/symbols/mulberry/plant.svg' },
        { revision: '98ca21e2315cd4775fe9387334e7e56b', url: '/symbols/mulberry/plant_,_to.svg' },
        { revision: 'd3f846b0173f2b22cdf1317ec293f7f9', url: '/symbols/mulberry/plaster.svg' },
        { revision: '88e725eb2fc93a2e61834a56ab47c360', url: '/symbols/mulberry/plastic.svg' },
        { revision: '1dd736e7f7893d741cc11101a60ab332', url: '/symbols/mulberry/plastic_bag.svg' },
        {
          revision: '66cfafb09ee082207005dbb277c159a7',
          url: '/symbols/mulberry/plastic_pocket.svg',
        },
        { revision: '3d407385409fb523ae7a8c93cb01baa0', url: '/symbols/mulberry/plate.svg' },
        { revision: 'f5f44293015c5eb3afcf028636b4ee6c', url: '/symbols/mulberry/plate_guard.svg' },
        { revision: 'cac53f43c08de55f5b128a75cc69f7fc', url: '/symbols/mulberry/plate_lipped.svg' },
        { revision: 'f03b9138186ff15decdf56ffab0b407d', url: '/symbols/mulberry/play_,_to.svg' },
        { revision: '26b5e12ba470aa303c986438fe28801f', url: '/symbols/mulberry/play_area.svg' },
        { revision: '6778ef8267b36c52ba21a8ad9fbe4fbd', url: '/symbols/mulberry/playdough.svg' },
        {
          revision: '033e07e212f2ab00e63ce7292c3bf8a3',
          url: '/symbols/mulberry/playing_card_picture.svg',
        },
        {
          revision: 'f64f2bb29597bcc9d8fd850821c1e7c2',
          url: '/symbols/mulberry/playing_cards.svg',
        },
        {
          revision: 'f0a303666bc5dc492f500a900345ddf7',
          url: '/symbols/mulberry/playing_cards_clubs.svg',
        },
        {
          revision: '2dc00861f3958a66be2b482ddd085de1',
          url: '/symbols/mulberry/playing_cards_diamonds.svg',
        },
        {
          revision: '5e3ba76664196b56f362c3448f5a6693',
          url: '/symbols/mulberry/playing_cards_hearts.svg',
        },
        {
          revision: 'bf5192df5df8e56eaaef96243790644b',
          url: '/symbols/mulberry/playing_cards_patience.svg',
        },
        {
          revision: 'bd7083b3af19bfb12f551dbad82cb36d',
          url: '/symbols/mulberry/playing_cards_spades.svg',
        },
        { revision: '9cc20e50fff48b670ec572d531cb8d32', url: '/symbols/mulberry/playstation.svg' },
        { revision: '97f849b0aea7bcc282f4367cd7e69c74', url: '/symbols/mulberry/pliers.svg' },
        { revision: 'a1a552222317847f15c1ec33fb689b03', url: '/symbols/mulberry/plough_,_to.svg' },
        { revision: '87fdd447c66c5cc0a3989077b59acbdb', url: '/symbols/mulberry/pluck_,_to.svg' },
        { revision: 'b30c95724a18bc86218acc73ed09ef94', url: '/symbols/mulberry/plug_2.svg' },
        { revision: '29fa0a35980498ccc529d624c40b0d7b', url: '/symbols/mulberry/plum.svg' },
        { revision: '58a7fe5cd0f091ca82ea1bf8d2bf523b', url: '/symbols/mulberry/plum_tomato.svg' },
        { revision: 'ec3c196980f26124ed2d8bf289db217b', url: '/symbols/mulberry/pocket.svg' },
        { revision: '5fdbfa9664a39677943a6af51d0d0e6c', url: '/symbols/mulberry/point_,_to.svg' },
        { revision: 'e29c212b18b242ff311acaa711555156', url: '/symbols/mulberry/pointed.svg' },
        { revision: 'b16a823e97f7fd56a5073462addb5510', url: '/symbols/mulberry/polar_bear.svg' },
        { revision: '911ed9f84e0a834d1797f30b6e79247f', url: '/symbols/mulberry/police_1a.svg' },
        { revision: 'e943710e71a74763a03c7d9c236f0254', url: '/symbols/mulberry/police_1b.svg' },
        { revision: 'be4c718e7254f172d8fcde86fd1a6f8e', url: '/symbols/mulberry/police_car.svg' },
        {
          revision: '79183a94b06cd321bee573807a8ddadd',
          url: '/symbols/mulberry/police_helmet.svg',
        },
        { revision: '1fdafdebb4a97693b56e06dfae558528', url: '/symbols/mulberry/police_radio.svg' },
        {
          revision: 'f308c494f8ca876b185dda07a56bf228',
          url: '/symbols/mulberry/polish_nails_,_to.svg',
        },
        { revision: 'e70edd13102b84a6bd3c74f9411e6f53', url: '/symbols/mulberry/pond.svg' },
        { revision: '9c9dcdd73710a815f59da634440996c9', url: '/symbols/mulberry/pool_hoist.svg' },
        { revision: '05e4f7d8f76f9603bb3bb9479e183554', url: '/symbols/mulberry/pool_snooker.svg' },
        {
          revision: 'b2da5fa306a1b248200b64bb6167fc25',
          url: '/symbols/mulberry/pop_champagne_cork_,_to.svg',
        },
        { revision: '3c9a73189691ae357aeb06cd671bd46d', url: '/symbols/mulberry/pop_socks.svg' },
        { revision: 'e7fd30a330ac5daf83288addda7e679c', url: '/symbols/mulberry/poppadoms.svg' },
        { revision: '4d40ec258050a81a39fbd3c11547b8e6', url: '/symbols/mulberry/porcupine.svg' },
        { revision: 'c873c205c80627ac94ede102f269d316', url: '/symbols/mulberry/pork_chop.svg' },
        { revision: '33a35f8572c62534f9bdc2927b6c55ae', url: '/symbols/mulberry/porridge.svg' },
        {
          revision: 'b90541daadf0033529edfdc533536118',
          url: '/symbols/mulberry/porter_hospital_1a.svg',
        },
        {
          revision: 'e500a80e88cd34b6247f9e3a137da0d9',
          url: '/symbols/mulberry/porter_hospital_1b.svg',
        },
        {
          revision: '24f682b993bf96b3febc2dc504992d40',
          url: '/symbols/mulberry/porter_hospital_2a.svg',
        },
        {
          revision: '20805dc8c060185056f078db4d4a0c4f',
          url: '/symbols/mulberry/porter_hospital_2b.svg',
        },
        { revision: 'cc1f6f6b24b6f6774763cb68dc631ea6', url: '/symbols/mulberry/post-it.svg' },
        {
          revision: '04d4795a04d35832b39e0ffd6b7dc7a0',
          url: '/symbols/mulberry/post_letter_,_to.svg',
        },
        {
          revision: '5245440ecdef9c73c7fab99ef7aa95e6',
          url: '/symbols/mulberry/post_person_1a.svg',
        },
        {
          revision: '93d64d73eb296039102c0a8c9299a8a6',
          url: '/symbols/mulberry/post_person_1b.svg',
        },
        {
          revision: '2107352e62dfbe32da90e69ea5711c16',
          url: '/symbols/mulberry/post_person_2a.svg',
        },
        {
          revision: '7d10452214676f3edec2804450321fdd',
          url: '/symbols/mulberry/post_person_2b.svg',
        },
        { revision: '9a4db4396bfe76b5b8ec23bcc203d265', url: '/symbols/mulberry/post_van.svg' },
        { revision: 'e5be7ab503b18d185aa2e5d322e30fc6', url: '/symbols/mulberry/pot.svg' },
        { revision: '4a3f0d6dcae3e38705c2c78bb1d4cb8d', url: '/symbols/mulberry/pot_noodle.svg' },
        { revision: '8435d8d4d6c6ea422e5224834512e9b0', url: '/symbols/mulberry/potato.svg' },
        { revision: '2fd9fea7fbd95fe55dd14ced9b7471ed', url: '/symbols/mulberry/potted_plant.svg' },
        { revision: 'c4b3e193adfe4693cbdb9725309efda2', url: '/symbols/mulberry/pottery.svg' },
        { revision: 'e244d3ffbbbb2e73678423ba95e5bdfb', url: '/symbols/mulberry/potty_chair.svg' },
        { revision: '4d0349141cfd58352ec4635f6b107ca0', url: '/symbols/mulberry/poultry.svg' },
        { revision: '8dc95f0fadc7afd552d39c5c83be1bce', url: '/symbols/mulberry/pour_,_to.svg' },
        {
          revision: '0cc90d51cf4939f57843877eeb191c1d',
          url: '/symbols/mulberry/pour_cake_mixture_,_to.svg',
        },
        {
          revision: '8d15d2fd14a59f6a924df1a4048f8878',
          url: '/symbols/mulberry/pour_custard_,_to.svg',
        },
        { revision: '6e447a17376e3e97d66ab6caf40c72c5', url: '/symbols/mulberry/powder_puff.svg' },
        { revision: '71ddc6f86477c535e0b4949a0fd62487', url: '/symbols/mulberry/power_switch.svg' },
        { revision: 'f00966f806abd97c7b3d9ff4208e4af6', url: '/symbols/mulberry/prawn.svg' },
        { revision: '1cedcdeb69dfff120937307384a9f26c', url: '/symbols/mulberry/pray_,_to.svg' },
        { revision: '7c825490b0d4e9ace1f9de542aab9fd4', url: '/symbols/mulberry/pray_2_,_to.svg' },
        { revision: '9255d65fc5f8ffbdf23006363b9ea393', url: '/symbols/mulberry/prayer.svg' },
        { revision: '7fbec2c5f1c1313aa6cf31bf37b492b6', url: '/symbols/mulberry/present.svg' },
        {
          revision: '1baac48d42777d29a0203e4f21054897',
          url: '/symbols/mulberry/press_button_,_to.svg',
        },
        { revision: '26508a63dbe639a11acc5889773212ec', url: '/symbols/mulberry/pretty.svg' },
        { revision: 'b13d56d8907103c3ce87117069a0607b', url: '/symbols/mulberry/pretzel.svg' },
        { revision: '5f6242e7ff46e12f82eebcee625da9d2', url: '/symbols/mulberry/prickles.svg' },
        { revision: '62d9d3962f6d5571de17aa576ba5710c', url: '/symbols/mulberry/print.svg' },
        {
          revision: 'b80ccd0956d35063e9bd24e92a6386bc',
          url: '/symbols/mulberry/print_preview.svg',
        },
        { revision: '6a2ab2c41b9a9097599f50feab4df7ab', url: '/symbols/mulberry/printer.svg' },
        {
          revision: '048edc36bba5d194bd97fa4bcb46a6c0',
          url: '/symbols/mulberry/prism_hexagonal.svg',
        },
        {
          revision: '9784d493f8b82bfe636a074aa1d1144e',
          url: '/symbols/mulberry/prism_triangular.svg',
        },
        { revision: '6b232788ac5099fc96005c1b281e5ee5', url: '/symbols/mulberry/prop_up_,_to.svg' },
        { revision: 'ccdcca3cd513b96bd98ad441bc08428d', url: '/symbols/mulberry/protect_,_to.svg' },
        { revision: 'f78019028c6aee26f028a7e517f7d702', url: '/symbols/mulberry/protein.svg' },
        { revision: 'e09ad93c39d6c5108967950284ccb49f', url: '/symbols/mulberry/puffin.svg' },
        { revision: '42f6cbc1ead4bced33f26876cd8e2e03', url: '/symbols/mulberry/pull_,_to.svg' },
        { revision: 'd9d9dba62a35ac2486e5a3454fde1e7f', url: '/symbols/mulberry/pull_2_,_to.svg' },
        {
          revision: '67805c5bfe51e1d2e1cc0bdf748273ac',
          url: '/symbols/mulberry/pull_along_toy.svg',
        },
        { revision: '3b883d32add9acbba7169a9c3a27b9dd', url: '/symbols/mulberry/pumice_stone.svg' },
        { revision: '92419f0d81216fed775868dcc0be57d9', url: '/symbols/mulberry/pumpkin.svg' },
        {
          revision: '873076df44e79b244e5c00b38ecb8ef4',
          url: '/symbols/mulberry/pumpkin_lantern.svg',
        },
        { revision: '05da327db70db99dd2208b3a4b47f7d3', url: '/symbols/mulberry/pumpkin_pie.svg' },
        { revision: '673632089c346cb1732c600e3ba1d852', url: '/symbols/mulberry/pupil.svg' },
        { revision: '4f090c90a1e0e5adb9a7bf69869acae1', url: '/symbols/mulberry/puppet.svg' },
        { revision: '9b60c883bfb73c619272b9fcfbec4547', url: '/symbols/mulberry/pureed_food.svg' },
        {
          revision: '2d86f9f47ffb658584064d922016cdf8',
          url: '/symbols/mulberry/pureed_food_2.svg',
        },
        { revision: '3c1c19a18ad62e9960a0a2ee786d4207', url: '/symbols/mulberry/purple.svg' },
        { revision: '97fcbc88b3b058ea90198b407df95219', url: '/symbols/mulberry/purse.svg' },
        { revision: 'ed70a32efc4a07a4bb023298dec99504', url: '/symbols/mulberry/push_,_to.svg' },
        { revision: 'e001a28dd1d7a43e6646349516b93d33', url: '/symbols/mulberry/push_2_,_to.svg' },
        {
          revision: 'd9bef90f87d231a2e087fb273342e367',
          url: '/symbols/mulberry/push_down_,_to.svg',
        },
        { revision: '8e468a3123d8582afe2b3a73d0374829', url: '/symbols/mulberry/put_,_to.svg' },
        {
          revision: '81b4ad38eae8cd51ba24fe2e1998d36c',
          url: '/symbols/mulberry/put_away_,_to.svg',
        },
        { revision: '50c6f6b26ba6612ebaa297e5263a445a', url: '/symbols/mulberry/put_in_,_to.svg' },
        {
          revision: '0606a6f873839951faf0a80894055791',
          url: '/symbols/mulberry/put_in_bin_,_to.svg',
        },
        {
          revision: '47edd7bdbd5f537db0d6e24721a999c6',
          url: '/symbols/mulberry/put_in_cassette_tape_,_to.svg',
        },
        {
          revision: '3acb33be409b3c237e2ea0a7ce0e4a6a',
          url: '/symbols/mulberry/put_in_cd_dvd_,_to.svg',
        },
        {
          revision: 'c39f66da0b418e56b50fcc91600294ee',
          url: '/symbols/mulberry/put_in_contact_lens_,_to.svg',
        },
        {
          revision: '985e462161ffe7d7e404929937679e3c',
          url: '/symbols/mulberry/put_on_cap_,_to.svg',
        },
        {
          revision: 'e0629b01dcb118ba1269850a18f0a2ad',
          url: '/symbols/mulberry/put_on_coat_,_to.svg',
        },
        {
          revision: '4051ca46f7910e5969d4857e07e345bd',
          url: '/symbols/mulberry/put_on_helmet_,_to.svg',
        },
        {
          revision: 'c4fa816983ee85db59a2dd38520c4c67',
          url: '/symbols/mulberry/put_on_lid_,_to.svg',
        },
        {
          revision: '42bbed615a6a022cf60ec390b845ef91',
          url: '/symbols/mulberry/put_out_rubbish_,_to.svg',
        },
        { revision: '6d47afc89666b1050801e50fc343d8c4', url: '/symbols/mulberry/pyjamas.svg' },
        {
          revision: '225ad469e56737dbff0f76fa95c66024',
          url: '/symbols/mulberry/pyramid_square_base.svg',
        },
        {
          revision: 'fcc39a2b3830d3b8ebad19ee62f83430',
          url: '/symbols/mulberry/pyramid_triangular_base.svg',
        },
        {
          revision: '6059864e40f593f370fa1ae936791ef9',
          url: '/symbols/mulberry/q_-_lower_case.svg',
        },
        {
          revision: '62382948134c4c81e95960e50f188adc',
          url: '/symbols/mulberry/quadrilateral.svg',
        },
        { revision: '5e63f96db56bbcbeb777144359286415', url: '/symbols/mulberry/quail.svg' },
        { revision: '07d3ac6f4ef3a424cac3d374863b1e2a', url: '/symbols/mulberry/quarter.svg' },
        { revision: '405740cb789cec0cc9e3dde1b8a0c630', url: '/symbols/mulberry/queue_,_to.svg' },
        { revision: '96ac30a409c9ab16c8a31b9462f0d7a1', url: '/symbols/mulberry/quiche_flan.svg' },
        { revision: '89b39c49bf28183386c7f65df7ecf64a', url: '/symbols/mulberry/quiet.svg' },
        {
          revision: 'a51482b5c3693d5ab4ea70dfea0b62c9',
          url: '/symbols/mulberry/r_-_lower_case.svg',
        },
        { revision: 'd4efe98091dc5c9222297559c27dbce3', url: '/symbols/mulberry/rabbit.svg' },
        { revision: '170f71974e915365d1bf8d8bb7d86b84', url: '/symbols/mulberry/rabbit_hutch.svg' },
        {
          revision: '96171a71c0806f8218bcf337b4a46398',
          url: '/symbols/mulberry/race_athletics.svg',
        },
        { revision: '5e39e0e5cf12402bccedf7c55418baa0', url: '/symbols/mulberry/radish.svg' },
        { revision: 'e7363ce8ac4d24da82203eef70aa8306', url: '/symbols/mulberry/rain.svg' },
        { revision: '9c5fd78c7e4b87e39115176b4198e521', url: '/symbols/mulberry/rainbow.svg' },
        { revision: '65e810f467262f5f5a167118f7c3c6e5', url: '/symbols/mulberry/raincoat.svg' },
        {
          revision: '1f0b53d9b664006710b800c526b4a7b5',
          url: '/symbols/mulberry/raise_feet_,_to.svg',
        },
        {
          revision: '56e041f6f6cc0ab3651292f41f5c8232',
          url: '/symbols/mulberry/raise_head_,_to.svg',
        },
        { revision: 'b87dff4cb4f1eaf18363aa865e18a9f3', url: '/symbols/mulberry/raisin.svg' },
        {
          revision: 'a2b39f48c1ad46f129d31f39cda78f74',
          url: '/symbols/mulberry/raisin_currants.svg',
        },
        { revision: '340cffab04478f5f8000c40bb93fd9d2', url: '/symbols/mulberry/rake.svg' },
        { revision: '4ef76f2da39cb56c45b9def6df902950', url: '/symbols/mulberry/rake_2_,_to.svg' },
        { revision: '05b35f01331b801e0edf7c749fe67ecd', url: '/symbols/mulberry/ram.svg' },
        { revision: '7afd1c7a937c8394c736e090375b46a4', url: '/symbols/mulberry/ramp.svg' },
        { revision: '8713dda725c2ea2501cc96befa364601', url: '/symbols/mulberry/rash.svg' },
        { revision: 'a8d02ac557601b406fc13c06be8a6241', url: '/symbols/mulberry/rat.svg' },
        { revision: '474b5874d254c39eb7832ec96cb549ba', url: '/symbols/mulberry/rattle_snake.svg' },
        { revision: '344bb346062f51c55a9bfea812db4f9f', url: '/symbols/mulberry/ravioli.svg' },
        { revision: 'c827fe6c279d0543858cd1b8a22e351b', url: '/symbols/mulberry/razor.svg' },
        {
          revision: 'f33448f90927a026ce491f8752bcc25a',
          url: '/symbols/mulberry/razor_electric.svg',
        },
        {
          revision: '51ff5f1e64ec08724c7031d0bfd2a5cc',
          url: '/symbols/mulberry/reach_for_,_to.svg',
        },
        { revision: 'bf2233194ef6468ed2c64454ede6159f', url: '/symbols/mulberry/read_,_to.svg' },
        { revision: 'ab7fb8c8c04c0f9a75ae406dd71a426a', url: '/symbols/mulberry/read_2_,_to.svg' },
        { revision: '83b53bc24ca7239de8e3830034562b6d', url: '/symbols/mulberry/read_3_,_to.svg' },
        {
          revision: 'ef215e7472698b4622075597172cf149',
          url: '/symbols/mulberry/read_book_,_to.svg',
        },
        { revision: '0621d31f092f7e9e8719366a14782b7c', url: '/symbols/mulberry/ready.svg' },
        { revision: 'e59c2fc663e4741a127f97452d34be1d', url: '/symbols/mulberry/ready_2.svg' },
        { revision: '2b00c77f1ec38dee2f26c4f16a241534', url: '/symbols/mulberry/ready_meal.svg' },
        {
          revision: 'ad1e8da041deaecd5dd04cff09183115',
          url: '/symbols/mulberry/ready_meal_lamb.svg',
        },
        { revision: '84ea307d96f27a3196bf84bbeef5bc7c', url: '/symbols/mulberry/receive_,_to.svg' },
        {
          revision: '59d9ae607354145d78aab99a86a8591d',
          url: '/symbols/mulberry/receive_email_,_to.svg',
        },
        { revision: 'a5a10a809a7e86e5bbb26b2f8742b5c5', url: '/symbols/mulberry/recipe.svg' },
        { revision: '21128ed760f0b4b79ed0cabeb8ac36fb', url: '/symbols/mulberry/rectangle.svg' },
        { revision: '2e2201f5e4c00e8b8394f3d7a72f6954', url: '/symbols/mulberry/recycle_bin.svg' },
        { revision: 'f68ad1ba47eee9634237a3f6621a713f', url: '/symbols/mulberry/recycle_logo.svg' },
        {
          revision: 'f3602de842ac64c75b6e7b1ef699dbdd',
          url: '/symbols/mulberry/recycling_bins.svg',
        },
        { revision: 'b9602c28bbe80b217886e5d9da8c7dc7', url: '/symbols/mulberry/red.svg' },
        {
          revision: 'cde995c01b43b68e48dafae224059b1d',
          url: '/symbols/mulberry/refridgerate_,_to.svg',
        },
        {
          revision: '93054d014d2ae5f7ac6f33f9d2082b3e',
          url: '/symbols/mulberry/refuse_collector_1a.svg',
        },
        {
          revision: 'a22a1f1f74994c0e86b19a92e1b32269',
          url: '/symbols/mulberry/refuse_collector_1b.svg',
        },
        {
          revision: '3f6ebeaf3c4aa8028546c9a8742cc337',
          url: '/symbols/mulberry/refuse_collector_2a.svg',
        },
        {
          revision: 'db328b8bafa61d0b880e69a23c8c4063',
          url: '/symbols/mulberry/refuse_collector_2b.svg',
        },
        { revision: '6e3596340d22d5d0b604a426834dba41', url: '/symbols/mulberry/refuse_lorry.svg' },
        { revision: '72d62d97c38902de5630b90218c05906', url: '/symbols/mulberry/reindeer.svg' },
        { revision: '931c23d2cdca491829b16e4f01a00e8c', url: '/symbols/mulberry/relax_,_to.svg' },
        { revision: '438ce67381b9bba552c2cc2e3892a255', url: '/symbols/mulberry/relax_2_,_to.svg' },
        { revision: 'f2a5e0b290843bfd61c8438c37b3146b', url: '/symbols/mulberry/relax_3_,_to.svg' },
        {
          revision: 'c6254f795d9a8fc71705ced7b461100e',
          url: '/symbols/mulberry/remote_control.svg',
        },
        { revision: '27556215b0301360852daaa3c90e48b4', url: '/symbols/mulberry/remove_,_to.svg' },
        { revision: '43901fb9eaf6c78367e7ba29285e66a8', url: '/symbols/mulberry/rest_,_to.svg' },
        { revision: 'f6c56bbe04663c617ec9df3c4eeb5cf1', url: '/symbols/mulberry/retire_,_to.svg' },
        { revision: 'f8f7c1babc10282d6225bcb42d9b49d9', url: '/symbols/mulberry/retired.svg' },
        { revision: '48b4b7fee693f4a8ee8a3033e88ae11a', url: '/symbols/mulberry/return_,_to.svg' },
        {
          revision: '33fc26e905b360b7b9e36f68bcc92035',
          url: '/symbols/mulberry/return_book_,_to.svg',
        },
        { revision: '4cf1fa03b1c33937839f17354c18f6a6', url: '/symbols/mulberry/rewind.svg' },
        { revision: 'aa9b53472f12d08052d4d05f0589b806', url: '/symbols/mulberry/rhinoceros.svg' },
        { revision: 'd47b974d83849903f9ea187f06b99410', url: '/symbols/mulberry/rhombus.svg' },
        { revision: '87b6782d7b50af2dd3733cb8ed9c4685', url: '/symbols/mulberry/rhubarb.svg' },
        { revision: '19318a3db317e813ba6a66237b5ef22d', url: '/symbols/mulberry/ribbon.svg' },
        { revision: 'e86cceda35256da50afe18ed345ab371', url: '/symbols/mulberry/rice.svg' },
        { revision: '0ab0f6080ceddd955df6e693b070019f', url: '/symbols/mulberry/rice_cake.svg' },
        { revision: '2fbd31683479d37deff3aaed5af25657', url: '/symbols/mulberry/rice_packet.svg' },
        {
          revision: 'ec2d514cd76270562c347a6a1e51d4d7',
          url: '/symbols/mulberry/ride_car_,_to.svg',
        },
        {
          revision: '277a5197a606d96699280318ee4a07e3',
          url: '/symbols/mulberry/ride_horse_,_to.svg',
        },
        { revision: 'a0437774ab588705c8f5e8ec11ef49f1', url: '/symbols/mulberry/riding_hat.svg' },
        { revision: 'e8c851263c0695e904f2d3a44839d665', url: '/symbols/mulberry/rifle.svg' },
        { revision: '467b84ad5d32b9309e6c6fb3fb041e1a', url: '/symbols/mulberry/right.svg' },
        { revision: 'd9cc2e5110009e2a39d8bc28cbe39bc4', url: '/symbols/mulberry/right_click.svg' },
        { revision: '91db181edd5e2813e25a63b03f3cc7d0', url: '/symbols/mulberry/right_hand.svg' },
        { revision: 'cca3b7603f01f14466871f9d0ac09d94', url: '/symbols/mulberry/ring.svg' },
        {
          revision: '1504c32420aaa70efa62932a8aae01ba',
          url: '/symbols/mulberry/ring_bell_,_to.svg',
        },
        { revision: '31f80c263282dec9b783ff3d47169255', url: '/symbols/mulberry/ring_binder.svg' },
        {
          revision: 'e37bba30d937d8974ec7366cbda256d0',
          url: '/symbols/mulberry/ring_doorbell_,_to.svg',
        },
        { revision: '18a13ceb018bf6174077baccea272dca', url: '/symbols/mulberry/rinse_,_to.svg' },
        { revision: '096a709a8275c6fe2f3d985cb0966b80', url: '/symbols/mulberry/risen.svg' },
        { revision: '29b96eddf46c28ce1ad39523772692ea', url: '/symbols/mulberry/road.svg' },
        { revision: '49b2a3ccc6543665894c09d5cf5b7539', url: '/symbols/mulberry/roast_dinner.svg' },
        { revision: '38109491a4f28ec01f32752e2f2f2eec', url: '/symbols/mulberry/robin.svg' },
        {
          revision: 'ae09cbc92e74cc9a093e2726e70839e4',
          url: '/symbols/mulberry/rock_chair_,_to.svg',
        },
        { revision: '70d7f46e8590010f7c5792c0f3027fdb', url: '/symbols/mulberry/rocket.svg' },
        { revision: 'c4acdceb6feda045dff8b7ff126f5c50', url: '/symbols/mulberry/rocket_2.svg' },
        {
          revision: '0b596574bfc1b3f6902d518d0e3220b6',
          url: '/symbols/mulberry/rocking_chair.svg',
        },
        {
          revision: 'ab0e0ad8e40baa0f5603b013bfba55f2',
          url: '/symbols/mulberry/roll_dice_,_to.svg',
        },
        {
          revision: '92ebb0654d21c58e6d1acefcc4373ceb',
          url: '/symbols/mulberry/roll_on_deodorant.svg',
        },
        {
          revision: '6f07e903cc9c7554a4d8bab5dd6f260a',
          url: '/symbols/mulberry/roll_over_,_to.svg',
        },
        {
          revision: '5329efc29ea940ad7a392e4a4b6640ff',
          url: '/symbols/mulberry/roll_pastry_,_to.svg',
        },
        { revision: 'fc01731eb042b29d5298b96c26a6bcb9', url: '/symbols/mulberry/roller_blind.svg' },
        {
          revision: 'ff5f13996ee5b745c04148cbf1aa8e32',
          url: '/symbols/mulberry/roller_coaster.svg',
        },
        {
          revision: '21f27adf9254732b821faae0c32cc20a',
          url: '/symbols/mulberry/rollerskate_,_to.svg',
        },
        { revision: '195bff047268f7d9323eed2d174aad2b', url: '/symbols/mulberry/rolling_pin.svg' },
        { revision: '36af9f3b86c253e580eac67e1436f688', url: '/symbols/mulberry/roman_blind.svg' },
        { revision: '7577ee59993f44c5a5e1fed1510bb3bb', url: '/symbols/mulberry/room.svg' },
        { revision: '35aebd50bcd57f9c72466722b0fe34ad', url: '/symbols/mulberry/roots.svg' },
        { revision: '9e759533de70c54b3c102587e39f0d75', url: '/symbols/mulberry/rose.svg' },
        { revision: 'd81402711e9073f35902f9db0b9634cc', url: '/symbols/mulberry/rosette.svg' },
        {
          revision: '1bdc21b21edc37283c416d103fc7eff4',
          url: '/symbols/mulberry/rotary_washing_line.svg',
        },
        { revision: 'd41e20e7df23514b1e04e0457337aaca', url: '/symbols/mulberry/rowing_boat.svg' },
        { revision: 'f22a9ffae3e52ea802792d2c5da4729d', url: '/symbols/mulberry/rub_,_to.svg' },
        { revision: 'fb18090c1cf9ce901cb6ddf03bafa0e1', url: '/symbols/mulberry/rug.svg' },
        { revision: '12879c70ce8d2bc3d2e6fbb04e13f0ac', url: '/symbols/mulberry/rugby_ball.svg' },
        { revision: 'f53eea2ec413c7a4c4086aa038023ac6', url: '/symbols/mulberry/run_,_to.svg' },
        {
          revision: '2ebe83305e82fb3edcc699c487d06f35',
          url: '/symbols/mulberry/s_-_lower_case.svg',
        },
        { revision: '9a32328765260fc287d13c89e3e4f949', url: '/symbols/mulberry/sack.svg' },
        { revision: '40956081f68ae12bb1448bea6fd69515', url: '/symbols/mulberry/sad_lady.svg' },
        { revision: 'd404b71d182ad2a33458554be1d9f98c', url: '/symbols/mulberry/sad_man.svg' },
        { revision: '6ad1267c8a69ad644a616faa68f6cdfd', url: '/symbols/mulberry/saddle.svg' },
        { revision: '7891a3ca02518e7a7f09a77400ac833d', url: '/symbols/mulberry/saddle_2.svg' },
        {
          revision: 'c29c6e9b69e69c3cf4f66fa869f51179',
          url: '/symbols/mulberry/safety_goggles.svg',
        },
        { revision: '55fd99a6a3bb093aeeae4fe217764793', url: '/symbols/mulberry/safety_pin.svg' },
        { revision: '2a224ee6ed0ef83bd25052b1fb19b3b7', url: '/symbols/mulberry/sailor_1a.svg' },
        { revision: '0cb3b6291e9ae4e86f7add4be4977e07', url: '/symbols/mulberry/sailor_1b.svg' },
        { revision: 'e9459b2de4369f6461f96c74d87b7ec6', url: '/symbols/mulberry/salad.svg' },
        { revision: 'c07ce0f5899c46edee3a243e01576a4a', url: '/symbols/mulberry/salad_packet.svg' },
        { revision: '38b6d2a3eeac2c61f3296548489256ea', url: '/symbols/mulberry/salad_plate.svg' },
        {
          revision: 'aa5207eae4d46c1a7265cc25a169f6e0',
          url: '/symbols/mulberry/salami_sausage.svg',
        },
        { revision: 'd96636e3f4e83b4eae94f00d94ada4ae', url: '/symbols/mulberry/salt.svg' },
        { revision: '56ceb9848f39be6fa6e5278d6f67257e', url: '/symbols/mulberry/salt_,_to.svg' },
        { revision: '2e4d3dbc5399ad53025f2028e9bb9428', url: '/symbols/mulberry/salty.svg' },
        { revision: '524d40d8ac76a62b3c10123996f96cb2', url: '/symbols/mulberry/same.svg' },
        { revision: '36ed83b719e87fb9a7daeb1335db20fd', url: '/symbols/mulberry/sand_pit.svg' },
        { revision: '5721c91a4363b9eb787b21e14704966e', url: '/symbols/mulberry/sandals.svg' },
        { revision: '331b23eef1f16276da6cd1d022e0eca4', url: '/symbols/mulberry/sandpaper.svg' },
        { revision: '9234bef0ff76e5ce04ab58e89351b9be', url: '/symbols/mulberry/sandwich.svg' },
        {
          revision: 'f11f6e73fffd029f8f06e48f67e25e1a',
          url: '/symbols/mulberry/sandwich_cheese.svg',
        },
        {
          revision: '779c2b2f48481fa7d7b5a49063ce2753',
          url: '/symbols/mulberry/sandwich_chicken.svg',
        },
        { revision: '5499e2b6aab9241078571af77302c7b3', url: '/symbols/mulberry/sandwich_ham.svg' },
        {
          revision: 'd9902604c23bc103587d684e0e55018b',
          url: '/symbols/mulberry/sandwich_sausage.svg',
        },
        {
          revision: '6d6fe81de2bf8822d210269e859096da',
          url: '/symbols/mulberry/sandwich_toasted.svg',
        },
        {
          revision: '85ee02a8f18e518f672f6b22ba4ff6fa',
          url: '/symbols/mulberry/sanitary_towel.svg',
        },
        { revision: 'a851085f68f6a651de550ab8bfc07e24', url: '/symbols/mulberry/satellite.svg' },
        { revision: '794bea6c5dd30c71a1c2ba372e802228', url: '/symbols/mulberry/satsuma.svg' },
        { revision: '7f5b016939257516882578f3c8317e9c', url: '/symbols/mulberry/sauce_apple.svg' },
        { revision: 'd8350a6e0053b1a9b3ca8d96c31db42b', url: '/symbols/mulberry/sauce_brown.svg' },
        {
          revision: '3082fd06ab4c7da0a040b6126f8bd76d',
          url: '/symbols/mulberry/sauce_cranberry.svg',
        },
        { revision: '35cd92e019e0c830216daad99a96f32d', url: '/symbols/mulberry/sauce_tomato.svg' },
        { revision: '9722af628810001a2a5cdcf2be68a699', url: '/symbols/mulberry/saucepan.svg' },
        { revision: '7a3670b562ad2811948b5709181610bd', url: '/symbols/mulberry/saucer.svg' },
        {
          revision: 'dea5339ef5fdf38a119f869aa7957f30',
          url: '/symbols/mulberry/sausage_and_mash.svg',
        },
        {
          revision: '8eb96786019a62065a8491ee4e97b023',
          url: '/symbols/mulberry/sausage_cumberland.svg',
        },
        { revision: '4abb220cc96aa5097cddd5957d82ef90', url: '/symbols/mulberry/sausage_roll.svg' },
        {
          revision: '4dc6fe60846d3d20c566f3336e4d198c',
          url: '/symbols/mulberry/sausage_roll_small.svg',
        },
        { revision: 'a4bde7929c2a35754abac8711b787154', url: '/symbols/mulberry/sausages.svg' },
        { revision: '504a8806c86e211f24cfd856c89cbace', url: '/symbols/mulberry/sausages_2.svg' },
        { revision: 'bfac36f8a7ad942d2f90ed39ab0523e2', url: '/symbols/mulberry/save.svg' },
        { revision: '7ba380b6003791ee3a3bc243e3e04c14', url: '/symbols/mulberry/saw.svg' },
        { revision: 'cb48733291ff9cb907f6e25adad8be49', url: '/symbols/mulberry/scales.svg' },
        { revision: '8e1dd3806aaabe0e7a854ac2982d414c', url: '/symbols/mulberry/scales_2.svg' },
        { revision: 'c177cb96690301249609d46667a8cf1b', url: '/symbols/mulberry/scales_fish.svg' },
        { revision: '6a89f0f59033fbd946fbadf72ee39abf', url: '/symbols/mulberry/scanning.svg' },
        { revision: '236141988d65fa666a4ca87d8c4940c1', url: '/symbols/mulberry/scar.svg' },
        { revision: 'fe23206134cd281f289f44456b566fee', url: '/symbols/mulberry/scarecrow.svg' },
        { revision: '256f99068b41023abf34fbe462c3d7e7', url: '/symbols/mulberry/scarf.svg' },
        { revision: '459fd32cad19e7bca35f36c46944d8ef', url: '/symbols/mulberry/scary.svg' },
        { revision: '40b91cfcd2cf7942839d1b8fd6087748', url: '/symbols/mulberry/school.svg' },
        { revision: '747d45203899334423d4fd27317f0723', url: '/symbols/mulberry/school_1.svg' },
        { revision: '9adc6a81f47f3628b9145f1081ab5937', url: '/symbols/mulberry/school_bag.svg' },
        { revision: '639c28ed55567e42c3c1c9268a0e9c62', url: '/symbols/mulberry/science.svg' },
        {
          revision: 'b82919ae7cc8c99bf38bbd7c98037409',
          url: '/symbols/mulberry/science_class.svg',
        },
        { revision: '5ccb4dd0068781c178e7ffc6686a930e', url: '/symbols/mulberry/science_room.svg' },
        { revision: '8f23c56bf6bdd8adeb05920878aa0e77', url: '/symbols/mulberry/scissors.svg' },
        { revision: 'd150660f1d6a559330198876fd644af8', url: '/symbols/mulberry/scoop.svg' },
        { revision: '841250dc11865f961239ca0b2c8736c3', url: '/symbols/mulberry/scoop_,_to.svg' },
        {
          revision: 'b40880f10c5c133ca15f36a4577fe9b9',
          url: '/symbols/mulberry/score_goal_,_to.svg',
        },
        { revision: '75680bc4f403aa5bcd1fb57cfe73b383', url: '/symbols/mulberry/screw.svg' },
        { revision: 'a3c13df9cd596e8ed314b5a65e59760b', url: '/symbols/mulberry/screwdriver.svg' },
        { revision: 'b1b5fcf69758bff8fc9334bd3b7649fa', url: '/symbols/mulberry/scrub_,_to.svg' },
        {
          revision: 'a733181c7c0c104c35fd5421e0c01275',
          url: '/symbols/mulberry/scrubbing_brush.svg',
        },
        { revision: '863e71a36dbba58cac92db40436c676f', url: '/symbols/mulberry/seagull.svg' },
        { revision: '92cd1dfff00a3fe546c799bbd88e5485', url: '/symbols/mulberry/seahorse.svg' },
        { revision: 'f33b261599cb69836a84ffe7420b2f62', url: '/symbols/mulberry/seal.svg' },
        {
          revision: '6fff5d4f49d667e07bef2a2e27e2b24c',
          url: '/symbols/mulberry/seal_envelope_,_to.svg',
        },
        { revision: 'd4059a017a211069ec5953f31e983962', url: '/symbols/mulberry/seat_belt.svg' },
        { revision: '1f18201c7242f3dbe98c194c1805263b', url: '/symbols/mulberry/second.svg' },
        { revision: 'ea8b8c26c405e38037acbe4ec10ec904', url: '/symbols/mulberry/second_3.svg' },
        { revision: '56aa18ccb35c04a835e3790be26605f6', url: '/symbols/mulberry/secretary_1a.svg' },
        { revision: '4e1d52dc874acd74e5994ae2568c5092', url: '/symbols/mulberry/secretary_1b.svg' },
        { revision: 'd2c766e3281b7bf023e858e83c7ac246', url: '/symbols/mulberry/secretary_2a.svg' },
        { revision: 'd27e451d10fd68a8710f72002c795f12', url: '/symbols/mulberry/secretary_2b.svg' },
        { revision: 'dde0681817a77495a49667fe396a48c8', url: '/symbols/mulberry/see_saw.svg' },
        { revision: '9ae016cae1fbbc719d31c1a1c8b219d9', url: '/symbols/mulberry/seedling.svg' },
        { revision: '59787019bae4fb656a4bf66284147c86', url: '/symbols/mulberry/seeds.svg' },
        { revision: '3fec95d192d503d9d0f84a6ddca1703c', url: '/symbols/mulberry/seizure.svg' },
        { revision: '32ad6d4b587307ee4189d669a3d9e9ac', url: '/symbols/mulberry/senses.svg' },
        { revision: 'f39ea71a24c89fad168dc78861c85ef8', url: '/symbols/mulberry/sensory_room.svg' },
        { revision: '426fc0b305155117e6850995ad76c0a5', url: '/symbols/mulberry/sensory_tube.svg' },
        {
          revision: '07db3c825dda6724aea3a60544045337',
          url: '/symbols/mulberry/separate_,_to.svg',
        },
        { revision: '9f79e5b8c3754b0d73f67f598b140cae', url: '/symbols/mulberry/serene_lady.svg' },
        { revision: 'b6dd0de353abeeea48119907bb62b4c6', url: '/symbols/mulberry/serene_man.svg' },
        { revision: '0457fb18db28e434effa99c6873bb53a', url: '/symbols/mulberry/serve_,_to.svg' },
        { revision: '96b30f2a9d33209075c7b3eccd4206e6', url: '/symbols/mulberry/serve_2_,_to.svg' },
        { revision: '4cecc9e0fe01cb335ecce6202722ca2e', url: '/symbols/mulberry/serviette.svg' },
        {
          revision: '71b7189218e43a4d3e5c683eb916e3ec',
          url: '/symbols/mulberry/set_table_,_to.svg',
        },
        {
          revision: '6f7be3037ffbe1ba2f7af0230c474c22',
          url: '/symbols/mulberry/set_the_table_,_to.svg',
        },
        {
          revision: '7a65414d920d9cb5af86c08773cc3f5f',
          url: '/symbols/mulberry/set_timer_,_to.svg',
        },
        { revision: '86a623489c8748e47e5ac97c9330bcde', url: '/symbols/mulberry/settee_1.svg' },
        { revision: '34bc3151d15bed7018b8715b2ee86b24', url: '/symbols/mulberry/settee_2.svg' },
        { revision: 'd504c9f30366e81451fc81269650c54e', url: '/symbols/mulberry/seven.svg' },
        { revision: 'cb7b1118f713e97f5ec1959f4c41e87a', url: '/symbols/mulberry/seven_dots.svg' },
        { revision: '4bca062446c157ac79fb939fa54acda0', url: '/symbols/mulberry/seventeen.svg' },
        { revision: '98d257194f8da61c8de21e77ab168925', url: '/symbols/mulberry/seventy.svg' },
        {
          revision: 'cfd3abd71a843a16f136a747c3a183f7',
          url: '/symbols/mulberry/seventy_five_percent.svg',
        },
        { revision: 'ca9896ae8cc7a95466ff5a9d6f96b1e4', url: '/symbols/mulberry/sew_,_to.svg' },
        { revision: 'cd6670fbd185027bdcab3163df1b2cc5', url: '/symbols/mulberry/shake_,_to.svg' },
        {
          revision: '4a6fbe2ac30584b3173db5c3d9d1b998',
          url: '/symbols/mulberry/shake_hands_,_to.svg',
        },
        {
          revision: '8afcd62ec99cc4147a9c124a99d12b98',
          url: '/symbols/mulberry/shake_something_,_to.svg',
        },
        { revision: '2243503b4fbcf5ff9b73b8c9c989030b', url: '/symbols/mulberry/shallow.svg' },
        { revision: '35b844242a8abbebc639c3e54c00e0a9', url: '/symbols/mulberry/shampoo.svg' },
        {
          revision: 'f5d1f3e602ba3ce65cdf74f5e09f9088',
          url: '/symbols/mulberry/shampoo_animal_,_to.svg',
        },
        {
          revision: '5791236bba298da7d263e6f790fe8c4a',
          url: '/symbols/mulberry/shampoo_hair_,_to.svg',
        },
        { revision: '6687d30b2e6c67dcbfaa66063ad8c4bf', url: '/symbols/mulberry/shape_puzzle.svg' },
        { revision: 'f7bc26c241788efb335be027ddd81112', url: '/symbols/mulberry/shapes.svg' },
        { revision: '6d0d271b49bcf800502bd10bf2cf9de9', url: '/symbols/mulberry/shapesorter.svg' },
        { revision: 'f2c7bce2bc1d27db5212754444e88c4c', url: '/symbols/mulberry/share_,_to.svg' },
        { revision: 'd416b30948322f4ce7a573b766cdc4ed', url: '/symbols/mulberry/sharp.svg' },
        { revision: '34e7802849b9c3120830b0e23214b342', url: '/symbols/mulberry/sharpen_,_to.svg' },
        { revision: 'bd8e091338c8f80bbd70541bfe4346be', url: '/symbols/mulberry/shave_,_to.svg' },
        {
          revision: 'cc1fac4bda431e8c8706679ac17c2e56',
          url: '/symbols/mulberry/shave_underarm_,_to.svg',
        },
        {
          revision: 'a221785013cc420489da578a43344d84',
          url: '/symbols/mulberry/shave_with_razor_,_to.svg',
        },
        {
          revision: '2c97e655427f7be95e6dd657026169c2',
          url: '/symbols/mulberry/shaving_cream.svg',
        },
        { revision: 'caab1b11f261594397388d0ebf060ecc', url: '/symbols/mulberry/sheep.svg' },
        { revision: '03be14bff6d846e12dabbd3296f8b9b4', url: '/symbols/mulberry/shells.svg' },
        { revision: '6ae50b2deda4908647f495b30302d81f', url: '/symbols/mulberry/shepherd_1a.svg' },
        { revision: '217a7601e69e3b22bd2b232ac6315fda', url: '/symbols/mulberry/shepherd_1b.svg' },
        { revision: 'f7150a04f7e179cc59755548dbb6d1b6', url: '/symbols/mulberry/shin.svg' },
        { revision: 'd48638b95057a8fa6b09285514d4f2cc', url: '/symbols/mulberry/shiny.svg' },
        { revision: 'ed8a16e96aa82dc7a51398978095b69a', url: '/symbols/mulberry/shirt.svg' },
        {
          revision: 'fc4d4074f8bef1df830eb408c058f5b2',
          url: '/symbols/mulberry/shoe_-_ladies.svg',
        },
        { revision: '5a0114871c5246fabcf1026af302dce0', url: '/symbols/mulberry/shoe_-_mans.svg' },
        { revision: 'acb6c066385ea2beee1d12e28fe8691a', url: '/symbols/mulberry/shoot_,_to.svg' },
        {
          revision: '2249ab6525fb67969a3bd45ff7224284',
          url: '/symbols/mulberry/shooting_star.svg',
        },
        { revision: 'fe7c293d077e64ad6345f849e98e58b4', url: '/symbols/mulberry/shop.svg' },
        { revision: '2e8d29caabbaebc9fda330e3b8c6e308', url: '/symbols/mulberry/shop_2.svg' },
        { revision: 'e60650a034616e19ea2bc0ea683e6db3', url: '/symbols/mulberry/short.svg' },
        { revision: '11048a3a003a7a8871f4776b0f3da76e', url: '/symbols/mulberry/short_2.svg' },
        { revision: 'b5a7727830c7f12e3d76a667a9b87faa', url: '/symbols/mulberry/short_hair.svg' },
        { revision: 'c91b14082157b8ae0b3de3a52d9743ed', url: '/symbols/mulberry/shorts.svg' },
        { revision: '7eec6d6809b0775c3e9a9fea0b2edc16', url: '/symbols/mulberry/shoulder.svg' },
        { revision: 'b435deb0b523b052abcce39ebccd4fce', url: '/symbols/mulberry/shout_,_to.svg' },
        { revision: '36e7e3963be0b4e7c662ab46cb0aa9d9', url: '/symbols/mulberry/show_me_,_to.svg' },
        { revision: 'afec15019301fa903f2ac4bd6d4ba880', url: '/symbols/mulberry/shower.svg' },
        {
          revision: 'e81dc0d24d9cdc3f5f21028617923b51',
          url: '/symbols/mulberry/shower_1_,_to.svg',
        },
        {
          revision: 'af51022a05338eb90e62144aae7c47b0',
          url: '/symbols/mulberry/shower_2_,_to.svg',
        },
        { revision: 'dcbc4082b83a96abd1b76bd39fd892a4', url: '/symbols/mulberry/shower_cap.svg' },
        { revision: '0d60ce2628b8b0fca88939f586b92155', url: '/symbols/mulberry/shower_gel.svg' },
        { revision: 'c736b4bec4c2dd04dfa30dd56dfa5d1a', url: '/symbols/mulberry/shrew.svg' },
        { revision: '9a99aa26fe2be1978f66589b120761fe', url: '/symbols/mulberry/shrimp.svg' },
        { revision: '1d07e71a992f9df15d104e82978711f1', url: '/symbols/mulberry/shuttlecock.svg' },
        { revision: '6cfce1653f2dc44628b33e39fd7135fe', url: '/symbols/mulberry/side.svg' },
        { revision: '3b475ac53ceaa8341f72d983f2a3ae3c', url: '/symbols/mulberry/sieve.svg' },
        { revision: '4cce138345374e8cf14e2a67c38c0188', url: '/symbols/mulberry/sieve_,_to.svg' },
        { revision: '64f8ca14cfa594b9860d82b213e43eb0', url: '/symbols/mulberry/sign_,_to.svg' },
        { revision: 'c4e9bf264853d168115b52b69ceee188', url: '/symbols/mulberry/signpost.svg' },
        { revision: 'dfeb24660dbd109252534ecba6092496', url: '/symbols/mulberry/signpost_1.svg' },
        { revision: '4c92e6bef92e480538ea2191a67cc96c', url: '/symbols/mulberry/silence.svg' },
        { revision: 'f819711278cb2eeea7e718432a657c06', url: '/symbols/mulberry/simnel_cake.svg' },
        { revision: 'cf2643212dc2bfbd1b6e79ae9bd0d1f5', url: '/symbols/mulberry/sing_,_to.svg' },
        { revision: '3fcd8c9e1408f8cc861a082e9369686a', url: '/symbols/mulberry/singer_1a.svg' },
        { revision: '9019f3ddd5cb7dfd968b86f9111e3eed', url: '/symbols/mulberry/singer_1b.svg' },
        { revision: 'a9b8abec56246adb6b4bbfd417df7cd5', url: '/symbols/mulberry/singer_2a.svg' },
        { revision: '4b7ae77ac72a20e13bf9d5d88ea667de', url: '/symbols/mulberry/singer_2b.svg' },
        { revision: '0023bb6871f0eb6dd938ef3d371fd710', url: '/symbols/mulberry/single_bed.svg' },
        { revision: '61d577e01e0008c8c68a1985736aeba9', url: '/symbols/mulberry/sink.svg' },
        { revision: '070dd6e11d653c971c83decaee6eebed', url: '/symbols/mulberry/sink_,_to.svg' },
        { revision: 'd67f2b9d44f3f83bc59d074d965b8b75', url: '/symbols/mulberry/sink_2.svg' },
        { revision: 'f47629fff311f718cfbc709dd163bc97', url: '/symbols/mulberry/sink_2_,_to.svg' },
        { revision: 'ac53a2af21b65b118fbd030168e773d4', url: '/symbols/mulberry/sister.svg' },
        { revision: 'f7ec4c0e04145af649176aabd065cfda', url: '/symbols/mulberry/sit_,_to.svg' },
        { revision: 'af8294b2f274161c406a575696d584e8', url: '/symbols/mulberry/sit_2_,_to.svg' },
        {
          revision: '1e421cb8cfd53842225befd8a3617884',
          url: '/symbols/mulberry/sit_at_computer_,_to.svg',
        },
        {
          revision: 'd3eb3053e8236ad6e6a2bd961112d913',
          url: '/symbols/mulberry/sit_at_computer_,_to_2.svg',
        },
        {
          revision: '639842572f46d22b8989c4626a518e90',
          url: '/symbols/mulberry/sit_in_beanbag_,_to.svg',
        },
        {
          revision: 'd11452b488d4094efafde6827e148a74',
          url: '/symbols/mulberry/sit_on_floor_,_to.svg',
        },
        { revision: '71abd60ea47c44ce8ce47d0f1588822f', url: '/symbols/mulberry/six.svg' },
        { revision: '5304e992c227239e856bb5d0837fe85e', url: '/symbols/mulberry/six_dots.svg' },
        { revision: '5597ad2a38392db9412a44265916f2db', url: '/symbols/mulberry/sixteen.svg' },
        { revision: '684abc226c89aa19ed941ae2991b20cc', url: '/symbols/mulberry/sixty.svg' },
        { revision: '90e7c702a7a28e19b4445b93d4317e99', url: '/symbols/mulberry/skate_,_to.svg' },
        { revision: '4f898a2e1dc609ab58bba278ee3ede58', url: '/symbols/mulberry/skate_park.svg' },
        { revision: '5ac9f13d23d23edba94086ff8edaff51', url: '/symbols/mulberry/skateboard.svg' },
        { revision: '2dbfe55308f41283522c72cded5d110a', url: '/symbols/mulberry/skeleton.svg' },
        { revision: '3bed174c49fe7305d56bff45ca16e0a0', url: '/symbols/mulberry/ski_,_to.svg' },
        { revision: '7ffa63ca9b2d7ff1e543623cfc203a71', url: '/symbols/mulberry/skid_,_to.svg' },
        { revision: 'a91638c9b9196f90003644649996c796', url: '/symbols/mulberry/skin.svg' },
        { revision: '579c640278a0d2439a88bf6f936d3cd3', url: '/symbols/mulberry/skip_,_to.svg' },
        { revision: 'ee711df8642dd2e3023fbcf6fb730610', url: '/symbols/mulberry/skirt.svg' },
        { revision: '3ef6117ca56c72beb3a66b514896b286', url: '/symbols/mulberry/skis.svg' },
        { revision: '3db9c5727e9bffb15ac472e817e729c0', url: '/symbols/mulberry/skull.svg' },
        { revision: '69b69468c331dc70e4ebc5483d7cceff', url: '/symbols/mulberry/skunk.svg' },
        { revision: '9e3d1a1fd115da8f51c63cf15d3d1ef6', url: '/symbols/mulberry/sledge.svg' },
        {
          revision: '56dbce9a5b573c516a2488a811d1327f',
          url: '/symbols/mulberry/sleep_female_,_to.svg',
        },
        {
          revision: '55d4f896406fcdc29c5b441856250537',
          url: '/symbols/mulberry/sleep_male_,_to.svg',
        },
        {
          revision: '00ae8893f9b291fe472b6b31fe40a345',
          url: '/symbols/mulberry/sleep_on_side_,_to.svg',
        },
        {
          revision: '38331a24bbec6de6e36cb91146c19170',
          url: '/symbols/mulberry/sleep_suit_baby.svg',
        },
        { revision: 'ce2d4425fd980f3c4495fac7e80dcb6a', url: '/symbols/mulberry/sleigh.svg' },
        { revision: 'fe35bac6a944f6c1669965569cbfb6de', url: '/symbols/mulberry/slice.svg' },
        { revision: '617e120995eab29a20539ec1267e5080', url: '/symbols/mulberry/slide.svg' },
        { revision: '8698ba17052d9f555f4befdd0dedaecc', url: '/symbols/mulberry/slide_,_to.svg' },
        {
          revision: '2f743032da8c3a83810333ba659d98c3',
          url: '/symbols/mulberry/slide_backwards_,_to.svg',
        },
        {
          revision: '8f83d5a9948921ac345a426cbb14b3ff',
          url: '/symbols/mulberry/slide_forwards_,_to.svg',
        },
        { revision: '731cad342386dbcaee7eaa3dfb238d48', url: '/symbols/mulberry/sling.svg' },
        { revision: '67855c9af07966aba5cf0ea6ede4579e', url: '/symbols/mulberry/slippers.svg' },
        { revision: '2ed169b6f984b81fc28aa45ef6be3dfe', url: '/symbols/mulberry/slippery.svg' },
        { revision: 'c317f6576a136015f76ae323654fe285', url: '/symbols/mulberry/slug.svg' },
        { revision: '11d5b197fd6be1e702c8382514f367b2', url: '/symbols/mulberry/smear_,_to.svg' },
        { revision: '9782ab7e6ed37db30e494bbbbf56ed90', url: '/symbols/mulberry/smile_,_to.svg' },
        { revision: 'f83e524d4139a7881a118c18d2742617', url: '/symbols/mulberry/smoke_,_to.svg' },
        { revision: '5efc28e68a7106cc08c3416b42453e7d', url: '/symbols/mulberry/smooth.svg' },
        { revision: '97f0d60ea49ab2cdff030d7a48b2a62d', url: '/symbols/mulberry/snail.svg' },
        { revision: 'ddd7ec6b3fb4a022be7f46b739acbaa0', url: '/symbols/mulberry/snake.svg' },
        { revision: '7b18ed863bd526e3cff247f652f19512', url: '/symbols/mulberry/sneak_,_to.svg' },
        {
          revision: '27cc5ab4558be98f5c9c0a2580d09b81',
          url: '/symbols/mulberry/sneering_lady.svg',
        },
        { revision: '93f7eca5fcf96f2913f4bf7aa9baafdf', url: '/symbols/mulberry/sneering_man.svg' },
        { revision: '9507198e75ef87b1fec0193649053467', url: '/symbols/mulberry/sneeze_cold.svg' },
        { revision: '8e4056edbab2e8ceaaa31969d545df6a', url: '/symbols/mulberry/snow.svg' },
        { revision: 'a56708a35d180dba4b8de9ee0c80dae5', url: '/symbols/mulberry/soap.svg' },
        { revision: 'a49f98b3049618caa5f6a3dfa74b63ed', url: '/symbols/mulberry/socks.svg' },
        { revision: '1d83a17b46c072d27de095603ec74e3b', url: '/symbols/mulberry/soft.svg' },
        { revision: 'f9f8d5364a51953e71b55f61c860cadb', url: '/symbols/mulberry/soldier_1a.svg' },
        { revision: '68ce6c23c0ed3ce4da87f5e84014a573', url: '/symbols/mulberry/soldier_1b.svg' },
        { revision: '9e343c66754756a176a0f2852811a59e', url: '/symbols/mulberry/soldier_2a.svg' },
        { revision: '2a0855f699318582c7206ff4c2dbfb70', url: '/symbols/mulberry/soldier_2b.svg' },
        { revision: '0db7ff0ac64e30342b728a3d4aaf2326', url: '/symbols/mulberry/sole.svg' },
        { revision: '64a16e3c1ba9ddb56fe9247738aa7eb7', url: '/symbols/mulberry/some.svg' },
        { revision: 'dc6710765f5d520e06122b1f00061f5d', url: '/symbols/mulberry/son.svg' },
        { revision: '562c670f18d101743d912269234c512b', url: '/symbols/mulberry/sort_,_to.svg' },
        { revision: '044d0368a32529c9eb9efc569353ec69', url: '/symbols/mulberry/soup.svg' },
        { revision: '736fcffce175238a00e057653718cee9', url: '/symbols/mulberry/soup_carrot.svg' },
        { revision: 'f51d810ea6b1c4c5e2c7948e3d65e416', url: '/symbols/mulberry/soup_chicken.svg' },
        {
          revision: '8a20e9f82a0b49b1f7a2f54bf654c751',
          url: '/symbols/mulberry/soup_mushroom.svg',
        },
        { revision: '15c8ff43de29da096d6eaf4c688f3023', url: '/symbols/mulberry/soup_onion.svg' },
        { revision: '774c2d905b689e1edba020825720c4f4', url: '/symbols/mulberry/soup_pea.svg' },
        { revision: 'c74b6008c1c08a43dd2c346effeb9c73', url: '/symbols/mulberry/soup_tomato.svg' },
        {
          revision: '90e8afee0e2f2c287a1c837ba659def0',
          url: '/symbols/mulberry/soup_vegetable.svg',
        },
        { revision: 'b6bcf83056ad05a17807cc2863b9e3e9', url: '/symbols/mulberry/sour.svg' },
        { revision: '3b6f9bc4fc1e2c515595d7d02cf978ab', url: '/symbols/mulberry/sour_cream.svg' },
        { revision: '87401d60d0a6be99d2fcdcb1d0d2a50e', url: '/symbols/mulberry/south.svg' },
        { revision: 'b924b489aed8da0676d1a770cb584a81', url: '/symbols/mulberry/south_east.svg' },
        { revision: '30201cea15af93af544f74db1cdd82bf', url: '/symbols/mulberry/south_west.svg' },
        { revision: '2be8f488a527a4a05a28f1b5eafc19ed', url: '/symbols/mulberry/space_bar.svg' },
        { revision: '027e22329fbb93675aa33b2cb2aabe37', url: '/symbols/mulberry/spaceship.svg' },
        { revision: '6a7f0431c65bc5922611bd1aaaebee3b', url: '/symbols/mulberry/spade.svg' },
        { revision: '98864cbbad54b1b33d6c848c2f86c210', url: '/symbols/mulberry/spaghetti.svg' },
        {
          revision: 'de1c1ff4d092f309048169379298bea8',
          url: '/symbols/mulberry/spaghetti_bolognaise.svg',
        },
        { revision: '2a469c8e5bf00854ccb67ee815eca9de', url: '/symbols/mulberry/sparkler.svg' },
        { revision: 'b9b7d1e497311bd20aa52879f4007e92', url: '/symbols/mulberry/spatula.svg' },
        { revision: '071b2ad64ac69e2e8e86afba9188c826', url: '/symbols/mulberry/spatula_2.svg' },
        {
          revision: '03d57d1542e7d9d37a54966687412001',
          url: '/symbols/mulberry/speech_language_therapist_1a.svg',
        },
        {
          revision: '31c9fb1800f4e9b7a07a5820655dc6f1',
          url: '/symbols/mulberry/speech_language_therapist_1b.svg',
        },
        {
          revision: '32775fb5a719bcf36aaaa1b5e1eb8f45',
          url: '/symbols/mulberry/speech_language_therapist_2a.svg',
        },
        {
          revision: '54d9ea6d449d03df095ff65de0cd730f',
          url: '/symbols/mulberry/speech_language_therapist_2b.svg',
        },
        { revision: 'dba466650a0b94adf777bcbe4e5e235d', url: '/symbols/mulberry/spell_,_to.svg' },
        { revision: '85819cf16fc257f969cdc32cbcf0d002', url: '/symbols/mulberry/spicy.svg' },
        { revision: '69dba2cde5e98f571a30c5fef2e53e0a', url: '/symbols/mulberry/spider.svg' },
        { revision: '72d77671597b86bcf11d3fad96b4f609', url: '/symbols/mulberry/spiders_web.svg' },
        { revision: '8ee9892d1d4cc53cf8a2880486bd91a7', url: '/symbols/mulberry/spill_,_to.svg' },
        { revision: '13f99906a15c3d3df21847038fcd1bfc', url: '/symbols/mulberry/spin_,_to.svg' },
        { revision: '19b9730f920859eb8289ba4b6656090c', url: '/symbols/mulberry/spinach.svg' },
        { revision: '6e2d71c0c710fc2288bb8d491f2c20df', url: '/symbols/mulberry/spine.svg' },
        { revision: '6002fd9ed61f58390071c3d0ccebe4ba', url: '/symbols/mulberry/sponge.svg' },
        { revision: 'a0273acb83232159b4e8343b18876209', url: '/symbols/mulberry/spoon.svg' },
        {
          revision: '17f563c20f56c048929e0129e99658d3',
          url: '/symbols/mulberry/spoon_adapted.svg',
        },
        { revision: '6a99e348720022ae53d31cb58ad5f922', url: '/symbols/mulberry/spot_light.svg' },
        { revision: '56ee205cc6bb553a4d294334e4df0a02', url: '/symbols/mulberry/spotty.svg' },
        { revision: '1f15b78eb6558e26287ba2c3d72422e1', url: '/symbols/mulberry/spotty_2.svg' },
        { revision: 'b26bcb7b14a3334d47f533aa8b52f12e', url: '/symbols/mulberry/spray_,_to.svg' },
        { revision: '88ac1ef871197e8f7c16ede98b23e9ce', url: '/symbols/mulberry/spread_,_to.svg' },
        { revision: 'e6f61c18fe3f4c065222d84dfa25e0e7', url: '/symbols/mulberry/spring.svg' },
        {
          revision: '9a26c542364dfcd9be86cab1823cfafd',
          url: '/symbols/mulberry/spring_onions.svg',
        },
        {
          revision: '593ef5a97218e6808b837b676780b343',
          url: '/symbols/mulberry/sprinkle_,_to.svg',
        },
        { revision: 'e5350b7ab59ae41943c0337d2a9cfc8d', url: '/symbols/mulberry/square.svg' },
        {
          revision: 'bd1fb74eadf340171c00de1352e91620',
          url: '/symbols/mulberry/square_setsquare.svg',
        },
        { revision: 'f6fa80fa694b91437fc5b6b68598a4dd', url: '/symbols/mulberry/squash.svg' },
        { revision: 'ec37805e7df14f883e7c8b235ec39125', url: '/symbols/mulberry/squash_,_to.svg' },
        { revision: '01e28f3c7f7318c1c0e69142e55fe374', url: '/symbols/mulberry/squeak_,_to.svg' },
        { revision: 'ff49cccf30ff9cd38573f6a416c80dfb', url: '/symbols/mulberry/squeeze_,_to.svg' },
        { revision: '8a901a9894e428044ba5c4fcaafd45f4', url: '/symbols/mulberry/squirrel_1a.svg' },
        { revision: 'a1cc9f2012fbede11e185b1ed3ffe70f', url: '/symbols/mulberry/squirrel_1b.svg' },
        { revision: '511acbc4607cfbd02e40fcda1f700988', url: '/symbols/mulberry/squirt_,_to.svg' },
        { revision: 'c58c1ba6b5ff9465fc29cd423c508806', url: '/symbols/mulberry/stable.svg' },
        { revision: '8e7f2684503d00f54847b6278769bc12', url: '/symbols/mulberry/stable_1.svg' },
        { revision: 'af8e46f834080a883677bd6137ce728d', url: '/symbols/mulberry/stable_2.svg' },
        { revision: 'fa72d6b7c7124b9938aa073fb6c703f8', url: '/symbols/mulberry/stag.svg' },
        { revision: 'c0ee6bea87495e5712739d8aa4e92374', url: '/symbols/mulberry/stairs.svg' },
        { revision: 'd49b1627e3da3ac3ddfd614b96a1f936', url: '/symbols/mulberry/stamp_,_to.svg' },
        { revision: '6b49a17588af0d7c4b4d40d3b20f7181', url: '/symbols/mulberry/stand_,_to.svg' },
        {
          revision: 'c6f0bf7f631489772a3fbeee5d35f1a0',
          url: '/symbols/mulberry/standard_lamp.svg',
        },
        { revision: '90928ab7ec19200228360c6a1b25352b', url: '/symbols/mulberry/staple_,_to.svg' },
        { revision: '87b11f1002c92504060aa40e7bc2ddb7', url: '/symbols/mulberry/stapler.svg' },
        { revision: 'd560356e1d4a59134903bbcc0da90fc3', url: '/symbols/mulberry/star.svg' },
        { revision: 'c399e9ef908d4589c23f9087f30a79d0', url: '/symbols/mulberry/star_2.svg' },
        { revision: '1443d38fe105a2c434348332cf17ffe1', url: '/symbols/mulberry/star_stacker.svg' },
        { revision: '580fbbd2f326ab22b5ce623aa208dbc4', url: '/symbols/mulberry/starfish.svg' },
        { revision: 'cd82c52a889ccb51eb9d1590e6f17e4b', url: '/symbols/mulberry/steak.svg' },
        { revision: '2fa8e9772eba1a403f05c47a92be494e', url: '/symbols/mulberry/steal_,_to.svg' },
        { revision: '9040daf6b7e0a04e3bb49faccd047c98', url: '/symbols/mulberry/steam_train.svg' },
        { revision: 'b184ff1ba28e2c9c9bbde846719fe004', url: '/symbols/mulberry/steamer.svg' },
        { revision: '2ae4a7799aff4e159dd2c13b7f58ae7c', url: '/symbols/mulberry/step_brother.svg' },
        { revision: '55609d412449e4c0aedcb63145da66a6', url: '/symbols/mulberry/step_by_step.svg' },
        {
          revision: 'a2dc0217c18fcd04c86c9e87e0307042',
          url: '/symbols/mulberry/step_dad_parent.svg',
        },
        {
          revision: 'f0e21dbdcded395813134c5eb8e94599',
          url: '/symbols/mulberry/step_daughter_1.svg',
        },
        {
          revision: '753c71b3d55691d481f1c5eecef05657',
          url: '/symbols/mulberry/step_daughter_2.svg',
        },
        {
          revision: '3d367db1c72b0784c42ec30db9ca9cb9',
          url: '/symbols/mulberry/step_mum_parent.svg',
        },
        { revision: '079beb833d072771b5bce8e853ad6f90', url: '/symbols/mulberry/step_sister.svg' },
        { revision: 'd869d23da591d7ad13b6fdb9bc9c6e7e', url: '/symbols/mulberry/step_son_1.svg' },
        { revision: 'afc01a9c1e19e8da2029f773411a88d0', url: '/symbols/mulberry/step_son_2.svg' },
        { revision: '6b7a72dc92afa798e7d823be0a6f6bab', url: '/symbols/mulberry/stereo.svg' },
        { revision: '5b816242ed0c67739e19e107cd937f18', url: '/symbols/mulberry/stethoscope.svg' },
        { revision: '898993856dd96f777b6f7e68590f803e', url: '/symbols/mulberry/stick.svg' },
        { revision: '0aec06633c34aa442778be8eb18eea49', url: '/symbols/mulberry/stickers.svg' },
        { revision: 'f9ab85db8473866972cc26aa28d9a32d', url: '/symbols/mulberry/sticky.svg' },
        { revision: '964640fb8e232ab894f7a50f133ff70c', url: '/symbols/mulberry/sting_bee.svg' },
        { revision: '0cb0c4cc2115a66786cc0481ab250ab0', url: '/symbols/mulberry/stir_,_to.svg' },
        { revision: 'c9d7e50def3d33aea8cee15e4c761079', url: '/symbols/mulberry/stir_fry.svg' },
        {
          revision: 'fd637d713285fb519a6c0d57513a6dab',
          url: '/symbols/mulberry/stir_fry_,_to.svg',
        },
        {
          revision: 'c00aa992c976fb1f51f1f150eb9650c8',
          url: '/symbols/mulberry/stir_mix_,_to.svg',
        },
        { revision: '90682c5fe680039fde04ff0f88e6ca70', url: '/symbols/mulberry/stirrups.svg' },
        { revision: '5378c2d30a65940ac25b09afbbc4e944', url: '/symbols/mulberry/stoat.svg' },
        { revision: '5cd2df3ab98e57837a3d50ae2d978ef7', url: '/symbols/mulberry/stock.svg' },
        { revision: 'b9089013607894ed668e50935e1809ec', url: '/symbols/mulberry/stock_cubes.svg' },
        { revision: '24f5e2bff8ae63e4a0ceb289d4b68bd2', url: '/symbols/mulberry/stomach.svg' },
        { revision: '1eec1abb4201aabfdb2cbb1feb8990fa', url: '/symbols/mulberry/stomach_1.svg' },
        { revision: '0bd5b7d8b6271ac628ce3416b0762b55', url: '/symbols/mulberry/stomach_ache.svg' },
        { revision: '4c223416914cc5f987ad9876e7846ad1', url: '/symbols/mulberry/stone.svg' },
        { revision: '8232056102cbac91b032aca6e3104501', url: '/symbols/mulberry/stool.svg' },
        { revision: 'fe608cdf9f4d86d6d817241c7d6c3777', url: '/symbols/mulberry/straight.svg' },
        { revision: '28a1bfef971c84f36564513a93bd6663', url: '/symbols/mulberry/strain_,_to.svg' },
        { revision: '08770cd3ddd20272c25cb55a3cba0dbe', url: '/symbols/mulberry/straw.svg' },
        { revision: 'a71a6be0fe5e445ba5e6119e9c2c995f', url: '/symbols/mulberry/strawberry.svg' },
        {
          revision: '8914d4ec936caa5fe103e27054ef70c3',
          url: '/symbols/mulberry/strawberry_jam.svg',
        },
        { revision: '207778663f9be0710c6edca7a8f9371e', url: '/symbols/mulberry/stretch_,_to.svg' },
        { revision: '5c9739b1112bda9801e0b3612a9dbaed', url: '/symbols/mulberry/string.svg' },
        { revision: 'e75b4033e49a1e754671d3565818afb5', url: '/symbols/mulberry/striped.svg' },
        { revision: 'd9cba4700fdb4c84111568720b8211ed', url: '/symbols/mulberry/stroke_,_to.svg' },
        {
          revision: '59d42de8d60f228d6dddfb17414a208d',
          url: '/symbols/mulberry/stroke_2_,_to.svg',
        },
        { revision: '4cc2c1e0e8c639288b77e8781af38659', url: '/symbols/mulberry/strong.svg' },
        { revision: 'd351632ddd26b7aac64380aa9777278b', url: '/symbols/mulberry/stubble.svg' },
        { revision: '84884affb4d47aefb9e0a8c3565b3d14', url: '/symbols/mulberry/study_,_to.svg' },
        { revision: 'd4beb5acb3fde06fe61e0fb73edfe75b', url: '/symbols/mulberry/stuffing.svg' },
        { revision: '6fb9429c2764fb02d2edb5f11f61c909', url: '/symbols/mulberry/subsoil.svg' },
        { revision: '2afac8525aa8d223fbfbdd36d996262f', url: '/symbols/mulberry/subtract.svg' },
        { revision: '59f17991aa16c5e2279c0ba2476476ba', url: '/symbols/mulberry/sugar_bowl.svg' },
        { revision: '9319601c9a2e10ed154ee8175e958e75', url: '/symbols/mulberry/sugar_brown.svg' },
        { revision: '017f74dd8926981d7a3a34bc3f573a35', url: '/symbols/mulberry/sugar_white.svg' },
        { revision: '7bd4bac59a676802e3c660af5b72d9f2', url: '/symbols/mulberry/suit_-_ladys.svg' },
        { revision: '12b7312a83da4eee4092e712048e1037', url: '/symbols/mulberry/suit_-_mans.svg' },
        { revision: 'a47bb31bc46dd988fa9fcb69082436f6', url: '/symbols/mulberry/suitcase_1.svg' },
        { revision: '6373972ef749749355b25bf19ebb0d7c', url: '/symbols/mulberry/suitcase_2.svg' },
        { revision: '665763a5a4ab4ceeb3c7f0f95feacafe', url: '/symbols/mulberry/sum.svg' },
        { revision: 'bd33cc4c12615b776cd16c61ab007758', url: '/symbols/mulberry/summer.svg' },
        { revision: 'cd03051f69eaf863816dd2d199589fe3', url: '/symbols/mulberry/sun.svg' },
        { revision: '3551f6273b13c134aab7d13d4f3fb62f', url: '/symbols/mulberry/sun_lounger.svg' },
        { revision: 'cd7015aab218a85a3a92f57f4d698d24', url: '/symbols/mulberry/sunglasses.svg' },
        { revision: 'e175ff6a45d71573876236454f47fb06', url: '/symbols/mulberry/sunscreen.svg' },
        {
          revision: '54a5416be76f506d838d90c570868f05',
          url: '/symbols/mulberry/surgery_health_centre.svg',
        },
        {
          revision: '0953a73defd7a37a44025ed6c214bb73',
          url: '/symbols/mulberry/surprised_lady.svg',
        },
        {
          revision: '80292db4a6a306225ca8fbb872bbc6ad',
          url: '/symbols/mulberry/surprised_man.svg',
        },
        { revision: 'bb9f338f160f327ce714c09b6228c988', url: '/symbols/mulberry/swan.svg' },
        { revision: '9c52e803f6feaf1413751ebaa88e17cb', url: '/symbols/mulberry/sweatshirt.svg' },
        { revision: '3102fea39666f218d630bddc4c8a5dd5', url: '/symbols/mulberry/swede.svg' },
        { revision: '75e820050e65b801daf12a6f93a75afd', url: '/symbols/mulberry/sweet.svg' },
        { revision: '3b8b31b5fa62383b75ff31d5c2a31b36', url: '/symbols/mulberry/sweet_2.svg' },
        { revision: '19181eb23a7c194f8b7759964bf87180', url: '/symbols/mulberry/sweet_potato.svg' },
        { revision: '928fe90fcd918749b71742ce7c52b12d', url: '/symbols/mulberry/sweetcorn.svg' },
        { revision: 'a655a5c080e23fd2eeb4e7230ee0fe11', url: '/symbols/mulberry/swim_,_to.svg' },
        { revision: '658051537597e2161cff6b3a3beaf8bc', url: '/symbols/mulberry/swim_2_,_to.svg' },
        { revision: '28b8ddaa528b82b4a7abf1e8b2dba12a', url: '/symbols/mulberry/swimming_cap.svg' },
        {
          revision: '5936796af64eaeda462103b6438395ed',
          url: '/symbols/mulberry/swimming_class.svg',
        },
        {
          revision: '9962cfec9939ee696158f10192b3126a',
          url: '/symbols/mulberry/swimming_costume.svg',
        },
        {
          revision: '5f7b57292ef746348b681e0e888a0f5d',
          url: '/symbols/mulberry/swimming_trunks.svg',
        },
        { revision: 'afbe78124e1f4d84a3cf7ab6b9cda4e2', url: '/symbols/mulberry/swing.svg' },
        { revision: '134e20dc5fbd75277206600c41abeb50', url: '/symbols/mulberry/swing_,_to.svg' },
        { revision: 'a00a109894ef6eae6d0681870a934f3e', url: '/symbols/mulberry/swiss_roll.svg' },
        {
          revision: 'f3484dadc68d21909ba2575cf7a4de76',
          url: '/symbols/mulberry/switch_access.svg',
        },
        {
          revision: 'c7cf0f906e057a6277db45ebedd2d05c',
          url: '/symbols/mulberry/switch_low_profile_1.svg',
        },
        {
          revision: '8432fb740b045e7f552eb5daee9eada0',
          url: '/symbols/mulberry/switch_low_profile_2.svg',
        },
        {
          revision: 'cb0032dcc5a69c618e223498efba65cf',
          url: '/symbols/mulberry/switch_low_profile_3.svg',
        },
        { revision: 'bb8dcdc342c9547c0c53b7a088e58f43', url: '/symbols/mulberry/switch_mount.svg' },
        {
          revision: '75830d7e544fdc14cba2ea3d42433963',
          url: '/symbols/mulberry/switch_on_television_,_to.svg',
        },
        { revision: 'abe61006386af0169d0da0c02f1c3ed4', url: '/symbols/mulberry/syringe.svg' },
        { revision: 'f8eca2be1042f4c711c30adc78147319', url: '/symbols/mulberry/t-shirt.svg' },
        {
          revision: '717ce4a5471ef5a801c9d8affe6208e3',
          url: '/symbols/mulberry/t_-_lower_case.svg',
        },
        { revision: 'f67b3eb0df67fe58888b2c571ccc435b', url: '/symbols/mulberry/table.svg' },
        { revision: 'cd5592337fcf98d4d425bf67e306e69f', url: '/symbols/mulberry/table_2.svg' },
        { revision: 'bbc486a0e072ddcd2d260cdc59ce6506', url: '/symbols/mulberry/table_cloth.svg' },
        { revision: 'c61c5bda4c569b3f87a68f85ae6b54be', url: '/symbols/mulberry/tablecloth.svg' },
        {
          revision: '8f2886c4a710469896fa3e3c474f12a5',
          url: '/symbols/mulberry/tablet_blister_pack.svg',
        },
        { revision: '449c6fbe776142ad8bbe93b2d07ec3bf', url: '/symbols/mulberry/tablets.svg' },
        { revision: '170eb691d5265dc8de0d628dec967e65', url: '/symbols/mulberry/take_,_to.svg' },
        {
          revision: 'd5922b2db64bfaecc96740d313800495',
          url: '/symbols/mulberry/take_a_work_break_,_to.svg',
        },
        {
          revision: '3073557a457202718336f0251d97835a',
          url: '/symbols/mulberry/take_care_of_,_to.svg',
        },
        {
          revision: 'c2804e6121a585acd15ae8e2d6578290',
          url: '/symbols/mulberry/take_off_cap_,_to.svg',
        },
        {
          revision: 'ef958d951c6e379453ef3934bfeb983b',
          url: '/symbols/mulberry/take_off_lid_,_to.svg',
        },
        {
          revision: '66dc2a408c17ab5b46428ed67a128563',
          url: '/symbols/mulberry/take_out_,_to.svg',
        },
        {
          revision: '567c1bfe7bd01cb3910f56db1d8b2d39',
          url: '/symbols/mulberry/take_picture_,_to.svg',
        },
        {
          revision: 'eb8403f11e4931d846932f28faf327fc',
          url: '/symbols/mulberry/takeaway_burger.svg',
        },
        {
          revision: 'b00c91d1458823118dc82f48400bb179',
          url: '/symbols/mulberry/takeaway_burger_and_chips.svg',
        },
        {
          revision: 'dcdec99068ff5f1c97f6ecf837e863ec',
          url: '/symbols/mulberry/takeaway_chinese.svg',
        },
        {
          revision: 'd776dc80ba6d338c44b83fd1edf7eefd',
          url: '/symbols/mulberry/takeaway_container.svg',
        },
        {
          revision: '9d67fdffbb7b8436d9f47dc698e32a3d',
          url: '/symbols/mulberry/takeaway_indian.svg',
        },
        {
          revision: 'b988c92e93d3231f377c7bdc197d418c',
          url: '/symbols/mulberry/takeaway_pizza.svg',
        },
        { revision: '4b25f8c0998587976332f604e36e8b74', url: '/symbols/mulberry/talk_1_,_to.svg' },
        { revision: '24aee9949075b03978a1bb82c57e6264', url: '/symbols/mulberry/talk_2_,_to.svg' },
        { revision: '8ca3825a724375c99275cb7343c85dcd', url: '/symbols/mulberry/talk_3_,_to.svg' },
        { revision: '193fabf1d90bdf1735d3380da57829fd', url: '/symbols/mulberry/talk_4_,_to.svg' },
        { revision: '672e51463369e83815234aa138c0fe11', url: '/symbols/mulberry/tall.svg' },
        { revision: 'e60aa55c0b9084018e8994e4d4f582cc', url: '/symbols/mulberry/tampon.svg' },
        { revision: '0f4250a0cfcf6c95bfc357e9c9a6e9b7', url: '/symbols/mulberry/tap.svg' },
        { revision: '209728c04f11b2c8bc6ef5ac5d899649', url: '/symbols/mulberry/tape_measure.svg' },
        {
          revision: 'f788f053b8d53518b1547de6c09261cf',
          url: '/symbols/mulberry/tape_recorder.svg',
        },
        { revision: '60750aa9b1039072bf26f4b33c3bf9a3', url: '/symbols/mulberry/tart.svg' },
        { revision: '70e927a076b1f46a3133e40a152a8298', url: '/symbols/mulberry/tartan.svg' },
        { revision: '286b7c93f9b5bc02ae66f16609466a7b', url: '/symbols/mulberry/taste_,_to.svg' },
        { revision: '23d3b6f4857182695b3318587ab4baf0', url: '/symbols/mulberry/tattoo.svg' },
        { revision: '1c216a9a9fe7d0b86a13a9cc716bf966', url: '/symbols/mulberry/taxi.svg' },
        {
          revision: 'e5fdf8186c87bd30f4f0d42d48571dbb',
          url: '/symbols/mulberry/taxi_driver_1a.svg',
        },
        {
          revision: 'c2fe8efedcaf642173fbc2bcb9d5afbb',
          url: '/symbols/mulberry/taxi_driver_1b.svg',
        },
        {
          revision: '36a3f563855d587966d9b58a70ec80d7',
          url: '/symbols/mulberry/taxi_driver_1c.svg',
        },
        {
          revision: '3b1631245969e73a8eb0ddd059c70a47',
          url: '/symbols/mulberry/taxi_driver_1d.svg',
        },
        {
          revision: 'f54efb19e294ec700fffb35b1d624ff7',
          url: '/symbols/mulberry/taxi_driver_2a.svg',
        },
        {
          revision: '1301cb39aa6e7a7c6ce23c75764ed815',
          url: '/symbols/mulberry/taxi_driver_2b.svg',
        },
        {
          revision: '74edf09940265b03e46d762c26d8b131',
          url: '/symbols/mulberry/taxi_driver_2c.svg',
        },
        {
          revision: '6cbd8a011246bf1735825bca9e5ba9ba',
          url: '/symbols/mulberry/taxi_driver_2d.svg',
        },
        { revision: '4fc49452fd6154d99bef2a9d08cbc843', url: '/symbols/mulberry/tea.svg' },
        { revision: '9cf9c478e2bf9c084248e74d150ed17c', url: '/symbols/mulberry/tea_bag.svg' },
        { revision: '4a05a57dd415c008f56be40f3bc9f331', url: '/symbols/mulberry/tea_instant.svg' },
        { revision: 'eb8d704bfc038131f9920c8203e625f9', url: '/symbols/mulberry/tea_spoon.svg' },
        { revision: 'fa4ed84238ced8d0b0dca0ac4908bc04', url: '/symbols/mulberry/tea_time.svg' },
        { revision: '92725f10d42449220191e57f363e30c1', url: '/symbols/mulberry/tea_towel.svg' },
        { revision: '7b3c75c2c253fb20dfe2e424a8ba87a3', url: '/symbols/mulberry/teacher_1a.svg' },
        { revision: '9ed87ff3778db7fff2e6335ccfba1afb', url: '/symbols/mulberry/teacher_1b.svg' },
        { revision: 'c52b6ddc14be32256bda3f353460b8e0', url: '/symbols/mulberry/teacher_2a.svg' },
        { revision: 'f77e0eccfdf06f2ec2ab6d90df0e54df', url: '/symbols/mulberry/teacher_2b.svg' },
        { revision: '75a71950f42a0c18f676f0b21b1b8c16', url: '/symbols/mulberry/teapot.svg' },
        { revision: '34498a4d6fdbd8ef571e1f7d8b29b0b8', url: '/symbols/mulberry/tear_,_to.svg' },
        { revision: '15a9ca93bf73bf61f97b26b48c26a142', url: '/symbols/mulberry/technology.svg' },
        { revision: '52be75c215891e410333fe467a296898', url: '/symbols/mulberry/teddy_bear.svg' },
        { revision: 'e720f236618c28938be1886c352ebb99', url: '/symbols/mulberry/teeth.svg' },
        { revision: '6bc66653f1b74f877658b0b6d6c0e5b9', url: '/symbols/mulberry/teeth_2.svg' },
        {
          revision: 'f2558c3b6e45464bf047863764e42f50',
          url: '/symbols/mulberry/telephone_2_,_to.svg',
        },
        {
          revision: '420dbdd2c6e770ff9469bb5897a9c51f',
          url: '/symbols/mulberry/telephone_handset.svg',
        },
        {
          revision: '4da47ad702cde899831532a01972a702',
          url: '/symbols/mulberry/telephone_mobile_,_to.svg',
        },
        {
          revision: '87ff315f0ccd6585e29ea76893df1c58',
          url: '/symbols/mulberry/telephone_mobile_2_,_to.svg',
        },
        {
          revision: 'b342dcb717ba2c87db515e684aee6fa1',
          url: '/symbols/mulberry/telephone_toy.svg',
        },
        { revision: '08d6d3c1a594775fd4fb4a6336007b80', url: '/symbols/mulberry/temple.svg' },
        { revision: '65f3dea31b9806d39d759e080d3551ce', url: '/symbols/mulberry/ten.svg' },
        { revision: '137f6e99c8d70a40f171c118d20e6f60', url: '/symbols/mulberry/tennis.svg' },
        { revision: '34eefaee7696e7a445dd95b3d05dff0a', url: '/symbols/mulberry/terracotta.svg' },
        { revision: '8280201bb5382d46d56b6e085f519a6b', url: '/symbols/mulberry/test.svg' },
        { revision: 'a2b903ce9768cc1699ce1c081af67ac1', url: '/symbols/mulberry/test_tube.svg' },
        {
          revision: 'fff86dc6ff6a2dd1f3fbce862d9fe04d',
          url: '/symbols/mulberry/text_mobile_message_,_to.svg',
        },
        { revision: 'd960576c79f6aa517650ed0d6ca64820', url: '/symbols/mulberry/text_phone.svg' },
        { revision: '4a1ec603e568cbe97687b4bc50fe776a', url: '/symbols/mulberry/theme_park.svg' },
        { revision: 'a4973a778f65c55076b072819a2a3ee9', url: '/symbols/mulberry/thermometer.svg' },
        {
          revision: 'fa3880761526708748ab234729d770d1',
          url: '/symbols/mulberry/thermometer_2.svg',
        },
        { revision: 'a9b597be16a587575ccc32b02fc62d22', url: '/symbols/mulberry/thick.svg' },
        { revision: '93c5b1c2af5f406dde92c3d361422224', url: '/symbols/mulberry/thigh.svg' },
        { revision: '0ea437271a609965b99ebe89e8da66ff', url: '/symbols/mulberry/thin.svg' },
        { revision: '90e3ccd2268758dd39f40a609508bc57', url: '/symbols/mulberry/thin_2.svg' },
        { revision: '2d4a5290f1add6b6b695d425ba524cb7', url: '/symbols/mulberry/think_,_to.svg' },
        { revision: '964c950c88277fe4d05c58935eaaaf66', url: '/symbols/mulberry/thirsty.svg' },
        { revision: '8915a9dbd3feb017cdd5692e0ca108da', url: '/symbols/mulberry/thirteen.svg' },
        { revision: 'd426295f6c873533d5a83ebd30881f8f', url: '/symbols/mulberry/thirty.svg' },
        { revision: 'f57e849e19417a1c5caa9466776800ae', url: '/symbols/mulberry/this_month.svg' },
        { revision: 'b223e6726ad5d488bd858d37a7891945', url: '/symbols/mulberry/this_week.svg' },
        { revision: 'd5ef1982a378729fd9e4652684e3eaa5', url: '/symbols/mulberry/thousand.svg' },
        { revision: 'd07af47592251a07181a6be824859bcd', url: '/symbols/mulberry/three.svg' },
        { revision: 'a7d6eb74cdf1b8d0fe0380db95be8c38', url: '/symbols/mulberry/three_dots.svg' },
        {
          revision: '82f9cdfeb1fa9c747c03fbb25fb0443d',
          url: '/symbols/mulberry/three_quarters.svg',
        },
        {
          revision: '69200c543e5ddeae930ee55bac91ccee',
          url: '/symbols/mulberry/three_wise_kings.svg',
        },
        { revision: 'e577e1bf45b215e68b6b8ee0b653f957', url: '/symbols/mulberry/throat.svg' },
        { revision: '8af4fcc6f7646464b3e69de7be307f5c', url: '/symbols/mulberry/through.svg' },
        {
          revision: 'b1d77cb4cc251ba909878673417e6b05',
          url: '/symbols/mulberry/throw_away_,_to.svg',
        },
        { revision: '45acab959aac65cc356ba9b2ae6a565e', url: '/symbols/mulberry/thumb.svg' },
        { revision: '3917408dd63a80daf63da7ee290bdfd8', url: '/symbols/mulberry/thumbs.svg' },
        {
          revision: 'd8c1585334f646012c95a44e79842106',
          url: '/symbols/mulberry/thunder_storm.svg',
        },
        { revision: '838f680468b46e6fdae79954234d1b2c', url: '/symbols/mulberry/tickle_,_to.svg' },
        { revision: '4fbac64a971d8a4c7a534a949a3ee7c6', url: '/symbols/mulberry/tidy_2_,_to.svg' },
        { revision: 'fd186c3f0b28221bb4697d053f1a6ba1', url: '/symbols/mulberry/tidy_up_,_to.svg' },
        { revision: '4244a60f1488e78d59380d8fe1b89e4e', url: '/symbols/mulberry/tie.svg' },
        { revision: 'ee908be383b723ffb846da28194a23bf', url: '/symbols/mulberry/tie_,_to.svg' },
        { revision: '1db079f6344b663a5339a427c6f6058a', url: '/symbols/mulberry/tie_2_,_to.svg' },
        { revision: 'e10285c08209a7894e977c54dff365d8', url: '/symbols/mulberry/tiger.svg' },
        { revision: '1317937b5ef7cb7ffd51ebc0f740a0f4', url: '/symbols/mulberry/tighten_,_to.svg' },
        { revision: 'e739126454b304b09a60a959457e8b03', url: '/symbols/mulberry/tights.svg' },
        { revision: '2aca1f90098bf25462545cc8adac75fa', url: '/symbols/mulberry/time_out.svg' },
        { revision: 'a437fcc8a1bc68dc8d8d557033e00da0', url: '/symbols/mulberry/timer_2.svg' },
        { revision: '06dd53743e2f2d9bcd5bcc3fe40e7617', url: '/symbols/mulberry/tin.svg' },
        { revision: 'ab6939d5b51836405a6afb4371ac48ba', url: '/symbols/mulberry/tin_can.svg' },
        { revision: '1c51aa13941ee64997d9f6f11e4fecbb', url: '/symbols/mulberry/tin_foil.svg' },
        {
          revision: 'f1bd22d2e95448e4390033e671167ed9',
          url: '/symbols/mulberry/tinned_apricots.svg',
        },
        {
          revision: '7a49028171866adda146d174e7bb2336',
          url: '/symbols/mulberry/tinned_cherries.svg',
        },
        {
          revision: '5472069c85f3a10709ee184d89589325',
          url: '/symbols/mulberry/tinned_mushroom_soup.svg',
        },
        {
          revision: '07ae52046b1cfbbe190d6e4a8718b219',
          url: '/symbols/mulberry/tinned_peaches.svg',
        },
        { revision: '542f4e4af0a2829432093ec0e36b8097', url: '/symbols/mulberry/tinned_pears.svg' },
        { revision: '7f6df73c1f2353eab13f45d88d5816fa', url: '/symbols/mulberry/tinned_peas.svg' },
        {
          revision: '1685bfe034a75f4022b83361b4877e5d',
          url: '/symbols/mulberry/tinned_pineapple.svg',
        },
        { revision: '5a4a2e76f9e8f18d73bf102c858b14b2', url: '/symbols/mulberry/tinned_plums.svg' },
        {
          revision: 'bd1055ff844baf7194023e4296e45cb9',
          url: '/symbols/mulberry/tinned_sweetcorn.svg',
        },
        {
          revision: 'e5148b7f8c769b2a5cf91d2b061b20aa',
          url: '/symbols/mulberry/tinned_tomato.svg',
        },
        { revision: '887e09e89908a3941594fd1b7c5cca67', url: '/symbols/mulberry/tinsel.svg' },
        { revision: 'e5fe1717c9db79c3306a94579d99ef68', url: '/symbols/mulberry/tippex.svg' },
        { revision: '1ec9fbd58aa5c2ecadbb839422b1d9e2', url: '/symbols/mulberry/tissues.svg' },
        { revision: '8b759513161fee58e8931530ec8c7898', url: '/symbols/mulberry/toad.svg' },
        { revision: '3131fe9388facc64421eb87994df685e', url: '/symbols/mulberry/toast.svg' },
        { revision: 'e06e97c547228073a0530bb99042c5a8', url: '/symbols/mulberry/toaster.svg' },
        { revision: 'ad6fa4d516af871f4ce4b5fee3ac47b8', url: '/symbols/mulberry/today.svg' },
        { revision: '5d3488bb2443401420a370c08ecfe614', url: '/symbols/mulberry/toe_nail.svg' },
        { revision: '1c28942e86d9fe9ebadce01f8b5416dd', url: '/symbols/mulberry/toilet.svg' },
        {
          revision: 'f9833111fa6ad8c07e71a0f60a006015',
          url: '/symbols/mulberry/toilet_,_go_to_the.svg',
        },
        { revision: '0dbb36805db4e16249d210aae09bff5c', url: '/symbols/mulberry/toilet_roll.svg' },
        { revision: '3b278eac532609f9d9aaf45634a459cd', url: '/symbols/mulberry/toilets.svg' },
        { revision: 'f894379dd5b699efc985146c780f177d', url: '/symbols/mulberry/tomato.svg' },
        { revision: '726404a2ed142813c8e84c971be0c79d', url: '/symbols/mulberry/tomato_juice.svg' },
        { revision: 'a6a94bb1280b762c60c109df4793c9d6', url: '/symbols/mulberry/tomato_slice.svg' },
        { revision: '8a255daa5c3c4207e699add6bff9d3f6', url: '/symbols/mulberry/tomb_1.svg' },
        { revision: 'cd0e9dfad2db2e8062c36d1f01f38969', url: '/symbols/mulberry/tomb_2.svg' },
        { revision: '38d51b6a067e7c970d12781bfd62fb9a', url: '/symbols/mulberry/tomorrow.svg' },
        { revision: 'ce4e9c07d7be15cfd502c298b115adad', url: '/symbols/mulberry/tongs.svg' },
        { revision: 'f38d4b169f63e64939963a67b4e7c888', url: '/symbols/mulberry/tongue.svg' },
        { revision: '3326292f070ef09d84169c51e677a180', url: '/symbols/mulberry/tooth.svg' },
        { revision: 'f4ac680f433794d1bd380b942f0df473', url: '/symbols/mulberry/toothache.svg' },
        { revision: '31e0c5e1476badb2479081a2fb80c436', url: '/symbols/mulberry/toothbrush.svg' },
        {
          revision: 'ff24c61270c45b09a83b7512f797e1c3',
          url: '/symbols/mulberry/toothbrush_electric.svg',
        },
        { revision: '1d4e3ffe880509818ca166cb26c1f755', url: '/symbols/mulberry/toothpaste.svg' },
        { revision: 'c7446c381b5174a506ad5cb06890f07c', url: '/symbols/mulberry/top.svg' },
        { revision: 'b52a1401eb3453e7cdb87a1f46fc1c4b', url: '/symbols/mulberry/top_2.svg' },
        { revision: '2ac04adce00a24aacaed5993e2c068b6', url: '/symbols/mulberry/topsoil.svg' },
        { revision: '401d7f6f52849163c7303903a1d9c540', url: '/symbols/mulberry/torch.svg' },
        { revision: 'e859a0931b7176b93115f8e2fb42b624', url: '/symbols/mulberry/torch_2.svg' },
        { revision: 'e892540b265c0855d42f84404be3a69b', url: '/symbols/mulberry/torch_3.svg' },
        { revision: 'e1be7145a717ed03e416fef23e86a74f', url: '/symbols/mulberry/tortoise.svg' },
        {
          revision: '37c08100c912f69a777c22452af92885',
          url: '/symbols/mulberry/toss_pancake_,_to.svg',
        },
        { revision: 'd5248bf87fd298fe9cfc38f13090cd68', url: '/symbols/mulberry/touch_,_to.svg' },
        { revision: 'dd75ab0ef0a77c2b64c62ffb2563a5bf', url: '/symbols/mulberry/touch_screen.svg' },
        { revision: '6f2728ed3fa510e0234748e8762288f7', url: '/symbols/mulberry/toupee.svg' },
        { revision: 'fe546ee864b8116c60c530558c6d9555', url: '/symbols/mulberry/towel.svg' },
        { revision: '87535911aa8b717925a645e1ec1ebcd5', url: '/symbols/mulberry/toy_box.svg' },
        { revision: '53618cf2ff96f715b73ab6f042682604', url: '/symbols/mulberry/toy_car.svg' },
        { revision: '908300966584a119184b4ebb6bd1385f', url: '/symbols/mulberry/toy_soldier.svg' },
        { revision: 'fcbfc4e1983f316fec9cfc0a5ff03e4d', url: '/symbols/mulberry/toys.svg' },
        { revision: 'c72b285cb0ca3934187d48981de24111', url: '/symbols/mulberry/trace_,_to.svg' },
        { revision: 'a7c6e1cc7c4b5d03aa22d39a40d17c56', url: '/symbols/mulberry/trachea.svg' },
        { revision: '97d41684ea730dc50aaaebfcea3dbc82', url: '/symbols/mulberry/tracksuit.svg' },
        { revision: '5c1a534a9b53c9bc2eb690b048663ace', url: '/symbols/mulberry/tractor.svg' },
        {
          revision: '5dab355d4c680bb912e0b19fbe22d3ce',
          url: '/symbols/mulberry/traffic_lights.svg',
        },
        { revision: 'c9bd7f2b187ee1919f47ee67a1368c63', url: '/symbols/mulberry/train.svg' },
        { revision: '56e34aa37dbf2667af8331465904e1f5', url: '/symbols/mulberry/trainers.svg' },
        { revision: '1c3d65da543c9289d5c6b8ea008b1f84', url: '/symbols/mulberry/trampoline.svg' },
        {
          revision: '98bae6ac64c867265f65ce59cc514c79',
          url: '/symbols/mulberry/trampoline_,_to.svg',
        },
        { revision: '61afb928518d8363ba7417a374f6e32d', url: '/symbols/mulberry/transparent.svg' },
        {
          revision: '88556216fb28365a46861481ecf817f7',
          url: '/symbols/mulberry/transport_car_,_to.svg',
        },
        { revision: '5cdabe7e39532fe10efaa9c0a15ae77e', url: '/symbols/mulberry/trap.svg' },
        { revision: '7632719863c902c56730070cf0140aa4', url: '/symbols/mulberry/trapezium.svg' },
        { revision: '380773d4d3fa62db8b959c5c1e127d50', url: '/symbols/mulberry/travel.svg' },
        { revision: 'bd6b80e5ade0480fb67b7841c8df5b09', url: '/symbols/mulberry/tray.svg' },
        { revision: 'b209eb801d2deddf5fe4bf83e34fd6de', url: '/symbols/mulberry/tree.svg' },
        {
          revision: 'f41825defbbf9e5a494770cb590f3163',
          url: '/symbols/mulberry/tree_ornament_chocolate.svg',
        },
        { revision: '80e8d71842f1814b7e92a6d37a0513c2', url: '/symbols/mulberry/tree_trunk.svg' },
        {
          revision: '00cfdbdc4dc2b3a5d939bc2cba11a100',
          url: '/symbols/mulberry/triangle_acute.svg',
        },
        {
          revision: '9caadaf3fd3ad5232c56622f98a4256c',
          url: '/symbols/mulberry/triangle_equilateral.svg',
        },
        {
          revision: 'c59066ec64c7dbaaaf8bffdca00955a5',
          url: '/symbols/mulberry/triangle_isosceles.svg',
        },
        {
          revision: 'fb79a6cbc9d08f6cb59f2e70c6e656e7',
          url: '/symbols/mulberry/triangle_obtuse.svg',
        },
        {
          revision: 'b94ebe38fe0b08e65e3d5b7f44810dd3',
          url: '/symbols/mulberry/triangle_right-angled.svg',
        },
        {
          revision: '1838db15ce2fc3a88a56dbfc33435431',
          url: '/symbols/mulberry/triangle_scalene.svg',
        },
        {
          revision: '79c48a85b14cc8dc5a35b310755f99ef',
          url: '/symbols/mulberry/trick_or_treat.svg',
        },
        { revision: '7f12f7cce93568c8f8ef0a89c586281d', url: '/symbols/mulberry/trim_,_to.svg' },
        {
          revision: '23065d7799b4b0130ebd339ccb95faf3',
          url: '/symbols/mulberry/trim_hedge_,_to.svg',
        },
        { revision: 'e8e0d7abeb3de3978fa624787603e0a2', url: '/symbols/mulberry/tripod.svg' },
        { revision: 'fe8046b181d9cdc82de386a694c6b40f', url: '/symbols/mulberry/trousers.svg' },
        { revision: '7ff18bf2175a47fa156d88f08400869e', url: '/symbols/mulberry/trowel.svg' },
        { revision: 'fd336daf5140a8b0ed408e5f0233506e', url: '/symbols/mulberry/tulip.svg' },
        { revision: '352698ce78a145bc3ce2bee78ffaa081', url: '/symbols/mulberry/tuna.svg' },
        { revision: 'e8628a185e2fea1fea655137f9fcfba0', url: '/symbols/mulberry/turkey.svg' },
        { revision: '81998022a049a7a844d9c2b855c969e2', url: '/symbols/mulberry/turkey_2.svg' },
        { revision: '618da83cffad396b09daa626195dc40d', url: '/symbols/mulberry/turn_,_to.svg' },
        {
          revision: '3afabcd55c25a77e38301ae5e1e33bbf',
          url: '/symbols/mulberry/turn_down_heat_,_to.svg',
        },
        {
          revision: 'e1a1115c3819b2e7889d2a253b88ff8b',
          url: '/symbols/mulberry/turn_down_light_,_to.svg',
        },
        {
          revision: '032bb5cdb8b29a66b60dfa9858c385b3',
          url: '/symbols/mulberry/turn_off_,_to.svg',
        },
        {
          revision: 'f59fe3b05c9cde40f4ea5138533c3394',
          url: '/symbols/mulberry/turn_off_light_switch_,_to.svg',
        },
        { revision: '2bb7b0f1b0b95ee879477e422539d87d', url: '/symbols/mulberry/turn_on_,_to.svg' },
        {
          revision: 'af4bf6a420e76aaca85f5598cbd1ea72',
          url: '/symbols/mulberry/turn_on_light_switch_,_to.svg',
        },
        {
          revision: 'e7bb486a9ea67de538e8a724d922a385',
          url: '/symbols/mulberry/turn_up_heat_,_to.svg',
        },
        {
          revision: 'fcd2c8c37efcf9d87cb266fbc00da4eb',
          url: '/symbols/mulberry/turn_up_light_,_to.svg',
        },
        { revision: '42e874fac0ce51d89035999805104dc0', url: '/symbols/mulberry/turnip.svg' },
        { revision: '8864072c8e9185b6a936426e46f3a97f', url: '/symbols/mulberry/turtle.svg' },
        { revision: '64d9e980652143230abc7fca4d0b3a77', url: '/symbols/mulberry/tv_drama.svg' },
        { revision: 'a3a6249d5366bb2c17f9312f344ffcaf', url: '/symbols/mulberry/twelve.svg' },
        { revision: '1bac379c8ef94db02709a4acb0627cc9', url: '/symbols/mulberry/twenty.svg' },
        {
          revision: 'fa23f5cdb04397b6f5ffb8f69ab02479',
          url: '/symbols/mulberry/twenty_five_percent.svg',
        },
        { revision: '76abf4d8309a6b3d8701a1e688f0d61b', url: '/symbols/mulberry/two.svg' },
        { revision: 'd1a4b008bc335c423e78cc04b1e2db03', url: '/symbols/mulberry/two_dots.svg' },
        { revision: '3b76030f822f67b321540f1e97f3b04d', url: '/symbols/mulberry/two_thirds.svg' },
        { revision: '864f2b79b14c5ad5a0d6ecd28e490894', url: '/symbols/mulberry/type_,_to.svg' },
        {
          revision: '581e71829ccf6f6478b1906be43bc1b1',
          url: '/symbols/mulberry/u_-_lower_case.svg',
        },
        { revision: 'bbd215a5a755dfdbb9bc450663211242', url: '/symbols/mulberry/ugly.svg' },
        { revision: '2c6434025b4231fcbfde4547f5380bd9', url: '/symbols/mulberry/umbrella.svg' },
        {
          revision: '74204f906d8757c0250730ab57d796e2',
          url: '/symbols/mulberry/unbuckle_,_to.svg',
        },
        {
          revision: '2664fbdfb8d22fe3cfda79d228515142',
          url: '/symbols/mulberry/unbutton_,_to.svg',
        },
        {
          revision: 'a1d6b86a3608f6a965cafe4ac8f4bc62',
          url: '/symbols/mulberry/unbutton_2_,_to.svg',
        },
        {
          revision: '1c927d5c1035b18f1ae8342f86ab855c',
          url: '/symbols/mulberry/uncle_maternal.svg',
        },
        {
          revision: 'a92b197cf573cf870a94ad878702bc46',
          url: '/symbols/mulberry/uncle_paternal.svg',
        },
        { revision: '5c8070c6f96c129fbe6130b60c0ef3f4', url: '/symbols/mulberry/under_1.svg' },
        { revision: '20f3dd0d9d242dd1ae404961641121ef', url: '/symbols/mulberry/underarm.svg' },
        {
          revision: 'f7966893362a7fef29eaca2ebd7e70e9',
          url: '/symbols/mulberry/underarm_hair.svg',
        },
        {
          revision: 'a2fab2aa115cb2ebdb3397480e2b7543',
          url: '/symbols/mulberry/underground_sign.svg',
        },
        {
          revision: 'aaf12d4321f30b2233fe77869723ea34',
          url: '/symbols/mulberry/underground_train.svg',
        },
        { revision: '30e4f950e828ac3287a1d2d507e5ebd9', url: '/symbols/mulberry/undress_,_to.svg' },
        { revision: '65cde338c1177c1872f0c15a92466ae9', url: '/symbols/mulberry/unlock_,_to.svg' },
        { revision: 'fbd45e791accb7ac024ce5677c7d38e3', url: '/symbols/mulberry/untie_,_to.svg' },
        { revision: '6df8a81f0fe7ee494613f01edf5f2aa2', url: '/symbols/mulberry/up.svg' },
        { revision: 'd492b0da81a81852b5293776fe6619be', url: '/symbols/mulberry/upper_arm.svg' },
        { revision: 'a7da36eff94ae070d9f27edd91ab3064', url: '/symbols/mulberry/usb_stick.svg' },
        {
          revision: '14d4020f7d9dd2f1a703569e74f5162d',
          url: '/symbols/mulberry/use_computer_,_to.svg',
        },
        {
          revision: '05b563a1b86ad5e777797537f1c4adbb',
          url: '/symbols/mulberry/v_-_lower_case.svg',
        },
        {
          revision: '09939dfb76338d7809a98749eb52dbf1',
          url: '/symbols/mulberry/vacuum_cleaner_1.svg',
        },
        {
          revision: '53ac666d600a60de69a4f7048645d65f',
          url: '/symbols/mulberry/vacuum_cleaner_2.svg',
        },
        {
          revision: '9a255beec27ffd3e39352e0b847c83df',
          url: '/symbols/mulberry/vacuum_cleaner_hand_held.svg',
        },
        { revision: '26e755ed478f45022f2808786cfaef47', url: '/symbols/mulberry/vagina.svg' },
        { revision: '2fd7b714a480b6ab623aace4f54856a9', url: '/symbols/mulberry/van.svg' },
        { revision: '6fd0294ec00cdf2ebf647ba97263b2ca', url: '/symbols/mulberry/varnish.svg' },
        { revision: 'c05bee705215b9e593aa3d264b7bf320', url: '/symbols/mulberry/vase.svg' },
        { revision: '1057266c1a5d625ba134510540a3e64f', url: '/symbols/mulberry/vegetables.svg' },
        {
          revision: '81468dd5d86bb4f8998d93ae602dc79e',
          url: '/symbols/mulberry/verbs_collective.svg',
        },
        {
          revision: '6581f8643f373772691b4f9a4421ed17',
          url: '/symbols/mulberry/vertical_blinds.svg',
        },
        { revision: '77daaa8da17c10a3da94cdc138ce9a19', url: '/symbols/mulberry/vest.svg' },
        { revision: 'e64bb2741e6c26e693f496e4971eddd5', url: '/symbols/mulberry/vice.svg' },
        { revision: 'f96e9d23276c9c397ce732d82269c9f1', url: '/symbols/mulberry/video_camera.svg' },
        { revision: 'e91aabb8eafd327f75fde9a856bb4e12', url: '/symbols/mulberry/video_player.svg' },
        { revision: '3e0495b0c1c4575eb2d6c94fa3fec2d8', url: '/symbols/mulberry/video_tape.svg' },
        { revision: '8ca6c61b94254deb34c13674009f51ca', url: '/symbols/mulberry/vine.svg' },
        { revision: '6837bca6881aada437eb76a63425bf55', url: '/symbols/mulberry/vinegar.svg' },
        { revision: '2339aadcc704baed7bab4c67ddc6b9fe', url: '/symbols/mulberry/visit_,_to.svg' },
        { revision: 'f2ae99344cc319285b010b1d6827ace7', url: '/symbols/mulberry/visitor_1a.svg' },
        { revision: '2fc630303a93924762ae79002cb11039', url: '/symbols/mulberry/visitor_1b.svg' },
        { revision: 'ce2ea9dea47a808018ed6f6bd76dbc24', url: '/symbols/mulberry/visor.svg' },
        { revision: '0d95792c0d7413e46d9cd1895547e834', url: '/symbols/mulberry/visor_2.svg' },
        { revision: 'dd83f21ad889b58d78d57e24e26473d2', url: '/symbols/mulberry/volleyball.svg' },
        { revision: '826a302c37393ddeabbaa8f9cc0a1295', url: '/symbols/mulberry/vomit_,_to.svg' },
        { revision: '2a2f4e0a1c4b149856058ba0c10d0acb', url: '/symbols/mulberry/vomit_2_,_to.svg' },
        { revision: '34beef1fce6ba2b629e901e791738b12', url: '/symbols/mulberry/vote_,_to.svg' },
        { revision: 'f6745baab35e9873b401b25cc5096197', url: '/symbols/mulberry/vulture.svg' },
        {
          revision: 'b1c2ad3232d142a1acfa71f2d136f071',
          url: '/symbols/mulberry/w_-_lower_case.svg',
        },
        { revision: '84bda697912c45797257c95d40b53bbb', url: '/symbols/mulberry/wafer.svg' },
        {
          revision: '0ff6f876be6bb5b1cc44a3344f0af099',
          url: '/symbols/mulberry/wag_tail_,_to.svg',
        },
        {
          revision: 'ed64dd3de5e5c01677451ecd96b996bc',
          url: '/symbols/mulberry/wag_tail_2_,_to.svg',
        },
        { revision: '673b6176272bccc187d2bfca94c98481', url: '/symbols/mulberry/waistcoat.svg' },
        { revision: '54e542e3c5a2e8849e733776b8c862e1', url: '/symbols/mulberry/wait_,_to.svg' },
        {
          revision: 'd06316a6eb9577dad32f1a9eece73962',
          url: '/symbols/mulberry/wait_table_,_to.svg',
        },
        { revision: '5bcbc3672be45f08d7616b9a4d9e4f51', url: '/symbols/mulberry/wake_up_,_to.svg' },
        { revision: '85a4b68c42858db916b4923923df38aa', url: '/symbols/mulberry/walk_,_to.svg' },
        {
          revision: '106257a7f248ea7265470850ad621a59',
          url: '/symbols/mulberry/walk_dog_,_to.svg',
        },
        {
          revision: 'd43229ba4f8f59015539d1d64d418695',
          url: '/symbols/mulberry/walk_downstairs_,_to.svg',
        },
        {
          revision: 'e852096d99a3fdafb2ecfe104b329497',
          url: '/symbols/mulberry/walk_up_to_,_to.svg',
        },
        {
          revision: 'fe445303a8aba93126a14ac75e27c3f0',
          url: '/symbols/mulberry/walk_upstairs_,_to.svg',
        },
        {
          revision: '7272f1329af0593e0a8b6301ada62753',
          url: '/symbols/mulberry/walking_frame.svg',
        },
        {
          revision: 'c73e753553a53e5cce213d7f708552ce',
          url: '/symbols/mulberry/walking_stick.svg',
        },
        { revision: '7b8a20c61597cf997081710bc788467f', url: '/symbols/mulberry/walkman.svg' },
        { revision: 'f8e6576c16b64e274a167d6597f553c3', url: '/symbols/mulberry/wall.svg' },
        { revision: 'bfafbed35027fb35b84fca32e5518a68', url: '/symbols/mulberry/wallet.svg' },
        { revision: 'de2da70c5cfb838d829d439de6650fb3', url: '/symbols/mulberry/walnut.svg' },
        { revision: '2cb40ec839a4c9522019c70a04079996', url: '/symbols/mulberry/walrus.svg' },
        { revision: '9bc9519e58bcfd47bf3578454a8b0290', url: '/symbols/mulberry/want_,_to.svg' },
        { revision: '9b9d5a6b332f62adcb3e88c15f3dfc99', url: '/symbols/mulberry/wardrobe.svg' },
        { revision: '8db97a171c84108d03d79d58f12c5f08', url: '/symbols/mulberry/warm_clothes.svg' },
        { revision: '885530ac623074872ccfff390e7f1e84', url: '/symbols/mulberry/warm_fire.svg' },
        {
          revision: 'fb2bc7c7b3a464a83fb82d724b786e3c',
          url: '/symbols/mulberry/warning_light.svg',
        },
        {
          revision: 'b5a77866d776c0a93014a4071381f877',
          url: '/symbols/mulberry/wash_clothes_,_to.svg',
        },
        {
          revision: 'd2095c36ad07d508e8af1776ad8b2555',
          url: '/symbols/mulberry/wash_face_,_to.svg',
        },
        {
          revision: 'f2e1414d4ba2e420519f7d20124c5d77',
          url: '/symbols/mulberry/wash_hands_,_to.svg',
        },
        { revision: '1fbb7ed97063c4ff57970317eb0e576d', url: '/symbols/mulberry/wash_up_,_to.svg' },
        {
          revision: 'ece0a35425da51e8e6cf818246bfa639',
          url: '/symbols/mulberry/wash_vegetables_,_to.svg',
        },
        {
          revision: '38438cce5beeae717a7cb60c119bfa6e',
          url: '/symbols/mulberry/washing_machine.svg',
        },
        {
          revision: 'ea1834b9956949f3285c9f332d7181d2',
          url: '/symbols/mulberry/washing_powder.svg',
        },
        {
          revision: '60fb8e8eb189d1282407812c2998fdaf',
          url: '/symbols/mulberry/washing_up_bowl.svg',
        },
        {
          revision: 'dbaffd894580ffb370e9a445b6ca6adc',
          url: '/symbols/mulberry/washing_up_liquid.svg',
        },
        { revision: 'c0d3c275d3918d72c7ebda386263d4f0', url: '/symbols/mulberry/wasp.svg' },
        {
          revision: 'f1906444305a0cc7f07ae285ebae3cce',
          url: '/symbols/mulberry/waste_paper_bin.svg',
        },
        { revision: '7514bb56eb8c2fc6f9ca3aa70edc7ac8', url: '/symbols/mulberry/watch.svg' },
        { revision: '450c2c8fc73a81a6b81e809c2bd96da4', url: '/symbols/mulberry/watch_,_to.svg' },
        { revision: 'ebf6df52ae3ffbcde5a8dcb1646a0658', url: '/symbols/mulberry/water.svg' },
        {
          revision: 'e78cd2a8a76f607dbca34211fa660c0a',
          url: '/symbols/mulberry/water_bottle_hamster.svg',
        },
        { revision: '65b23dfa9e478bc6fea37b30e5c38ab3', url: '/symbols/mulberry/water_bowl.svg' },
        { revision: '3ab50199758ec5acdb201c1dac19f315', url: '/symbols/mulberry/water_pistol.svg' },
        {
          revision: 'da64feeb0dc67b1a11546cb8e8eb29e1',
          url: '/symbols/mulberry/water_plants_,_to.svg',
        },
        { revision: '3f50d198feebfec9cb92828c573acbc7', url: '/symbols/mulberry/water_table.svg' },
        { revision: '8dd79cfe6f5b0cdc779c701779925a4d', url: '/symbols/mulberry/watering_can.svg' },
        { revision: 'f45d2f837697c3ede93ea82911ca2298', url: '/symbols/mulberry/watermelon.svg' },
        { revision: 'b4f9aa4aa7d1746edec2679c04773c2d', url: '/symbols/mulberry/waterproof.svg' },
        { revision: 'f4ede966214ec682787577ff5b511f00', url: '/symbols/mulberry/wavy.svg' },
        { revision: 'b40a6487c377f3b237c1bc233e1237e2', url: '/symbols/mulberry/weak_link.svg' },
        {
          revision: 'bd63f9ba720a8f0298761660e5e727e8',
          url: '/symbols/mulberry/wear_helmet_,_to.svg',
        },
        { revision: '35a89ef1132a4cdf2b6d9dfd99f22520', url: '/symbols/mulberry/web_address.svg' },
        { revision: 'a6d43bf81eba21d3a33924ac4dfb86ef', url: '/symbols/mulberry/webbed_foot.svg' },
        { revision: '23b2e4c82d14bae36baf8883463cd286', url: '/symbols/mulberry/webcam.svg' },
        { revision: '512a986f92b3c02eb68d9ea57e431109', url: '/symbols/mulberry/weeds.svg' },
        { revision: 'b84b853fecc9612342e16c4b54ee603e', url: '/symbols/mulberry/week.svg' },
        { revision: '7edca92688c3f77b5e51fc1bb03b88db', url: '/symbols/mulberry/week_1.svg' },
        { revision: '7d15136b8ff496ce53114453c60c1869', url: '/symbols/mulberry/weekend.svg' },
        { revision: '9f7d965391142b1689583adbe7fe07a3', url: '/symbols/mulberry/weigh_,_to.svg' },
        {
          revision: 'abe9127b84e7625246d3546c689a1187',
          url: '/symbols/mulberry/weigh_food_,_to.svg',
        },
        {
          revision: 'b0b9dcc2d0ec79dc1e06029f091297f4',
          url: '/symbols/mulberry/weigh_person_,_to.svg',
        },
        {
          revision: '63f8142d611ab5dc203e0fadc0dc4b48',
          url: '/symbols/mulberry/wellington_boots.svg',
        },
        { revision: 'fe6369db6666357eee731133420067f6', url: '/symbols/mulberry/west.svg' },
        { revision: '2a7b517f86124215d715a0906d517f44', url: '/symbols/mulberry/wet.svg' },
        { revision: '9b7510183e5fc725ceefa37a28e3bbde', url: '/symbols/mulberry/wet_1.svg' },
        { revision: '36092d470cf154689dce9d176bc740fb', url: '/symbols/mulberry/what.svg' },
        { revision: 'bff8f4aeee789626baf1e74f80063313', url: '/symbols/mulberry/wheelbarrow.svg' },
        { revision: '62b74277308a099f91d8ac24f7b4fded', url: '/symbols/mulberry/wheelchair.svg' },
        {
          revision: '0247c0857292a3de6c07ba3547716fbd',
          url: '/symbols/mulberry/wheelchair_and_switch_mount.svg',
        },
        {
          revision: '8c2fb03702f9e416e8e17653b5afd702',
          url: '/symbols/mulberry/wheelchair_communication_aid.svg',
        },
        { revision: '9f365e96d5d1180a2e996e113b42d458', url: '/symbols/mulberry/wheelie_bin.svg' },
        {
          revision: 'e8eeb6b65f3ce187e1701962ee6cb8ba',
          url: '/symbols/mulberry/wheelie_bin_2.svg',
        },
        {
          revision: 'c9c006aaa03b1bb7b1921ff4247c66cc',
          url: '/symbols/mulberry/wheelie_bin_3.svg',
        },
        { revision: '999a64f2cae9fd4a57096bacfcd2b6c8', url: '/symbols/mulberry/when.svg' },
        { revision: 'ea1653b5f930daf1b46f646658ea705f', url: '/symbols/mulberry/where.svg' },
        { revision: '4fed48a12c039e91a6d3738d97d60be9', url: '/symbols/mulberry/where_1.svg' },
        { revision: '57df07a605a4925be7d0c45c7da45fe2', url: '/symbols/mulberry/which.svg' },
        { revision: '5ee2ea6372e31bdb8c0f2b6535464359', url: '/symbols/mulberry/whisk.svg' },
        { revision: '45829406c1c26b54da7a0a1fb940dde1', url: '/symbols/mulberry/whisk_,_to.svg' },
        { revision: '5ead1da36b81beeb5c81616023881ede', url: '/symbols/mulberry/whiskers.svg' },
        { revision: '9fb8218202bdafe917aea677082d7d1f', url: '/symbols/mulberry/whisper_,_to.svg' },
        { revision: '400ee2bfda4fdb61d9f5c9dd2a9d9bfc', url: '/symbols/mulberry/white.svg' },
        { revision: '87ffed7ac1fc79fba137dd3cbafb6c6b', url: '/symbols/mulberry/whiteboard.svg' },
        { revision: '9e5a713c284b3a0c5084c9f578b0e566', url: '/symbols/mulberry/who.svg' },
        { revision: 'fdbe158215d432b67ee90e0231e3243f', url: '/symbols/mulberry/whole.svg' },
        { revision: '14e4d4fbd71846879f4a65d1b6eddad9', url: '/symbols/mulberry/why.svg' },
        { revision: 'b9b06d94121aed013df188dd6374b454', url: '/symbols/mulberry/wife.svg' },
        { revision: '36f256f3917035511042701544fa10d2', url: '/symbols/mulberry/wig_1.svg' },
        { revision: 'df9c052cc7a46da87d057fad9c68c75a', url: '/symbols/mulberry/wig_2.svg' },
        { revision: 'ed317f4b85ea4515d45d2bda7e2f0a2b', url: '/symbols/mulberry/wiggle_,_to.svg' },
        { revision: 'b1c9de4da9015254fe727e168ed2dcfb', url: '/symbols/mulberry/window.svg' },
        { revision: 'a7c6e1cc7c4b5d03aa22d39a40d17c56', url: '/symbols/mulberry/windpipe.svg' },
        { revision: '5e457b2bfe75630c23aab964c1b58b81', url: '/symbols/mulberry/wine.svg' },
        { revision: '6eeef3a4052ea63ce2d0adc07735c8a2', url: '/symbols/mulberry/wing.svg' },
        { revision: 'ecfedb5de8bdea0143c936dafa1fa1a7', url: '/symbols/mulberry/winner.svg' },
        { revision: 'be434c1517c05ab353851ffcd356e9be', url: '/symbols/mulberry/winter.svg' },
        {
          revision: '42bff1eb065d4ef00682103be440c941',
          url: '/symbols/mulberry/wipe_table_,_to.svg',
        },
        { revision: 'e54918f12e6f5d6c2eb58660e9f3f1fb', url: '/symbols/mulberry/wire_break.svg' },
        { revision: '360be1a139986f2dd15b72d2a3aef87b', url: '/symbols/mulberry/wishbone.svg' },
        { revision: 'e4c7254e46448623f85f84af607bad04', url: '/symbols/mulberry/witch.svg' },
        { revision: '667befdee500186ca6c07d3158648ba1', url: '/symbols/mulberry/witches_hat.svg' },
        { revision: '219017cb1a2c28757d9169f6e8f7fad4', url: '/symbols/mulberry/wolf.svg' },
        { revision: '9ceb06f5d9ecdb3d869820d312293bfa', url: '/symbols/mulberry/wood.svg' },
        { revision: 'e7e88e8d6b75845a0017efda594561c5', url: '/symbols/mulberry/wood_lathe.svg' },
        { revision: '3f9281fba528765c2aff6d4087104d90', url: '/symbols/mulberry/wooden_spoon.svg' },
        { revision: '30da2551955c22f5ed251442cd461ae0', url: '/symbols/mulberry/woodstain.svg' },
        { revision: 'a7377121a89d11c9afbc63542e48cb01', url: '/symbols/mulberry/wool.svg' },
        { revision: '6db105ba1ce5f3077d628ad9da9b05be', url: '/symbols/mulberry/work_,_to.svg' },
        { revision: '28b6c96751ba20664ccfb46acb58db04', url: '/symbols/mulberry/work_2_,_to.svg' },
        { revision: '82683c6489a01b853748dc355d66acd4', url: '/symbols/mulberry/work_book.svg' },
        { revision: 'c6ef50a597c694e886442f0e05089adb', url: '/symbols/mulberry/worksheet.svg' },
        { revision: '24ca9de0d3cdf2ed349f3ecb0ccab831', url: '/symbols/mulberry/world.svg' },
        { revision: 'fb3373bc17bf9ed03e9b4dcd4581b60d', url: '/symbols/mulberry/worried_lady.svg' },
        { revision: '1b3a5e3f1705e6e1c82a1955035a4131', url: '/symbols/mulberry/worried_man.svg' },
        { revision: 'd1e650e03bf42cc5e938c81c10b31f76', url: '/symbols/mulberry/wrap_,_to.svg' },
        {
          revision: 'c01a1bd2bac4d5a9c6150ccca680bf70',
          url: '/symbols/mulberry/wrapping_paper.svg',
        },
        { revision: '9e1fd0efbda7d994d81d7cef41d476dc', url: '/symbols/mulberry/wrench.svg' },
        { revision: 'a4ba1f7482534ebc9ae64ad89aa4eb33', url: '/symbols/mulberry/wrestle_,_to.svg' },
        { revision: '8697a9d2b34a81dbe89637b0cb67da45', url: '/symbols/mulberry/wrinkled.svg' },
        { revision: '78a853a1cb92006caa57acae6c8cf188', url: '/symbols/mulberry/wrist.svg' },
        { revision: '059c9ab213b09cf8dc7f902d84b2457f', url: '/symbols/mulberry/write_,_to.svg' },
        {
          revision: 'e66a8a2b5160179fcf335acfc2416d9e',
          url: '/symbols/mulberry/write_cheque_,_to.svg',
        },
        {
          revision: 'c0878d279557d233aa84623149e4672b',
          url: '/symbols/mulberry/write_letter_,_to.svg',
        },
        {
          revision: '2d2295694b6e47c627451a0db141cac9',
          url: '/symbols/mulberry/wrong_thought.svg',
        },
        {
          revision: 'bf32f57883ca446f8df480ed36789065',
          url: '/symbols/mulberry/x_-_lower_case.svg',
        },
        { revision: 'e959a660374bfc8c74eb8610567a3979', url: '/symbols/mulberry/xray.svg' },
        { revision: '605121f89414003c6f10085de58031b0', url: '/symbols/mulberry/xylophone.svg' },
        {
          revision: '0814cc72a0c0304a7515053379a8378b',
          url: '/symbols/mulberry/y_-_lower_case.svg',
        },
        { revision: '2154a385ea3cd219f274f6eb350f1fe6', url: '/symbols/mulberry/yawn_,_to.svg' },
        { revision: '6c3869dba648bbbd1ac8019f22db68f5', url: '/symbols/mulberry/yellow.svg' },
        { revision: 'd9c6634d50f583ec23560c860a5e3df1', url: '/symbols/mulberry/yesterday.svg' },
        { revision: 'e1400c25f751dca52eb9f48ab4172bf9', url: '/symbols/mulberry/yo-yo.svg' },
        { revision: '854b7d2b3ad6e08c5ef33155a5bc1827', url: '/symbols/mulberry/yogurt.svg' },
        {
          revision: '126309a1407e2f957f3c17639c52e74b',
          url: '/symbols/mulberry/yorkshire_pudding.svg',
        },
        { revision: '4bb4ea380f400fdf115c8214e26d8c10', url: '/symbols/mulberry/young.svg' },
        { revision: '3b4466e36d17b8ad76368414fde7d9d8', url: '/symbols/mulberry/yucky.svg' },
        { revision: '1c2660515bebffa5e44ce4e691e7b643', url: '/symbols/mulberry/yule_log.svg' },
        { revision: '1bed3091fe7e6cfd31464735e703a437', url: '/symbols/mulberry/yummy.svg' },
        {
          revision: 'b7949972c4a572491cfb1567a23ef9c1',
          url: '/symbols/mulberry/z_-_lower_case.svg',
        },
        { revision: '779abf0cd36f4b67b89554435b9fa976', url: '/symbols/mulberry/zebra.svg' },
        {
          revision: '85b358072015e765c529e22249e9046c',
          url: '/symbols/mulberry/zebra_crossing.svg',
        },
        { revision: 'f46627f8ed56a5179c2e4e9128dc362b', url: '/symbols/mulberry/zip.svg' },
        { revision: '79b3aec276a2213e0cc4c2a33bf179e5', url: '/symbols/mulberry/zoom_,_to.svg' },
        { revision: 'c0af2f507b369b085b35ef4bbe3bcf1e', url: '/vercel.svg' },
        { revision: 'a2760511c65806022ad20adf74370ff3', url: '/window.svg' },
      ],
      skipWaiting: !0,
      clientsClaim: !0,
      navigationPreload: !0,
      runtimeCaching: [
        {
          matcher: ({ request: e }) => 'navigate' === e.mode,
          handler: new ee({
            cacheName: 'pages-cache',
            plugins: [new eg({ maxEntries: 30, maxAgeSeconds: 604800 })],
          }),
        },
        {
          matcher: ({ url: e }) =>
            e.pathname.startsWith('/api/') ||
            '/' === e.pathname ||
            e.pathname.startsWith('/_next/data/'),
          handler: new eR({
            cacheName: 'api-cache',
            plugins: [new eg({ maxEntries: 100, maxAgeSeconds: 86400 })],
          }),
        },
        {
          matcher: ({ url: e }) => e.pathname.startsWith('/symbols/'),
          handler: new eE({
            cacheName: 'symbols-cache',
            plugins: [new eg({ maxEntries: 500, maxAgeSeconds: 2592e3 })],
          }),
        },
        {
          matcher: ({ url: e }) => e.pathname.startsWith('/uploads/'),
          handler: new eE({
            cacheName: 'uploads-cache',
            plugins: [new eg({ maxEntries: 200, maxAgeSeconds: 2592e3 })],
          }),
        },
        {
          matcher: ({ url: e }) =>
            e.pathname.startsWith('/_next/static/') ||
            e.pathname.includes('/fonts/') ||
            e.pathname.endsWith('.css') ||
            e.pathname.endsWith('.js'),
          handler: new eR({
            cacheName: 'static-cache',
            plugins: [new eg({ maxEntries: 100, maxAgeSeconds: 2592e3 })],
          }),
        },
        {
          matcher: ({ url: e }) => e.pathname.startsWith('/images/'),
          handler: new eE({
            cacheName: 'images-cache',
            plugins: [new eg({ maxEntries: 20, maxAgeSeconds: 2592e3 })],
          }),
        },
        ...eD,
      ],
    });
  async function eC() {
    try {
      let e = await caches.open('timma-pending-actions');
      for (let t of await e.keys())
        try {
          let a = await e.match(t);
          if (!a) continue;
          let s = await a.text();
          (await fetch(t.url, { method: t.method, headers: t.headers, body: s }),
            await e.delete(t));
        } catch {
          break;
        }
    } catch {}
  }
  (self.addEventListener('sync', (e) => {
    'timma-sync' === e.tag && e.waitUntil(eC());
  }),
    eN.addEventListeners());
})();
