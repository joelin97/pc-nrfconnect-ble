/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

 'use strict';

import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

import createLogger from 'redux-logger';
import DevTools from '../containers/DevTools';
import Immutable from 'immutable';

import rootReducer from '../reducers';

export default function configureStore(initialState) {
    const middleware = [
        thunkMiddleware,
    ];

    const isProduction = process.env.NODE_ENV === 'production';

    let finalCreateStore;

    if (isProduction) {
        finalCreateStore = applyMiddleware(...middleware)(createStore);
    } else {
        const logger = createLogger({
            collapsed: true,
            transformer: state => {
                var newState = {};

                for (var i of Object.keys(state)) {
                    if (Immutable.Iterable.isIterable(state[i])) {
                        newState[i] = state[i].toJS();
                    } else {
                        newState[i] = state[i];
                    }
                }

                return newState;
            },
        });

        // Logger must be the last middleware in chain.
        middleware.push(logger);

        finalCreateStore = compose(
            applyMiddleware(...middleware),
            DevTools.instrument()
        )(createStore);
    }

    const store = finalCreateStore(rootReducer, initialState);

    // Check if we can hot reload, if so we hot replace reducers
    if (module.hot) {
        module.hot.accept('../reducers', () =>
          store.replaceReducer(require('../reducers'))
        );
    }

    return store;
}