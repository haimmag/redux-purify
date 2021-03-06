

const actionReducerPair = (actionType, input, namespace) => {
  const base = {
    actionCreator: (...args) => ({
      type: namespace + actionType,
      payload: args.length > 1 ? args : args[0],
      __args: args,
    })
  };


  if (typeof input === 'function') {
    return {
      ...base,
      reducer: input,
    };
  }

  if (typeof input !== 'object') {
    throw new Error('redux-purify does not undertand your intentions');
  }

  return {
    ...base,
    ...input,
  };
};




export default (pairs, initialState, namespace = '') => {

  if (typeof pairs !== 'object') {
    throw new Error('redux-purify only accepts objects as argument');
  }

  const { actions, reducers, constants } = Object.keys(pairs).reduce((acc, actionType) => {
    const input = pairs[actionType];
    const actionName = actionType.replace(/([A-Z])/g, '_$1').toUpperCase();
    const item = actionReducerPair(actionType, input, namespace);

    const actions = {
      ...acc.actions,
      [actionType]: (...args) => ({
        type: namespace + actionName,
        ...item.actionCreator(...args),
      }),
    };

    const reducers = {
      ...acc.reducers,
      [namespace + actionName]: item.reducer,
    };

    const constants = {
      ...acc.constants,
      [actionType]: namespace + actionName,
    };

    return {
      actions,
      reducers,
      constants,
    };
  }, { actions: {}, reducers: {}, constants: {} });

  return {
    actions,
    constants,

    reducer(state, action = {}) {
      const reducer = reducers[action.type];
      const extraArgs = action.__args || [];

      if (reducer) {
        return reducer(state, action, ...extraArgs);
      }

      if (typeof state === 'undefined') {
        return initialState;
      }

      return state;
    },
  }
};
