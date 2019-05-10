(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.assist = factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var runtime_1 = createCommonjsModule(function (module) {
	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var runtime = (function (exports) {

	  var Op = Object.prototype;
	  var hasOwn = Op.hasOwnProperty;
	  var undefined; // More compressible than void 0.
	  var $Symbol = typeof Symbol === "function" ? Symbol : {};
	  var iteratorSymbol = $Symbol.iterator || "@@iterator";
	  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	    var generator = Object.create(protoGenerator.prototype);
	    var context = new Context(tryLocsList || []);

	    // The ._invoke method unifies the implementations of the .next,
	    // .throw, and .return methods.
	    generator._invoke = makeInvokeMethod(innerFn, self, context);

	    return generator;
	  }
	  exports.wrap = wrap;

	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }

	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";

	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};

	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}

	  // This is a polyfill for %IteratorPrototype% for environments that
	  // don't natively support it.
	  var IteratorPrototype = {};
	  IteratorPrototype[iteratorSymbol] = function () {
	    return this;
	  };

	  var getProto = Object.getPrototypeOf;
	  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
	  if (NativeIteratorPrototype &&
	      NativeIteratorPrototype !== Op &&
	      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	    // This environment has a native %IteratorPrototype%; use it instead
	    // of the polyfill.
	    IteratorPrototype = NativeIteratorPrototype;
	  }

	  var Gp = GeneratorFunctionPrototype.prototype =
	    Generator.prototype = Object.create(IteratorPrototype);
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunctionPrototype[toStringTagSymbol] =
	    GeneratorFunction.displayName = "GeneratorFunction";

	  // Helper for defining the .next, .throw, and .return methods of the
	  // Iterator interface in terms of a single ._invoke method.
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function(method) {
	      prototype[method] = function(arg) {
	        return this._invoke(method, arg);
	      };
	    });
	  }

	  exports.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        // For the native GeneratorFunction constructor, the best we can
	        // do is to check its .name property.
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };

	  exports.mark = function(genFun) {
	    if (Object.setPrototypeOf) {
	      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	      if (!(toStringTagSymbol in genFun)) {
	        genFun[toStringTagSymbol] = "GeneratorFunction";
	      }
	    }
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };

	  // Within the body of any async function, `await x` is transformed to
	  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	  // `hasOwn.call(value, "__await")` to determine if the yielded value is
	  // meant to be awaited.
	  exports.awrap = function(arg) {
	    return { __await: arg };
	  };

	  function AsyncIterator(generator) {
	    function invoke(method, arg, resolve, reject) {
	      var record = tryCatch(generator[method], generator, arg);
	      if (record.type === "throw") {
	        reject(record.arg);
	      } else {
	        var result = record.arg;
	        var value = result.value;
	        if (value &&
	            typeof value === "object" &&
	            hasOwn.call(value, "__await")) {
	          return Promise.resolve(value.__await).then(function(value) {
	            invoke("next", value, resolve, reject);
	          }, function(err) {
	            invoke("throw", err, resolve, reject);
	          });
	        }

	        return Promise.resolve(value).then(function(unwrapped) {
	          // When a yielded Promise is resolved, its final value becomes
	          // the .value of the Promise<{value,done}> result for the
	          // current iteration.
	          result.value = unwrapped;
	          resolve(result);
	        }, function(error) {
	          // If a rejected Promise was yielded, throw the rejection back
	          // into the async generator function so it can be handled there.
	          return invoke("throw", error, resolve, reject);
	        });
	      }
	    }

	    var previousPromise;

	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return new Promise(function(resolve, reject) {
	          invoke(method, arg, resolve, reject);
	        });
	      }

	      return previousPromise =
	        // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(
	          callInvokeWithMethodAndArg,
	          // Avoid propagating failures to Promises returned by later
	          // invocations of the iterator.
	          callInvokeWithMethodAndArg
	        ) : callInvokeWithMethodAndArg();
	    }

	    // Define the unified helper method that is used to implement .next,
	    // .throw, and .return (see defineIteratorMethods).
	    this._invoke = enqueue;
	  }

	  defineIteratorMethods(AsyncIterator.prototype);
	  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	    return this;
	  };
	  exports.AsyncIterator = AsyncIterator;

	  // Note that simple async functions are implemented on top of
	  // AsyncIterator objects; they just return a Promise for the value of
	  // the final result produced by the iterator.
	  exports.async = function(innerFn, outerFn, self, tryLocsList) {
	    var iter = new AsyncIterator(
	      wrap(innerFn, outerFn, self, tryLocsList)
	    );

	    return exports.isGeneratorFunction(outerFn)
	      ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function(result) {
	          return result.done ? result.value : iter.next();
	        });
	  };

	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;

	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }

	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }

	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }

	      context.method = method;
	      context.arg = arg;

	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          var delegateResult = maybeInvokeDelegate(delegate, context);
	          if (delegateResult) {
	            if (delegateResult === ContinueSentinel) continue;
	            return delegateResult;
	          }
	        }

	        if (context.method === "next") {
	          // Setting context._sent for legacy support of Babel's
	          // function.sent implementation.
	          context.sent = context._sent = context.arg;

	        } else if (context.method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw context.arg;
	          }

	          context.dispatchException(context.arg);

	        } else if (context.method === "return") {
	          context.abrupt("return", context.arg);
	        }

	        state = GenStateExecuting;

	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;

	          if (record.arg === ContinueSentinel) {
	            continue;
	          }

	          return {
	            value: record.arg,
	            done: context.done
	          };

	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          // Dispatch the exception by looping back around to the
	          // context.dispatchException(context.arg) call above.
	          context.method = "throw";
	          context.arg = record.arg;
	        }
	      }
	    };
	  }

	  // Call delegate.iterator[context.method](context.arg) and handle the
	  // result, either by returning a { value, done } result from the
	  // delegate iterator, or by modifying context.method and context.arg,
	  // setting context.delegate to null, and returning the ContinueSentinel.
	  function maybeInvokeDelegate(delegate, context) {
	    var method = delegate.iterator[context.method];
	    if (method === undefined) {
	      // A .throw or .return when the delegate iterator has no .throw
	      // method always terminates the yield* loop.
	      context.delegate = null;

	      if (context.method === "throw") {
	        // Note: ["return"] must be used for ES3 parsing compatibility.
	        if (delegate.iterator["return"]) {
	          // If the delegate iterator has a return method, give it a
	          // chance to clean up.
	          context.method = "return";
	          context.arg = undefined;
	          maybeInvokeDelegate(delegate, context);

	          if (context.method === "throw") {
	            // If maybeInvokeDelegate(context) changed context.method from
	            // "return" to "throw", let that override the TypeError below.
	            return ContinueSentinel;
	          }
	        }

	        context.method = "throw";
	        context.arg = new TypeError(
	          "The iterator does not provide a 'throw' method");
	      }

	      return ContinueSentinel;
	    }

	    var record = tryCatch(method, delegate.iterator, context.arg);

	    if (record.type === "throw") {
	      context.method = "throw";
	      context.arg = record.arg;
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    var info = record.arg;

	    if (! info) {
	      context.method = "throw";
	      context.arg = new TypeError("iterator result is not an object");
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    if (info.done) {
	      // Assign the result of the finished delegate to the temporary
	      // variable specified by delegate.resultName (see delegateYield).
	      context[delegate.resultName] = info.value;

	      // Resume execution at the desired location (see delegateYield).
	      context.next = delegate.nextLoc;

	      // If context.method was "throw" but the delegate handled the
	      // exception, let the outer generator proceed normally. If
	      // context.method was "next", forget context.arg since it has been
	      // "consumed" by the delegate iterator. If context.method was
	      // "return", allow the original .return call to continue in the
	      // outer generator.
	      if (context.method !== "return") {
	        context.method = "next";
	        context.arg = undefined;
	      }

	    } else {
	      // Re-yield the result returned by the delegate method.
	      return info;
	    }

	    // The delegate iterator is finished, so forget it and continue with
	    // the outer generator.
	    context.delegate = null;
	    return ContinueSentinel;
	  }

	  // Define Generator.prototype.{next,throw,return} in terms of the
	  // unified ._invoke helper method.
	  defineIteratorMethods(Gp);

	  Gp[toStringTagSymbol] = "Generator";

	  // A Generator should always return itself as the iterator object when the
	  // @@iterator function is called on it. Some browsers' implementations of the
	  // iterator prototype chain incorrectly implement this, causing the Generator
	  // object to not be returned from this call. This ensures that doesn't happen.
	  // See https://github.com/facebook/regenerator/issues/274 for more details.
	  Gp[iteratorSymbol] = function() {
	    return this;
	  };

	  Gp.toString = function() {
	    return "[object Generator]";
	  };

	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };

	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }

	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }

	    this.tryEntries.push(entry);
	  }

	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }

	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }

	  exports.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();

	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }

	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };

	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }

	      if (typeof iterable.next === "function") {
	        return iterable;
	      }

	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }

	          next.value = undefined;
	          next.done = true;

	          return next;
	        };

	        return next.next = next;
	      }
	    }

	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  exports.values = values;

	  function doneResult() {
	    return { value: undefined, done: true };
	  }

	  Context.prototype = {
	    constructor: Context,

	    reset: function(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      // Resetting context._sent for legacy support of Babel's
	      // function.sent implementation.
	      this.sent = this._sent = undefined;
	      this.done = false;
	      this.delegate = null;

	      this.method = "next";
	      this.arg = undefined;

	      this.tryEntries.forEach(resetTryEntry);

	      if (!skipTempReset) {
	        for (var name in this) {
	          // Not sure about the optimal order of these conditions:
	          if (name.charAt(0) === "t" &&
	              hasOwn.call(this, name) &&
	              !isNaN(+name.slice(1))) {
	            this[name] = undefined;
	          }
	        }
	      }
	    },

	    stop: function() {
	      this.done = true;

	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }

	      return this.rval;
	    },

	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }

	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;

	        if (caught) {
	          // If the dispatched exception was caught by a catch block,
	          // then let that catch block handle the exception normally.
	          context.method = "next";
	          context.arg = undefined;
	        }

	        return !! caught;
	      }

	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;

	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }

	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");

	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }

	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },

	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }

	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg <= finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }

	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;

	      if (finallyEntry) {
	        this.method = "next";
	        this.next = finallyEntry.finallyLoc;
	        return ContinueSentinel;
	      }

	      return this.complete(record);
	    },

	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }

	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = this.arg = record.arg;
	        this.method = "return";
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }

	      return ContinueSentinel;
	    },

	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },

	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }

	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },

	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };

	      if (this.method === "next") {
	        // Deliberately forget the last sent value so that we don't
	        // accidentally pass it on to the delegate.
	        this.arg = undefined;
	      }

	      return ContinueSentinel;
	    }
	  };

	  // Regardless of whether this script is executing as a CommonJS module
	  // or not, return the runtime object so that we can declare the variable
	  // regeneratorRuntime in the outer scope, which allows this module to be
	  // injected easily by `bin/regenerator --include-runtime script.js`.
	  return exports;

	}(
	  // If this script is executing as a CommonJS module, use module.exports
	  // as the regeneratorRuntime namespace. Otherwise create a new empty
	  // object. Either way, the resulting object will be used to initialize
	  // the regeneratorRuntime variable at the top of this file.
	  module.exports
	));

	try {
	  regeneratorRuntime = runtime;
	} catch (accidentalStrictMode) {
	  // This module should not be running in strict mode, so the above
	  // assignment should always work unless something is misconfigured. Just
	  // in case runtime.js accidentally runs in strict mode, we can escape
	  // strict mode using a global Function call. This could conceivably fail
	  // if a Content Security Policy forbids using Function, but in that case
	  // the proper solution is to fix the accidental strict mode problem. If
	  // you've misconfigured your bundler to force strict mode and applied a
	  // CSP to forbid Function, and you're not willing to fix either of those
	  // problems, please detail your unique predicament in a GitHub issue.
	  Function("r", "regeneratorRuntime = r")(runtime);
	}
	});

	var regenerator = runtime_1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	  try {
	    var info = gen[key](arg);
	    var value = info.value;
	  } catch (error) {
	    reject(error);
	    return;
	  }

	  if (info.done) {
	    resolve(value);
	  } else {
	    Promise.resolve(value).then(_next, _throw);
	  }
	}

	function _asyncToGenerator(fn) {
	  return function () {
	    var self = this,
	        args = arguments;
	    return new Promise(function (resolve, reject) {
	      var gen = fn.apply(self, args);

	      function _next(value) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
	      }

	      function _throw(err) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
	      }

	      _next(undefined);
	    });
	  };
	}

	var asyncToGenerator = _asyncToGenerator;

	var _typeof_1 = createCommonjsModule(function (module) {
	function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

	function _typeof(obj) {
	  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
	    module.exports = _typeof = function _typeof(obj) {
	      return _typeof2(obj);
	    };
	  } else {
	    module.exports = _typeof = function _typeof(obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
	    };
	  }

	  return _typeof(obj);
	}

	module.exports = _typeof;
	});

	var _global = createCommonjsModule(function (module) {
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
	});

	var _core = createCommonjsModule(function (module) {
	var core = module.exports = { version: '2.6.5' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
	});
	var _core_1 = _core.version;

	var _isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var _anObject = function (it) {
	  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};

	var _fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var _descriptors = !_fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var document$1 = _global.document;
	// typeof document.createElement is 'object' in old IE
	var is = _isObject(document$1) && _isObject(document$1.createElement);
	var _domCreate = function (it) {
	  return is ? document$1.createElement(it) : {};
	};

	var _ie8DomDefine = !_descriptors && !_fails(function () {
	  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
	});

	// 7.1.1 ToPrimitive(input [, PreferredType])

	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var _toPrimitive = function (it, S) {
	  if (!_isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var dP = Object.defineProperty;

	var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  _anObject(O);
	  P = _toPrimitive(P, true);
	  _anObject(Attributes);
	  if (_ie8DomDefine) try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var _objectDp = {
		f: f
	};

	var _propertyDesc = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var _hide = _descriptors ? function (object, key, value) {
	  return _objectDp.f(object, key, _propertyDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var hasOwnProperty = {}.hasOwnProperty;
	var _has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var id = 0;
	var px = Math.random();
	var _uid = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

	var _library = false;

	var _shared = createCommonjsModule(function (module) {
	var SHARED = '__core-js_shared__';
	var store = _global[SHARED] || (_global[SHARED] = {});

	(module.exports = function (key, value) {
	  return store[key] || (store[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: _core.version,
	  mode: 'global',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var _functionToString = _shared('native-function-to-string', Function.toString);

	var _redefine = createCommonjsModule(function (module) {
	var SRC = _uid('src');

	var TO_STRING = 'toString';
	var TPL = ('' + _functionToString).split(TO_STRING);

	_core.inspectSource = function (it) {
	  return _functionToString.call(it);
	};

	(module.exports = function (O, key, val, safe) {
	  var isFunction = typeof val == 'function';
	  if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
	  if (O[key] === val) return;
	  if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
	  if (O === _global) {
	    O[key] = val;
	  } else if (!safe) {
	    delete O[key];
	    _hide(O, key, val);
	  } else if (O[key]) {
	    O[key] = val;
	  } else {
	    _hide(O, key, val);
	  }
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, TO_STRING, function toString() {
	  return typeof this == 'function' && this[SRC] || _functionToString.call(this);
	});
	});

	var _aFunction = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};

	// optional / simple context binding

	var _ctx = function (fn, that, length) {
	  _aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
	  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
	  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
	  var key, own, out, exp;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    // export native or passed
	    out = (own ? target : source)[key];
	    // bind timers to global for call from export context
	    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
	    // extend global
	    if (target) _redefine(target, key, out, type & $export.U);
	    // export
	    if (exports[key] != out) _hide(exports, key, exp);
	    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
	  }
	};
	_global.core = _core;
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	var _export = $export;

	// 7.2.1 RequireObjectCoercible(argument)
	var _defined = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};

	// 7.1.13 ToObject(argument)

	var _toObject = function (it) {
	  return Object(_defined(it));
	};

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	var _toInteger = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

	var max = Math.max;
	var min = Math.min;
	var _toAbsoluteIndex = function (index, length) {
	  index = _toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

	// 7.1.15 ToLength

	var min$1 = Math.min;
	var _toLength = function (it) {
	  return it > 0 ? min$1(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

	var _arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
	  var O = _toObject(this);
	  var len = _toLength(O.length);
	  var to = _toAbsoluteIndex(target, len);
	  var from = _toAbsoluteIndex(start, len);
	  var end = arguments.length > 2 ? arguments[2] : undefined;
	  var count = Math.min((end === undefined ? len : _toAbsoluteIndex(end, len)) - from, len - to);
	  var inc = 1;
	  if (from < to && to < from + count) {
	    inc = -1;
	    from += count - 1;
	    to += count - 1;
	  }
	  while (count-- > 0) {
	    if (from in O) O[to] = O[from];
	    else delete O[to];
	    to += inc;
	    from += inc;
	  } return O;
	};

	var _wks = createCommonjsModule(function (module) {
	var store = _shared('wks');

	var Symbol = _global.Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function (name) {
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
	};

	$exports.store = store;
	});

	// 22.1.3.31 Array.prototype[@@unscopables]
	var UNSCOPABLES = _wks('unscopables');
	var ArrayProto = Array.prototype;
	if (ArrayProto[UNSCOPABLES] == undefined) _hide(ArrayProto, UNSCOPABLES, {});
	var _addToUnscopables = function (key) {
	  ArrayProto[UNSCOPABLES][key] = true;
	};

	// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)


	_export(_export.P, 'Array', { copyWithin: _arrayCopyWithin });

	_addToUnscopables('copyWithin');

	var _arrayFill = function fill(value /* , start = 0, end = @length */) {
	  var O = _toObject(this);
	  var length = _toLength(O.length);
	  var aLen = arguments.length;
	  var index = _toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
	  var end = aLen > 2 ? arguments[2] : undefined;
	  var endPos = end === undefined ? length : _toAbsoluteIndex(end, length);
	  while (endPos > index) O[index++] = value;
	  return O;
	};

	// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)


	_export(_export.P, 'Array', { fill: _arrayFill });

	_addToUnscopables('fill');

	var toString = {}.toString;

	var _cof = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	// fallback for non-array-like ES3 and non-enumerable old V8 strings

	// eslint-disable-next-line no-prototype-builtins
	var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return _cof(it) == 'String' ? it.split('') : Object(it);
	};

	// 7.2.2 IsArray(argument)

	var _isArray = Array.isArray || function isArray(arg) {
	  return _cof(arg) == 'Array';
	};

	var SPECIES = _wks('species');

	var _arraySpeciesConstructor = function (original) {
	  var C;
	  if (_isArray(original)) {
	    C = original.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;
	    if (_isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  } return C === undefined ? Array : C;
	};

	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)


	var _arraySpeciesCreate = function (original, length) {
	  return new (_arraySpeciesConstructor(original))(length);
	};

	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex





	var _arrayMethods = function (TYPE, $create) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  var create = $create || _arraySpeciesCreate;
	  return function ($this, callbackfn, that) {
	    var O = _toObject($this);
	    var self = _iobject(O);
	    var f = _ctx(callbackfn, that, 3);
	    var length = _toLength(self.length);
	    var index = 0;
	    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var val, res;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      val = self[index];
	      res = f(val, index, O);
	      if (TYPE) {
	        if (IS_MAP) result[index] = res;   // map
	        else if (res) switch (TYPE) {
	          case 3: return true;             // some
	          case 5: return val;              // find
	          case 6: return index;            // findIndex
	          case 2: result.push(val);        // filter
	        } else if (IS_EVERY) return false; // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

	// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)

	var $find = _arrayMethods(5);
	var KEY = 'find';
	var forced = true;
	// Shouldn't skip holes
	if (KEY in []) Array(1)[KEY](function () { forced = false; });
	_export(_export.P + _export.F * forced, 'Array', {
	  find: function find(callbackfn /* , that = undefined */) {
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	_addToUnscopables(KEY);

	// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)

	var $find$1 = _arrayMethods(6);
	var KEY$1 = 'findIndex';
	var forced$1 = true;
	// Shouldn't skip holes
	if (KEY$1 in []) Array(1)[KEY$1](function () { forced$1 = false; });
	_export(_export.P + _export.F * forced$1, 'Array', {
	  findIndex: function findIndex(callbackfn /* , that = undefined */) {
	    return $find$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	_addToUnscopables(KEY$1);

	// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray




	var IS_CONCAT_SPREADABLE = _wks('isConcatSpreadable');

	function flattenIntoArray(target, original, source, sourceLen, start, depth, mapper, thisArg) {
	  var targetIndex = start;
	  var sourceIndex = 0;
	  var mapFn = mapper ? _ctx(mapper, thisArg, 3) : false;
	  var element, spreadable;

	  while (sourceIndex < sourceLen) {
	    if (sourceIndex in source) {
	      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

	      spreadable = false;
	      if (_isObject(element)) {
	        spreadable = element[IS_CONCAT_SPREADABLE];
	        spreadable = spreadable !== undefined ? !!spreadable : _isArray(element);
	      }

	      if (spreadable && depth > 0) {
	        targetIndex = flattenIntoArray(target, original, element, _toLength(element.length), targetIndex, depth - 1) - 1;
	      } else {
	        if (targetIndex >= 0x1fffffffffffff) throw TypeError();
	        target[targetIndex] = element;
	      }

	      targetIndex++;
	    }
	    sourceIndex++;
	  }
	  return targetIndex;
	}

	var _flattenIntoArray = flattenIntoArray;

	// https://tc39.github.io/proposal-flatMap/#sec-Array.prototype.flatMap







	_export(_export.P, 'Array', {
	  flatMap: function flatMap(callbackfn /* , thisArg */) {
	    var O = _toObject(this);
	    var sourceLen, A;
	    _aFunction(callbackfn);
	    sourceLen = _toLength(O.length);
	    A = _arraySpeciesCreate(O, 0);
	    _flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments[1]);
	    return A;
	  }
	});

	_addToUnscopables('flatMap');

	// call something on iterator step with safe closing on error

	var _iterCall = function (iterator, fn, value, entries) {
	  try {
	    return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (e) {
	    var ret = iterator['return'];
	    if (ret !== undefined) _anObject(ret.call(iterator));
	    throw e;
	  }
	};

	var _iterators = {};

	// check on default Array iterator

	var ITERATOR = _wks('iterator');
	var ArrayProto$1 = Array.prototype;

	var _isArrayIter = function (it) {
	  return it !== undefined && (_iterators.Array === it || ArrayProto$1[ITERATOR] === it);
	};

	var _createProperty = function (object, index, value) {
	  if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));
	  else object[index] = value;
	};

	// getting tag from 19.1.3.6 Object.prototype.toString()

	var TAG = _wks('toStringTag');
	// ES3 wrong here
	var ARG = _cof(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (e) { /* empty */ }
	};

	var _classof = function (it) {
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? _cof(O)
	    // ES3 arguments fallback
	    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

	var ITERATOR$1 = _wks('iterator');

	var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$1]
	    || it['@@iterator']
	    || _iterators[_classof(it)];
	};

	var ITERATOR$2 = _wks('iterator');
	var SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR$2]();
	  riter['return'] = function () { SAFE_CLOSING = true; };
	} catch (e) { /* empty */ }

	var _iterDetect = function (exec, skipClosing) {
	  if (!skipClosing && !SAFE_CLOSING) return false;
	  var safe = false;
	  try {
	    var arr = [7];
	    var iter = arr[ITERATOR$2]();
	    iter.next = function () { return { done: safe = true }; };
	    arr[ITERATOR$2] = function () { return iter; };
	    exec(arr);
	  } catch (e) { /* empty */ }
	  return safe;
	};

	_export(_export.S + _export.F * !_iterDetect(function (iter) { }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	    var O = _toObject(arrayLike);
	    var C = typeof this == 'function' ? this : Array;
	    var aLen = arguments.length;
	    var mapfn = aLen > 1 ? arguments[1] : undefined;
	    var mapping = mapfn !== undefined;
	    var index = 0;
	    var iterFn = core_getIteratorMethod(O);
	    var length, result, step, iterator;
	    if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
	      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
	        _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
	      }
	    } else {
	      length = _toLength(O.length);
	      for (result = new C(length); length > index; index++) {
	        _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});

	// to indexed object, toObject with fallback for non-array-like ES3 strings


	var _toIobject = function (it) {
	  return _iobject(_defined(it));
	};

	// false -> Array#indexOf
	// true  -> Array#includes



	var _arrayIncludes = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = _toIobject($this);
	    var length = _toLength(O.length);
	    var index = _toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
	      if (O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	// https://github.com/tc39/Array.prototype.includes

	var $includes = _arrayIncludes(true);

	_export(_export.P, 'Array', {
	  includes: function includes(el /* , fromIndex = 0 */) {
	    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	_addToUnscopables('includes');

	var _iterStep = function (done, value) {
	  return { value: value, done: !!done };
	};

	var shared = _shared('keys');

	var _sharedKey = function (key) {
	  return shared[key] || (shared[key] = _uid(key));
	};

	var arrayIndexOf = _arrayIncludes(false);
	var IE_PROTO = _sharedKey('IE_PROTO');

	var _objectKeysInternal = function (object, names) {
	  var O = _toIobject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (_has(O, key = names[i++])) {
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE 8- don't enum bug keys
	var _enumBugKeys = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)



	var _objectKeys = Object.keys || function keys(O) {
	  return _objectKeysInternal(O, _enumBugKeys);
	};

	var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  _anObject(O);
	  var keys = _objectKeys(Properties);
	  var length = keys.length;
	  var i = 0;
	  var P;
	  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

	var document$2 = _global.document;
	var _html = document$2 && document$2.documentElement;

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



	var IE_PROTO$1 = _sharedKey('IE_PROTO');
	var Empty = function () { /* empty */ };
	var PROTOTYPE$1 = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = _domCreate('iframe');
	  var i = _enumBugKeys.length;
	  var lt = '<';
	  var gt = '>';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  _html.appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
	  return createDict();
	};

	var _objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE$1] = _anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE$1] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : _objectDps(result, Properties);
	};

	var def = _objectDp.f;

	var TAG$1 = _wks('toStringTag');

	var _setToStringTag = function (it, tag, stat) {
	  if (it && !_has(it = stat ? it : it.prototype, TAG$1)) def(it, TAG$1, { configurable: true, value: tag });
	};

	var IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

	var _iterCreate = function (Constructor, NAME, next) {
	  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
	  _setToStringTag(Constructor, NAME + ' Iterator');
	};

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


	var IE_PROTO$2 = _sharedKey('IE_PROTO');
	var ObjectProto = Object.prototype;

	var _objectGpo = Object.getPrototypeOf || function (O) {
	  O = _toObject(O);
	  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

	var ITERATOR$3 = _wks('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';

	var returnThis = function () { return this; };

	var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
	  _iterCreate(Constructor, NAME, next);
	  var getMethod = function (kind) {
	    if (!BUGGY && kind in proto) return proto[kind];
	    switch (kind) {
	      case KEYS: return function keys() { return new Constructor(this, kind); };
	      case VALUES: return function values() { return new Constructor(this, kind); };
	    } return function entries() { return new Constructor(this, kind); };
	  };
	  var TAG = NAME + ' Iterator';
	  var DEF_VALUES = DEFAULT == VALUES;
	  var VALUES_BUG = false;
	  var proto = Base.prototype;
	  var $native = proto[ITERATOR$3] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
	  var $default = $native || getMethod(DEFAULT);
	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
	  var methods, key, IteratorPrototype;
	  // Fix native
	  if ($anyNative) {
	    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      _setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if (!_library && typeof IteratorPrototype[ITERATOR$3] != 'function') _hide(IteratorPrototype, ITERATOR$3, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() { return $native.call(this); };
	  }
	  // Define iterator
	  if ((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR$3])) {
	    _hide(proto, ITERATOR$3, $default);
	  }
	  // Plug for library
	  _iterators[NAME] = $default;
	  _iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      values: DEF_VALUES ? $default : getMethod(VALUES),
	      keys: IS_SET ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if (FORCED) for (key in methods) {
	      if (!(key in proto)) _redefine(proto, key, methods[key]);
	    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
	  this._t = _toIobject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var kind = this._k;
	  var index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return _iterStep(1);
	  }
	  if (kind == 'keys') return _iterStep(0, index);
	  if (kind == 'values') return _iterStep(0, O[index]);
	  return _iterStep(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	_iterators.Arguments = _iterators.Array;

	_addToUnscopables('keys');
	_addToUnscopables('values');
	_addToUnscopables('entries');

	// WebKit Array.of isn't generic
	_export(_export.S + _export.F * _fails(function () {
	  function F() { /* empty */ }
	  return !(Array.of.call(F) instanceof F);
	}), 'Array', {
	  // 22.1.2.3 Array.of( ...items)
	  of: function of(/* ...args */) {
	    var index = 0;
	    var aLen = arguments.length;
	    var result = new (typeof this == 'function' ? this : Array)(aLen);
	    while (aLen > index) _createProperty(result, index, arguments[index++]);
	    result.length = aLen;
	    return result;
	  }
	});

	var SPECIES$1 = _wks('species');

	var _setSpecies = function (KEY) {
	  var C = _global[KEY];
	  if (_descriptors && C && !C[SPECIES$1]) _objectDp.f(C, SPECIES$1, {
	    configurable: true,
	    get: function () { return this; }
	  });
	};

	_setSpecies('Array');

	var NUMBER = 'number';

	var _dateToPrimitive = function (hint) {
	  if (hint !== 'string' && hint !== NUMBER && hint !== 'default') throw TypeError('Incorrect hint');
	  return _toPrimitive(_anObject(this), hint != NUMBER);
	};

	var TO_PRIMITIVE = _wks('toPrimitive');
	var proto = Date.prototype;

	if (!(TO_PRIMITIVE in proto)) _hide(proto, TO_PRIMITIVE, _dateToPrimitive);

	var HAS_INSTANCE = _wks('hasInstance');
	var FunctionProto = Function.prototype;
	// 19.2.3.6 Function.prototype[@@hasInstance](V)
	if (!(HAS_INSTANCE in FunctionProto)) _objectDp.f(FunctionProto, HAS_INSTANCE, { value: function (O) {
	  if (typeof this != 'function' || !_isObject(O)) return false;
	  if (!_isObject(this.prototype)) return O instanceof this;
	  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
	  while (O = _objectGpo(O)) if (this.prototype === O) return true;
	  return false;
	} });

	var dP$1 = _objectDp.f;
	var FProto = Function.prototype;
	var nameRE = /^\s*function ([^ (]*)/;
	var NAME = 'name';

	// 19.2.4.2 name
	NAME in FProto || _descriptors && dP$1(FProto, NAME, {
	  configurable: true,
	  get: function () {
	    try {
	      return ('' + this).match(nameRE)[1];
	    } catch (e) {
	      return '';
	    }
	  }
	});

	var _redefineAll = function (target, src, safe) {
	  for (var key in src) _redefine(target, key, src[key], safe);
	  return target;
	};

	var _anInstance = function (it, Constructor, name, forbiddenField) {
	  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

	var _forOf = createCommonjsModule(function (module) {
	var BREAK = {};
	var RETURN = {};
	var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
	  var iterFn = ITERATOR ? function () { return iterable; } : core_getIteratorMethod(iterable);
	  var f = _ctx(fn, that, entries ? 2 : 1);
	  var index = 0;
	  var length, step, iterator, result;
	  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
	    result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if (result === BREAK || result === RETURN) return result;
	  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
	    result = _iterCall(iterator, f, step.value, entries);
	    if (result === BREAK || result === RETURN) return result;
	  }
	};
	exports.BREAK = BREAK;
	exports.RETURN = RETURN;
	});

	var _meta = createCommonjsModule(function (module) {
	var META = _uid('meta');


	var setDesc = _objectDp.f;
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
	  return true;
	};
	var FREEZE = !_fails(function () {
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function (it) {
	  setDesc(it, META, { value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  } });
	};
	var fastKey = function (it, create) {
	  // return primitive with prefix
	  if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function (it, create) {
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY: META,
	  NEED: false,
	  fastKey: fastKey,
	  getWeak: getWeak,
	  onFreeze: onFreeze
	};
	});
	var _meta_1 = _meta.KEY;
	var _meta_2 = _meta.NEED;
	var _meta_3 = _meta.fastKey;
	var _meta_4 = _meta.getWeak;
	var _meta_5 = _meta.onFreeze;

	var _validateCollection = function (it, TYPE) {
	  if (!_isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
	  return it;
	};

	var dP$2 = _objectDp.f;









	var fastKey = _meta.fastKey;

	var SIZE = _descriptors ? '_s' : 'size';

	var getEntry = function (that, key) {
	  // fast case
	  var index = fastKey(key);
	  var entry;
	  if (index !== 'F') return that._i[index];
	  // frozen object case
	  for (entry = that._f; entry; entry = entry.n) {
	    if (entry.k == key) return entry;
	  }
	};

	var _collectionStrong = {
	  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      _anInstance(that, C, NAME, '_i');
	      that._t = NAME;         // collection type
	      that._i = _objectCreate(null); // index
	      that._f = undefined;    // first entry
	      that._l = undefined;    // last entry
	      that[SIZE] = 0;         // size
	      if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    _redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear() {
	        for (var that = _validateCollection(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
	          entry.r = true;
	          if (entry.p) entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that._f = that._l = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function (key) {
	        var that = _validateCollection(this, NAME);
	        var entry = getEntry(that, key);
	        if (entry) {
	          var next = entry.n;
	          var prev = entry.p;
	          delete that._i[entry.i];
	          entry.r = true;
	          if (prev) prev.n = next;
	          if (next) next.p = prev;
	          if (that._f == entry) that._f = next;
	          if (that._l == entry) that._l = prev;
	          that[SIZE]--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /* , that = undefined */) {
	        _validateCollection(this, NAME);
	        var f = _ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
	        var entry;
	        while (entry = entry ? entry.n : this._f) {
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while (entry && entry.r) entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key) {
	        return !!getEntry(_validateCollection(this, NAME), key);
	      }
	    });
	    if (_descriptors) dP$2(C.prototype, 'size', {
	      get: function () {
	        return _validateCollection(this, NAME)[SIZE];
	      }
	    });
	    return C;
	  },
	  def: function (that, key, value) {
	    var entry = getEntry(that, key);
	    var prev, index;
	    // change existing entry
	    if (entry) {
	      entry.v = value;
	    // create new entry
	    } else {
	      that._l = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that._l,             // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if (!that._f) that._f = entry;
	      if (prev) prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if (index !== 'F') that._i[index] = entry;
	    } return that;
	  },
	  getEntry: getEntry,
	  setStrong: function (C, NAME, IS_MAP) {
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    _iterDefine(C, NAME, function (iterated, kind) {
	      this._t = _validateCollection(iterated, NAME); // target
	      this._k = kind;                     // kind
	      this._l = undefined;                // previous
	    }, function () {
	      var that = this;
	      var kind = that._k;
	      var entry = that._l;
	      // revert to the last existing entry
	      while (entry && entry.r) entry = entry.p;
	      // get next entry
	      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
	        // or finish the iteration
	        that._t = undefined;
	        return _iterStep(1);
	      }
	      // return step by kind
	      if (kind == 'keys') return _iterStep(0, entry.k);
	      if (kind == 'values') return _iterStep(0, entry.v);
	      return _iterStep(0, [entry.k, entry.v]);
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

	    // add [@@species], 23.1.2.2, 23.2.2.2
	    _setSpecies(NAME);
	  }
	};

	var f$1 = {}.propertyIsEnumerable;

	var _objectPie = {
		f: f$1
	};

	var gOPD = Object.getOwnPropertyDescriptor;

	var f$2 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
	  O = _toIobject(O);
	  P = _toPrimitive(P, true);
	  if (_ie8DomDefine) try {
	    return gOPD(O, P);
	  } catch (e) { /* empty */ }
	  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
	};

	var _objectGopd = {
		f: f$2
	};

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */


	var check = function (O, proto) {
	  _anObject(O);
	  if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
	};
	var _setProto = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function (test, buggy, set) {
	      try {
	        set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch (e) { buggy = true; }
	      return function setPrototypeOf(O, proto) {
	        check(O, proto);
	        if (buggy) O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

	var setPrototypeOf = _setProto.set;
	var _inheritIfRequired = function (that, target, C) {
	  var S = target.constructor;
	  var P;
	  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf) {
	    setPrototypeOf(that, P);
	  } return that;
	};

	var _collection = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
	  var Base = _global[NAME];
	  var C = Base;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var proto = C && C.prototype;
	  var O = {};
	  var fixMethod = function (KEY) {
	    var fn = proto[KEY];
	    _redefine(proto, KEY,
	      KEY == 'delete' ? function (a) {
	        return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
	      } : KEY == 'has' ? function has(a) {
	        return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
	      } : KEY == 'get' ? function get(a) {
	        return IS_WEAK && !_isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
	      } : KEY == 'add' ? function add(a) { fn.call(this, a === 0 ? 0 : a); return this; }
	        : function set(a, b) { fn.call(this, a === 0 ? 0 : a, b); return this; }
	    );
	  };
	  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !_fails(function () {
	    new C().entries().next();
	  }))) {
	    // create collection constructor
	    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
	    _redefineAll(C.prototype, methods);
	    _meta.NEED = true;
	  } else {
	    var instance = new C();
	    // early implementations not supports chaining
	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
	    // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
	    var THROWS_ON_PRIMITIVES = _fails(function () { instance.has(1); });
	    // most early implementations doesn't supports iterables, most modern - not close it correctly
	    var ACCEPT_ITERABLES = _iterDetect(function (iter) { new C(iter); }); // eslint-disable-line no-new
	    // for early implementations -0 and +0 not the same
	    var BUGGY_ZERO = !IS_WEAK && _fails(function () {
	      // V8 ~ Chromium 42- fails only with 5+ elements
	      var $instance = new C();
	      var index = 5;
	      while (index--) $instance[ADDER](index, index);
	      return !$instance.has(-0);
	    });
	    if (!ACCEPT_ITERABLES) {
	      C = wrapper(function (target, iterable) {
	        _anInstance(target, C, NAME);
	        var that = _inheritIfRequired(new Base(), target, C);
	        if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
	        return that;
	      });
	      C.prototype = proto;
	      proto.constructor = C;
	    }
	    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }
	    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
	    // weak collections should not contains .clear method
	    if (IS_WEAK && proto.clear) delete proto.clear;
	  }

	  _setToStringTag(C, NAME);

	  O[NAME] = C;
	  _export(_export.G + _export.W + _export.F * (C != Base), O);

	  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

	  return C;
	};

	var MAP = 'Map';

	// 23.1 Map Objects
	var es6_map = _collection(MAP, function (get) {
	  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function get(key) {
	    var entry = _collectionStrong.getEntry(_validateCollection(this, MAP), key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function set(key, value) {
	    return _collectionStrong.def(_validateCollection(this, MAP), key === 0 ? 0 : key, value);
	  }
	}, _collectionStrong, true);

	// 20.2.2.20 Math.log1p(x)
	var _mathLog1p = Math.log1p || function log1p(x) {
	  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
	};

	// 20.2.2.3 Math.acosh(x)


	var sqrt = Math.sqrt;
	var $acosh = Math.acosh;

	_export(_export.S + _export.F * !($acosh
	  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
	  && Math.floor($acosh(Number.MAX_VALUE)) == 710
	  // Tor Browser bug: Math.acosh(Infinity) -> NaN
	  && $acosh(Infinity) == Infinity
	), 'Math', {
	  acosh: function acosh(x) {
	    return (x = +x) < 1 ? NaN : x > 94906265.62425156
	      ? Math.log(x) + Math.LN2
	      : _mathLog1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
	  }
	});

	// 20.2.2.5 Math.asinh(x)

	var $asinh = Math.asinh;

	function asinh(x) {
	  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
	}

	// Tor Browser bug: Math.asinh(0) -> -0
	_export(_export.S + _export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', { asinh: asinh });

	// 20.2.2.7 Math.atanh(x)

	var $atanh = Math.atanh;

	// Tor Browser bug: Math.atanh(-0) -> 0
	_export(_export.S + _export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
	  atanh: function atanh(x) {
	    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
	  }
	});

	// 20.2.2.28 Math.sign(x)
	var _mathSign = Math.sign || function sign(x) {
	  // eslint-disable-next-line no-self-compare
	  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
	};

	// 20.2.2.9 Math.cbrt(x)



	_export(_export.S, 'Math', {
	  cbrt: function cbrt(x) {
	    return _mathSign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
	  }
	});

	// 20.2.2.11 Math.clz32(x)


	_export(_export.S, 'Math', {
	  clz32: function clz32(x) {
	    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
	  }
	});

	// 20.2.2.12 Math.cosh(x)

	var exp = Math.exp;

	_export(_export.S, 'Math', {
	  cosh: function cosh(x) {
	    return (exp(x = +x) + exp(-x)) / 2;
	  }
	});

	// 20.2.2.14 Math.expm1(x)
	var $expm1 = Math.expm1;
	var _mathExpm1 = (!$expm1
	  // Old FF bug
	  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
	  // Tor Browser bug
	  || $expm1(-2e-17) != -2e-17
	) ? function expm1(x) {
	  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
	} : $expm1;

	// 20.2.2.14 Math.expm1(x)



	_export(_export.S + _export.F * (_mathExpm1 != Math.expm1), 'Math', { expm1: _mathExpm1 });

	// 20.2.2.16 Math.fround(x)

	var pow = Math.pow;
	var EPSILON = pow(2, -52);
	var EPSILON32 = pow(2, -23);
	var MAX32 = pow(2, 127) * (2 - EPSILON32);
	var MIN32 = pow(2, -126);

	var roundTiesToEven = function (n) {
	  return n + 1 / EPSILON - 1 / EPSILON;
	};

	var _mathFround = Math.fround || function fround(x) {
	  var $abs = Math.abs(x);
	  var $sign = _mathSign(x);
	  var a, result;
	  if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
	  a = (1 + EPSILON32 / EPSILON) * $abs;
	  result = a - (a - $abs);
	  // eslint-disable-next-line no-self-compare
	  if (result > MAX32 || result != result) return $sign * Infinity;
	  return $sign * result;
	};

	// 20.2.2.16 Math.fround(x)


	_export(_export.S, 'Math', { fround: _mathFround });

	// 20.2.2.17 Math.hypot([value1[, value2[, … ]]])

	var abs = Math.abs;

	_export(_export.S, 'Math', {
	  hypot: function hypot(value1, value2) { // eslint-disable-line no-unused-vars
	    var sum = 0;
	    var i = 0;
	    var aLen = arguments.length;
	    var larg = 0;
	    var arg, div;
	    while (i < aLen) {
	      arg = abs(arguments[i++]);
	      if (larg < arg) {
	        div = larg / arg;
	        sum = sum * div * div + 1;
	        larg = arg;
	      } else if (arg > 0) {
	        div = arg / larg;
	        sum += div * div;
	      } else sum += arg;
	    }
	    return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
	  }
	});

	// 20.2.2.18 Math.imul(x, y)

	var $imul = Math.imul;

	// some WebKit versions fails with big numbers, some has wrong arity
	_export(_export.S + _export.F * _fails(function () {
	  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
	}), 'Math', {
	  imul: function imul(x, y) {
	    var UINT16 = 0xffff;
	    var xn = +x;
	    var yn = +y;
	    var xl = UINT16 & xn;
	    var yl = UINT16 & yn;
	    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
	  }
	});

	// 20.2.2.20 Math.log1p(x)


	_export(_export.S, 'Math', { log1p: _mathLog1p });

	// 20.2.2.21 Math.log10(x)


	_export(_export.S, 'Math', {
	  log10: function log10(x) {
	    return Math.log(x) * Math.LOG10E;
	  }
	});

	// 20.2.2.22 Math.log2(x)


	_export(_export.S, 'Math', {
	  log2: function log2(x) {
	    return Math.log(x) / Math.LN2;
	  }
	});

	// 20.2.2.28 Math.sign(x)


	_export(_export.S, 'Math', { sign: _mathSign });

	// 20.2.2.30 Math.sinh(x)


	var exp$1 = Math.exp;

	// V8 near Chromium 38 has a problem with very small numbers
	_export(_export.S + _export.F * _fails(function () {
	  return !Math.sinh(-2e-17) != -2e-17;
	}), 'Math', {
	  sinh: function sinh(x) {
	    return Math.abs(x = +x) < 1
	      ? (_mathExpm1(x) - _mathExpm1(-x)) / 2
	      : (exp$1(x - 1) - exp$1(-x - 1)) * (Math.E / 2);
	  }
	});

	// 20.2.2.33 Math.tanh(x)


	var exp$2 = Math.exp;

	_export(_export.S, 'Math', {
	  tanh: function tanh(x) {
	    var a = _mathExpm1(x = +x);
	    var b = _mathExpm1(-x);
	    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp$2(x) + exp$2(-x));
	  }
	});

	// 20.2.2.34 Math.trunc(x)


	_export(_export.S, 'Math', {
	  trunc: function trunc(it) {
	    return (it > 0 ? Math.floor : Math.ceil)(it);
	  }
	});

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

	var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return _objectKeysInternal(O, hiddenKeys);
	};

	var _objectGopn = {
		f: f$3
	};

	var _stringWs = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
	  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var space = '[' + _stringWs + ']';
	var non = '\u200b\u0085';
	var ltrim = RegExp('^' + space + space + '*');
	var rtrim = RegExp(space + space + '*$');

	var exporter = function (KEY, exec, ALIAS) {
	  var exp = {};
	  var FORCE = _fails(function () {
	    return !!_stringWs[KEY]() || non[KEY]() != non;
	  });
	  var fn = exp[KEY] = FORCE ? exec(trim) : _stringWs[KEY];
	  if (ALIAS) exp[ALIAS] = fn;
	  _export(_export.P + _export.F * FORCE, 'String', exp);
	};

	// 1 -> String#trimLeft
	// 2 -> String#trimRight
	// 3 -> String#trim
	var trim = exporter.trim = function (string, TYPE) {
	  string = String(_defined(string));
	  if (TYPE & 1) string = string.replace(ltrim, '');
	  if (TYPE & 2) string = string.replace(rtrim, '');
	  return string;
	};

	var _stringTrim = exporter;

	var gOPN = _objectGopn.f;
	var gOPD$1 = _objectGopd.f;
	var dP$3 = _objectDp.f;
	var $trim = _stringTrim.trim;
	var NUMBER$1 = 'Number';
	var $Number = _global[NUMBER$1];
	var Base = $Number;
	var proto$1 = $Number.prototype;
	// Opera ~12 has broken Object#toString
	var BROKEN_COF = _cof(_objectCreate(proto$1)) == NUMBER$1;
	var TRIM = 'trim' in String.prototype;

	// 7.1.3 ToNumber(argument)
	var toNumber = function (argument) {
	  var it = _toPrimitive(argument, false);
	  if (typeof it == 'string' && it.length > 2) {
	    it = TRIM ? it.trim() : $trim(it, 3);
	    var first = it.charCodeAt(0);
	    var third, radix, maxCode;
	    if (first === 43 || first === 45) {
	      third = it.charCodeAt(2);
	      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
	    } else if (first === 48) {
	      switch (it.charCodeAt(1)) {
	        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
	        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
	        default: return +it;
	      }
	      for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
	        code = digits.charCodeAt(i);
	        // parseInt parses a string to a first unavailable symbol
	        // but ToNumber should return NaN if a string contains unavailable symbols
	        if (code < 48 || code > maxCode) return NaN;
	      } return parseInt(digits, radix);
	    }
	  } return +it;
	};

	if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
	  $Number = function Number(value) {
	    var it = arguments.length < 1 ? 0 : value;
	    var that = this;
	    return that instanceof $Number
	      // check on 1..constructor(foo) case
	      && (BROKEN_COF ? _fails(function () { proto$1.valueOf.call(that); }) : _cof(that) != NUMBER$1)
	        ? _inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
	  };
	  for (var keys = _descriptors ? gOPN(Base) : (
	    // ES3:
	    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	    // ES6 (in case, if modules with ES6 Number statics required before):
	    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
	    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
	  ).split(','), j = 0, key; keys.length > j; j++) {
	    if (_has(Base, key = keys[j]) && !_has($Number, key)) {
	      dP$3($Number, key, gOPD$1(Base, key));
	    }
	  }
	  $Number.prototype = proto$1;
	  proto$1.constructor = $Number;
	  _redefine(_global, NUMBER$1, $Number);
	}

	// 20.1.2.1 Number.EPSILON


	_export(_export.S, 'Number', { EPSILON: Math.pow(2, -52) });

	// 20.1.2.2 Number.isFinite(number)

	var _isFinite = _global.isFinite;

	_export(_export.S, 'Number', {
	  isFinite: function isFinite(it) {
	    return typeof it == 'number' && _isFinite(it);
	  }
	});

	// 20.1.2.3 Number.isInteger(number)

	var floor$1 = Math.floor;
	var _isInteger = function isInteger(it) {
	  return !_isObject(it) && isFinite(it) && floor$1(it) === it;
	};

	// 20.1.2.3 Number.isInteger(number)


	_export(_export.S, 'Number', { isInteger: _isInteger });

	// 20.1.2.4 Number.isNaN(number)


	_export(_export.S, 'Number', {
	  isNaN: function isNaN(number) {
	    // eslint-disable-next-line no-self-compare
	    return number != number;
	  }
	});

	// 20.1.2.5 Number.isSafeInteger(number)


	var abs$1 = Math.abs;

	_export(_export.S, 'Number', {
	  isSafeInteger: function isSafeInteger(number) {
	    return _isInteger(number) && abs$1(number) <= 0x1fffffffffffff;
	  }
	});

	// 20.1.2.6 Number.MAX_SAFE_INTEGER


	_export(_export.S, 'Number', { MAX_SAFE_INTEGER: 0x1fffffffffffff });

	// 20.1.2.10 Number.MIN_SAFE_INTEGER


	_export(_export.S, 'Number', { MIN_SAFE_INTEGER: -0x1fffffffffffff });

	var $parseFloat = _global.parseFloat;
	var $trim$1 = _stringTrim.trim;

	var _parseFloat = 1 / $parseFloat(_stringWs + '-0') !== -Infinity ? function parseFloat(str) {
	  var string = $trim$1(String(str), 3);
	  var result = $parseFloat(string);
	  return result === 0 && string.charAt(0) == '-' ? -0 : result;
	} : $parseFloat;

	// 20.1.2.12 Number.parseFloat(string)
	_export(_export.S + _export.F * (Number.parseFloat != _parseFloat), 'Number', { parseFloat: _parseFloat });

	var $parseInt = _global.parseInt;
	var $trim$2 = _stringTrim.trim;

	var hex = /^[-+]?0[xX]/;

	var _parseInt = $parseInt(_stringWs + '08') !== 8 || $parseInt(_stringWs + '0x16') !== 22 ? function parseInt(str, radix) {
	  var string = $trim$2(String(str), 3);
	  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
	} : $parseInt;

	// 20.1.2.13 Number.parseInt(string, radix)
	_export(_export.S + _export.F * (Number.parseInt != _parseInt), 'Number', { parseInt: _parseInt });

	var f$4 = Object.getOwnPropertySymbols;

	var _objectGops = {
		f: f$4
	};

	// 19.1.2.1 Object.assign(target, source, ...)





	var $assign = Object.assign;

	// should work with symbols and should have deterministic property order (V8 bug)
	var _objectAssign = !$assign || _fails(function () {
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var S = Symbol();
	  var K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function (k) { B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
	  var T = _toObject(target);
	  var aLen = arguments.length;
	  var index = 1;
	  var getSymbols = _objectGops.f;
	  var isEnum = _objectPie.f;
	  while (aLen > index) {
	    var S = _iobject(arguments[index++]);
	    var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
	  } return T;
	} : $assign;

	// 19.1.3.1 Object.assign(target, source)


	_export(_export.S + _export.F, 'Object', { assign: _objectAssign });

	// Forced replacement prototype accessors methods
	var _objectForcedPam = _library || !_fails(function () {
	  var K = Math.random();
	  // In FF throws only define methods
	  // eslint-disable-next-line no-undef, no-useless-call
	  __defineSetter__.call(null, K, function () { /* empty */ });
	  delete _global[K];
	});

	// B.2.2.2 Object.prototype.__defineGetter__(P, getter)
	_descriptors && _export(_export.P + _objectForcedPam, 'Object', {
	  __defineGetter__: function __defineGetter__(P, getter) {
	    _objectDp.f(_toObject(this), P, { get: _aFunction(getter), enumerable: true, configurable: true });
	  }
	});

	// B.2.2.3 Object.prototype.__defineSetter__(P, setter)
	_descriptors && _export(_export.P + _objectForcedPam, 'Object', {
	  __defineSetter__: function __defineSetter__(P, setter) {
	    _objectDp.f(_toObject(this), P, { set: _aFunction(setter), enumerable: true, configurable: true });
	  }
	});

	var isEnum = _objectPie.f;
	var _objectToArray = function (isEntries) {
	  return function (it) {
	    var O = _toIobject(it);
	    var keys = _objectKeys(O);
	    var length = keys.length;
	    var i = 0;
	    var result = [];
	    var key;
	    while (length > i) if (isEnum.call(O, key = keys[i++])) {
	      result.push(isEntries ? [key, O[key]] : O[key]);
	    } return result;
	  };
	};

	// https://github.com/tc39/proposal-object-values-entries

	var $entries = _objectToArray(true);

	_export(_export.S, 'Object', {
	  entries: function entries(it) {
	    return $entries(it);
	  }
	});

	// most Object methods by ES6 should accept primitives



	var _objectSap = function (KEY, exec) {
	  var fn = (_core.Object || {})[KEY] || Object[KEY];
	  var exp = {};
	  exp[KEY] = exec(fn);
	  _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
	};

	// 19.1.2.5 Object.freeze(O)

	var meta = _meta.onFreeze;

	_objectSap('freeze', function ($freeze) {
	  return function freeze(it) {
	    return $freeze && _isObject(it) ? $freeze(meta(it)) : it;
	  };
	});

	// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)

	var $getOwnPropertyDescriptor = _objectGopd.f;

	_objectSap('getOwnPropertyDescriptor', function () {
	  return function getOwnPropertyDescriptor(it, key) {
	    return $getOwnPropertyDescriptor(_toIobject(it), key);
	  };
	});

	// all object keys, includes non-enumerable and symbols



	var Reflect$1 = _global.Reflect;
	var _ownKeys = Reflect$1 && Reflect$1.ownKeys || function ownKeys(it) {
	  var keys = _objectGopn.f(_anObject(it));
	  var getSymbols = _objectGops.f;
	  return getSymbols ? keys.concat(getSymbols(it)) : keys;
	};

	// https://github.com/tc39/proposal-object-getownpropertydescriptors






	_export(_export.S, 'Object', {
	  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
	    var O = _toIobject(object);
	    var getDesc = _objectGopd.f;
	    var keys = _ownKeys(O);
	    var result = {};
	    var i = 0;
	    var key, desc;
	    while (keys.length > i) {
	      desc = getDesc(O, key = keys[i++]);
	      if (desc !== undefined) _createProperty(result, key, desc);
	    }
	    return result;
	  }
	});

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

	var gOPN$1 = _objectGopn.f;
	var toString$1 = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return gOPN$1(it);
	  } catch (e) {
	    return windowNames.slice();
	  }
	};

	var f$5 = function getOwnPropertyNames(it) {
	  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN$1(_toIobject(it));
	};

	var _objectGopnExt = {
		f: f$5
	};

	// 19.1.2.7 Object.getOwnPropertyNames(O)
	_objectSap('getOwnPropertyNames', function () {
	  return _objectGopnExt.f;
	});

	// 19.1.2.9 Object.getPrototypeOf(O)



	_objectSap('getPrototypeOf', function () {
	  return function getPrototypeOf(it) {
	    return _objectGpo(_toObject(it));
	  };
	});

	var getOwnPropertyDescriptor = _objectGopd.f;

	// B.2.2.4 Object.prototype.__lookupGetter__(P)
	_descriptors && _export(_export.P + _objectForcedPam, 'Object', {
	  __lookupGetter__: function __lookupGetter__(P) {
	    var O = _toObject(this);
	    var K = _toPrimitive(P, true);
	    var D;
	    do {
	      if (D = getOwnPropertyDescriptor(O, K)) return D.get;
	    } while (O = _objectGpo(O));
	  }
	});

	var getOwnPropertyDescriptor$1 = _objectGopd.f;

	// B.2.2.5 Object.prototype.__lookupSetter__(P)
	_descriptors && _export(_export.P + _objectForcedPam, 'Object', {
	  __lookupSetter__: function __lookupSetter__(P) {
	    var O = _toObject(this);
	    var K = _toPrimitive(P, true);
	    var D;
	    do {
	      if (D = getOwnPropertyDescriptor$1(O, K)) return D.set;
	    } while (O = _objectGpo(O));
	  }
	});

	// 19.1.2.15 Object.preventExtensions(O)

	var meta$1 = _meta.onFreeze;

	_objectSap('preventExtensions', function ($preventExtensions) {
	  return function preventExtensions(it) {
	    return $preventExtensions && _isObject(it) ? $preventExtensions(meta$1(it)) : it;
	  };
	});

	// 19.1.3.6 Object.prototype.toString()

	var test = {};
	test[_wks('toStringTag')] = 'z';
	if (test + '' != '[object z]') {
	  _redefine(Object.prototype, 'toString', function toString() {
	    return '[object ' + _classof(this) + ']';
	  }, true);
	}

	// 7.2.9 SameValue(x, y)
	var _sameValue = Object.is || function is(x, y) {
	  // eslint-disable-next-line no-self-compare
	  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
	};

	// 19.1.3.10 Object.is(value1, value2)

	_export(_export.S, 'Object', { is: _sameValue });

	// 19.1.2.12 Object.isFrozen(O)


	_objectSap('isFrozen', function ($isFrozen) {
	  return function isFrozen(it) {
	    return _isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
	  };
	});

	// 19.1.2.13 Object.isSealed(O)


	_objectSap('isSealed', function ($isSealed) {
	  return function isSealed(it) {
	    return _isObject(it) ? $isSealed ? $isSealed(it) : false : true;
	  };
	});

	// 19.1.2.11 Object.isExtensible(O)


	_objectSap('isExtensible', function ($isExtensible) {
	  return function isExtensible(it) {
	    return _isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
	  };
	});

	// 19.1.2.14 Object.keys(O)



	_objectSap('keys', function () {
	  return function keys(it) {
	    return _objectKeys(_toObject(it));
	  };
	});

	// 19.1.2.17 Object.seal(O)

	var meta$2 = _meta.onFreeze;

	_objectSap('seal', function ($seal) {
	  return function seal(it) {
	    return $seal && _isObject(it) ? $seal(meta$2(it)) : it;
	  };
	});

	// https://github.com/tc39/proposal-object-values-entries

	var $values = _objectToArray(false);

	_export(_export.S, 'Object', {
	  values: function values(it) {
	    return $values(it);
	  }
	});

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)


	var SPECIES$2 = _wks('species');
	var _speciesConstructor = function (O, D) {
	  var C = _anObject(O).constructor;
	  var S;
	  return C === undefined || (S = _anObject(C)[SPECIES$2]) == undefined ? D : _aFunction(S);
	};

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	var _invoke = function (fn, args, that) {
	  var un = that === undefined;
	  switch (args.length) {
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return fn.apply(that, args);
	};

	var process$1 = _global.process;
	var setTask = _global.setImmediate;
	var clearTask = _global.clearImmediate;
	var MessageChannel = _global.MessageChannel;
	var Dispatch = _global.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;
	var run = function () {
	  var id = +this;
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function (event) {
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!setTask || !clearTask) {
	  setTask = function setImmediate(fn) {
	    var args = [];
	    var i = 1;
	    while (arguments.length > i) args.push(arguments[i++]);
	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      _invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (_cof(process$1) == 'process') {
	    defer = function (id) {
	      process$1.nextTick(_ctx(run, id, 1));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(_ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if (MessageChannel) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = _ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
	    defer = function (id) {
	      _global.postMessage(id + '', '*');
	    };
	    _global.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in _domCreate('script')) {
	    defer = function (id) {
	      _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
	        _html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(_ctx(run, id, 1), 0);
	    };
	  }
	}
	var _task = {
	  set: setTask,
	  clear: clearTask
	};

	var macrotask = _task.set;
	var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
	var process$2 = _global.process;
	var Promise$1 = _global.Promise;
	var isNode = _cof(process$2) == 'process';

	var _microtask = function () {
	  var head, last, notify;

	  var flush = function () {
	    var parent, fn;
	    if (isNode && (parent = process$2.domain)) parent.exit();
	    while (head) {
	      fn = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch (e) {
	        if (head) notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if (parent) parent.enter();
	  };

	  // Node.js
	  if (isNode) {
	    notify = function () {
	      process$2.nextTick(flush);
	    };
	  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
	  } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
	    var toggle = true;
	    var node = document.createTextNode('');
	    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    var promise = Promise$1.resolve(undefined);
	    notify = function () {
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(_global, flush);
	    };
	  }

	  return function (fn) {
	    var task = { fn: fn, next: undefined };
	    if (last) last.next = task;
	    if (!head) {
	      head = task;
	      notify();
	    } last = task;
	  };
	};

	// 25.4.1.5 NewPromiseCapability(C)


	function PromiseCapability(C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = _aFunction(resolve);
	  this.reject = _aFunction(reject);
	}

	var f$6 = function (C) {
	  return new PromiseCapability(C);
	};

	var _newPromiseCapability = {
		f: f$6
	};

	var _perform = function (exec) {
	  try {
	    return { e: false, v: exec() };
	  } catch (e) {
	    return { e: true, v: e };
	  }
	};

	var navigator$1 = _global.navigator;

	var _userAgent = navigator$1 && navigator$1.userAgent || '';

	var _promiseResolve = function (C, x) {
	  _anObject(C);
	  if (_isObject(x) && x.constructor === C) return x;
	  var promiseCapability = _newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var task = _task.set;
	var microtask = _microtask();




	var PROMISE = 'Promise';
	var TypeError$1 = _global.TypeError;
	var process$3 = _global.process;
	var versions = process$3 && process$3.versions;
	var v8 = versions && versions.v8 || '';
	var $Promise = _global[PROMISE];
	var isNode$1 = _classof(process$3) == 'process';
	var empty = function () { /* empty */ };
	var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
	var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;

	var USE_NATIVE = !!function () {
	  try {
	    // correct subclassing with @@species support
	    var promise = $Promise.resolve(1);
	    var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
	      exec(empty, empty);
	    };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode$1 || typeof PromiseRejectionEvent == 'function')
	      && promise.then(empty) instanceof FakePromise
	      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	      // we can't detect it synchronously, so just check versions
	      && v8.indexOf('6.6') !== 0
	      && _userAgent.indexOf('Chrome/66') === -1;
	  } catch (e) { /* empty */ }
	}();

	// helpers
	var isThenable = function (it) {
	  var then;
	  return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var notify = function (promise, isReject) {
	  if (promise._n) return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function () {
	    var value = promise._v;
	    var ok = promise._s == 1;
	    var i = 0;
	    var run = function (reaction) {
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (promise._h == 2) onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if (handler === true) result = value;
	          else {
	            if (domain) domain.enter();
	            result = handler(value); // may throw
	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }
	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (e) {
	        if (domain && !exited) domain.exit();
	        reject(e);
	      }
	    };
	    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if (isReject && !promise._h) onUnhandled(promise);
	  });
	};
	var onUnhandled = function (promise) {
	  task.call(_global, function () {
	    var value = promise._v;
	    var unhandled = isUnhandled(promise);
	    var result, handler, console;
	    if (unhandled) {
	      result = _perform(function () {
	        if (isNode$1) {
	          process$3.emit('unhandledRejection', value, promise);
	        } else if (handler = _global.onunhandledrejection) {
	          handler({ promise: promise, reason: value });
	        } else if ((console = _global.console) && console.error) {
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if (unhandled && result.e) throw result.v;
	  });
	};
	var isUnhandled = function (promise) {
	  return promise._h !== 1 && (promise._a || promise._c).length === 0;
	};
	var onHandleUnhandled = function (promise) {
	  task.call(_global, function () {
	    var handler;
	    if (isNode$1) {
	      process$3.emit('rejectionHandled', promise);
	    } else if (handler = _global.onrejectionhandled) {
	      handler({ promise: promise, reason: promise._v });
	    }
	  });
	};
	var $reject = function (value) {
	  var promise = this;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if (!promise._a) promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function (value) {
	  var promise = this;
	  var then;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
	    if (then = isThenable(value)) {
	      microtask(function () {
	        var wrapper = { _w: promise, _d: false }; // wrap
	        try {
	          then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
	        } catch (e) {
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch (e) {
	    $reject.call({ _w: promise, _d: false }, e); // wrap
	  }
	};

	// constructor polyfill
	if (!USE_NATIVE) {
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor) {
	    _anInstance(this, $Promise, PROMISE, '_h');
	    _aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
	    } catch (err) {
	      $reject.call(this, err);
	    }
	  };
	  // eslint-disable-next-line no-unused-vars
	  Internal = function Promise(executor) {
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = _redefineAll($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected) {
	      var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode$1 ? process$3.domain : undefined;
	      this._c.push(reaction);
	      if (this._a) this._a.push(reaction);
	      if (this._s) notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    this.promise = promise;
	    this.resolve = _ctx($resolve, promise, 1);
	    this.reject = _ctx($reject, promise, 1);
	  };
	  _newPromiseCapability.f = newPromiseCapability = function (C) {
	    return C === $Promise || C === Wrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };
	}

	_export(_export.G + _export.W + _export.F * !USE_NATIVE, { Promise: $Promise });
	_setToStringTag($Promise, PROMISE);
	_setSpecies(PROMISE);
	Wrapper = _core[PROMISE];

	// statics
	_export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r) {
	    var capability = newPromiseCapability(this);
	    var $$reject = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	_export(_export.S + _export.F * (_library || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x) {
	    return _promiseResolve(_library && this === Wrapper ? $Promise : this, x);
	  }
	});
	_export(_export.S + _export.F * !(USE_NATIVE && _iterDetect(function (iter) {
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = _perform(function () {
	      var values = [];
	      var index = 0;
	      var remaining = 1;
	      _forOf(iterable, false, function (promise) {
	        var $index = index++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var reject = capability.reject;
	    var result = _perform(function () {
	      _forOf(iterable, false, function (promise) {
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  }
	});

	_export(_export.P + _export.R, 'Promise', { 'finally': function (onFinally) {
	  var C = _speciesConstructor(this, _core.Promise || _global.Promise);
	  var isFunction = typeof onFinally == 'function';
	  return this.then(
	    isFunction ? function (x) {
	      return _promiseResolve(C, onFinally()).then(function () { return x; });
	    } : onFinally,
	    isFunction ? function (e) {
	      return _promiseResolve(C, onFinally()).then(function () { throw e; });
	    } : onFinally
	  );
	} });

	// 26.1.1 Reflect.apply(target, thisArgument, argumentsList)



	var rApply = (_global.Reflect || {}).apply;
	var fApply = Function.apply;
	// MS Edge argumentsList argument is optional
	_export(_export.S + _export.F * !_fails(function () {
	  rApply(function () { /* empty */ });
	}), 'Reflect', {
	  apply: function apply(target, thisArgument, argumentsList) {
	    var T = _aFunction(target);
	    var L = _anObject(argumentsList);
	    return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
	  }
	});

	var arraySlice = [].slice;
	var factories = {};

	var construct = function (F, len, args) {
	  if (!(len in factories)) {
	    for (var n = [], i = 0; i < len; i++) n[i] = 'a[' + i + ']';
	    // eslint-disable-next-line no-new-func
	    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
	  } return factories[len](F, args);
	};

	var _bind = Function.bind || function bind(that /* , ...args */) {
	  var fn = _aFunction(this);
	  var partArgs = arraySlice.call(arguments, 1);
	  var bound = function (/* args... */) {
	    var args = partArgs.concat(arraySlice.call(arguments));
	    return this instanceof bound ? construct(fn, args.length, args) : _invoke(fn, args, that);
	  };
	  if (_isObject(fn.prototype)) bound.prototype = fn.prototype;
	  return bound;
	};

	// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])







	var rConstruct = (_global.Reflect || {}).construct;

	// MS Edge supports only 2 arguments and argumentsList argument is optional
	// FF Nightly sets third argument as `new.target`, but does not create `this` from it
	var NEW_TARGET_BUG = _fails(function () {
	  function F() { /* empty */ }
	  return !(rConstruct(function () { /* empty */ }, [], F) instanceof F);
	});
	var ARGS_BUG = !_fails(function () {
	  rConstruct(function () { /* empty */ });
	});

	_export(_export.S + _export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
	  construct: function construct(Target, args /* , newTarget */) {
	    _aFunction(Target);
	    _anObject(args);
	    var newTarget = arguments.length < 3 ? Target : _aFunction(arguments[2]);
	    if (ARGS_BUG && !NEW_TARGET_BUG) return rConstruct(Target, args, newTarget);
	    if (Target == newTarget) {
	      // w/o altered newTarget, optimization for 0-4 arguments
	      switch (args.length) {
	        case 0: return new Target();
	        case 1: return new Target(args[0]);
	        case 2: return new Target(args[0], args[1]);
	        case 3: return new Target(args[0], args[1], args[2]);
	        case 4: return new Target(args[0], args[1], args[2], args[3]);
	      }
	      // w/o altered newTarget, lot of arguments case
	      var $args = [null];
	      $args.push.apply($args, args);
	      return new (_bind.apply(Target, $args))();
	    }
	    // with altered newTarget, not support built-in constructors
	    var proto = newTarget.prototype;
	    var instance = _objectCreate(_isObject(proto) ? proto : Object.prototype);
	    var result = Function.apply.call(Target, instance, args);
	    return _isObject(result) ? result : instance;
	  }
	});

	// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)





	// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
	_export(_export.S + _export.F * _fails(function () {
	  // eslint-disable-next-line no-undef
	  Reflect.defineProperty(_objectDp.f({}, 1, { value: 1 }), 1, { value: 2 });
	}), 'Reflect', {
	  defineProperty: function defineProperty(target, propertyKey, attributes) {
	    _anObject(target);
	    propertyKey = _toPrimitive(propertyKey, true);
	    _anObject(attributes);
	    try {
	      _objectDp.f(target, propertyKey, attributes);
	      return true;
	    } catch (e) {
	      return false;
	    }
	  }
	});

	// 26.1.4 Reflect.deleteProperty(target, propertyKey)

	var gOPD$2 = _objectGopd.f;


	_export(_export.S, 'Reflect', {
	  deleteProperty: function deleteProperty(target, propertyKey) {
	    var desc = gOPD$2(_anObject(target), propertyKey);
	    return desc && !desc.configurable ? false : delete target[propertyKey];
	  }
	});

	// 26.1.6 Reflect.get(target, propertyKey [, receiver])







	function get(target, propertyKey /* , receiver */) {
	  var receiver = arguments.length < 3 ? target : arguments[2];
	  var desc, proto;
	  if (_anObject(target) === receiver) return target[propertyKey];
	  if (desc = _objectGopd.f(target, propertyKey)) return _has(desc, 'value')
	    ? desc.value
	    : desc.get !== undefined
	      ? desc.get.call(receiver)
	      : undefined;
	  if (_isObject(proto = _objectGpo(target))) return get(proto, propertyKey, receiver);
	}

	_export(_export.S, 'Reflect', { get: get });

	// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)




	_export(_export.S, 'Reflect', {
	  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
	    return _objectGopd.f(_anObject(target), propertyKey);
	  }
	});

	// 26.1.8 Reflect.getPrototypeOf(target)




	_export(_export.S, 'Reflect', {
	  getPrototypeOf: function getPrototypeOf(target) {
	    return _objectGpo(_anObject(target));
	  }
	});

	// 26.1.9 Reflect.has(target, propertyKey)


	_export(_export.S, 'Reflect', {
	  has: function has(target, propertyKey) {
	    return propertyKey in target;
	  }
	});

	// 26.1.10 Reflect.isExtensible(target)


	var $isExtensible = Object.isExtensible;

	_export(_export.S, 'Reflect', {
	  isExtensible: function isExtensible(target) {
	    _anObject(target);
	    return $isExtensible ? $isExtensible(target) : true;
	  }
	});

	// 26.1.11 Reflect.ownKeys(target)


	_export(_export.S, 'Reflect', { ownKeys: _ownKeys });

	// 26.1.12 Reflect.preventExtensions(target)


	var $preventExtensions = Object.preventExtensions;

	_export(_export.S, 'Reflect', {
	  preventExtensions: function preventExtensions(target) {
	    _anObject(target);
	    try {
	      if ($preventExtensions) $preventExtensions(target);
	      return true;
	    } catch (e) {
	      return false;
	    }
	  }
	});

	// 26.1.13 Reflect.set(target, propertyKey, V [, receiver])









	function set(target, propertyKey, V /* , receiver */) {
	  var receiver = arguments.length < 4 ? target : arguments[3];
	  var ownDesc = _objectGopd.f(_anObject(target), propertyKey);
	  var existingDescriptor, proto;
	  if (!ownDesc) {
	    if (_isObject(proto = _objectGpo(target))) {
	      return set(proto, propertyKey, V, receiver);
	    }
	    ownDesc = _propertyDesc(0);
	  }
	  if (_has(ownDesc, 'value')) {
	    if (ownDesc.writable === false || !_isObject(receiver)) return false;
	    if (existingDescriptor = _objectGopd.f(receiver, propertyKey)) {
	      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
	      existingDescriptor.value = V;
	      _objectDp.f(receiver, propertyKey, existingDescriptor);
	    } else _objectDp.f(receiver, propertyKey, _propertyDesc(0, V));
	    return true;
	  }
	  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
	}

	_export(_export.S, 'Reflect', { set: set });

	// 26.1.14 Reflect.setPrototypeOf(target, proto)



	if (_setProto) _export(_export.S, 'Reflect', {
	  setPrototypeOf: function setPrototypeOf(target, proto) {
	    _setProto.check(target, proto);
	    try {
	      _setProto.set(target, proto);
	      return true;
	    } catch (e) {
	      return false;
	    }
	  }
	});

	// 7.2.8 IsRegExp(argument)


	var MATCH = _wks('match');
	var _isRegexp = function (it) {
	  var isRegExp;
	  return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
	};

	// 21.2.5.3 get RegExp.prototype.flags

	var _flags = function () {
	  var that = _anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	var dP$4 = _objectDp.f;
	var gOPN$2 = _objectGopn.f;


	var $RegExp = _global.RegExp;
	var Base$1 = $RegExp;
	var proto$2 = $RegExp.prototype;
	var re1 = /a/g;
	var re2 = /a/g;
	// "new" creates a new object, old webkit buggy here
	var CORRECT_NEW = new $RegExp(re1) !== re1;

	if (_descriptors && (!CORRECT_NEW || _fails(function () {
	  re2[_wks('match')] = false;
	  // RegExp constructor can alter flags and IsRegExp works correct with @@match
	  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
	}))) {
	  $RegExp = function RegExp(p, f) {
	    var tiRE = this instanceof $RegExp;
	    var piRE = _isRegexp(p);
	    var fiU = f === undefined;
	    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
	      : _inheritIfRequired(CORRECT_NEW
	        ? new Base$1(piRE && !fiU ? p.source : p, f)
	        : Base$1((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? _flags.call(p) : f)
	      , tiRE ? this : proto$2, $RegExp);
	  };
	  var proxy = function (key) {
	    key in $RegExp || dP$4($RegExp, key, {
	      configurable: true,
	      get: function () { return Base$1[key]; },
	      set: function (it) { Base$1[key] = it; }
	    });
	  };
	  for (var keys$1 = gOPN$2(Base$1), i = 0; keys$1.length > i;) proxy(keys$1[i++]);
	  proto$2.constructor = $RegExp;
	  $RegExp.prototype = proto$2;
	  _redefine(_global, 'RegExp', $RegExp);
	}

	_setSpecies('RegExp');

	// 21.2.5.3 get RegExp.prototype.flags()
	if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
	  configurable: true,
	  get: _flags
	});

	// true  -> String#at
	// false -> String#codePointAt
	var _stringAt = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(_defined(that));
	    var i = _toInteger(pos);
	    var l = s.length;
	    var a, b;
	    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

	var at = _stringAt(true);

	 // `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex
	var _advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? at(S, index).length : 1);
	};

	var builtinExec = RegExp.prototype.exec;

	 // `RegExpExec` abstract operation
	// https://tc39.github.io/ecma262/#sec-regexpexec
	var _regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);
	    if (typeof result !== 'object') {
	      throw new TypeError('RegExp exec method returned something other than an Object or null');
	    }
	    return result;
	  }
	  if (_classof(R) !== 'RegExp') {
	    throw new TypeError('RegExp#exec called on incompatible receiver');
	  }
	  return builtinExec.call(R, S);
	};

	var nativeExec = RegExp.prototype.exec;
	// This always refers to the native implementation, because the
	// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
	// which loads this file before patching the method.
	var nativeReplace = String.prototype.replace;

	var patchedExec = nativeExec;

	var LAST_INDEX = 'lastIndex';

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/,
	      re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
	})();

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + re.source + '$(?!\\s)', _flags.call(re));
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

	    match = nativeExec.call(re, str);

	    if (UPDATES_LAST_INDEX_WRONG && match) {
	      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      // eslint-disable-next-line no-loop-func
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    return match;
	  };
	}

	var _regexpExec = patchedExec;

	_export({
	  target: 'RegExp',
	  proto: true,
	  forced: _regexpExec !== /./.exec
	}, {
	  exec: _regexpExec
	});

	var SPECIES$3 = _wks('species');

	var REPLACE_SUPPORTS_NAMED_GROUPS = !_fails(function () {
	  // #replace needs built-in support for named groups.
	  // #match works fine because it just return the exec results, even if it has
	  // a "grops" property.
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  return ''.replace(re, '$<a>') !== '7';
	});

	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
	  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
	})();

	var _fixReWks = function (KEY, length, exec) {
	  var SYMBOL = _wks(KEY);

	  var DELEGATES_TO_SYMBOL = !_fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !_fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;
	    re.exec = function () { execCalled = true; return null; };
	    if (KEY === 'split') {
	      // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.
	      re.constructor = {};
	      re.constructor[SPECIES$3] = function () { return re; };
	    }
	    re[SYMBOL]('');
	    return !execCalled;
	  }) : undefined;

	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
	    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
	  ) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var fns = exec(
	      _defined,
	      SYMBOL,
	      ''[KEY],
	      function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
	        if (regexp.exec === _regexpExec) {
	          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	            // The native String method already delegates to @@method (this
	            // polyfilled function), leasing to infinite recursion.
	            // We avoid it by directly calling the native @@method method.
	            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
	          }
	          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
	        }
	        return { done: false };
	      }
	    );
	    var strfn = fns[0];
	    var rxfn = fns[1];

	    _redefine(String.prototype, KEY, strfn);
	    _hide(RegExp.prototype, SYMBOL, length == 2
	      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	      ? function (string, arg) { return rxfn.call(string, this, arg); }
	      // 21.2.5.6 RegExp.prototype[@@match](string)
	      // 21.2.5.9 RegExp.prototype[@@search](string)
	      : function (string) { return rxfn.call(string, this); }
	    );
	  }
	};

	// @@match logic
	_fixReWks('match', 1, function (defined, MATCH, $match, maybeCallNative) {
	  return [
	    // `String.prototype.match` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.match
	    function match(regexp) {
	      var O = defined(this);
	      var fn = regexp == undefined ? undefined : regexp[MATCH];
	      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
	    },
	    // `RegExp.prototype[@@match]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
	    function (regexp) {
	      var res = maybeCallNative($match, regexp, this);
	      if (res.done) return res.value;
	      var rx = _anObject(regexp);
	      var S = String(this);
	      if (!rx.global) return _regexpExecAbstract(rx, S);
	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	      var A = [];
	      var n = 0;
	      var result;
	      while ((result = _regexpExecAbstract(rx, S)) !== null) {
	        var matchStr = String(result[0]);
	        A[n] = matchStr;
	        if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
	        n++;
	      }
	      return n === 0 ? null : A;
	    }
	  ];
	});

	var max$1 = Math.max;
	var min$2 = Math.min;
	var floor$2 = Math.floor;
	var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	};

	// @@replace logic
	_fixReWks('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
	  return [
	    // `String.prototype.replace` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
	    function replace(searchValue, replaceValue) {
	      var O = defined(this);
	      var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
	      return fn !== undefined
	        ? fn.call(searchValue, O, replaceValue)
	        : $replace.call(String(O), searchValue, replaceValue);
	    },
	    // `RegExp.prototype[@@replace]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
	    function (regexp, replaceValue) {
	      var res = maybeCallNative($replace, regexp, this, replaceValue);
	      if (res.done) return res.value;

	      var rx = _anObject(regexp);
	      var S = String(this);
	      var functionalReplace = typeof replaceValue === 'function';
	      if (!functionalReplace) replaceValue = String(replaceValue);
	      var global = rx.global;
	      if (global) {
	        var fullUnicode = rx.unicode;
	        rx.lastIndex = 0;
	      }
	      var results = [];
	      while (true) {
	        var result = _regexpExecAbstract(rx, S);
	        if (result === null) break;
	        results.push(result);
	        if (!global) break;
	        var matchStr = String(result[0]);
	        if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
	      }
	      var accumulatedResult = '';
	      var nextSourcePosition = 0;
	      for (var i = 0; i < results.length; i++) {
	        result = results[i];
	        var matched = String(result[0]);
	        var position = max$1(min$2(_toInteger(result.index), S.length), 0);
	        var captures = [];
	        // NOTE: This is equivalent to
	        //   captures = result.slice(1).map(maybeToString)
	        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
	        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
	        var namedCaptures = result.groups;
	        if (functionalReplace) {
	          var replacerArgs = [matched].concat(captures, position, S);
	          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
	          var replacement = String(replaceValue.apply(undefined, replacerArgs));
	        } else {
	          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	        }
	        if (position >= nextSourcePosition) {
	          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
	          nextSourcePosition = position + matched.length;
	        }
	      }
	      return accumulatedResult + S.slice(nextSourcePosition);
	    }
	  ];

	    // https://tc39.github.io/ecma262/#sec-getsubstitution
	  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
	    var tailPos = position + matched.length;
	    var m = captures.length;
	    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
	    if (namedCaptures !== undefined) {
	      namedCaptures = _toObject(namedCaptures);
	      symbols = SUBSTITUTION_SYMBOLS;
	    }
	    return $replace.call(replacement, symbols, function (match, ch) {
	      var capture;
	      switch (ch.charAt(0)) {
	        case '$': return '$';
	        case '&': return matched;
	        case '`': return str.slice(0, position);
	        case "'": return str.slice(tailPos);
	        case '<':
	          capture = namedCaptures[ch.slice(1, -1)];
	          break;
	        default: // \d\d?
	          var n = +ch;
	          if (n === 0) return match;
	          if (n > m) {
	            var f = floor$2(n / 10);
	            if (f === 0) return match;
	            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
	            return match;
	          }
	          capture = captures[n - 1];
	      }
	      return capture === undefined ? '' : capture;
	    });
	  }
	});

	var $min = Math.min;
	var $push = [].push;
	var $SPLIT = 'split';
	var LENGTH = 'length';
	var LAST_INDEX$1 = 'lastIndex';
	var MAX_UINT32 = 0xffffffff;

	// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
	var SUPPORTS_Y = !_fails(function () { });

	// @@split logic
	_fixReWks('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
	  var internalSplit;
	  if (
	    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
	    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
	    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
	    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
	    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
	    ''[$SPLIT](/.?/)[LENGTH]
	  ) {
	    // based on es5-shim implementation, need to rework it
	    internalSplit = function (separator, limit) {
	      var string = String(this);
	      if (separator === undefined && limit === 0) return [];
	      // If `separator` is not a regex, use native split
	      if (!_isRegexp(separator)) return $split.call(string, separator, limit);
	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') +
	                  (separator.multiline ? 'm' : '') +
	                  (separator.unicode ? 'u' : '') +
	                  (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0;
	      var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var match, lastIndex, lastLength;
	      while (match = _regexpExec.call(separatorCopy, string)) {
	        lastIndex = separatorCopy[LAST_INDEX$1];
	        if (lastIndex > lastLastIndex) {
	          output.push(string.slice(lastLastIndex, match.index));
	          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
	          lastLength = match[0][LENGTH];
	          lastLastIndex = lastIndex;
	          if (output[LENGTH] >= splitLimit) break;
	        }
	        if (separatorCopy[LAST_INDEX$1] === match.index) separatorCopy[LAST_INDEX$1]++; // Avoid an infinite loop
	      }
	      if (lastLastIndex === string[LENGTH]) {
	        if (lastLength || !separatorCopy.test('')) output.push('');
	      } else output.push(string.slice(lastLastIndex));
	      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
	    };
	  // Chakra, V8
	  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
	    };
	  } else {
	    internalSplit = $split;
	  }

	  return [
	    // `String.prototype.split` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.split
	    function split(separator, limit) {
	      var O = defined(this);
	      var splitter = separator == undefined ? undefined : separator[SPLIT];
	      return splitter !== undefined
	        ? splitter.call(separator, O, limit)
	        : internalSplit.call(String(O), separator, limit);
	    },
	    // `RegExp.prototype[@@split]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
	    //
	    // NOTE: This cannot be properly polyfilled in engines that don't support
	    // the 'y' flag.
	    function (regexp, limit) {
	      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
	      if (res.done) return res.value;

	      var rx = _anObject(regexp);
	      var S = String(this);
	      var C = _speciesConstructor(rx, RegExp);

	      var unicodeMatching = rx.unicode;
	      var flags = (rx.ignoreCase ? 'i' : '') +
	                  (rx.multiline ? 'm' : '') +
	                  (rx.unicode ? 'u' : '') +
	                  (SUPPORTS_Y ? 'y' : 'g');

	      // ^(? + rx + ) is needed, in combination with some S slicing, to
	      // simulate the 'y' flag.
	      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (S.length === 0) return _regexpExecAbstract(splitter, S) === null ? [S] : [];
	      var p = 0;
	      var q = 0;
	      var A = [];
	      while (q < S.length) {
	        splitter.lastIndex = SUPPORTS_Y ? q : 0;
	        var z = _regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
	        var e;
	        if (
	          z === null ||
	          (e = $min(_toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
	        ) {
	          q = _advanceStringIndex(S, q, unicodeMatching);
	        } else {
	          A.push(S.slice(p, q));
	          if (A.length === lim) return A;
	          for (var i = 1; i <= z.length - 1; i++) {
	            A.push(z[i]);
	            if (A.length === lim) return A;
	          }
	          q = p = e;
	        }
	      }
	      A.push(S.slice(p));
	      return A;
	    }
	  ];
	});

	// @@search logic
	_fixReWks('search', 1, function (defined, SEARCH, $search, maybeCallNative) {
	  return [
	    // `String.prototype.search` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.search
	    function search(regexp) {
	      var O = defined(this);
	      var fn = regexp == undefined ? undefined : regexp[SEARCH];
	      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
	    },
	    // `RegExp.prototype[@@search]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
	    function (regexp) {
	      var res = maybeCallNative($search, regexp, this);
	      if (res.done) return res.value;
	      var rx = _anObject(regexp);
	      var S = String(this);
	      var previousLastIndex = rx.lastIndex;
	      if (!_sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
	      var result = _regexpExecAbstract(rx, S);
	      if (!_sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
	      return result === null ? -1 : result.index;
	    }
	  ];
	});

	var TO_STRING = 'toString';
	var $toString = /./[TO_STRING];

	var define = function (fn) {
	  _redefine(RegExp.prototype, TO_STRING, fn, true);
	};

	// 21.2.5.14 RegExp.prototype.toString()
	if (_fails(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
	  define(function toString() {
	    var R = _anObject(this);
	    return '/'.concat(R.source, '/',
	      'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
	  });
	// FF44- RegExp#toString has a wrong name
	} else if ($toString.name != TO_STRING) {
	  define(function toString() {
	    return $toString.call(this);
	  });
	}

	var SET = 'Set';

	// 23.2 Set Objects
	var es6_set = _collection(SET, function (get) {
	  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.2.3.1 Set.prototype.add(value)
	  add: function add(value) {
	    return _collectionStrong.def(_validateCollection(this, SET), value = value === 0 ? 0 : value, value);
	  }
	}, _collectionStrong);

	var f$7 = _wks;

	var _wksExt = {
		f: f$7
	};

	var defineProperty = _objectDp.f;
	var _wksDefine = function (name) {
	  var $Symbol = _core.Symbol || (_core.Symbol = _global.Symbol || {});
	  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: _wksExt.f(name) });
	};

	// all enumerable object keys, includes symbols



	var _enumKeys = function (it) {
	  var result = _objectKeys(it);
	  var getSymbols = _objectGops.f;
	  if (getSymbols) {
	    var symbols = getSymbols(it);
	    var isEnum = _objectPie.f;
	    var i = 0;
	    var key;
	    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
	  } return result;
	};

	// ECMAScript 6 symbols shim





	var META = _meta.KEY;



















	var gOPD$3 = _objectGopd.f;
	var dP$5 = _objectDp.f;
	var gOPN$3 = _objectGopnExt.f;
	var $Symbol = _global.Symbol;
	var $JSON = _global.JSON;
	var _stringify = $JSON && $JSON.stringify;
	var PROTOTYPE$2 = 'prototype';
	var HIDDEN = _wks('_hidden');
	var TO_PRIMITIVE$1 = _wks('toPrimitive');
	var isEnum$1 = {}.propertyIsEnumerable;
	var SymbolRegistry = _shared('symbol-registry');
	var AllSymbols = _shared('symbols');
	var OPSymbols = _shared('op-symbols');
	var ObjectProto$1 = Object[PROTOTYPE$2];
	var USE_NATIVE$1 = typeof $Symbol == 'function';
	var QObject = _global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = _descriptors && _fails(function () {
	  return _objectCreate(dP$5({}, 'a', {
	    get: function () { return dP$5(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (it, key, D) {
	  var protoDesc = gOPD$3(ObjectProto$1, key);
	  if (protoDesc) delete ObjectProto$1[key];
	  dP$5(it, key, D);
	  if (protoDesc && it !== ObjectProto$1) dP$5(ObjectProto$1, key, protoDesc);
	} : dP$5;

	var wrap = function (tag) {
	  var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE$1 && typeof $Symbol.iterator == 'symbol' ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D) {
	  if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
	  _anObject(it);
	  key = _toPrimitive(key, true);
	  _anObject(D);
	  if (_has(AllSymbols, key)) {
	    if (!D.enumerable) {
	      if (!_has(it, HIDDEN)) dP$5(it, HIDDEN, _propertyDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
	      D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
	    } return setSymbolDesc(it, key, D);
	  } return dP$5(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P) {
	  _anObject(it);
	  var keys = _enumKeys(P = _toIobject(P));
	  var i = 0;
	  var l = keys.length;
	  var key;
	  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P) {
	  return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key) {
	  var E = isEnum$1.call(this, key = _toPrimitive(key, true));
	  if (this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
	  return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor$1 = function getOwnPropertyDescriptor(it, key) {
	  it = _toIobject(it);
	  key = _toPrimitive(key, true);
	  if (it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
	  var D = gOPD$3(it, key);
	  if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it) {
	  var names = gOPN$3(_toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
	  var IS_OP = it === ObjectProto$1;
	  var names = gOPN$3(IS_OP ? OPSymbols : _toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if (!USE_NATIVE$1) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
	    var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function (value) {
	      if (this === ObjectProto$1) $set.call(OPSymbols, value);
	      if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, _propertyDesc(1, value));
	    };
	    if (_descriptors && setter) setSymbolDesc(ObjectProto$1, tag, { configurable: true, set: $set });
	    return wrap(tag);
	  };
	  _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
	    return this._k;
	  });

	  _objectGopd.f = $getOwnPropertyDescriptor$1;
	  _objectDp.f = $defineProperty;
	  _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
	  _objectPie.f = $propertyIsEnumerable;
	  _objectGops.f = $getOwnPropertySymbols;

	  if (_descriptors && !_library) {
	    _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  _wksExt.f = function (name) {
	    return wrap(_wks(name));
	  };
	}

	_export(_export.G + _export.W + _export.F * !USE_NATIVE$1, { Symbol: $Symbol });

	for (var es6Symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), j$1 = 0; es6Symbols.length > j$1;)_wks(es6Symbols[j$1++]);

	for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

	_export(_export.S + _export.F * !USE_NATIVE$1, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function (key) {
	    return _has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
	    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
	  },
	  useSetter: function () { setter = true; },
	  useSimple: function () { setter = false; }
	});

	_export(_export.S + _export.F * !USE_NATIVE$1, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor$1,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && _export(_export.S + _export.F * (!USE_NATIVE$1 || _fails(function () {
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it) {
	    var args = [it];
	    var i = 1;
	    var replacer, $replacer;
	    while (arguments.length > i) args.push(arguments[i++]);
	    $replacer = replacer = args[1];
	    if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
	    if (!_isArray(replacer)) replacer = function (key, value) {
	      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
	      if (!isSymbol(value)) return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE$2][TO_PRIMITIVE$1] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE$1, $Symbol[PROTOTYPE$2].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	_setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	_setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	_setToStringTag(_global.JSON, 'JSON', true);

	_wksDefine('asyncIterator');

	var quot = /"/g;
	// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
	var createHTML = function (string, tag, attribute, value) {
	  var S = String(_defined(string));
	  var p1 = '<' + tag;
	  if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
	  return p1 + '>' + S + '</' + tag + '>';
	};
	var _stringHtml = function (NAME, exec) {
	  var O = {};
	  O[NAME] = exec(createHTML);
	  _export(_export.P + _export.F * _fails(function () {
	    var test = ''[NAME]('"');
	    return test !== test.toLowerCase() || test.split('"').length > 3;
	  }), 'String', O);
	};

	// B.2.3.2 String.prototype.anchor(name)
	_stringHtml('anchor', function (createHTML) {
	  return function anchor(name) {
	    return createHTML(this, 'a', 'name', name);
	  };
	});

	// B.2.3.3 String.prototype.big()
	_stringHtml('big', function (createHTML) {
	  return function big() {
	    return createHTML(this, 'big', '', '');
	  };
	});

	// B.2.3.4 String.prototype.blink()
	_stringHtml('blink', function (createHTML) {
	  return function blink() {
	    return createHTML(this, 'blink', '', '');
	  };
	});

	// B.2.3.5 String.prototype.bold()
	_stringHtml('bold', function (createHTML) {
	  return function bold() {
	    return createHTML(this, 'b', '', '');
	  };
	});

	var $at = _stringAt(false);
	_export(_export.P, 'String', {
	  // 21.1.3.3 String.prototype.codePointAt(pos)
	  codePointAt: function codePointAt(pos) {
	    return $at(this, pos);
	  }
	});

	// helper for String#{startsWith, endsWith, includes}



	var _stringContext = function (that, searchString, NAME) {
	  if (_isRegexp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
	  return String(_defined(that));
	};

	var MATCH$1 = _wks('match');
	var _failsIsRegexp = function (KEY) {
	  var re = /./;
	  try {
	    '/./'[KEY](re);
	  } catch (e) {
	    try {
	      re[MATCH$1] = false;
	      return !'/./'[KEY](re);
	    } catch (f) { /* empty */ }
	  } return true;
	};

	var ENDS_WITH = 'endsWith';
	var $endsWith = ''[ENDS_WITH];

	_export(_export.P + _export.F * _failsIsRegexp(ENDS_WITH), 'String', {
	  endsWith: function endsWith(searchString /* , endPosition = @length */) {
	    var that = _stringContext(this, searchString, ENDS_WITH);
	    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
	    var len = _toLength(that.length);
	    var end = endPosition === undefined ? len : Math.min(_toLength(endPosition), len);
	    var search = String(searchString);
	    return $endsWith
	      ? $endsWith.call(that, search, end)
	      : that.slice(end - search.length, end) === search;
	  }
	});

	// B.2.3.6 String.prototype.fixed()
	_stringHtml('fixed', function (createHTML) {
	  return function fixed() {
	    return createHTML(this, 'tt', '', '');
	  };
	});

	// B.2.3.7 String.prototype.fontcolor(color)
	_stringHtml('fontcolor', function (createHTML) {
	  return function fontcolor(color) {
	    return createHTML(this, 'font', 'color', color);
	  };
	});

	// B.2.3.8 String.prototype.fontsize(size)
	_stringHtml('fontsize', function (createHTML) {
	  return function fontsize(size) {
	    return createHTML(this, 'font', 'size', size);
	  };
	});

	var fromCharCode = String.fromCharCode;
	var $fromCodePoint = String.fromCodePoint;

	// length should be 1, old FF problem
	_export(_export.S + _export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
	  // 21.1.2.2 String.fromCodePoint(...codePoints)
	  fromCodePoint: function fromCodePoint(x) { // eslint-disable-line no-unused-vars
	    var res = [];
	    var aLen = arguments.length;
	    var i = 0;
	    var code;
	    while (aLen > i) {
	      code = +arguments[i++];
	      if (_toAbsoluteIndex(code, 0x10ffff) !== code) throw RangeError(code + ' is not a valid code point');
	      res.push(code < 0x10000
	        ? fromCharCode(code)
	        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
	      );
	    } return res.join('');
	  }
	});

	var INCLUDES = 'includes';

	_export(_export.P + _export.F * _failsIsRegexp(INCLUDES), 'String', {
	  includes: function includes(searchString /* , position = 0 */) {
	    return !!~_stringContext(this, searchString, INCLUDES)
	      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// B.2.3.9 String.prototype.italics()
	_stringHtml('italics', function (createHTML) {
	  return function italics() {
	    return createHTML(this, 'i', '', '');
	  };
	});

	var $at$1 = _stringAt(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	_iterDefine(String, 'String', function (iterated) {
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var index = this._i;
	  var point;
	  if (index >= O.length) return { value: undefined, done: true };
	  point = $at$1(O, index);
	  this._i += point.length;
	  return { value: point, done: false };
	});

	// B.2.3.10 String.prototype.link(url)
	_stringHtml('link', function (createHTML) {
	  return function link(url) {
	    return createHTML(this, 'a', 'href', url);
	  };
	});

	var _stringRepeat = function repeat(count) {
	  var str = String(_defined(this));
	  var res = '';
	  var n = _toInteger(count);
	  if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");
	  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) res += str;
	  return res;
	};

	// https://github.com/tc39/proposal-string-pad-start-end




	var _stringPad = function (that, maxLength, fillString, left) {
	  var S = String(_defined(that));
	  var stringLength = S.length;
	  var fillStr = fillString === undefined ? ' ' : String(fillString);
	  var intMaxLength = _toLength(maxLength);
	  if (intMaxLength <= stringLength || fillStr == '') return S;
	  var fillLen = intMaxLength - stringLength;
	  var stringFiller = _stringRepeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
	  if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
	  return left ? stringFiller + S : S + stringFiller;
	};

	// https://github.com/tc39/proposal-string-pad-start-end




	// https://github.com/zloirock/core-js/issues/280
	var WEBKIT_BUG = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(_userAgent);

	_export(_export.P + _export.F * WEBKIT_BUG, 'String', {
	  padStart: function padStart(maxLength /* , fillString = ' ' */) {
	    return _stringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
	  }
	});

	// https://github.com/tc39/proposal-string-pad-start-end




	// https://github.com/zloirock/core-js/issues/280
	var WEBKIT_BUG$1 = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(_userAgent);

	_export(_export.P + _export.F * WEBKIT_BUG$1, 'String', {
	  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
	    return _stringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
	  }
	});

	_export(_export.S, 'String', {
	  // 21.1.2.4 String.raw(callSite, ...substitutions)
	  raw: function raw(callSite) {
	    var tpl = _toIobject(callSite.raw);
	    var len = _toLength(tpl.length);
	    var aLen = arguments.length;
	    var res = [];
	    var i = 0;
	    while (len > i) {
	      res.push(String(tpl[i++]));
	      if (i < aLen) res.push(String(arguments[i]));
	    } return res.join('');
	  }
	});

	_export(_export.P, 'String', {
	  // 21.1.3.13 String.prototype.repeat(count)
	  repeat: _stringRepeat
	});

	// B.2.3.11 String.prototype.small()
	_stringHtml('small', function (createHTML) {
	  return function small() {
	    return createHTML(this, 'small', '', '');
	  };
	});

	var STARTS_WITH = 'startsWith';
	var $startsWith = ''[STARTS_WITH];

	_export(_export.P + _export.F * _failsIsRegexp(STARTS_WITH), 'String', {
	  startsWith: function startsWith(searchString /* , position = 0 */) {
	    var that = _stringContext(this, searchString, STARTS_WITH);
	    var index = _toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
	    var search = String(searchString);
	    return $startsWith
	      ? $startsWith.call(that, search, index)
	      : that.slice(index, index + search.length) === search;
	  }
	});

	// B.2.3.12 String.prototype.strike()
	_stringHtml('strike', function (createHTML) {
	  return function strike() {
	    return createHTML(this, 'strike', '', '');
	  };
	});

	// B.2.3.13 String.prototype.sub()
	_stringHtml('sub', function (createHTML) {
	  return function sub() {
	    return createHTML(this, 'sub', '', '');
	  };
	});

	// B.2.3.14 String.prototype.sup()
	_stringHtml('sup', function (createHTML) {
	  return function sup() {
	    return createHTML(this, 'sup', '', '');
	  };
	});

	// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
	_stringTrim('trimLeft', function ($trim) {
	  return function trimLeft() {
	    return $trim(this, 1);
	  };
	}, 'trimStart');

	// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
	_stringTrim('trimRight', function ($trim) {
	  return function trimRight() {
	    return $trim(this, 2);
	  };
	}, 'trimEnd');

	var TYPED = _uid('typed_array');
	var VIEW = _uid('view');
	var ABV = !!(_global.ArrayBuffer && _global.DataView);
	var CONSTR = ABV;
	var i$1 = 0;
	var l = 9;
	var Typed;

	var TypedArrayConstructors = (
	  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
	).split(',');

	while (i$1 < l) {
	  if (Typed = _global[TypedArrayConstructors[i$1++]]) {
	    _hide(Typed.prototype, TYPED, true);
	    _hide(Typed.prototype, VIEW, true);
	  } else CONSTR = false;
	}

	var _typed = {
	  ABV: ABV,
	  CONSTR: CONSTR,
	  TYPED: TYPED,
	  VIEW: VIEW
	};

	// https://tc39.github.io/ecma262/#sec-toindex


	var _toIndex = function (it) {
	  if (it === undefined) return 0;
	  var number = _toInteger(it);
	  var length = _toLength(number);
	  if (number !== length) throw RangeError('Wrong length!');
	  return length;
	};

	var _typedBuffer = createCommonjsModule(function (module, exports) {











	var gOPN = _objectGopn.f;
	var dP = _objectDp.f;


	var ARRAY_BUFFER = 'ArrayBuffer';
	var DATA_VIEW = 'DataView';
	var PROTOTYPE = 'prototype';
	var WRONG_LENGTH = 'Wrong length!';
	var WRONG_INDEX = 'Wrong index!';
	var $ArrayBuffer = _global[ARRAY_BUFFER];
	var $DataView = _global[DATA_VIEW];
	var Math = _global.Math;
	var RangeError = _global.RangeError;
	// eslint-disable-next-line no-shadow-restricted-names
	var Infinity = _global.Infinity;
	var BaseBuffer = $ArrayBuffer;
	var abs = Math.abs;
	var pow = Math.pow;
	var floor = Math.floor;
	var log = Math.log;
	var LN2 = Math.LN2;
	var BUFFER = 'buffer';
	var BYTE_LENGTH = 'byteLength';
	var BYTE_OFFSET = 'byteOffset';
	var $BUFFER = _descriptors ? '_b' : BUFFER;
	var $LENGTH = _descriptors ? '_l' : BYTE_LENGTH;
	var $OFFSET = _descriptors ? '_o' : BYTE_OFFSET;

	// IEEE754 conversions based on https://github.com/feross/ieee754
	function packIEEE754(value, mLen, nBytes) {
	  var buffer = new Array(nBytes);
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
	  var i = 0;
	  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
	  var e, m, c;
	  value = abs(value);
	  // eslint-disable-next-line no-self-compare
	  if (value != value || value === Infinity) {
	    // eslint-disable-next-line no-self-compare
	    m = value != value ? 1 : 0;
	    e = eMax;
	  } else {
	    e = floor(log(value) / LN2);
	    if (value * (c = pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }
	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * pow(2, eBias - 1) * pow(2, mLen);
	      e = 0;
	    }
	  }
	  for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
	  e = e << mLen | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
	  buffer[--i] |= s * 128;
	  return buffer;
	}
	function unpackIEEE754(buffer, mLen, nBytes) {
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var nBits = eLen - 7;
	  var i = nBytes - 1;
	  var s = buffer[i--];
	  var e = s & 127;
	  var m;
	  s >>= 7;
	  for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
	  m = e & (1 << -nBits) - 1;
	  e >>= -nBits;
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : s ? -Infinity : Infinity;
	  } else {
	    m = m + pow(2, mLen);
	    e = e - eBias;
	  } return (s ? -1 : 1) * m * pow(2, e - mLen);
	}

	function unpackI32(bytes) {
	  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
	}
	function packI8(it) {
	  return [it & 0xff];
	}
	function packI16(it) {
	  return [it & 0xff, it >> 8 & 0xff];
	}
	function packI32(it) {
	  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
	}
	function packF64(it) {
	  return packIEEE754(it, 52, 8);
	}
	function packF32(it) {
	  return packIEEE754(it, 23, 4);
	}

	function addGetter(C, key, internal) {
	  dP(C[PROTOTYPE], key, { get: function () { return this[internal]; } });
	}

	function get(view, bytes, index, isLittleEndian) {
	  var numIndex = +index;
	  var intIndex = _toIndex(numIndex);
	  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
	  var store = view[$BUFFER]._b;
	  var start = intIndex + view[$OFFSET];
	  var pack = store.slice(start, start + bytes);
	  return isLittleEndian ? pack : pack.reverse();
	}
	function set(view, bytes, index, conversion, value, isLittleEndian) {
	  var numIndex = +index;
	  var intIndex = _toIndex(numIndex);
	  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
	  var store = view[$BUFFER]._b;
	  var start = intIndex + view[$OFFSET];
	  var pack = conversion(+value);
	  for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
	}

	if (!_typed.ABV) {
	  $ArrayBuffer = function ArrayBuffer(length) {
	    _anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
	    var byteLength = _toIndex(length);
	    this._b = _arrayFill.call(new Array(byteLength), 0);
	    this[$LENGTH] = byteLength;
	  };

	  $DataView = function DataView(buffer, byteOffset, byteLength) {
	    _anInstance(this, $DataView, DATA_VIEW);
	    _anInstance(buffer, $ArrayBuffer, DATA_VIEW);
	    var bufferLength = buffer[$LENGTH];
	    var offset = _toInteger(byteOffset);
	    if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
	    byteLength = byteLength === undefined ? bufferLength - offset : _toLength(byteLength);
	    if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
	    this[$BUFFER] = buffer;
	    this[$OFFSET] = offset;
	    this[$LENGTH] = byteLength;
	  };

	  if (_descriptors) {
	    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
	    addGetter($DataView, BUFFER, '_b');
	    addGetter($DataView, BYTE_LENGTH, '_l');
	    addGetter($DataView, BYTE_OFFSET, '_o');
	  }

	  _redefineAll($DataView[PROTOTYPE], {
	    getInt8: function getInt8(byteOffset) {
	      return get(this, 1, byteOffset)[0] << 24 >> 24;
	    },
	    getUint8: function getUint8(byteOffset) {
	      return get(this, 1, byteOffset)[0];
	    },
	    getInt16: function getInt16(byteOffset /* , littleEndian */) {
	      var bytes = get(this, 2, byteOffset, arguments[1]);
	      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
	    },
	    getUint16: function getUint16(byteOffset /* , littleEndian */) {
	      var bytes = get(this, 2, byteOffset, arguments[1]);
	      return bytes[1] << 8 | bytes[0];
	    },
	    getInt32: function getInt32(byteOffset /* , littleEndian */) {
	      return unpackI32(get(this, 4, byteOffset, arguments[1]));
	    },
	    getUint32: function getUint32(byteOffset /* , littleEndian */) {
	      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
	    },
	    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
	      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
	    },
	    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
	      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
	    },
	    setInt8: function setInt8(byteOffset, value) {
	      set(this, 1, byteOffset, packI8, value);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      set(this, 1, byteOffset, packI8, value);
	    },
	    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
	      set(this, 2, byteOffset, packI16, value, arguments[2]);
	    },
	    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
	      set(this, 2, byteOffset, packI16, value, arguments[2]);
	    },
	    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
	      set(this, 4, byteOffset, packI32, value, arguments[2]);
	    },
	    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
	      set(this, 4, byteOffset, packI32, value, arguments[2]);
	    },
	    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
	      set(this, 4, byteOffset, packF32, value, arguments[2]);
	    },
	    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
	      set(this, 8, byteOffset, packF64, value, arguments[2]);
	    }
	  });
	} else {
	  if (!_fails(function () {
	    $ArrayBuffer(1);
	  }) || !_fails(function () {
	    new $ArrayBuffer(-1); // eslint-disable-line no-new
	  }) || _fails(function () {
	    new $ArrayBuffer(); // eslint-disable-line no-new
	    new $ArrayBuffer(1.5); // eslint-disable-line no-new
	    new $ArrayBuffer(NaN); // eslint-disable-line no-new
	    return $ArrayBuffer.name != ARRAY_BUFFER;
	  })) {
	    $ArrayBuffer = function ArrayBuffer(length) {
	      _anInstance(this, $ArrayBuffer);
	      return new BaseBuffer(_toIndex(length));
	    };
	    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
	    for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
	      if (!((key = keys[j++]) in $ArrayBuffer)) _hide($ArrayBuffer, key, BaseBuffer[key]);
	    }
	    ArrayBufferProto.constructor = $ArrayBuffer;
	  }
	  // iOS Safari 7.x bug
	  var view = new $DataView(new $ArrayBuffer(2));
	  var $setInt8 = $DataView[PROTOTYPE].setInt8;
	  view.setInt8(0, 2147483648);
	  view.setInt8(1, 2147483649);
	  if (view.getInt8(0) || !view.getInt8(1)) _redefineAll($DataView[PROTOTYPE], {
	    setInt8: function setInt8(byteOffset, value) {
	      $setInt8.call(this, byteOffset, value << 24 >> 24);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      $setInt8.call(this, byteOffset, value << 24 >> 24);
	    }
	  }, true);
	}
	_setToStringTag($ArrayBuffer, ARRAY_BUFFER);
	_setToStringTag($DataView, DATA_VIEW);
	_hide($DataView[PROTOTYPE], _typed.VIEW, true);
	exports[ARRAY_BUFFER] = $ArrayBuffer;
	exports[DATA_VIEW] = $DataView;
	});

	var ArrayBuffer = _global.ArrayBuffer;

	var $ArrayBuffer = _typedBuffer.ArrayBuffer;
	var $DataView = _typedBuffer.DataView;
	var $isView = _typed.ABV && ArrayBuffer.isView;
	var $slice = $ArrayBuffer.prototype.slice;
	var VIEW$1 = _typed.VIEW;
	var ARRAY_BUFFER = 'ArrayBuffer';

	_export(_export.G + _export.W + _export.F * (ArrayBuffer !== $ArrayBuffer), { ArrayBuffer: $ArrayBuffer });

	_export(_export.S + _export.F * !_typed.CONSTR, ARRAY_BUFFER, {
	  // 24.1.3.1 ArrayBuffer.isView(arg)
	  isView: function isView(it) {
	    return $isView && $isView(it) || _isObject(it) && VIEW$1 in it;
	  }
	});

	_export(_export.P + _export.U + _export.F * _fails(function () {
	  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
	}), ARRAY_BUFFER, {
	  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
	  slice: function slice(start, end) {
	    if ($slice !== undefined && end === undefined) return $slice.call(_anObject(this), start); // FF fix
	    var len = _anObject(this).byteLength;
	    var first = _toAbsoluteIndex(start, len);
	    var fin = _toAbsoluteIndex(end === undefined ? len : end, len);
	    var result = new (_speciesConstructor(this, $ArrayBuffer))(_toLength(fin - first));
	    var viewS = new $DataView(this);
	    var viewT = new $DataView(result);
	    var index = 0;
	    while (first < fin) {
	      viewT.setUint8(index++, viewS.getUint8(first++));
	    } return result;
	  }
	});

	_setSpecies(ARRAY_BUFFER);

	var _typedArray = createCommonjsModule(function (module) {
	if (_descriptors) {
	  var global = _global;
	  var fails = _fails;
	  var $export = _export;
	  var $typed = _typed;
	  var $buffer = _typedBuffer;
	  var ctx = _ctx;
	  var anInstance = _anInstance;
	  var propertyDesc = _propertyDesc;
	  var hide = _hide;
	  var redefineAll = _redefineAll;
	  var toInteger = _toInteger;
	  var toLength = _toLength;
	  var toIndex = _toIndex;
	  var toAbsoluteIndex = _toAbsoluteIndex;
	  var toPrimitive = _toPrimitive;
	  var has = _has;
	  var classof = _classof;
	  var isObject = _isObject;
	  var toObject = _toObject;
	  var isArrayIter = _isArrayIter;
	  var create = _objectCreate;
	  var getPrototypeOf = _objectGpo;
	  var gOPN = _objectGopn.f;
	  var getIterFn = core_getIteratorMethod;
	  var uid = _uid;
	  var wks = _wks;
	  var createArrayMethod = _arrayMethods;
	  var createArrayIncludes = _arrayIncludes;
	  var speciesConstructor = _speciesConstructor;
	  var ArrayIterators = es6_array_iterator;
	  var Iterators = _iterators;
	  var $iterDetect = _iterDetect;
	  var setSpecies = _setSpecies;
	  var arrayFill = _arrayFill;
	  var arrayCopyWithin = _arrayCopyWithin;
	  var $DP = _objectDp;
	  var $GOPD = _objectGopd;
	  var dP = $DP.f;
	  var gOPD = $GOPD.f;
	  var RangeError = global.RangeError;
	  var TypeError = global.TypeError;
	  var Uint8Array = global.Uint8Array;
	  var ARRAY_BUFFER = 'ArrayBuffer';
	  var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
	  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
	  var PROTOTYPE = 'prototype';
	  var ArrayProto = Array[PROTOTYPE];
	  var $ArrayBuffer = $buffer.ArrayBuffer;
	  var $DataView = $buffer.DataView;
	  var arrayForEach = createArrayMethod(0);
	  var arrayFilter = createArrayMethod(2);
	  var arraySome = createArrayMethod(3);
	  var arrayEvery = createArrayMethod(4);
	  var arrayFind = createArrayMethod(5);
	  var arrayFindIndex = createArrayMethod(6);
	  var arrayIncludes = createArrayIncludes(true);
	  var arrayIndexOf = createArrayIncludes(false);
	  var arrayValues = ArrayIterators.values;
	  var arrayKeys = ArrayIterators.keys;
	  var arrayEntries = ArrayIterators.entries;
	  var arrayLastIndexOf = ArrayProto.lastIndexOf;
	  var arrayReduce = ArrayProto.reduce;
	  var arrayReduceRight = ArrayProto.reduceRight;
	  var arrayJoin = ArrayProto.join;
	  var arraySort = ArrayProto.sort;
	  var arraySlice = ArrayProto.slice;
	  var arrayToString = ArrayProto.toString;
	  var arrayToLocaleString = ArrayProto.toLocaleString;
	  var ITERATOR = wks('iterator');
	  var TAG = wks('toStringTag');
	  var TYPED_CONSTRUCTOR = uid('typed_constructor');
	  var DEF_CONSTRUCTOR = uid('def_constructor');
	  var ALL_CONSTRUCTORS = $typed.CONSTR;
	  var TYPED_ARRAY = $typed.TYPED;
	  var VIEW = $typed.VIEW;
	  var WRONG_LENGTH = 'Wrong length!';

	  var $map = createArrayMethod(1, function (O, length) {
	    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
	  });

	  var LITTLE_ENDIAN = fails(function () {
	    // eslint-disable-next-line no-undef
	    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
	  });

	  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
	    new Uint8Array(1).set({});
	  });

	  var toOffset = function (it, BYTES) {
	    var offset = toInteger(it);
	    if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
	    return offset;
	  };

	  var validate = function (it) {
	    if (isObject(it) && TYPED_ARRAY in it) return it;
	    throw TypeError(it + ' is not a typed array!');
	  };

	  var allocate = function (C, length) {
	    if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
	      throw TypeError('It is not a typed array constructor!');
	    } return new C(length);
	  };

	  var speciesFromList = function (O, list) {
	    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
	  };

	  var fromList = function (C, list) {
	    var index = 0;
	    var length = list.length;
	    var result = allocate(C, length);
	    while (length > index) result[index] = list[index++];
	    return result;
	  };

	  var addGetter = function (it, key, internal) {
	    dP(it, key, { get: function () { return this._d[internal]; } });
	  };

	  var $from = function from(source /* , mapfn, thisArg */) {
	    var O = toObject(source);
	    var aLen = arguments.length;
	    var mapfn = aLen > 1 ? arguments[1] : undefined;
	    var mapping = mapfn !== undefined;
	    var iterFn = getIterFn(O);
	    var i, length, values, result, step, iterator;
	    if (iterFn != undefined && !isArrayIter(iterFn)) {
	      for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
	        values.push(step.value);
	      } O = values;
	    }
	    if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);
	    for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
	      result[i] = mapping ? mapfn(O[i], i) : O[i];
	    }
	    return result;
	  };

	  var $of = function of(/* ...items */) {
	    var index = 0;
	    var length = arguments.length;
	    var result = allocate(this, length);
	    while (length > index) result[index] = arguments[index++];
	    return result;
	  };

	  // iOS Safari 6.x fails here
	  var TO_LOCALE_BUG = !!Uint8Array && fails(function () { arrayToLocaleString.call(new Uint8Array(1)); });

	  var $toLocaleString = function toLocaleString() {
	    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
	  };

	  var proto = {
	    copyWithin: function copyWithin(target, start /* , end */) {
	      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    every: function every(callbackfn /* , thisArg */) {
	      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    fill: function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
	      return arrayFill.apply(validate(this), arguments);
	    },
	    filter: function filter(callbackfn /* , thisArg */) {
	      return speciesFromList(this, arrayFilter(validate(this), callbackfn,
	        arguments.length > 1 ? arguments[1] : undefined));
	    },
	    find: function find(predicate /* , thisArg */) {
	      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    findIndex: function findIndex(predicate /* , thisArg */) {
	      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    forEach: function forEach(callbackfn /* , thisArg */) {
	      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    indexOf: function indexOf(searchElement /* , fromIndex */) {
	      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    includes: function includes(searchElement /* , fromIndex */) {
	      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    join: function join(separator) { // eslint-disable-line no-unused-vars
	      return arrayJoin.apply(validate(this), arguments);
	    },
	    lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) { // eslint-disable-line no-unused-vars
	      return arrayLastIndexOf.apply(validate(this), arguments);
	    },
	    map: function map(mapfn /* , thisArg */) {
	      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    reduce: function reduce(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
	      return arrayReduce.apply(validate(this), arguments);
	    },
	    reduceRight: function reduceRight(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
	      return arrayReduceRight.apply(validate(this), arguments);
	    },
	    reverse: function reverse() {
	      var that = this;
	      var length = validate(that).length;
	      var middle = Math.floor(length / 2);
	      var index = 0;
	      var value;
	      while (index < middle) {
	        value = that[index];
	        that[index++] = that[--length];
	        that[length] = value;
	      } return that;
	    },
	    some: function some(callbackfn /* , thisArg */) {
	      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    sort: function sort(comparefn) {
	      return arraySort.call(validate(this), comparefn);
	    },
	    subarray: function subarray(begin, end) {
	      var O = validate(this);
	      var length = O.length;
	      var $begin = toAbsoluteIndex(begin, length);
	      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
	        O.buffer,
	        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
	        toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin)
	      );
	    }
	  };

	  var $slice = function slice(start, end) {
	    return speciesFromList(this, arraySlice.call(validate(this), start, end));
	  };

	  var $set = function set(arrayLike /* , offset */) {
	    validate(this);
	    var offset = toOffset(arguments[1], 1);
	    var length = this.length;
	    var src = toObject(arrayLike);
	    var len = toLength(src.length);
	    var index = 0;
	    if (len + offset > length) throw RangeError(WRONG_LENGTH);
	    while (index < len) this[offset + index] = src[index++];
	  };

	  var $iterators = {
	    entries: function entries() {
	      return arrayEntries.call(validate(this));
	    },
	    keys: function keys() {
	      return arrayKeys.call(validate(this));
	    },
	    values: function values() {
	      return arrayValues.call(validate(this));
	    }
	  };

	  var isTAIndex = function (target, key) {
	    return isObject(target)
	      && target[TYPED_ARRAY]
	      && typeof key != 'symbol'
	      && key in target
	      && String(+key) == String(key);
	  };
	  var $getDesc = function getOwnPropertyDescriptor(target, key) {
	    return isTAIndex(target, key = toPrimitive(key, true))
	      ? propertyDesc(2, target[key])
	      : gOPD(target, key);
	  };
	  var $setDesc = function defineProperty(target, key, desc) {
	    if (isTAIndex(target, key = toPrimitive(key, true))
	      && isObject(desc)
	      && has(desc, 'value')
	      && !has(desc, 'get')
	      && !has(desc, 'set')
	      // TODO: add validation descriptor w/o calling accessors
	      && !desc.configurable
	      && (!has(desc, 'writable') || desc.writable)
	      && (!has(desc, 'enumerable') || desc.enumerable)
	    ) {
	      target[key] = desc.value;
	      return target;
	    } return dP(target, key, desc);
	  };

	  if (!ALL_CONSTRUCTORS) {
	    $GOPD.f = $getDesc;
	    $DP.f = $setDesc;
	  }

	  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
	    getOwnPropertyDescriptor: $getDesc,
	    defineProperty: $setDesc
	  });

	  if (fails(function () { arrayToString.call({}); })) {
	    arrayToString = arrayToLocaleString = function toString() {
	      return arrayJoin.call(this);
	    };
	  }

	  var $TypedArrayPrototype$ = redefineAll({}, proto);
	  redefineAll($TypedArrayPrototype$, $iterators);
	  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
	  redefineAll($TypedArrayPrototype$, {
	    slice: $slice,
	    set: $set,
	    constructor: function () { /* noop */ },
	    toString: arrayToString,
	    toLocaleString: $toLocaleString
	  });
	  addGetter($TypedArrayPrototype$, 'buffer', 'b');
	  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
	  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
	  addGetter($TypedArrayPrototype$, 'length', 'e');
	  dP($TypedArrayPrototype$, TAG, {
	    get: function () { return this[TYPED_ARRAY]; }
	  });

	  // eslint-disable-next-line max-statements
	  module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
	    CLAMPED = !!CLAMPED;
	    var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
	    var GETTER = 'get' + KEY;
	    var SETTER = 'set' + KEY;
	    var TypedArray = global[NAME];
	    var Base = TypedArray || {};
	    var TAC = TypedArray && getPrototypeOf(TypedArray);
	    var FORCED = !TypedArray || !$typed.ABV;
	    var O = {};
	    var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
	    var getter = function (that, index) {
	      var data = that._d;
	      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
	    };
	    var setter = function (that, index, value) {
	      var data = that._d;
	      if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
	      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
	    };
	    var addElement = function (that, index) {
	      dP(that, index, {
	        get: function () {
	          return getter(this, index);
	        },
	        set: function (value) {
	          return setter(this, index, value);
	        },
	        enumerable: true
	      });
	    };
	    if (FORCED) {
	      TypedArray = wrapper(function (that, data, $offset, $length) {
	        anInstance(that, TypedArray, NAME, '_d');
	        var index = 0;
	        var offset = 0;
	        var buffer, byteLength, length, klass;
	        if (!isObject(data)) {
	          length = toIndex(data);
	          byteLength = length * BYTES;
	          buffer = new $ArrayBuffer(byteLength);
	        } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
	          buffer = data;
	          offset = toOffset($offset, BYTES);
	          var $len = data.byteLength;
	          if ($length === undefined) {
	            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
	            byteLength = $len - offset;
	            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
	          } else {
	            byteLength = toLength($length) * BYTES;
	            if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
	          }
	          length = byteLength / BYTES;
	        } else if (TYPED_ARRAY in data) {
	          return fromList(TypedArray, data);
	        } else {
	          return $from.call(TypedArray, data);
	        }
	        hide(that, '_d', {
	          b: buffer,
	          o: offset,
	          l: byteLength,
	          e: length,
	          v: new $DataView(buffer)
	        });
	        while (index < length) addElement(that, index++);
	      });
	      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
	      hide(TypedArrayPrototype, 'constructor', TypedArray);
	    } else if (!fails(function () {
	      TypedArray(1);
	    }) || !fails(function () {
	      new TypedArray(-1); // eslint-disable-line no-new
	    }) || !$iterDetect(function (iter) {
	      new TypedArray(); // eslint-disable-line no-new
	      new TypedArray(null); // eslint-disable-line no-new
	      new TypedArray(1.5); // eslint-disable-line no-new
	      new TypedArray(iter); // eslint-disable-line no-new
	    }, true)) {
	      TypedArray = wrapper(function (that, data, $offset, $length) {
	        anInstance(that, TypedArray, NAME);
	        var klass;
	        // `ws` module bug, temporarily remove validation length for Uint8Array
	        // https://github.com/websockets/ws/pull/645
	        if (!isObject(data)) return new Base(toIndex(data));
	        if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
	          return $length !== undefined
	            ? new Base(data, toOffset($offset, BYTES), $length)
	            : $offset !== undefined
	              ? new Base(data, toOffset($offset, BYTES))
	              : new Base(data);
	        }
	        if (TYPED_ARRAY in data) return fromList(TypedArray, data);
	        return $from.call(TypedArray, data);
	      });
	      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
	        if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
	      });
	      TypedArray[PROTOTYPE] = TypedArrayPrototype;
	      TypedArrayPrototype.constructor = TypedArray;
	    }
	    var $nativeIterator = TypedArrayPrototype[ITERATOR];
	    var CORRECT_ITER_NAME = !!$nativeIterator
	      && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
	    var $iterator = $iterators.values;
	    hide(TypedArray, TYPED_CONSTRUCTOR, true);
	    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
	    hide(TypedArrayPrototype, VIEW, true);
	    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

	    if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
	      dP(TypedArrayPrototype, TAG, {
	        get: function () { return NAME; }
	      });
	    }

	    O[NAME] = TypedArray;

	    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

	    $export($export.S, NAME, {
	      BYTES_PER_ELEMENT: BYTES
	    });

	    $export($export.S + $export.F * fails(function () { Base.of.call(TypedArray, 1); }), NAME, {
	      from: $from,
	      of: $of
	    });

	    if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

	    $export($export.P, NAME, proto);

	    setSpecies(NAME);

	    $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });

	    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

	    if (TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;

	    $export($export.P + $export.F * fails(function () {
	      new TypedArray(1).slice();
	    }), NAME, { slice: $slice });

	    $export($export.P + $export.F * (fails(function () {
	      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
	    }) || !fails(function () {
	      TypedArrayPrototype.toLocaleString.call([1, 2]);
	    })), NAME, { toLocaleString: $toLocaleString });

	    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
	    if (!CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
	  };
	} else module.exports = function () { /* empty */ };
	});

	_typedArray('Int8', 1, function (init) {
	  return function Int8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	_typedArray('Uint8', 1, function (init) {
	  return function Uint8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	_typedArray('Uint8', 1, function (init) {
	  return function Uint8ClampedArray(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	}, true);

	_typedArray('Int16', 2, function (init) {
	  return function Int16Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	_typedArray('Uint16', 2, function (init) {
	  return function Uint16Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	_typedArray('Int32', 4, function (init) {
	  return function Int32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	_typedArray('Uint32', 4, function (init) {
	  return function Uint32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	_typedArray('Float32', 4, function (init) {
	  return function Float32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	_typedArray('Float64', 8, function (init) {
	  return function Float64Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	var getWeak = _meta.getWeak;







	var arrayFind = _arrayMethods(5);
	var arrayFindIndex = _arrayMethods(6);
	var id$1 = 0;

	// fallback for uncaught frozen keys
	var uncaughtFrozenStore = function (that) {
	  return that._l || (that._l = new UncaughtFrozenStore());
	};
	var UncaughtFrozenStore = function () {
	  this.a = [];
	};
	var findUncaughtFrozen = function (store, key) {
	  return arrayFind(store.a, function (it) {
	    return it[0] === key;
	  });
	};
	UncaughtFrozenStore.prototype = {
	  get: function (key) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) return entry[1];
	  },
	  has: function (key) {
	    return !!findUncaughtFrozen(this, key);
	  },
	  set: function (key, value) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) entry[1] = value;
	    else this.a.push([key, value]);
	  },
	  'delete': function (key) {
	    var index = arrayFindIndex(this.a, function (it) {
	      return it[0] === key;
	    });
	    if (~index) this.a.splice(index, 1);
	    return !!~index;
	  }
	};

	var _collectionWeak = {
	  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      _anInstance(that, C, NAME, '_i');
	      that._t = NAME;      // collection type
	      that._i = id$1++;      // collection id
	      that._l = undefined; // leak store for uncaught frozen objects
	      if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    _redefineAll(C.prototype, {
	      // 23.3.3.2 WeakMap.prototype.delete(key)
	      // 23.4.3.3 WeakSet.prototype.delete(value)
	      'delete': function (key) {
	        if (!_isObject(key)) return false;
	        var data = getWeak(key);
	        if (data === true) return uncaughtFrozenStore(_validateCollection(this, NAME))['delete'](key);
	        return data && _has(data, this._i) && delete data[this._i];
	      },
	      // 23.3.3.4 WeakMap.prototype.has(key)
	      // 23.4.3.4 WeakSet.prototype.has(value)
	      has: function has(key) {
	        if (!_isObject(key)) return false;
	        var data = getWeak(key);
	        if (data === true) return uncaughtFrozenStore(_validateCollection(this, NAME)).has(key);
	        return data && _has(data, this._i);
	      }
	    });
	    return C;
	  },
	  def: function (that, key, value) {
	    var data = getWeak(_anObject(key), true);
	    if (data === true) uncaughtFrozenStore(that).set(key, value);
	    else data[that._i] = value;
	    return that;
	  },
	  ufstore: uncaughtFrozenStore
	};

	var es6_weakMap = createCommonjsModule(function (module) {

	var each = _arrayMethods(0);






	var NATIVE_WEAK_MAP = _validateCollection;
	var IS_IE11 = !_global.ActiveXObject && 'ActiveXObject' in _global;
	var WEAK_MAP = 'WeakMap';
	var getWeak = _meta.getWeak;
	var isExtensible = Object.isExtensible;
	var uncaughtFrozenStore = _collectionWeak.ufstore;
	var InternalMap;

	var wrapper = function (get) {
	  return function WeakMap() {
	    return get(this, arguments.length > 0 ? arguments[0] : undefined);
	  };
	};

	var methods = {
	  // 23.3.3.3 WeakMap.prototype.get(key)
	  get: function get(key) {
	    if (_isObject(key)) {
	      var data = getWeak(key);
	      if (data === true) return uncaughtFrozenStore(_validateCollection(this, WEAK_MAP)).get(key);
	      return data ? data[this._i] : undefined;
	    }
	  },
	  // 23.3.3.5 WeakMap.prototype.set(key, value)
	  set: function set(key, value) {
	    return _collectionWeak.def(_validateCollection(this, WEAK_MAP), key, value);
	  }
	};

	// 23.3 WeakMap Objects
	var $WeakMap = module.exports = _collection(WEAK_MAP, wrapper, methods, _collectionWeak, true, true);

	// IE11 WeakMap frozen keys fix
	if (NATIVE_WEAK_MAP && IS_IE11) {
	  InternalMap = _collectionWeak.getConstructor(wrapper, WEAK_MAP);
	  _objectAssign(InternalMap.prototype, methods);
	  _meta.NEED = true;
	  each(['delete', 'has', 'get', 'set'], function (key) {
	    var proto = $WeakMap.prototype;
	    var method = proto[key];
	    _redefine(proto, key, function (a, b) {
	      // store frozen objects on internal weakmap shim
	      if (_isObject(a) && !isExtensible(a)) {
	        if (!this._f) this._f = new InternalMap();
	        var result = this._f[key](a, b);
	        return key == 'set' ? this : result;
	      // store all the rest on native weakmap
	      } return method.call(this, a, b);
	    });
	  });
	}
	});

	var WEAK_SET = 'WeakSet';

	// 23.4 WeakSet Objects
	_collection(WEAK_SET, function (get) {
	  return function WeakSet() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.4.3.1 WeakSet.prototype.add(value)
	  add: function add(value) {
	    return _collectionWeak.def(_validateCollection(this, WEAK_SET), value, true);
	  }
	}, _collectionWeak, false, true);

	// ie9- setTimeout & setInterval additional parameters fix



	var slice = [].slice;
	var MSIE = /MSIE .\./.test(_userAgent); // <- dirty ie9- check
	var wrap$1 = function (set) {
	  return function (fn, time /* , ...args */) {
	    var boundArgs = arguments.length > 2;
	    var args = boundArgs ? slice.call(arguments, 2) : false;
	    return set(boundArgs ? function () {
	      // eslint-disable-next-line no-new-func
	      (typeof fn == 'function' ? fn : Function(fn)).apply(this, args);
	    } : fn, time);
	  };
	};
	_export(_export.G + _export.B + _export.F * MSIE, {
	  setTimeout: wrap$1(_global.setTimeout),
	  setInterval: wrap$1(_global.setInterval)
	});

	_export(_export.G + _export.B, {
	  setImmediate: _task.set,
	  clearImmediate: _task.clear
	});

	var ITERATOR$4 = _wks('iterator');
	var TO_STRING_TAG = _wks('toStringTag');
	var ArrayValues = _iterators.Array;

	var DOMIterables = {
	  CSSRuleList: true, // TODO: Not spec compliant, should be false.
	  CSSStyleDeclaration: false,
	  CSSValueList: false,
	  ClientRectList: false,
	  DOMRectList: false,
	  DOMStringList: false,
	  DOMTokenList: true,
	  DataTransferItemList: false,
	  FileList: false,
	  HTMLAllCollection: false,
	  HTMLCollection: false,
	  HTMLFormElement: false,
	  HTMLSelectElement: false,
	  MediaList: true, // TODO: Not spec compliant, should be false.
	  MimeTypeArray: false,
	  NamedNodeMap: false,
	  NodeList: true,
	  PaintRequestList: false,
	  Plugin: false,
	  PluginArray: false,
	  SVGLengthList: false,
	  SVGNumberList: false,
	  SVGPathSegList: false,
	  SVGPointList: false,
	  SVGStringList: false,
	  SVGTransformList: false,
	  SourceBufferList: false,
	  StyleSheetList: true, // TODO: Not spec compliant, should be false.
	  TextTrackCueList: false,
	  TextTrackList: false,
	  TouchList: false
	};

	for (var collections = _objectKeys(DOMIterables), i$2 = 0; i$2 < collections.length; i$2++) {
	  var NAME$1 = collections[i$2];
	  var explicit = DOMIterables[NAME$1];
	  var Collection = _global[NAME$1];
	  var proto$3 = Collection && Collection.prototype;
	  var key$1;
	  if (proto$3) {
	    if (!proto$3[ITERATOR$4]) _hide(proto$3, ITERATOR$4, ArrayValues);
	    if (!proto$3[TO_STRING_TAG]) _hide(proto$3, TO_STRING_TAG, NAME$1);
	    _iterators[NAME$1] = ArrayValues;
	    if (explicit) for (key$1 in es6_array_iterator) if (!proto$3[key$1]) _redefine(proto$3, key$1, es6_array_iterator[key$1], true);
	  }
	}

	var bluebird = createCommonjsModule(function (module, exports) {
	/* @preserve
	 * The MIT License (MIT)
	 * 
	 * Copyright (c) 2013-2018 Petka Antonov
	 * 
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 * 
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 * 
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 * 
	 */
	/**
	 * bluebird build version 3.5.4
	 * Features enabled: core, race, call_get, generators, map, nodeify, promisify, props, reduce, settle, some, using, timers, filter, any, each
	*/
	!function(e){module.exports=e();}(function(){return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r);}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
	module.exports = function(Promise) {
	var SomePromiseArray = Promise._SomePromiseArray;
	function any(promises) {
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(1);
	    ret.setUnwrap();
	    ret.init();
	    return promise;
	}

	Promise.any = function (promises) {
	    return any(promises);
	};

	Promise.prototype.any = function () {
	    return any(this);
	};

	};

	},{}],2:[function(_dereq_,module,exports){
	var firstLineError;
	try {throw new Error(); } catch (e) {firstLineError = e;}
	var schedule = _dereq_("./schedule");
	var Queue = _dereq_("./queue");
	var util = _dereq_("./util");

	function Async() {
	    this._customScheduler = false;
	    this._isTickUsed = false;
	    this._lateQueue = new Queue(16);
	    this._normalQueue = new Queue(16);
	    this._haveDrainedQueues = false;
	    this._trampolineEnabled = true;
	    var self = this;
	    this.drainQueues = function () {
	        self._drainQueues();
	    };
	    this._schedule = schedule;
	}

	Async.prototype.setScheduler = function(fn) {
	    var prev = this._schedule;
	    this._schedule = fn;
	    this._customScheduler = true;
	    return prev;
	};

	Async.prototype.hasCustomScheduler = function() {
	    return this._customScheduler;
	};

	Async.prototype.enableTrampoline = function() {
	    this._trampolineEnabled = true;
	};

	Async.prototype.disableTrampolineIfNecessary = function() {
	    if (util.hasDevTools) {
	        this._trampolineEnabled = false;
	    }
	};

	Async.prototype.haveItemsQueued = function () {
	    return this._isTickUsed || this._haveDrainedQueues;
	};


	Async.prototype.fatalError = function(e, isNode) {
	    if (isNode) {
	        process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) +
	            "\n");
	        process.exit(2);
	    } else {
	        this.throwLater(e);
	    }
	};

	Async.prototype.throwLater = function(fn, arg) {
	    if (arguments.length === 1) {
	        arg = fn;
	        fn = function () { throw arg; };
	    }
	    if (typeof setTimeout !== "undefined") {
	        setTimeout(function() {
	            fn(arg);
	        }, 0);
	    } else try {
	        this._schedule(function() {
	            fn(arg);
	        });
	    } catch (e) {
	        throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	};

	function AsyncInvokeLater(fn, receiver, arg) {
	    this._lateQueue.push(fn, receiver, arg);
	    this._queueTick();
	}

	function AsyncInvoke(fn, receiver, arg) {
	    this._normalQueue.push(fn, receiver, arg);
	    this._queueTick();
	}

	function AsyncSettlePromises(promise) {
	    this._normalQueue._pushOne(promise);
	    this._queueTick();
	}

	if (!util.hasDevTools) {
	    Async.prototype.invokeLater = AsyncInvokeLater;
	    Async.prototype.invoke = AsyncInvoke;
	    Async.prototype.settlePromises = AsyncSettlePromises;
	} else {
	    Async.prototype.invokeLater = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvokeLater.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                setTimeout(function() {
	                    fn.call(receiver, arg);
	                }, 100);
	            });
	        }
	    };

	    Async.prototype.invoke = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvoke.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                fn.call(receiver, arg);
	            });
	        }
	    };

	    Async.prototype.settlePromises = function(promise) {
	        if (this._trampolineEnabled) {
	            AsyncSettlePromises.call(this, promise);
	        } else {
	            this._schedule(function() {
	                promise._settlePromises();
	            });
	        }
	    };
	}

	function _drainQueue(queue) {
	    while (queue.length() > 0) {
	        _drainQueueStep(queue);
	    }
	}

	function _drainQueueStep(queue) {
	    var fn = queue.shift();
	    if (typeof fn !== "function") {
	        fn._settlePromises();
	    } else {
	        var receiver = queue.shift();
	        var arg = queue.shift();
	        fn.call(receiver, arg);
	    }
	}

	Async.prototype._drainQueues = function () {
	    _drainQueue(this._normalQueue);
	    this._reset();
	    this._haveDrainedQueues = true;
	    _drainQueue(this._lateQueue);
	};

	Async.prototype._queueTick = function () {
	    if (!this._isTickUsed) {
	        this._isTickUsed = true;
	        this._schedule(this.drainQueues);
	    }
	};

	Async.prototype._reset = function () {
	    this._isTickUsed = false;
	};

	module.exports = Async;
	module.exports.firstLineError = firstLineError;

	},{"./queue":26,"./schedule":29,"./util":36}],3:[function(_dereq_,module,exports){
	module.exports = function(Promise, INTERNAL, tryConvertToPromise, debug) {
	var calledBind = false;
	var rejectThis = function(_, e) {
	    this._reject(e);
	};

	var targetRejected = function(e, context) {
	    context.promiseRejectionQueued = true;
	    context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
	};

	var bindingResolved = function(thisArg, context) {
	    if (((this._bitField & 50397184) === 0)) {
	        this._resolveCallback(context.target);
	    }
	};

	var bindingRejected = function(e, context) {
	    if (!context.promiseRejectionQueued) this._reject(e);
	};

	Promise.prototype.bind = function (thisArg) {
	    if (!calledBind) {
	        calledBind = true;
	        Promise.prototype._propagateFrom = debug.propagateFromFunction();
	        Promise.prototype._boundValue = debug.boundValueFunction();
	    }
	    var maybePromise = tryConvertToPromise(thisArg);
	    var ret = new Promise(INTERNAL);
	    ret._propagateFrom(this, 1);
	    var target = this._target();
	    ret._setBoundTo(maybePromise);
	    if (maybePromise instanceof Promise) {
	        var context = {
	            promiseRejectionQueued: false,
	            promise: ret,
	            target: target,
	            bindingPromise: maybePromise
	        };
	        target._then(INTERNAL, targetRejected, undefined, ret, context);
	        maybePromise._then(
	            bindingResolved, bindingRejected, undefined, ret, context);
	        ret._setOnCancel(maybePromise);
	    } else {
	        ret._resolveCallback(target);
	    }
	    return ret;
	};

	Promise.prototype._setBoundTo = function (obj) {
	    if (obj !== undefined) {
	        this._bitField = this._bitField | 2097152;
	        this._boundTo = obj;
	    } else {
	        this._bitField = this._bitField & (~2097152);
	    }
	};

	Promise.prototype._isBound = function () {
	    return (this._bitField & 2097152) === 2097152;
	};

	Promise.bind = function (thisArg, value) {
	    return Promise.resolve(value).bind(thisArg);
	};
	};

	},{}],4:[function(_dereq_,module,exports){
	var old;
	if (typeof Promise !== "undefined") old = Promise;
	function noConflict() {
	    try { if (Promise === bluebird) Promise = old; }
	    catch (e) {}
	    return bluebird;
	}
	var bluebird = _dereq_("./promise")();
	bluebird.noConflict = noConflict;
	module.exports = bluebird;

	},{"./promise":22}],5:[function(_dereq_,module,exports){
	var cr = Object.create;
	if (cr) {
	    var callerCache = cr(null);
	    var getterCache = cr(null);
	    callerCache[" size"] = getterCache[" size"] = 0;
	}

	module.exports = function(Promise) {
	var util = _dereq_("./util");
	var canEvaluate = util.canEvaluate;
	var isIdentifier = util.isIdentifier;
	var getGetter;

	function ensureMethod(obj, methodName) {
	    var fn;
	    if (obj != null) fn = obj[methodName];
	    if (typeof fn !== "function") {
	        var message = "Object " + util.classString(obj) + " has no method '" +
	            util.toString(methodName) + "'";
	        throw new Promise.TypeError(message);
	    }
	    return fn;
	}

	function caller(obj) {
	    var methodName = this.pop();
	    var fn = ensureMethod(obj, methodName);
	    return fn.apply(obj, this);
	}
	Promise.prototype.call = function (methodName) {
	    var args = [].slice.call(arguments, 1);    args.push(methodName);
	    return this._then(caller, undefined, undefined, args, undefined);
	};

	function namedGetter(obj) {
	    return obj[this];
	}
	function indexedGetter(obj) {
	    var index = +this;
	    if (index < 0) index = Math.max(0, index + obj.length);
	    return obj[index];
	}
	Promise.prototype.get = function (propertyName) {
	    var isIndex = (typeof propertyName === "number");
	    var getter;
	    if (!isIndex) {
	        if (canEvaluate) {
	            var maybeGetter = getGetter(propertyName);
	            getter = maybeGetter !== null ? maybeGetter : namedGetter;
	        } else {
	            getter = namedGetter;
	        }
	    } else {
	        getter = indexedGetter;
	    }
	    return this._then(getter, undefined, undefined, propertyName, undefined);
	};
	};

	},{"./util":36}],6:[function(_dereq_,module,exports){
	module.exports = function(Promise, PromiseArray, apiRejection, debug) {
	var util = _dereq_("./util");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var async = Promise._async;

	Promise.prototype["break"] = Promise.prototype.cancel = function() {
	    if (!debug.cancellation()) return this._warn("cancellation is disabled");

	    var promise = this;
	    var child = promise;
	    while (promise._isCancellable()) {
	        if (!promise._cancelBy(child)) {
	            if (child._isFollowing()) {
	                child._followee().cancel();
	            } else {
	                child._cancelBranched();
	            }
	            break;
	        }

	        var parent = promise._cancellationParent;
	        if (parent == null || !parent._isCancellable()) {
	            if (promise._isFollowing()) {
	                promise._followee().cancel();
	            } else {
	                promise._cancelBranched();
	            }
	            break;
	        } else {
	            if (promise._isFollowing()) promise._followee().cancel();
	            promise._setWillBeCancelled();
	            child = promise;
	            promise = parent;
	        }
	    }
	};

	Promise.prototype._branchHasCancelled = function() {
	    this._branchesRemainingToCancel--;
	};

	Promise.prototype._enoughBranchesHaveCancelled = function() {
	    return this._branchesRemainingToCancel === undefined ||
	           this._branchesRemainingToCancel <= 0;
	};

	Promise.prototype._cancelBy = function(canceller) {
	    if (canceller === this) {
	        this._branchesRemainingToCancel = 0;
	        this._invokeOnCancel();
	        return true;
	    } else {
	        this._branchHasCancelled();
	        if (this._enoughBranchesHaveCancelled()) {
	            this._invokeOnCancel();
	            return true;
	        }
	    }
	    return false;
	};

	Promise.prototype._cancelBranched = function() {
	    if (this._enoughBranchesHaveCancelled()) {
	        this._cancel();
	    }
	};

	Promise.prototype._cancel = function() {
	    if (!this._isCancellable()) return;
	    this._setCancelled();
	    async.invoke(this._cancelPromises, this, undefined);
	};

	Promise.prototype._cancelPromises = function() {
	    if (this._length() > 0) this._settlePromises();
	};

	Promise.prototype._unsetOnCancel = function() {
	    this._onCancelField = undefined;
	};

	Promise.prototype._isCancellable = function() {
	    return this.isPending() && !this._isCancelled();
	};

	Promise.prototype.isCancellable = function() {
	    return this.isPending() && !this.isCancelled();
	};

	Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
	    if (util.isArray(onCancelCallback)) {
	        for (var i = 0; i < onCancelCallback.length; ++i) {
	            this._doInvokeOnCancel(onCancelCallback[i], internalOnly);
	        }
	    } else if (onCancelCallback !== undefined) {
	        if (typeof onCancelCallback === "function") {
	            if (!internalOnly) {
	                var e = tryCatch(onCancelCallback).call(this._boundValue());
	                if (e === errorObj) {
	                    this._attachExtraTrace(e.e);
	                    async.throwLater(e.e);
	                }
	            }
	        } else {
	            onCancelCallback._resultCancelled(this);
	        }
	    }
	};

	Promise.prototype._invokeOnCancel = function() {
	    var onCancelCallback = this._onCancel();
	    this._unsetOnCancel();
	    async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
	};

	Promise.prototype._invokeInternalOnCancel = function() {
	    if (this._isCancellable()) {
	        this._doInvokeOnCancel(this._onCancel(), true);
	        this._unsetOnCancel();
	    }
	};

	Promise.prototype._resultCancelled = function() {
	    this.cancel();
	};

	};

	},{"./util":36}],7:[function(_dereq_,module,exports){
	module.exports = function(NEXT_FILTER) {
	var util = _dereq_("./util");
	var getKeys = _dereq_("./es5").keys;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;

	function catchFilter(instances, cb, promise) {
	    return function(e) {
	        var boundTo = promise._boundValue();
	        predicateLoop: for (var i = 0; i < instances.length; ++i) {
	            var item = instances[i];

	            if (item === Error ||
	                (item != null && item.prototype instanceof Error)) {
	                if (e instanceof item) {
	                    return tryCatch(cb).call(boundTo, e);
	                }
	            } else if (typeof item === "function") {
	                var matchesPredicate = tryCatch(item).call(boundTo, e);
	                if (matchesPredicate === errorObj) {
	                    return matchesPredicate;
	                } else if (matchesPredicate) {
	                    return tryCatch(cb).call(boundTo, e);
	                }
	            } else if (util.isObject(e)) {
	                var keys = getKeys(item);
	                for (var j = 0; j < keys.length; ++j) {
	                    var key = keys[j];
	                    if (item[key] != e[key]) {
	                        continue predicateLoop;
	                    }
	                }
	                return tryCatch(cb).call(boundTo, e);
	            }
	        }
	        return NEXT_FILTER;
	    };
	}

	return catchFilter;
	};

	},{"./es5":13,"./util":36}],8:[function(_dereq_,module,exports){
	module.exports = function(Promise) {
	var longStackTraces = false;
	var contextStack = [];

	Promise.prototype._promiseCreated = function() {};
	Promise.prototype._pushContext = function() {};
	Promise.prototype._popContext = function() {return null;};
	Promise._peekContext = Promise.prototype._peekContext = function() {};

	function Context() {
	    this._trace = new Context.CapturedTrace(peekContext());
	}
	Context.prototype._pushContext = function () {
	    if (this._trace !== undefined) {
	        this._trace._promiseCreated = null;
	        contextStack.push(this._trace);
	    }
	};

	Context.prototype._popContext = function () {
	    if (this._trace !== undefined) {
	        var trace = contextStack.pop();
	        var ret = trace._promiseCreated;
	        trace._promiseCreated = null;
	        return ret;
	    }
	    return null;
	};

	function createContext() {
	    if (longStackTraces) return new Context();
	}

	function peekContext() {
	    var lastIndex = contextStack.length - 1;
	    if (lastIndex >= 0) {
	        return contextStack[lastIndex];
	    }
	    return undefined;
	}
	Context.CapturedTrace = null;
	Context.create = createContext;
	Context.deactivateLongStackTraces = function() {};
	Context.activateLongStackTraces = function() {
	    var Promise_pushContext = Promise.prototype._pushContext;
	    var Promise_popContext = Promise.prototype._popContext;
	    var Promise_PeekContext = Promise._peekContext;
	    var Promise_peekContext = Promise.prototype._peekContext;
	    var Promise_promiseCreated = Promise.prototype._promiseCreated;
	    Context.deactivateLongStackTraces = function() {
	        Promise.prototype._pushContext = Promise_pushContext;
	        Promise.prototype._popContext = Promise_popContext;
	        Promise._peekContext = Promise_PeekContext;
	        Promise.prototype._peekContext = Promise_peekContext;
	        Promise.prototype._promiseCreated = Promise_promiseCreated;
	        longStackTraces = false;
	    };
	    longStackTraces = true;
	    Promise.prototype._pushContext = Context.prototype._pushContext;
	    Promise.prototype._popContext = Context.prototype._popContext;
	    Promise._peekContext = Promise.prototype._peekContext = peekContext;
	    Promise.prototype._promiseCreated = function() {
	        var ctx = this._peekContext();
	        if (ctx && ctx._promiseCreated == null) ctx._promiseCreated = this;
	    };
	};
	return Context;
	};

	},{}],9:[function(_dereq_,module,exports){
	module.exports = function(Promise, Context) {
	var getDomain = Promise._getDomain;
	var async = Promise._async;
	var Warning = _dereq_("./errors").Warning;
	var util = _dereq_("./util");
	var es5 = _dereq_("./es5");
	var canAttachTrace = util.canAttachTrace;
	var unhandledRejectionHandled;
	var possiblyUnhandledRejection;
	var bluebirdFramePattern =
	    /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
	var nodeFramePattern = /\((?:timers\.js):\d+:\d+\)/;
	var parseLinePattern = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/;
	var stackFramePattern = null;
	var formatStack = null;
	var indentStackFrames = false;
	var printWarning;
	var debugging = !!(util.env("BLUEBIRD_DEBUG") != 0 &&
	                        (true ||
	                         util.env("BLUEBIRD_DEBUG") ||
	                         util.env("NODE_ENV") === "development"));

	var warnings = !!(util.env("BLUEBIRD_WARNINGS") != 0 &&
	    (debugging || util.env("BLUEBIRD_WARNINGS")));

	var longStackTraces = !!(util.env("BLUEBIRD_LONG_STACK_TRACES") != 0 &&
	    (debugging || util.env("BLUEBIRD_LONG_STACK_TRACES")));

	var wForgottenReturn = util.env("BLUEBIRD_W_FORGOTTEN_RETURN") != 0 &&
	    (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));

	Promise.prototype.suppressUnhandledRejections = function() {
	    var target = this._target();
	    target._bitField = ((target._bitField & (~1048576)) |
	                      524288);
	};

	Promise.prototype._ensurePossibleRejectionHandled = function () {
	    if ((this._bitField & 524288) !== 0) return;
	    this._setRejectionIsUnhandled();
	    var self = this;
	    setTimeout(function() {
	        self._notifyUnhandledRejection();
	    }, 1);
	};

	Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
	    fireRejectionEvent("rejectionHandled",
	                                  unhandledRejectionHandled, undefined, this);
	};

	Promise.prototype._setReturnedNonUndefined = function() {
	    this._bitField = this._bitField | 268435456;
	};

	Promise.prototype._returnedNonUndefined = function() {
	    return (this._bitField & 268435456) !== 0;
	};

	Promise.prototype._notifyUnhandledRejection = function () {
	    if (this._isRejectionUnhandled()) {
	        var reason = this._settledValue();
	        this._setUnhandledRejectionIsNotified();
	        fireRejectionEvent("unhandledRejection",
	                                      possiblyUnhandledRejection, reason, this);
	    }
	};

	Promise.prototype._setUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField | 262144;
	};

	Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField & (~262144);
	};

	Promise.prototype._isUnhandledRejectionNotified = function () {
	    return (this._bitField & 262144) > 0;
	};

	Promise.prototype._setRejectionIsUnhandled = function () {
	    this._bitField = this._bitField | 1048576;
	};

	Promise.prototype._unsetRejectionIsUnhandled = function () {
	    this._bitField = this._bitField & (~1048576);
	    if (this._isUnhandledRejectionNotified()) {
	        this._unsetUnhandledRejectionIsNotified();
	        this._notifyUnhandledRejectionIsHandled();
	    }
	};

	Promise.prototype._isRejectionUnhandled = function () {
	    return (this._bitField & 1048576) > 0;
	};

	Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
	    return warn(message, shouldUseOwnTrace, promise || this);
	};

	Promise.onPossiblyUnhandledRejection = function (fn) {
	    var domain = getDomain();
	    possiblyUnhandledRejection =
	        typeof fn === "function" ? (domain === null ?
	                                            fn : util.domainBind(domain, fn))
	                                 : undefined;
	};

	Promise.onUnhandledRejectionHandled = function (fn) {
	    var domain = getDomain();
	    unhandledRejectionHandled =
	        typeof fn === "function" ? (domain === null ?
	                                            fn : util.domainBind(domain, fn))
	                                 : undefined;
	};

	var disableLongStackTraces = function() {};
	Promise.longStackTraces = function () {
	    if (async.haveItemsQueued() && !config.longStackTraces) {
	        throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    if (!config.longStackTraces && longStackTracesIsSupported()) {
	        var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
	        var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
	        var Promise_dereferenceTrace = Promise.prototype._dereferenceTrace;
	        config.longStackTraces = true;
	        disableLongStackTraces = function() {
	            if (async.haveItemsQueued() && !config.longStackTraces) {
	                throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	            }
	            Promise.prototype._captureStackTrace = Promise_captureStackTrace;
	            Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
	            Promise.prototype._dereferenceTrace = Promise_dereferenceTrace;
	            Context.deactivateLongStackTraces();
	            async.enableTrampoline();
	            config.longStackTraces = false;
	        };
	        Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
	        Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
	        Promise.prototype._dereferenceTrace = longStackTracesDereferenceTrace;
	        Context.activateLongStackTraces();
	        async.disableTrampolineIfNecessary();
	    }
	};

	Promise.hasLongStackTraces = function () {
	    return config.longStackTraces && longStackTracesIsSupported();
	};

	var fireDomEvent = (function() {
	    try {
	        if (typeof CustomEvent === "function") {
	            var event = new CustomEvent("CustomEvent");
	            util.global.dispatchEvent(event);
	            return function(name, event) {
	                var eventData = {
	                    detail: event,
	                    cancelable: true
	                };
	                es5.defineProperty(
	                    eventData, "promise", {value: event.promise});
	                es5.defineProperty(eventData, "reason", {value: event.reason});
	                var domEvent = new CustomEvent(name.toLowerCase(), eventData);
	                return !util.global.dispatchEvent(domEvent);
	            };
	        } else if (typeof Event === "function") {
	            var event = new Event("CustomEvent");
	            util.global.dispatchEvent(event);
	            return function(name, event) {
	                var domEvent = new Event(name.toLowerCase(), {
	                    cancelable: true
	                });
	                domEvent.detail = event;
	                es5.defineProperty(domEvent, "promise", {value: event.promise});
	                es5.defineProperty(domEvent, "reason", {value: event.reason});
	                return !util.global.dispatchEvent(domEvent);
	            };
	        } else {
	            var event = document.createEvent("CustomEvent");
	            event.initCustomEvent("testingtheevent", false, true, {});
	            util.global.dispatchEvent(event);
	            return function(name, event) {
	                var domEvent = document.createEvent("CustomEvent");
	                domEvent.initCustomEvent(name.toLowerCase(), false, true,
	                    event);
	                return !util.global.dispatchEvent(domEvent);
	            };
	        }
	    } catch (e) {}
	    return function() {
	        return false;
	    };
	})();

	var fireGlobalEvent = (function() {
	    if (util.isNode) {
	        return function() {
	            return process.emit.apply(process, arguments);
	        };
	    } else {
	        if (!util.global) {
	            return function() {
	                return false;
	            };
	        }
	        return function(name) {
	            var methodName = "on" + name.toLowerCase();
	            var method = util.global[methodName];
	            if (!method) return false;
	            method.apply(util.global, [].slice.call(arguments, 1));
	            return true;
	        };
	    }
	})();

	function generatePromiseLifecycleEventObject(name, promise) {
	    return {promise: promise};
	}

	var eventToObjectGenerator = {
	    promiseCreated: generatePromiseLifecycleEventObject,
	    promiseFulfilled: generatePromiseLifecycleEventObject,
	    promiseRejected: generatePromiseLifecycleEventObject,
	    promiseResolved: generatePromiseLifecycleEventObject,
	    promiseCancelled: generatePromiseLifecycleEventObject,
	    promiseChained: function(name, promise, child) {
	        return {promise: promise, child: child};
	    },
	    warning: function(name, warning) {
	        return {warning: warning};
	    },
	    unhandledRejection: function (name, reason, promise) {
	        return {reason: reason, promise: promise};
	    },
	    rejectionHandled: generatePromiseLifecycleEventObject
	};

	var activeFireEvent = function (name) {
	    var globalEventFired = false;
	    try {
	        globalEventFired = fireGlobalEvent.apply(null, arguments);
	    } catch (e) {
	        async.throwLater(e);
	        globalEventFired = true;
	    }

	    var domEventFired = false;
	    try {
	        domEventFired = fireDomEvent(name,
	                    eventToObjectGenerator[name].apply(null, arguments));
	    } catch (e) {
	        async.throwLater(e);
	        domEventFired = true;
	    }

	    return domEventFired || globalEventFired;
	};

	Promise.config = function(opts) {
	    opts = Object(opts);
	    if ("longStackTraces" in opts) {
	        if (opts.longStackTraces) {
	            Promise.longStackTraces();
	        } else if (!opts.longStackTraces && Promise.hasLongStackTraces()) {
	            disableLongStackTraces();
	        }
	    }
	    if ("warnings" in opts) {
	        var warningsOption = opts.warnings;
	        config.warnings = !!warningsOption;
	        wForgottenReturn = config.warnings;

	        if (util.isObject(warningsOption)) {
	            if ("wForgottenReturn" in warningsOption) {
	                wForgottenReturn = !!warningsOption.wForgottenReturn;
	            }
	        }
	    }
	    if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
	        if (async.haveItemsQueued()) {
	            throw new Error(
	                "cannot enable cancellation after promises are in use");
	        }
	        Promise.prototype._clearCancellationData =
	            cancellationClearCancellationData;
	        Promise.prototype._propagateFrom = cancellationPropagateFrom;
	        Promise.prototype._onCancel = cancellationOnCancel;
	        Promise.prototype._setOnCancel = cancellationSetOnCancel;
	        Promise.prototype._attachCancellationCallback =
	            cancellationAttachCancellationCallback;
	        Promise.prototype._execute = cancellationExecute;
	        propagateFromFunction = cancellationPropagateFrom;
	        config.cancellation = true;
	    }
	    if ("monitoring" in opts) {
	        if (opts.monitoring && !config.monitoring) {
	            config.monitoring = true;
	            Promise.prototype._fireEvent = activeFireEvent;
	        } else if (!opts.monitoring && config.monitoring) {
	            config.monitoring = false;
	            Promise.prototype._fireEvent = defaultFireEvent;
	        }
	    }
	    return Promise;
	};

	function defaultFireEvent() { return false; }

	Promise.prototype._fireEvent = defaultFireEvent;
	Promise.prototype._execute = function(executor, resolve, reject) {
	    try {
	        executor(resolve, reject);
	    } catch (e) {
	        return e;
	    }
	};
	Promise.prototype._onCancel = function () {};
	Promise.prototype._setOnCancel = function (handler) { };
	Promise.prototype._attachCancellationCallback = function(onCancel) {
	};
	Promise.prototype._captureStackTrace = function () {};
	Promise.prototype._attachExtraTrace = function () {};
	Promise.prototype._dereferenceTrace = function () {};
	Promise.prototype._clearCancellationData = function() {};
	Promise.prototype._propagateFrom = function (parent, flags) {
	};

	function cancellationExecute(executor, resolve, reject) {
	    var promise = this;
	    try {
	        executor(resolve, reject, function(onCancel) {
	            if (typeof onCancel !== "function") {
	                throw new TypeError("onCancel must be a function, got: " +
	                                    util.toString(onCancel));
	            }
	            promise._attachCancellationCallback(onCancel);
	        });
	    } catch (e) {
	        return e;
	    }
	}

	function cancellationAttachCancellationCallback(onCancel) {
	    if (!this._isCancellable()) return this;

	    var previousOnCancel = this._onCancel();
	    if (previousOnCancel !== undefined) {
	        if (util.isArray(previousOnCancel)) {
	            previousOnCancel.push(onCancel);
	        } else {
	            this._setOnCancel([previousOnCancel, onCancel]);
	        }
	    } else {
	        this._setOnCancel(onCancel);
	    }
	}

	function cancellationOnCancel() {
	    return this._onCancelField;
	}

	function cancellationSetOnCancel(onCancel) {
	    this._onCancelField = onCancel;
	}

	function cancellationClearCancellationData() {
	    this._cancellationParent = undefined;
	    this._onCancelField = undefined;
	}

	function cancellationPropagateFrom(parent, flags) {
	    if ((flags & 1) !== 0) {
	        this._cancellationParent = parent;
	        var branchesRemainingToCancel = parent._branchesRemainingToCancel;
	        if (branchesRemainingToCancel === undefined) {
	            branchesRemainingToCancel = 0;
	        }
	        parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
	    }
	    if ((flags & 2) !== 0 && parent._isBound()) {
	        this._setBoundTo(parent._boundTo);
	    }
	}

	function bindingPropagateFrom(parent, flags) {
	    if ((flags & 2) !== 0 && parent._isBound()) {
	        this._setBoundTo(parent._boundTo);
	    }
	}
	var propagateFromFunction = bindingPropagateFrom;

	function boundValueFunction() {
	    var ret = this._boundTo;
	    if (ret !== undefined) {
	        if (ret instanceof Promise) {
	            if (ret.isFulfilled()) {
	                return ret.value();
	            } else {
	                return undefined;
	            }
	        }
	    }
	    return ret;
	}

	function longStackTracesCaptureStackTrace() {
	    this._trace = new CapturedTrace(this._peekContext());
	}

	function longStackTracesAttachExtraTrace(error, ignoreSelf) {
	    if (canAttachTrace(error)) {
	        var trace = this._trace;
	        if (trace !== undefined) {
	            if (ignoreSelf) trace = trace._parent;
	        }
	        if (trace !== undefined) {
	            trace.attachExtraTrace(error);
	        } else if (!error.__stackCleaned__) {
	            var parsed = parseStackAndMessage(error);
	            util.notEnumerableProp(error, "stack",
	                parsed.message + "\n" + parsed.stack.join("\n"));
	            util.notEnumerableProp(error, "__stackCleaned__", true);
	        }
	    }
	}

	function longStackTracesDereferenceTrace() {
	    this._trace = undefined;
	}

	function checkForgottenReturns(returnValue, promiseCreated, name, promise,
	                               parent) {
	    if (returnValue === undefined && promiseCreated !== null &&
	        wForgottenReturn) {
	        if (parent !== undefined && parent._returnedNonUndefined()) return;
	        if ((promise._bitField & 65535) === 0) return;

	        if (name) name = name + " ";
	        var handlerLine = "";
	        var creatorLine = "";
	        if (promiseCreated._trace) {
	            var traceLines = promiseCreated._trace.stack.split("\n");
	            var stack = cleanStack(traceLines);
	            for (var i = stack.length - 1; i >= 0; --i) {
	                var line = stack[i];
	                if (!nodeFramePattern.test(line)) {
	                    var lineMatches = line.match(parseLinePattern);
	                    if (lineMatches) {
	                        handlerLine  = "at " + lineMatches[1] +
	                            ":" + lineMatches[2] + ":" + lineMatches[3] + " ";
	                    }
	                    break;
	                }
	            }

	            if (stack.length > 0) {
	                var firstUserLine = stack[0];
	                for (var i = 0; i < traceLines.length; ++i) {

	                    if (traceLines[i] === firstUserLine) {
	                        if (i > 0) {
	                            creatorLine = "\n" + traceLines[i - 1];
	                        }
	                        break;
	                    }
	                }

	            }
	        }
	        var msg = "a promise was created in a " + name +
	            "handler " + handlerLine + "but was not returned from it, " +
	            "see http://goo.gl/rRqMUw" +
	            creatorLine;
	        promise._warn(msg, true, promiseCreated);
	    }
	}

	function deprecated(name, replacement) {
	    var message = name +
	        " is deprecated and will be removed in a future version.";
	    if (replacement) message += " Use " + replacement + " instead.";
	    return warn(message);
	}

	function warn(message, shouldUseOwnTrace, promise) {
	    if (!config.warnings) return;
	    var warning = new Warning(message);
	    var ctx;
	    if (shouldUseOwnTrace) {
	        promise._attachExtraTrace(warning);
	    } else if (config.longStackTraces && (ctx = Promise._peekContext())) {
	        ctx.attachExtraTrace(warning);
	    } else {
	        var parsed = parseStackAndMessage(warning);
	        warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
	    }

	    if (!activeFireEvent("warning", warning)) {
	        formatAndLogError(warning, "", true);
	    }
	}

	function reconstructStack(message, stacks) {
	    for (var i = 0; i < stacks.length - 1; ++i) {
	        stacks[i].push("From previous event:");
	        stacks[i] = stacks[i].join("\n");
	    }
	    if (i < stacks.length) {
	        stacks[i] = stacks[i].join("\n");
	    }
	    return message + "\n" + stacks.join("\n");
	}

	function removeDuplicateOrEmptyJumps(stacks) {
	    for (var i = 0; i < stacks.length; ++i) {
	        if (stacks[i].length === 0 ||
	            ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
	            stacks.splice(i, 1);
	            i--;
	        }
	    }
	}

	function removeCommonRoots(stacks) {
	    var current = stacks[0];
	    for (var i = 1; i < stacks.length; ++i) {
	        var prev = stacks[i];
	        var currentLastIndex = current.length - 1;
	        var currentLastLine = current[currentLastIndex];
	        var commonRootMeetPoint = -1;

	        for (var j = prev.length - 1; j >= 0; --j) {
	            if (prev[j] === currentLastLine) {
	                commonRootMeetPoint = j;
	                break;
	            }
	        }

	        for (var j = commonRootMeetPoint; j >= 0; --j) {
	            var line = prev[j];
	            if (current[currentLastIndex] === line) {
	                current.pop();
	                currentLastIndex--;
	            } else {
	                break;
	            }
	        }
	        current = prev;
	    }
	}

	function cleanStack(stack) {
	    var ret = [];
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        var isTraceLine = "    (No stack trace)" === line ||
	            stackFramePattern.test(line);
	        var isInternalFrame = isTraceLine && shouldIgnore(line);
	        if (isTraceLine && !isInternalFrame) {
	            if (indentStackFrames && line.charAt(0) !== " ") {
	                line = "    " + line;
	            }
	            ret.push(line);
	        }
	    }
	    return ret;
	}

	function stackFramesAsArray(error) {
	    var stack = error.stack.replace(/\s+$/g, "").split("\n");
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
	            break;
	        }
	    }
	    if (i > 0 && error.name != "SyntaxError") {
	        stack = stack.slice(i);
	    }
	    return stack;
	}

	function parseStackAndMessage(error) {
	    var stack = error.stack;
	    var message = error.toString();
	    stack = typeof stack === "string" && stack.length > 0
	                ? stackFramesAsArray(error) : ["    (No stack trace)"];
	    return {
	        message: message,
	        stack: error.name == "SyntaxError" ? stack : cleanStack(stack)
	    };
	}

	function formatAndLogError(error, title, isSoft) {
	    if (typeof console !== "undefined") {
	        var message;
	        if (util.isObject(error)) {
	            var stack = error.stack;
	            message = title + formatStack(stack, error);
	        } else {
	            message = title + String(error);
	        }
	        if (typeof printWarning === "function") {
	            printWarning(message, isSoft);
	        } else if (typeof console.log === "function" ||
	            typeof console.log === "object") {
	            console.log(message);
	        }
	    }
	}

	function fireRejectionEvent(name, localHandler, reason, promise) {
	    var localEventFired = false;
	    try {
	        if (typeof localHandler === "function") {
	            localEventFired = true;
	            if (name === "rejectionHandled") {
	                localHandler(promise);
	            } else {
	                localHandler(reason, promise);
	            }
	        }
	    } catch (e) {
	        async.throwLater(e);
	    }

	    if (name === "unhandledRejection") {
	        if (!activeFireEvent(name, reason, promise) && !localEventFired) {
	            formatAndLogError(reason, "Unhandled rejection ");
	        }
	    } else {
	        activeFireEvent(name, promise);
	    }
	}

	function formatNonError(obj) {
	    var str;
	    if (typeof obj === "function") {
	        str = "[function " +
	            (obj.name || "anonymous") +
	            "]";
	    } else {
	        str = obj && typeof obj.toString === "function"
	            ? obj.toString() : util.toString(obj);
	        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
	        if (ruselessToString.test(str)) {
	            try {
	                var newStr = JSON.stringify(obj);
	                str = newStr;
	            }
	            catch(e) {

	            }
	        }
	        if (str.length === 0) {
	            str = "(empty array)";
	        }
	    }
	    return ("(<" + snip(str) + ">, no stack trace)");
	}

	function snip(str) {
	    var maxChars = 41;
	    if (str.length < maxChars) {
	        return str;
	    }
	    return str.substr(0, maxChars - 3) + "...";
	}

	function longStackTracesIsSupported() {
	    return typeof captureStackTrace === "function";
	}

	var shouldIgnore = function() { return false; };
	var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
	function parseLineInfo(line) {
	    var matches = line.match(parseLineInfoRegex);
	    if (matches) {
	        return {
	            fileName: matches[1],
	            line: parseInt(matches[2], 10)
	        };
	    }
	}

	function setBounds(firstLineError, lastLineError) {
	    if (!longStackTracesIsSupported()) return;
	    var firstStackLines = firstLineError.stack.split("\n");
	    var lastStackLines = lastLineError.stack.split("\n");
	    var firstIndex = -1;
	    var lastIndex = -1;
	    var firstFileName;
	    var lastFileName;
	    for (var i = 0; i < firstStackLines.length; ++i) {
	        var result = parseLineInfo(firstStackLines[i]);
	        if (result) {
	            firstFileName = result.fileName;
	            firstIndex = result.line;
	            break;
	        }
	    }
	    for (var i = 0; i < lastStackLines.length; ++i) {
	        var result = parseLineInfo(lastStackLines[i]);
	        if (result) {
	            lastFileName = result.fileName;
	            lastIndex = result.line;
	            break;
	        }
	    }
	    if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
	        firstFileName !== lastFileName || firstIndex >= lastIndex) {
	        return;
	    }

	    shouldIgnore = function(line) {
	        if (bluebirdFramePattern.test(line)) return true;
	        var info = parseLineInfo(line);
	        if (info) {
	            if (info.fileName === firstFileName &&
	                (firstIndex <= info.line && info.line <= lastIndex)) {
	                return true;
	            }
	        }
	        return false;
	    };
	}

	function CapturedTrace(parent) {
	    this._parent = parent;
	    this._promisesCreated = 0;
	    var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
	    captureStackTrace(this, CapturedTrace);
	    if (length > 32) this.uncycle();
	}
	util.inherits(CapturedTrace, Error);
	Context.CapturedTrace = CapturedTrace;

	CapturedTrace.prototype.uncycle = function() {
	    var length = this._length;
	    if (length < 2) return;
	    var nodes = [];
	    var stackToIndex = {};

	    for (var i = 0, node = this; node !== undefined; ++i) {
	        nodes.push(node);
	        node = node._parent;
	    }
	    length = this._length = i;
	    for (var i = length - 1; i >= 0; --i) {
	        var stack = nodes[i].stack;
	        if (stackToIndex[stack] === undefined) {
	            stackToIndex[stack] = i;
	        }
	    }
	    for (var i = 0; i < length; ++i) {
	        var currentStack = nodes[i].stack;
	        var index = stackToIndex[currentStack];
	        if (index !== undefined && index !== i) {
	            if (index > 0) {
	                nodes[index - 1]._parent = undefined;
	                nodes[index - 1]._length = 1;
	            }
	            nodes[i]._parent = undefined;
	            nodes[i]._length = 1;
	            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

	            if (index < length - 1) {
	                cycleEdgeNode._parent = nodes[index + 1];
	                cycleEdgeNode._parent.uncycle();
	                cycleEdgeNode._length =
	                    cycleEdgeNode._parent._length + 1;
	            } else {
	                cycleEdgeNode._parent = undefined;
	                cycleEdgeNode._length = 1;
	            }
	            var currentChildLength = cycleEdgeNode._length + 1;
	            for (var j = i - 2; j >= 0; --j) {
	                nodes[j]._length = currentChildLength;
	                currentChildLength++;
	            }
	            return;
	        }
	    }
	};

	CapturedTrace.prototype.attachExtraTrace = function(error) {
	    if (error.__stackCleaned__) return;
	    this.uncycle();
	    var parsed = parseStackAndMessage(error);
	    var message = parsed.message;
	    var stacks = [parsed.stack];

	    var trace = this;
	    while (trace !== undefined) {
	        stacks.push(cleanStack(trace.stack.split("\n")));
	        trace = trace._parent;
	    }
	    removeCommonRoots(stacks);
	    removeDuplicateOrEmptyJumps(stacks);
	    util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
	    util.notEnumerableProp(error, "__stackCleaned__", true);
	};

	var captureStackTrace = (function stackDetection() {
	    var v8stackFramePattern = /^\s*at\s*/;
	    var v8stackFormatter = function(stack, error) {
	        if (typeof stack === "string") return stack;

	        if (error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };

	    if (typeof Error.stackTraceLimit === "number" &&
	        typeof Error.captureStackTrace === "function") {
	        Error.stackTraceLimit += 6;
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        var captureStackTrace = Error.captureStackTrace;

	        shouldIgnore = function(line) {
	            return bluebirdFramePattern.test(line);
	        };
	        return function(receiver, ignoreUntil) {
	            Error.stackTraceLimit += 6;
	            captureStackTrace(receiver, ignoreUntil);
	            Error.stackTraceLimit -= 6;
	        };
	    }
	    var err = new Error();

	    if (typeof err.stack === "string" &&
	        err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
	        stackFramePattern = /@/;
	        formatStack = v8stackFormatter;
	        indentStackFrames = true;
	        return function captureStackTrace(o) {
	            o.stack = new Error().stack;
	        };
	    }

	    var hasStackAfterThrow;
	    try { throw new Error(); }
	    catch(e) {
	        hasStackAfterThrow = ("stack" in e);
	    }
	    if (!("stack" in err) && hasStackAfterThrow &&
	        typeof Error.stackTraceLimit === "number") {
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        return function captureStackTrace(o) {
	            Error.stackTraceLimit += 6;
	            try { throw new Error(); }
	            catch(e) { o.stack = e.stack; }
	            Error.stackTraceLimit -= 6;
	        };
	    }

	    formatStack = function(stack, error) {
	        if (typeof stack === "string") return stack;

	        if ((typeof error === "object" ||
	            typeof error === "function") &&
	            error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };

	    return null;

	})([]);

	if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
	    printWarning = function (message) {
	        console.warn(message);
	    };
	    if (util.isNode && process.stderr.isTTY) {
	        printWarning = function(message, isSoft) {
	            var color = isSoft ? "\u001b[33m" : "\u001b[31m";
	            console.warn(color + message + "\u001b[0m\n");
	        };
	    } else if (!util.isNode && typeof (new Error().stack) === "string") {
	        printWarning = function(message, isSoft) {
	            console.warn("%c" + message,
	                        isSoft ? "color: darkorange" : "color: red");
	        };
	    }
	}

	var config = {
	    warnings: warnings,
	    longStackTraces: false,
	    cancellation: false,
	    monitoring: false
	};

	if (longStackTraces) Promise.longStackTraces();

	return {
	    longStackTraces: function() {
	        return config.longStackTraces;
	    },
	    warnings: function() {
	        return config.warnings;
	    },
	    cancellation: function() {
	        return config.cancellation;
	    },
	    monitoring: function() {
	        return config.monitoring;
	    },
	    propagateFromFunction: function() {
	        return propagateFromFunction;
	    },
	    boundValueFunction: function() {
	        return boundValueFunction;
	    },
	    checkForgottenReturns: checkForgottenReturns,
	    setBounds: setBounds,
	    warn: warn,
	    deprecated: deprecated,
	    CapturedTrace: CapturedTrace,
	    fireDomEvent: fireDomEvent,
	    fireGlobalEvent: fireGlobalEvent
	};
	};

	},{"./errors":12,"./es5":13,"./util":36}],10:[function(_dereq_,module,exports){
	module.exports = function(Promise) {
	function returner() {
	    return this.value;
	}
	function thrower() {
	    throw this.reason;
	}

	Promise.prototype["return"] =
	Promise.prototype.thenReturn = function (value) {
	    if (value instanceof Promise) value.suppressUnhandledRejections();
	    return this._then(
	        returner, undefined, undefined, {value: value}, undefined);
	};

	Promise.prototype["throw"] =
	Promise.prototype.thenThrow = function (reason) {
	    return this._then(
	        thrower, undefined, undefined, {reason: reason}, undefined);
	};

	Promise.prototype.catchThrow = function (reason) {
	    if (arguments.length <= 1) {
	        return this._then(
	            undefined, thrower, undefined, {reason: reason}, undefined);
	    } else {
	        var _reason = arguments[1];
	        var handler = function() {throw _reason;};
	        return this.caught(reason, handler);
	    }
	};

	Promise.prototype.catchReturn = function (value) {
	    if (arguments.length <= 1) {
	        if (value instanceof Promise) value.suppressUnhandledRejections();
	        return this._then(
	            undefined, returner, undefined, {value: value}, undefined);
	    } else {
	        var _value = arguments[1];
	        if (_value instanceof Promise) _value.suppressUnhandledRejections();
	        var handler = function() {return _value;};
	        return this.caught(value, handler);
	    }
	};
	};

	},{}],11:[function(_dereq_,module,exports){
	module.exports = function(Promise, INTERNAL) {
	var PromiseReduce = Promise.reduce;
	var PromiseAll = Promise.all;

	function promiseAllThis() {
	    return PromiseAll(this);
	}

	function PromiseMapSeries(promises, fn) {
	    return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
	}

	Promise.prototype.each = function (fn) {
	    return PromiseReduce(this, fn, INTERNAL, 0)
	              ._then(promiseAllThis, undefined, undefined, this, undefined);
	};

	Promise.prototype.mapSeries = function (fn) {
	    return PromiseReduce(this, fn, INTERNAL, INTERNAL);
	};

	Promise.each = function (promises, fn) {
	    return PromiseReduce(promises, fn, INTERNAL, 0)
	              ._then(promiseAllThis, undefined, undefined, promises, undefined);
	};

	Promise.mapSeries = PromiseMapSeries;
	};


	},{}],12:[function(_dereq_,module,exports){
	var es5 = _dereq_("./es5");
	var Objectfreeze = es5.freeze;
	var util = _dereq_("./util");
	var inherits = util.inherits;
	var notEnumerableProp = util.notEnumerableProp;

	function subError(nameProperty, defaultMessage) {
	    function SubError(message) {
	        if (!(this instanceof SubError)) return new SubError(message);
	        notEnumerableProp(this, "message",
	            typeof message === "string" ? message : defaultMessage);
	        notEnumerableProp(this, "name", nameProperty);
	        if (Error.captureStackTrace) {
	            Error.captureStackTrace(this, this.constructor);
	        } else {
	            Error.call(this);
	        }
	    }
	    inherits(SubError, Error);
	    return SubError;
	}

	var _TypeError, _RangeError;
	var Warning = subError("Warning", "warning");
	var CancellationError = subError("CancellationError", "cancellation error");
	var TimeoutError = subError("TimeoutError", "timeout error");
	var AggregateError = subError("AggregateError", "aggregate error");
	try {
	    _TypeError = TypeError;
	    _RangeError = RangeError;
	} catch(e) {
	    _TypeError = subError("TypeError", "type error");
	    _RangeError = subError("RangeError", "range error");
	}

	var methods = ("join pop push shift unshift slice filter forEach some " +
	    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

	for (var i = 0; i < methods.length; ++i) {
	    if (typeof Array.prototype[methods[i]] === "function") {
	        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
	    }
	}

	es5.defineProperty(AggregateError.prototype, "length", {
	    value: 0,
	    configurable: false,
	    writable: true,
	    enumerable: true
	});
	AggregateError.prototype["isOperational"] = true;
	var level = 0;
	AggregateError.prototype.toString = function() {
	    var indent = Array(level * 4 + 1).join(" ");
	    var ret = "\n" + indent + "AggregateError of:" + "\n";
	    level++;
	    indent = Array(level * 4 + 1).join(" ");
	    for (var i = 0; i < this.length; ++i) {
	        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
	        var lines = str.split("\n");
	        for (var j = 0; j < lines.length; ++j) {
	            lines[j] = indent + lines[j];
	        }
	        str = lines.join("\n");
	        ret += str + "\n";
	    }
	    level--;
	    return ret;
	};

	function OperationalError(message) {
	    if (!(this instanceof OperationalError))
	        return new OperationalError(message);
	    notEnumerableProp(this, "name", "OperationalError");
	    notEnumerableProp(this, "message", message);
	    this.cause = message;
	    this["isOperational"] = true;

	    if (message instanceof Error) {
	        notEnumerableProp(this, "message", message.message);
	        notEnumerableProp(this, "stack", message.stack);
	    } else if (Error.captureStackTrace) {
	        Error.captureStackTrace(this, this.constructor);
	    }

	}
	inherits(OperationalError, Error);

	var errorTypes = Error["__BluebirdErrorTypes__"];
	if (!errorTypes) {
	    errorTypes = Objectfreeze({
	        CancellationError: CancellationError,
	        TimeoutError: TimeoutError,
	        OperationalError: OperationalError,
	        RejectionError: OperationalError,
	        AggregateError: AggregateError
	    });
	    es5.defineProperty(Error, "__BluebirdErrorTypes__", {
	        value: errorTypes,
	        writable: false,
	        enumerable: false,
	        configurable: false
	    });
	}

	module.exports = {
	    Error: Error,
	    TypeError: _TypeError,
	    RangeError: _RangeError,
	    CancellationError: errorTypes.CancellationError,
	    OperationalError: errorTypes.OperationalError,
	    TimeoutError: errorTypes.TimeoutError,
	    AggregateError: errorTypes.AggregateError,
	    Warning: Warning
	};

	},{"./es5":13,"./util":36}],13:[function(_dereq_,module,exports){
	var isES5 = (function(){
	    return this === undefined;
	})();

	if (isES5) {
	    module.exports = {
	        freeze: Object.freeze,
	        defineProperty: Object.defineProperty,
	        getDescriptor: Object.getOwnPropertyDescriptor,
	        keys: Object.keys,
	        names: Object.getOwnPropertyNames,
	        getPrototypeOf: Object.getPrototypeOf,
	        isArray: Array.isArray,
	        isES5: isES5,
	        propertyIsWritable: function(obj, prop) {
	            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
	            return !!(!descriptor || descriptor.writable || descriptor.set);
	        }
	    };
	} else {
	    var has = {}.hasOwnProperty;
	    var str = {}.toString;
	    var proto = {}.constructor.prototype;

	    var ObjectKeys = function (o) {
	        var ret = [];
	        for (var key in o) {
	            if (has.call(o, key)) {
	                ret.push(key);
	            }
	        }
	        return ret;
	    };

	    var ObjectGetDescriptor = function(o, key) {
	        return {value: o[key]};
	    };

	    var ObjectDefineProperty = function (o, key, desc) {
	        o[key] = desc.value;
	        return o;
	    };

	    var ObjectFreeze = function (obj) {
	        return obj;
	    };

	    var ObjectGetPrototypeOf = function (obj) {
	        try {
	            return Object(obj).constructor.prototype;
	        }
	        catch (e) {
	            return proto;
	        }
	    };

	    var ArrayIsArray = function (obj) {
	        try {
	            return str.call(obj) === "[object Array]";
	        }
	        catch(e) {
	            return false;
	        }
	    };

	    module.exports = {
	        isArray: ArrayIsArray,
	        keys: ObjectKeys,
	        names: ObjectKeys,
	        defineProperty: ObjectDefineProperty,
	        getDescriptor: ObjectGetDescriptor,
	        freeze: ObjectFreeze,
	        getPrototypeOf: ObjectGetPrototypeOf,
	        isES5: isES5,
	        propertyIsWritable: function() {
	            return true;
	        }
	    };
	}

	},{}],14:[function(_dereq_,module,exports){
	module.exports = function(Promise, INTERNAL) {
	var PromiseMap = Promise.map;

	Promise.prototype.filter = function (fn, options) {
	    return PromiseMap(this, fn, options, INTERNAL);
	};

	Promise.filter = function (promises, fn, options) {
	    return PromiseMap(promises, fn, options, INTERNAL);
	};
	};

	},{}],15:[function(_dereq_,module,exports){
	module.exports = function(Promise, tryConvertToPromise, NEXT_FILTER) {
	var util = _dereq_("./util");
	var CancellationError = Promise.CancellationError;
	var errorObj = util.errorObj;
	var catchFilter = _dereq_("./catch_filter")(NEXT_FILTER);

	function PassThroughHandlerContext(promise, type, handler) {
	    this.promise = promise;
	    this.type = type;
	    this.handler = handler;
	    this.called = false;
	    this.cancelPromise = null;
	}

	PassThroughHandlerContext.prototype.isFinallyHandler = function() {
	    return this.type === 0;
	};

	function FinallyHandlerCancelReaction(finallyHandler) {
	    this.finallyHandler = finallyHandler;
	}

	FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
	    checkCancel(this.finallyHandler);
	};

	function checkCancel(ctx, reason) {
	    if (ctx.cancelPromise != null) {
	        if (arguments.length > 1) {
	            ctx.cancelPromise._reject(reason);
	        } else {
	            ctx.cancelPromise._cancel();
	        }
	        ctx.cancelPromise = null;
	        return true;
	    }
	    return false;
	}

	function succeed() {
	    return finallyHandler.call(this, this.promise._target()._settledValue());
	}
	function fail(reason) {
	    if (checkCancel(this, reason)) return;
	    errorObj.e = reason;
	    return errorObj;
	}
	function finallyHandler(reasonOrValue) {
	    var promise = this.promise;
	    var handler = this.handler;

	    if (!this.called) {
	        this.called = true;
	        var ret = this.isFinallyHandler()
	            ? handler.call(promise._boundValue())
	            : handler.call(promise._boundValue(), reasonOrValue);
	        if (ret === NEXT_FILTER) {
	            return ret;
	        } else if (ret !== undefined) {
	            promise._setReturnedNonUndefined();
	            var maybePromise = tryConvertToPromise(ret, promise);
	            if (maybePromise instanceof Promise) {
	                if (this.cancelPromise != null) {
	                    if (maybePromise._isCancelled()) {
	                        var reason =
	                            new CancellationError("late cancellation observer");
	                        promise._attachExtraTrace(reason);
	                        errorObj.e = reason;
	                        return errorObj;
	                    } else if (maybePromise.isPending()) {
	                        maybePromise._attachCancellationCallback(
	                            new FinallyHandlerCancelReaction(this));
	                    }
	                }
	                return maybePromise._then(
	                    succeed, fail, undefined, this, undefined);
	            }
	        }
	    }

	    if (promise.isRejected()) {
	        checkCancel(this);
	        errorObj.e = reasonOrValue;
	        return errorObj;
	    } else {
	        checkCancel(this);
	        return reasonOrValue;
	    }
	}

	Promise.prototype._passThrough = function(handler, type, success, fail) {
	    if (typeof handler !== "function") return this.then();
	    return this._then(success,
	                      fail,
	                      undefined,
	                      new PassThroughHandlerContext(this, type, handler),
	                      undefined);
	};

	Promise.prototype.lastly =
	Promise.prototype["finally"] = function (handler) {
	    return this._passThrough(handler,
	                             0,
	                             finallyHandler,
	                             finallyHandler);
	};


	Promise.prototype.tap = function (handler) {
	    return this._passThrough(handler, 1, finallyHandler);
	};

	Promise.prototype.tapCatch = function (handlerOrPredicate) {
	    var len = arguments.length;
	    if(len === 1) {
	        return this._passThrough(handlerOrPredicate,
	                                 1,
	                                 undefined,
	                                 finallyHandler);
	    } else {
	         var catchInstances = new Array(len - 1),
	            j = 0, i;
	        for (i = 0; i < len - 1; ++i) {
	            var item = arguments[i];
	            if (util.isObject(item)) {
	                catchInstances[j++] = item;
	            } else {
	                return Promise.reject(new TypeError(
	                    "tapCatch statement predicate: "
	                    + "expecting an object but got " + util.classString(item)
	                ));
	            }
	        }
	        catchInstances.length = j;
	        var handler = arguments[i];
	        return this._passThrough(catchFilter(catchInstances, handler, this),
	                                 1,
	                                 undefined,
	                                 finallyHandler);
	    }

	};

	return PassThroughHandlerContext;
	};

	},{"./catch_filter":7,"./util":36}],16:[function(_dereq_,module,exports){
	module.exports = function(Promise,
	                          apiRejection,
	                          INTERNAL,
	                          tryConvertToPromise,
	                          Proxyable,
	                          debug) {
	var errors = _dereq_("./errors");
	var TypeError = errors.TypeError;
	var util = _dereq_("./util");
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	var yieldHandlers = [];

	function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
	    for (var i = 0; i < yieldHandlers.length; ++i) {
	        traceParent._pushContext();
	        var result = tryCatch(yieldHandlers[i])(value);
	        traceParent._popContext();
	        if (result === errorObj) {
	            traceParent._pushContext();
	            var ret = Promise.reject(errorObj.e);
	            traceParent._popContext();
	            return ret;
	        }
	        var maybePromise = tryConvertToPromise(result, traceParent);
	        if (maybePromise instanceof Promise) return maybePromise;
	    }
	    return null;
	}

	function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
	    if (debug.cancellation()) {
	        var internal = new Promise(INTERNAL);
	        var _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
	        this._promise = internal.lastly(function() {
	            return _finallyPromise;
	        });
	        internal._captureStackTrace();
	        internal._setOnCancel(this);
	    } else {
	        var promise = this._promise = new Promise(INTERNAL);
	        promise._captureStackTrace();
	    }
	    this._stack = stack;
	    this._generatorFunction = generatorFunction;
	    this._receiver = receiver;
	    this._generator = undefined;
	    this._yieldHandlers = typeof yieldHandler === "function"
	        ? [yieldHandler].concat(yieldHandlers)
	        : yieldHandlers;
	    this._yieldedPromise = null;
	    this._cancellationPhase = false;
	}
	util.inherits(PromiseSpawn, Proxyable);

	PromiseSpawn.prototype._isResolved = function() {
	    return this._promise === null;
	};

	PromiseSpawn.prototype._cleanup = function() {
	    this._promise = this._generator = null;
	    if (debug.cancellation() && this._finallyPromise !== null) {
	        this._finallyPromise._fulfill();
	        this._finallyPromise = null;
	    }
	};

	PromiseSpawn.prototype._promiseCancelled = function() {
	    if (this._isResolved()) return;
	    var implementsReturn = typeof this._generator["return"] !== "undefined";

	    var result;
	    if (!implementsReturn) {
	        var reason = new Promise.CancellationError(
	            "generator .return() sentinel");
	        Promise.coroutine.returnSentinel = reason;
	        this._promise._attachExtraTrace(reason);
	        this._promise._pushContext();
	        result = tryCatch(this._generator["throw"]).call(this._generator,
	                                                         reason);
	        this._promise._popContext();
	    } else {
	        this._promise._pushContext();
	        result = tryCatch(this._generator["return"]).call(this._generator,
	                                                          undefined);
	        this._promise._popContext();
	    }
	    this._cancellationPhase = true;
	    this._yieldedPromise = null;
	    this._continue(result);
	};

	PromiseSpawn.prototype._promiseFulfilled = function(value) {
	    this._yieldedPromise = null;
	    this._promise._pushContext();
	    var result = tryCatch(this._generator.next).call(this._generator, value);
	    this._promise._popContext();
	    this._continue(result);
	};

	PromiseSpawn.prototype._promiseRejected = function(reason) {
	    this._yieldedPromise = null;
	    this._promise._attachExtraTrace(reason);
	    this._promise._pushContext();
	    var result = tryCatch(this._generator["throw"])
	        .call(this._generator, reason);
	    this._promise._popContext();
	    this._continue(result);
	};

	PromiseSpawn.prototype._resultCancelled = function() {
	    if (this._yieldedPromise instanceof Promise) {
	        var promise = this._yieldedPromise;
	        this._yieldedPromise = null;
	        promise.cancel();
	    }
	};

	PromiseSpawn.prototype.promise = function () {
	    return this._promise;
	};

	PromiseSpawn.prototype._run = function () {
	    this._generator = this._generatorFunction.call(this._receiver);
	    this._receiver =
	        this._generatorFunction = undefined;
	    this._promiseFulfilled(undefined);
	};

	PromiseSpawn.prototype._continue = function (result) {
	    var promise = this._promise;
	    if (result === errorObj) {
	        this._cleanup();
	        if (this._cancellationPhase) {
	            return promise.cancel();
	        } else {
	            return promise._rejectCallback(result.e, false);
	        }
	    }

	    var value = result.value;
	    if (result.done === true) {
	        this._cleanup();
	        if (this._cancellationPhase) {
	            return promise.cancel();
	        } else {
	            return promise._resolveCallback(value);
	        }
	    } else {
	        var maybePromise = tryConvertToPromise(value, this._promise);
	        if (!(maybePromise instanceof Promise)) {
	            maybePromise =
	                promiseFromYieldHandler(maybePromise,
	                                        this._yieldHandlers,
	                                        this._promise);
	            if (maybePromise === null) {
	                this._promiseRejected(
	                    new TypeError(
	                        "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a\u000a".replace("%s", String(value)) +
	                        "From coroutine:\u000a" +
	                        this._stack.split("\n").slice(1, -7).join("\n")
	                    )
	                );
	                return;
	            }
	        }
	        maybePromise = maybePromise._target();
	        var bitField = maybePromise._bitField;
	        if (((bitField & 50397184) === 0)) {
	            this._yieldedPromise = maybePromise;
	            maybePromise._proxy(this, null);
	        } else if (((bitField & 33554432) !== 0)) {
	            Promise._async.invoke(
	                this._promiseFulfilled, this, maybePromise._value()
	            );
	        } else if (((bitField & 16777216) !== 0)) {
	            Promise._async.invoke(
	                this._promiseRejected, this, maybePromise._reason()
	            );
	        } else {
	            this._promiseCancelled();
	        }
	    }
	};

	Promise.coroutine = function (generatorFunction, options) {
	    if (typeof generatorFunction !== "function") {
	        throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var yieldHandler = Object(options).yieldHandler;
	    var PromiseSpawn$ = PromiseSpawn;
	    var stack = new Error().stack;
	    return function () {
	        var generator = generatorFunction.apply(this, arguments);
	        var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
	                                      stack);
	        var ret = spawn.promise();
	        spawn._generator = generator;
	        spawn._promiseFulfilled(undefined);
	        return ret;
	    };
	};

	Promise.coroutine.addYieldHandler = function(fn) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    yieldHandlers.push(fn);
	};

	Promise.spawn = function (generatorFunction) {
	    debug.deprecated("Promise.spawn()", "Promise.coroutine()");
	    if (typeof generatorFunction !== "function") {
	        return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var spawn = new PromiseSpawn(generatorFunction, this);
	    var ret = spawn.promise();
	    spawn._run(Promise.spawn);
	    return ret;
	};
	};

	},{"./errors":12,"./util":36}],17:[function(_dereq_,module,exports){
	module.exports =
	function(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async,
	         getDomain) {
	var util = _dereq_("./util");
	var canEvaluate = util.canEvaluate;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;

	Promise.join = function () {
	    var last = arguments.length - 1;
	    var fn;
	    if (last > 0 && typeof arguments[last] === "function") {
	        fn = arguments[last];
	        if (false) {
	            {
	                var ret;
	            }
	        }
	    }
	    var args = [].slice.call(arguments);    if (fn) args.pop();
	    var ret = new PromiseArray(args).promise();
	    return fn !== undefined ? ret.spread(fn) : ret;
	};

	};

	},{"./util":36}],18:[function(_dereq_,module,exports){
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL,
	                          debug) {
	var getDomain = Promise._getDomain;
	var util = _dereq_("./util");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var async = Promise._async;

	function MappingPromiseArray(promises, fn, limit, _filter) {
	    this.constructor$(promises);
	    this._promise._captureStackTrace();
	    var domain = getDomain();
	    this._callback = domain === null ? fn : util.domainBind(domain, fn);
	    this._preservedValues = _filter === INTERNAL
	        ? new Array(this.length())
	        : null;
	    this._limit = limit;
	    this._inFlight = 0;
	    this._queue = [];
	    async.invoke(this._asyncInit, this, undefined);
	}
	util.inherits(MappingPromiseArray, PromiseArray);

	MappingPromiseArray.prototype._asyncInit = function() {
	    this._init$(undefined, -2);
	};

	MappingPromiseArray.prototype._init = function () {};

	MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var values = this._values;
	    var length = this.length();
	    var preservedValues = this._preservedValues;
	    var limit = this._limit;

	    if (index < 0) {
	        index = (index * -1) - 1;
	        values[index] = value;
	        if (limit >= 1) {
	            this._inFlight--;
	            this._drainQueue();
	            if (this._isResolved()) return true;
	        }
	    } else {
	        if (limit >= 1 && this._inFlight >= limit) {
	            values[index] = value;
	            this._queue.push(index);
	            return false;
	        }
	        if (preservedValues !== null) preservedValues[index] = value;

	        var promise = this._promise;
	        var callback = this._callback;
	        var receiver = promise._boundValue();
	        promise._pushContext();
	        var ret = tryCatch(callback).call(receiver, value, index, length);
	        var promiseCreated = promise._popContext();
	        debug.checkForgottenReturns(
	            ret,
	            promiseCreated,
	            preservedValues !== null ? "Promise.filter" : "Promise.map",
	            promise
	        );
	        if (ret === errorObj) {
	            this._reject(ret.e);
	            return true;
	        }

	        var maybePromise = tryConvertToPromise(ret, this._promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            var bitField = maybePromise._bitField;
	            if (((bitField & 50397184) === 0)) {
	                if (limit >= 1) this._inFlight++;
	                values[index] = maybePromise;
	                maybePromise._proxy(this, (index + 1) * -1);
	                return false;
	            } else if (((bitField & 33554432) !== 0)) {
	                ret = maybePromise._value();
	            } else if (((bitField & 16777216) !== 0)) {
	                this._reject(maybePromise._reason());
	                return true;
	            } else {
	                this._cancel();
	                return true;
	            }
	        }
	        values[index] = ret;
	    }
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= length) {
	        if (preservedValues !== null) {
	            this._filter(values, preservedValues);
	        } else {
	            this._resolve(values);
	        }
	        return true;
	    }
	    return false;
	};

	MappingPromiseArray.prototype._drainQueue = function () {
	    var queue = this._queue;
	    var limit = this._limit;
	    var values = this._values;
	    while (queue.length > 0 && this._inFlight < limit) {
	        if (this._isResolved()) return;
	        var index = queue.pop();
	        this._promiseFulfilled(values[index], index);
	    }
	};

	MappingPromiseArray.prototype._filter = function (booleans, values) {
	    var len = values.length;
	    var ret = new Array(len);
	    var j = 0;
	    for (var i = 0; i < len; ++i) {
	        if (booleans[i]) ret[j++] = values[i];
	    }
	    ret.length = j;
	    this._resolve(ret);
	};

	MappingPromiseArray.prototype.preservedValues = function () {
	    return this._preservedValues;
	};

	function map(promises, fn, options, _filter) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }

	    var limit = 0;
	    if (options !== undefined) {
	        if (typeof options === "object" && options !== null) {
	            if (typeof options.concurrency !== "number") {
	                return Promise.reject(
	                    new TypeError("'concurrency' must be a number but it is " +
	                                    util.classString(options.concurrency)));
	            }
	            limit = options.concurrency;
	        } else {
	            return Promise.reject(new TypeError(
	                            "options argument must be an object but it is " +
	                             util.classString(options)));
	        }
	    }
	    limit = typeof limit === "number" &&
	        isFinite(limit) && limit >= 1 ? limit : 0;
	    return new MappingPromiseArray(promises, fn, limit, _filter).promise();
	}

	Promise.prototype.map = function (fn, options) {
	    return map(this, fn, options, null);
	};

	Promise.map = function (promises, fn, options, _filter) {
	    return map(promises, fn, options, _filter);
	};


	};

	},{"./util":36}],19:[function(_dereq_,module,exports){
	module.exports =
	function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
	var util = _dereq_("./util");
	var tryCatch = util.tryCatch;

	Promise.method = function (fn) {
	    if (typeof fn !== "function") {
	        throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
	    }
	    return function () {
	        var ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._pushContext();
	        var value = tryCatch(fn).apply(this, arguments);
	        var promiseCreated = ret._popContext();
	        debug.checkForgottenReturns(
	            value, promiseCreated, "Promise.method", ret);
	        ret._resolveFromSyncValue(value);
	        return ret;
	    };
	};

	Promise.attempt = Promise["try"] = function (fn) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._pushContext();
	    var value;
	    if (arguments.length > 1) {
	        debug.deprecated("calling Promise.try with more than 1 argument");
	        var arg = arguments[1];
	        var ctx = arguments[2];
	        value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg)
	                                  : tryCatch(fn).call(ctx, arg);
	    } else {
	        value = tryCatch(fn)();
	    }
	    var promiseCreated = ret._popContext();
	    debug.checkForgottenReturns(
	        value, promiseCreated, "Promise.try", ret);
	    ret._resolveFromSyncValue(value);
	    return ret;
	};

	Promise.prototype._resolveFromSyncValue = function (value) {
	    if (value === util.errorObj) {
	        this._rejectCallback(value.e, false);
	    } else {
	        this._resolveCallback(value, true);
	    }
	};
	};

	},{"./util":36}],20:[function(_dereq_,module,exports){
	var util = _dereq_("./util");
	var maybeWrapAsError = util.maybeWrapAsError;
	var errors = _dereq_("./errors");
	var OperationalError = errors.OperationalError;
	var es5 = _dereq_("./es5");

	function isUntypedError(obj) {
	    return obj instanceof Error &&
	        es5.getPrototypeOf(obj) === Error.prototype;
	}

	var rErrorKey = /^(?:name|message|stack|cause)$/;
	function wrapAsOperationalError(obj) {
	    var ret;
	    if (isUntypedError(obj)) {
	        ret = new OperationalError(obj);
	        ret.name = obj.name;
	        ret.message = obj.message;
	        ret.stack = obj.stack;
	        var keys = es5.keys(obj);
	        for (var i = 0; i < keys.length; ++i) {
	            var key = keys[i];
	            if (!rErrorKey.test(key)) {
	                ret[key] = obj[key];
	            }
	        }
	        return ret;
	    }
	    util.markAsOriginatingFromRejection(obj);
	    return obj;
	}

	function nodebackForPromise(promise, multiArgs) {
	    return function(err, value) {
	        if (promise === null) return;
	        if (err) {
	            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
	            promise._attachExtraTrace(wrapped);
	            promise._reject(wrapped);
	        } else if (!multiArgs) {
	            promise._fulfill(value);
	        } else {
	            var args = [].slice.call(arguments, 1);            promise._fulfill(args);
	        }
	        promise = null;
	    };
	}

	module.exports = nodebackForPromise;

	},{"./errors":12,"./es5":13,"./util":36}],21:[function(_dereq_,module,exports){
	module.exports = function(Promise) {
	var util = _dereq_("./util");
	var async = Promise._async;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;

	function spreadAdapter(val, nodeback) {
	    var promise = this;
	    if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
	    var ret =
	        tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}

	function successAdapter(val, nodeback) {
	    var promise = this;
	    var receiver = promise._boundValue();
	    var ret = val === undefined
	        ? tryCatch(nodeback).call(receiver, null)
	        : tryCatch(nodeback).call(receiver, null, val);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}
	function errorAdapter(reason, nodeback) {
	    var promise = this;
	    if (!reason) {
	        var newReason = new Error(reason + "");
	        newReason.cause = reason;
	        reason = newReason;
	    }
	    var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}

	Promise.prototype.asCallback = Promise.prototype.nodeify = function (nodeback,
	                                                                     options) {
	    if (typeof nodeback == "function") {
	        var adapter = successAdapter;
	        if (options !== undefined && Object(options).spread) {
	            adapter = spreadAdapter;
	        }
	        this._then(
	            adapter,
	            errorAdapter,
	            undefined,
	            this,
	            nodeback
	        );
	    }
	    return this;
	};
	};

	},{"./util":36}],22:[function(_dereq_,module,exports){
	module.exports = function() {
	var makeSelfResolutionError = function () {
	    return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	};
	var reflectHandler = function() {
	    return new Promise.PromiseInspection(this._target());
	};
	var apiRejection = function(msg) {
	    return Promise.reject(new TypeError(msg));
	};
	function Proxyable() {}
	var UNDEFINED_BINDING = {};
	var util = _dereq_("./util");

	var getDomain;
	if (util.isNode) {
	    getDomain = function() {
	        var ret = process.domain;
	        if (ret === undefined) ret = null;
	        return ret;
	    };
	} else {
	    getDomain = function() {
	        return null;
	    };
	}
	util.notEnumerableProp(Promise, "_getDomain", getDomain);

	var es5 = _dereq_("./es5");
	var Async = _dereq_("./async");
	var async = new Async();
	es5.defineProperty(Promise, "_async", {value: async});
	var errors = _dereq_("./errors");
	var TypeError = Promise.TypeError = errors.TypeError;
	Promise.RangeError = errors.RangeError;
	var CancellationError = Promise.CancellationError = errors.CancellationError;
	Promise.TimeoutError = errors.TimeoutError;
	Promise.OperationalError = errors.OperationalError;
	Promise.RejectionError = errors.OperationalError;
	Promise.AggregateError = errors.AggregateError;
	var INTERNAL = function(){};
	var APPLY = {};
	var NEXT_FILTER = {};
	var tryConvertToPromise = _dereq_("./thenables")(Promise, INTERNAL);
	var PromiseArray =
	    _dereq_("./promise_array")(Promise, INTERNAL,
	                               tryConvertToPromise, apiRejection, Proxyable);
	var Context = _dereq_("./context")(Promise);
	 /*jshint unused:false*/
	var createContext = Context.create;
	var debug = _dereq_("./debuggability")(Promise, Context);
	var CapturedTrace = debug.CapturedTrace;
	var PassThroughHandlerContext =
	    _dereq_("./finally")(Promise, tryConvertToPromise, NEXT_FILTER);
	var catchFilter = _dereq_("./catch_filter")(NEXT_FILTER);
	var nodebackForPromise = _dereq_("./nodeback");
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	function check(self, executor) {
	    if (self == null || self.constructor !== Promise) {
	        throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    if (typeof executor !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(executor));
	    }

	}

	function Promise(executor) {
	    if (executor !== INTERNAL) {
	        check(this, executor);
	    }
	    this._bitField = 0;
	    this._fulfillmentHandler0 = undefined;
	    this._rejectionHandler0 = undefined;
	    this._promise0 = undefined;
	    this._receiver0 = undefined;
	    this._resolveFromExecutor(executor);
	    this._promiseCreated();
	    this._fireEvent("promiseCreated", this);
	}

	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};

	Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
	    var len = arguments.length;
	    if (len > 1) {
	        var catchInstances = new Array(len - 1),
	            j = 0, i;
	        for (i = 0; i < len - 1; ++i) {
	            var item = arguments[i];
	            if (util.isObject(item)) {
	                catchInstances[j++] = item;
	            } else {
	                return apiRejection("Catch statement predicate: " +
	                    "expecting an object but got " + util.classString(item));
	            }
	        }
	        catchInstances.length = j;
	        fn = arguments[i];
	        return this.then(undefined, catchFilter(catchInstances, fn, this));
	    }
	    return this.then(undefined, fn);
	};

	Promise.prototype.reflect = function () {
	    return this._then(reflectHandler,
	        reflectHandler, undefined, this, undefined);
	};

	Promise.prototype.then = function (didFulfill, didReject) {
	    if (debug.warnings() && arguments.length > 0 &&
	        typeof didFulfill !== "function" &&
	        typeof didReject !== "function") {
	        var msg = ".then() only accepts functions but was passed: " +
	                util.classString(didFulfill);
	        if (arguments.length > 1) {
	            msg += ", " + util.classString(didReject);
	        }
	        this._warn(msg);
	    }
	    return this._then(didFulfill, didReject, undefined, undefined, undefined);
	};

	Promise.prototype.done = function (didFulfill, didReject) {
	    var promise =
	        this._then(didFulfill, didReject, undefined, undefined, undefined);
	    promise._setIsFinal();
	};

	Promise.prototype.spread = function (fn) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    return this.all()._then(fn, undefined, undefined, APPLY, undefined);
	};

	Promise.prototype.toJSON = function () {
	    var ret = {
	        isFulfilled: false,
	        isRejected: false,
	        fulfillmentValue: undefined,
	        rejectionReason: undefined
	    };
	    if (this.isFulfilled()) {
	        ret.fulfillmentValue = this.value();
	        ret.isFulfilled = true;
	    } else if (this.isRejected()) {
	        ret.rejectionReason = this.reason();
	        ret.isRejected = true;
	    }
	    return ret;
	};

	Promise.prototype.all = function () {
	    if (arguments.length > 0) {
	        this._warn(".all() was passed arguments but it does not take any");
	    }
	    return new PromiseArray(this).promise();
	};

	Promise.prototype.error = function (fn) {
	    return this.caught(util.originatesFromRejection, fn);
	};

	Promise.getNewLibraryCopy = module.exports;

	Promise.is = function (val) {
	    return val instanceof Promise;
	};

	Promise.fromNode = Promise.fromCallback = function(fn) {
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs
	                                         : false;
	    var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
	    if (result === errorObj) {
	        ret._rejectCallback(result.e, true);
	    }
	    if (!ret._isFateSealed()) ret._setAsyncGuaranteed();
	    return ret;
	};

	Promise.all = function (promises) {
	    return new PromiseArray(promises).promise();
	};

	Promise.cast = function (obj) {
	    var ret = tryConvertToPromise(obj);
	    if (!(ret instanceof Promise)) {
	        ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._setFulfilled();
	        ret._rejectionHandler0 = obj;
	    }
	    return ret;
	};

	Promise.resolve = Promise.fulfilled = Promise.cast;

	Promise.reject = Promise.rejected = function (reason) {
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._rejectCallback(reason, true);
	    return ret;
	};

	Promise.setScheduler = function(fn) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    return async.setScheduler(fn);
	};

	Promise.prototype._then = function (
	    didFulfill,
	    didReject,
	    _,    receiver,
	    internalData
	) {
	    var haveInternalData = internalData !== undefined;
	    var promise = haveInternalData ? internalData : new Promise(INTERNAL);
	    var target = this._target();
	    var bitField = target._bitField;

	    if (!haveInternalData) {
	        promise._propagateFrom(this, 3);
	        promise._captureStackTrace();
	        if (receiver === undefined &&
	            ((this._bitField & 2097152) !== 0)) {
	            if (!((bitField & 50397184) === 0)) {
	                receiver = this._boundValue();
	            } else {
	                receiver = target === this ? undefined : this._boundTo;
	            }
	        }
	        this._fireEvent("promiseChained", this, promise);
	    }

	    var domain = getDomain();
	    if (!((bitField & 50397184) === 0)) {
	        var handler, value, settler = target._settlePromiseCtx;
	        if (((bitField & 33554432) !== 0)) {
	            value = target._rejectionHandler0;
	            handler = didFulfill;
	        } else if (((bitField & 16777216) !== 0)) {
	            value = target._fulfillmentHandler0;
	            handler = didReject;
	            target._unsetRejectionIsUnhandled();
	        } else {
	            settler = target._settlePromiseLateCancellationObserver;
	            value = new CancellationError("late cancellation observer");
	            target._attachExtraTrace(value);
	            handler = didReject;
	        }

	        async.invoke(settler, target, {
	            handler: domain === null ? handler
	                : (typeof handler === "function" &&
	                    util.domainBind(domain, handler)),
	            promise: promise,
	            receiver: receiver,
	            value: value
	        });
	    } else {
	        target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
	    }

	    return promise;
	};

	Promise.prototype._length = function () {
	    return this._bitField & 65535;
	};

	Promise.prototype._isFateSealed = function () {
	    return (this._bitField & 117506048) !== 0;
	};

	Promise.prototype._isFollowing = function () {
	    return (this._bitField & 67108864) === 67108864;
	};

	Promise.prototype._setLength = function (len) {
	    this._bitField = (this._bitField & -65536) |
	        (len & 65535);
	};

	Promise.prototype._setFulfilled = function () {
	    this._bitField = this._bitField | 33554432;
	    this._fireEvent("promiseFulfilled", this);
	};

	Promise.prototype._setRejected = function () {
	    this._bitField = this._bitField | 16777216;
	    this._fireEvent("promiseRejected", this);
	};

	Promise.prototype._setFollowing = function () {
	    this._bitField = this._bitField | 67108864;
	    this._fireEvent("promiseResolved", this);
	};

	Promise.prototype._setIsFinal = function () {
	    this._bitField = this._bitField | 4194304;
	};

	Promise.prototype._isFinal = function () {
	    return (this._bitField & 4194304) > 0;
	};

	Promise.prototype._unsetCancelled = function() {
	    this._bitField = this._bitField & (~65536);
	};

	Promise.prototype._setCancelled = function() {
	    this._bitField = this._bitField | 65536;
	    this._fireEvent("promiseCancelled", this);
	};

	Promise.prototype._setWillBeCancelled = function() {
	    this._bitField = this._bitField | 8388608;
	};

	Promise.prototype._setAsyncGuaranteed = function() {
	    if (async.hasCustomScheduler()) return;
	    this._bitField = this._bitField | 134217728;
	};

	Promise.prototype._receiverAt = function (index) {
	    var ret = index === 0 ? this._receiver0 : this[
	            index * 4 - 4 + 3];
	    if (ret === UNDEFINED_BINDING) {
	        return undefined;
	    } else if (ret === undefined && this._isBound()) {
	        return this._boundValue();
	    }
	    return ret;
	};

	Promise.prototype._promiseAt = function (index) {
	    return this[
	            index * 4 - 4 + 2];
	};

	Promise.prototype._fulfillmentHandlerAt = function (index) {
	    return this[
	            index * 4 - 4 + 0];
	};

	Promise.prototype._rejectionHandlerAt = function (index) {
	    return this[
	            index * 4 - 4 + 1];
	};

	Promise.prototype._boundValue = function() {};

	Promise.prototype._migrateCallback0 = function (follower) {
	    var bitField = follower._bitField;
	    var fulfill = follower._fulfillmentHandler0;
	    var reject = follower._rejectionHandler0;
	    var promise = follower._promise0;
	    var receiver = follower._receiverAt(0);
	    if (receiver === undefined) receiver = UNDEFINED_BINDING;
	    this._addCallbacks(fulfill, reject, promise, receiver, null);
	};

	Promise.prototype._migrateCallbackAt = function (follower, index) {
	    var fulfill = follower._fulfillmentHandlerAt(index);
	    var reject = follower._rejectionHandlerAt(index);
	    var promise = follower._promiseAt(index);
	    var receiver = follower._receiverAt(index);
	    if (receiver === undefined) receiver = UNDEFINED_BINDING;
	    this._addCallbacks(fulfill, reject, promise, receiver, null);
	};

	Promise.prototype._addCallbacks = function (
	    fulfill,
	    reject,
	    promise,
	    receiver,
	    domain
	) {
	    var index = this._length();

	    if (index >= 65535 - 4) {
	        index = 0;
	        this._setLength(0);
	    }

	    if (index === 0) {
	        this._promise0 = promise;
	        this._receiver0 = receiver;
	        if (typeof fulfill === "function") {
	            this._fulfillmentHandler0 =
	                domain === null ? fulfill : util.domainBind(domain, fulfill);
	        }
	        if (typeof reject === "function") {
	            this._rejectionHandler0 =
	                domain === null ? reject : util.domainBind(domain, reject);
	        }
	    } else {
	        var base = index * 4 - 4;
	        this[base + 2] = promise;
	        this[base + 3] = receiver;
	        if (typeof fulfill === "function") {
	            this[base + 0] =
	                domain === null ? fulfill : util.domainBind(domain, fulfill);
	        }
	        if (typeof reject === "function") {
	            this[base + 1] =
	                domain === null ? reject : util.domainBind(domain, reject);
	        }
	    }
	    this._setLength(index + 1);
	    return index;
	};

	Promise.prototype._proxy = function (proxyable, arg) {
	    this._addCallbacks(undefined, undefined, arg, proxyable, null);
	};

	Promise.prototype._resolveCallback = function(value, shouldBind) {
	    if (((this._bitField & 117506048) !== 0)) return;
	    if (value === this)
	        return this._rejectCallback(makeSelfResolutionError(), false);
	    var maybePromise = tryConvertToPromise(value, this);
	    if (!(maybePromise instanceof Promise)) return this._fulfill(value);

	    if (shouldBind) this._propagateFrom(maybePromise, 2);

	    var promise = maybePromise._target();

	    if (promise === this) {
	        this._reject(makeSelfResolutionError());
	        return;
	    }

	    var bitField = promise._bitField;
	    if (((bitField & 50397184) === 0)) {
	        var len = this._length();
	        if (len > 0) promise._migrateCallback0(this);
	        for (var i = 1; i < len; ++i) {
	            promise._migrateCallbackAt(this, i);
	        }
	        this._setFollowing();
	        this._setLength(0);
	        this._setFollowee(promise);
	    } else if (((bitField & 33554432) !== 0)) {
	        this._fulfill(promise._value());
	    } else if (((bitField & 16777216) !== 0)) {
	        this._reject(promise._reason());
	    } else {
	        var reason = new CancellationError("late cancellation observer");
	        promise._attachExtraTrace(reason);
	        this._reject(reason);
	    }
	};

	Promise.prototype._rejectCallback =
	function(reason, synchronous, ignoreNonErrorWarnings) {
	    var trace = util.ensureErrorObject(reason);
	    var hasStack = trace === reason;
	    if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
	        var message = "a promise was rejected with a non-error: " +
	            util.classString(reason);
	        this._warn(message, true);
	    }
	    this._attachExtraTrace(trace, synchronous ? hasStack : false);
	    this._reject(reason);
	};

	Promise.prototype._resolveFromExecutor = function (executor) {
	    if (executor === INTERNAL) return;
	    var promise = this;
	    this._captureStackTrace();
	    this._pushContext();
	    var synchronous = true;
	    var r = this._execute(executor, function(value) {
	        promise._resolveCallback(value);
	    }, function (reason) {
	        promise._rejectCallback(reason, synchronous);
	    });
	    synchronous = false;
	    this._popContext();

	    if (r !== undefined) {
	        promise._rejectCallback(r, true);
	    }
	};

	Promise.prototype._settlePromiseFromHandler = function (
	    handler, receiver, value, promise
	) {
	    var bitField = promise._bitField;
	    if (((bitField & 65536) !== 0)) return;
	    promise._pushContext();
	    var x;
	    if (receiver === APPLY) {
	        if (!value || typeof value.length !== "number") {
	            x = errorObj;
	            x.e = new TypeError("cannot .spread() a non-array: " +
	                                    util.classString(value));
	        } else {
	            x = tryCatch(handler).apply(this._boundValue(), value);
	        }
	    } else {
	        x = tryCatch(handler).call(receiver, value);
	    }
	    var promiseCreated = promise._popContext();
	    bitField = promise._bitField;
	    if (((bitField & 65536) !== 0)) return;

	    if (x === NEXT_FILTER) {
	        promise._reject(value);
	    } else if (x === errorObj) {
	        promise._rejectCallback(x.e, false);
	    } else {
	        debug.checkForgottenReturns(x, promiseCreated, "",  promise, this);
	        promise._resolveCallback(x);
	    }
	};

	Promise.prototype._target = function() {
	    var ret = this;
	    while (ret._isFollowing()) ret = ret._followee();
	    return ret;
	};

	Promise.prototype._followee = function() {
	    return this._rejectionHandler0;
	};

	Promise.prototype._setFollowee = function(promise) {
	    this._rejectionHandler0 = promise;
	};

	Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
	    var isPromise = promise instanceof Promise;
	    var bitField = this._bitField;
	    var asyncGuaranteed = ((bitField & 134217728) !== 0);
	    if (((bitField & 65536) !== 0)) {
	        if (isPromise) promise._invokeInternalOnCancel();

	        if (receiver instanceof PassThroughHandlerContext &&
	            receiver.isFinallyHandler()) {
	            receiver.cancelPromise = promise;
	            if (tryCatch(handler).call(receiver, value) === errorObj) {
	                promise._reject(errorObj.e);
	            }
	        } else if (handler === reflectHandler) {
	            promise._fulfill(reflectHandler.call(receiver));
	        } else if (receiver instanceof Proxyable) {
	            receiver._promiseCancelled(promise);
	        } else if (isPromise || promise instanceof PromiseArray) {
	            promise._cancel();
	        } else {
	            receiver.cancel();
	        }
	    } else if (typeof handler === "function") {
	        if (!isPromise) {
	            handler.call(receiver, value, promise);
	        } else {
	            if (asyncGuaranteed) promise._setAsyncGuaranteed();
	            this._settlePromiseFromHandler(handler, receiver, value, promise);
	        }
	    } else if (receiver instanceof Proxyable) {
	        if (!receiver._isResolved()) {
	            if (((bitField & 33554432) !== 0)) {
	                receiver._promiseFulfilled(value, promise);
	            } else {
	                receiver._promiseRejected(value, promise);
	            }
	        }
	    } else if (isPromise) {
	        if (asyncGuaranteed) promise._setAsyncGuaranteed();
	        if (((bitField & 33554432) !== 0)) {
	            promise._fulfill(value);
	        } else {
	            promise._reject(value);
	        }
	    }
	};

	Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
	    var handler = ctx.handler;
	    var promise = ctx.promise;
	    var receiver = ctx.receiver;
	    var value = ctx.value;
	    if (typeof handler === "function") {
	        if (!(promise instanceof Promise)) {
	            handler.call(receiver, value, promise);
	        } else {
	            this._settlePromiseFromHandler(handler, receiver, value, promise);
	        }
	    } else if (promise instanceof Promise) {
	        promise._reject(value);
	    }
	};

	Promise.prototype._settlePromiseCtx = function(ctx) {
	    this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
	};

	Promise.prototype._settlePromise0 = function(handler, value, bitField) {
	    var promise = this._promise0;
	    var receiver = this._receiverAt(0);
	    this._promise0 = undefined;
	    this._receiver0 = undefined;
	    this._settlePromise(promise, handler, receiver, value);
	};

	Promise.prototype._clearCallbackDataAtIndex = function(index) {
	    var base = index * 4 - 4;
	    this[base + 2] =
	    this[base + 3] =
	    this[base + 0] =
	    this[base + 1] = undefined;
	};

	Promise.prototype._fulfill = function (value) {
	    var bitField = this._bitField;
	    if (((bitField & 117506048) >>> 16)) return;
	    if (value === this) {
	        var err = makeSelfResolutionError();
	        this._attachExtraTrace(err);
	        return this._reject(err);
	    }
	    this._setFulfilled();
	    this._rejectionHandler0 = value;

	    if ((bitField & 65535) > 0) {
	        if (((bitField & 134217728) !== 0)) {
	            this._settlePromises();
	        } else {
	            async.settlePromises(this);
	        }
	        this._dereferenceTrace();
	    }
	};

	Promise.prototype._reject = function (reason) {
	    var bitField = this._bitField;
	    if (((bitField & 117506048) >>> 16)) return;
	    this._setRejected();
	    this._fulfillmentHandler0 = reason;

	    if (this._isFinal()) {
	        return async.fatalError(reason, util.isNode);
	    }

	    if ((bitField & 65535) > 0) {
	        async.settlePromises(this);
	    } else {
	        this._ensurePossibleRejectionHandled();
	    }
	};

	Promise.prototype._fulfillPromises = function (len, value) {
	    for (var i = 1; i < len; i++) {
	        var handler = this._fulfillmentHandlerAt(i);
	        var promise = this._promiseAt(i);
	        var receiver = this._receiverAt(i);
	        this._clearCallbackDataAtIndex(i);
	        this._settlePromise(promise, handler, receiver, value);
	    }
	};

	Promise.prototype._rejectPromises = function (len, reason) {
	    for (var i = 1; i < len; i++) {
	        var handler = this._rejectionHandlerAt(i);
	        var promise = this._promiseAt(i);
	        var receiver = this._receiverAt(i);
	        this._clearCallbackDataAtIndex(i);
	        this._settlePromise(promise, handler, receiver, reason);
	    }
	};

	Promise.prototype._settlePromises = function () {
	    var bitField = this._bitField;
	    var len = (bitField & 65535);

	    if (len > 0) {
	        if (((bitField & 16842752) !== 0)) {
	            var reason = this._fulfillmentHandler0;
	            this._settlePromise0(this._rejectionHandler0, reason, bitField);
	            this._rejectPromises(len, reason);
	        } else {
	            var value = this._rejectionHandler0;
	            this._settlePromise0(this._fulfillmentHandler0, value, bitField);
	            this._fulfillPromises(len, value);
	        }
	        this._setLength(0);
	    }
	    this._clearCancellationData();
	};

	Promise.prototype._settledValue = function() {
	    var bitField = this._bitField;
	    if (((bitField & 33554432) !== 0)) {
	        return this._rejectionHandler0;
	    } else if (((bitField & 16777216) !== 0)) {
	        return this._fulfillmentHandler0;
	    }
	};

	function deferResolve(v) {this.promise._resolveCallback(v);}
	function deferReject(v) {this.promise._rejectCallback(v, false);}

	Promise.defer = Promise.pending = function() {
	    debug.deprecated("Promise.defer", "new Promise");
	    var promise = new Promise(INTERNAL);
	    return {
	        promise: promise,
	        resolve: deferResolve,
	        reject: deferReject
	    };
	};

	util.notEnumerableProp(Promise,
	                       "_makeSelfResolutionError",
	                       makeSelfResolutionError);

	_dereq_("./method")(Promise, INTERNAL, tryConvertToPromise, apiRejection,
	    debug);
	_dereq_("./bind")(Promise, INTERNAL, tryConvertToPromise, debug);
	_dereq_("./cancel")(Promise, PromiseArray, apiRejection, debug);
	_dereq_("./direct_resolve")(Promise);
	_dereq_("./synchronous_inspection")(Promise);
	_dereq_("./join")(
	    Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain);
	Promise.Promise = Promise;
	Promise.version = "3.5.4";
	_dereq_('./map.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
	_dereq_('./call_get.js')(Promise);
	_dereq_('./using.js')(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
	_dereq_('./timers.js')(Promise, INTERNAL, debug);
	_dereq_('./generators.js')(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
	_dereq_('./nodeify.js')(Promise);
	_dereq_('./promisify.js')(Promise, INTERNAL);
	_dereq_('./props.js')(Promise, PromiseArray, tryConvertToPromise, apiRejection);
	_dereq_('./race.js')(Promise, INTERNAL, tryConvertToPromise, apiRejection);
	_dereq_('./reduce.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
	_dereq_('./settle.js')(Promise, PromiseArray, debug);
	_dereq_('./some.js')(Promise, PromiseArray, apiRejection);
	_dereq_('./filter.js')(Promise, INTERNAL);
	_dereq_('./each.js')(Promise, INTERNAL);
	_dereq_('./any.js')(Promise);
	                                                         
	    util.toFastProperties(Promise);                                          
	    util.toFastProperties(Promise.prototype);                                
	    function fillTypes(value) {                                              
	        var p = new Promise(INTERNAL);                                       
	        p._fulfillmentHandler0 = value;                                      
	        p._rejectionHandler0 = value;                                        
	        p._promise0 = value;                                                 
	        p._receiver0 = value;                                                
	    }                                                                        
	    // Complete slack tracking, opt out of field-type tracking and           
	    // stabilize map                                                         
	    fillTypes({a: 1});                                                       
	    fillTypes({b: 2});                                                       
	    fillTypes({c: 3});                                                       
	    fillTypes(1);                                                            
	    fillTypes(function(){});                                                 
	    fillTypes(undefined);                                                    
	    fillTypes(false);                                                        
	    fillTypes(new Promise(INTERNAL));                                        
	    debug.setBounds(Async.firstLineError, util.lastLineError);               
	    return Promise;                                                          

	};

	},{"./any.js":1,"./async":2,"./bind":3,"./call_get.js":5,"./cancel":6,"./catch_filter":7,"./context":8,"./debuggability":9,"./direct_resolve":10,"./each.js":11,"./errors":12,"./es5":13,"./filter.js":14,"./finally":15,"./generators.js":16,"./join":17,"./map.js":18,"./method":19,"./nodeback":20,"./nodeify.js":21,"./promise_array":23,"./promisify.js":24,"./props.js":25,"./race.js":27,"./reduce.js":28,"./settle.js":30,"./some.js":31,"./synchronous_inspection":32,"./thenables":33,"./timers.js":34,"./using.js":35,"./util":36}],23:[function(_dereq_,module,exports){
	module.exports = function(Promise, INTERNAL, tryConvertToPromise,
	    apiRejection, Proxyable) {
	var util = _dereq_("./util");
	var isArray = util.isArray;

	function toResolutionValue(val) {
	    switch(val) {
	    case -2: return [];
	    case -3: return {};
	    case -6: return new Map();
	    }
	}

	function PromiseArray(values) {
	    var promise = this._promise = new Promise(INTERNAL);
	    if (values instanceof Promise) {
	        promise._propagateFrom(values, 3);
	    }
	    promise._setOnCancel(this);
	    this._values = values;
	    this._length = 0;
	    this._totalResolved = 0;
	    this._init(undefined, -2);
	}
	util.inherits(PromiseArray, Proxyable);

	PromiseArray.prototype.length = function () {
	    return this._length;
	};

	PromiseArray.prototype.promise = function () {
	    return this._promise;
	};

	PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
	    var values = tryConvertToPromise(this._values, this._promise);
	    if (values instanceof Promise) {
	        values = values._target();
	        var bitField = values._bitField;
	        this._values = values;

	        if (((bitField & 50397184) === 0)) {
	            this._promise._setAsyncGuaranteed();
	            return values._then(
	                init,
	                this._reject,
	                undefined,
	                this,
	                resolveValueIfEmpty
	           );
	        } else if (((bitField & 33554432) !== 0)) {
	            values = values._value();
	        } else if (((bitField & 16777216) !== 0)) {
	            return this._reject(values._reason());
	        } else {
	            return this._cancel();
	        }
	    }
	    values = util.asArray(values);
	    if (values === null) {
	        var err = apiRejection(
	            "expecting an array or an iterable object but got " + util.classString(values)).reason();
	        this._promise._rejectCallback(err, false);
	        return;
	    }

	    if (values.length === 0) {
	        if (resolveValueIfEmpty === -5) {
	            this._resolveEmptyArray();
	        }
	        else {
	            this._resolve(toResolutionValue(resolveValueIfEmpty));
	        }
	        return;
	    }
	    this._iterate(values);
	};

	PromiseArray.prototype._iterate = function(values) {
	    var len = this.getActualLength(values.length);
	    this._length = len;
	    this._values = this.shouldCopyValues() ? new Array(len) : this._values;
	    var result = this._promise;
	    var isResolved = false;
	    var bitField = null;
	    for (var i = 0; i < len; ++i) {
	        var maybePromise = tryConvertToPromise(values[i], result);

	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            bitField = maybePromise._bitField;
	        } else {
	            bitField = null;
	        }

	        if (isResolved) {
	            if (bitField !== null) {
	                maybePromise.suppressUnhandledRejections();
	            }
	        } else if (bitField !== null) {
	            if (((bitField & 50397184) === 0)) {
	                maybePromise._proxy(this, i);
	                this._values[i] = maybePromise;
	            } else if (((bitField & 33554432) !== 0)) {
	                isResolved = this._promiseFulfilled(maybePromise._value(), i);
	            } else if (((bitField & 16777216) !== 0)) {
	                isResolved = this._promiseRejected(maybePromise._reason(), i);
	            } else {
	                isResolved = this._promiseCancelled(i);
	            }
	        } else {
	            isResolved = this._promiseFulfilled(maybePromise, i);
	        }
	    }
	    if (!isResolved) result._setAsyncGuaranteed();
	};

	PromiseArray.prototype._isResolved = function () {
	    return this._values === null;
	};

	PromiseArray.prototype._resolve = function (value) {
	    this._values = null;
	    this._promise._fulfill(value);
	};

	PromiseArray.prototype._cancel = function() {
	    if (this._isResolved() || !this._promise._isCancellable()) return;
	    this._values = null;
	    this._promise._cancel();
	};

	PromiseArray.prototype._reject = function (reason) {
	    this._values = null;
	    this._promise._rejectCallback(reason, false);
	};

	PromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	        return true;
	    }
	    return false;
	};

	PromiseArray.prototype._promiseCancelled = function() {
	    this._cancel();
	    return true;
	};

	PromiseArray.prototype._promiseRejected = function (reason) {
	    this._totalResolved++;
	    this._reject(reason);
	    return true;
	};

	PromiseArray.prototype._resultCancelled = function() {
	    if (this._isResolved()) return;
	    var values = this._values;
	    this._cancel();
	    if (values instanceof Promise) {
	        values.cancel();
	    } else {
	        for (var i = 0; i < values.length; ++i) {
	            if (values[i] instanceof Promise) {
	                values[i].cancel();
	            }
	        }
	    }
	};

	PromiseArray.prototype.shouldCopyValues = function () {
	    return true;
	};

	PromiseArray.prototype.getActualLength = function (len) {
	    return len;
	};

	return PromiseArray;
	};

	},{"./util":36}],24:[function(_dereq_,module,exports){
	module.exports = function(Promise, INTERNAL) {
	var THIS = {};
	var util = _dereq_("./util");
	var nodebackForPromise = _dereq_("./nodeback");
	var withAppended = util.withAppended;
	var maybeWrapAsError = util.maybeWrapAsError;
	var canEvaluate = util.canEvaluate;
	var TypeError = _dereq_("./errors").TypeError;
	var defaultSuffix = "Async";
	var defaultPromisified = {__isPromisified__: true};
	var noCopyProps = [
	    "arity",    "length",
	    "name",
	    "arguments",
	    "caller",
	    "callee",
	    "prototype",
	    "__isPromisified__"
	];
	var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");

	var defaultFilter = function(name) {
	    return util.isIdentifier(name) &&
	        name.charAt(0) !== "_" &&
	        name !== "constructor";
	};

	function propsFilter(key) {
	    return !noCopyPropsPattern.test(key);
	}

	function isPromisified(fn) {
	    try {
	        return fn.__isPromisified__ === true;
	    }
	    catch (e) {
	        return false;
	    }
	}

	function hasPromisified(obj, key, suffix) {
	    var val = util.getDataPropertyOrDefault(obj, key + suffix,
	                                            defaultPromisified);
	    return val ? isPromisified(val) : false;
	}
	function checkValid(ret, suffix, suffixRegexp) {
	    for (var i = 0; i < ret.length; i += 2) {
	        var key = ret[i];
	        if (suffixRegexp.test(key)) {
	            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
	            for (var j = 0; j < ret.length; j += 2) {
	                if (ret[j] === keyWithoutAsyncSuffix) {
	                    throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/MqrFmX\u000a"
	                        .replace("%s", suffix));
	                }
	            }
	        }
	    }
	}

	function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
	    var keys = util.inheritedDataKeys(obj);
	    var ret = [];
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        var value = obj[key];
	        var passesDefaultFilter = filter === defaultFilter
	            ? true : defaultFilter(key, value, obj);
	        if (typeof value === "function" &&
	            !isPromisified(value) &&
	            !hasPromisified(obj, key, suffix) &&
	            filter(key, value, obj, passesDefaultFilter)) {
	            ret.push(key, value);
	        }
	    }
	    checkValid(ret, suffix, suffixRegexp);
	    return ret;
	}

	var escapeIdentRegex = function(str) {
	    return str.replace(/([$])/, "\\$");
	};

	var makeNodePromisifiedEval;

	function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
	    var defaultThis = (function() {return this;})();
	    var method = callback;
	    if (typeof method === "string") {
	        callback = fn;
	    }
	    function promisified() {
	        var _receiver = receiver;
	        if (receiver === THIS) _receiver = this;
	        var promise = new Promise(INTERNAL);
	        promise._captureStackTrace();
	        var cb = typeof method === "string" && this !== defaultThis
	            ? this[method] : callback;
	        var fn = nodebackForPromise(promise, multiArgs);
	        try {
	            cb.apply(_receiver, withAppended(arguments, fn));
	        } catch(e) {
	            promise._rejectCallback(maybeWrapAsError(e), true, true);
	        }
	        if (!promise._isFateSealed()) promise._setAsyncGuaranteed();
	        return promise;
	    }
	    util.notEnumerableProp(promisified, "__isPromisified__", true);
	    return promisified;
	}

	var makeNodePromisified = canEvaluate
	    ? makeNodePromisifiedEval
	    : makeNodePromisifiedClosure;

	function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
	    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
	    var methods =
	        promisifiableMethods(obj, suffix, suffixRegexp, filter);

	    for (var i = 0, len = methods.length; i < len; i+= 2) {
	        var key = methods[i];
	        var fn = methods[i+1];
	        var promisifiedKey = key + suffix;
	        if (promisifier === makeNodePromisified) {
	            obj[promisifiedKey] =
	                makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
	        } else {
	            var promisified = promisifier(fn, function() {
	                return makeNodePromisified(key, THIS, key,
	                                           fn, suffix, multiArgs);
	            });
	            util.notEnumerableProp(promisified, "__isPromisified__", true);
	            obj[promisifiedKey] = promisified;
	        }
	    }
	    util.toFastProperties(obj);
	    return obj;
	}

	function promisify(callback, receiver, multiArgs) {
	    return makeNodePromisified(callback, receiver, undefined,
	                                callback, null, multiArgs);
	}

	Promise.promisify = function (fn, options) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    if (isPromisified(fn)) {
	        return fn;
	    }
	    options = Object(options);
	    var receiver = options.context === undefined ? THIS : options.context;
	    var multiArgs = !!options.multiArgs;
	    var ret = promisify(fn, receiver, multiArgs);
	    util.copyDescriptors(fn, ret, propsFilter);
	    return ret;
	};

	Promise.promisifyAll = function (target, options) {
	    if (typeof target !== "function" && typeof target !== "object") {
	        throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    options = Object(options);
	    var multiArgs = !!options.multiArgs;
	    var suffix = options.suffix;
	    if (typeof suffix !== "string") suffix = defaultSuffix;
	    var filter = options.filter;
	    if (typeof filter !== "function") filter = defaultFilter;
	    var promisifier = options.promisifier;
	    if (typeof promisifier !== "function") promisifier = makeNodePromisified;

	    if (!util.isIdentifier(suffix)) {
	        throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }

	    var keys = util.inheritedDataKeys(target);
	    for (var i = 0; i < keys.length; ++i) {
	        var value = target[keys[i]];
	        if (keys[i] !== "constructor" &&
	            util.isClass(value)) {
	            promisifyAll(value.prototype, suffix, filter, promisifier,
	                multiArgs);
	            promisifyAll(value, suffix, filter, promisifier, multiArgs);
	        }
	    }

	    return promisifyAll(target, suffix, filter, promisifier, multiArgs);
	};
	};


	},{"./errors":12,"./nodeback":20,"./util":36}],25:[function(_dereq_,module,exports){
	module.exports = function(
	    Promise, PromiseArray, tryConvertToPromise, apiRejection) {
	var util = _dereq_("./util");
	var isObject = util.isObject;
	var es5 = _dereq_("./es5");
	var Es6Map;
	if (typeof Map === "function") Es6Map = Map;

	var mapToEntries = (function() {
	    var index = 0;
	    var size = 0;

	    function extractEntry(value, key) {
	        this[index] = value;
	        this[index + size] = key;
	        index++;
	    }

	    return function mapToEntries(map) {
	        size = map.size;
	        index = 0;
	        var ret = new Array(map.size * 2);
	        map.forEach(extractEntry, ret);
	        return ret;
	    };
	})();

	var entriesToMap = function(entries) {
	    var ret = new Es6Map();
	    var length = entries.length / 2 | 0;
	    for (var i = 0; i < length; ++i) {
	        var key = entries[length + i];
	        var value = entries[i];
	        ret.set(key, value);
	    }
	    return ret;
	};

	function PropertiesPromiseArray(obj) {
	    var isMap = false;
	    var entries;
	    if (Es6Map !== undefined && obj instanceof Es6Map) {
	        entries = mapToEntries(obj);
	        isMap = true;
	    } else {
	        var keys = es5.keys(obj);
	        var len = keys.length;
	        entries = new Array(len * 2);
	        for (var i = 0; i < len; ++i) {
	            var key = keys[i];
	            entries[i] = obj[key];
	            entries[i + len] = key;
	        }
	    }
	    this.constructor$(entries);
	    this._isMap = isMap;
	    this._init$(undefined, isMap ? -6 : -3);
	}
	util.inherits(PropertiesPromiseArray, PromiseArray);

	PropertiesPromiseArray.prototype._init = function () {};

	PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        var val;
	        if (this._isMap) {
	            val = entriesToMap(this._values);
	        } else {
	            val = {};
	            var keyOffset = this.length();
	            for (var i = 0, len = this.length(); i < len; ++i) {
	                val[this._values[i + keyOffset]] = this._values[i];
	            }
	        }
	        this._resolve(val);
	        return true;
	    }
	    return false;
	};

	PropertiesPromiseArray.prototype.shouldCopyValues = function () {
	    return false;
	};

	PropertiesPromiseArray.prototype.getActualLength = function (len) {
	    return len >> 1;
	};

	function props(promises) {
	    var ret;
	    var castValue = tryConvertToPromise(promises);

	    if (!isObject(castValue)) {
	        return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    } else if (castValue instanceof Promise) {
	        ret = castValue._then(
	            Promise.props, undefined, undefined, undefined, undefined);
	    } else {
	        ret = new PropertiesPromiseArray(castValue).promise();
	    }

	    if (castValue instanceof Promise) {
	        ret._propagateFrom(castValue, 2);
	    }
	    return ret;
	}

	Promise.prototype.props = function () {
	    return props(this);
	};

	Promise.props = function (promises) {
	    return props(promises);
	};
	};

	},{"./es5":13,"./util":36}],26:[function(_dereq_,module,exports){
	function arrayMove(src, srcIndex, dst, dstIndex, len) {
	    for (var j = 0; j < len; ++j) {
	        dst[j + dstIndex] = src[j + srcIndex];
	        src[j + srcIndex] = void 0;
	    }
	}

	function Queue(capacity) {
	    this._capacity = capacity;
	    this._length = 0;
	    this._front = 0;
	}

	Queue.prototype._willBeOverCapacity = function (size) {
	    return this._capacity < size;
	};

	Queue.prototype._pushOne = function (arg) {
	    var length = this.length();
	    this._checkCapacity(length + 1);
	    var i = (this._front + length) & (this._capacity - 1);
	    this[i] = arg;
	    this._length = length + 1;
	};

	Queue.prototype.push = function (fn, receiver, arg) {
	    var length = this.length() + 3;
	    if (this._willBeOverCapacity(length)) {
	        this._pushOne(fn);
	        this._pushOne(receiver);
	        this._pushOne(arg);
	        return;
	    }
	    var j = this._front + length - 3;
	    this._checkCapacity(length);
	    var wrapMask = this._capacity - 1;
	    this[(j + 0) & wrapMask] = fn;
	    this[(j + 1) & wrapMask] = receiver;
	    this[(j + 2) & wrapMask] = arg;
	    this._length = length;
	};

	Queue.prototype.shift = function () {
	    var front = this._front,
	        ret = this[front];

	    this[front] = undefined;
	    this._front = (front + 1) & (this._capacity - 1);
	    this._length--;
	    return ret;
	};

	Queue.prototype.length = function () {
	    return this._length;
	};

	Queue.prototype._checkCapacity = function (size) {
	    if (this._capacity < size) {
	        this._resizeTo(this._capacity << 1);
	    }
	};

	Queue.prototype._resizeTo = function (capacity) {
	    var oldCapacity = this._capacity;
	    this._capacity = capacity;
	    var front = this._front;
	    var length = this._length;
	    var moveItemsCount = (front + length) & (oldCapacity - 1);
	    arrayMove(this, 0, this, oldCapacity, moveItemsCount);
	};

	module.exports = Queue;

	},{}],27:[function(_dereq_,module,exports){
	module.exports = function(
	    Promise, INTERNAL, tryConvertToPromise, apiRejection) {
	var util = _dereq_("./util");

	var raceLater = function (promise) {
	    return promise.then(function(array) {
	        return race(array, promise);
	    });
	};

	function race(promises, parent) {
	    var maybePromise = tryConvertToPromise(promises);

	    if (maybePromise instanceof Promise) {
	        return raceLater(maybePromise);
	    } else {
	        promises = util.asArray(promises);
	        if (promises === null)
	            return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
	    }

	    var ret = new Promise(INTERNAL);
	    if (parent !== undefined) {
	        ret._propagateFrom(parent, 3);
	    }
	    var fulfill = ret._fulfill;
	    var reject = ret._reject;
	    for (var i = 0, len = promises.length; i < len; ++i) {
	        var val = promises[i];

	        if (val === undefined && !(i in promises)) {
	            continue;
	        }

	        Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
	    }
	    return ret;
	}

	Promise.race = function (promises) {
	    return race(promises, undefined);
	};

	Promise.prototype.race = function () {
	    return race(this, undefined);
	};

	};

	},{"./util":36}],28:[function(_dereq_,module,exports){
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL,
	                          debug) {
	var getDomain = Promise._getDomain;
	var util = _dereq_("./util");
	var tryCatch = util.tryCatch;

	function ReductionPromiseArray(promises, fn, initialValue, _each) {
	    this.constructor$(promises);
	    var domain = getDomain();
	    this._fn = domain === null ? fn : util.domainBind(domain, fn);
	    if (initialValue !== undefined) {
	        initialValue = Promise.resolve(initialValue);
	        initialValue._attachCancellationCallback(this);
	    }
	    this._initialValue = initialValue;
	    this._currentCancellable = null;
	    if(_each === INTERNAL) {
	        this._eachValues = Array(this._length);
	    } else if (_each === 0) {
	        this._eachValues = null;
	    } else {
	        this._eachValues = undefined;
	    }
	    this._promise._captureStackTrace();
	    this._init$(undefined, -5);
	}
	util.inherits(ReductionPromiseArray, PromiseArray);

	ReductionPromiseArray.prototype._gotAccum = function(accum) {
	    if (this._eachValues !== undefined && 
	        this._eachValues !== null && 
	        accum !== INTERNAL) {
	        this._eachValues.push(accum);
	    }
	};

	ReductionPromiseArray.prototype._eachComplete = function(value) {
	    if (this._eachValues !== null) {
	        this._eachValues.push(value);
	    }
	    return this._eachValues;
	};

	ReductionPromiseArray.prototype._init = function() {};

	ReductionPromiseArray.prototype._resolveEmptyArray = function() {
	    this._resolve(this._eachValues !== undefined ? this._eachValues
	                                                 : this._initialValue);
	};

	ReductionPromiseArray.prototype.shouldCopyValues = function () {
	    return false;
	};

	ReductionPromiseArray.prototype._resolve = function(value) {
	    this._promise._resolveCallback(value);
	    this._values = null;
	};

	ReductionPromiseArray.prototype._resultCancelled = function(sender) {
	    if (sender === this._initialValue) return this._cancel();
	    if (this._isResolved()) return;
	    this._resultCancelled$();
	    if (this._currentCancellable instanceof Promise) {
	        this._currentCancellable.cancel();
	    }
	    if (this._initialValue instanceof Promise) {
	        this._initialValue.cancel();
	    }
	};

	ReductionPromiseArray.prototype._iterate = function (values) {
	    this._values = values;
	    var value;
	    var i;
	    var length = values.length;
	    if (this._initialValue !== undefined) {
	        value = this._initialValue;
	        i = 0;
	    } else {
	        value = Promise.resolve(values[0]);
	        i = 1;
	    }

	    this._currentCancellable = value;

	    if (!value.isRejected()) {
	        for (; i < length; ++i) {
	            var ctx = {
	                accum: null,
	                value: values[i],
	                index: i,
	                length: length,
	                array: this
	            };
	            value = value._then(gotAccum, undefined, undefined, ctx, undefined);
	        }
	    }

	    if (this._eachValues !== undefined) {
	        value = value
	            ._then(this._eachComplete, undefined, undefined, this, undefined);
	    }
	    value._then(completed, completed, undefined, value, this);
	};

	Promise.prototype.reduce = function (fn, initialValue) {
	    return reduce(this, fn, initialValue, null);
	};

	Promise.reduce = function (promises, fn, initialValue, _each) {
	    return reduce(promises, fn, initialValue, _each);
	};

	function completed(valueOrReason, array) {
	    if (this.isFulfilled()) {
	        array._resolve(valueOrReason);
	    } else {
	        array._reject(valueOrReason);
	    }
	}

	function reduce(promises, fn, initialValue, _each) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
	    return array.promise();
	}

	function gotAccum(accum) {
	    this.accum = accum;
	    this.array._gotAccum(accum);
	    var value = tryConvertToPromise(this.value, this.array._promise);
	    if (value instanceof Promise) {
	        this.array._currentCancellable = value;
	        return value._then(gotValue, undefined, undefined, this, undefined);
	    } else {
	        return gotValue.call(this, value);
	    }
	}

	function gotValue(value) {
	    var array = this.array;
	    var promise = array._promise;
	    var fn = tryCatch(array._fn);
	    promise._pushContext();
	    var ret;
	    if (array._eachValues !== undefined) {
	        ret = fn.call(promise._boundValue(), value, this.index, this.length);
	    } else {
	        ret = fn.call(promise._boundValue(),
	                              this.accum, value, this.index, this.length);
	    }
	    if (ret instanceof Promise) {
	        array._currentCancellable = ret;
	    }
	    var promiseCreated = promise._popContext();
	    debug.checkForgottenReturns(
	        ret,
	        promiseCreated,
	        array._eachValues !== undefined ? "Promise.each" : "Promise.reduce",
	        promise
	    );
	    return ret;
	}
	};

	},{"./util":36}],29:[function(_dereq_,module,exports){
	var util = _dereq_("./util");
	var schedule;
	var noAsyncScheduler = function() {
	    throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	};
	var NativePromise = util.getNativePromise();
	if (util.isNode && typeof MutationObserver === "undefined") {
	    var GlobalSetImmediate = commonjsGlobal.setImmediate;
	    var ProcessNextTick = process.nextTick;
	    schedule = util.isRecentNode
	                ? function(fn) { GlobalSetImmediate.call(commonjsGlobal, fn); }
	                : function(fn) { ProcessNextTick.call(process, fn); };
	} else if (typeof NativePromise === "function" &&
	           typeof NativePromise.resolve === "function") {
	    var nativePromise = NativePromise.resolve();
	    schedule = function(fn) {
	        nativePromise.then(fn);
	    };
	} else if ((typeof MutationObserver !== "undefined") &&
	          !(typeof window !== "undefined" &&
	            window.navigator &&
	            (window.navigator.standalone || window.cordova))) {
	    schedule = (function() {
	        var div = document.createElement("div");
	        var opts = {attributes: true};
	        var toggleScheduled = false;
	        var div2 = document.createElement("div");
	        var o2 = new MutationObserver(function() {
	            div.classList.toggle("foo");
	            toggleScheduled = false;
	        });
	        o2.observe(div2, opts);

	        var scheduleToggle = function() {
	            if (toggleScheduled) return;
	            toggleScheduled = true;
	            div2.classList.toggle("foo");
	        };

	        return function schedule(fn) {
	            var o = new MutationObserver(function() {
	                o.disconnect();
	                fn();
	            });
	            o.observe(div, opts);
	            scheduleToggle();
	        };
	    })();
	} else if (typeof setImmediate !== "undefined") {
	    schedule = function (fn) {
	        setImmediate(fn);
	    };
	} else if (typeof setTimeout !== "undefined") {
	    schedule = function (fn) {
	        setTimeout(fn, 0);
	    };
	} else {
	    schedule = noAsyncScheduler;
	}
	module.exports = schedule;

	},{"./util":36}],30:[function(_dereq_,module,exports){
	module.exports =
	    function(Promise, PromiseArray, debug) {
	var PromiseInspection = Promise.PromiseInspection;
	var util = _dereq_("./util");

	function SettledPromiseArray(values) {
	    this.constructor$(values);
	}
	util.inherits(SettledPromiseArray, PromiseArray);

	SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
	    this._values[index] = inspection;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	        return true;
	    }
	    return false;
	};

	SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 33554432;
	    ret._settledValueField = value;
	    return this._promiseResolved(index, ret);
	};
	SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 16777216;
	    ret._settledValueField = reason;
	    return this._promiseResolved(index, ret);
	};

	Promise.settle = function (promises) {
	    debug.deprecated(".settle()", ".reflect()");
	    return new SettledPromiseArray(promises).promise();
	};

	Promise.prototype.settle = function () {
	    return Promise.settle(this);
	};
	};

	},{"./util":36}],31:[function(_dereq_,module,exports){
	module.exports =
	function(Promise, PromiseArray, apiRejection) {
	var util = _dereq_("./util");
	var RangeError = _dereq_("./errors").RangeError;
	var AggregateError = _dereq_("./errors").AggregateError;
	var isArray = util.isArray;
	var CANCELLATION = {};


	function SomePromiseArray(values) {
	    this.constructor$(values);
	    this._howMany = 0;
	    this._unwrap = false;
	    this._initialized = false;
	}
	util.inherits(SomePromiseArray, PromiseArray);

	SomePromiseArray.prototype._init = function () {
	    if (!this._initialized) {
	        return;
	    }
	    if (this._howMany === 0) {
	        this._resolve([]);
	        return;
	    }
	    this._init$(undefined, -5);
	    var isArrayResolved = isArray(this._values);
	    if (!this._isResolved() &&
	        isArrayResolved &&
	        this._howMany > this._canPossiblyFulfill()) {
	        this._reject(this._getRangeError(this.length()));
	    }
	};

	SomePromiseArray.prototype.init = function () {
	    this._initialized = true;
	    this._init();
	};

	SomePromiseArray.prototype.setUnwrap = function () {
	    this._unwrap = true;
	};

	SomePromiseArray.prototype.howMany = function () {
	    return this._howMany;
	};

	SomePromiseArray.prototype.setHowMany = function (count) {
	    this._howMany = count;
	};

	SomePromiseArray.prototype._promiseFulfilled = function (value) {
	    this._addFulfilled(value);
	    if (this._fulfilled() === this.howMany()) {
	        this._values.length = this.howMany();
	        if (this.howMany() === 1 && this._unwrap) {
	            this._resolve(this._values[0]);
	        } else {
	            this._resolve(this._values);
	        }
	        return true;
	    }
	    return false;

	};
	SomePromiseArray.prototype._promiseRejected = function (reason) {
	    this._addRejected(reason);
	    return this._checkOutcome();
	};

	SomePromiseArray.prototype._promiseCancelled = function () {
	    if (this._values instanceof Promise || this._values == null) {
	        return this._cancel();
	    }
	    this._addRejected(CANCELLATION);
	    return this._checkOutcome();
	};

	SomePromiseArray.prototype._checkOutcome = function() {
	    if (this.howMany() > this._canPossiblyFulfill()) {
	        var e = new AggregateError();
	        for (var i = this.length(); i < this._values.length; ++i) {
	            if (this._values[i] !== CANCELLATION) {
	                e.push(this._values[i]);
	            }
	        }
	        if (e.length > 0) {
	            this._reject(e);
	        } else {
	            this._cancel();
	        }
	        return true;
	    }
	    return false;
	};

	SomePromiseArray.prototype._fulfilled = function () {
	    return this._totalResolved;
	};

	SomePromiseArray.prototype._rejected = function () {
	    return this._values.length - this.length();
	};

	SomePromiseArray.prototype._addRejected = function (reason) {
	    this._values.push(reason);
	};

	SomePromiseArray.prototype._addFulfilled = function (value) {
	    this._values[this._totalResolved++] = value;
	};

	SomePromiseArray.prototype._canPossiblyFulfill = function () {
	    return this.length() - this._rejected();
	};

	SomePromiseArray.prototype._getRangeError = function (count) {
	    var message = "Input array must contain at least " +
	            this._howMany + " items but contains only " + count + " items";
	    return new RangeError(message);
	};

	SomePromiseArray.prototype._resolveEmptyArray = function () {
	    this._reject(this._getRangeError(0));
	};

	function some(promises, howMany) {
	    if ((howMany | 0) !== howMany || howMany < 0) {
	        return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(howMany);
	    ret.init();
	    return promise;
	}

	Promise.some = function (promises, howMany) {
	    return some(promises, howMany);
	};

	Promise.prototype.some = function (howMany) {
	    return some(this, howMany);
	};

	Promise._SomePromiseArray = SomePromiseArray;
	};

	},{"./errors":12,"./util":36}],32:[function(_dereq_,module,exports){
	module.exports = function(Promise) {
	function PromiseInspection(promise) {
	    if (promise !== undefined) {
	        promise = promise._target();
	        this._bitField = promise._bitField;
	        this._settledValueField = promise._isFateSealed()
	            ? promise._settledValue() : undefined;
	    }
	    else {
	        this._bitField = 0;
	        this._settledValueField = undefined;
	    }
	}

	PromiseInspection.prototype._settledValue = function() {
	    return this._settledValueField;
	};

	var value = PromiseInspection.prototype.value = function () {
	    if (!this.isFulfilled()) {
	        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    return this._settledValue();
	};

	var reason = PromiseInspection.prototype.error =
	PromiseInspection.prototype.reason = function () {
	    if (!this.isRejected()) {
	        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    return this._settledValue();
	};

	var isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
	    return (this._bitField & 33554432) !== 0;
	};

	var isRejected = PromiseInspection.prototype.isRejected = function () {
	    return (this._bitField & 16777216) !== 0;
	};

	var isPending = PromiseInspection.prototype.isPending = function () {
	    return (this._bitField & 50397184) === 0;
	};

	var isResolved = PromiseInspection.prototype.isResolved = function () {
	    return (this._bitField & 50331648) !== 0;
	};

	PromiseInspection.prototype.isCancelled = function() {
	    return (this._bitField & 8454144) !== 0;
	};

	Promise.prototype.__isCancelled = function() {
	    return (this._bitField & 65536) === 65536;
	};

	Promise.prototype._isCancelled = function() {
	    return this._target().__isCancelled();
	};

	Promise.prototype.isCancelled = function() {
	    return (this._target()._bitField & 8454144) !== 0;
	};

	Promise.prototype.isPending = function() {
	    return isPending.call(this._target());
	};

	Promise.prototype.isRejected = function() {
	    return isRejected.call(this._target());
	};

	Promise.prototype.isFulfilled = function() {
	    return isFulfilled.call(this._target());
	};

	Promise.prototype.isResolved = function() {
	    return isResolved.call(this._target());
	};

	Promise.prototype.value = function() {
	    return value.call(this._target());
	};

	Promise.prototype.reason = function() {
	    var target = this._target();
	    target._unsetRejectionIsUnhandled();
	    return reason.call(target);
	};

	Promise.prototype._value = function() {
	    return this._settledValue();
	};

	Promise.prototype._reason = function() {
	    this._unsetRejectionIsUnhandled();
	    return this._settledValue();
	};

	Promise.PromiseInspection = PromiseInspection;
	};

	},{}],33:[function(_dereq_,module,exports){
	module.exports = function(Promise, INTERNAL) {
	var util = _dereq_("./util");
	var errorObj = util.errorObj;
	var isObject = util.isObject;

	function tryConvertToPromise(obj, context) {
	    if (isObject(obj)) {
	        if (obj instanceof Promise) return obj;
	        var then = getThen(obj);
	        if (then === errorObj) {
	            if (context) context._pushContext();
	            var ret = Promise.reject(then.e);
	            if (context) context._popContext();
	            return ret;
	        } else if (typeof then === "function") {
	            if (isAnyBluebirdPromise(obj)) {
	                var ret = new Promise(INTERNAL);
	                obj._then(
	                    ret._fulfill,
	                    ret._reject,
	                    undefined,
	                    ret,
	                    null
	                );
	                return ret;
	            }
	            return doThenable(obj, then, context);
	        }
	    }
	    return obj;
	}

	function doGetThen(obj) {
	    return obj.then;
	}

	function getThen(obj) {
	    try {
	        return doGetThen(obj);
	    } catch (e) {
	        errorObj.e = e;
	        return errorObj;
	    }
	}

	var hasProp = {}.hasOwnProperty;
	function isAnyBluebirdPromise(obj) {
	    try {
	        return hasProp.call(obj, "_promise0");
	    } catch (e) {
	        return false;
	    }
	}

	function doThenable(x, then, context) {
	    var promise = new Promise(INTERNAL);
	    var ret = promise;
	    if (context) context._pushContext();
	    promise._captureStackTrace();
	    if (context) context._popContext();
	    var synchronous = true;
	    var result = util.tryCatch(then).call(x, resolve, reject);
	    synchronous = false;

	    if (promise && result === errorObj) {
	        promise._rejectCallback(result.e, true, true);
	        promise = null;
	    }

	    function resolve(value) {
	        if (!promise) return;
	        promise._resolveCallback(value);
	        promise = null;
	    }

	    function reject(reason) {
	        if (!promise) return;
	        promise._rejectCallback(reason, synchronous, true);
	        promise = null;
	    }
	    return ret;
	}

	return tryConvertToPromise;
	};

	},{"./util":36}],34:[function(_dereq_,module,exports){
	module.exports = function(Promise, INTERNAL, debug) {
	var util = _dereq_("./util");
	var TimeoutError = Promise.TimeoutError;

	function HandleWrapper(handle)  {
	    this.handle = handle;
	}

	HandleWrapper.prototype._resultCancelled = function() {
	    clearTimeout(this.handle);
	};

	var afterValue = function(value) { return delay(+this).thenReturn(value); };
	var delay = Promise.delay = function (ms, value) {
	    var ret;
	    var handle;
	    if (value !== undefined) {
	        ret = Promise.resolve(value)
	                ._then(afterValue, null, null, ms, undefined);
	        if (debug.cancellation() && value instanceof Promise) {
	            ret._setOnCancel(value);
	        }
	    } else {
	        ret = new Promise(INTERNAL);
	        handle = setTimeout(function() { ret._fulfill(); }, +ms);
	        if (debug.cancellation()) {
	            ret._setOnCancel(new HandleWrapper(handle));
	        }
	        ret._captureStackTrace();
	    }
	    ret._setAsyncGuaranteed();
	    return ret;
	};

	Promise.prototype.delay = function (ms) {
	    return delay(ms, this);
	};

	var afterTimeout = function (promise, message, parent) {
	    var err;
	    if (typeof message !== "string") {
	        if (message instanceof Error) {
	            err = message;
	        } else {
	            err = new TimeoutError("operation timed out");
	        }
	    } else {
	        err = new TimeoutError(message);
	    }
	    util.markAsOriginatingFromRejection(err);
	    promise._attachExtraTrace(err);
	    promise._reject(err);

	    if (parent != null) {
	        parent.cancel();
	    }
	};

	function successClear(value) {
	    clearTimeout(this.handle);
	    return value;
	}

	function failureClear(reason) {
	    clearTimeout(this.handle);
	    throw reason;
	}

	Promise.prototype.timeout = function (ms, message) {
	    ms = +ms;
	    var ret, parent;

	    var handleWrapper = new HandleWrapper(setTimeout(function timeoutTimeout() {
	        if (ret.isPending()) {
	            afterTimeout(ret, message, parent);
	        }
	    }, ms));

	    if (debug.cancellation()) {
	        parent = this.then();
	        ret = parent._then(successClear, failureClear,
	                            undefined, handleWrapper, undefined);
	        ret._setOnCancel(handleWrapper);
	    } else {
	        ret = this._then(successClear, failureClear,
	                            undefined, handleWrapper, undefined);
	    }

	    return ret;
	};

	};

	},{"./util":36}],35:[function(_dereq_,module,exports){
	module.exports = function (Promise, apiRejection, tryConvertToPromise,
	    createContext, INTERNAL, debug) {
	    var util = _dereq_("./util");
	    var TypeError = _dereq_("./errors").TypeError;
	    var inherits = _dereq_("./util").inherits;
	    var errorObj = util.errorObj;
	    var tryCatch = util.tryCatch;
	    var NULL = {};

	    function thrower(e) {
	        setTimeout(function(){throw e;}, 0);
	    }

	    function castPreservingDisposable(thenable) {
	        var maybePromise = tryConvertToPromise(thenable);
	        if (maybePromise !== thenable &&
	            typeof thenable._isDisposable === "function" &&
	            typeof thenable._getDisposer === "function" &&
	            thenable._isDisposable()) {
	            maybePromise._setDisposable(thenable._getDisposer());
	        }
	        return maybePromise;
	    }
	    function dispose(resources, inspection) {
	        var i = 0;
	        var len = resources.length;
	        var ret = new Promise(INTERNAL);
	        function iterator() {
	            if (i >= len) return ret._fulfill();
	            var maybePromise = castPreservingDisposable(resources[i++]);
	            if (maybePromise instanceof Promise &&
	                maybePromise._isDisposable()) {
	                try {
	                    maybePromise = tryConvertToPromise(
	                        maybePromise._getDisposer().tryDispose(inspection),
	                        resources.promise);
	                } catch (e) {
	                    return thrower(e);
	                }
	                if (maybePromise instanceof Promise) {
	                    return maybePromise._then(iterator, thrower,
	                                              null, null, null);
	                }
	            }
	            iterator();
	        }
	        iterator();
	        return ret;
	    }

	    function Disposer(data, promise, context) {
	        this._data = data;
	        this._promise = promise;
	        this._context = context;
	    }

	    Disposer.prototype.data = function () {
	        return this._data;
	    };

	    Disposer.prototype.promise = function () {
	        return this._promise;
	    };

	    Disposer.prototype.resource = function () {
	        if (this.promise().isFulfilled()) {
	            return this.promise().value();
	        }
	        return NULL;
	    };

	    Disposer.prototype.tryDispose = function(inspection) {
	        var resource = this.resource();
	        var context = this._context;
	        if (context !== undefined) context._pushContext();
	        var ret = resource !== NULL
	            ? this.doDispose(resource, inspection) : null;
	        if (context !== undefined) context._popContext();
	        this._promise._unsetDisposable();
	        this._data = null;
	        return ret;
	    };

	    Disposer.isDisposer = function (d) {
	        return (d != null &&
	                typeof d.resource === "function" &&
	                typeof d.tryDispose === "function");
	    };

	    function FunctionDisposer(fn, promise, context) {
	        this.constructor$(fn, promise, context);
	    }
	    inherits(FunctionDisposer, Disposer);

	    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
	        var fn = this.data();
	        return fn.call(resource, resource, inspection);
	    };

	    function maybeUnwrapDisposer(value) {
	        if (Disposer.isDisposer(value)) {
	            this.resources[this.index]._setDisposable(value);
	            return value.promise();
	        }
	        return value;
	    }

	    function ResourceList(length) {
	        this.length = length;
	        this.promise = null;
	        this[length-1] = null;
	    }

	    ResourceList.prototype._resultCancelled = function() {
	        var len = this.length;
	        for (var i = 0; i < len; ++i) {
	            var item = this[i];
	            if (item instanceof Promise) {
	                item.cancel();
	            }
	        }
	    };

	    Promise.using = function () {
	        var len = arguments.length;
	        if (len < 2) return apiRejection(
	                        "you must pass at least 2 arguments to Promise.using");
	        var fn = arguments[len - 1];
	        if (typeof fn !== "function") {
	            return apiRejection("expecting a function but got " + util.classString(fn));
	        }
	        var input;
	        var spreadArgs = true;
	        if (len === 2 && Array.isArray(arguments[0])) {
	            input = arguments[0];
	            len = input.length;
	            spreadArgs = false;
	        } else {
	            input = arguments;
	            len--;
	        }
	        var resources = new ResourceList(len);
	        for (var i = 0; i < len; ++i) {
	            var resource = input[i];
	            if (Disposer.isDisposer(resource)) {
	                var disposer = resource;
	                resource = resource.promise();
	                resource._setDisposable(disposer);
	            } else {
	                var maybePromise = tryConvertToPromise(resource);
	                if (maybePromise instanceof Promise) {
	                    resource =
	                        maybePromise._then(maybeUnwrapDisposer, null, null, {
	                            resources: resources,
	                            index: i
	                    }, undefined);
	                }
	            }
	            resources[i] = resource;
	        }

	        var reflectedResources = new Array(resources.length);
	        for (var i = 0; i < reflectedResources.length; ++i) {
	            reflectedResources[i] = Promise.resolve(resources[i]).reflect();
	        }

	        var resultPromise = Promise.all(reflectedResources)
	            .then(function(inspections) {
	                for (var i = 0; i < inspections.length; ++i) {
	                    var inspection = inspections[i];
	                    if (inspection.isRejected()) {
	                        errorObj.e = inspection.error();
	                        return errorObj;
	                    } else if (!inspection.isFulfilled()) {
	                        resultPromise.cancel();
	                        return;
	                    }
	                    inspections[i] = inspection.value();
	                }
	                promise._pushContext();

	                fn = tryCatch(fn);
	                var ret = spreadArgs
	                    ? fn.apply(undefined, inspections) : fn(inspections);
	                var promiseCreated = promise._popContext();
	                debug.checkForgottenReturns(
	                    ret, promiseCreated, "Promise.using", promise);
	                return ret;
	            });

	        var promise = resultPromise.lastly(function() {
	            var inspection = new Promise.PromiseInspection(resultPromise);
	            return dispose(resources, inspection);
	        });
	        resources.promise = promise;
	        promise._setOnCancel(resources);
	        return promise;
	    };

	    Promise.prototype._setDisposable = function (disposer) {
	        this._bitField = this._bitField | 131072;
	        this._disposer = disposer;
	    };

	    Promise.prototype._isDisposable = function () {
	        return (this._bitField & 131072) > 0;
	    };

	    Promise.prototype._getDisposer = function () {
	        return this._disposer;
	    };

	    Promise.prototype._unsetDisposable = function () {
	        this._bitField = this._bitField & (~131072);
	        this._disposer = undefined;
	    };

	    Promise.prototype.disposer = function (fn) {
	        if (typeof fn === "function") {
	            return new FunctionDisposer(fn, this, createContext());
	        }
	        throw new TypeError();
	    };

	};

	},{"./errors":12,"./util":36}],36:[function(_dereq_,module,exports){
	var es5 = _dereq_("./es5");
	var canEvaluate = typeof navigator == "undefined";

	var errorObj = {e: {}};
	var tryCatchTarget;
	var globalObject = typeof self !== "undefined" ? self :
	    typeof window !== "undefined" ? window :
	    typeof commonjsGlobal !== "undefined" ? commonjsGlobal :
	    this !== undefined ? this : null;

	function tryCatcher() {
	    try {
	        var target = tryCatchTarget;
	        tryCatchTarget = null;
	        return target.apply(this, arguments);
	    } catch (e) {
	        errorObj.e = e;
	        return errorObj;
	    }
	}
	function tryCatch(fn) {
	    tryCatchTarget = fn;
	    return tryCatcher;
	}

	var inherits = function(Child, Parent) {
	    var hasProp = {}.hasOwnProperty;

	    function T() {
	        this.constructor = Child;
	        this.constructor$ = Parent;
	        for (var propertyName in Parent.prototype) {
	            if (hasProp.call(Parent.prototype, propertyName) &&
	                propertyName.charAt(propertyName.length-1) !== "$"
	           ) {
	                this[propertyName + "$"] = Parent.prototype[propertyName];
	            }
	        }
	    }
	    T.prototype = Parent.prototype;
	    Child.prototype = new T();
	    return Child.prototype;
	};


	function isPrimitive(val) {
	    return val == null || val === true || val === false ||
	        typeof val === "string" || typeof val === "number";

	}

	function isObject(value) {
	    return typeof value === "function" ||
	           typeof value === "object" && value !== null;
	}

	function maybeWrapAsError(maybeError) {
	    if (!isPrimitive(maybeError)) return maybeError;

	    return new Error(safeToString(maybeError));
	}

	function withAppended(target, appendee) {
	    var len = target.length;
	    var ret = new Array(len + 1);
	    var i;
	    for (i = 0; i < len; ++i) {
	        ret[i] = target[i];
	    }
	    ret[i] = appendee;
	    return ret;
	}

	function getDataPropertyOrDefault(obj, key, defaultValue) {
	    if (es5.isES5) {
	        var desc = Object.getOwnPropertyDescriptor(obj, key);

	        if (desc != null) {
	            return desc.get == null && desc.set == null
	                    ? desc.value
	                    : defaultValue;
	        }
	    } else {
	        return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
	    }
	}

	function notEnumerableProp(obj, name, value) {
	    if (isPrimitive(obj)) return obj;
	    var descriptor = {
	        value: value,
	        configurable: true,
	        enumerable: false,
	        writable: true
	    };
	    es5.defineProperty(obj, name, descriptor);
	    return obj;
	}

	function thrower(r) {
	    throw r;
	}

	var inheritedDataKeys = (function() {
	    var excludedPrototypes = [
	        Array.prototype,
	        Object.prototype,
	        Function.prototype
	    ];

	    var isExcludedProto = function(val) {
	        for (var i = 0; i < excludedPrototypes.length; ++i) {
	            if (excludedPrototypes[i] === val) {
	                return true;
	            }
	        }
	        return false;
	    };

	    if (es5.isES5) {
	        var getKeys = Object.getOwnPropertyNames;
	        return function(obj) {
	            var ret = [];
	            var visitedKeys = Object.create(null);
	            while (obj != null && !isExcludedProto(obj)) {
	                var keys;
	                try {
	                    keys = getKeys(obj);
	                } catch (e) {
	                    return ret;
	                }
	                for (var i = 0; i < keys.length; ++i) {
	                    var key = keys[i];
	                    if (visitedKeys[key]) continue;
	                    visitedKeys[key] = true;
	                    var desc = Object.getOwnPropertyDescriptor(obj, key);
	                    if (desc != null && desc.get == null && desc.set == null) {
	                        ret.push(key);
	                    }
	                }
	                obj = es5.getPrototypeOf(obj);
	            }
	            return ret;
	        };
	    } else {
	        var hasProp = {}.hasOwnProperty;
	        return function(obj) {
	            if (isExcludedProto(obj)) return [];
	            var ret = [];

	            /*jshint forin:false */
	            enumeration: for (var key in obj) {
	                if (hasProp.call(obj, key)) {
	                    ret.push(key);
	                } else {
	                    for (var i = 0; i < excludedPrototypes.length; ++i) {
	                        if (hasProp.call(excludedPrototypes[i], key)) {
	                            continue enumeration;
	                        }
	                    }
	                    ret.push(key);
	                }
	            }
	            return ret;
	        };
	    }

	})();

	var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
	function isClass(fn) {
	    try {
	        if (typeof fn === "function") {
	            var keys = es5.names(fn.prototype);

	            var hasMethods = es5.isES5 && keys.length > 1;
	            var hasMethodsOtherThanConstructor = keys.length > 0 &&
	                !(keys.length === 1 && keys[0] === "constructor");
	            var hasThisAssignmentAndStaticMethods =
	                thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;

	            if (hasMethods || hasMethodsOtherThanConstructor ||
	                hasThisAssignmentAndStaticMethods) {
	                return true;
	            }
	        }
	        return false;
	    } catch (e) {
	        return false;
	    }
	}

	function toFastProperties(obj) {
	    return obj;
	    eval(obj);
	}

	var rident = /^[a-z$_][a-z$_0-9]*$/i;
	function isIdentifier(str) {
	    return rident.test(str);
	}

	function filledRange(count, prefix, suffix) {
	    var ret = new Array(count);
	    for(var i = 0; i < count; ++i) {
	        ret[i] = prefix + i + suffix;
	    }
	    return ret;
	}

	function safeToString(obj) {
	    try {
	        return obj + "";
	    } catch (e) {
	        return "[no string representation]";
	    }
	}

	function isError(obj) {
	    return obj instanceof Error ||
	        (obj !== null &&
	           typeof obj === "object" &&
	           typeof obj.message === "string" &&
	           typeof obj.name === "string");
	}

	function markAsOriginatingFromRejection(e) {
	    try {
	        notEnumerableProp(e, "isOperational", true);
	    }
	    catch(ignore) {}
	}

	function originatesFromRejection(e) {
	    if (e == null) return false;
	    return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
	        e["isOperational"] === true);
	}

	function canAttachTrace(obj) {
	    return isError(obj) && es5.propertyIsWritable(obj, "stack");
	}

	var ensureErrorObject = (function() {
	    if (!("stack" in new Error())) {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            try {throw new Error(safeToString(value));}
	            catch(err) {return err;}
	        };
	    } else {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            return new Error(safeToString(value));
	        };
	    }
	})();

	function classString(obj) {
	    return {}.toString.call(obj);
	}

	function copyDescriptors(from, to, filter) {
	    var keys = es5.names(from);
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        if (filter(key)) {
	            try {
	                es5.defineProperty(to, key, es5.getDescriptor(from, key));
	            } catch (ignore) {}
	        }
	    }
	}

	var asArray = function(v) {
	    if (es5.isArray(v)) {
	        return v;
	    }
	    return null;
	};

	if (typeof Symbol !== "undefined" && Symbol.iterator) {
	    var ArrayFrom = typeof Array.from === "function" ? function(v) {
	        return Array.from(v);
	    } : function(v) {
	        var ret = [];
	        var it = v[Symbol.iterator]();
	        var itResult;
	        while (!((itResult = it.next()).done)) {
	            ret.push(itResult.value);
	        }
	        return ret;
	    };

	    asArray = function(v) {
	        if (es5.isArray(v)) {
	            return v;
	        } else if (v != null && typeof v[Symbol.iterator] === "function") {
	            return ArrayFrom(v);
	        }
	        return null;
	    };
	}

	var isNode = typeof process !== "undefined" &&
	        classString(process).toLowerCase() === "[object process]";

	var hasEnvVariables = typeof process !== "undefined" &&
	    typeof process.env !== "undefined";

	function env(key) {
	    return hasEnvVariables ? process.env[key] : undefined;
	}

	function getNativePromise() {
	    if (typeof Promise === "function") {
	        try {
	            var promise = new Promise(function(){});
	            if ({}.toString.call(promise) === "[object Promise]") {
	                return Promise;
	            }
	        } catch (e) {}
	    }
	}

	function domainBind(self, cb) {
	    return self.bind(cb);
	}

	var ret = {
	    isClass: isClass,
	    isIdentifier: isIdentifier,
	    inheritedDataKeys: inheritedDataKeys,
	    getDataPropertyOrDefault: getDataPropertyOrDefault,
	    thrower: thrower,
	    isArray: es5.isArray,
	    asArray: asArray,
	    notEnumerableProp: notEnumerableProp,
	    isPrimitive: isPrimitive,
	    isObject: isObject,
	    isError: isError,
	    canEvaluate: canEvaluate,
	    errorObj: errorObj,
	    tryCatch: tryCatch,
	    inherits: inherits,
	    withAppended: withAppended,
	    maybeWrapAsError: maybeWrapAsError,
	    toFastProperties: toFastProperties,
	    filledRange: filledRange,
	    toString: safeToString,
	    canAttachTrace: canAttachTrace,
	    ensureErrorObject: ensureErrorObject,
	    originatesFromRejection: originatesFromRejection,
	    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
	    classString: classString,
	    copyDescriptors: copyDescriptors,
	    hasDevTools: typeof chrome !== "undefined" && chrome &&
	                 typeof chrome.loadTimes === "function",
	    isNode: isNode,
	    hasEnvVariables: hasEnvVariables,
	    env: env,
	    global: globalObject,
	    getNativePromise: getNativePromise,
	    domainBind: domainBind
	};
	ret.isRecentNode = ret.isNode && (function() {
	    var version;
	    if (process.versions && process.versions.node) {    
	        version = process.versions.node.split(".").map(Number);
	    } else if (process.version) {
	        version = process.version.split(".").map(Number);
	    }
	    return (version[0] === 0 && version[1] > 10) || (version[0] > 0);
	})();

	if (ret.isNode) ret.toFastProperties(process);

	try {throw new Error(); } catch (e) {ret.lastLineError = e;}
	module.exports = ret;

	},{"./es5":13}]},{},[4])(4)
	});if (typeof window !== 'undefined' && window !== null) {                               window.P = window.Promise;                                                     } else if (typeof self !== 'undefined' && self !== null) {                             self.P = self.Promise;                                                         }
	});
	var bluebird_1 = bluebird.promisify;

	var assistStyles = "/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n\t1. Reset\n\t2. Fonts\n\t3. Onboarding\n\t4. Notifications\n\t5. Tooltips\n\t6. Buttons\n*/\n\nhtml,\nbody,\ndiv,\nspan,\napplet,\nobject,\niframe,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\np,\nblockquote,\npre,\na,\nabbr,\nacronym,\naddress,\nbig,\ncite,\ncode,\ndel,\ndfn,\nem,\nimg,\nins,\nkbd,\nq,\ns,\nsamp,\nsmall,\nstrike,\nstrong,\nsub,\nsup,\ntt,\nb,\nu,\ni,\ncenter,\ndl,\ndt,\ndd,\nol,\nul,\nli,\nfieldset,\nform,\nlabel,\nlegend,\ntable,\ncaption,\ntbody,\ntfoot,\nthead,\ntr,\nth,\ntd,\narticle,\naside,\ncanvas,\ndetails,\nembed,\nfigure,\nfigcaption,\nfooter,\nheader,\nhgroup,\nmenu,\nnav,\noutput,\nruby,\nsection,\nsummary,\ntime,\nmark,\naudio,\nvideo {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  font: inherit;\n  vertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmenu,\nnav,\nsection {\n  display: block;\n}\nbody {\n  line-height: 1;\n}\nol,\nul {\n  list-style: none;\n}\nblockquote,\nq {\n  quotes: none;\n}\nblockquote:before,\nblockquote:after,\nq:before,\nq:after {\n  content: '';\n  content: none;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n\n/* Colors and Fonts \nRed:#FF3F4A;\nYellow:;#FFC137\nGreen:#7ED321;\nFont sizes based on https://www.modularscale.com/?16&px&1.125\n*/\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\np,\nul,\nol {\n  color: #4a4a4a;\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-weight: bold;\n  margin-bottom: 10px;\n}\n\nh1,\n.h1 {\n  font-size: 2.281em;\n  line-height: 1.266em;\n}\nh2,\n.h2 {\n  font-size: 1.802em;\n  line-height: 1.125em;\n}\nh3,\n.h3 {\n  font-size: 1.602em;\n  line-height: 1.266em;\n}\nh4,\n.h4 {\n  font-size: 1.266em;\n  line-height: 1.266em;\n}\nh5,\n.h5 {\n  font-size: 1.125em;\n  line-height: 1.125em;\n}\nh6,\n.h6 {\n  font-size: 1em;\n  line-height: 1em;\n}\np {\n  font-size: 1em;\n  line-height: 1.266em;\n}\n\na {\n  color: #4a90e2;\n  text-decoration: none;\n}\na:hover,\na:active {\n  color: #4a90e2;\n}\n\nstrong,\nb {\n  font-weight: bold;\n}\n\nbody {\n  font-family: 'Source Sans Pro', 'Open Sans', 'Helvetica Neue', Arial,\n  sans-serif;\n}\n\n.clearfix::after {\n  display: block;\n  content: '';\n  clear: both;\n}\n\n/* Onboarding */\n\n.bn-onboard-modal-shade {\n  background: rgba(0, 0, 0, 0.2);\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 9999;\n  width: 100%;\n  height: 100vh;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  opacity: 0;\n  transition: opacity 150ms ease-in-out;\n}\n\n.bn-onboard {\n  border-radius: 2px;\n  box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.1);\n}\n\n.bn-onboard-modal {\n  background: #fff;\n  border-radius: 2px;\n  box-sizing: border-box;\n  position: relative;\n}\n\n.bn-onboard-modal ul li,\n.bn-onboard-modal ol li {\n  margin-top: 15px;\n}\n\n.bn-onboard-basic {\n  padding: 0px;\n  max-width: 720px;\n  display: flex;\n  margin: 0 auto;\n}\n\n.bn-onboard-basic .bn-onboard-main {\n  padding: 15px 20px;\n  background: #fff;\n  -webkit-flex-grow: 1;\n  flex-grow: 1;\n  border-radius: 0 2px 2px 0;\n}\n\n.bn-onboard-basic .bn-onboard-sidebar {\n  padding: 15px 20px;\n  width: 34%;\n  background: #eeeeee;\n  -webkit-flex-shrink: 0;\n  flex-shrink: 0;\n  border-radius: 2px 0 0 2px;\n}\n.bn-onboard-advanced {\n  padding: 15px 20px;\n  max-width: 416px;\n  margin: 0 auto;\n}\n\n.bn-onboard-alert {\n  padding: 15px 20px;\n  max-width: 416px;\n  margin: 0 auto;\n  text-align: center;\n}\n.bn-onboard-list {\n  list-style: none;\n}\n.bn-inactive {\n  font-weight: normal;\n  color: #9b9b9b;\n}\n.bn-active {\n  font-weight: bold;\n  color: #4a4a4a;\n}\n.bn-check {\n  font-weight: normal;\n  text-decoration: line-through;\n  color: #9b9b9b;\n}\n\n.bn-onboard-list-sprite {\n  width: 16px;\n  height: 16px;\n  display: inline-block;\n  background-image: url('https://assist.blocknative.com/images/jJu8b0B.png');\n  vertical-align: sub;\n}\n\n.bn-active .bn-onboard-list-sprite {\n  background-position: -16px 0px;\n}\n.bn-check .bn-onboard-list-sprite {\n  background-position: -32px 0px;\n}\n\nimg.bn-onboard-img {\n  display: block;\n  max-width: 100%;\n  height: auto;\n  border-radius: 4px;\n}\n\n.bn-onboard-close {\n  background: #ededed;\n  border-radius: 100px;\n  width: 28px;\n  height: 28px;\n  position: absolute;\n  top: -9px;\n  right: -9px;\n}\n.bn-onboard-close-x {\n  width: 16px;\n  height: 16px;\n  display: block;\n  margin: 6px;\n  background-image: url('https://assist.blocknative.com/images/jJu8b0B.png');\n  background-position: -49px 0px;\n}\n\n.bn-onboard-close:hover {\n  background: #bbbbbb;\n}\n\n.bn-onboard-warning {\n  color: #d43f3a;\n  padding: 1rem 0;\n}\n\n.bn-onboarding-branding {\n  margin-top: 10px;\n  font-size: 0.79em;\n}\n\n.bn-onboard-basic .bn-onboarding-branding {\n  position: absolute;\n  bottom: 15px;\n}\n.bn-onboard-basic .bn-onboarding-branding img {\n  margin-top: 5px;\n}\n\n.bn-onboard-advanced .bn-onboarding-branding {\n  text-align: center;\n}\n\n.bn-onboarding-branding img {\n  vertical-align: middle;\n}\n\n@media (max-width: 768px) {\n  .bn-onboard-basic .bn-onboard-sidebar {\n    width: 34%;\n  }\n}\n@media (max-width: 576px) {\n  .bn-onboard-basic {\n    display: inherit;\n  }\n  .bn-onboard-basic .bn-onboard-main {\n    display: block;\n    width: 100%;\n  }\n  /* Make the sidebar take the entire width of the screen */\n  .bn-onboard-basic .bn-onboard-sidebar {\n    display: block;\n    width: 100%;\n  }\n\n  .bn-onboard-basic .bn-onboarding-branding {\n    position: inherit;\n    margin-top: 20px;\n  }\n}\n\n/* Notifications */\n\n#blocknative-notifications {\n  position: fixed;\n  opacity: 0;\n  padding: 10px;\n  transition: opacity 150ms ease-in-out, transform 300ms ease-in-out;\n}\n\n::-webkit-scrollbar {\n  display: none;\n}\n\n.bn-notification {\n  background: #fff;\n  border-left: 2px solid transparent;\n  border-radius: 2px;\n  padding: 13px 10px;\n  text-align: left;\n  margin-bottom: 5px;\n  box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.1);\n  width: 320px; /* something to consider (changed from max-width) */\n  margin-left: 10px; /* keeps notification from bumping edge on mobile.*/\n  opacity: 0;\n  transition: transform 350ms ease-in-out, opacity 300ms linear;\n}\n\nul.bn-notifications {\n  list-style-type: none;\n}\n\n.bn-notification.bn-progress {\n  border-color: #ffc137;\n  border-width: 0px 0px 0px 2px;\n  border-style: solid;\n}\n.bn-notification.bn-complete {\n  border-color: #7ed321;\n  border-width: 0px 0px 0px 2px;\n  border-style: solid;\n}\n.bn-notification.bn-failed {\n  border-color: #ff3f4a;\n  border-width: 0px 0px 0px 2px;\n  border-style: solid;\n}\n\nli.bn-notification.bn-right-border {\n  border-width: 0px 2px 0px 0px;\n}\n\nli.bn-notification.bn-right-border .bn-notification-info {\n  margin: 0px 10px 0px 5px;\n}\n\n.bn-status-icon {\n  float: left;\n  width: 18px;\n  height: 18px;\n  background-image: url('https://assist.blocknative.com/images/jJu8b0B.png');\n  border-radius: 50%;\n}\n\n.bn-float-right {\n  float: right;\n}\n\n.bn-progress .bn-status-icon {\n  background-image: url('https://assist.blocknative.com/images/mqCAjXV.gif');\n  background-size: 18px 18px;\n}\n.bn-complete .bn-status-icon {\n  background-position: -54px 55px;\n}\n.bn-failed .bn-status-icon {\n  background-position: -36px 55px;\n}\n\n.bn-notification:hover .bn-status-icon {\n  background-image: url('https://assist.blocknative.com/images/jJu8b0B.png') !important;\n  background-size: 82px 36px;\n  background-position: 0px 19px !important;\n}\n.bn-notification:hover .bn-status-icon:hover {\n  background-image: url('https://assist.blocknative.com/images/jJu8b0B.png') !important;\n  background-size: 82px 36px;\n  background-position: -18px 19px !important;\n  cursor: pointer;\n}\n\n.bn-duration-hidden {\n  visibility: hidden;\n}\n\n.bn-clock {\n  width: 15px;\n  height: 16px;\n  display: inline-block;\n  background-image: url('https://assist.blocknative.com/images/jJu8b0B.png');\n  background-position: -66px 0px;\n  vertical-align: sub;\n}\n\n.bn-notification-info {\n  margin-left: 30px;\n}\n.bn-notification-meta {\n  color: #aeaeae;\n  font-size: 0.79em;\n  margin-top: 5px;\n}\n.bn-notification-meta a {\n  color: #aeaeae;\n}\n\na#bn-transaction-branding {\n  margin: 0 10px;\n  padding-top: 10px;\n  display: inline-block;\n  width: 18px;\n  height: 25px;\n  background: transparent\n    url('https://assist.blocknative.com/images/fJxOtIj.png') no-repeat center\n    left;\n  -webkit-transition: width 0.2s ease-out;\n  -moz-transition: width 0.2s ease-out;\n  -o-transition: width 0.2s ease-out;\n  transition: width 0.2s ease-out;\n}\n\na#bn-transaction-branding:hover {\n  width: 75px;\n}\n\n/* Retina Settings */\n/* http://miekd.com/articles/using-css-sprites-to-optimize-your-website-for-retina-displays/*/\n@media only screen and (-webkit-min-device-pixel-ratio: 2),\n  only screen and (min-device-pixel-ratio: 2) {\n  .bn-status-icon,\n  .bn-onboard-list-sprite,\n  .bn-onboard-close-x,\n  .bn-clock {\n    background-image: url('https://assist.blocknative.com/images/6mvOkII.png');\n    /* Translate the @2x sprite's dimensions back to 1x */\n    background-size: 82px 36px;\n  }\n  .bn-progress .bn-status-icon {\n    background-image: url('https://assist.blocknative.com/images/joHkLGC.gif');\n    background-size: 18px 18px;\n  }\n  .bn-notification:hover .bn-status-icon {\n    background-image: url('https://assist.blocknative.com/images/6mvOkII.png') !important;\n    background-size: 82px 36px;\n  }\n\n  a#bn-transaction-branding {\n    background-image: url('https://assist.blocknative.com/images/UhcCuKF.png');\n    background-size: 75px 25px;\n  }\n}\n\n/* Tooltips */\n\n.bn-status-icon {\n  position: relative;\n}\n\n.progress-tooltip {\n  position: absolute;\n  z-index: 1070;\n  display: none;\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857143;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  font-size: 12px;\n  opacity: 0;\n  filter: alpha(opacity=0);\n  bottom: 21px;\n  width: 190px;\n  -webkit-transition: opacity 0.25s ease-out 100ms;\n  -moz-transition: opacity 0.25s ease-out 100ms;\n  -o-transition: opacity 0.25s ease-out 100ms;\n  transition: opacity 0.25s ease-out 100ms;\n}\n\ndiv.progress-tooltip.bn-left {\n  left: -180;\n}\n\n.progress-tooltip-inner {\n  max-width: 200px;\n  padding: 3px 8px;\n  color: #ffffff;\n  text-align: center;\n  background-color: #000000;\n  border-radius: 4px;\n}\n\n.progress-tooltip::after {\n  bottom: 0;\n  left: 10px;\n  margin-left: -5px;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  position: absolute;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-top-color: #000;\n  border-style: solid;\n  content: '';\n}\n\ndiv.progress-tooltip.bn-left::after {\n  left: initial;\n  right: 4px;\n}\n\n.bn-status-icon:hover .progress-tooltip {\n  opacity: 1;\n  filter: alpha(opacity=1);\n  display: block;\n}\n\n/* Buttons */\n\n.bn-btn {\n  display: inline-block;\n  margin-bottom: 0;\n  font-weight: normal;\n  text-align: center;\n  vertical-align: middle;\n  -ms-touch-action: manipulation;\n  touch-action: manipulation;\n  cursor: pointer;\n  background-image: none;\n  border: 1px solid transparent;\n  white-space: nowrap;\n  padding: 6px 12px;\n  font-size: 14px;\n  line-height: 1.42857143;\n  border-radius: 4px;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.bn-btn:focus,\n.bn-btn:active:focus,\n.bn-btn.active:focus,\n.bn-btn.focus,\n.bn-btn:active.focus,\n.bn-btn.active.focus {\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px;\n}\n.bn-btn:hover,\n.bn-btn:focus,\n.bn-btn.focus {\n  color: #333333;\n  text-decoration: none;\n}\n.bn-btn:active,\n.bn-btn.active {\n  outline: 0;\n  background-image: none;\n  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n}\n.bn-btn.disabled,\n.bn-btn[disabled],\nfieldset[disabled] .bn-btn {\n  cursor: not-allowed;\n  opacity: 0.65;\n  filter: alpha(opacity=65);\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\na.bn-btn.disabled,\nfieldset[disabled] a.bn-btn {\n  pointer-events: none;\n}\n.bn-btn-default {\n  color: #333333;\n  background-color: #ffffff;\n  border-color: #cccccc;\n}\n.bn-btn-default:focus,\n.bn-btn-default.focus {\n  color: #333333;\n  background-color: #e6e6e6;\n  border-color: #8c8c8c;\n}\n.bn-btn-default:hover {\n  color: #333333;\n  background-color: #e6e6e6;\n  border-color: #adadad;\n}\n.bn-btn-default:active,\n.bn-btn-default.active,\n.open > .dropdown-toggle.bn-btn-default {\n  color: #333333;\n  background-color: #e6e6e6;\n  border-color: #adadad;\n}\n.bn-btn-default:active:hover,\n.bn-btn-default.active:hover,\n.open > .dropdown-toggle.bn-btn-default:hover,\n.bn-btn-default:active:focus,\n.bn-btn-default.active:focus,\n.open > .dropdown-toggle.bn-btn-default:focus,\n.bn-btn-default:active.focus,\n.bn-btn-default.active.focus,\n.open > .dropdown-toggle.bn-btn-default.focus {\n  color: #333333;\n  background-color: #d4d4d4;\n  border-color: #8c8c8c;\n}\n.bn-btn-default:active,\n.bn-btn-default.active,\n.open > .dropdown-toggle.bn-btn-default {\n  background-image: none;\n}\n.bn-btn-default.disabled:hover,\n.bn-btn-default[disabled]:hover,\nfieldset[disabled] .bn-btn-default:hover,\n.bn-btn-default.disabled:focus,\n.bn-btn-default[disabled]:focus,\nfieldset[disabled] .bn-btn-default:focus,\n.bn-btn-default.disabled.focus,\n.bn-btn-default[disabled].focus,\nfieldset[disabled] .bn-btn-default.focus {\n  background-color: #ffffff;\n  border-color: #cccccc;\n}\n.bn-btn-default .badge {\n  color: #ffffff;\n  background-color: #333333;\n}\n.bn-btn-primary {\n  color: #ffffff;\n  background-color: #26c6da;\n  border-color: #26c6da;\n}\n.bn-btn-primary:focus,\n.bn-btn-primary.focus {\n  color: #ffffff;\n  background-color: #26c6da;\n  border-color: #122b40;\n}\n.bn-btn-primary:hover {\n  color: #ffffff;\n  background-color: #26c6da;\n  border-color: #26c6da;\n}\n.bn-btn-primary:active,\n.bn-btn-primary.active,\n.open > .dropdown-toggle.bn-btn-primary {\n  color: #ffffff;\n  background-color: #286090;\n  border-color: #26c6da;\n}\n.bn-btn-primary:active:hover,\n.bn-btn-primary.active:hover,\n.open > .dropdown-toggle.bn-btn-primary:hover,\n.bn-btn-primary:active:focus,\n.bn-btn-primary.active:focus,\n.open > .dropdown-toggle.bn-btn-primary:focus,\n.bn-btn-primary:active.focus,\n.bn-btn-primary.active.focus,\n.open > .dropdown-toggle.bn-btn-primary.focus {\n  color: #ffffff;\n  background-color: #26c6da;\n  border-color: #122b40;\n}\n.bn-btn-primary:active,\n.bn-btn-primary.active,\n.open > .dropdown-toggle.bn-btn-primary {\n  background-image: none;\n}\n.bn-btn-primary.disabled:hover,\n.bn-btn-primary[disabled]:hover,\nfieldset[disabled] .bn-btn-primary:hover,\n.bn-btn-primary.disabled:focus,\n.bn-btn-primary[disabled]:focus,\nfieldset[disabled] .bn-btn-primary:focus,\n.bn-btn-primary.disabled.focus,\n.bn-btn-primary[disabled].focus,\nfieldset[disabled] .bn-btn-primary.focus {\n  background-color: #337ab7;\n  border-color: #2e6da4;\n}\n.bn-btn-primary .badge {\n  color: #337ab7;\n  background-color: #ffffff;\n}\n.bn-btn-success {\n  color: #ffffff;\n  background-color: #5cb85c;\n  border-color: #4cae4c;\n}\n.bn-btn-success:focus,\n.bn-btn-success.focus {\n  color: #ffffff;\n  background-color: #449d44;\n  border-color: #255625;\n}\n.bn-btn-success:hover {\n  color: #ffffff;\n  background-color: #449d44;\n  border-color: #398439;\n}\n.bn-btn-success:active,\n.bn-btn-success.active,\n.open > .dropdown-toggle.bn-btn-success {\n  color: #ffffff;\n  background-color: #449d44;\n  border-color: #398439;\n}\n.bn-btn-success:active:hover,\n.bn-btn-success.active:hover,\n.open > .dropdown-toggle.bn-btn-success:hover,\n.bn-btn-success:active:focus,\n.bn-btn-success.active:focus,\n.open > .dropdown-toggle.bn-btn-success:focus,\n.bn-btn-success:active.focus,\n.bn-btn-success.active.focus,\n.open > .dropdown-toggle.bn-btn-success.focus {\n  color: #ffffff;\n  background-color: #398439;\n  border-color: #255625;\n}\n.bn-btn-success:active,\n.bn-btn-success.active,\n.open > .dropdown-toggle.bn-btn-success {\n  background-image: none;\n}\n.bn-btn-success.disabled:hover,\n.bn-btn-success[disabled]:hover,\nfieldset[disabled] .bn-btn-success:hover,\n.bn-btn-success.disabled:focus,\n.bn-btn-success[disabled]:focus,\nfieldset[disabled] .bn-btn-success:focus,\n.bn-btn-success.disabled.focus,\n.bn-btn-success[disabled].focus,\nfieldset[disabled] .bn-btn-success.focus {\n  background-color: #5cb85c;\n  border-color: #4cae4c;\n}\n.bn-btn-success .badge {\n  color: #5cb85c;\n  background-color: #ffffff;\n}\n.bn-btn-info {\n  color: #ffffff;\n  background-color: #5bc0de;\n  border-color: #46b8da;\n}\n.bn-btn-info:focus,\n.bn-btn-info.focus {\n  color: #ffffff;\n  background-color: #31b0d5;\n  border-color: #1b6d85;\n}\n.bn-btn-info:hover {\n  color: #ffffff;\n  background-color: #31b0d5;\n  border-color: #269abc;\n}\n.bn-btn-info:active,\n.bn-btn-info.active,\n.open > .dropdown-toggle.bn-btn-info {\n  color: #ffffff;\n  background-color: #31b0d5;\n  border-color: #269abc;\n}\n.bn-btn-info:active:hover,\n.bn-btn-info.active:hover,\n.open > .dropdown-toggle.bn-btn-info:hover,\n.bn-btn-info:active:focus,\n.bn-btn-info.active:focus,\n.open > .dropdown-toggle.bn-btn-info:focus,\n.bn-btn-info:active.focus,\n.bn-btn-info.active.focus,\n.open > .dropdown-toggle.bn-btn-info.focus {\n  color: #ffffff;\n  background-color: #269abc;\n  border-color: #1b6d85;\n}\n.bn-btn-info:active,\n.bn-btn-info.active,\n.open > .dropdown-toggle.bn-btn-info {\n  background-image: none;\n}\n.bn-btn-info.disabled:hover,\n.bn-btn-info[disabled]:hover,\nfieldset[disabled] .bn-btn-info:hover,\n.bn-btn-info.disabled:focus,\n.bn-btn-info[disabled]:focus,\nfieldset[disabled] .bn-btn-info:focus,\n.bn-btn-info.disabled.focus,\n.bn-btn-info[disabled].focus,\nfieldset[disabled] .bn-btn-info.focus {\n  background-color: #5bc0de;\n  border-color: #46b8da;\n}\n.bn-btn-info .badge {\n  color: #5bc0de;\n  background-color: #ffffff;\n}\n.bn-btn-warning {\n  color: #ffffff;\n  background-color: #f0ad4e;\n  border-color: #eea236;\n}\n.bn-btn-warning:focus,\n.bn-btn-warning.focus {\n  color: #ffffff;\n  background-color: #ec971f;\n  border-color: #985f0d;\n}\n.bn-btn-warning:hover {\n  color: #ffffff;\n  background-color: #ec971f;\n  border-color: #d58512;\n}\n.bn-btn-warning:active,\n.bn-btn-warning.active,\n.open > .dropdown-toggle.bn-btn-warning {\n  color: #ffffff;\n  background-color: #ec971f;\n  border-color: #d58512;\n}\n.bn-btn-warning:active:hover,\n.bn-btn-warning.active:hover,\n.open > .dropdown-toggle.bn-btn-warning:hover,\n.bn-btn-warning:active:focus,\n.bn-btn-warning.active:focus,\n.open > .dropdown-toggle.bn-btn-warning:focus,\n.bn-btn-warning:active.focus,\n.bn-btn-warning.active.focus,\n.open > .dropdown-toggle.bn-btn-warning.focus {\n  color: #ffffff;\n  background-color: #d58512;\n  border-color: #985f0d;\n}\n.bn-btn-warning:active,\n.bn-btn-warning.active,\n.open > .dropdown-toggle.bn-btn-warning {\n  background-image: none;\n}\n.bn-btn-warning.disabled:hover,\n.bn-btn-warning[disabled]:hover,\nfieldset[disabled] .bn-btn-warning:hover,\n.bn-btn-warning.disabled:focus,\n.bn-btn-warning[disabled]:focus,\nfieldset[disabled] .bn-btn-warning:focus,\n.bn-btn-warning.disabled.focus,\n.bn-btn-warning[disabled].focus,\nfieldset[disabled] .bn-btn-warning.focus {\n  background-color: #f0ad4e;\n  border-color: #eea236;\n}\n.bn-btn-warning .badge {\n  color: #f0ad4e;\n  background-color: #ffffff;\n}\n.bn-btn-danger {\n  color: #ffffff;\n  background-color: #d9534f;\n  border-color: #d43f3a;\n}\n.bn-btn-danger:focus,\n.bn-btn-danger.focus {\n  color: #ffffff;\n  background-color: #c9302c;\n  border-color: #761c19;\n}\n.bn-btn-danger:hover {\n  color: #ffffff;\n  background-color: #c9302c;\n  border-color: #ac2925;\n}\n.bn-btn-danger:active,\n.bn-btn-danger.active,\n.open > .dropdown-toggle.bn-btn-danger {\n  color: #ffffff;\n  background-color: #c9302c;\n  border-color: #ac2925;\n}\n.bn-btn-danger:active:hover,\n.bn-btn-danger.active:hover,\n.open > .dropdown-toggle.bn-btn-danger:hover,\n.bn-btn-danger:active:focus,\n.bn-btn-danger.active:focus,\n.open > .dropdown-toggle.bn-btn-danger:focus,\n.bn-btn-danger:active.focus,\n.bn-btn-danger.active.focus,\n.open > .dropdown-toggle.bn-btn-danger.focus {\n  color: #ffffff;\n  background-color: #ac2925;\n  border-color: #761c19;\n}\n.bn-btn-danger:active,\n.bn-btn-danger.active,\n.open > .dropdown-toggle.bn-btn-danger {\n  background-image: none;\n}\n.bn-btn-danger.disabled:hover,\n.bn-btn-danger[disabled]:hover,\nfieldset[disabled] .bn-btn-danger:hover,\n.bn-btn-danger.disabled:focus,\n.bn-btn-danger[disabled]:focus,\nfieldset[disabled] .bn-btn-danger:focus,\n.bn-btn-danger.disabled.focus,\n.bn-btn-danger[disabled].focus,\nfieldset[disabled] .bn-btn-danger.focus {\n  background-color: #d9534f;\n  border-color: #d43f3a;\n}\n.bn-btn-danger .badge {\n  color: #d9534f;\n  background-color: #ffffff;\n}\n.bn-btn-link {\n  color: #337ab7;\n  font-weight: normal;\n  border-radius: 0;\n}\n.bn-btn-link,\n.bn-btn-link:active,\n.bn-btn-link.active,\n.bn-btn-link[disabled],\nfieldset[disabled] .bn-btn-link {\n  background-color: transparent;\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.bn-btn-link,\n.bn-btn-link:hover,\n.bn-btn-link:focus,\n.bn-btn-link:active {\n  border-color: transparent;\n}\n.bn-btn-link:hover,\n.bn-btn-link:focus {\n  color: #23527c;\n  text-decoration: underline;\n  background-color: transparent;\n}\n.bn-btn-link[disabled]:hover,\nfieldset[disabled] .bn-btn-link:hover,\n.bn-btn-link[disabled]:focus,\nfieldset[disabled] .bn-btn-link:focus {\n  color: #777777;\n  text-decoration: none;\n}\n.bn-btn-lg {\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n  border-radius: 6px;\n}\n.bn-btn-sm {\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\n.bn-btn-xs {\n  padding: 1px 5px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\n.bn-btn-block {\n  display: block;\n  width: 100%;\n}\n.bn-btn-block + .bn-btn-block {\n  margin-top: 5px;\n}\ninput[type='submit'].bn-btn-block,\ninput[type='reset'].bn-btn-block,\ninput[type='button'].bn-btn-block {\n  width: 100%;\n}\n\n.bn-btn-outline {\n  background-color: white;\n  color: inherit;\n  transition: all 0.5s;\n}\n\n.bn-btn-primary.bn-btn-outline {\n  color: #26c6da;\n}\n\n.bn-btn-primary.bn-btn-outline:focus {\n  color: white;\n}\n\n.bn-btn-success.bn-btn-outline {\n  color: #5cb85c;\n}\n\n.bn-btn-info.bn-btn-outline {\n  color: #5bc0de;\n}\n\n.bn-btn-warning.bn-btn-outline {\n  color: #f0ad4e;\n}\n\n.bn-btn-danger.bn-btn-outline {\n  color: #d9534f;\n}\n\n.bn-btn-primary.bn-btn-outline:hover,\n.bn-btn-success.bn-btn-outline:hover,\n.bn-btn-info.bn-btn-outline:hover,\n.bn-btn-warning.bn-btn-outline:hover,\n.bn-btn-danger.bn-btn-outline:hover {\n  color: #fff;\n}\n";

	var initialState = {
	  version: null,
	  validApiKey: 'unknown',
	  supportedNetwork: 'unknown',
	  config: null,
	  userAgent: null,
	  mobileDevice: null,
	  validBrowser: null,
	  legacyWeb3: null,
	  modernWeb3: null,
	  web3Version: null,
	  web3Instance: null,
	  currentProvider: null,
	  web3Wallet: null,
	  legacyWallet: null,
	  modernWallet: null,
	  accessToAccounts: null,
	  accountAddress: null,
	  walletLoggedIn: null,
	  walletEnabled: null,
	  walletEnableCalled: null,
	  walletEnableCanceled: null,
	  accountBalance: null,
	  minimumBalance: null,
	  correctNetwork: null,
	  userCurrentNetworkId: null,
	  socket: null,
	  pendingSocketConnection: null,
	  socketConnection: null,
	  transactionQueue: [],
	  transactionAwaitingApproval: false,
	  iframe: null,
	  iframeDocument: null,
	  iframeWindow: null,
	  connectionId: null
	};
	var state = Object.assign({}, initialState);
	function updateState(newState) {
	  state = Object.assign({}, state, newState);
	}

	function _arrayWithoutHoles(arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
	      arr2[i] = arr[i];
	    }

	    return arr2;
	  }
	}

	var arrayWithoutHoles = _arrayWithoutHoles;

	function _iterableToArray(iter) {
	  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
	}

	var iterableToArray = _iterableToArray;

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance");
	}

	var nonIterableSpread = _nonIterableSpread;

	function _toConsumableArray(arr) {
	  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
	}

	var toConsumableArray = _toConsumableArray;

	function getItem(item) {
	  var storageItem;

	  try {
	    storageItem = window.localStorage && window.localStorage.getItem(item);
	  } catch (errorObj) {
	    return 'null';
	  }

	  return storageItem;
	}
	function storeItem(item, value) {
	  try {
	    window.localStorage && window.localStorage.setItem(item, value);
	  } catch (errorObj) {
	    return 'null';
	  }

	  return 'success';
	}
	function removeItem(item) {
	  try {
	    window.localStorage && window.localStorage.removeItem(item);
	  } catch (errorObj) {
	    return 'null';
	  }

	  return 'success';
	}
	function storeTransactionQueue() {
	  var transactionQueue = state.transactionQueue;

	  if (transactionQueue.length > 0) {
	    var pendingTransactions = transactionQueue.filter(function (txObj) {
	      return txObj.transaction.status === 'approved' || txObj.transaction.status === 'pending';
	    });
	    storeItem('transactionQueue', JSON.stringify(pendingTransactions));
	  }
	}
	function getTransactionQueueFromStorage() {
	  var transactionQueue = getItem('transactionQueue');

	  if (transactionQueue) {
	    var parsedQueue = JSON.parse(transactionQueue);
	    var filteredQueue = parsedQueue.filter(function (txObj) {
	      return Date.now() - txObj.transaction.startTime < 150000;
	    });
	    updateState({
	      transactionQueue: [].concat(toConsumableArray(filteredQueue), toConsumableArray(state.transactionQueue))
	    });
	    removeItem('transactionQueue');
	  }
	}

	var rngBrowser = createCommonjsModule(function (module) {
	// Unique ID creation requires a high quality random # generator.  In the
	// browser this is a little complicated due to unknown quality of Math.random()
	// and inconsistent support for the `crypto` API.  We do the best we can via
	// feature-detection

	// getRandomValues needs to be invoked in a context where "this" is a Crypto
	// implementation. Also, find the complete implementation of crypto on IE11.
	var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
	                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

	if (getRandomValues) {
	  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
	  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

	  module.exports = function whatwgRNG() {
	    getRandomValues(rnds8);
	    return rnds8;
	  };
	} else {
	  // Math.random()-based (RNG)
	  //
	  // If all else fails, use Math.random().  It's fast, but is of unspecified
	  // quality.
	  var rnds = new Array(16);

	  module.exports = function mathRNG() {
	    for (var i = 0, r; i < 16; i++) {
	      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
	      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
	    }

	    return rnds;
	  };
	}
	});

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */
	var byteToHex = [];
	for (var i$3 = 0; i$3 < 256; ++i$3) {
	  byteToHex[i$3] = (i$3 + 0x100).toString(16).substr(1);
	}

	function bytesToUuid(buf, offset) {
	  var i = offset || 0;
	  var bth = byteToHex;
	  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
	  return ([bth[buf[i++]], bth[buf[i++]], 
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]],
		bth[buf[i++]], bth[buf[i++]],
		bth[buf[i++]], bth[buf[i++]]]).join('');
	}

	var bytesToUuid_1 = bytesToUuid;

	function v4(options, buf, offset) {
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options === 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || rngBrowser)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ++ii) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || bytesToUuid_1(rnds);
	}

	var v4_1 = v4;

	function formatTime(number) {
	  var time = new Date(number);
	  return time.toLocaleString('en-US', {
	    hour: 'numeric',
	    minute: 'numeric',
	    hour12: true
	  });
	}
	function timeString(time) {
	  var seconds = Math.floor(time / 1000);
	  return seconds >= 60 ? "".concat(Math.floor(seconds / 60), " min") : "".concat(seconds, " sec");
	}
	function capitalize(str) {
	  var first = str.slice(0, 1);
	  var rest = str.slice(1);
	  return "".concat(first.toUpperCase()).concat(rest);
	}
	function formatNumber(num) {
	  var numString = String(num);

	  if (numString.includes('+')) {
	    var exponent = numString.split('+')[1];
	    var precision = Number(exponent) + 1;
	    return num.toPrecision(precision);
	  }

	  return num;
	}

	function last(arr) {
	  return toConsumableArray(arr).reverse()[0];
	}

	function takeLast(arr) {
	  // mutates original array
	  return arr.splice(arr.length - 1, 1)[0];
	}

	function first(arr) {
	  return arr[0];
	}

	function takeFirst(arr) {
	  // mutates original arr
	  return arr.splice(0, 1)[0];
	}

	function createTransactionId() {
	  return v4_1();
	}
	function separateArgs(allArgs, argsLength) {
	  var allArgsCopy = toConsumableArray(allArgs);

	  var args = argsLength ? allArgsCopy.splice(0, argsLength) : [];
	  var inlineCustomMsgs = _typeof_1(last(allArgsCopy)) === 'object' && last(allArgsCopy).messages && takeLast(allArgsCopy).messages;
	  var callback = typeof last(allArgsCopy) === 'function' && takeLast(allArgsCopy);
	  var txObject = _typeof_1(first(allArgsCopy)) === 'object' && first(allArgsCopy) !== null ? takeFirst(allArgsCopy) : {};
	  var defaultBlock = first(allArgsCopy);
	  return {
	    callback: callback,
	    args: args,
	    txObject: txObject,
	    defaultBlock: defaultBlock,
	    inlineCustomMsgs: inlineCustomMsgs
	  };
	}
	function argsEqual(args1, args2) {
	  return JSON.stringify(args1) === JSON.stringify(args2);
	}
	function getOverloadedMethodKeys(inputs) {
	  return inputs.map(function (input) {
	    return input.type;
	  }).join(',');
	}
	function assistLog(log) {
	  console.log('Assist:', log); // eslint-disable-line no-console
	}
	function extractMessageFromError(message) {
	  var str = message.split('"message":')[1];
	  return str.split('"')[1];
	}
	function eventCodeToType(eventCode) {
	  switch (eventCode) {
	    case 'txRequest':
	    case 'txPending':
	    case 'txSent':
	    case 'txSpeedUp':
	    case 'txCancel':
	      return 'progress';

	    case 'txSendFail':
	    case 'txStall':
	    case 'txFailed':
	    case 'nsfFail':
	    case 'txRepeat':
	    case 'txAwaitingApproval':
	    case 'txConfirmReminder':
	      return 'failed';

	    case 'txConfirmed':
	    case 'txConfirmedClient':
	      return 'complete';

	    default:
	      return undefined;
	  }
	}
	function eventCodeToStep(eventCode) {
	  switch (eventCode) {
	    case 'mobileBlocked':
	      return 'mobile';

	    case 'browserFail':
	      return 'browser';

	    case 'welcomeUser':
	      return 0;

	    case 'walletFail':
	      return 1;

	    case 'walletLogin':
	    case 'walletLoginEnable':
	      return 2;

	    case 'walletEnable':
	      return 3;

	    case 'networkFail':
	    case 'contractQueryFail':
	      return 4;

	    case 'nsfFail':
	      return 5;

	    case 'newOnboardComplete':
	      return 6;

	    default:
	      return undefined;
	  }
	}
	function networkName(id) {
	  switch (Number(id)) {
	    case 1:
	      return 'main';

	    case 3:
	      return 'ropsten';

	    case 4:
	      return 'rinkeby';

	    case 42:
	      return 'kovan';

	    case 'localhost':
	      return 'localhost';

	    default:
	      return 'local';
	  }
	}
	var timeouts = {
	  checkSocketConnection: 250,
	  waitForResponse: 100,
	  txConfirmReminder: 20000,
	  txStall: 30000,
	  changeUI: 305,
	  localhostNetworkCheck: 300,
	  removeElement: 300,
	  endOfEventQueue: 0,
	  hideElement: 200,
	  showElement: 120,
	  autoRemoveNotification: 4000,
	  pollForReceipt: 1000
	};
	function stepToImageKey(step) {
	  switch (step) {
	    case 0:
	      return 'welcome';

	    case 6:
	      return 'complete';

	    default:
	      return null;
	  }
	}
	function handleError() {
	  var handlers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  return function (errorObj) {
	    var callback = handlers.callback,
	        reject = handlers.reject,
	        resolve = handlers.resolve;

	    if (callback) {
	      callback(errorObj);
	      resolve();
	      return;
	    }

	    reject(errorObj);
	  };
	}
	function handleWeb3Error(errorObj) {
	  var message = errorObj.message;
	  handleEvent({
	    eventCode: 'errorLog',
	    categoryCode: 'web3',
	    reason: message || errorObj
	  });
	}

	/* babel-plugin-inline-import '../../../lib/images/XUPOg7L.jpg' */
	var welcome = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/s8euD9T.jpg' */
	var welcome2x = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/EgcXT0z.jpg' */
	var browser = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/4zplgXa.jpg' */
	var browser2x = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/tKkRH5L.jpg' */
	var metamask = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/BEhzPx6.jpg' */
	var metamask2x = "data:image/jpeg;base64,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AADyEgAgAAAAA99LPxr7wAiAAAAACQkAIAAAAAEgIAAAAAF2nCAAgAAAJADV6xgAAAAAX9n58ri0AAAAAACzVhAAAAAAAAAAAAAAAAAAAAAAAAAeux5nnZwAAAAAACfqupz/AJnMAAAAAAAXfd8ro/LcsAAAAAAAb8l9NQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALJAFQAAAAABpsAIxgAAAAAHY0EV+vZHAAAAAAAOlcARyAAAAAAAAAAAAAAAv8AUEe4Z4AAAAAAEkwlEAAAAAAAAAAAAAAAAAAAAAAAAAAH/8QAMBAAAQMDAwMEAgEEAgMAAAAAAQACAwQFEhEUMQYTFRAwNVAgQGAHITIzIkEWJUL/2gAIAQEAAQgAulzqK6okJ/kVrulTQVMbm+1FECMnYtWLVi1YtWLVi1YtWLVi1YtWLVi1YtWLVi1YtWLVi1YtWLVi1PiaR/b+CTSthidI7yNTlqoJmzxB4llLTi1kzgQHkgAky3KYvPbpKrcMOqb/AIt9I6iCWHvRxSxzRtkjyaXFqmmigjdLLLPDCwPlT3NY1z3AggEe0ZYxI2Mtlje57GqT/N3pNJ2opJFE/uRRyfwGrhM0D2N7codiqOF0MIa6ZhDswxpeQA9ubHNMlPNE7F1up3xNe96b/iPSia5tLTUQZLKynomFshhfUTTPlEjamA1GckJgfPV6VeQ75xqGG2ySmR7Kj2q6KScxRMoGPiiML1J/m70rYKntVL1RwVIjp3n+Et/xH68n+bvRzWva5rmtDWhrfv8AbrbrbrbrbrbrbrbrbrboDQAfruhycStutututututututututututututututututututututututututututututututututututututututututututututututututututututututututututututututututv8AoF5WTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZOWTlk5ZlB5QOvpJIyJuT/XUagetRfrRTSGOWmq6arj7lP7E9UZJTTwCRhOg9C9jTod0YJiyb0q5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";

	/* babel-plugin-inline-import '../../../lib/images/HuDHbXP.jpg' */
	var login = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/XLBqwPO.jpg' */
	var login2x = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/0VBtqGV.jpg' */
	var connect = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/t7WS9Sc.jpg' */
	var connect2x = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/1TWEHRY.jpg' */
	var network = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/jfdXqIU.jpg' */
	var network2x = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/8ptZott.jpg' */
	var complete = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/elR9xQ8.jpg' */
	var complete2x = "data:image/jpeg;base64,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XeVHrKPdOqW+bMfdp/KCQkEkgAbyYQtC07SFBQzBrqtXvnaHrTvvGPg++lf7H6u6LWhtClrUEpSKkncAI0htwWgsMMVEug1rxnOJWWcmphqXaFVuKAEMMoYZaZR/C2gJHoHVLuGqGsNPUmnXeVHrKPdOqW+bMfdp/KNNLTmX7UdktshhjZARxEitTGjtpzMhactdLN266lDjfiUFGmq1e+doetO+8Y+D76V/sfq7ppMlZsaZ2DuKCeY2tWjNksy0q3OE7bzyKg8KT1U7hqhrDT1Jp13lR6yj3TqlvmzH3afyjSPRRNrOial3UtTFAFbX8K4sLQsyU03NTzzbi2zVCEVKa5knVavfO0PWnfeMaJWw1Zjs0HmyW3ruqhvTs1iWmpeaaDrDqVoPjHc9KZtDFlraJG2+QlI5A1J1WW0WbOk21b0sor6adVO4aoaw09Sadd5Ueso906packxLsAzTOGnyxlHZsn9qZ9sR2bJ/amfbEdmyf2pn2xFpkKtKfIIIMy6R7RiT/wD0/pEpOzUm6HZd1SFctx9IiR0vYWAmdaKFcaBVMNWvZboqieZ/qoJP4GOzpL7Wz7Yjs6S+1M+2I7OkvtTPtiOzpL7Uz7Yjs6S+1M+2I7OkvtTPtiF2nZzYqudYH/2IntLJFkESwL6/ZTE7PTM8+Xphe0o7h4kjIRYFlqtCdSVJNw0Qpw/p6rdw1Q1hp6k0js1dpWS+w1iii2xmUwpKkKUlSSlQNCCKEEdLRfR1r9lOGfYBVMqCgDvSkbotLROaYKnJM3zfBuWIcbcaUUOIUhQ3hQoe4gFRAAJJ3ARZmi87NlK5gFhnn/GfQIlJSXk2EsMICUJ/EnM9Vu4aoaw09S2ho/ZNorvJiVBc40kpVHxJsPge9uPiTYfA97cfEmw+B724+JNh8D3txJaL2LJOB1uV23BuU4Sumt+VlphOy+w24MlpBhzRqxVmvYlDyUoR8VbG+pX7Zj4q2P8AVL9sx8VbH+qX7Zj4q2P9Uv2zHxVsf6pftmPirY/1S/bMI0YsVJ+bFXpWqJeQkpXAlm2zmlIr+PVruGqGsNPnG7hqhrDT5xu4aoaw0+cbuGqGsNPnG7hqhrDT5xu4aoaw0+cbuGqGsNPnG7hqhrDT5xu4aob7Sdk7waEecbnbTsjee0BFoBIcBAAipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzipzizwC4SQDH//xAAcEQACAQUBAAAAAAAAAAAAAAABUBEgMGBwgJD/2gAIAQIBAT8A8DDk8so2EWRsBUWRZGsc6f/EACIRAQACAQMEAwEAAAAAAAAAAAEAAhESMVADECBRITJBgP/aAAgBAwEBPwD+2gXkCuTtT9lt2AsTDxo4lkYD2LARc8YCxqw3IGZavbQxMcWKRsyp8ystvP2a2LnjaHx2s7vH1MsqdrbTD640MsrWHbTNLNLGvF0+bnnaW3eK6f3PO0vvxXT+552i5eK6f3POzHiun9zydmX24scMLemapqmqao29yzl43L7mX3MvuZff8Jf/2Q==";

	/* babel-plugin-inline-import '../../../lib/images/fJxOtIj.png' */
	var blockNativeLogo = "data:image/png;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/UhcCuKF.png' */
	var blockNativeLogo2x = "data:image/png;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/bn-branding-white.png' */
	var blockNativeLogoLight = "data:image/png;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/bn-branding-white@2x.png' */
	var blockNativeLogoLight2x = "data:image/png;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/EcUxQVJ.jpg' */
	var mobile = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/GS6owd9.jpg' */
	var mobile2x = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/mobile-not-supported-white.png' */
	var mobileLight = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAABGCAQAAAAUCR7MAAACwklEQVR42u2YS0hUURiA/0xbaJkbsYIEcxdRixYRvcCayhYRiBKtolxEZNFCcmFtEsQgKRcuelCBJEWa2NOswF4UkSRC08K0SNGy6KVD5ONr4Zkz93ofc71zWwTz/5v/nP+eb87rP/85IyIiLOECYSbxK71cYaVEhWJGSFzGOCyqd78IRiZYKyJcJDh5LCKEVaGfaqp86hvFiJAqeimqxbewV/cxTwwz8Me3jmtKvhCs/FfAZ9T41tt2wKoEVnl3EpgExj5MI0QdbXQzRJgHnGUH6T6BzKea7zaxEOEMC2cMpJQvLgE2SiUpnoGkUu8haluZ5wnIbG6YGk7Syz3OcY2XTJg8ncz1AjxpaPKDU+QbhpbNAQYN/uvMigOkyNSHzyyzrGgG5w1fHHEFMod302bKBilCpfb/JNsNeNBm8u2RseR72g3Ypexxw5FpP/BMhpX3G2kOQPK03UQqV+Mgy7U35ATcr+0CkXhIcrWv1gl4QtsZaoO7I98qT7MTsEFZg4aYcUHSruqfOwFvKuu1oZELkmZVG3YCRjfsgKkfjkheqboOJ+BxvWkyvSD14dboBNyl7ZJp02+DZLUuH3UCZjGm7DbLrrMgadSlFc6Rcl+XNsZBDusf73MLvUJd+siCOMiolLkfXw8Nx+ciD8ge0tyByxnVNQNss0E+Mt37C+Of2CWmB1AHe8gRESGFxezkqal/Fd6SVLnlTTXCe35bZq/ecxqlyDBwexnn0Mzy8lLuuOBesMbHVYQCWohYXnTtFCdwWSKd7ZRTSwN1VFBCVvJ+mAT+U+AQnb71Q/K9rA7zW761a4arzCoq2RLYtmGzuv3vCwoYvf4+CQp4TH1xKShgOpf5yl1r6rcH9us8sZVNvjREq05dGUJLgLuweyoVTQYGLJ2agZqAcE3GP037EoR9omzqIRmD5rCODb50Pbkxzl9D0p5VIenIxAAAAABJRU5ErkJggg==";

	/* babel-plugin-inline-import '../../../lib/images/mobile-not-supported-white@2x.png' */
	var mobileLight2x = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAACMCAQAAABB5OZyAAAFkUlEQVR42u3cfUxVZRzA8XORAiwiI2gVtlzlqCjKTOeAyYDVDBVaL1K05ezFfKmVm1YusmbkWrY2V6M5EpSRxYya5sr1hy+FG4mZ6bSWaC8QQWaREkNevv1ByOU+zz33ec45956zdZ7nn7vn3HPuZ+fe+zzn+f2ecwyMoJpJBU20MUDsy0kO8hYFYzwGxujLDOoYwv3STI4MmEcXXikDLAsF5tGHt0pFMDDDQ2dvpAxRMgqsw4vlZxKHgZme+GvIylPDwAq8WpqGgU2eBQ6SgmHQJmxYRzqJMa4XUCYhZmEYklEjPbQ3j1H9WpAUYhgSd6JLwF2C5E45sMelOqgK9E7xgT7QB/pAd4BXkOpKbVIFen6o84E+0Af6QB/oA32gD3QQOIFillPN5zRzhO/Zzy428xJlTHIbmMkrtEim26PlBOspIBB74DgeolkjFFnBxbEDBpjPMe2L925eJTkWwGz2Wp5htDMv2sDF9NucBtWbHN0mMJ4qhxI1l0cDmMpOxyaT7Ux1Gng1rY7Od/9hrpPAC/nW9ON62cNayrmDqdzGbB5jFY2cMd2nh1ucAgb42OSDdjKfi6RfWCKzqabXpHe8zBlgpQkuJ2LnO5GasGNNEwn2gfNMzl4D8UpDWFbYUWeDXWAap0x/SR8oEhPD5gPvsgesifh/VCUarJDmBFuDPk0bmK2UZmxQJr4g3X+FdWCDYq+mfhbfl+z9G0nWgJNNr/SsncUkSboLllgDrpFs+dM2cYZk3wNWgHH8IrR3cCX7bRMbJfvepA/MDZMBn2CbmCnJr67WB64SWs8w/r9JUotN4lZhv736wN1Ca13QPM4ecYGwVz/JesCA5Fpk7pipph1iuqR/yNMDZkhaLw2ZDdshivOaR/WAhULbccmE3TrxXWGP1/WADwhtO6QxBavE1cL7a/WAjwttm8OEPawRFwnv/lAPuExoqwobmbFCvFv6DWkAl0rms4aDRHGNzDY94MOSy3vDQaL4Fb+nBywV2r6LEILTI74svOsdPeDNQtvpCEE0PeIn0stWDWCS5Fp6esRApjqxU3hHie5YLAbYKhVirWrEKZLt1+oCxb7+sFI4WIX4hrCtTf9qplzSnu0IMYEOYcsmfWCaJBK4XTGobk58UtJeZmVOsk2yJd82cQu/SsLDSVaA90q2fMU420SxVFub1cVzQrLtTeXsiSpxiCyrE/eF0gMucJj4kfXIQgLHJVv7KHKQOBDUN1gIHhVLD3qWJxwjrrMbH9wS5sBvK07TzYntpNgFpnA0zMGPjNwOEKFOD5tb6WWaEyHg60yCmF9SQJxpbLXW5O6ecqei/EWm+aVOqpkTkiwcTy7P8Y3pr2+Nk3mSpUq5j2N8wQ720apwT9RWyZm3lWlayFkHEzkbQ+L7juTqZnLSEdwgy6OV7ZzEYdu8boqjmY5NZqMt3j5uiH7GfabF83iKRaZdkoNrFuK4n4NauC6eD5PRi9qqjwD5bOBvhYuBz3jwXKIh5utmEimkkj38Lkm3HqCK+0Kiii6uPLqEKeQzh1IKmcZE5bUy/tIoH+gDfaAP9IE+0Af+D4G1VLtSO1SB3ik+0Af6QB/oDvBplrhSf4j+UBfgPO+OxZls5y/6aKHUi8CcMWvOV3oNGB/y++k/lyD0CDBbOMaz3gLeIxxjvbeA1wvHeMZbwLiQlGGP9k1/Uf8X3xgUZR1QTnrHtB9Mp4pD/EQjtzvbD3YLzbmuTJkS+EOQzMAwJPngTqp4LcZ1LYck3+VVGAb1nr2W6SIOQ74+xhulevjZbwn86EneELeOPH+w3JPATcGPmKzxHO/oyHqQYeD5kjsU3CytXBP6FNE4Km3fmutU+ZRU2XNYDSZTz2lXaYPsZla4B8WO5C+LeISVvBjjWsFiSkgTRxgDj9d/AV6haHL/3v0fAAAAAElFTkSuQmCC";

	/* babel-plugin-inline-import '../../../lib/images/riXzN0X.jpg' */
	var browserFail = "data:image/jpeg;base64,/9j/2wBDAAEBAQEBAQEBAQEDAwEDAwUEAwMDAwYFBQQFBwYIBwcGBwcICQsKCAgLCAcHCg0KCwsMDAwMCAkNDg0MDgsMDAz/2wBDAQMDAwMDAwYEBAYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCABGAFkDAREAAhEBAxEB/8QAHQABAAEEAwEAAAAAAAAAAAAAAAoHCAkLAQQGBf/EAEgQAAAEBAMCBgsPAwUAAAAAAAECAwQABQYIBwkREiEKExlXldQUFhgaMUFWWJSW0iIjJjg5UVVzdpektLXR0xUykxc0QmFi/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKR3C3C3d5vF3a9BUEu7fN3ztwWmaZI+Ig2bNkiHU1HjDET4zikxOdQw6mEBAN2yUA9IGRLmiiIgFuSWoeH4Ryvd+IgAZEuaIImALc0tQ8Pwjle78RAAyJc0QRMAW5JahuH4SSvd+IgOeQjzRvNxS9Y5X1iAchHmjebil6xyvrEA5CPNG83FL1jlfWIByEeaN5uKXrHK+sQDkI80bzcUvWOV9YgHIR5o3m4pescr6xAUrkVS305PdylOsp32TI64TSReOZMMwScM5kzOcfcKgic6Zim2Dl1/vKIahsiADAS8OWkwC8iJh/lJARWMjJ8yl2Z5bs7mD4iLQqU11UUOBSl1ljkA3ju8MBmyyzsvy8G2S+rFDHDG7H+WKUE4bvE3T5KeEcKT5RUfelTpCOpdk3vgipoIGKBQAQERAOMsHL6vCtfvLxgxhxvuBlnaW7ZO0F3yM8K5PO11TAKTgyZh1DZHVTVTQwDoUAEDGEA+jlPWC3a2mXi4uYw4/wCN8rPQTpo4RcKIz8rk09XOoUxFzEEdS7OhjbSmhwE2yACBjCASUO3ii/K9l6Wn+8A7eKL8r2Xpaf7wDt4ovyvZelp/vAO3ii/K9l6Wn+8A7eKL8r2Xpaf7wDt4ovyvZelp/vAQcOEazSWTa/elXUqmKSzYKPZF20lAOGvZLrdqEBRaAxyW6294n3T4vUtgZg3KUnOIkxBYWqKzgiJDAkidY+pziABoRMw7x36aQGTbkA8zDmrlnT7T24ByAeZhzVyzp9p7cA5APMw5q5Z0+09uAcgHmYc1cs6fae3AOQDzMOauWdPtPbgHIB5mHNXLOn2ntwDkA8zDmrlnT7T24ByAeZhzVyzp9p7cA5APMw5q5Z0+09uAx4XUWmY12Z4kssJsepCg0rVVim9Ik3dprlFE5zkKbaIIhrtJn3QF+kB0MiP5Ua3H6qa/pbmA2F8AgEBwIgACIjugIad4/CCMf6bu/nEvthmcuUtwkj0Gwt1maaoTsEzaLKmWEBOQhjAYExTEvuQKYdREQgJZ+AWN1C3IYNYc45YbP+NoycsiOUBEQ2kxHcdI+ngOQ4GIYPEYohAVegEAgIK3CRfj/Un9jWP5l1AUIgOhkR/KjW4/VTX9LcwGwvgEAgMHeepfb3KlsK+EtCzni8bKvTVaNxTNodmx00cuN28oiBgSIO4dTmMA6pjARYrIspC5K/fCarcY8HayptpTEvmakvVSnD1yksdYiKawiUEkFC7OysQAETBv13aBrAZM+Dr329oeIM7slxFnOzSc7UO7pw6ptyD4C6qtwEfACpC7RQ8G2QQABFSAmXQCAQEFbhIvx/qT+xrH8y6gKEQHQyI/lRrcfqpr+luYDYXwCA8xW1Z0xhzR1VV/W05TaUfLWirt66VHQqKKZBOc4/8AQFARgNaNftd3VF7tz2ImO0+4xOSLKdjydmobXsNgmIgil8wG0ETm03Cc5x8cBnwyIbr8BcDLMLq6WxVxukUmqcJqu8ZM5pNkGyzkDMSFAUiKGAyg7SWmhQEddA8IhARY6YqWf0XUlP1hSk2Ua1QxcpuWblE2ydFZMwHIco+IwGABAfnCA2U+XVeRIL5bWaCxpZHTJWQF7DnzRMf9s/TKHGgAeIpgEqhf/ChQHeAwF8sAgIK3CRfj/Un9jWP5l1AUIgOhkR/KjW4/VTX9LcwGwvgEBF24SDeZPKGomgbLqOUVRXnzcs0njgNQA7MixiItwHxgZZI5jeMASIG8DCEBDggJOWXJmN5c+AGXPXOBGO9D8Zimp2d/UZd/SDL9sPGmMKPvwFEhNkhiJ++GLs7G0XXWAjGwGbbImvMnltl4lNYSzBRVXC+tnCMrdNy6jxTwxtlo4KHzgc4pm8WwoYR12QgJ+UAgIK3CRfj/AFJ/Y1j+ZdQFCIDwuTNXlE4SZk2AdWYp1ezlFKtgmSbh7M3JG6CJzy5wmUDqHECl1OYpQ1ENREA8IwE7fu4rKvO/on1rYfywDu4rKvO/on1rYfywFptzaWT5eOFNmuQxdoCcO2AGK0XGs0GyyRTCAiQFUHKZxKIhrsiIhrv03wFo/cI8Hc+naJ+89x1+Adwjwdz6don7z3HX4B3CPB3Pp2ifvPcdfgKu4H4DZFFuWIclxXwgrSgGmIDMRM0duK8K8FAwgIbZCuHahSm0EdDAGoeIYDIb3cVlXnf0T61sP5YB3cVlXnf0T61sP5YCFzn/AOLGF+MN8khqTCbEWWzqnEaVZt1HcqfJOkSqgu4OKfGJiJdoCnIOmv8AygPndplWeTjj/EMBlgv14O/N8YMYaqxhtKxIlMsbTZyd0+ks6BZJBuscdo5kFUU1BAhjCI8WJNCiI6G00KULCu9qL6udeg+lJh1KAd7UX1c69B9KTDqUA72ovq516D6UmHUoB3tRfVzr0H0pMOpQDvai+rnXoPpSYdSgHe1F9XOvQfSkw6lAO9qL6udeg+lJh1KAd7UX1c69B9KTDqUA72ovq516D6UmHUoC6i07g2NaSPE6QVXd3itJnWHrNYixpTIDuFRf7JteKVVWSS4tMdPdbJTGENQAS/3AErj/AE+oLyIl/oafswH/2Q==";

	/* babel-plugin-inline-import '../../../lib/images/xpWtOVX.jpg' */
	var browserFail2x = "data:image/jpeg;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/browser-not-supported-white.png' */
	var browserFailLight = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFkAAABGCAQAAAANgvBqAAAAAXNSR0IArs4c6QAAAwpJREFUeNrt2kFIFFEYwPFvVw1ljSxEWyESBNdL2UGSwEDyEBZ0Em8aeDHsknRYAg+5oJSCYl3rJHXRgwV12AgNQTwKJnkQ9qIWaglimsr677Cz48zuzCamM29kv3f63vdWfuCbb2bfrIiIiFBEL7P8Rs34xSQP8MtBcJtF1I9JKg7AXolVShNbYhHvxJiI0Iu34pYwa0j3WFFwrJrIg2LoEntcFiWD+6atYUhW9CUBck0fOWtqMMI5h8lXDcpPaWTKiBJni+f4REQIMQ1s8Fj7+HXmgFVa1CFH9bxDBB9zen5PhEK+a1mcGiXIBIjreVSESkP9tQgNhvypGuRctvR8RIRSQ31AhBpD3qnKxujT//E3RUR4q+VbhETw8yW5mhJVyH46iDKSAItwhid85g1XtLyQXsZ5Rbkyl5+SfdmWvM4NRUerHdkbkSVnyaeSvMOYomP8FPXlLDlLPlkyPiLEiBFJfLPxArlf/5v9niBTbfhmE+eaF8gTptY/oTyZprT7VZPSZPKJpZFj5KtM7rJ8LuhSlkwZm5bkTcpUJQ/bPn8NK0mmln1b8j61ypHxMZ3xOXf66HfCkyK3moBV2myVYa5VKTIBlkzkAm2+wDC3REAlck/KNtAOvygxzfYoQ6ac7RSy9rqLCtPs9tGOxU6CPJp2sVXrj0jmGFWCTL1Ff6jTanVplXrXyfiZsSA3atXGtMqM+b2LG+R2yy7crFWbLWrtrpIpSnkrl4w2rd5mUVuhyE3yoM29bkirD1lWB1wjE2L3SIdUu4TcIn+0Ie0QJkiQMDs2Kz64QrboBskI62vCtmsaHSeTx7wtJ6ivCtqumSfPaXJnhr16GDI8cpRMMesZMIfZGLBOsZPklxk7wr8vv0S8cJL881hO5NecJMeOhRxzktx9LORuJ8k+Iiz8F3fh8Ee52SPxLPm0ko2/k7ukKLnFQH4nfDU9xy4rOH6k/hrxmcfeYTcI51OOptSO94mdcscz4DUuJrf3XZY9AJ6i0nhNXqCPb/xRFLvBFA/JsW4nOSoOs/EvMVx4Qg6/HRwAAAAASUVORK5CYII=";

	/* babel-plugin-inline-import '../../../lib/images/browser-not-supported-white@2x.png' */
	var browserFailLight2x = "data:image/png;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/XAwAAmL.png' */
	var chromeLogo = "data:image/png;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/maxXVIH.png' */
	var chromeLogo2x = "data:image/png;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/WjOSJTh.png' */
	var firefoxLogo = "data:image/png;base64,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";

	/* babel-plugin-inline-import '../../../lib/images/kodZvyO.png' */
	var firefoxLogo2x = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ4AAACeCAYAAADDhbN7AABIRklEQVR4XuzVwWpUVxzA4e+cOzczGWMcwhRiQhuQYEvpRgIGoUiWoS3dNFLIC/gAmoULbVeCGxdFQXwBBV/Ch3DXjRuRZJKIBNRkZu7ffSAbjSHK+Z7hBz+nWxEDc/G/tm9MdmoVsW0eT0zrlfBORBGhJTwy5arspxLeySgGbpr0hzFYL+GdhLLYZXV920GffWR/x5bFEt4XU0ToCg/V8115mSbRdk5yp4T35RTbbuhaMrxImid/zwfU1mPg9xLesStix8+yDQcz5Dk0VEtEDZXsv9gyW8I7NkWEZOSutrNiETXGpD7VJYZouyB7EKEq4R2PYmBV258+1OQFNIAR1S/kH3iPjr9sulXC+2xFhAnJv7IkzZKm0QAg0fqV1GMfHf/ElmslvM9TbFrTdtk+8gIyAKBBl9YKzSShpfY4Nl0p4X2SIkJbsiGgJp1H4zDGpO+oVxhNkPXUnsbAj75CyWEFcC/OmtIzHvblekaMZ+RqWtVMkTuSSkYSojlQeaeKPbl6o7Ir29HYteet62noCPHamjOe2Ueapf4N4WgtmpeMntMZcuCFsJr6XpXwvib3P7b3JuCaVNXZ9r12Vb3vmXo6PTdDNw10M4oyiQ3IEKMgQXFAjSMaxcQofhpjNMaBGDUavySamMQkn8Nv/IySGA1qFBwYFJFZkXlsoGnoPj2e6R2q9vr5ztl17bpq13nrdNMgKHVdi732rjpwcV339ay19tpvlfbT6qxEsoNJokNRezDGrMawHGMWIAwRx4YIpkwA40YJ5wDYDMS2ELsTI5sweh/C7RhzEyI30RffyfNls4LhIX7AICfTYrp6jY4GUoAa+NZPw9ffgTY/pc0LZAUj1F8oiIA+Bd7jaR96cAAGDkHkeIx5xOQIRPal0ewjjjw8KEhu4sASMLmfm4KZMufnICpEApGB2Hg400lAN0Hjlpct+spdX1372tdiiFEgPg3M3kBG/RWDboDuJdA/AS1+yCgvkf3Y3hO6r/Au+vhXeRHb+RVeMb8J13t3LsR2TiCKn0/KSRg5gOZAhACSAgpZB1QcXM7Eyxji5u5y0HlD8zXvqwWbQhcPpgCRLMHES05YfMNJxDlnTTDzAcvsrhRkL0ieB61LoG/bqQj/VzfzclnMaCV0X+X5NPgLunwfuOE3oriYeNYZ60bXnXkqj9d17oMD/NHG0x+xz5O2fk6UfIO4cS4mWotoRHcCshZYB54UgRJneINgHqyFSuj9oqkyVzbygsH/8JzJXKA/yO/q4VsI8enQXgl9nD4F3yaGAui+RgPDBxikSYOzfyOq2rF1Zz09jvq+FQlH8Bhfc8+768DG29Z/QPq716B8h7h5Dkb2wnamw5ymXsHAA0ZpLJMlxcU6tXNGmANiFEg4fs5PWdl/n+dMFuxmAMpA+iE+FdrPgH7zO5gp5ZtTevBUGjyTNhDxOr2QRb/W4G155ulzwXwhiaIFCv08RteS37/1+Pl/cNuXbKbXECXnI9HBaAppC9QCVaGSAL5A+aoyYfFjvXkYvS+cueB/Sso5n92/MlDAHAWd58DA0JkYvqJbmOuTKl5Nw/kD7EXCH/xag9eQwfMGTHwENkPE7MUevla84brnLPu9m75lrV5K1Hy1hbk2baGaedh6AFUJo0hvyGCWaqcVJjSj7Zw893JQ/CVz2PVCU0EV1PmkIPtC+/nQv88ZwNd0K/P0MwwhnEoGGCADYs7Ti9n31xK8nUf97iJE/rCllgywsucOM+7/qquPX/na6y80Gl8kUXyGopFOAaeohNCEilcNH5RVbqaiglqrVsaYtX23c0D/3Z4zBGQA0F0GrjrvG4LOb8HA058H8lXWcgbC8qLU0MciIj74awfepmPOXpYl9m8jMctSlC4KsEaf+9xBHsV18EsuPXDNq676PEZ+JFHyO6pWbNZGAUVQEdTBUq143g+BEg9I7gi9rhCwUO1KlW7MMUPXkkRd/BUBzXrYPHA1lwUE2kdD49TncWD/5+hz4BtnKdDkNXo5J/9agReZ5G/7o+RVHSwAKSDI3hOtvjXsxnXUmRcOHP6yy/+ERvJTY5JzVDXRrO2pAVRA3RjA4SGq9APCpD638wR4uEIYS4bl2MFrS/DGIAmgPYALb9eDmkK6HwyfNsAhC6HPyw0CxCRE/JVeQf+vBXjbjn31EZGYF7VsloOAKjSjKO4iz2MXr2e84HvPzprzfigm+UuUhVnWAjSHzBugRTpEqpUr9HsthLkdzqpDahiW/bOITHD4wC0liIyz6nCK8iiuFLJhmP88OHglDHh1JgUGOJqYtz/pwdt08tlDXZG/MUYamSgqYFWwQMtamph3jJ7wgrNnq3LHvvCij0iUXISYZ06HVAuAQuW2h3p1q4dMItAGEAMNZ7GzqMhhvRoShlnQIF+cG21jZfP+cnwAzC6E091QvqwJAyfDgYfAIIAPucS8V6/jkCc1eLT6Xtofxae01KIAKrk+0LUgIkusmI9MbbP0uE74nQuPSDS5WEzzT8E21XYcVJ4ozU3EC0OdQIgBbQL9zDfbObpxFYfEN3Nk42rO7P8mLx24gGc3L2FF9AAR1lPTC0IcaHX5nwpL4s0Mx9tCsHh06lYfoi2oQN9xsN9RMCT+XpO5GP5alehJCZ6efXZkrbwpVRcGFSw4X1BgwlqaJjpQk8bbqL448bT/Pkdt9EMx8bosc5WqBwBFZoRAgypWQFwo034ilFP7f8i/Dr+Jny99Jt9Z/CIuW/JbXL1kHf+96CwuWPgyLl18ChcufBFHNa6vLyzQWaohYKfB6zOtsBhQ3YOweeBCuDNoPB32fRYMGVCgA/TzPG7iDU/KXu1D9zaONEaObWsGgC12ncSTMakWE5k/3njiC/9r+eXfvBl3nXzy5/s0mfdxxZwHirUdMBHVcTNc0qo4qH3Mke3EBp47+E3Om/9PrOv/afmkiR8F/mbsnXx87N1sYkkAUVBY1LXSUL+usDDeBqbUktUMyB4dcH6oN+1CvBZWxLDpCmilkAERH9abuUgOYf2TK9RK/NLExLFVfOIPWCBTsM7vWIgw8yIjn7nn5HP6AJ534peWR9Hc/4pM4zzVDFVLr0tLvgZSE4EmvHLoq/xk+fO5cvlz+Pclr5uCLuBYPHxfHn8lH9v+bh7uLkathwHZTfUpzq0yNxqrLgA0BeRRhtM6U0e8gqYQ7w9LT4CBGFKgj6UYPv6kUjw96tzkAdqniVosiqD+RJEKiA+XCoxbS38SnTygIx854YSv/3/dqPtvYpLD2lmX1CSkGpNqRKYxViOsmmlDUJEeQApokzkyzqcWfYDXz/+yy917t7pSifmzLX/Ox3f+MRggykCiGux3nZOm6VSDRwuY+5go3IxkagrRfrAY2PJjmEyhn5fp7Vwga/jPJwV4D5nRNUrzoK5aEA+BIA41AavFPIzxzBIZ845XRVe/6T/lqDl9dgfL4wnmJxMMxm0acQoRTEqDnWaQEZnLJoYZYT4TOkRXE1R9OLMIChzXvJ4PLvoEp835UUHNZu4qtKSPczd/hi+NvgGitns+BhH23KWgPaRJx0CWAXYPAVdfann4VsGwhW0/BrVCzCf0Ni6VtYw84cFLidc1TNxoaSdXOiAs9lBBRbEIgiWOuvKq/ivmnJpcx4LGGPOSURpxG+IuRBnEFiILRrGRYdT08RDD3G734Zr0YK7sHsEv7YHssEOIWP738Mf4/eEv0RdPzqqR35UGb9j0j3xl7BwwEyAGorgm7Amgu5WGtWwf1deOenXV3VK3etW2KUSrYX4Xdl4J/boa+ABw3hMePIscbwHrO0c+3RdQnXasQmwy5iTjDDXGaDTaEGfMmVI3f4YNIkevnTbJMCZjXrTzEdvC2vgmzoy/hZXGFITfaZ/C3GQnb3wEOkxphz4wf/9dIx/hKztfC2YMJHLQEZruagomJZVSUMvOdIjKS7cCumfD6exBdjnfGpjTgvHrIeHNup6vyUp+/IQFT08+Ob5n3ByhtpDfSSnKICSSMi8ZY05zjGhK0fypXDAgNp87AMvmKJYIaAARRroc1LyVgwZvhgggqFarAYzgn7e/nk9vPQ/iSRAJoAutd1fLw1k9B8tIdxjsTOC1nRbo4wScN19wHA79E2Bva5DxSb2Hk2U/Wk/Iqvb+HcuWpKqrumpzfSJzlWyKoCjz4lFWNDYzPxklMllwwtfD4SHzpiGIRgHroMo7DTLrUyI3tg7l3Zs/AtIFLJhoVpCFbROpVT7PheWhziImsoHqHE+3gcquV6j1YBbcuvsWkqNB9oZ+nknMuU/YzkUm0b6KzEvVYlUddEqqwoBpsVdjCwuTnURiizCFQOH90Jhh3TrL5/XQpcS84+GPsSNdAKTT0In0kLE6sRFnfi30BTRjU2fR1FZNyKuC3VCjBTpL4NSbd8P7IZA+WWocB8wH+DN9kH2fmOBF0UojkeRKlyooypJkJ3s1tvotBMHDgferAKuGEz+vVEHqq1gDX93xYn4w9hyQFoiZNgXQmg3DOiaE3keWlfHuPO6YXF0tlHo/0K1RN91D6uYtvGdB+8E8CwYai0n50BMSvLaVfSBXOUgkZZ/GNobjMTxxReiqIKM3fLNXul7FxVSY+9jI20Ez90y0SyKHSqhq1RAWrMhPwlWjTwepzvPQzUD0GIfT2dxLQRaBPRIavFrv48QnHHipsjRjGrpB02FlYxsDpgsEDfSZwaIXaOE6VN2nt0XwXzvP4KaJI4AOiCNTCUkqL2nQN/MKp9UWhmNAUy7ffhzYaoDQO35lwIWTFOQAaO6fAH+hSvyEAq9jWdi1MC9qsU9jJ7FY/EUNdDgL5vXw+TWvcjJz71RV+D9bXgnqVMSYQAm8+fUQxLLvQfSASWndQU7K1TuPYGN7WbXq2fWg22aX6+meBy4EN4PsGTAw/9ms5+VPLPBgaEHcYq/GOIISykAIWhh2QwWEWapdGGYrQZSWsnRs3D1Xo3YBjTUqWPOv8KdkMra1l/L9rSdWs0UX9GbA1BcM1BUMNfeqyQ0lW5sQHQVR/H7dzJwnDHh7JxPDy+MJBA+SOCj85eYzgYgGYIaA9rC6LoUBdjb4A/sfGO2ARE7VtASTBlCFcymGWw+WFo1wLlEeQfn3TS+cuTtm73a5ntmDBUMVcLMpPvIj9MtgzoFrmeRNTwjwRp/5knNXJNmzu5oC08BJoBqVodQD6EEsARjerzac9SgqFdg5hxPlSs7iB0B/IAaBbFUCuJu+FTCRg7bNJVuO57axA6rDLSnY6wD7GOVv9cCFSp+CPQRkwTv1Dhb/SsHbdszZJ8Vi/iZTm2hlHCptnRCG1nCk/rnwaHm9dQ1MNhCjfNJ8kr2z9aAND1yl4ml1c18pqRqhwtmy6gEYp3qWifYCvrTxpSAzRbsHwd4OGu8x4OpDc1VqoX49bcDcw/ciNm/5lYE3ftSrl0diPmdgIHOQiTA9ElwBCCGMVbABEIJGAGv9gcxWAqkBYvaTe7hAzmMf3QD0OzBmgq9HxerDbEndACUEEoE4BisgHf6/B1/Ktvb8cpvNm73BFxp7Pn8LgAvWtAxgCukKiFe9RW9m+eMOnvIh0zH2U/0mWt3RDAmgU29BOKUmnBIqGwA9qlroDaAAkwlovtDkOLmKS/QVvFovYI5OgDZB+4CmU8LYmfFQVKqeNyxgi7mflEAUMAmIAU25f2x//u3Bl8wcd7QN9kog9ZBrL4CC9RrgatdCAFMLc9YuoTn05scdvM3H3H12Q6KzJ2zXQROoUX1hQXgfKc0pQ9jjN6x1TYNWUio7m6yWe/mSvI0b5AwuMOfySfNB3mX+nldGF3CKuYyDzK0skhEiMh8+LXVq6M3KtJH7uGNXybRPl0+tfyM72j0OgOrDkN0AmD1cMMweOD+3oBmkcyDe71y9jsWP2+mU7Yf/wYLUjv2FRhYEBAXwSufXvAk9VKlKCcuwVhUelNSwBsJOPOP//mq5+xG7DYyFOH+hYkw77mO7mctDZgl3yUp+oQdzVXY0V2dHMWKHi2HWQ67qlQ71SmjUQ5g0oNMBUu7acRD/tP51/MmBfwcZ1Uft9RbQuSBrnPrN6iRD4AbPanlefkar19IM5q1aTvfh18GmTz4u4LXiyXfPjeID2toicjBIPkJVRVudz0lQMoa5GTOFUw3XYGbYFciikhCUAYyCZLqpbZbKQyyNNnBEfBUvjlOIYzawgr+bfBufHH0bGVEOggfOKhgB8b6Hz7Xpkia0JkE6fPLut/DyZd9k1aB/bVkAV3YNmEGQvSr7udVgzXZNQ2jDNe9iIe2DeNWb9aZN/ySHMvaYhtrNR7xpTWTkD9s2DWQ9gMuDVAVUterh5yGIYaVcX1h4IMiMm0sPACGkP3I5Xx/oIGjCXtEGPjrvA+wXrw8q1yDU4qDTYthlGjwTgaaMTC7jPbe+D5QeloL9CegmIHps8jfycBrkEeHbDbopzFlyANG+Zz3mOV4q+p4+iebYYjGB1mzd91Auf68GSg3ADVSPEMDdPyspoYohBchiWtpPppFb82D5QiOED1vcZjHQHHD3J/nqAy/hS/e/FEyvgrQF2eXu0Gi054DTmYAjBK44pwnNfc7VrxE9ZqH2vqf9/mFG7Cta2sGUAclBzKd1IgIzKlqonMGWSgBWbchVT6Mnyvuon1fIZaiMZDzYXcpD6ZIQWAsYCiHXASf5mu+kECWQ9EF7EsTyzps+zNHzfsHBc273zwWKPA7ZpRA9G2QYNNtD+VtdCNYw/Lcz6Ju3jmccfAzccuVjAp4ReVvTmP4OHpAQMu0JXQicVqqchy/0q1WR6kuK0NaEV9WqzkP1XDpcMnEck91+SEpwhPA50ATQUjGi0OyHbgpZl5GJJbzuuk9z8bqXMS/e2aNuGAe9FKITQBYDaW1OV5+/1QMXzi30NSNaS89x4O3ZUPvgM/5wpRFe3rZpGO5QBIojlZf0UrtKeIPwXNoXrIEtVMNQxerDbtiftUzaefzj1tcGGUYQdsM9vjD0qoH+QUdqi6tHnskf3PBxMqLep+p1AtJLQTcAUW2IDfM3ZsjfynMALc+937YQ9b9Qbztq0R5XvG4m58yJ4nltOkSEzCA1JyXE+eGzwXqgcNTCWt+rNQqRBaLdOmHs4VKQNh/e9G6uGz8GhqzPAUV6K5+n1IVe8eojCfQPwdgoyCRfWf9y9mpu5K8O//Mi3CGI2ob0x2COArMayAI1C4D0fp2ihT6E80xhIFmGDp8G/NseU7ybDn3LECqvme5QgBRVTmDXpENnViW0R0jVmeGTWep6Iw0eroVPS9CZFp/d+kY+vukPIcl8KHXqUq18RXXLfYqKBwrEzWn4LECbT956Hn9xy/8KUwRv/jex2VWQ/aKYq/qCIZBkahWt+l4OccnUGfHv7lHF6yN5XsPI/ild4hmB2g0YQpB6KGLNWp0JMKcNWwdnCZ+AFmFvk9Hg4yPv5ANb3omNBOIE1ILkyiaAVimfd62fohq+7LvRD5nCxBjQ5f03vo9YU95z8N/XvGBAIb0JzBhEzwASwD6q/M05MxcgxZDcBgzP1nufu5+suuiePQKeGHmtEchmBYHOHgqp9qFuXXfvN9VzJyG2NeyWgWvR1QEuHj2JT42+jotaJ4JJodF0z3oVLsLn6cqnAkJoHkD/bHMQVGB8DEh57y8+SCdr8IFD/xosva9sPegoREeDzAOyXQAsuFcPnPqRfjPEuH0+8JlHDd69T3vXftZmp3ZsijG10O0eYHVACwCPDmYFBrow1IadDTClLZXSVgnSYatdzAU7zuZfx1/CNd3DQQyYFjQGIYrBOnUzJfhEQDx8SLA/WAJQcvjcqNAcAGQ659MuH7zxT9nZmcMnjvgwBttb8O1W0Mumlc/sDZrtMeC8H4JIpqC8cI+Al1l5waBpDLXpWgOmB1P1Jo9SAaX2mfo8b8ko7KwuvtAM6HKf3ZvPb38hX5h4IfdmK0EsmA7E0bQaxc3CFglgS/CFYTZUPwgB1BKEjQEYimBsB9g2//vmtzPSWshnjn4Pg/FEb/WzLbBXQnQwRGsd8LYWvnrg3FjldzIQPVbvOH1vOfB/Htht8JQPmTt1/OWTtrvVGDoGWfak/tipBRZMwmAHJmMweUWagXS5267kH3e+lC+O/w6bs6UQdcFMgImg0TdtUVTMkQr9V+NAzOETQHcNQMKRuA/mxDC2EzqTfPGO17BhbDmfe9bb2WfwQch6BRCF9GawOyA6AqQPNJtN/hYWFcwMnHPAAk2Zh3TXAV/bbfDuOGxiLZYjrdgvxyK/a4GIJ8il7N4VKSzfCXcNOx5abLRL+fT42fzLxFlssUsg6oCMAxEk/dBoQhQDCtYC4n+dhoPOuHUrIMWcLQy9IYCAihuBgNkY5gzD6A5ojfP9Db/F8y/+Mj88/mwWLxqBrCZzyTaAHYX4SJAFHr76/K13aIWwhysGrJ76qMCzWfxikeyHBm03Jerv0nligaW7qXqLJmFzC8YTPtd6AeePncN92b5gumDGQGNI+qCZK5wUgFOwANbB53wrPvR6crzrIQsBDCGs7NgxOBe6XbAT/HL703n/T/6Yfzr6T2B5fU2H7oTuTyB6Gph9gGxX8rc64LzftaB6nOrJscglaQ141WH2FukcL8KnFPn7rlqQxxgmrVlXZ48W3kjJVozyR1e9n09NvgSMdcBFEPVNJ/Zx4oBTf44OE8InAkZA855s+QtBWpMWSDV8VEVqA/1zobMFmORz21/Fq2/6OieM/wxWh0oJ5XkXutdBPAbRml3L3/wkhFX9PVIFOID1dh/gnl0G7+eHZAfHaq5pmk47luiAVFNi2U3R0dnAJzVrNev18HpFsTA61OSH5lCwXUQyVBrTyXzSyOUexJRgs34uClCAzUEq+FwPqVA/Z1IeZXbqnjTdoYIJuraP93ffxfe3vYLoxgwOBuKaQ0IodG8DOw7xYUBUD1yobiFw6kcSGaQth+0WeJHKGkPz/2Dbb0tiQwfQ2lJTvO0pILUWynroJeT2gfGlbJ5YQEO7aNQka/RjxTi48FApoAZsCT7jQIMwxKJgJdgyCdXPKaWHcHYhuX8IWhNAi0sePoHvHnQKZ2z8PtwAHAIMBHvHIcDpA2BbEPuiIwBv14Dzz8cCHT0CuHCXwPsaX4sku/WBg29P77/jUHnOdJit7Lz3Bkp28dwbgJbmfn2G53fvS5v7DDzMkBlnO/MwcRNRpasZapXKS8rKJyAm/PmmkSJQDjYJAVR/z6uFgFDTmwWiBOIGtCchS/ibe36P04/5IeZnFn4BHAzMrf96AXYEuldD/AxgEMjqgQvBC3OhDFA9bJeLi8Un3yyymZ/ffXC6PyprU7VEshtqA7Wwhq0l9b7uwt/qroXchukwx0wSIUQ2y5dJDahK2CEwgC3leJIDCKDhZ0jJAasyKcC3i3mqyHQeOjkBps2l9zyLa555BMcecD3cDvwSWAsMA7Ym0tidYK+B5Bkgc4A0yN96gFcNaWpB7QGqGBHsrME75ZIPpQA3HfK+Y4dM3JfSDX+yiaA9wkKwM6qU/ADMQAWroSlDqdUNdOldlERiadAhUp0yVQsW1AmFGkL4xMdVjJZ6r17JMEWlE0+7SmFdc2gLwGpJ6YqTUostaYAxkGWk3X6+eNOLOPak6+FhYBS4xcG3CMhqYLbj0LnWwTcEZLMETnt0MHQ5dx81R7l2J/+1/MV0T/iGvOyCbLadi+ME8UyogLi5AlIG0Pn06IGGcFGvUBJAGST4oXnuTZjvTaZNxtt9GNslsg20WCjMBJ/4h1ApAgaY0g+RqnK8kgIS+iBhdSoaAiMRxE3ojIG0ufCOU/noCX/FvINH4RoH263AGgdfXc6nk9C5AZKngwyA2t7hVJkZPKugdgFzBwb4wqKXk8l7OWbzt4F68BTkZswzUrWoiAcslIDg3qx+TKPVIRUtmlQXMWJBlKzboDPRJO02sVkMYhBRkkaXqJEyMVfZmC0kibscsOg+EOjamKSRcu/WFYxMLCCJUyJrAQ+xFuETDYTZ53eAEb+xLFJUv6LqhQqogHgVBPw9YXYf7ouboKMgKfdv35sr7j+S09dcChuAh/MuACA+7Pbu8U5A5xfQeDrQrD5SpZW92jAfFGJ+seksiD6KjQwT4/OBh2rBu+qg9w4PKgdkWETwgGlJ+YICUtxYU8EGAAJaloIyfIqqML5jmNHR+XQmB1BrMEaJjCUyGUmUMkHEpzafyRXpGvYffoBfbtufMw+4lDcc/l8MJG1uHVnFZQ8dRauT0B9liLVERbCNYxtIcxBRJ3YKGA+HGjAl0FTcWhlAir6HTovKJt7HK2B4KUSJ3/pJG3z3nhM5/aBL4QBgu38DOncBkSs4tO5g0Rh0boLkaYDMCJwftQinVzxDxM70E6gZAklJddGswOuT5kqjdpEViFRQCdVNi6/pknzsFWo9SCjVYVeLzxaBVCbGh9iyZTHt1gBGLHGcEkcZxthp8KKMOEr56MYXc+GOY0mijIc2DINR/uXGF/PNe07i3cd8gcgon73xpfSbSYz2YdSC9eUk5bAruYtXOvEAFkHzuZ+HLAAQLayVTi8HYbVH8SERiIEsBbr8+L6jSFsR8YIMljrVixx89wIHAn2ArRGEdBtwOyRrvPyrhiO5ESqfYjBmiI6BIRMj2cJZdi7kwMQkUUoXUwYNmfZ1pjpAvIW9xxlCawif/3tl25bFjGxdhBGm4IqibAo2I0okOuX3mw7fHT2C7217OoNmEqsGYzLENEhMh7HuIt7z43dw5v4/omm6dFNDhCAuTPqr1HwwkFrFUvyVmykUEgJIac1DFQJIJYQOwLCYUaouB28MWQvocvuWfXhg5zJWLdwA+wJb8cVOBqwHVgNRIFKhn24EBiDaG8h6ABeqXzFVIhUwEYidHXhWo7Ui4csHtbStouBBBLSkep46r1y+0Kh6V2zYadgyspitWxcSx6mDzU7DhmKwRGKJsKgK3xk5kshmiFjEQjPuw8RNMhEaRmjEDb51z2+DdGgmMSIGazMwBmwpmzQKNv9YjCEFrIAG7/LLQy7Ox/k+fKJF+PDQFZ8R/FoQcqvBw8SQWRBlbHwOt4zsPw3ePJfXbcMreBvYCOw1y5fHd+8FGQKZ45Wvsl2mAYAeYKf4CfNmBZ6g+yseNgWvduqsdKpCRaZd79f2W73aFcOsV4rRHfPYtmXhVNiMJIfOTgNHDqAllowd2QD3tYaJ6SJWiOOYWCIHVkRmLbERhhoxHatkqhhAbBY25b0AIX4kFSXDoEV4xBSVsJB2lKrrInzkPgAVoxYXeofbXLG7hps3reb0gy4DAZYBOymcjnbzAWBBfb4HGXTuhMZhgCmqWu/QWxSVzEBkQBmaZag1KzPVUngFJaw0taptpkElWAqhQZ4XQJl2mtNKJ5Y4hw7rlE5zpcNgaWAZt00m04SIDBVDQyLw+3MYE2GtxQANE5MJ01BKBGRO4UCMklkFFDG54nnlM0AmihWDAogDThVMDpQHMGybKVBVzZYhkxrFc+CpA8Ba7hjZt3D20EHW9oEH40JwP9Do+d5mv8fXfQCSfUFtqHQaVLzet07xIgHN+mrB+84Bn26qji6zglc48XCphy1X14L6lQDMTdWPivN7vEMY2L59PmQRSdR10JXDq/NRIsmwWYTNBBHFCMQwBZrm+71WikUDGINY69aMZwDj1orM5KNiHICZKBmKiinC54sMkcAqP3mlJRA9jDXNIge2qrOU+7cv8cVDAgy7WtKUPgq0BVjaS+1K+Z6ZDzIYKF7o+zUyV5nFAlbrwVsGcxWzMNW0a4QkyplWqdhELkEI6Oy3VKorW5S006A1MUAiGcblc07dgvzOGAsoc+MJ+qRN1/YRmQijFrUQUWx7+TFoxdp89LBlKKIKxiueKBijpGIwCplRrAgqOWwewKL6eSOEED96GKndUvE/l7SgGZvH5qGZ+L2H+cBIKYUwQAcYBebU5HsKYKG7AZIDQG3vI/HqoBOFVCEz0ASM1VrwuvHYgkhNv6JXCOYkRcCpnvocrwgd5HMVRKor2+o3oROOwOTEAGYqT8ucquUVrINNrPMVcaQs6tvGquZmbhjfl6YqxipqLNOiJoAtwVeugxRLzkMeEk0eIbGqiJk2aw3iKupMhcwYH35FS8BpoHreJ2ihhS06pf7TZgrWMjrZTydNaCYdsMAg0Ad0wpYiY+5eVC8QpNvB/D+bGwDn5iF8XUAF+hWyrFULXkZzUUQ2oipXJiY+ydJFkRm2VATEq1yvytbDlfv48FuEzxq6rSaxZHkBUQQNgzoQLYIFo1MWJW3OWHo91925L6J2ykwxvBIF8FmrRE6zi++wE2ugWFi4NVEwqmRmWv2sKEbM1JrJ4ROZMg2BC+aB+iHV0MlM0KmDLgMLrU5MN4tpxh1QB9WgA8+U4LPAODC3ErZwrfswNIY8aJUj3m8DkYGGQmbrwYusLLWYazFsMERkvpp16u5Vz/m5ovnKNve1qsAAKKuc920aoVlE7EArh1cHnYPIguSj4bS9rubCTU/j5tH96Yv8NolXuCJ8ihiDtf7cnRgQFCt5ByMvLIzjRRE1yBRoSibi4BOiKSBles1BaZmCsEbxvB8CWHcEzU5Dl02Dl6WCtcbfFwfe9hA8BGg7KJMg5IZ+NgbZKMggYEPwwM+tQkugCSQWOozVgmexC4Xoh1axWiou1Fk5JqjvXpR+PVVVYEz5pdE/l6UxxkIU5cpWyO9QRHLYtGDT8/5kkvcc9p+cd82bSdNFRHFZ4SDC5EKTh1YPIiCIf/efOOCm/HyuCIKoUz2j2BxAFaIp30FZMqWH4gFIaaQePLIMMgtWEJsiqj6HtUE4DU9DTwJRfZEBCukWiPt9rucs6GhkChMJLLAgGahurwUPYslUfyLIuhw0r25hvud8ZxQBDSNEmNeFJ23SiAglxmLQ4hZKfkCgDJ33EdYM38OHjvwCH77+zXTSeZgAPveoKfZg/eka1OT3sKKQK54U4EMwMn3fqmCLAOYhWAQV8QAiqPPV+SoAu6d4vk+bOtWDprRIJC2qGiTO0hJwOEuBriNB636xNgqmDRJ71avqXqTApMD+GXQzyHRLLXhqZFzGVtwmQ3cdq1rK6Zi5wNBZFRjVHYyikRliXCUr0/AZsUXo8tGH2UhB3KgRx+11Ax+e+2n+6sq3sHliIVHi4UNAcz/vJ4kPu1M+LqQaXDHh1c7kIdTNRQTjAUQdgLmZInAOQO/ji7biMTMJYUPCtiO2C1nXKZ8wJxmjEXXB+ucwDqq0x6nmDhDPZgciAzsKZp4DjzDkikJbwAoMp9C1HWw2Ugtequz97AdeNnndmo9O2kgIVI8SjG6dkjKq581TF3wFh2AfT6wQ59Wr5KFVS9DhRg+gVz8LNubIFTfxkd/+BO+/+I95aHwxcZKBAXFFhW+JGRd2FZyiWRyAmgOoaH5P8rUcOq9wuQIaD1qugg4w8nUUwQpe/cCPOAXudRAZgbSLZimg2MyweGAbJrLhOcIEaDlfCavn1JmpAw9IRyGZUwbO+2JhLIY+haEuZLqDrtaDp9ZeCIBEOzJ0GiIqQq06E190gDfU+4hUKJyGY86R+AIC0ZqvcueW537OusLqRet5x4n/wmd/9iru3LpqCj7BYoyLuZ55cLmdzQuRKWDI1Q9rXHHhAFONEKdUIurUMcOIoOTgGTdar3o+1GKLSieg+Vg+CSRh71sQbLdNlqWIgM1iVs7dBEIRPKd4QX4XKmgXaITQVb8eowuYUo5n/bgjgYVdiC10dRMDD9fneCfd8Y5bAFKr240oBuPDaWAePg8kILPN80Iz7i9Be3+/1oQQevjcPIOj9/05By2/k/+68TS+edPz2NGZg8QZRoxXP/Fw4QoJK/l9AdGpsavJ1Hoj6TKnOU5fo40YpW0bjHaHGO0M0iVxJ2gs6pTQ53R4APFzRUKVE6n5RaiQdVpIloFAN81Yu+j+EBgLmKriojTPqHkVWj5m0/CZPl9kqLP8UOy4wPIWSAai98jRdOvA85awJcvoGpFEMQ4wN6pBMX7jGINiS3leqIBIeT9Pit0EMIJUfTyP0txZkOv50TfHUxhKxnnNcf/Jfgsf4G8v+z02TwwTN5z6ibi8T8HmACoIdDNDRxOi2LL3vI08bcUtHLnPjaxZchdLhzYz0JzARHYKyO2tedyzYyU/e/BILrl3HbduOQArQhKlaCmny2EkB68ImofPKeHM4NGZBJuBCA3pcOiye8OTxgTgVaufekhr9/RsC6RR6t/q9NwqRBYWtKZ9tTcDzBo8o82t0B4Ds0BxcJXyPK3L84qq5/8RhltvPb5hEcKHCUZnpTZRBnTghP1/xj7DG/jWzc/hJ/ccM5X7dUlQMajBVaQRGKGv2WL1wvVToK1bfQ2HLb+FOUNjoXqYaRse3MbqJffyW2sv5R3tf3oEvuP556tfzdUPPp0k7mIMGB9SA9Dc3ANZdzpFIXPgKYZFfWMcsnQ9pIAN8zioAQqnelKf55G1QbKi4nly2wLDLYhSyIDU/mKXwOuM6vbGkGyBaEE5z1MNfdwzSKHCrfzFWa9wy8wfzvMA+jEw6318FYt4AFcOP8AfnvwFXnPsf3LrpgO4fWQ1D40vYTLtJ0m6DA9tY+WiDRy45B72WbiBpK9bzINAAONHbKkbINAfTXL6Qd/n1P0v5wvXvoJPX/EmJrrNqRBsXSSormZLrzAXqeRFALUpJm1j1NJJDQfvcz8r5o9AGjw8+7cFZ0BUo3YAtguaOeBK8AmwoAvWQnvqwV0Db90D75y8au0nNhiJDrBOuYJwKwYl9yX3EbEu3DrFK4dbCxhfUPh5qd0WAliCjwA63zxXkBAKMkBhbt8ox66+nmMPvN7DabyRs98pgSaALT1TlVd1oWnavHndFzl0yW380bc+xMjEMLELveWCgiDP89CphBVt2pnEpB3HQcyJ+99I1LDQAZidwlWH0eB+dcdEu4WC0cNHZIv53v0MTt5VA15oirlLRE5yOV0Qbj2AdmrEr0OuiFAKt87Rsql/VYQQAFj5AWU0VEU1oFkInIS9SlIg87AFgEkJMM2hK/mU/HyOC/EHXMk/nPUe3vwfn2C0M0RkMkDC8Op96PE1EREhbY8jWYYgDJg2v33IdT7Mlv/MAloTRovPSh2gCjbzku9yPa+Abk811WvlaCZ2GTwRc3OpenXwlYsNQSVsr4krOkC8UYSMHDw3l/Dt79UKWFI8f8AA4wD290II1VswL0IkwXq90plwTgeOWnUDf3bq3/Leb/0pUZR5ZXOjEv56z82rGWmPE9uMro05aPl6jlx5B6SBunmF1lkqoa1poamb2BQkctDlZJd89EcAu6N4v+yoRdRgxWCKIRXjxnIYtn5OIdzWVLcePvx9itbjC442Pwdnne/grlI9S/Vel/U+1IBYqXT18L3gsO9ywTUv4IYHD/UhF3yodSOA9jiPl2Vd6E5iVMk6wguffiV9Ax3oUH1lPcAL17zRA8AgxyuNE9pB9LLdAi+R+NaubY01iIaU1AFlgm0VD11pe4Wq6jYHkFzlCkriwaxKqX0olQJwuRGYLzZK8NV+MioEDK1RukAhw/Blmpa1i+7k+vWHEpH5YkLC4sL71WGWNAU1LOrfwUuO+Ql0AUt4CUHBEVo9eCGAGYgWFc+H3ATI+CWG23YLvB1LRzb0b5x7t0j0tDzHswhGpQScU7rcxxaqXA9haTvZq5zkodeNkYYNcjSHCbUJdBPQFNEMciP3U6BoNvz4XlQXcp1prdJV53+RMw8edOG+kRU0tENks3KO5/1SPqwljmxrlMhaJrsJZxx7NfuteMjDFZoPwTJL1bP1quiB8/ld6RVv35FTSGcJXvgCnyvX/s01RpKnZbaDxWAwqDgA83BLTXWLAfFS4sOtFM0rmMnvVx+PF+mQZUOo7UfiFGw2ZWJTiHI/gyiFqfvp9D3rno3Uw2HDahb18yAE2x5+PG2TE03uvG8Fm8fmsnjeDlYt2UQra3DBz87iF/ceTJ+0webAedhyEMPtFG/WptjOJGIt8xpjvOnU7wVdh6Ad5qDcA2/b8qPNnMJrCGiLFMs3HtUHVlS43CJvmAZNKsOtX7P+HrZcAXvVk8oiw5uvbmdQSIuJRkmzBaTteYgDTKIMTIbEGUTZ9DzL/RScOd+ZRYobz26UXi8DUsCU1DOG+zcv5uvXrON7vzyS+7Yspp0lNJMui+fuoJ026OgamkkKUpnX+bUyQfkgwkRrFNIO7U6TV5xyGYesug+6PdphCmT1gNVvtZRHDdfVEdXhepr8/FGBl6n8tKVpKyHqU7JCuDXTCliEUMX75OvW9yodusUiw4NGUfF8CIZQDa1BJCNJRiBV2u0l0AWJu9OwpRliMogdiDmEURHCbFotTQ6fBZOBsUhkHYD5uuZWhBSJgAY8vGU+//bTU/j6devYPDrX/fg8o2kyNBM2bp1LHCUMD3URa4IWGRACGMoXVi2dye1oBnvN28JbT/9OUDgElnrw6uGrGQM/NAf+V1yY3X3wusu33xVtnHeTkeQoq6kPtw4kq1KALwetrH7q1qtVz2/4lkNuMHe+3zpJGpuReILJiVV0JhYhTtGKsIlxozP8CO5ZjPrRQSiR9fA5y9fiRofxiQb/+fNj+NJPT+KB7YtI4g5DcYs4ahA9YhalY1PEGIaaQ8RqUbWlECuzLirGWtvRbgebNnj7Gd9ir6VbwkpWSn7Ht8Jq4fNjfXFhw2cRoM12lAsAasGry/OuWPO3FxsTH5VqG8U44AwGcfmeQdRgRKbWxaleMcSSA4ggUOpk5JBRBVkIpHj4ECWOxxia/0tak8uZGF1N2lowBZuJuyXwbKCAzg9BizxwxfVGkpKJctFNK/ncVc/kpo0riOKMoWSSvrif/mSAyCT+YIB/wwCaZVDqzYKglYWF+NoGoZt1aE1up91O+O2n38ArTvoxtAkvDcGDeuWqLy7qq18aQJtvyPN54FGDB2CRb3ds9m7BGJtDR2FvTx2AvqDI8zxQA24NBHWwimbh1orMUvW0uGYgA5GM/sH76RvcyOTEXozv2J/x0SX0J9NQWWNRU4TQIqYAYBG8qbmHLo6zKesoXDsyn3//5YH89P69UaAvaj1iTQYbQ8QmcQVfhggo+UkURSWHTYIwSz7PaZGQhfGJEdK2snJ4Mx/83a8RmwzS+sMAdOrUqwbeeji9dUjp8tk996HkztxrTHPH7X2SHKSaoeLzOw+fQXGj+NGiyJSvCIri+7h+u4Ia1TNOGfN5vuZfCUZmQOIpgAbm3sXA8B18+6YTuf72ozlqQYe9+5S5DUvilMyazOd0OXgOyCiHMMqYxPJwO+IXWwe57MGF/HJkPl1riOMOscQMxYP0x32oyhRwWu5IiE8t/HoOV3VxQXHAsLO9nXZ7kmYMf/Gar7B3HmJrvlxFBqR1wAXr9SdUTKh8Tu1+wJn8bI+Bd8q9r2/95MC/+e8oTg7qamFbBYMGRYZbE4Ooq27xRQZMQ6jkqmcA21v1RAugab4WhFyvgAlIygkHXMW/37WS796xhMV9KcsawoomLG3AcAJzEqUZWxL3Be9MMtpYdmbK5q7wQMuwfrzBhkdsLI0RAyZKaRphwPRNQReZCGszxB/4BCmqWr4OEuRzDsaiXwq3E90xxqYKiog/ffnXOfGIW3yIVUB6wNOuUqa61lmtX/18iqL8tQi6x8ADsJH52qTN3hlhYgebA7AQZtUgGETFQRdurYjP+8qq5wESPFTilRDNIaP4nP++mFU/zyLmNdu8b90P+KOLX8yWTvKIZdw46r8MEE2ZYEQAQ0ZMipCqkGFQwBgwojRMFxAaJMyJB2iaBFVFbYpxwIkbKQIIIYhuDa0Kr+I4FNpZmx0TW0i7Ef/rrP/hd3/rJ9CuOUlcFWalFrhS9JkNgIHa/YgWP2CWV8Qsr9NH3rBpzsLR326YaF8lw4giuaEYsQhuno8CggVwa17F/X2ldANEC/PKtXoDsMKiudvYe2icX95/CDGGSBSZMlzgh0ynTRVE3Ut/xL/4MRFDv0mYH/Uzz/SREOFrUi2d0lJACyOIm+ejAYwqko8l3wDdtM3I+BY6XeGtL7iYt5z1/bDnqt6CeQpMzrqarX+GHsArGcq58mLuBtijivcyXpb9hL/9ohAfn1HI8YgwYqcVz60puQJaxIdWVNXnempLqifFcAliCyGXwlpQ3bp75R6XW+80OGn1TXS6/Xzxquc72DK6ZKRqSbFYVRTNK0gMYDDEJiKReGo0EoEIVi2KYooKLgpSOl0s+IJKKOZ5fi3syyJi6Ng2mye2YTXl3S+5iHOef3m4SQwgNdWsDZ7ZNQjD+6EiNoAWF8pZ/BBgj4MHEJv46xOant8kWW41my4sfJXrt1aIEM27GBGq1q1bv72C215x66VuRgmqzPnewgMCHrZA+ToNfnvt1TSilM//7Ay6WcKgMe5vtDq3RryIKKirwkUEyaFT3FgBIXgY1YdZcev5WnFdEFp2kg1jo8wdGON9r/4Wp637BXR346vn7dl3K+qf66F4bSawfIhdvCJ24frXke9MvmHR6cv6TLIu09SHWXzYNG5NUJB8HR+WKb9GRHM/fPu5mSm0ysxhFwHRED41rFryAKsXbuSWh1exszXoDmTWX+JCoMcRP9fiXItzxI2mNAqKlEKsURjtTrBh5ziHrVrPJ9/8NZ51+J3Q2cXuAU7tukVAZg1f/X0J2mOfkpfwpccUPIDXzTv9XjX6eoM2BIuIlgB05kAs+qAewuIcReq+yeeB80YIZLiGvzRi6YJNHL3PbWweW8D925cCYERnB2AROIqQUQkdWlpT/3fG53tgLQ9PjDORbeM1z7mC81/3TVYs3g7dmq6CVisVrfCet5r1OuiK/mTc5sHhc8//7sSWxxy8L2z77tZHVO/APpM8Y1r1CFRPxM1RKEGI8wGM4O+XiwfFV694v0rhwjU/Quk5GzHYP85xq29k0dB27tu2jB2Tc1yxtCsAFiH0vh+LvhbhLCgdjHUyHprcwWH738L5r/1vXnTydTTyzWFqoQvnHYK/7Xnprv7ewo/cuSLirmVfPf+ah+5/zMEDOGfRafeo8nqBeHaqB+CfIRAnr3z+hgISAFavcALQW/kQRGC/JfexbvUvaSYdHtq5iNHWYLUC1qtgtRJSAI5i+IXJLmztjLNsxS287cXf47wX/ZAVS5zK2QCKul6qB6ddA1tNyPZXjfI9OB/WLxMa6ZfPv3LzPY8LeJ/f8t2HX7/w9LV9Jjkio0r1vMIV8ztQD5ngfQDxfgBKbcgNgfOw6sxvX7IRfY0Wh+5zG+v2v5GFQzsYaw+wfWIOnawBfo9615TQh1oPnwpZGtHuCGm0g/33/zlvOPO7vPWFP2LtyocxViGrUbm6cDv7AwGhb2cJpwBjCdywH6RGaXT+4fwrt2x4XMADeM380++QSM8RSHLV8zApxgPnQy6+oCjC6ZipLjRUgo+QzE7hPKmIzgyoGrAR/Y1JDtzrLp695noO3/d2FgzuxBIx2W3SfsS6WYxVUyQ9BBK/hWKtkGURaRpjLTQa4+y9192cfNxlvP7M7/CKU65i9V5biFQhq03060NsBqQBKHuysPB27SrYOhf6OxOs2fjJ8/+nvf1xA++L27676fXDp+3VFzWOSX2FiwCGUgXr5oAbPXhB4VEXckPlqg67lNbKSoiEP7e0EcYoi+aOcNjKOzh57TU8a80NU/7eCzcx1D9BHGUIglUzbXZ6VBUEpu7397VZNG87++21gWMOvZHnHn8ZL3nORZz17J9wxEH3MTw0AVmvA5o14IUhNihEaqELYa6HLgJuXgq3roAYWL7lft676a/OP5+UXbxiHsWVZslfTkp6dkK8eHpfL0KwWLePJ7g2mkQu/CiabzCLAtPrrpuLiuZH6hEt7e1lnijEAOXWGuG3QsU6vwysXw9MBbQJWYYYy+I5W1m8YCtHHngzwJSKjXf6H7GBaTVMG2QYjFEaSZe+vjaD/ZMMDkzQ6Ov6pqR11vLcozVVvPqx1/6dh66X9XjG1h+TwgAPzIFrVoII9HVg1aYbRZgEeFzBO+muP7z/xwd+6hN9UfOvUk2xajFEWCxChIgiavPTykUQUdctsEQ5dKgqoL6jgRS/HgQ2714okPsGpAST2PAVr9aDFsCnPXZnU/GvETUQmYy5/WPMzd+jEnnWMdWnf+u3iYKmf/WopWepecvT7KvZelXc2YBL18BkAomFgzbAcNv3Zh+fUOvtLfu96IZWu3NGw8TLlAxcnuar3KAV68MuvvjwmDBzyFXpUVDIDDlfj1e8SokEkZqPxAYhzo3OsiB81YSwGiDq8rwsvIfs4l5dVvOsBVIDlxwCGxeABQ56CJ72wAQpf3z+19n6KwHvnzd+q3vOwtPvNCKvBDXFrRHjC4hwW6X0WUzfxZTg4wYBKALQW0X8ZHbw+cufePZwS/2eWAhAAOruJ/shiE7pqsHWGuCCtR73BOyVa+G2vRGA1Zvg1Dsg04vl1fzd46t44fbKPecMn7asP2oc41tpOWSeCa90lKpgD1/5rfy+GvbAoQKiIYiEqgcyI3zeJAxlVO7rhHBp7Z7YrkBbD6D1FsK0S8DVg2vA3rgf2bUHAYIc8CBy0i0QW0h5x/nf4I5fKXgAb1z23CuzjLMSiRZZzXy4BWdaqgNyBQz388j9fL26og19B1UYhmvg8/Mw9KrMHHp19lVjGAJ3X+lCkAKrU7j6TkUM2R17kV52JADR0+/EPOsWaFho82M6fOD8b2F/5eD9n83fm3zDwtNvMcIrBI3AhtChpa0VH2Lxa9Tne4AGYbekeHXKVwQnBDKEqLovh1blf3XhbHc2eIMwvvumgO0BfATZfUtpX3wCMtAiOeE6zCH35HlsRsbvybncBfCrBM/D9/9C7sLnNfpM46Tpvb2iaoVdrWLeh1QVGbnn14NiozK81sAXzKVqrdp0Jvhm09YK1+tDbM2/a7aXliyrLpIwkD24jNaPTiDe936aJ/0Ms3ib/xZGm8/Lm/kUwBMGPICXLDjjipjsmf1Rsn+qmcvlepxqEi2OzsLjUx7WUjtMg5u18FWH3OpnUGoALD03ywS+HsIa38/rLIQ2ra7KAbLNi+nctobm035OcuhtSJRCFzBAmztp8srzv8nEEw68L2/9n+z1y55/qWb6okTMfFXrOUCdAVIEUIsqGDAkzhGp5gUtq141fPXqxoxN4hBAE6x5+AIA64CpB5Sa52drabEiLo2pQdsJjf3uxMwZLR5YgIxJMl4uv8/NAE848AA+t/m7O16/4Hk3GGPOFmi4ytSDJWH4DZ7x90vFhnh1DJSuFrBqlZN68EL1w8Hn5loDYI3a1aoctdsk9ZbhYapSPFVMowWqRThz8N4qb+frAE9E8Hy+t/V769+w8HkbI4legKq4KtZDh4cPqndGQt0R8FCWQKuGLwytVZDVK583KsJsGbyZAKxTwjpIe/k1lgHtALoeEApYgchARz4k79C/BnjCgwfwr1u+d8Mbhp9LwyQnW82KwHnfg+eVLFBAAAkxqYcvAMsPUnNPQHtAWal0Jh9DEJUQPg0S/GrjUUKnDroshMwB5kdr3NyAEeiaT8i7sj8DeNKAB/AvWy667N6Fz1ncbxrHZGRF6BDEi5EIaAFE54R4SD18KlVhNARIAsBq1A0gBCpUOmelUBz4ilurBghb6ddDRwgdXQ8XasAGcz9ipq1j/lze3X0fwJMOvPOB31/10ou77daqPtM4IiULmwa+LxsUG6CA7Ap8vuCoVsIeKkYPyAgULwBUqwA0HsJK+EIQQ5h6hcUaELsC7agIWQk448Zo2pcI1LTJeIe8t/MJgCcfeL6fa1855/j/kSg+sN80DnPKF24Wh/vBwbkgQXcJvjBxlFrfjSWjBFYAZrW6UYQuH0vP2JnmeEhmAose0KUCrRisB8zDFrn1yN+PIsjMRlJ5jbyv9W8AT2rwAL64/ZL09f2nf9vG2ep+kxzu4AsDnHiskKB5OnvlK+7zUYSxVxVTBRXFeTV8Wla+XiHWFEwqzBR9D10w1hUTBiYbkEWhqhVHdRBGEXSjS8k4Wz44fgXAkx08X+nu/F561oIzv9WUzoo+03hGptZ3JXKMelS6skvwlZr/2iPXwwA+PFdvndRUrgGUIVRQBVlJiYL7QdHizVLwvU1D1wdZDBoVVc75fg0zBWGHjI+zfc6b5S9HHuJxuGIe5+v5d57X/hpnn3vAmiO3NaPmHxV/cgA646v8I+9iPS5+rVj9CoiqUzzr4cscKKq5Feam8N1VwBj/jAWMTplb874R/9VCo+Eo+Sigbh5a+KVK/D3A+X6E4rP4UQ20+sCWNEXLJ2sEIoGU60jlXfLRkR/BDvz1pFe80C7gZv3slh9c9MZFp4wZiU41YErvCvWqh0BP5RM/IoD6tUA+q4sOtDSvLh7CnA4qFa662AhDK1Z65H6mWhF9BZrnaX49i2BywCmduHu5Sf5cnsttp8vHSMyb5cMjt/M4XzG/wuvIW9/3v69b+9H1YuJ/aohZmGrLgaM9v5ijeAUEwQRv/rf+61RYEK9miDrlc2tqwVCYa0HdLKi7V1Q765UOVce75OrmfSkpoBQVkEDRqucA4QgU18AKdBKwZuZT07FAhqXL10A+LB97yLe/fkPA8/Dd9qf/cc3BH7lbrXy+3/Q/rauTJdi0NPeAmeCrUIJB8kcRAaOCYKEIoGghP8LDhoKWgNMwvCJutOIgzUMtRegC+Py8BFbZJx/DNT/ifWugm4R7gjiLnEJ39QegH5NPPPwDfsVXxBPg+ueRH278veFn/wewd8MkhyuKOnBExYdZhOJQHXwplyrgq+Wq0Bv+vQZvC+pRXATrYYhFwM5U4ZZ8W1VQlDd5vU83nla6zK3lpoCIKyjkUlL+F3M2vl8+Mn43wFPg5fBtuWTiH0Z+9PVzF5681WCOT0zczFxhIOqBkaC1VXveLvynlLdYpASbW9s18KpHJdzTC3O70GwljM6K0MWlahgQC7bJzrFF60FfF89f/z75y9Fbz78EBXgKvND4x5FLrjp30YkXi5hDm5Lsa1EU9W00qgD0LlpUO+eXChQPr/jFADZC0KAOwHBOCS68hWrn/Xzu/fwZ53cSSCP/PABK2ulj88gBrF9/gr373me+6oBv/Me3a4B7CjwP32UbX9l8wVeiZLIrIsc0TNzI1AIggdL5NVUB51dXvJQglBnUrwgfbuxZzYZjuJFcb2FYDZUvi6aVLjM+mVPD2Ph87nvwIG5ffyzbtxzOzsn+fzjlmvd/muB6CrzazeZ/GLn00rcOn3hRamRtnySrLIqqhgB6COtDb9j1mFH9QgX0+V8PAOu6EtXP2KpnS9Cl0TR4jv52u5+HRlZw232Hcuf9hzKyfS+aMoA0tn9voNv3xn/eeEn3KfB20/5+y+UPvn3eEV9pm+ZkJObohsR90+rn1UpKcKn3g+5CqH4SqF8AYHVbrHdeRwhROK8B0IZdiU4nYdO2YW5/YBU337eG+zfvy1hrLmjM0rkTLF5852Wr9r3mZau/fcFOgKfAexT2d1uvyj6z+fLL/2D45G8rdrkRc1AsEVZtqcdaedizFHo9gAphSA7Cb1AgOB+/HipeGcSaXmyocD70w+RkY+pDfLc+sJxfrF/JXQ/txbbR+WS2QRJZhod2cujKe9hvxY1XLFp0+cv7Prt5E8BT4O0h+8zIZZs+vfnHX33r4mdfr8rqROK9jRgy1SJUPgJqET7qfi1WwrC66xEWCuG9cG5AQwjDsGtQK7S6hpGxhLseHuKGexc/Ysse8RexfWIQI8Lc/jZL5+9k9ZKNHLLPPRz4iA0NbPpG1Jz4XfnMqIPuKfD2vAJu/vFtb5135Jc0iu+wyH6JRMsiMVgUJQRKS9skHtLwWYSa8BsegYJQ1eoVr9rGOxEP7WiwdbQPm0XM78tYOTzB2qXbOXj5Fg5atok1Szexz8LNDM8bo2naLVL5EHfv83a54MZxniSX8CS/rtj7Hf0rFpgXC/oWI9m6PgNdOkBKJBliMozYKRMyjGRIPs8NixGd8sEi4ua4tWLjHq1oXSkYZm6JhX444n0MYIL/jjfj0gFrL0P1T+TLt1zJk+wSfk0uPfvs6P5b9v4tEftGY+xpfYY5li4ZXUQ8fN7PEHLILOSwUQRSkV0CsAY+esFIeBKF4t/hgBSw9hbQTzK3+SX552u7AE+B9wSwB4545xq0c7YYPVvIjhiIhIwOlhQJ1E+n1zxwHroQQHDzAnQlIOkNIaHiQeXcWySgCugNGP0sSd//lS//zFetT4H3xDI99EONjY3NxxnVs5T0jMTomqYBKymWFHXw+XDrQ6+I7h6AYXjsFXZD8PDKhgA224bhYoQvsW3r9+WSe1v8GlzCb8h106FvGVoUp+sksieBPcGIfVrDMD8xiiXLQSyGWu872HIf/FoOI7sEYTk3xI+qIPowcCXChZjsYrnw2vv4NbuE39DrwaNeu29DomcY7Dqwx4jYtWCXDUSYSBTFomSoZFM+WPAKCA64ahWkFHq1+pMJKGhmQR5C9BZEf4bwYzDXykVXBNsiT4H3a2g7nvV7w9pprxJjD0aygw16oIpdZUSXQrZARAdj0SgxjhmsD5nOD/M9mx8W7SKMg24DfRjR+xC5A2tvRcwtNLJ75Hs/3UpwPQXeb6xtPv4FcwY7Mt+KGVbJhiMj88XoXNFsEGy/QGwiG6FkmCxTqx0jMomxY5HVncRsB7YTx9vodnfKJZeM8dT1lD1lT9lT9htk/z8ThBGYyVvTtwAAAABJRU5ErkJggg==";
	var notSupported = {
	  mobileNotSupported: {
	    heading: 'Mobile Not Supported',
	    description: function description() {
	      return 'Our distributed application does not support mobile browsers. Please visit our site on a desktop browser. Thank you!';
	    }
	  },
	  browserNotSupported: {
	    heading: 'This Browser is Not Supported',
	    description: function description() {
	      return "This Dapp is not supported in ".concat(state.userAgent.browser.name, ". Please visit us in one of the following browsers. Thank You!");
	    }
	  }
	};
	var onboardHeading = {
	  '0': {
	    basic: 'Let’s Get You Started'
	  },
	  '1': {
	    basic: 'Install MetaMask'
	  },
	  '2': {
	    basic: 'MetaMask Login',
	    advanced: 'Login to MetaMask'
	  },
	  '3': {
	    basic: 'MetaMask Connect',
	    advanced: 'Connect MetaMask'
	  },
	  '4': {
	    basic: 'Join the Correct Network',
	    advanced: 'Wrong Network'
	  },
	  '5': {
	    basic: 'Get Some Ether',
	    advanced: 'Get Some ETH'
	  },
	  '6': {
	    basic: 'Ready to Go'
	  }
	};
	var onboardDescription = {
	  '0': {
	    basic: function basic() {
	      return 'To use this feature you’ll need to be set up and ready to use the blockchain. This onboarding guide will walk you through each step of the process. It won’t take long and at any time you can come back and pick up where you left off.';
	    }
	  },
	  '1': {
	    basic: function basic() {
	      return 'We use a product called MetaMask to manage everything you need to interact with a blockchain application like this one. MetaMask is free, installs right into your browser, hyper secure, and can be used for any other blockchain application you may want to use. <a href="https://metamask.io/" target="_blank">Get MetaMask now</a>';
	    }
	  },
	  '2': {
	    basic: function basic() {
	      return 'Now you have MetaMask installed, you’ll need to log into it. The first time you use it, you may need to set up an account with MetaMask which you can do right from the extension. When you’ve got that set up and you’re logged into MetaMask, let us know.';
	    },
	    advanced: function advanced() {
	      return 'We’ve detected you are not logged into MetaMask. Please log in to continue using the blockchain enabled features of this application.';
	    }
	  },
	  '3': {
	    basic: function basic() {
	      return 'Please allow connection to your wallet';
	    },
	    advanced: function advanced() {
	      return 'Connect your wallet to interact with this Dapp';
	    }
	  },
	  '4': {
	    basic: function basic() {
	      return "Blockchain applications have different networks they can work on. Think of this like making sure you\u2019re on Netflix vs Hulu to watch your favorite show. We\u2019ve detected that you need to be on the ".concat(networkName(state.config.networkId) || 'mainnet', " network for this application but you have MetaMask set to ").concat(networkName(state.userCurrentNetworkId), ". Switch the network name in MetaMask and you\u2019ll be ready to go.");
	    },
	    advanced: function advanced() {
	      return "We\u2019ve detected that you need to be on the ".concat(networkName(state.config.networkId) || 'mainnet', " network for this application but you have MetaMask set to ").concat(networkName(state.userCurrentNetworkId), ". Please switch to the correct network.");
	    }
	  },
	  '5': {
	    basic: function basic() {
	      return "Blockchain applications sometimes require Ether to perform various functions. You\u2019ll need at least ".concat(state.config.minimumBalance / 1000000000000000000, " Ether (ETH) for this application.");
	    },
	    advanced: function advanced() {
	      return "Blockchain applications sometimes require Ether to perform various functions. You\u2019ll need at least ".concat(state.config.minimumBalance / 1000000000000000000, " Ether (ETH) for this application.");
	    }
	  },
	  '6': {
	    basic: function basic() {
	      return 'You have successfully completed all the steps necessary to use this application. Welcome to the world of blockchain.';
	    }
	  }
	};
	var onboardButton = {
	  '0': {
	    basic: 'I’M READY'
	  },
	  '1': {
	    basic: 'CHECK THAT I HAVE METAMASK'
	  },
	  '2': {
	    basic: 'CHECK THAT I’M LOGGED IN',
	    advanced: 'CHECK THAT I’M LOGGED IN'
	  },
	  '3': {
	    basic: "CHECK THAT I'M CONNECTED",
	    advanced: "CHECK THAT I'M CONNECTED"
	  },
	  '4': {
	    basic: 'CHECK THAT I’M ON THE RIGHT NETWORK',
	    advanced: 'CHECK MY NETWORK'
	  },
	  '5': {
	    basic: 'CHECK THAT I HAVE ETHER',
	    advanced: 'I HAVE ENOUGH ETH'
	  },
	  '6': {
	    basic: 'BACK TO THE APP'
	  }
	};
	function onboardWarningMsg(type) {
	  switch (type) {
	    case 'loggedIn':
	      return 'You are not currently logged in to MetaMask.';

	    case 'enabled':
	      return 'You have not yet approved the Connect request in MetaMask.';

	    case 'network':
	      return "You currently have MetaMask set to the ".concat(capitalize(networkName(state.userCurrentNetworkId)), " ").concat(state.userCurrentNetworkId === 1 ? 'Ethereum' : 'Test', " Network.");

	    case 'minimumBalance':
	      return "Your current MetaMask account has less than the necessary minimum balance of\n        ".concat(state.config.minimumBalance / 1000000000000000000, " ").concat(capitalize(networkName(state.userCurrentNetworkId)), " ").concat(state.userCurrentNetworkId === '1' ? 'Ethereum' : 'Test', " Network Ether (ETH).");

	    default:
	      return undefined;
	  }
	}
	var imageSrc = {
	  blockNativeLogo: {
	    src: blockNativeLogo,
	    srcset: blockNativeLogo2x
	  },
	  blockNativeLogoLight: {
	    src: blockNativeLogoLight,
	    srcset: blockNativeLogoLight2x
	  },
	  mobile: {
	    src: mobile,
	    srcset: mobile2x
	  },
	  browser: {
	    src: browserFail,
	    srcset: browserFail2x
	  },
	  mobileLight: {
	    src: mobileLight,
	    srcset: mobileLight2x
	  },
	  browserLight: {
	    src: browserFailLight,
	    srcset: browserFailLight2x
	  },
	  chromeLogo: {
	    src: chromeLogo,
	    srcset: chromeLogo2x
	  },
	  firefoxLogo: {
	    src: firefoxLogo,
	    srcset: firefoxLogo2x
	  },
	  '0': {
	    src: welcome,
	    srcset: welcome2x
	  },
	  '1': {
	    src: browser,
	    srcset: browser2x
	  },
	  '2': {
	    src: metamask,
	    srcset: metamask2x
	  },
	  '3': {
	    src: login,
	    srcset: login2x
	  },
	  '4': {
	    src: connect,
	    srcset: connect2x
	  },
	  '5': {
	    src: network,
	    srcset: network2x
	  },
	  '6': {
	    src: complete,
	    srcset: complete2x
	  }
	};
	var transactionMsgs = {
	  txRequest: function txRequest() {
	    return "Your transaction is waiting for you to confirm";
	  },
	  txPending: function txPending(_ref) {
	    var transaction = _ref.transaction;
	    return "Your transaction ID: ".concat(transaction.nonce, " has started");
	  },
	  txSent: function txSent() {
	    return "Your transaction has been sent to the network";
	  },
	  txSendFail: function txSendFail() {
	    return "You rejected the transaction";
	  },
	  txStall: function txStall(_ref2) {
	    var transaction = _ref2.transaction;
	    return "Your transaction ID: ".concat(transaction.nonce, " has stalled");
	  },
	  txFailed: function txFailed(_ref3) {
	    var transaction = _ref3.transaction;
	    return "Your transaction ID: ".concat(transaction.nonce, " has failed");
	  },
	  nsfFail: function nsfFail() {
	    return 'You have insufficient funds to complete this transaction';
	  },
	  txRepeat: function txRepeat() {
	    return 'This could be a repeat transaction';
	  },
	  txAwaitingApproval: function txAwaitingApproval() {
	    return 'You have a previous transaction waiting for you to confirm';
	  },
	  txConfirmReminder: function txConfirmReminder() {
	    return 'Please confirm your transaction to continue (hint: the transaction window may be behind your browser)';
	  },
	  txConfirmed: function txConfirmed(_ref4) {
	    var transaction = _ref4.transaction;
	    return "Your transaction ID: ".concat(transaction.nonce, " has succeeded");
	  },
	  txSpeedUp: function txSpeedUp(_ref5) {
	    var transaction = _ref5.transaction;
	    return "Your transaction ID: ".concat(transaction.nonce, " has been sped up");
	  },
	  txCancel: function txCancel(_ref6) {
	    var transaction = _ref6.transaction;
	    return "Your transaction ID: ".concat(transaction.nonce, " is being canceled");
	  }
	};

	function createElementString(type, className, innerHTML) {
	  return "\n\t  <".concat(type, " class=\"").concat(className, "\">\n\t    ").concat(innerHTML, "\n\t  </").concat(type, ">\n\t");
	}
	function createElement(el, className, children, id) {
	  var element = state.iframeDocument.createElement(el);
	  element.className = className || '';

	  if (children && typeof children === 'string') {
	    element.innerHTML = children;
	  }

	  if (children && _typeof_1(children) === 'object') {
	    element.appendChild(children);
	  }

	  if (id) {
	    element.id = id;
	  }

	  return element;
	}

	var handleWindowResize = function handleWindowResize() {
	  return resizeIframe({
	    height: window.innerHeight,
	    width: window.innerWidth
	  });
	};

	function closeModal() {
	  window.removeEventListener('resize', handleWindowResize);
	  var modal = state.iframeDocument.querySelector('.bn-onboard-modal-shade');
	  modal.style.opacity = '0';
	  var notifications = getById('blocknative-notifications');

	  if (notifications) {
	    resizeIframe({
	      height: notifications.clientHeight,
	      width: notifications.clientWidth
	    });
	  } else {
	    hideIframe();
	  }

	  setTimeout(function () {
	    state.iframeDocument.body.removeChild(modal);
	  }, timeouts.removeElement);
	}
	function openModal(modal) {
	  var handlers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  var onClick = handlers.onClick,
	      onClose = handlers.onClose;
	  window.addEventListener('resize', handleWindowResize);
	  state.iframeDocument.body.appendChild(modal);
	  showIframe();
	  resizeIframe({
	    height: window.innerHeight,
	    width: window.innerWidth
	  });
	  var closeButton = state.iframeDocument.querySelector('.bn-onboard-close');

	  closeButton.onclick = function () {
	    onClose && onClose();
	    closeModal();
	  };

	  var completeStepButton = modal.querySelector('.bn-btn');

	  if (completeStepButton) {
	    completeStepButton.onclick = function () {
	      onClick && onClick();
	    };
	  }

	  setTimeout(function () {
	    modal.style.opacity = '1';
	  }, timeouts.endOfEventQueue);
	}
	function notSupportedImage(type) {
	  var imageUrl = imageSrc[type];
	  return "\n\t  <img\n\t    src=\"".concat(imageUrl.src, "\"\n\t    alt =\"").concat(capitalize(type), "Not Supported\"\n\t    srcset=\"").concat(imageUrl.srcset, " 2x\" />\n  ");
	}
	function browserLogos() {
	  var chromeLogo = imageSrc.chromeLogo,
	      firefoxLogo = imageSrc.firefoxLogo;
	  return "\n    <p>\n      <a href=\"https://www.google.com/chrome/\" target=\"_blank\" class=\"bn-btn bn-btn-primary bn-btn-outline text-center\">\n      <img\n        src=\"".concat(chromeLogo.src, "\" \n        alt=\"Chrome Logo\" \n        srcset=\"").concat(chromeLogo.srcset, " 2x\" />\n      <br>\n      Chrome\n      </a>\n      <a href=\"https://www.mozilla.org/en-US/firefox/\" target=\"_blank\" class=\"bn-btn bn-btn-primary bn-btn-outline text-center\">\n      <img\n        src=\"").concat(firefoxLogo.src, "\" \n        alt=\"Firefox Logo\" \n        srcset=\"").concat(firefoxLogo.srcset, " 2x\" />\n      <br>\n      Firefox\n      </a>\n    </p>\n  ");
	}
	function onboardBranding() {
	  var blockNativeLogo = imageSrc.blockNativeLogo,
	      blockNativeLogoLight = imageSrc.blockNativeLogoLight;
	  var style = state.config.style;
	  var darkMode = style && style.darkMode;
	  return "\n    <div class=\"bn-onboarding-branding\">\n      <p>Powered by\n      <a href=\"https://www.blocknative.com/\" target=\"_blank\">\n      <img\n        src=\"".concat(darkMode ? blockNativeLogoLight.src : blockNativeLogo.src, "\" \n        alt=\"Blocknative\" \n        srcset=\"").concat(darkMode ? blockNativeLogoLight.srcset : blockNativeLogo.srcset, " 2x\" />\n      </a>\n      </p>\n    </div>\n  ");
	}
	function notSupportedModal(type) {
	  var info = notSupported["".concat(type, "NotSupported")];
	  var style = state.config.style;
	  var darkMode = style && style.darkMode;
	  return "\n    <div id=\"bn-".concat(type, "-not-supported\" class=\"bn-onboard\">\n      <div class=\"bn-onboard-modal bn-onboard-alert\">\n        <a href=\"#\" class=\"bn-onboard-close\">\n          <span class=\"bn-onboard-close-x\"></span>\n        </a>\n        ").concat(notSupportedImage("".concat(type).concat(darkMode ? 'Light' : '')), "\n        <br><br>\n        <h1 class=\"h4\">").concat(info.heading, "</h1>\n        <p>").concat(info.description(), "</p>\n        <br>\n        ").concat(type === 'browser' ? "".concat(browserLogos(), "<br>") : '', "\n        ").concat(onboardBranding(), "\n      </div>\n    </div>\n  ");
	}
	function onboardSidebar(step) {
	  return "\n    <div class=\"bn-onboard-sidebar\">\n      <h4>Setup Tasks</h4>\n      <ul class=\"bn-onboard-list\">\n        <li class=".concat(step < 1 ? 'bn-inactive' : step > 1 ? 'bn-check' : 'bn-active', ">\n          <span class=\"bn-onboard-list-sprite\"></span> ").concat(onboardHeading[1].basic, "\n        </li>\n        <li class=").concat(step < 2 ? 'bn-inactive' : step > 2 ? 'bn-check' : 'bn-active', ">\n          <span class=\"bn-onboard-list-sprite\"></span> ").concat(onboardHeading[2].basic, "\n        </li>\n        <li class=").concat(step < 3 ? 'bn-inactive' : step > 3 ? 'bn-check' : 'bn-active', ">\n          <span class=\"bn-onboard-list-sprite\"></span> ").concat(onboardHeading[3].basic, "\n        </li>\n        <li class=").concat(step < 4 ? 'bn-inactive' : step > 4 ? 'bn-check' : 'bn-active', ">\n          <span class=\"bn-onboard-list-sprite\"></span> ").concat(onboardHeading[4].basic, "\n        </li>\n        <li class=").concat(step < 5 ? 'bn-inactive' : step > 5 ? 'bn-check' : 'bn-active', ">\n          <span class=\"bn-onboard-list-sprite\"></span> ").concat(onboardHeading[5].basic, "\n        </li>\n      </ul>\n      ").concat(onboardBranding(), "\n    </div>\n  ");
	}
	function onboardMain(type, step) {
	  var heading = onboardHeading[step][type];
	  var description = onboardDescription[step][type]();
	  var buttonText = typeof onboardButton[step][type] === 'function' ? onboardButton[step][type]() : onboardButton[step][type];
	  var defaultImages = imageSrc[step];
	  var images = state.config.images;
	  var stepKey = stepToImageKey(step);
	  var devImages = images && images[stepKey];
	  return "\n    <img\n      src=\"".concat(devImages && devImages.src || defaultImages.src, "\" \n      class=\"bn-onboard-img\" \n      alt=\"Blocknative\" \n      srcset=\"").concat(devImages && devImages.srcset && devImages.srcset || defaultImages.srcset, " 2x\"/>\n    <br>\n    <h1 class=\"h4\">").concat(heading, "</h1>\n    <p>").concat(description, "</p>\n    <br>\n    <br>\n    <p class=\"bn-onboard-button-section\">\n      <a href=\"#\"\n         class=\"bn-btn bn-btn-primary bn-btn-outline\">").concat(buttonText, "\n      </a>\n    </p>\n  ");
	}
	function onboardModal(type, step) {
	  return "\n    <div id=\"bn-user-".concat(type, "\" class=\"bn-onboard\">\n      <div class=\"bn-onboard-modal bn-onboard-").concat(type, " ").concat(type === 'basic' ? 'clearfix' : '', "\">\n        <a href=\"#\" class=\"bn-onboard-close\">\n          <span class=\"bn-onboard-close-x\"></span>\n        </a>\n        ").concat(type === 'basic' ? onboardSidebar(step) : '', "\n\t\t\t\t").concat(type === 'basic' ? createElementString('div', 'bn-onboard-main', onboardMain(type, step)) : onboardMain(type, step), "\n        ").concat(type === 'advanced' ? "<br>".concat(onboardBranding()) : '', "\n      </div>\n    </div>\n  ");
	}
	function addOnboardWarning(msgType) {
	  var existingWarning = getByQuery('.bn-onboard-warning');

	  if (existingWarning) {
	    return;
	  }

	  var warning = createElement('span', 'bn-onboard-warning', onboardWarningMsg(msgType));
	  var spacer = createElement('br');
	  var basicModal = getByQuery('.bn-onboard-main');

	  if (basicModal) {
	    basicModal.appendChild(spacer);
	    basicModal.appendChild(warning);
	  } else {
	    var modal = getByQuery('.bn-onboard-modal');
	    var branding = modal.querySelector('.bn-onboarding-branding');
	    modal.insertBefore(warning, branding);
	  }
	}
	function getById(id) {
	  return state.iframeDocument.getElementById(id);
	}
	function getByQuery(query) {
	  return state.iframeDocument.querySelector(query);
	}
	function getAllByQuery(query) {
	  return Array.from(state.iframeDocument.querySelectorAll(query));
	}
	function createTransactionBranding() {
	  var blockNativeBrand = createElement('a', null, null, 'bn-transaction-branding');
	  blockNativeBrand.href = 'https://www.blocknative.com/';
	  blockNativeBrand.target = '_blank';
	  var position = state.config.style && state.config.style.notificationsPosition || '';
	  blockNativeBrand.style.float = position.includes('Left') ? 'initial' : 'right';
	  return blockNativeBrand;
	}
	function notificationContent(type, message) {
	  var time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	  var showTime = time.showTime,
	      startTime = time.startTime,
	      timeStamp = time.timeStamp;
	  var elapsedTime = timeString(Date.now() - startTime);
	  var position = state.config.style && state.config.style.notificationsPosition || '';
	  return "\n\t\t<span class=\"bn-status-icon ".concat(position.includes('Left') ? 'bn-float-right' : '', "\">\n      ").concat(type === 'progress' ? "<div class=\"progress-tooltip ".concat(position.includes('Left') ? 'bn-left' : '', "\">\n\t\t\t\t<div class=\"progress-tooltip-inner\">\n\t\t\t\t\tYou will be notified when this transaction is completed.\n\t\t\t\t</div>\n\t\t\t</div>") : '', "\n\t\t</span>\n\t\t<div class=\"bn-notification-info\">\n\t\t\t<p>").concat(message, "</p>\n\t\t\t<p class=\"bn-notification-meta\">\n\t\t\t\t<a href=\"#\" class=\"bn-timestamp\">").concat(timeStamp, "</a>\n\t\t\t\t<span class=\"bn-duration").concat(showTime ? '' : ' bn-duration-hidden', "\"> - \n\t\t\t\t\t<i class=\"bn-clock\"></i>\n\t\t\t\t\t<span class=\"bn-duration-time\">").concat(elapsedTime, "</span>\n\t\t\t\t</span>\n\t\t\t</p>\n\t\t</div>\n\t");
	} // Start clock

	function startTimerInterval(notificationId, eventCode, startTime) {
	  var notification = first(getAllByQuery(".bn-".concat(notificationId)).filter(function (n) {
	    return n.classList.contains("bn-".concat(eventCode));
	  }));

	  if (!notification) {
	    return null;
	  }

	  var intervalId = setInterval(function () {
	    var timeContainer = notification.querySelector('.bn-duration');

	    if (timeContainer.classList.contains('bn-duration-hidden')) {
	      timeContainer.classList.remove('bn-duration-hidden');
	    }

	    var durationContainer = timeContainer.querySelector('.bn-duration-time');
	    var elapsedTime = timeString(Date.now() - startTime);
	    durationContainer.innerHTML = "".concat(elapsedTime);
	  }, 1000);
	  return intervalId;
	}
	function showElement(element, timeout) {
	  setTimeout(function () {
	    element.style.opacity = '1';
	    element.style.transform = 'translateX(0)';
	  }, timeout);
	}
	function hideElement(element) {
	  setTimeout(function () {
	    element.style.opacity = '0';
	    element.style.transform = "translateX(".concat(getPolarity(), "600px)");
	  }, timeouts.hideElement);
	}
	function removeElement(parent, element) {
	  setTimeout(function () {
	    if (parent.contains(element)) {
	      parent.removeChild(element);

	      if (parent !== state.iframeDocument.body) {
	        checkIfNotifications();
	      }
	    }
	  }, timeouts.removeElement);
	}

	function getPolarity() {
	  var position = state.config.style && state.config.style.notificationsPosition || '';
	  return position.includes('Left') ? '-' : '';
	}

	function offsetElement(el) {
	  el.style.transform = "translate(".concat(getPolarity(), "600px)");
	  return el;
	}
	function positionElement(el) {
	  var position = state.config.style && state.config.style.notificationsPosition || '';
	  el.style.left = position.includes('Left') ? '0px' : 'initial';
	  el.style.right = position.includes('Right') || !position ? '0px' : 'initial';
	  el.style.bottom = position.includes('bottom') || !position ? '0px' : 'initial';
	  el.style.top = position.includes('top') ? '0px' : 'initial';
	  return el;
	} // Remove notification from DOM

	function removeNotification(notification) {
	  var notificationsList = getByQuery('.bn-notifications');
	  hideElement(notification);
	  removeElement(notificationsList, notification);
	  var scrollContainer = getByQuery('.bn-notifications-scroll');
	  setTimeout(function () {
	    return setHeight(scrollContainer, 'initial', 'auto');
	  }, timeouts.changeUI);
	}
	function removeAllNotifications(notifications) {
	  notifications.forEach(function (notification) {
	    if (notification) {
	      removeNotification(notification);
	    }
	  });
	}
	function checkIfNotifications() {
	  var notificationsList = getByQuery('.bn-notifications');
	  var allNotifications = Array.from(notificationsList.querySelectorAll('.bn-notification'));
	  var visibleNotifications = allNotifications.filter(function (notification) {
	    return notification.style.opacity !== '0';
	  });

	  if (visibleNotifications.length === 0) {
	    removeContainer();
	  }
	} // Remove notification container from DOM

	function removeContainer() {
	  var notificationsContainer = getById('blocknative-notifications');
	  hideElement(notificationsContainer);
	  removeElement(state.iframeDocument.body, notificationsContainer);
	  resizeIframe({
	    height: 0,
	    width: 0
	  });
	  hideIframe();
	}
	function setNotificationsHeight() {
	  var scrollContainer = getByQuery('.bn-notifications-scroll');
	  var maxHeight = window.innerHeight;
	  var brandingHeight = getById('bn-transaction-branding').clientHeight + 26;
	  var widgetHeight = scrollContainer.scrollHeight + brandingHeight;
	  var tooBig = widgetHeight > maxHeight;

	  if (tooBig) {
	    setHeight(scrollContainer, 'scroll', maxHeight - brandingHeight);
	  } else {
	    setHeight(scrollContainer, 'initial', 'auto');
	  }

	  var notificationsContainer = getById('blocknative-notifications');
	  var toolTipBuffer = !tooBig ? 50 : 0;
	  resizeIframe({
	    height: notificationsContainer.clientHeight + toolTipBuffer,
	    width: 371,
	    transitionHeight: true
	  });
	}

	function setHeight(el, overflow, height) {
	  el.style['overflow-y'] = overflow;
	  el.style.height = height;
	}

	var darkModeStyles = ".bn-onboard-modal-shade {\n  background: rgba(237, 237, 237, 0.1);\n}\n\n.bn-onboard-modal {\n  background: #152128;\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\np {\n  color: #ededed;\n}\n\n.bn-onboard-basic .bn-onboard-main {\n  background: #152128;\n}\n\n.bn-onboard-basic .bn-onboard-sidebar {\n  background: #2c3943;\n}\n\n.bn-active {\n  color: #ededed;\n}\n\n.bn-notification {\n  background: #152128;\n  box-shadow: -1px -1px 8px 0px rgba(237, 237, 237, 0.1);\n  border: 1px 0px solid rgba(237, 237, 237, 0.1);\n}\n\n.bn-status-icon {\n  transition: background-color 150ms ease-in-out;\n}\n\n.bn-notification:hover .bn-status-icon {\n  background-position: -48px 1px !important;\n  background-color: #152128;\n}\n\n.bn-notification.bn-failed .bn-status-icon:hover,\n.bn-notification.bn-progress .bn-status-icon:hover,\n.bn-notification.bn-complete .bn-status-icon:hover {\n  background-color: #ededed;\n  background-position: -48px 1px !important;\n}\n";

	function createIframe(browserDocument, assistStyles) {
	  var style = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	  var darkMode = style.darkMode,
	      css = style.css;
	  var initialIframeContent = "\n    <html>\n      <head>\n        <style>\n          ".concat(assistStyles, "\n        </style>\n        <style>\n          ").concat(darkMode ? darkModeStyles : '', "\n        </style>\n        <style>\n          ").concat(css || '', "\n        </style>\n      </head>\n      <body></body>\n    </html>\n  ");
	  var iframe = positionElement(browserDocument.createElement('iframe'));
	  browserDocument.body.appendChild(iframe);
	  iframe.style.position = 'fixed';
	  iframe.style.height = '0';
	  iframe.style.width = '0';
	  iframe.style.border = 'none';
	  iframe.style.pointerEvents = 'none';
	  iframe.style.overflow = 'hidden';
	  var iWindow = iframe.contentWindow;
	  var iDocument = iWindow.document;
	  iDocument.open();
	  iDocument.write(initialIframeContent);
	  iDocument.close();
	  updateState({
	    iframe: iframe,
	    iframeDocument: iDocument,
	    iframeWindow: iWindow
	  });
	}
	function showIframe() {
	  state.iframe.style['z-index'] = 999;
	  state.iframe.style.pointerEvents = 'all';
	}
	function hideIframe() {
	  state.iframe.style['z-index'] = 'initial';
	  state.iframe.style.pointerEvents = 'none';
	}
	function resizeIframe(_ref) {
	  var height = _ref.height,
	      width = _ref.width,
	      transitionHeight = _ref.transitionHeight;

	  if (transitionHeight) {
	    state.iframe.style.transition = 'height 200ms ease-in-out';
	  } else {
	    state.iframe.style.transition = 'initial';
	  }

	  state.iframe.style.height = "".concat(height, "px");
	  state.iframe.style.width = "".concat(width, "px");
	}

	var eventToUI = {
	  initialize: {
	    mobileBlocked: notSupportedUI
	  },
	  onboard: {
	    browserFail: notSupportedUI,
	    mobileBlocked: notSupportedUI,
	    welcomeUser: onboardingUI,
	    walletFail: onboardingUI,
	    walletLogin: onboardingUI,
	    walletLoginEnable: onboardingUI,
	    walletEnable: onboardingUI,
	    networkFail: onboardingUI,
	    nsfFail: onboardingUI,
	    newOnboardComplete: onboardingUI
	  },
	  activePreflight: {
	    mobileBlocked: notSupportedUI,
	    welcomeUser: onboardingUI,
	    walletFail: onboardingUI,
	    walletLogin: onboardingUI,
	    walletLoginEnable: onboardingUI,
	    walletEnable: onboardingUI,
	    networkFail: onboardingUI,
	    nsfFail: notificationsUI,
	    newOnboardComplete: onboardingUI,
	    txRepeat: notificationsUI
	  },
	  activeTransaction: {
	    txAwaitingApproval: notificationsUI,
	    txRequest: notificationsUI,
	    txSent: notificationsUI,
	    txPending: notificationsUI,
	    txSendFail: notificationsUI,
	    txConfirmReminder: notificationsUI,
	    txConfirmed: notificationsUI,
	    txConfirmedClient: notificationsUI,
	    txStall: notificationsUI,
	    txFailed: notificationsUI,
	    txSpeedUp: notificationsUI,
	    txCancel: notificationsUI
	  },
	  activeContract: {
	    txAwaitingApproval: notificationsUI,
	    txRequest: notificationsUI,
	    txSent: notificationsUI,
	    txPending: notificationsUI,
	    txSendFail: notificationsUI,
	    txConfirmReminder: notificationsUI,
	    txConfirmed: notificationsUI,
	    txConfirmedClient: notificationsUI,
	    txStall: notificationsUI,
	    txFailed: notificationsUI,
	    txSpeedUp: notificationsUI,
	    txCancel: notificationsUI
	  }
	};

	function notSupportedUI(eventObj, handlers) {
	  var existingModal = state.iframeDocument.querySelector('.bn-onboard-modal-shade');

	  if (existingModal) {
	    return;
	  }

	  var eventCode = eventObj.eventCode;
	  var modal = createElement('div', 'bn-onboard-modal-shade', notSupportedModal(eventCodeToStep(eventCode)));
	  openModal(modal, handlers);
	}

	function onboardingUI(eventObj, handlers) {
	  var existingModal = state.iframeDocument.querySelector('.bn-onboard-modal-shade');

	  if (existingModal) {
	    return;
	  }

	  var eventCode = eventObj.eventCode;
	  var newUser = getItem('_assist_newUser') === 'true';
	  var type = newUser ? 'basic' : 'advanced';
	  var modal = createElement('div', 'bn-onboard-modal-shade', onboardModal(type, eventCodeToStep(eventCode)));
	  openModal(modal, handlers);
	}

	function getCustomTxMsg(eventCode, data) {
	  var inlineCustomMsgs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	  var msgFunc = typeof inlineCustomMsgs[eventCode] === 'function' ? inlineCustomMsgs[eventCode] : state.config.messages && typeof state.config.messages[eventCode] === 'function' && state.config.messages[eventCode];
	  if (!msgFunc) return undefined;

	  try {
	    var customMsg = msgFunc(data);

	    if (typeof customMsg === 'string') {
	      return customMsg;
	    }

	    assistLog('Custom transaction message callback must return a string');
	    return undefined;
	  } catch (error) {
	    assistLog("An error was thrown from custom transaction callback message for the ".concat(eventCode, " event: "));
	    assistLog(error);
	    return undefined;
	  }
	}

	var eventCodesNoRepeat = ['nsfFail', 'txSendFail', 'txUnderPriced'];

	function notificationsUI(_ref) {
	  var _ref$transaction = _ref.transaction,
	      transaction = _ref$transaction === void 0 ? {} : _ref$transaction,
	      _ref$contract = _ref.contract,
	      contract = _ref$contract === void 0 ? {} : _ref$contract,
	      inlineCustomMsgs = _ref.inlineCustomMsgs,
	      eventCode = _ref.eventCode;
	  // treat txConfirmedClient as txConfirm
	  if (eventCode === 'txConfirmedClient') eventCode = 'txConfirmed';
	  var id = transaction.id,
	      startTime = transaction.startTime;
	  var type = eventCodeToType(eventCode);
	  var timeStamp = formatTime(Date.now());
	  var message = getCustomTxMsg(eventCode, {
	    transaction: transaction,
	    contract: contract
	  }, inlineCustomMsgs) || transactionMsgs[eventCode]({
	    transaction: transaction,
	    contract: contract
	  });
	  var hasTimer = eventCode === 'txPending' || eventCode === 'txSent' || eventCode === 'txStall' || eventCode === 'txSpeedUp';
	  var showTime = hasTimer || eventCode === 'txConfirmed' || eventCode === 'txFailed';
	  var blockNativeBrand;
	  var existingNotifications;
	  var notificationsList;
	  var notificationsScroll;
	  var notificationsContainer = getById('blocknative-notifications');
	  var position = state.config.style && state.config.style.notificationsPosition || '';

	  if (notificationsContainer) {
	    existingNotifications = true;
	    notificationsList = getByQuery('.bn-notifications');
	    var notificationsNoRepeat = eventCodesNoRepeat.reduce(function (acc, eventCode) {
	      return [].concat(toConsumableArray(acc), toConsumableArray(getAllByQuery(".bn-".concat(eventCode))));
	    }, []); // remove all notifications we don't want to repeat

	    removeAllNotifications(notificationsNoRepeat); // We want to keep the txRepeat notification if the new notification is a txRequest or txConfirmReminder

	    var keepTxRepeatNotification = eventCode === 'txRequest' || eventCode === 'txConfirmReminder';
	    var notificationsWithSameId = keepTxRepeatNotification ? getAllByQuery(".bn-".concat(id)).filter(function (n) {
	      return !n.classList.contains('bn-txRepeat');
	    }) : getAllByQuery(".bn-".concat(id)); // if notification with the same id we can remove it to be replaced with new status

	    removeAllNotifications(notificationsWithSameId);
	  } else {
	    existingNotifications = false;
	    notificationsContainer = positionElement(offsetElement(createElement('div', null, null, 'blocknative-notifications')));
	    blockNativeBrand = createTransactionBranding();
	    notificationsList = createElement('ul', 'bn-notifications');
	    notificationsScroll = createElement('div', 'bn-notifications-scroll');

	    if (position === 'topRight') {
	      notificationsScroll.style.float = 'right';
	    }

	    showIframe();
	  }

	  var notification = offsetElement(createElement('li', "bn-notification bn-".concat(type, " bn-").concat(eventCode, " bn-").concat(id, " ").concat(position.includes('Left') ? 'bn-right-border' : ''), notificationContent(type, message, {
	    startTime: startTime,
	    showTime: showTime,
	    timeStamp: timeStamp
	  })));
	  notificationsList.appendChild(notification);

	  if (!existingNotifications) {
	    notificationsScroll.appendChild(notificationsList);

	    if (position.includes('top')) {
	      notificationsContainer.appendChild(blockNativeBrand);
	      notificationsContainer.appendChild(notificationsScroll);
	    } else {
	      notificationsContainer.appendChild(notificationsScroll);
	      notificationsContainer.appendChild(blockNativeBrand);
	    }

	    state.iframeDocument.body.appendChild(notificationsContainer);
	    showElement(notificationsContainer, timeouts.showElement);
	  }

	  showElement(notification, timeouts.showElement);
	  setNotificationsHeight();
	  var intervalId;

	  if (hasTimer) {
	    setTimeout(function () {
	      intervalId = startTimerInterval(id, eventCode, startTime);
	    }, timeouts.changeUI);
	  }

	  var dismissButton = notification.querySelector('.bn-status-icon');

	  dismissButton.onclick = function () {
	    intervalId && clearInterval(intervalId);
	    removeNotification(notification);
	    setTimeout(setNotificationsHeight, timeouts.changeUI);
	  };

	  if (type === 'complete') {
	    setTimeout(function () {
	      removeNotification(notification);
	      setTimeout(setNotificationsHeight, timeouts.changeUI);
	    }, timeouts.autoRemoveNotification);
	  }
	}

	function addTransactionToQueue(txObject) {
	  var transactionQueue = state.transactionQueue;
	  var newQueueState = [].concat(toConsumableArray(transactionQueue), [txObject]);
	  updateState({
	    transactionQueue: newQueueState
	  });
	  return newQueueState;
	}
	function removeTransactionFromQueue(id) {
	  var transactionQueue = state.transactionQueue;
	  var newQueueState = transactionQueue.filter(function (txObj) {
	    return txObj.transaction.id !== id;
	  });
	  updateState({
	    transactionQueue: newQueueState
	  });
	  return newQueueState;
	}
	function updateTransactionInQueue(id, update) {
	  var txObj = getTxObjFromQueue(id);
	  txObj.transaction = Object.assign(txObj.transaction, update);
	  return txObj;
	}
	function getTxObjFromQueue(id) {
	  var transactionQueue = state.transactionQueue;
	  return transactionQueue.find(function (txObj) {
	    return txObj.transaction.id === id;
	  });
	}
	function isDuplicateTransaction(_ref) {
	  var value = _ref.value,
	      to = _ref.to;
	  var contract = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  var transactionQueue = state.transactionQueue;
	  return Boolean(transactionQueue.find(function (txObj) {
	    var methodName = contract.methodName,
	        parameters = contract.parameters;

	    if (methodName === (txObj.contract && txObj.contract.methodName) && argsEqual(parameters, txObj.contract && txObj.contract.parameters)) {
	      return txObj.transaction.value === value && txObj.transaction.to === to;
	    }

	    return false;
	  }));
	}
	function getTransactionsAwaitingApproval() {
	  var transactionQueue = state.transactionQueue;
	  return transactionQueue.filter(function (txObj) {
	    return txObj.transaction.status === 'awaitingApproval';
	  });
	}
	function isTransactionAwaitingApproval(id) {
	  var txObj = getTxObjFromQueue(id);
	  return txObj && txObj.transaction.status === 'awaitingApproval';
	}

	function openWebsocketConnection() {
	  updateState({
	    pendingSocketConnection: true
	  });
	  var socket;

	  try {
	    socket = new WebSocket('wss://api.blocknative.com/v0');
	  } catch (errorObj) {
	    assistLog(errorObj);
	  }

	  socket.addEventListener('message', handleSocketMessage);
	  socket.addEventListener('close', function () {
	    return updateState({
	      socketConnection: false
	    });
	  });
	  socket.addEventListener('error', function () {
	    updateState({
	      pendingSocketConnection: false
	    });
	  });
	  socket.addEventListener('open', function () {
	    updateState({
	      socket: socket,
	      socketConnection: true,
	      pendingSocketConnection: false
	    });
	    handleEvent({
	      categoryCode: 'initialize',
	      eventCode: 'checkDappId',
	      connectionId: getItem('connectionId')
	    });
	  });
	} // Handle in coming socket messages

	function handleSocketMessage(msg) {
	  var _JSON$parse = JSON.parse(msg.data),
	      status = _JSON$parse.status,
	      reason = _JSON$parse.reason,
	      event = _JSON$parse.event,
	      connectionId = _JSON$parse.connectionId;

	  var validApiKey = state.validApiKey,
	      supportedNetwork = state.supportedNetwork;

	  if (!validApiKey || !supportedNetwork) {
	    return;
	  } // handle any errors from the server


	  if (status === 'error') {
	    if (reason.includes('not a valid API key') && event.eventCode !== 'initFail') {
	      updateState({
	        validApiKey: false
	      });
	      handleEvent({
	        eventCode: 'initFail',
	        categoryCode: 'initialize',
	        reason: reason
	      });
	      var errorObj = new Error(reason);
	      errorObj.eventCode = 'initFail';
	      throw errorObj;
	    }

	    if (reason.includes('network not supported') && event.eventCode !== 'initFail') {
	      updateState({
	        supportedNetwork: false
	      });
	      handleEvent({
	        eventCode: 'initFail',
	        categoryCode: 'initialize',
	        reason: reason
	      });

	      var _errorObj = new Error(reason);

	      _errorObj.eventCode = 'initFail';
	      throw _errorObj;
	    }
	  }

	  if (status === 'ok' && event && event.eventCode === 'checkDappId') {
	    handleEvent({
	      eventCode: 'initSuccess',
	      categoryCode: 'initialize'
	    });
	    updateState({
	      validApiKey: true,
	      supportedNetwork: true
	    });
	  }

	  if (connectionId && (!state.connectionId || connectionId !== state.connectionId)) {
	    storeItem('connectionId', connectionId);
	    updateState({
	      connectionId: connectionId
	    });
	  }

	  if (event && event.transaction) {
	    var transaction = event.transaction,
	        eventCode = event.eventCode;
	    var txObj;

	    switch (transaction.status) {
	      case 'pending':
	        txObj = updateTransactionInQueue(transaction.id, {
	          status: 'pending',
	          nonce: transaction.nonce
	        });
	        handleEvent({
	          eventCode: eventCode === 'txPool' ? 'txPending' : eventCode,
	          categoryCode: 'activeTransaction',
	          transaction: txObj.transaction,
	          contract: txObj.contract,
	          inlineCustomMsgs: txObj.inlineCustomMsgs
	        });
	        break;

	      case 'confirmed':
	        txObj = getTxObjFromQueue(transaction.id);

	        if (txObj.transaction.status === 'confirmed') {
	          txObj = updateTransactionInQueue(transaction.id, {
	            status: 'completed'
	          });
	        } else {
	          txObj = updateTransactionInQueue(transaction.id, {
	            status: 'confirmed'
	          });
	        }

	        handleEvent({
	          eventCode: 'txConfirmed',
	          categoryCode: 'activeTransaction',
	          transaction: txObj.transaction,
	          contract: txObj.contract,
	          inlineCustomMsgs: txObj.inlineCustomMsgs
	        });

	        if (txObj.transaction.status === 'completed') {
	          removeTransactionFromQueue(transaction.id);
	        }

	        break;

	      case 'failed':
	        txObj = updateTransactionInQueue(transaction.id, {
	          status: 'failed'
	        });
	        handleEvent({
	          eventCode: 'txFailed',
	          categoryCode: 'activeTransaction',
	          transaction: txObj.transaction,
	          contract: txObj.contract,
	          inlineCustomMsgs: txObj.inlineCustomMsgs
	        });
	        removeTransactionFromQueue(transaction.id);
	        break;

	      default:
	    }
	  }
	}

	function handleEvent(eventObj, clickHandlers) {
	  var eventCode = eventObj.eventCode,
	      categoryCode = eventObj.categoryCode;
	  var serverEvent = eventCode === 'txPending' || eventCode === 'txConfirmed' || eventCode === 'txFailed' || eventCode === 'txSpeedUp' || eventCode === 'txCancel'; // If not a server event then log it

	  !serverEvent && lib.logEvent(eventObj); // If tx status is 'completed', UI has been already handled

	  if (eventCode === 'txConfirmed' || eventCode === 'txConfirmedClient') {
	    var txObj = getTxObjFromQueue(eventObj.transaction.id);

	    if (txObj.transaction.status === 'completed') {
	      return;
	    }
	  } // Show UI


	  if (state.config && !state.config.headlessMode) {
	    eventToUI[categoryCode] && eventToUI[categoryCode][eventCode] && eventToUI[categoryCode][eventCode](eventObj, clickHandlers);
	  }
	} // Create event log to be sent to server

	function createEventLog(eventObj) {
	  var _state$config = state.config,
	      dappId = _state$config.dappId,
	      networkId = _state$config.networkId,
	      headlessMode = _state$config.headlessMode;
	  var userAgent = state.userAgent,
	      version = state.version;
	  var newUser = getItem('_assist_newUser') === 'true';
	  return JSON.stringify(Object.assign({}, {
	    timeStamp: new Date(),
	    dappId: dappId,
	    version: version,
	    userAgent: userAgent,
	    newUser: newUser,
	    headlessMode: headlessMode,
	    blockchain: {
	      system: 'ethereum',
	      network: networkName(networkId)
	    }
	  }, eventObj));
	} // Log events to server

	function logEvent(eventObj) {
	  var eventLog = createEventLog(eventObj);
	  var socket = state.socket,
	      socketConnection = state.socketConnection;
	  socketConnection && socket.send(eventLog); // Need to check if connection dropped
	  // as we don't know until after we try to send a message

	  setTimeout(function () {
	    if (!state.socketConnection) {
	      if (!state.pendingSocketConnection) {
	        openWebsocketConnection();
	      }

	      setTimeout(function () {
	        logEvent(eventObj);
	      }, timeouts.checkSocketConnection);
	    }
	  }, timeouts.checkSocketConnection);
	}
	var lib = {
	  handleEvent: handleEvent,
	  createEventLog: createEventLog,
	  logEvent: logEvent
	};

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	var arrayWithHoles = _arrayWithHoles;

	function _iterableToArrayLimit(arr, i) {
	  var _arr = [];
	  var _n = true;
	  var _d = false;
	  var _e = undefined;

	  try {
	    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	      _arr.push(_s.value);

	      if (i && _arr.length === i) break;
	    }
	  } catch (err) {
	    _d = true;
	    _e = err;
	  } finally {
	    try {
	      if (!_n && _i["return"] != null) _i["return"]();
	    } finally {
	      if (_d) throw _e;
	    }
	  }

	  return _arr;
	}

	var iterableToArrayLimit = _iterableToArrayLimit;

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance");
	}

	var nonIterableRest = _nonIterableRest;

	function _slicedToArray(arr, i) {
	  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
	}

	var slicedToArray = _slicedToArray;

	var errorObj = new Error('undefined version of web3');
	errorObj.eventCode = 'initFail';
	var web3Functions = {
	  networkId: function networkId(version) {
	    switch (version) {
	      case '0.2':
	        return bluebird_1(state.web3Instance.version.getNetwork);

	      case '1.0':
	        return state.web3Instance.eth.net.getId;

	      default:
	        return function () {
	          return Promise.reject(errorObj);
	        };
	    }
	  },
	  bigNumber: function bigNumber(version) {
	    switch (version) {
	      case '0.2':
	        return function (value) {
	          return Promise.resolve(state.web3Instance.toBigNumber(formatNumber(value)));
	        };

	      case '1.0':
	        return function (value) {
	          return Promise.resolve(state.web3Instance.utils.toBN(formatNumber(value)));
	        };

	      default:
	        return function () {
	          return Promise.reject(errorObj);
	        };
	    }
	  },
	  gasPrice: function gasPrice(version) {
	    switch (version) {
	      case '0.2':
	        return bluebird_1(state.web3Instance.eth.getGasPrice);

	      case '1.0':
	        return state.web3Instance.eth.getGasPrice;

	      default:
	        return function () {
	          return Promise.reject(errorObj);
	        };
	    }
	  },
	  contractGas: function contractGas(version) {
	    switch (version) {
	      case '0.2':
	        return function (contractMethod, parameters, txObject) {
	          return state.config.truffleContract ? contractMethod.estimateGas.apply(contractMethod, toConsumableArray(parameters).concat([txObject])) : bluebird_1(contractMethod.estimateGas).apply(void 0, toConsumableArray(parameters).concat([txObject]));
	        };

	      case '1.0':
	        return function (contractMethod, parameters, txObject) {
	          return state.config.truffleContract ? contractMethod.estimateGas.apply(contractMethod, toConsumableArray(parameters).concat([txObject])) : contractMethod.apply(void 0, toConsumableArray(parameters)).estimateGas(txObject);
	        };

	      default:
	        return function () {
	          return Promise.reject(errorObj);
	        };
	    }
	  },
	  transactionGas: function transactionGas(version) {
	    switch (version) {
	      case '0.2':
	        return bluebird_1(state.web3Instance.eth.estimateGas);

	      case '1.0':
	        return state.web3Instance.eth.estimateGas;

	      default:
	        return function () {
	          return Promise.reject(errorObj);
	        };
	    }
	  },
	  balance: function balance(version) {
	    switch (version) {
	      case '0.2':
	        return bluebird_1(state.web3Instance.eth.getBalance);

	      case '1.0':
	        return state.web3Instance.eth.getBalance;

	      default:
	        return function () {
	          return Promise.reject(errorObj);
	        };
	    }
	  },
	  accounts: function accounts(version) {
	    switch (version) {
	      case '0.2':
	        return bluebird_1(state.web3Instance.eth.getAccounts);

	      case '1.0':
	        return state.web3Instance.eth.getAccounts;

	      default:
	        return function () {
	          return Promise.reject(errorObj);
	        };
	    }
	  },
	  txReceipt: function txReceipt(txHash) {
	    return bluebird_1(state.web3Instance.eth.getTransactionReceipt)(txHash);
	  }
	};
	function configureWeb3(web3) {
	  if (!web3) {
	    web3 = window.web3; // eslint-disable-line prefer-destructuring
	  } // If web3 has been prefaced with the default property, re-assign it


	  if (web3.default) {
	    web3 = web3.default;
	  } // Check which version of web3 we are working with


	  var legacyWeb3;
	  var modernWeb3;
	  var web3Version;

	  if (web3.version && web3.version.api && typeof web3.version.api === 'string') {
	    legacyWeb3 = true;
	    modernWeb3 = false;
	    web3Version = web3.version.api;
	  } else if (web3.version && typeof web3.version === 'string') {
	    legacyWeb3 = false;
	    modernWeb3 = true;
	    web3Version = web3.version;
	  } else {
	    legacyWeb3 = false;
	    modernWeb3 = false;
	    web3Version = undefined;
	  } // Update the state


	  updateState({
	    legacyWeb3: legacyWeb3,
	    modernWeb3: modernWeb3,
	    web3Version: web3Version,
	    web3Instance: web3
	  });
	}
	function checkForWallet() {
	  if (window.ethereum && window.web3.version) {
	    updateState({
	      currentProvider: getCurrentProvider(),
	      validBrowser: true,
	      web3Wallet: true,
	      legacyWallet: false,
	      modernWallet: true
	    });
	  } else if (window.web3 && window.web3.version) {
	    updateState({
	      currentProvider: getCurrentProvider(),
	      validBrowser: true,
	      web3Wallet: true,
	      legacyWallet: true,
	      modernWallet: false
	    });
	  } else {
	    updateState({
	      web3Wallet: false,
	      accessToAccounts: false,
	      walletLoggedIn: false,
	      walletEnabled: false
	    });
	  }
	}
	function getNetworkId() {
	  var version = state.web3Version && state.web3Version.slice(0, 3);
	  return web3Functions.networkId(version)();
	}
	function getTransactionParams() {
	  var txObject = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  var contractMethod = arguments.length > 1 ? arguments[1] : undefined;
	  var contractEventObj = arguments.length > 2 ? arguments[2] : undefined;
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee3(resolve) {
	      var version, valuePromise, gasPricePromise, gasPromise, _ref4, _ref5, value, gasPrice, gas;

	      return regenerator.wrap(function _callee3$(_context3) {
	        while (1) {
	          switch (_context3.prev = _context3.next) {
	            case 0:
	              version = state.web3Version && state.web3Version.slice(0, 3); // Sometimes value is in exponent notation and needs to be formatted

	              if (txObject.value) {
	                txObject.value = formatNumber(txObject.value);
	              }

	              valuePromise = txObject.value ? web3Functions.bigNumber(version)(txObject.value) : web3Functions.bigNumber(version)('0');
	              gasPricePromise = new Promise(
	              /*#__PURE__*/
	              function () {
	                var _ref2 = asyncToGenerator(
	                /*#__PURE__*/
	                regenerator.mark(function _callee(resolve, reject) {
	                  var _gasPrice;

	                  return regenerator.wrap(function _callee$(_context) {
	                    while (1) {
	                      switch (_context.prev = _context.next) {
	                        case 0:
	                          _context.prev = 0;

	                          if (!txObject.gasPrice) {
	                            _context.next = 5;
	                            break;
	                          }

	                          _context.t0 = txObject.gasPrice;
	                          _context.next = 8;
	                          break;

	                        case 5:
	                          _context.next = 7;
	                          return web3Functions.gasPrice(version)();

	                        case 7:
	                          _context.t0 = _context.sent;

	                        case 8:
	                          _gasPrice = _context.t0;
	                          resolve(web3Functions.bigNumber(version)(_gasPrice));
	                          _context.next = 15;
	                          break;

	                        case 12:
	                          _context.prev = 12;
	                          _context.t1 = _context["catch"](0);
	                          reject(_context.t1);

	                        case 15:
	                        case "end":
	                          return _context.stop();
	                      }
	                    }
	                  }, _callee, null, [[0, 12]]);
	                }));

	                return function (_x2, _x3) {
	                  return _ref2.apply(this, arguments);
	                };
	              }());
	              gasPromise = new Promise(
	              /*#__PURE__*/
	              function () {
	                var _ref3 = asyncToGenerator(
	                /*#__PURE__*/
	                regenerator.mark(function _callee2(resolve, reject) {
	                  var _gas;

	                  return regenerator.wrap(function _callee2$(_context2) {
	                    while (1) {
	                      switch (_context2.prev = _context2.next) {
	                        case 0:
	                          _context2.prev = 0;

	                          if (!contractMethod) {
	                            _context2.next = 7;
	                            break;
	                          }

	                          _context2.next = 4;
	                          return web3Functions.contractGas(version)(contractMethod, contractEventObj.parameters, txObject);

	                        case 4:
	                          _context2.t0 = _context2.sent;
	                          _context2.next = 10;
	                          break;

	                        case 7:
	                          _context2.next = 9;
	                          return web3Functions.transactionGas(version)(txObject);

	                        case 9:
	                          _context2.t0 = _context2.sent;

	                        case 10:
	                          _gas = _context2.t0;
	                          resolve(web3Functions.bigNumber(version)(_gas));
	                          _context2.next = 17;
	                          break;

	                        case 14:
	                          _context2.prev = 14;
	                          _context2.t1 = _context2["catch"](0);
	                          reject(_context2.t1);

	                        case 17:
	                        case "end":
	                          return _context2.stop();
	                      }
	                    }
	                  }, _callee2, null, [[0, 14]]);
	                }));

	                return function (_x4, _x5) {
	                  return _ref3.apply(this, arguments);
	                };
	              }());
	              _context3.next = 7;
	              return Promise.all([valuePromise, gasPricePromise, gasPromise]).catch(handleWeb3Error);

	            case 7:
	              _ref4 = _context3.sent;
	              _ref5 = slicedToArray(_ref4, 3);
	              value = _ref5[0];
	              gasPrice = _ref5[1];
	              gas = _ref5[2];
	              resolve({
	                value: value,
	                gasPrice: gasPrice,
	                gas: gas
	              });

	            case 13:
	            case "end":
	              return _context3.stop();
	          }
	        }
	      }, _callee3);
	    }));

	    return function (_x) {
	      return _ref.apply(this, arguments);
	    };
	  }());
	}
	function hasSufficientBalance(_ref6) {
	  var _ref6$value = _ref6.value,
	      value = _ref6$value === void 0 ? 0 : _ref6$value,
	      _ref6$gas = _ref6.gas,
	      gas = _ref6$gas === void 0 ? 0 : _ref6$gas,
	      _ref6$gasPrice = _ref6.gasPrice,
	      gasPrice = _ref6$gasPrice === void 0 ? 0 : _ref6$gasPrice;
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref7 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee4(resolve) {
	      var version, gasCost, buffer, transactionCost, balance, accountBalance, sufficientBalance;
	      return regenerator.wrap(function _callee4$(_context4) {
	        while (1) {
	          switch (_context4.prev = _context4.next) {
	            case 0:
	              version = state.web3Version && state.web3Version.slice(0, 3);
	              gasCost = gas.mul(gasPrice);
	              _context4.t0 = gasCost;
	              _context4.next = 5;
	              return web3Functions.bigNumber(version)('10').catch(handleWeb3Error);

	            case 5:
	              _context4.t1 = _context4.sent;
	              buffer = _context4.t0.div.call(_context4.t0, _context4.t1);
	              transactionCost = gasCost.add(value).add(buffer);
	              _context4.next = 10;
	              return getAccountBalance().catch(handleWeb3Error);

	            case 10:
	              balance = _context4.sent;
	              _context4.next = 13;
	              return web3Functions.bigNumber(version)(balance).catch(handleWeb3Error);

	            case 13:
	              accountBalance = _context4.sent;
	              sufficientBalance = accountBalance.gt(transactionCost);
	              resolve(sufficientBalance);

	            case 16:
	            case "end":
	              return _context4.stop();
	          }
	        }
	      }, _callee4);
	    }));

	    return function (_x6) {
	      return _ref7.apply(this, arguments);
	    };
	  }());
	}
	function getAccountBalance() {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref8 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee5(resolve) {
	      var accounts, version, balance;
	      return regenerator.wrap(function _callee5$(_context5) {
	        while (1) {
	          switch (_context5.prev = _context5.next) {
	            case 0:
	              _context5.next = 2;
	              return getAccounts().catch(handleWeb3Error);

	            case 2:
	              accounts = _context5.sent;
	              updateState({
	                accountAddress: accounts && accounts[0]
	              });
	              version = state.web3Version && state.web3Version.slice(0, 3);
	              _context5.next = 7;
	              return web3Functions.balance(version)(accounts[0]).catch(handleWeb3Error);

	            case 7:
	              balance = _context5.sent;
	              resolve(balance);

	            case 9:
	            case "end":
	              return _context5.stop();
	          }
	        }
	      }, _callee5);
	    }));

	    return function (_x7) {
	      return _ref8.apply(this, arguments);
	    };
	  }());
	}
	function getAccounts() {
	  var version = state.web3Version && state.web3Version.slice(0, 3);
	  return web3Functions.accounts(version)();
	}
	function checkUnlocked() {
	  return window.ethereum && window.ethereum._metamask && window.ethereum._metamask.isUnlocked();
	}
	function requestLoginEnable() {
	  return window.ethereum.enable();
	}
	function getCurrentProvider() {
	  var web3 = state.web3Instance || window.web3;

	  if (web3.currentProvider.isMetaMask) {
	    return 'metamask';
	  }

	  if (web3.currentProvider.isTrust) {
	    return 'trust';
	  }

	  if (typeof window.SOFA !== 'undefined') {
	    return 'toshi';
	  }

	  if (typeof window.__CIPHER__ !== 'undefined') {
	    return 'cipher';
	  }

	  if (web3.currentProvider.constructor.name === 'EthereumProvider') {
	    return 'mist';
	  }

	  if (web3.currentProvider.constructor.name === 'Web3FrameProvider') {
	    return 'parity';
	  }

	  if (web3.currentProvider.host && web3.currentProvider.host.indexOf('infura') !== -1) {
	    return 'infura';
	  }

	  if (web3.currentProvider.host && web3.currentProvider.host.indexOf('localhost') !== -1) {
	    return 'localhost';
	  }

	  if (web3.currentProvider.connection) {
	    return 'Infura Websocket';
	  }

	  return undefined;
	} // Poll for a tx receipt

	function waitForTransactionReceipt(txHash) {
	  return new Promise(function (resolve) {
	    return checkForReceipt();

	    function checkForReceipt() {
	      return web3Functions.txReceipt(txHash).then(function (txReceipt) {
	        if (!txReceipt) {
	          return setTimeout(function () {
	            return checkForReceipt();
	          }, timeouts.pollForReceipt);
	        }

	        return resolve(txReceipt);
	      }).catch(function (errorObj) {
	        handleWeb3Error(errorObj);
	        return resolve(null);
	      });
	    }
	  });
	}

	var es5 = createCommonjsModule(function (module, exports) {
	!function(e,t){module.exports=t();}(commonjsGlobal,function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n});},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=86)}({17:function(e,t,r){var n,i,s;i=[t,r(89)],void 0===(s="function"==typeof(n=function(r,n){function i(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;var s=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);}return t=e,s=[{key:"getFirstMatch",value:function(e,t){var r=t.match(e);return r&&r.length>0&&r[1]||""}},{key:"getSecondMatch",value:function(e,t){var r=t.match(e);return r&&r.length>1&&r[2]||""}},{key:"matchAndReturnConst",value:function(e,t,r){if(e.test(t))return r}},{key:"getWindowsVersionName",value:function(e){switch(e){case"NT":return "NT";case"XP":return "XP";case"NT 5.0":return "2000";case"NT 5.1":return "XP";case"NT 5.2":return "2003";case"NT 6.0":return "Vista";case"NT 6.1":return "7";case"NT 6.2":return "8";case"NT 6.3":return "8.1";case"NT 10.0":return "10";default:return}}},{key:"getAndroidVersionName",value:function(e){var t=e.split(".").splice(0,2).map(function(e){return parseInt(e,10)||0});if(t.push(0),!(1===t[0]&&t[1]<5))return 1===t[0]&&t[1]<6?"Cupcake":1===t[0]&&t[1]>=6?"Donut":2===t[0]&&t[1]<2?"Eclair":2===t[0]&&2===t[1]?"Froyo":2===t[0]&&t[1]>2?"Gingerbread":3===t[0]?"Honeycomb":4===t[0]&&t[1]<1?"Ice Cream Sandwich":4===t[0]&&t[1]<4?"Jelly Bean":4===t[0]&&t[1]>=4?"KitKat":5===t[0]?"Lollipop":6===t[0]?"Marshmallow":7===t[0]?"Nougat":8===t[0]?"Oreo":void 0}},{key:"getVersionPrecision",value:function(e){return e.split(".").length}},{key:"compareVersions",value:function(t,r){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=e.getVersionPrecision(t),s=e.getVersionPrecision(r),a=Math.max(i,s),o=0,u=e.map([t,r],function(t){var r=a-e.getVersionPrecision(t),n=t+new Array(r+1).join(".0");return e.map(n.split("."),function(e){return new Array(20-e.length).join("0")+e}).reverse()});for(n&&(o=a-Math.min(i,s)),a-=1;a>=o;){if(u[0][a]>u[1][a])return 1;if(u[0][a]===u[1][a]){if(a===o)return 0;a-=1;}else if(u[0][a]<u[1][a])return -1}}},{key:"map",value:function(e,t){var r,n=[];if(Array.prototype.map)return Array.prototype.map.call(e,t);for(r=0;r<e.length;r+=1)n.push(t(e[r]));return n}},{key:"getBrowserAlias",value:function(e){return n.BROWSER_ALIASES_MAP[e]}}],(r=null)&&i(t.prototype,r),s&&i(t,s),e;var t,r,s;}();r.default=s,e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);},86:function(e,t,r){var n,i,s;i=[t,r(87)],void 0===(s="function"==typeof(n=function(r,n){function i(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}var s;Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0,n=(s=n)&&s.__esModule?s:{default:s};var a=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);}return t=e,s=[{key:"getParser",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if("string"!=typeof e)throw new Error("UserAgent should be a string");return new n.default(e,t)}},{key:"parse",value:function(e){return new n.default(e).getResult()}}],(r=null)&&i(t.prototype,r),s&&i(t,s),e;var t,r,s;}();r.default=a,e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);},87:function(e,t,r){var n,i,s;i=[t,r(88),r(90),r(91),r(92),r(17)],void 0===(s="function"==typeof(n=function(r,n,i,s,a,o){function u(e){return e&&e.__esModule?e:{default:e}}function d(e){return (d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function c(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0,n=u(n),i=u(i),s=u(s),a=u(a),o=u(o);var f=function(){function e(t){var r=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),null==t||""===t)throw new Error("UserAgent parameter can't be empty");this._ua=t,this.parsedResult={},!0!==r&&this.parse();}return t=e,(r=[{key:"getUA",value:function(){return this._ua}},{key:"test",value:function(e){return e.test(this._ua)}},{key:"parseBrowser",value:function(){var e=this;this.parsedResult.browser={};var t=n.default.find(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some(function(t){return e.test(t)});throw new Error("Browser's test function is not valid")});return t&&(this.parsedResult.browser=t.describe(this.getUA())),this.parsedResult.browser}},{key:"getBrowser",value:function(){return this.parsedResult.browser?this.parsedResult.browser:this.parseBrowser()}},{key:"getBrowserName",value:function(e){return e?String(this.getBrowser().name).toLowerCase()||"":this.getBrowser().name||""}},{key:"getBrowserVersion",value:function(){return this.getBrowser().version}},{key:"getOS",value:function(){return this.parsedResult.os?this.parsedResult.os:this.parseOS()}},{key:"parseOS",value:function(){var e=this;this.parsedResult.os={};var t=i.default.find(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some(function(t){return e.test(t)});throw new Error("Browser's test function is not valid")});return t&&(this.parsedResult.os=t.describe(this.getUA())),this.parsedResult.os}},{key:"getOSName",value:function(e){var t=this.getOS(),r=t.name;return e?String(r).toLowerCase()||"":r||""}},{key:"getOSVersion",value:function(){return this.getOS().version}},{key:"getPlatform",value:function(){return this.parsedResult.platform?this.parsedResult.platform:this.parsePlatform()}},{key:"getPlatformType",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=this.getPlatform(),r=t.type;return e?String(r).toLowerCase()||"":r||""}},{key:"parsePlatform",value:function(){var e=this;this.parsedResult.platform={};var t=s.default.find(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some(function(t){return e.test(t)});throw new Error("Browser's test function is not valid")});return t&&(this.parsedResult.platform=t.describe(this.getUA())),this.parsedResult.platform}},{key:"getEngine",value:function(){return this.parsedResult.engine?this.parsedResult.engine:this.parseEngine()}},{key:"getEngineName",value:function(e){return e?String(this.getEngine().name).toLowerCase()||"":this.getEngine().name||""}},{key:"parseEngine",value:function(){var e=this;this.parsedResult.engine={};var t=a.default.find(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some(function(t){return e.test(t)});throw new Error("Browser's test function is not valid")});return t&&(this.parsedResult.engine=t.describe(this.getUA())),this.parsedResult.engine}},{key:"parse",value:function(){return this.parseBrowser(),this.parseOS(),this.parsePlatform(),this.parseEngine(),this}},{key:"getResult",value:function(){return Object.assign({},this.parsedResult)}},{key:"satisfies",value:function(e){var t=this,r={},n=0,i={},s=0,a=Object.keys(e);if(a.forEach(function(t){var a=e[t];"string"==typeof a?(i[t]=a,s+=1):"object"===d(a)&&(r[t]=a,n+=1);}),n>0){var o=Object.keys(r),u=o.find(function(e){return t.isOS(e)});if(u){var c=this.satisfies(r[u]);if(void 0!==c)return c}var f=o.find(function(e){return t.isPlatform(e)});if(f){var l=this.satisfies(r[f]);if(void 0!==l)return l}}if(s>0){var v=Object.keys(i),p=v.find(function(e){return t.isBrowser(e,!0)});if(void 0!==p)return this.compareVersion(i[p])}}},{key:"isBrowser",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],r=this.getBrowserName(),n=[r.toLowerCase()],i=o.default.getBrowserAlias(r);return t&&void 0!==i&&n.push(i.toLowerCase()),-1!==n.indexOf(e.toLowerCase())}},{key:"compareVersion",value:function(e){var t=[0],r=e,n=!1,i=this.getBrowserVersion();if("string"==typeof i)return ">"===e[0]||"<"===e[0]?(r=e.substr(1),"="===e[1]?(n=!0,r=e.substr(2)):t=[],">"===e[0]?t.push(1):t.push(-1)):"="===e[0]?r=e.substr(1):"~"===e[0]&&(n=!0,r=e.substr(1)),t.indexOf(o.default.compareVersions(i,r,n))>-1}},{key:"isOS",value:function(e){return this.getOSName(!0)===String(e).toLowerCase()}},{key:"isPlatform",value:function(e){return this.getPlatformType(!0)===String(e).toLowerCase()}},{key:"isEngine",value:function(e){return this.getEngineName(!0)===String(e).toLowerCase()}},{key:"is",value:function(e){return this.isBrowser(e)||this.isOS(e)||this.isPlatform(e)}},{key:"some",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];return t.some(function(t){return e.is(t)})}}])&&c(t.prototype,r),e;var t,r;}();r.default=f,e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);},88:function(e,t,r){var n,i,s;i=[t,r(17)],void 0===(s="function"==typeof(n=function(r,n){var i;Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0,n=(i=n)&&i.__esModule?i:{default:i};var s=/version\/(\d+(\.?_?\d+)+)/i,a=[{test:[/googlebot/i],describe:function(e){var t={name:"Googlebot"},r=n.default.getFirstMatch(/googlebot\/(\d+(\.\d+))/i,e)||n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/opera/i],describe:function(e){var t={name:"Opera"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/(?:opera)[\s\/](\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/opr\/|opios/i],describe:function(e){var t={name:"Opera"},r=n.default.getFirstMatch(/(?:opr|opios)[\s\/](\S+)/i,e)||n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/SamsungBrowser/i],describe:function(e){var t={name:"Samsung Internet for Android"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/(?:SamsungBrowser)[\s\/](\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/Whale/i],describe:function(e){var t={name:"NAVER Whale Browser"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/(?:whale)[\s\/](\d+(?:\.\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/MZBrowser/i],describe:function(e){var t={name:"MZ Browser"},r=n.default.getFirstMatch(/(?:MZBrowser)[\s\/](\d+(?:\.\d+)+)/i,e)||n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/focus/i],describe:function(e){var t={name:"Focus"},r=n.default.getFirstMatch(/(?:focus)[\s\/](\d+(?:\.\d+)+)/i,e)||n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/swing/i],describe:function(e){var t={name:"Swing"},r=n.default.getFirstMatch(/(?:swing)[\s\/](\d+(?:\.\d+)+)/i,e)||n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/coast/i],describe:function(e){var t={name:"Opera Coast"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/(?:coast)[\s\/](\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/yabrowser/i],describe:function(e){var t={name:"Yandex Browser"},r=n.default.getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.?_?\d+)+)/i,e)||n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/ucbrowser/i],describe:function(e){var t={name:"UC Browser"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/(?:ucbrowser)[\s\/](\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/Maxthon|mxios/i],describe:function(e){var t={name:"Maxthon"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/(?:Maxthon|mxios)[\s\/](\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/epiphany/i],describe:function(e){var t={name:"Epiphany"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/(?:epiphany)[\s\/](\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/puffin/i],describe:function(e){var t={name:"Puffin"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/(?:puffin)[\s\/](\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/sleipnir/i],describe:function(e){var t={name:"Sleipnir"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/(?:sleipnir)[\s\/](\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/k-meleon/i],describe:function(e){var t={name:"K-Meleon"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/(?:k-meleon)[\s\/](\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/micromessenger/i],describe:function(e){var t={name:"WeChat"},r=n.default.getFirstMatch(/(?:micromessenger)[\s\/](\d+(\.?_?\d+)+)/i,e)||n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/msie|trident/i],describe:function(e){var t={name:"Internet Explorer"},r=n.default.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/\sedg\//i],describe:function(e){var t={name:"Microsoft Edge"},r=n.default.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/edg([ea]|ios)/i],describe:function(e){var t={name:"Microsoft Edge"},r=n.default.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/vivaldi/i],describe:function(e){var t={name:"Vivaldi"},r=n.default.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/seamonkey/i],describe:function(e){var t={name:"SeaMonkey"},r=n.default.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/sailfish/i],describe:function(e){var t={name:"Sailfish"},r=n.default.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i,e);return r&&(t.version=r),t}},{test:[/silk/i],describe:function(e){var t={name:"Amazon Silk"},r=n.default.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/phantom/i],describe:function(e){var t={name:"PhantomJS"},r=n.default.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/slimerjs/i],describe:function(e){var t={name:"SlimerJS"},r=n.default.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/blackberry|\bbb\d+/i,/rim\stablet/i],describe:function(e){var t={name:"BlackBerry"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/(web|hpw)[o0]s/i],describe:function(e){var t={name:"WebOS Browser"},r=n.default.getFirstMatch(s,e)||n.default.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/bada/i],describe:function(e){var t={name:"Bada"},r=n.default.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/tizen/i],describe:function(e){var t={name:"Tizen"},r=n.default.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i,e)||n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/qupzilla/i],describe:function(e){var t={name:"QupZilla"},r=n.default.getFirstMatch(/(?:qupzilla)[\s\/](\d+(\.?_?\d+)+)/i,e)||n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/firefox|iceweasel|fxios/i],describe:function(e){var t={name:"Firefox"},r=n.default.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s\/](\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/chromium/i],describe:function(e){var t={name:"Chromium"},r=n.default.getFirstMatch(/(?:chromium)[\s\/](\d+(\.?_?\d+)+)/i,e)||n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/chrome|crios|crmo/i],describe:function(e){var t={name:"Chrome"},r=n.default.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:function(e){var t=!e.test(/like android/i),r=e.test(/android/i);return t&&r},describe:function(e){var t={name:"Android Browser"},r=n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/playstation 4/i],describe:function(e){var t={name:"PlayStation 4"},r=n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/safari|applewebkit/i],describe:function(e){var t={name:"Safari"},r=n.default.getFirstMatch(s,e);return r&&(t.version=r),t}},{test:[/.*/i],describe:function(e){return {name:n.default.getFirstMatch(/^(.*)\/(.*) /,e),version:n.default.getSecondMatch(/^(.*)\/(.*) /,e)}}}];r.default=a,e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);},89:function(e,t,r){var n,i,s;i=[],void 0===(s="function"==typeof(n=function(){e.exports={BROWSER_ALIASES_MAP:{"Amazon Silk":"amazon_silk","Android Browser":"android",Bada:"bada",BlackBerry:"blackberry",Chrome:"chrome",Chromium:"chromium",Epiphany:"epiphany",Firefox:"firefox",Focus:"focus",Generic:"generic",Googlebot:"googlebot","Internet Explorer":"ie","K-Meleon":"k_meleon",Maxthon:"maxthon","Microsoft Edge":"edge","MZ Browser":"mz","NAVER Whale Browser":"naver",Opera:"opera","Opera Coast":"opera_coast",PhantomJS:"phantomjs",Puffin:"puffin",QupZilla:"qupzilla",Safari:"safari",Sailfish:"sailfish","Samsung Internet for Android":"samsung_internet",SeaMonkey:"seamonkey",Sleipnir:"sleipnir",Swing:"swing",Tizen:"tizen","UC Browser":"uc",Vivaldi:"vivaldi","WebOS Browser":"webos",WeChat:"wechat","Yandex Browser":"yandex"}};})?n.apply(t,i):n)||(e.exports=s);},90:function(e,t,r){var n,i,s;i=[t,r(17)],void 0===(s="function"==typeof(n=function(r,n){var i;Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0,n=(i=n)&&i.__esModule?i:{default:i};var s=[{test:[/windows phone/i],describe:function(e){var t=n.default.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i,e);return {name:"Windows Phone",version:t}}},{test:[/windows/i],describe:function(e){var t=n.default.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i,e),r=n.default.getWindowsVersionName(t);return {name:"Windows",version:t,versionName:r}}},{test:[/macintosh/i],describe:function(e){var t=n.default.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i,e).replace(/[_\s]/g,".");return {name:"macOS",version:t}}},{test:[/(ipod|iphone|ipad)/i],describe:function(e){var t=n.default.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i,e).replace(/[_\s]/g,".");return {name:"iOS",version:t}}},{test:function(e){var t=!e.test(/like android/i),r=e.test(/android/i);return t&&r},describe:function(e){var t=n.default.getFirstMatch(/android[\s\/-](\d+(\.\d+)*)/i,e),r=n.default.getAndroidVersionName(t),i={name:"Android",version:t};return r&&(i.versionName=r),i}},{test:[/(web|hpw)[o0]s/i],describe:function(e){var t=n.default.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i,e),r={name:"WebOS"};return t&&t.length&&(r.version=t),r}},{test:[/blackberry|\bbb\d+/i,/rim\stablet/i],describe:function(e){var t=n.default.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i,e)||n.default.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i,e)||n.default.getFirstMatch(/\bbb(\d+)/i,e);return {name:"BlackBerry",version:t}}},{test:[/bada/i],describe:function(e){var t=n.default.getFirstMatch(/bada\/(\d+(\.\d+)*)/i,e);return {name:"Bada",version:t}}},{test:[/tizen/i],describe:function(e){var t=n.default.getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i,e);return {name:"Tizen",version:t}}},{test:[/linux/i],describe:function(){return {name:"Linux"}}},{test:[/CrOS/],describe:function(){return {name:"Chrome OS"}}},{test:[/PlayStation 4/],describe:function(e){var t=n.default.getFirstMatch(/PlayStation 4[\/\s](\d+(\.\d+)*)/i,e);return {name:"PlayStation 4",version:t}}}];r.default=s,e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);},91:function(e,t,r){var n,i,s;i=[t,r(17)],void 0===(s="function"==typeof(n=function(r,n){var i;Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0,n=(i=n)&&i.__esModule?i:{default:i};var s={tablet:"tablet",mobile:"mobile",desktop:"desktop",tv:"tv"},a=[{test:[/googlebot/i],describe:function(){return {type:"bot",vendor:"Google"}}},{test:[/huawei/i],describe:function(e){var t=n.default.getFirstMatch(/(can-l01)/i,e)&&"Nova",r={type:s.mobile,vendor:"Huawei"};return t&&(r.model=t),r}},{test:[/nexus\s*(?:7|8|9|10).*/i],describe:function(){return {type:s.tablet,vendor:"Nexus"}}},{test:[/ipad/i],describe:function(){return {type:s.tablet,vendor:"Apple",model:"iPad"}}},{test:[/kftt build/i],describe:function(){return {type:s.tablet,vendor:"Amazon",model:"Kindle Fire HD 7"}}},{test:[/silk/i],describe:function(){return {type:s.tablet,vendor:"Amazon"}}},{test:[/tablet/i],describe:function(){return {type:s.tablet}}},{test:function(e){var t=e.test(/ipod|iphone/i),r=e.test(/like (ipod|iphone)/i);return t&&!r},describe:function(e){var t=n.default.getFirstMatch(/(ipod|iphone)/i,e);return {type:s.mobile,vendor:"Apple",model:t}}},{test:[/nexus\s*[0-6].*/i,/galaxy nexus/i],describe:function(){return {type:s.mobile,vendor:"Nexus"}}},{test:[/[^-]mobi/i],describe:function(){return {type:s.mobile}}},{test:function(e){return "blackberry"===e.getBrowserName(!0)},describe:function(){return {type:s.mobile,vendor:"BlackBerry"}}},{test:function(e){return "bada"===e.getBrowserName(!0)},describe:function(){return {type:s.mobile}}},{test:function(e){return "windows phone"===e.getBrowserName()},describe:function(){return {type:s.mobile,vendor:"Microsoft"}}},{test:function(e){var t=Number(String(e.getOSVersion()).split(".")[0]);return "android"===e.getOSName(!0)&&t>=3},describe:function(){return {type:s.tablet}}},{test:function(e){return "android"===e.getOSName(!0)},describe:function(){return {type:s.mobile}}},{test:function(e){return "macos"===e.getOSName(!0)},describe:function(){return {type:s.desktop,vendor:"Apple"}}},{test:function(e){return "windows"===e.getOSName(!0)},describe:function(){return {type:s.desktop}}},{test:function(e){return "linux"===e.getOSName(!0)},describe:function(){return {type:s.desktop}}},{test:function(e){return "playstation 4"===e.getOSName(!0)},describe:function(){return {type:s.tv}}}];r.default=a,e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);},92:function(e,t,r){var n,i,s;i=[t,r(17)],void 0===(s="function"==typeof(n=function(r,n){var i;Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0,n=(i=n)&&i.__esModule?i:{default:i};var s=[{test:function(e){return "microsoft edge"===e.getBrowserName(!0)},describe:function(e){var t=/\sedg\//i.test(e);if(t)return {name:"Blink"};var r=n.default.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i,e);return {name:"EdgeHTML",version:r}}},{test:[/trident/i],describe:function(e){var t={name:"Trident"},r=n.default.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:function(e){return e.test(/presto/i)},describe:function(e){var t={name:"Presto"},r=n.default.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:function(e){var t=e.test(/gecko/i),r=e.test(/like gecko/i);return t&&!r},describe:function(e){var t={name:"Gecko"},r=n.default.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}},{test:[/(apple)?webkit\/537\.36/i],describe:function(){return {name:"Blink"}}},{test:[/(apple)?webkit/i],describe:function(e){var t={name:"WebKit"},r=n.default.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i,e);return r&&(t.version=r),t}}];r.default=s,e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);}})});
	});

	var bowser = unwrapExports(es5);
	var es5_1 = es5.bowser;

	function getUserAgent() {
	  var browser = bowser.getParser(window.navigator.userAgent);
	  var userAgent = browser.parse().parsedResult;
	  updateState({
	    userAgent: userAgent,
	    mobileDevice: userAgent.platform.type !== 'desktop'
	  });
	} // Check if valid browser

	function checkValidBrowser() {
	  var browser = bowser.getParser(window.navigator.userAgent);
	  var validBrowser = browser.satisfies({
	    desktop: {
	      chrome: '>49',
	      firefox: '>52',
	      opera: '>36'
	    }
	  });
	  updateState({
	    validBrowser: validBrowser
	  });
	}

	function checkUserEnvironment() {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee(resolve) {
	      return regenerator.wrap(function _callee$(_context) {
	        while (1) {
	          switch (_context.prev = _context.next) {
	            case 0:
	              checkValidBrowser();
	              checkForWallet();

	              if (state.web3Wallet) {
	                _context.next = 6;
	                break;
	              }

	              storeItem('_assist_newUser', 'true');
	              resolve();
	              return _context.abrupt("return");

	            case 6:
	              if (!state.web3Instance) {
	                configureWeb3();
	              }

	              _context.next = 9;
	              return checkAccountAccess();

	            case 9:
	              _context.next = 11;
	              return checkNetwork().catch(handleWeb3Error);

	            case 11:
	              if (!(state.accessToAccounts && state.correctNetwork)) {
	                _context.next = 14;
	                break;
	              }

	              _context.next = 14;
	              return checkMinimumBalance();

	            case 14:
	              resolve();

	            case 15:
	            case "end":
	              return _context.stop();
	          }
	        }
	      }, _callee);
	    }));

	    return function (_x) {
	      return _ref.apply(this, arguments);
	    };
	  }());
	} // Prepare for transaction

	function prepareForTransaction(categoryCode, originalResolve) {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref2 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee2(resolve, reject) {
	      var previouslyWelcomed;
	      return regenerator.wrap(function _callee2$(_context2) {
	        while (1) {
	          switch (_context2.prev = _context2.next) {
	            case 0:
	              originalResolve = originalResolve || resolve;
	              _context2.next = 3;
	              return checkUserEnvironment();

	            case 3:
	              if (!(state.mobileDevice && state.config.mobileBlocked)) {
	                _context2.next = 6;
	                break;
	              }

	              handleEvent({
	                eventCode: 'mobileBlocked',
	                categoryCode: categoryCode
	              }, {
	                onClose: function onClose() {
	                  return setTimeout(function () {
	                    var errorObj = new Error('User is on mobile device');
	                    errorObj.eventCode = 'mobileBlocked';
	                    reject(errorObj);
	                  }, timeouts.changeUI);
	                }
	              });
	              return _context2.abrupt("return");

	            case 6:
	              if (!(getItem('_assist_newUser') === 'true')) {
	                _context2.next = 31;
	                break;
	              }

	              if (state.validBrowser) {
	                _context2.next = 10;
	                break;
	              }

	              handleEvent({
	                eventCode: 'browserFail',
	                categoryCode: categoryCode
	              }, {
	                onClose: function onClose() {
	                  return setTimeout(function () {
	                    var errorObj = new Error('User has an invalid browser');
	                    errorObj.eventCode = 'browserFail';
	                    reject(errorObj);
	                  }, timeouts.changeUI);
	                }
	              });
	              return _context2.abrupt("return");

	            case 10:
	              previouslyWelcomed = getItem('_assist_welcomed');

	              if (!(previouslyWelcomed !== 'true' && previouslyWelcomed !== 'null')) {
	                _context2.next = 21;
	                break;
	              }

	              _context2.prev = 12;
	              _context2.next = 15;
	              return welcomeUser(categoryCode);

	            case 15:
	              _context2.next = 21;
	              break;

	            case 17:
	              _context2.prev = 17;
	              _context2.t0 = _context2["catch"](12);
	              reject(_context2.t0);
	              return _context2.abrupt("return");

	            case 21:
	              if (state.web3Wallet) {
	                _context2.next = 31;
	                break;
	              }

	              _context2.prev = 22;
	              _context2.next = 25;
	              return getWeb3Wallet(categoryCode);

	            case 25:
	              _context2.next = 31;
	              break;

	            case 27:
	              _context2.prev = 27;
	              _context2.t1 = _context2["catch"](22);
	              reject(_context2.t1);
	              return _context2.abrupt("return");

	            case 31:
	              if (!state.web3Instance) {
	                configureWeb3();
	              }

	              if (!(state.legacyWallet && !state.accessToAccounts)) {
	                _context2.next = 42;
	                break;
	              }

	              _context2.prev = 33;
	              _context2.next = 36;
	              return legacyAccountAccess(categoryCode, originalResolve);

	            case 36:
	              _context2.next = 42;
	              break;

	            case 38:
	              _context2.prev = 38;
	              _context2.t2 = _context2["catch"](33);
	              reject(_context2.t2);
	              return _context2.abrupt("return");

	            case 42:
	              if (!(state.modernWallet && !state.accessToAccounts)) {
	                _context2.next = 52;
	                break;
	              }

	              _context2.prev = 43;
	              _context2.next = 46;
	              return modernAccountAccess(categoryCode, originalResolve);

	            case 46:
	              _context2.next = 52;
	              break;

	            case 48:
	              _context2.prev = 48;
	              _context2.t3 = _context2["catch"](43);
	              reject(_context2.t3);
	              return _context2.abrupt("return");

	            case 52:
	              if (state.correctNetwork) {
	                _context2.next = 62;
	                break;
	              }

	              _context2.prev = 53;
	              _context2.next = 56;
	              return getCorrectNetwork(categoryCode);

	            case 56:
	              _context2.next = 62;
	              break;

	            case 58:
	              _context2.prev = 58;
	              _context2.t4 = _context2["catch"](53);
	              reject(_context2.t4);
	              return _context2.abrupt("return");

	            case 62:
	              _context2.next = 64;
	              return checkMinimumBalance();

	            case 64:
	              if (state.minimumBalance) {
	                _context2.next = 74;
	                break;
	              }

	              _context2.prev = 65;
	              _context2.next = 68;
	              return getMinimumBalance(categoryCode, originalResolve);

	            case 68:
	              _context2.next = 74;
	              break;

	            case 70:
	              _context2.prev = 70;
	              _context2.t5 = _context2["catch"](65);
	              reject(_context2.t5);
	              return _context2.abrupt("return");

	            case 74:
	              if (!(getItem('_assist_newUser') === 'true')) {
	                _context2.next = 78;
	                break;
	              }

	              _context2.next = 77;
	              return newOnboardComplete(categoryCode);

	            case 77:
	              storeItem('_assist_newUser', 'false');

	            case 78:
	              resolve('User is ready to transact');
	              originalResolve && originalResolve('User is ready to transact');

	            case 80:
	            case "end":
	              return _context2.stop();
	          }
	        }
	      }, _callee2, null, [[12, 17], [22, 27], [33, 38], [43, 48], [53, 58], [65, 70]]);
	    }));

	    return function (_x2, _x3) {
	      return _ref2.apply(this, arguments);
	    };
	  }());
	}

	function welcomeUser(categoryCode) {
	  return new Promise(function (resolve, reject) {
	    handleEvent({
	      eventCode: 'welcomeUser',
	      categoryCode: categoryCode
	    }, {
	      onClose: function onClose() {
	        return setTimeout(function () {
	          var errorObj = new Error('User is being welcomed');
	          errorObj.eventCode = 'welcomeUser';
	          reject(errorObj);
	        }, timeouts.changeUI);
	      },
	      onClick: function onClick() {
	        storeItem('_assist_welcomed', 'true');
	        closeModal();
	        setTimeout(resolve, timeouts.changeUI);
	      }
	    });
	  });
	}

	function getWeb3Wallet(categoryCode) {
	  return new Promise(function (resolve, reject) {
	    handleEvent({
	      eventCode: 'walletFail',
	      categoryCode: categoryCode,
	      wallet: {
	        provider: state.currentProvider
	      }
	    }, {
	      onClose: function onClose() {
	        return setTimeout(function () {
	          var errorObj = new Error('User does not have a web3 wallet installed');
	          errorObj.eventCode = 'walletFail';
	          reject(errorObj);
	        }, timeouts.changeUI);
	      },
	      onClick: function onClick() {
	        window.location.reload();
	      }
	    });
	  });
	}

	function checkAccountAccess() {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref3 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee3(resolve) {
	      var accounts, loggedIn;
	      return regenerator.wrap(function _callee3$(_context3) {
	        while (1) {
	          switch (_context3.prev = _context3.next) {
	            case 0:
	              _context3.next = 2;
	              return getAccounts().catch(resolve);

	            case 2:
	              accounts = _context3.sent;

	              if (!(accounts && accounts[0])) {
	                _context3.next = 7;
	                break;
	              }

	              updateState({
	                accessToAccounts: true,
	                accountAddress: accounts[0],
	                walletLoggedIn: true,
	                walletEnabled: true
	              });
	              _context3.next = 16;
	              break;

	            case 7:
	              if (!state.modernWallet) {
	                _context3.next = 13;
	                break;
	              }

	              _context3.next = 10;
	              return checkUnlocked();

	            case 10:
	              _context3.t0 = _context3.sent;
	              _context3.next = 14;
	              break;

	            case 13:
	              _context3.t0 = false;

	            case 14:
	              loggedIn = _context3.t0;
	              updateState({
	                accessToAccounts: false,
	                walletLoggedIn: loggedIn,
	                walletEnabled: state.modernWallet ? false : null,
	                minimumBalance: null
	              });

	            case 16:
	              resolve();

	            case 17:
	            case "end":
	              return _context3.stop();
	          }
	        }
	      }, _callee3);
	    }));

	    return function (_x4) {
	      return _ref3.apply(this, arguments);
	    };
	  }());
	}

	function checkNetwork() {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref4 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee4(resolve) {
	      var networkId;
	      return regenerator.wrap(function _callee4$(_context4) {
	        while (1) {
	          switch (_context4.prev = _context4.next) {
	            case 0:
	              _context4.next = 2;
	              return getNetworkId().catch(handleWeb3Error);

	            case 2:
	              networkId = _context4.sent;
	              updateState({
	                correctNetwork: Number(networkId) === (Number(state.config.networkId) || 1),
	                userCurrentNetworkId: networkId
	              });
	              resolve && resolve();

	            case 5:
	            case "end":
	              return _context4.stop();
	          }
	        }
	      }, _callee4);
	    }));

	    return function (_x5) {
	      return _ref4.apply(this, arguments);
	    };
	  }());
	}

	function checkMinimumBalance() {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref5 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee5(resolve, reject) {
	      var web3Version, version, minimum, account, minimumBalance, accountBalance, sufficientBalance;
	      return regenerator.wrap(function _callee5$(_context5) {
	        while (1) {
	          switch (_context5.prev = _context5.next) {
	            case 0:
	              _context5.next = 2;
	              return checkAccountAccess();

	            case 2:
	              if (!state.accessToAccounts) {
	                resolve();
	              }

	              web3Version = state.web3Version;
	              version = web3Version && web3Version.slice(0, 3);
	              minimum = state.config.minimumBalance || 0;
	              _context5.next = 8;
	              return getAccountBalance().catch(resolve);

	            case 8:
	              account = _context5.sent;
	              _context5.next = 11;
	              return web3Functions.bigNumber(version)(minimum).catch(reject);

	            case 11:
	              minimumBalance = _context5.sent;
	              _context5.next = 14;
	              return web3Functions.bigNumber(version)(account).catch(reject);

	            case 14:
	              accountBalance = _context5.sent;
	              sufficientBalance = accountBalance.gte(minimumBalance);
	              updateState({
	                accountBalance: accountBalance.toString(),
	                minimumBalance: sufficientBalance
	              });
	              resolve();

	            case 18:
	            case "end":
	              return _context5.stop();
	          }
	        }
	      }, _callee5);
	    }));

	    return function (_x6, _x7) {
	      return _ref5.apply(this, arguments);
	    };
	  }());
	}

	function legacyAccountAccess(categoryCode, originalResolve) {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref6 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee8(resolve, reject) {
	      return regenerator.wrap(function _callee8$(_context8) {
	        while (1) {
	          switch (_context8.prev = _context8.next) {
	            case 0:
	              handleEvent({
	                eventCode: 'walletLogin',
	                categoryCode: categoryCode,
	                wallet: {
	                  provider: state.currentProvider
	                }
	              }, {
	                onClose: function onClose() {
	                  return setTimeout(function () {
	                    var errorObj = new Error('User needs to login to their account');
	                    errorObj.eventCode = 'walletLogin';
	                    reject(errorObj);
	                  }, timeouts.changeUI);
	                },
	                onClick: function () {
	                  var _onClick = asyncToGenerator(
	                  /*#__PURE__*/
	                  regenerator.mark(function _callee7() {
	                    return regenerator.wrap(function _callee7$(_context7) {
	                      while (1) {
	                        switch (_context7.prev = _context7.next) {
	                          case 0:
	                            if (state.accessToAccounts) {
	                              closeModal();
	                              setTimeout(
	                              /*#__PURE__*/
	                              asyncToGenerator(
	                              /*#__PURE__*/
	                              regenerator.mark(function _callee6() {
	                                return regenerator.wrap(function _callee6$(_context6) {
	                                  while (1) {
	                                    switch (_context6.prev = _context6.next) {
	                                      case 0:
	                                        _context6.next = 2;
	                                        return prepareForTransaction(categoryCode, originalResolve).catch(reject);

	                                      case 2:
	                                        resolve();

	                                      case 3:
	                                      case "end":
	                                        return _context6.stop();
	                                    }
	                                  }
	                                }, _callee6);
	                              })), timeouts.changeUI);
	                            } else {
	                              addOnboardWarning('loggedIn');
	                            }

	                          case 1:
	                          case "end":
	                            return _context7.stop();
	                        }
	                      }
	                    }, _callee7);
	                  }));

	                  function onClick() {
	                    return _onClick.apply(this, arguments);
	                  }

	                  return onClick;
	                }()
	              });

	            case 1:
	            case "end":
	              return _context8.stop();
	          }
	        }
	      }, _callee8);
	    }));

	    return function (_x8, _x9) {
	      return _ref6.apply(this, arguments);
	    };
	  }());
	}

	function enableWallet(categoryCode, originalResolve) {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref8 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee15(resolve, reject) {
	      return regenerator.wrap(function _callee15$(_context15) {
	        while (1) {
	          switch (_context15.prev = _context15.next) {
	            case 0:
	              _context15.next = 2;
	              return checkAccountAccess();

	            case 2:
	              if (!state.walletEnabled) {
	                _context15.next = 5;
	                break;
	              }

	              resolve();
	              return _context15.abrupt("return");

	            case 5:
	              if (state.accessToAccounts) {
	                if (state.walletEnableCalled) {
	                  // the popup dialog has been called
	                  if (state.walletEnableCanceled) {
	                    // the user has cancelled the dialog, but we have access to accounts
	                    // so we just resolve
	                    resolve();
	                  } else {
	                    // The user must have missed the connect dialog or closed it without confirming or
	                    // cancelling, so we show enable account UI
	                    handleEvent({
	                      eventCode: 'walletEnable',
	                      categoryCode: categoryCode,
	                      wallet: {
	                        provider: state.currentProvider
	                      }
	                    }, {
	                      onClose: function onClose() {
	                        return setTimeout(function () {
	                          var errorObj = new Error('User needs to enable wallet');
	                          errorObj.eventCode = 'walletEnable';
	                          reject(errorObj);
	                        }, timeouts.changeUI);
	                      },
	                      onClick: function () {
	                        var _onClick2 = asyncToGenerator(
	                        /*#__PURE__*/
	                        regenerator.mark(function _callee10() {
	                          return regenerator.wrap(function _callee10$(_context10) {
	                            while (1) {
	                              switch (_context10.prev = _context10.next) {
	                                case 0:
	                                  _context10.next = 2;
	                                  return checkAccountAccess();

	                                case 2:
	                                  if (!(state.accessToAccounts || !state.walletLoggedIn)) {
	                                    _context10.next = 7;
	                                    break;
	                                  }

	                                  closeModal();
	                                  setTimeout(
	                                  /*#__PURE__*/
	                                  asyncToGenerator(
	                                  /*#__PURE__*/
	                                  regenerator.mark(function _callee9() {
	                                    return regenerator.wrap(function _callee9$(_context9) {
	                                      while (1) {
	                                        switch (_context9.prev = _context9.next) {
	                                          case 0:
	                                            _context9.next = 2;
	                                            return prepareForTransaction(categoryCode, originalResolve).catch(reject);

	                                          case 2:
	                                            resolve();

	                                          case 3:
	                                          case "end":
	                                            return _context9.stop();
	                                        }
	                                      }
	                                    }, _callee9);
	                                  })), timeouts.changeUI);
	                                  _context10.next = 10;
	                                  break;

	                                case 7:
	                                  addOnboardWarning('enabled');
	                                  _context10.next = 10;
	                                  return enableWallet(categoryCode, originalResolve).catch(reject);

	                                case 10:
	                                case "end":
	                                  return _context10.stop();
	                              }
	                            }
	                          }, _callee10);
	                        }));

	                        function onClick() {
	                          return _onClick2.apply(this, arguments);
	                        }

	                        return onClick;
	                      }()
	                    });
	                  }
	                } else {
	                  // wallet enable hasn't been called, but we have access to accounts so it doesn't matter
	                  resolve();
	                }
	              } else if (!state.walletEnableCalled || state.walletEnableCalled && state.walletEnableCanceled) {
	                // if enable popup has been called and canceled, or hasn't been called yet then,
	                // show metamask login and connect dialog popup
	                requestLoginEnable().then(function (accounts) {
	                  updateState({
	                    accountAddress: accounts[0],
	                    walletLoggedIn: true,
	                    walletEnabled: true,
	                    accessToAccounts: true
	                  });
	                }).catch(function () {
	                  updateState({
	                    walletEnableCanceled: true,
	                    walletEnabled: false,
	                    accessToAccounts: false
	                  });
	                });
	                updateState({
	                  walletEnableCalled: true,
	                  walletEnableCanceled: false
	                }); // Show UI to inform user to connect

	                handleEvent({
	                  eventCode: 'walletEnable',
	                  categoryCode: categoryCode,
	                  wallet: {
	                    provider: state.currentProvider
	                  }
	                }, {
	                  onClose: function onClose() {
	                    return setTimeout(function () {
	                      var errorObj = new Error('User needs to enable wallet');
	                      errorObj.eventCode = 'walletEnable';
	                      reject(errorObj);
	                    }, timeouts.changeUI);
	                  },
	                  onClick: function () {
	                    var _onClick3 = asyncToGenerator(
	                    /*#__PURE__*/
	                    regenerator.mark(function _callee12() {
	                      return regenerator.wrap(function _callee12$(_context12) {
	                        while (1) {
	                          switch (_context12.prev = _context12.next) {
	                            case 0:
	                              _context12.next = 2;
	                              return checkAccountAccess();

	                            case 2:
	                              if (!(state.accessToAccounts || !state.walletLoggedIn)) {
	                                _context12.next = 7;
	                                break;
	                              }

	                              closeModal();
	                              setTimeout(
	                              /*#__PURE__*/
	                              asyncToGenerator(
	                              /*#__PURE__*/
	                              regenerator.mark(function _callee11() {
	                                return regenerator.wrap(function _callee11$(_context11) {
	                                  while (1) {
	                                    switch (_context11.prev = _context11.next) {
	                                      case 0:
	                                        _context11.next = 2;
	                                        return prepareForTransaction(categoryCode, originalResolve).catch(reject);

	                                      case 2:
	                                        resolve();

	                                      case 3:
	                                      case "end":
	                                        return _context11.stop();
	                                    }
	                                  }
	                                }, _callee11);
	                              })), timeouts.changeUI);
	                              _context12.next = 10;
	                              break;

	                            case 7:
	                              addOnboardWarning('enabled');
	                              _context12.next = 10;
	                              return enableWallet(categoryCode, originalResolve).catch(reject);

	                            case 10:
	                            case "end":
	                              return _context12.stop();
	                          }
	                        }
	                      }, _callee12);
	                    }));

	                    function onClick() {
	                      return _onClick3.apply(this, arguments);
	                    }

	                    return onClick;
	                  }()
	                });
	              } else {
	                // Wallet enable has been called but not canceled, so popup window must have been closed
	                // Call wallet enable again
	                requestLoginEnable().then(function (accounts) {
	                  if (accounts && accounts[0]) {
	                    updateState({
	                      accountAddress: accounts[0],
	                      walletLoggedIn: true,
	                      walletEnabled: true,
	                      accessToAccounts: true
	                    });
	                  }
	                }).catch(function () {
	                  updateState({
	                    walletEnableCanceled: true,
	                    walletEnabled: false,
	                    accessToAccounts: false
	                  });
	                });
	                updateState({
	                  walletEnableCalled: true,
	                  walletEnableCanceled: false
	                }); // Show UI to inform user to connect

	                handleEvent({
	                  eventCode: 'walletEnable',
	                  categoryCode: categoryCode,
	                  wallet: {
	                    provider: state.currentProvider
	                  }
	                }, {
	                  onClose: function onClose() {
	                    return setTimeout(function () {
	                      var errorObj = new Error('User needs to enable wallet');
	                      errorObj.eventCode = 'walletEnable';
	                      reject(errorObj);
	                    }, timeouts.changeUI);
	                  },
	                  onClick: function () {
	                    var _onClick4 = asyncToGenerator(
	                    /*#__PURE__*/
	                    regenerator.mark(function _callee14() {
	                      return regenerator.wrap(function _callee14$(_context14) {
	                        while (1) {
	                          switch (_context14.prev = _context14.next) {
	                            case 0:
	                              _context14.next = 2;
	                              return checkAccountAccess();

	                            case 2:
	                              if (!(state.accessToAccounts || !state.walletLoggedIn)) {
	                                _context14.next = 7;
	                                break;
	                              }

	                              closeModal();
	                              setTimeout(
	                              /*#__PURE__*/
	                              asyncToGenerator(
	                              /*#__PURE__*/
	                              regenerator.mark(function _callee13() {
	                                return regenerator.wrap(function _callee13$(_context13) {
	                                  while (1) {
	                                    switch (_context13.prev = _context13.next) {
	                                      case 0:
	                                        _context13.next = 2;
	                                        return prepareForTransaction(categoryCode, originalResolve).catch(reject);

	                                      case 2:
	                                        resolve();

	                                      case 3:
	                                      case "end":
	                                        return _context13.stop();
	                                    }
	                                  }
	                                }, _callee13);
	                              })), timeouts.changeUI);
	                              _context14.next = 10;
	                              break;

	                            case 7:
	                              addOnboardWarning('enabled');
	                              _context14.next = 10;
	                              return enableWallet(categoryCode, originalResolve).catch(reject);

	                            case 10:
	                            case "end":
	                              return _context14.stop();
	                          }
	                        }
	                      }, _callee14);
	                    }));

	                    function onClick() {
	                      return _onClick4.apply(this, arguments);
	                    }

	                    return onClick;
	                  }()
	                });
	              }

	            case 6:
	            case "end":
	              return _context15.stop();
	          }
	        }
	      }, _callee15);
	    }));

	    return function (_x10, _x11) {
	      return _ref8.apply(this, arguments);
	    };
	  }());
	}

	function unlockWallet(categoryCode, originalResolve) {
	  return new Promise(function (resolve, reject) {
	    requestLoginEnable().then(function (accounts) {
	      updateState({
	        accountAddress: accounts[0],
	        walletLoggedIn: true,
	        walletEnabled: true,
	        accessToAccounts: true
	      });
	    }).catch(function () {
	      updateState({
	        walletEnableCanceled: true,
	        walletEnabled: false,
	        accessToAccounts: false
	      });
	    });
	    updateState({
	      walletEnableCalled: true,
	      walletEnableCanceled: false
	    }); // Show onboard login UI

	    handleEvent({
	      eventCode: 'walletLoginEnable',
	      categoryCode: categoryCode,
	      wallet: {
	        provider: state.currentProvider
	      }
	    }, {
	      onClose: function onClose() {
	        return setTimeout(function () {
	          var errorObj = new Error('User needs to login to wallet');
	          errorObj.eventCode = 'walletLoginEnable';
	          reject(errorObj);
	        }, timeouts.changeUI);
	      },
	      onClick: function () {
	        var _onClick5 = asyncToGenerator(
	        /*#__PURE__*/
	        regenerator.mark(function _callee18() {
	          return regenerator.wrap(function _callee18$(_context18) {
	            while (1) {
	              switch (_context18.prev = _context18.next) {
	                case 0:
	                  _context18.next = 2;
	                  return checkAccountAccess();

	                case 2:
	                  if (!state.walletLoggedIn) {
	                    _context18.next = 7;
	                    break;
	                  }

	                  closeModal();
	                  setTimeout(
	                  /*#__PURE__*/
	                  asyncToGenerator(
	                  /*#__PURE__*/
	                  regenerator.mark(function _callee16() {
	                    return regenerator.wrap(function _callee16$(_context16) {
	                      while (1) {
	                        switch (_context16.prev = _context16.next) {
	                          case 0:
	                            _context16.next = 2;
	                            return prepareForTransaction(categoryCode, originalResolve).catch(reject);

	                          case 2:
	                            resolve();

	                          case 3:
	                          case "end":
	                            return _context16.stop();
	                        }
	                      }
	                    }, _callee16);
	                  })), timeouts.changeUI);
	                  _context18.next = 13;
	                  break;

	                case 7:
	                  addOnboardWarning('loggedIn');
	                  _context18.next = 10;
	                  return unlockWallet(categoryCode, originalResolve).catch(reject);

	                case 10:
	                  updateState({
	                    walletLoggedIn: true
	                  });
	                  closeModal();
	                  setTimeout(
	                  /*#__PURE__*/
	                  asyncToGenerator(
	                  /*#__PURE__*/
	                  regenerator.mark(function _callee17() {
	                    return regenerator.wrap(function _callee17$(_context17) {
	                      while (1) {
	                        switch (_context17.prev = _context17.next) {
	                          case 0:
	                            _context17.next = 2;
	                            return prepareForTransaction(categoryCode, originalResolve).catch(reject);

	                          case 2:
	                            resolve();

	                          case 3:
	                          case "end":
	                            return _context17.stop();
	                        }
	                      }
	                    }, _callee17);
	                  })), timeouts.changeUI);

	                case 13:
	                case "end":
	                  return _context18.stop();
	              }
	            }
	          }, _callee18);
	        }));

	        function onClick() {
	          return _onClick5.apply(this, arguments);
	        }

	        return onClick;
	      }()
	    });
	  });
	}

	function modernAccountAccess(categoryCode, originalResolve) {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref14 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee19(resolve, reject) {
	      return regenerator.wrap(function _callee19$(_context19) {
	        while (1) {
	          switch (_context19.prev = _context19.next) {
	            case 0:
	              if (!state.walletLoggedIn) {
	                _context19.next = 12;
	                break;
	              }

	              _context19.prev = 1;
	              _context19.next = 4;
	              return enableWallet(categoryCode, originalResolve);

	            case 4:
	              resolve();
	              _context19.next = 10;
	              break;

	            case 7:
	              _context19.prev = 7;
	              _context19.t0 = _context19["catch"](1);
	              reject(_context19.t0);

	            case 10:
	              _context19.next = 31;
	              break;

	            case 12:
	              _context19.prev = 12;
	              _context19.next = 15;
	              return unlockWallet(categoryCode, originalResolve);

	            case 15:
	              _context19.next = 21;
	              break;

	            case 17:
	              _context19.prev = 17;
	              _context19.t1 = _context19["catch"](12);
	              reject(_context19.t1);
	              return _context19.abrupt("return");

	            case 21:
	              _context19.prev = 21;
	              _context19.next = 24;
	              return enableWallet(categoryCode, originalResolve);

	            case 24:
	              _context19.next = 30;
	              break;

	            case 26:
	              _context19.prev = 26;
	              _context19.t2 = _context19["catch"](21);
	              reject(_context19.t2);
	              return _context19.abrupt("return");

	            case 30:
	              resolve();

	            case 31:
	            case "end":
	              return _context19.stop();
	          }
	        }
	      }, _callee19, null, [[1, 7], [12, 17], [21, 26]]);
	    }));

	    return function (_x12, _x13) {
	      return _ref14.apply(this, arguments);
	    };
	  }());
	}

	function getCorrectNetwork(categoryCode) {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref15 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee21(resolve, reject) {
	      return regenerator.wrap(function _callee21$(_context21) {
	        while (1) {
	          switch (_context21.prev = _context21.next) {
	            case 0:
	              handleEvent({
	                eventCode: 'networkFail',
	                categoryCode: categoryCode,
	                walletNetworkID: state.userCurrentNetworkId,
	                walletName: state.currentProvider
	              }, {
	                onClose: function onClose() {
	                  return setTimeout(function () {
	                    var errorObj = new Error('User is on the wrong network');
	                    errorObj.eventCode = 'networkFail';
	                    reject(errorObj);
	                  }, timeouts.changeUI);
	                },
	                onClick: function () {
	                  var _onClick6 = asyncToGenerator(
	                  /*#__PURE__*/
	                  regenerator.mark(function _callee20() {
	                    return regenerator.wrap(function _callee20$(_context20) {
	                      while (1) {
	                        switch (_context20.prev = _context20.next) {
	                          case 0:
	                            _context20.next = 2;
	                            return checkNetwork();

	                          case 2:
	                            if (!state.correctNetwork) {
	                              addOnboardWarning('network');
	                            }

	                          case 3:
	                          case "end":
	                            return _context20.stop();
	                        }
	                      }
	                    }, _callee20);
	                  }));

	                  function onClick() {
	                    return _onClick6.apply(this, arguments);
	                  }

	                  return onClick;
	                }()
	              });

	            case 1:
	            case "end":
	              return _context21.stop();
	          }
	        }
	      }, _callee21);
	    }));

	    return function (_x14, _x15) {
	      return _ref15.apply(this, arguments);
	    };
	  }());
	}

	function getMinimumBalance(categoryCode, originalResolve) {
	  return new Promise(function (resolve, reject) {
	    handleEvent({
	      eventCode: 'nsfFail',
	      categoryCode: categoryCode,
	      wallet: {
	        balance: state.accountBalance,
	        minimum: state.minimumBalance,
	        provider: state.currentProvider,
	        address: state.accountAddress
	      }
	    }, {
	      onClose: function onClose() {
	        return setTimeout(function () {
	          var errorObj = new Error('User does not have the minimum balance specified in the config');
	          errorObj.eventCode = 'nsfFail';
	          reject(errorObj);
	        }, timeouts.changeUI);
	      },
	      onClick: function () {
	        var _onClick7 = asyncToGenerator(
	        /*#__PURE__*/
	        regenerator.mark(function _callee23() {
	          return regenerator.wrap(function _callee23$(_context23) {
	            while (1) {
	              switch (_context23.prev = _context23.next) {
	                case 0:
	                  _context23.next = 2;
	                  return checkMinimumBalance();

	                case 2:
	                  if (state.minimumBalance || !state.accessToAccounts) {
	                    closeModal();
	                    setTimeout(
	                    /*#__PURE__*/
	                    asyncToGenerator(
	                    /*#__PURE__*/
	                    regenerator.mark(function _callee22() {
	                      return regenerator.wrap(function _callee22$(_context22) {
	                        while (1) {
	                          switch (_context22.prev = _context22.next) {
	                            case 0:
	                              _context22.next = 2;
	                              return prepareForTransaction(categoryCode, originalResolve).catch(reject);

	                            case 2:
	                              resolve();

	                            case 3:
	                            case "end":
	                              return _context22.stop();
	                          }
	                        }
	                      }, _callee22);
	                    })), timeouts.changeUI);
	                  } else {
	                    addOnboardWarning('minimumBalance');
	                  }

	                case 3:
	                case "end":
	                  return _context23.stop();
	              }
	            }
	          }, _callee23);
	        }));

	        function onClick() {
	          return _onClick7.apply(this, arguments);
	        }

	        return onClick;
	      }()
	    });
	  });
	}

	function newOnboardComplete(categoryCode) {
	  return new Promise(function (resolve) {
	    handleEvent({
	      eventCode: 'newOnboardComplete',
	      categoryCode: categoryCode
	    }, {
	      onClose: resolve,
	      onClick: function onClick() {
	        closeModal();
	        resolve();
	      }
	    });
	  });
	}

	function sendTransaction(categoryCode) {
	  var txOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  var sendTransactionMethod = arguments.length > 2 ? arguments[2] : undefined;
	  var callback = arguments.length > 3 ? arguments[3] : undefined;
	  var inlineCustomMsgs = arguments.length > 4 ? arguments[4] : undefined;
	  var contractMethod = arguments.length > 5 ? arguments[5] : undefined;
	  var contractEventObj = arguments.length > 6 ? arguments[6] : undefined;
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee8(resolve, reject) {
	      var transactionParams, _ref2, _ref3, sufficientBalance, transactionId, transactionEventObj, errorObj, duplicateTransaction, txPromise;

	      return regenerator.wrap(function _callee8$(_context8) {
	        while (1) {
	          switch (_context8.prev = _context8.next) {
	            case 0:
	              _context8.next = 2;
	              return getTransactionParams(txOptions, contractMethod, contractEventObj);

	            case 2:
	              transactionParams = _context8.sent;
	              _context8.next = 5;
	              return Promise.all([hasSufficientBalance(transactionParams), prepareForTransaction('activePreflight').catch(handleError({
	                resolve: resolve,
	                reject: reject,
	                callback: callback
	              }))]);

	            case 5:
	              _ref2 = _context8.sent;
	              _ref3 = slicedToArray(_ref2, 1);
	              sufficientBalance = _ref3[0];

	              // Make sure that we have from address in txOptions
	              if (!txOptions.from) {
	                txOptions.from = state.accountAddress;
	              }

	              transactionId = createTransactionId();
	              transactionEventObj = {
	                id: transactionId,
	                gas: transactionParams.gas.toString(),
	                gasPrice: transactionParams.gasPrice.toString(),
	                value: transactionParams.value.toString(),
	                to: txOptions.to,
	                from: txOptions.from
	              };

	              if (!(sufficientBalance === false)) {
	                _context8.next = 17;
	                break;
	              }

	              handleEvent({
	                eventCode: 'nsfFail',
	                categoryCode: 'activePreflight',
	                transaction: transactionEventObj,
	                contract: contractEventObj,
	                inlineCustomMsgs: inlineCustomMsgs,
	                wallet: {
	                  provider: state.currentProvider,
	                  address: state.accountAddress,
	                  balance: state.accountBalance,
	                  minimum: state.config.minimumBalance
	                }
	              });
	              errorObj = new Error('User has insufficient funds to complete transaction');
	              errorObj.eventCode = 'nsfFail';
	              handleError({
	                resolve: resolve,
	                reject: reject,
	                callback: callback
	              })(errorObj);
	              return _context8.abrupt("return");

	            case 17:
	              duplicateTransaction = isDuplicateTransaction(transactionEventObj, contractEventObj);

	              if (duplicateTransaction) {
	                handleEvent({
	                  eventCode: 'txRepeat',
	                  categoryCode: 'activePreflight',
	                  transaction: transactionEventObj,
	                  contract: contractEventObj,
	                  inlineCustomMsgs: inlineCustomMsgs,
	                  wallet: {
	                    provider: state.currentProvider,
	                    address: state.accountAddress,
	                    balance: state.accountBalance,
	                    minimum: state.config.minimumBalance
	                  }
	                });
	              }

	              if (getTransactionsAwaitingApproval().length > 0) {
	                handleEvent({
	                  eventCode: 'txAwaitingApproval',
	                  categoryCode: 'activePreflight',
	                  transaction: transactionEventObj,
	                  contract: contractEventObj,
	                  inlineCustomMsgs: inlineCustomMsgs,
	                  wallet: {
	                    provider: state.currentProvider,
	                    address: state.accountAddress,
	                    balance: state.accountBalance,
	                    minimum: state.config.minimumBalance
	                  }
	                });
	              }

	              if (state.legacyWeb3 || state.config.truffleContract) {
	                if (contractEventObj) {
	                  txPromise = sendTransactionMethod.apply(void 0, toConsumableArray(contractEventObj.parameters).concat([txOptions]));
	                } else {
	                  txPromise = sendTransactionMethod(txOptions);
	                }
	              } else {
	                txPromise = sendTransactionMethod(txOptions);
	              }

	              handleEvent({
	                eventCode: 'txRequest',
	                categoryCode: categoryCode,
	                transaction: transactionEventObj,
	                contract: contractEventObj,
	                inlineCustomMsgs: inlineCustomMsgs,
	                wallet: {
	                  provider: state.currentProvider,
	                  address: state.accountAddress,
	                  balance: state.accountBalance,
	                  minimum: state.config.minimumBalance
	                }
	              });
	              addTransactionToQueue({
	                transaction: Object.assign({}, transactionEventObj, {
	                  status: 'awaitingApproval'
	                }),
	                contract: contractEventObj,
	                inlineCustomMsgs: inlineCustomMsgs
	              }); // Check if user has confirmed transaction after 20 seconds

	              setTimeout(
	              /*#__PURE__*/
	              asyncToGenerator(
	              /*#__PURE__*/
	              regenerator.mark(function _callee() {
	                return regenerator.wrap(function _callee$(_context) {
	                  while (1) {
	                    switch (_context.prev = _context.next) {
	                      case 0:
	                        if (isTransactionAwaitingApproval(transactionId)) {
	                          handleEvent({
	                            eventCode: 'txConfirmReminder',
	                            categoryCode: categoryCode,
	                            transaction: transactionEventObj,
	                            contract: contractEventObj,
	                            inlineCustomMsgs: inlineCustomMsgs,
	                            wallet: {
	                              provider: state.currentProvider,
	                              address: state.accountAddress,
	                              balance: state.accountBalance,
	                              minimum: state.config.minimumBalance
	                            }
	                          });
	                        }

	                      case 1:
	                      case "end":
	                        return _context.stop();
	                    }
	                  }
	                }, _callee);
	              })), timeouts.txConfirmReminder);

	              if (state.legacyWeb3) {
	                txPromise.then(function (hash) {
	                  onTxHash(transactionId, hash, categoryCode);
	                  resolve(hash);
	                  callback && callback(null, hash);
	                  return waitForTransactionReceipt(hash).then(function () {
	                    onTxReceipt(transactionId, categoryCode);
	                  });
	                }).catch(
	                /*#__PURE__*/
	                function () {
	                  var _ref5 = asyncToGenerator(
	                  /*#__PURE__*/
	                  regenerator.mark(function _callee2(errorObj) {
	                    return regenerator.wrap(function _callee2$(_context2) {
	                      while (1) {
	                        switch (_context2.prev = _context2.next) {
	                          case 0:
	                            onTxError(transactionId, errorObj, categoryCode);
	                            handleError({
	                              resolve: resolve,
	                              reject: reject,
	                              callback: callback
	                            })(errorObj);

	                          case 2:
	                          case "end":
	                            return _context2.stop();
	                        }
	                      }
	                    }, _callee2);
	                  }));

	                  return function (_x3) {
	                    return _ref5.apply(this, arguments);
	                  };
	                }());
	              } else if (state.config.truffleContract) {
	                txPromise.then(
	                /*#__PURE__*/
	                function () {
	                  var _ref6 = asyncToGenerator(
	                  /*#__PURE__*/
	                  regenerator.mark(function _callee3(hash) {
	                    var receipt;
	                    return regenerator.wrap(function _callee3$(_context3) {
	                      while (1) {
	                        switch (_context3.prev = _context3.next) {
	                          case 0:
	                            onTxHash(transactionId, hash, categoryCode);
	                            _context3.next = 3;
	                            return waitForTransactionReceipt(hash);

	                          case 3:
	                            receipt = _context3.sent;
	                            onTxReceipt(transactionId, categoryCode);
	                            resolve({
	                              receipt: receipt
	                            });
	                            callback && callback(null, receipt);

	                          case 7:
	                          case "end":
	                            return _context3.stop();
	                        }
	                      }
	                    }, _callee3);
	                  }));

	                  return function (_x4) {
	                    return _ref6.apply(this, arguments);
	                  };
	                }()).catch(
	                /*#__PURE__*/
	                function () {
	                  var _ref7 = asyncToGenerator(
	                  /*#__PURE__*/
	                  regenerator.mark(function _callee4(errorObj) {
	                    return regenerator.wrap(function _callee4$(_context4) {
	                      while (1) {
	                        switch (_context4.prev = _context4.next) {
	                          case 0:
	                            onTxError(transactionId, errorObj, categoryCode);
	                            handleError({
	                              resolve: resolve,
	                              reject: reject,
	                              callback: callback
	                            })(errorObj);

	                          case 2:
	                          case "end":
	                            return _context4.stop();
	                        }
	                      }
	                    }, _callee4);
	                  }));

	                  return function (_x5) {
	                    return _ref7.apply(this, arguments);
	                  };
	                }());
	              } else {
	                txPromise.on('transactionHash',
	                /*#__PURE__*/
	                function () {
	                  var _ref8 = asyncToGenerator(
	                  /*#__PURE__*/
	                  regenerator.mark(function _callee5(hash) {
	                    return regenerator.wrap(function _callee5$(_context5) {
	                      while (1) {
	                        switch (_context5.prev = _context5.next) {
	                          case 0:
	                            onTxHash(transactionId, hash, categoryCode);
	                            resolve(hash);
	                            callback && callback(null, hash);

	                          case 3:
	                          case "end":
	                            return _context5.stop();
	                        }
	                      }
	                    }, _callee5);
	                  }));

	                  return function (_x6) {
	                    return _ref8.apply(this, arguments);
	                  };
	                }()).on('receipt',
	                /*#__PURE__*/
	                asyncToGenerator(
	                /*#__PURE__*/
	                regenerator.mark(function _callee6() {
	                  return regenerator.wrap(function _callee6$(_context6) {
	                    while (1) {
	                      switch (_context6.prev = _context6.next) {
	                        case 0:
	                          onTxReceipt(transactionId, categoryCode);

	                        case 1:
	                        case "end":
	                          return _context6.stop();
	                      }
	                    }
	                  }, _callee6);
	                }))).on('error',
	                /*#__PURE__*/
	                function () {
	                  var _ref10 = asyncToGenerator(
	                  /*#__PURE__*/
	                  regenerator.mark(function _callee7(errorObj) {
	                    return regenerator.wrap(function _callee7$(_context7) {
	                      while (1) {
	                        switch (_context7.prev = _context7.next) {
	                          case 0:
	                            onTxError(transactionId, errorObj, categoryCode);
	                            handleError({
	                              resolve: resolve,
	                              reject: reject,
	                              callback: callback
	                            })(errorObj);

	                          case 2:
	                          case "end":
	                            return _context7.stop();
	                        }
	                      }
	                    }, _callee7);
	                  }));

	                  return function (_x7) {
	                    return _ref10.apply(this, arguments);
	                  };
	                }());
	              }

	            case 25:
	            case "end":
	              return _context8.stop();
	          }
	        }
	      }, _callee8);
	    }));

	    return function (_x, _x2) {
	      return _ref.apply(this, arguments);
	    };
	  }());
	}

	function onTxHash(id, hash, categoryCode) {
	  var txObj = updateTransactionInQueue(id, {
	    status: 'approved',
	    hash: hash,
	    startTime: Date.now()
	  });
	  handleEvent({
	    eventCode: 'txSent',
	    categoryCode: categoryCode,
	    transaction: txObj.transaction,
	    contract: txObj.contract,
	    inlineCustomMsgs: txObj.inlineCustomMsgs,
	    wallet: {
	      provider: state.currentProvider,
	      address: state.accountAddress,
	      balance: state.accountBalance,
	      minimum: state.config.minimumBalance
	    }
	  }); // Check if transaction is in txPool after timeout

	  setTimeout(function () {
	    var txObj = getTxObjFromQueue(id);

	    if (txObj && txObj.transaction.status !== 'pending' && state.socketConnection) {
	      updateTransactionInQueue(id, {
	        status: 'stalled'
	      });
	      handleEvent({
	        eventCode: 'txStall',
	        categoryCode: categoryCode,
	        transaction: txObj.transaction,
	        contract: txObj.contract,
	        inlineCustomMsgs: txObj.inlineCustomMsgs,
	        wallet: {
	          provider: state.currentProvider,
	          address: state.accountAddress,
	          balance: state.accountBalance,
	          minimum: state.config.minimumBalance
	        }
	      });
	    }
	  }, timeouts.txStall);
	}

	function onTxReceipt(_x8, _x9) {
	  return _onTxReceipt.apply(this, arguments);
	}

	function _onTxReceipt() {
	  _onTxReceipt = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee9(id, categoryCode) {
	    var txObj;
	    return regenerator.wrap(function _callee9$(_context9) {
	      while (1) {
	        switch (_context9.prev = _context9.next) {
	          case 0:
	            txObj = getTxObjFromQueue(id);

	            if (txObj.transaction.status === 'confirmed') {
	              txObj = updateTransactionInQueue(id, {
	                status: 'completed'
	              });
	            } else {
	              txObj = updateTransactionInQueue(id, {
	                status: 'confirmed'
	              });
	            }

	            handleEvent({
	              eventCode: 'txConfirmedClient',
	              categoryCode: categoryCode,
	              transaction: txObj.transaction,
	              contract: txObj.contract,
	              inlineCustomMsgs: txObj.inlineCustomMsgs,
	              wallet: {
	                provider: state.currentProvider,
	                address: state.accountAddress,
	                balance: state.accountBalance,
	                minimum: state.config.minimumBalance
	              }
	            });

	            if (txObj.transaction.status === 'completed') {
	              removeTransactionFromQueue(id);
	            }

	          case 4:
	          case "end":
	            return _context9.stop();
	        }
	      }
	    }, _callee9);
	  }));
	  return _onTxReceipt.apply(this, arguments);
	}

	function onTxError(id, error, categoryCode) {
	  var message = error.message;
	  var errorMsg;

	  try {
	    errorMsg = extractMessageFromError(message);
	  } catch (error) {
	    errorMsg = 'User denied transaction signature';
	  }

	  var txObj = updateTransactionInQueue(id, {
	    status: 'rejected'
	  });
	  handleEvent({
	    eventCode: errorMsg === 'transaction underpriced' ? 'txUnderpriced' : 'txSendFail',
	    categoryCode: categoryCode,
	    transaction: txObj.transaction,
	    contract: txObj.contract,
	    inlineCustomMsgs: txObj.inlineCustomMsgs,
	    reason: errorMsg,
	    wallet: {
	      provider: state.currentProvider,
	      address: state.accountAddress,
	      balance: state.accountBalance,
	      minimum: state.config.minimumBalance
	    }
	  });
	  removeTransactionFromQueue(id);
	}

	function modernCall(method, name, args) {
	  var innerMethod = method.apply(void 0, toConsumableArray(args)).call;
	  var returnObject = {};

	  returnObject.call = function () {
	    for (var _len = arguments.length, innerArgs = new Array(_len), _key = 0; _key < _len; _key++) {
	      innerArgs[_key] = arguments[_key];
	    }

	    return new Promise(
	    /*#__PURE__*/
	    function () {
	      var _ref = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee(resolve, reject) {
	        var _separateArgs, callback, txObject, result;

	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _separateArgs = separateArgs(innerArgs, 0), callback = _separateArgs.callback, txObject = _separateArgs.txObject;

	                if (state.mobileDevice && state.config.mobileBlocked) {
	                  handleEvent({
	                    eventCode: 'mobileBlocked',
	                    categoryCode: 'activePreflight'
	                  }, {
	                    onClose: function onClose() {
	                      var errorObj = new Error('User is on a mobile device');
	                      errorObj.eventCode = 'mobileBlocked';
	                      handleError({
	                        resolve: resolve,
	                        reject: reject,
	                        callback: callback
	                      })(errorObj);
	                    }
	                  });
	                }

	                _context.next = 4;
	                return innerMethod(txObject).catch(function (errorObj) {
	                  handleEvent({
	                    eventCode: 'contractQueryFail',
	                    categoryCode: 'activeContract',
	                    contract: {
	                      methodName: name,
	                      parameters: args
	                    },
	                    reason: errorObj.message || errorObj
	                  });
	                  handleError({
	                    resolve: resolve,
	                    reject: reject,
	                    callback: callback
	                  })(errorObj);
	                });

	              case 4:
	                result = _context.sent;

	                if (result) {
	                  handleEvent({
	                    eventCode: 'contractQuery',
	                    categoryCode: 'activeContract',
	                    contract: {
	                      methodName: name,
	                      parameters: args,
	                      result: JSON.stringify(result)
	                    }
	                  });
	                  callback && callback(null, result);
	                  resolve(result);
	                }

	              case 6:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));

	      return function (_x, _x2) {
	        return _ref.apply(this, arguments);
	      };
	    }());
	  };

	  return returnObject;
	}
	function modernSend(method, name, args) {
	  var innerMethod = method.apply(void 0, toConsumableArray(args)).send;
	  var returnObject = {};

	  returnObject.send = function () {
	    for (var _len2 = arguments.length, innerArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      innerArgs[_key2] = arguments[_key2];
	    }

	    var _separateArgs2 = separateArgs(innerArgs, 0),
	        callback = _separateArgs2.callback,
	        txObject = _separateArgs2.txObject,
	        inlineCustomMsgs = _separateArgs2.inlineCustomMsgs;

	    return sendTransaction('activeContract', txObject, innerMethod, callback, inlineCustomMsgs, method, {
	      methodName: name,
	      parameters: args
	    });
	  };

	  return returnObject;
	}
	function legacyCall(method, name, allArgs, argsLength) {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref2 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee2(resolve, reject) {
	      var _separateArgs3, callback, args, txObject, defaultBlock, result;

	      return regenerator.wrap(function _callee2$(_context2) {
	        while (1) {
	          switch (_context2.prev = _context2.next) {
	            case 0:
	              _separateArgs3 = separateArgs(allArgs, argsLength), callback = _separateArgs3.callback, args = _separateArgs3.args, txObject = _separateArgs3.txObject, defaultBlock = _separateArgs3.defaultBlock;

	              if (!(state.mobileDevice && state.config.mobileBlocked)) {
	                _context2.next = 4;
	                break;
	              }

	              handleEvent({
	                eventCode: 'mobileBlocked',
	                categoryCode: 'activePreflight'
	              }, {
	                onClose: function onClose() {
	                  var errorObj = new Error('User is on a mobile device');
	                  errorObj.eventCode = 'mobileBlocked';
	                  handleError({
	                    resolve: resolve,
	                    reject: reject,
	                    callback: callback
	                  })(errorObj);
	                }
	              });
	              return _context2.abrupt("return", resolve());

	            case 4:
	              // Only promisify method if it isn't a truffle contract
	              method = state.config.truffleContract ? method : bluebird_1(method);
	              _context2.next = 7;
	              return method.apply(void 0, toConsumableArray(args).concat([txObject, defaultBlock])).catch(function (errorObj) {
	                handleEvent({
	                  eventCode: 'contractQueryFail',
	                  categoryCode: 'activeContract',
	                  contract: {
	                    methodName: name,
	                    parameters: args
	                  },
	                  reason: errorObj.message || errorObj
	                });
	                handleError({
	                  resolve: resolve,
	                  reject: reject,
	                  callback: callback
	                })(errorObj);
	              });

	            case 7:
	              result = _context2.sent;
	              handleEvent({
	                eventCode: 'contractQuery',
	                categoryCode: 'activeContract',
	                contract: {
	                  methodName: name,
	                  parameters: args,
	                  result: JSON.stringify(result)
	                }
	              });
	              callback && callback(null, result);
	              return _context2.abrupt("return", resolve(result));

	            case 11:
	            case "end":
	              return _context2.stop();
	          }
	        }
	      }, _callee2);
	    }));

	    return function (_x3, _x4) {
	      return _ref2.apply(this, arguments);
	    };
	  }());
	}
	function legacySend(_x5, _x6, _x7, _x8) {
	  return _legacySend.apply(this, arguments);
	}

	function _legacySend() {
	  _legacySend = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee3(method, name, allArgs, argsLength) {
	    var _separateArgs4, callback, txObject, args, inlineCustomMsgs, sendMethod;

	    return regenerator.wrap(function _callee3$(_context3) {
	      while (1) {
	        switch (_context3.prev = _context3.next) {
	          case 0:
	            _separateArgs4 = separateArgs(allArgs, argsLength), callback = _separateArgs4.callback, txObject = _separateArgs4.txObject, args = _separateArgs4.args, inlineCustomMsgs = _separateArgs4.inlineCustomMsgs;
	            sendMethod = state.config.truffleContract ? method.sendTransaction : bluebird_1(method);
	            return _context3.abrupt("return", sendTransaction('activeContract', txObject, sendMethod, callback, inlineCustomMsgs, method, {
	              methodName: name,
	              parameters: args
	            }));

	          case 3:
	          case "end":
	            return _context3.stop();
	        }
	      }
	    }, _callee3);
	  }));
	  return _legacySend.apply(this, arguments);
	}

	var version = "0.6.2";

	function init(config) {
	  updateState({
	    version: version
	  });
	  openWebsocketConnection(); // Make sure we have a config object

	  if (!config || _typeof_1(config) !== 'object') {
	    var reason = 'A config object is needed to initialize assist';
	    handleEvent({
	      eventCode: 'initFail',
	      categoryCode: 'initialize',
	      reason: reason
	    });
	    var errorObj = new Error(reason);
	    errorObj.eventCode = 'initFail';
	    throw errorObj;
	  } else {
	    updateState({
	      config: config
	    });
	  }

	  var web3 = config.web3,
	      dappId = config.dappId,
	      mobileBlocked = config.mobileBlocked,
	      headlessMode = config.headlessMode,
	      style = config.style; // Check that an api key has been provided to the config object

	  if (!dappId) {
	    handleEvent({
	      eventCode: 'initFail',
	      categoryCode: 'initialize',
	      reason: 'No API key provided to init function'
	    });
	    updateState({
	      validApiKey: false
	    });

	    var _errorObj = new Error('API key is required');

	    _errorObj.eventCode = 'initFail';
	    throw _errorObj;
	  }

	  if (web3) {
	    configureWeb3(web3);
	  } // Get browser info


	  getUserAgent(); // Commit a cardinal sin and create an iframe (to isolate the CSS)

	  if (!state.iframe && !headlessMode) {
	    createIframe(document, assistStyles, style);
	  } // Check if on mobile and mobile is blocked


	  if (state.mobileDevice && mobileBlocked) {
	    handleEvent({
	      eventCode: 'mobileBlocked',
	      categoryCode: 'initialize'
	    });
	    updateState({
	      validBrowser: false
	    });
	  } // Get transactionQueue from storage if it exists


	  getTransactionQueueFromStorage(); // Add unload event listener

	  window.addEventListener('unload', storeTransactionQueue); // Public API to expose

	  var intializedAssist = {
	    onboard: onboard,
	    Contract: Contract,
	    Transaction: Transaction,
	    getState: getState
	  };
	  getState().then(function (state$$1) {
	    handleEvent({
	      eventCode: 'initState',
	      categoryCode: 'initialize',
	      state: {
	        accessToAccounts: state$$1.accessToAccounts,
	        correctNetwork: state$$1.correctNetwork,
	        legacyWallet: state$$1.legacyWallet,
	        legacyWeb3: state$$1.legacyWeb3,
	        minimumBalance: state$$1.minimumBalance,
	        mobileDevice: state$$1.mobileDevice,
	        modernWallet: state$$1.modernWallet,
	        modernWeb3: state$$1.modernWeb3,
	        walletEnabled: state$$1.walletEnabled,
	        walletLoggedIn: state$$1.walletLoggedIn,
	        web3Wallet: state$$1.web3Wallet,
	        validBrowser: state$$1.validBrowser
	      }
	    });
	  });
	  var onboardingInProgress = getItem('onboarding') === 'true';

	  if (onboardingInProgress) {
	    onboard().catch(function () {});
	  } // return the API


	  return intializedAssist; // ========== API FUNCTIONS ========== //
	  // ONBOARD FUNCTION //

	  function onboard() {
	    if (state.config.headlessMode) {
	      return new Promise(
	      /*#__PURE__*/
	      function () {
	        var _ref = asyncToGenerator(
	        /*#__PURE__*/
	        regenerator.mark(function _callee(resolve, reject) {
	          var error, _error, _error2, _error3, _error4, _error5, _error6, _error7;

	          return regenerator.wrap(function _callee$(_context) {
	            while (1) {
	              switch (_context.prev = _context.next) {
	                case 0:
	                  _context.next = 2;
	                  return checkUserEnvironment().catch(reject);

	                case 2:
	                  if (state.mobileDevice) {
	                    error = new Error('User is on a mobile device');
	                    error.eventCode = 'mobileBlocked';
	                    reject(error);
	                  }

	                  if (!state.validBrowser) {
	                    _error = new Error('User has an invalid browser');
	                    _error.eventCode = 'browserFail';
	                    reject(_error);
	                  }

	                  if (!state.web3Wallet) {
	                    _error2 = new Error('User does not have a web3 wallet installed');
	                    _error2.eventCode = 'walletFail';
	                    reject(_error2);
	                  }

	                  if (!state.accessToAccounts) {
	                    if (state.legacyWallet) {
	                      _error3 = new Error('User needs to login to their account');
	                      _error3.eventCode = 'walletLogin';
	                      reject(_error3);
	                    }

	                    if (state.modernWallet) {
	                      if (!state.walletLoggedIn) {
	                        _error4 = new Error('User needs to login to wallet');
	                        _error4.eventCode = 'walletLoginEnable';
	                        reject(_error4);
	                      }

	                      if (!state.walletEnabled) {
	                        _error5 = new Error('User needs to enable wallet');
	                        _error5.eventCode = 'walletEnable';
	                        reject(_error5);
	                      }
	                    }
	                  }

	                  if (!state.correctNetwork) {
	                    _error6 = new Error('User is on the wrong network');
	                    _error6.eventCode = 'networkFail';
	                    reject(_error6);
	                  }

	                  if (!state.minimumBalance) {
	                    _error7 = new Error('User does not have the minimum balance specified in the config');
	                    _error7.eventCode = 'nsfFail';
	                    reject(_error7);
	                  }

	                  resolve('User is ready to transact');

	                case 9:
	                case "end":
	                  return _context.stop();
	              }
	            }
	          }, _callee);
	        }));

	        return function (_x, _x2) {
	          return _ref.apply(this, arguments);
	        };
	      }());
	    }

	    if (!state.validApiKey) {
	      var _errorObj2 = new Error('Your api key is not valid');

	      _errorObj2.eventCode = 'initFail';
	      return Promise.reject(_errorObj2);
	    }

	    if (!state.supportedNetwork) {
	      var _errorObj3 = new Error('This network is not supported');

	      _errorObj3.eventCode = 'initFail';
	      return Promise.reject(_errorObj3);
	    } // If user is on mobile, warn that it isn't supported


	    if (state.mobileDevice) {
	      return new Promise(function (resolve, reject) {
	        handleEvent({
	          eventCode: 'mobileBlocked',
	          categoryCode: 'onboard'
	        }, {
	          onClose: function onClose() {
	            var errorObj = new Error('User is on a mobile device');
	            errorObj.eventCode = 'mobileBlocked';
	            reject(errorObj);
	          }
	        });
	        updateState({
	          validBrowser: false
	        });
	      });
	    }

	    return new Promise(
	    /*#__PURE__*/
	    function () {
	      var _ref2 = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee2(resolve, reject) {
	        var ready;
	        return regenerator.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                storeItem('onboarding', 'true');
	                _context2.next = 3;
	                return prepareForTransaction('onboard').catch(function (error) {
	                  removeItem('onboarding');
	                  reject(error);
	                });

	              case 3:
	                ready = _context2.sent;
	                removeItem('onboarding');
	                resolve(ready);

	              case 6:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2);
	      }));

	      return function (_x3, _x4) {
	        return _ref2.apply(this, arguments);
	      };
	    }());
	  } // CONTRACT FUNCTION //


	  function Contract(contractObj) {
	    if (!state.validApiKey) {
	      var _errorObj4 = new Error('Your API key is not valid');

	      _errorObj4.eventCode = 'initFail';
	      throw _errorObj4;
	    }

	    if (!state.supportedNetwork) {
	      var _errorObj5 = new Error('This network is not supported');

	      _errorObj5.eventCode = 'initFail';
	      throw _errorObj5;
	    } // if user is on mobile, and mobile is allowed by Dapp then just pass the contract back


	    if (state.mobileDevice && !config.mobileBlocked) {
	      return contractObj;
	    } // Check if we have an instance of web3


	    if (!state.web3Instance) {
	      if (window.web3) {
	        configureWeb3();
	      } else {
	        var _errorObj6 = new Error('A web3 instance is needed to decorate contract');

	        _errorObj6.eventCode = 'initFail';
	        throw _errorObj6;
	      }
	    }

	    var legacyWeb3 = state.legacyWeb3;
	    var abi = contractObj.abi || contractObj._jsonInterface || Object.keys(contractObj.abiModel.abi.methods).map(function (key) {
	      return contractObj.abiModel.abi.methods[key].abiItem;
	    });
	    var contractClone = Object.create(Object.getPrototypeOf(contractObj));
	    var contractKeys = Object.keys(contractObj);
	    var seenMethods = [];
	    var delegatedContractObj = contractKeys.reduce(function (newContractObj, key) {
	      if (legacyWeb3 || state.config.truffleContract) {
	        // if we have seen this key, then we have already dealt with it
	        if (seenMethods.includes(key)) {
	          return newContractObj;
	        }

	        seenMethods.push(key);
	        var methodAbiArray = abi.filter(function (method) {
	          return method.name === key;
	        }); // if the key doesn't point to a method or is an event, just copy it over

	        if (!methodAbiArray[0] || methodAbiArray[0].type === 'event') {
	          newContractObj[key] = contractObj[key];
	          return newContractObj;
	        }

	        var overloadedMethodKeys = methodAbiArray.length > 1 && methodAbiArray.map(function (abi) {
	          return getOverloadedMethodKeys(abi.inputs);
	        });
	        var _methodAbiArray$ = methodAbiArray[0],
	            name$$1 = _methodAbiArray$.name,
	            inputs = _methodAbiArray$.inputs,
	            constant = _methodAbiArray$.constant;
	        var method = contractObj[name$$1];
	        var argsLength = inputs.length;

	        newContractObj[name$$1] = function () {
	          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	          }

	          return constant ? legacyCall(method, name$$1, args, argsLength) : legacySend(method, name$$1, args, argsLength);
	        };

	        newContractObj[name$$1].call = function () {
	          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	            args[_key2] = arguments[_key2];
	          }

	          return legacyCall(method, name$$1, args, argsLength);
	        };

	        newContractObj[name$$1].sendTransaction = function () {
	          for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	            args[_key3] = arguments[_key3];
	          }

	          return legacySend(method, name$$1, args, argsLength);
	        };

	        newContractObj[name$$1].getData = contractObj[name$$1].getData;

	        if (overloadedMethodKeys) {
	          overloadedMethodKeys.forEach(function (key) {
	            var method = contractObj[name$$1][key];

	            if (!method) {
	              // no method, then overloaded methods not supported on this object
	              return;
	            }

	            newContractObj[name$$1][key] = function () {
	              for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
	                args[_key4] = arguments[_key4];
	              }

	              return constant ? legacyCall(method, name$$1, args, argsLength) : legacySend(method, name$$1, args, argsLength);
	            };

	            newContractObj[name$$1][key].call = function () {
	              for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
	                args[_key5] = arguments[_key5];
	              }

	              return legacyCall(method, name$$1, args, argsLength);
	            };

	            newContractObj[name$$1][key].sendTransaction = function () {
	              for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
	                args[_key6] = arguments[_key6];
	              }

	              return legacySend(method, name$$1, args, argsLength);
	            };

	            newContractObj[name$$1][key].getData = contractObj[name$$1][key].getData;
	          });
	        }
	      } else {
	        if (key !== 'methods') {
	          var _methodAbiArray = abi.filter(function (method) {
	            return method.name === key;
	          }); // if the key doesn't point to a method or is an event, just copy it over
	          // this check is now needed to allow for truffle contract 1.0


	          if (!_methodAbiArray[0] || _methodAbiArray[0].type === 'event') {
	            newContractObj[key] = contractObj[key];
	            return newContractObj;
	          }
	        }

	        var methodsKeys = Object.keys(contractObj[key]);
	        newContractObj.methods = abi.reduce(function (obj, methodAbi) {
	          var name$$1 = methodAbi.name,
	              type = methodAbi.type,
	              constant = methodAbi.constant; // if not function, do nothing with it

	          if (type !== 'function') {
	            return obj;
	          } // if we have seen this key, then we have already dealt with it


	          if (seenMethods.includes(name$$1)) {
	            return obj;
	          }

	          seenMethods.push(name$$1);
	          var method = contractObj.methods[name$$1];
	          var overloadedMethodKeys = methodsKeys.filter(function (methodKey) {
	            return methodKey.split('(')[0] === name$$1 && methodKey !== name$$1;
	          });

	          obj[name$$1] = function () {
	            for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
	              args[_key7] = arguments[_key7];
	            }

	            return constant ? modernCall(method, name$$1, args) : modernSend(method, name$$1, args);
	          };

	          if (overloadedMethodKeys.length > 0) {
	            overloadedMethodKeys.forEach(function (key) {
	              var method = contractObj.methods[key];

	              obj[key] = function () {
	                for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
	                  args[_key8] = arguments[_key8];
	                }

	                return constant ? modernCall(method, name$$1, args) : modernSend(method, name$$1, args);
	              };
	            });
	          }

	          return obj;
	        }, {});
	      }

	      return newContractObj;
	    }, contractClone);
	    return delegatedContractObj;
	  } // TRANSACTION FUNCTION //


	  function Transaction(txObject, callback, inlineCustomMsgs) {
	    if (!state.validApiKey) {
	      var _errorObj7 = new Error('Your api key is not valid');

	      _errorObj7.eventCode = 'initFail';
	      throw _errorObj7;
	    }

	    if (!state.supportedNetwork) {
	      var _errorObj8 = new Error('This network is not supported');

	      _errorObj8.eventCode = 'initFail';
	      throw _errorObj8;
	    } // Check if we have an instance of web3


	    if (!state.web3Instance) {
	      configureWeb3();
	    } // if user is on mobile, and mobile is allowed by Dapp just put the transaction through


	    if (state.mobileDevice && !state.config.mobileBlocked) {
	      return state.web3Instance.eth.sendTransaction(txObject, callback);
	    }

	    var sendMethod = state.legacyWeb3 ? bluebird_1(state.web3Instance.eth.sendTransaction) : state.web3Instance.eth.sendTransaction;
	    return sendTransaction('activeTransaction', txObject, sendMethod, callback, inlineCustomMsgs);
	  }
	} // GETSTATE FUNCTION //


	function getState() {
	  return new Promise(
	  /*#__PURE__*/
	  function () {
	    var _ref3 = asyncToGenerator(
	    /*#__PURE__*/
	    regenerator.mark(function _callee3(resolve) {
	      var mobileDevice, validBrowser, currentProvider, web3Wallet, accessToAccounts, walletLoggedIn, walletEnabled, accountAddress, accountBalance, minimumBalance, userCurrentNetworkId, correctNetwork;
	      return regenerator.wrap(function _callee3$(_context3) {
	        while (1) {
	          switch (_context3.prev = _context3.next) {
	            case 0:
	              _context3.next = 2;
	              return checkUserEnvironment();

	            case 2:
	              mobileDevice = state.mobileDevice, validBrowser = state.validBrowser, currentProvider = state.currentProvider, web3Wallet = state.web3Wallet, accessToAccounts = state.accessToAccounts, walletLoggedIn = state.walletLoggedIn, walletEnabled = state.walletEnabled, accountAddress = state.accountAddress, accountBalance = state.accountBalance, minimumBalance = state.minimumBalance, userCurrentNetworkId = state.userCurrentNetworkId, correctNetwork = state.correctNetwork;
	              resolve({
	                mobileDevice: mobileDevice,
	                validBrowser: validBrowser,
	                currentProvider: currentProvider,
	                web3Wallet: web3Wallet,
	                accessToAccounts: accessToAccounts,
	                walletLoggedIn: walletLoggedIn,
	                walletEnabled: walletEnabled,
	                accountAddress: accountAddress,
	                accountBalance: accountBalance,
	                minimumBalance: minimumBalance,
	                userCurrentNetworkId: userCurrentNetworkId,
	                correctNetwork: correctNetwork
	              });

	            case 4:
	            case "end":
	              return _context3.stop();
	          }
	        }
	      }, _callee3);
	    }));

	    return function (_x5) {
	      return _ref3.apply(this, arguments);
	    };
	  }());
	}

	var index = {
	  init: init
	};

	return index;

})));
